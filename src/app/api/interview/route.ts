// 匯入 OpenAI 官方 SDK，用來呼叫 Chat Completions API
import OpenAI from "openai";
// 從共用模組匯入常數與型別（前後端共用，確保資料格式一致）
import {
  // 題數上限
  MAX_QUESTIONS,
  // 題數下限
  MIN_QUESTIONS,
  // 單則對話訊息的型別（面試官 / 候選人）
  type ChatMessage,
  // 最終評分結果的型別
  type Evaluation,
  // 前端送來的請求內容型別
  type InterviewRequest,
  // API 回傳給前端的回應型別
  type InterviewResponse,
  // 單題點評與參考解答的型別
  type QuestionReview,
// 匯入來源：src/lib/interview.ts
} from "@/lib/interview";

// 使用的 OpenAI 模型；可用環境變數 OPENAI_MODEL 覆寫，否則預設 gpt-4o-mini
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
// 職缺描述的最大字數，避免過長內容浪費 token
const MAX_JD_LENGTH = 5000;
// 每則對話訊息的最大字數
const MAX_ANSWER_LENGTH = 3000;

// 單題點評的撰寫要求（出下一題與最終評分時共用）
const REVIEW_INSTRUCTIONS = `請先針對候選人「剛剛回答的那一題」給出點評與參考解答。
參考解答要示範「比較好的回答方式」：結構清楚（例如 STAR 法則）、具體、貼合職缺需求，可直接作為候選人練習的範本。`;

// 產生系統提示詞（system prompt），設定面試官的角色與出題規則
function systemPrompt(jobDescription: string, totalQuestions: number) {
  // 回傳一段多行字串，內嵌職缺描述與總題數
  return `你是一位專業、友善但嚴謹的面試官，正在用繁體中文進行模擬面試。
以下是職缺描述：
"""
${jobDescription}
"""
面試共 ${totalQuestions} 題。請根據職缺描述與候選人先前的回答出題：
- 若上一題回答不夠具體，可以針對它追問；否則換一個新的面向出題。
- 每次只問一個問題，簡潔明確，題目本身不要附帶解答或評語。`;
// systemPrompt 函式結束
}

// 把前端的對話紀錄轉成 OpenAI 需要的 messages 格式
function toOpenAIMessages(history: ChatMessage[]) {
  // 逐筆轉換每一則訊息
  return history.map((m) => ({
    // 面試官（AI）對應 assistant，候選人（使用者）對應 user
    role: m.role === "interviewer" ? ("assistant" as const) : ("user" as const),
    // 訊息內容原樣保留
    content: m.content,
  // map 結束
  }));
// toOpenAIMessages 函式結束
}

// 驗證請求內容是否合法；回傳 true 時 TypeScript 會把 body 視為 InterviewRequest
function isValidRequest(body: unknown): body is InterviewRequest {
  // body 必須是非 null 的物件，否則直接判定不合法
  if (typeof body !== "object" || body === null) return false;
  // 取出需要檢查的三個欄位
  const { jobDescription, totalQuestions, history } = body as Record<string, unknown>;
  // 所有條件都成立才算合法
  return (
    // 職缺描述必須是字串
    typeof jobDescription === "string" &&
    // 職缺描述去掉空白後不能是空的
    jobDescription.trim().length > 0 &&
    // 職缺描述不能超過字數上限
    jobDescription.length <= MAX_JD_LENGTH &&
    // 題數必須是整數
    Number.isInteger(totalQuestions) &&
    // 題數不能小於下限
    (totalQuestions as number) >= MIN_QUESTIONS &&
    // 題數不能大於上限
    (totalQuestions as number) <= MAX_QUESTIONS &&
    // 對話紀錄必須是陣列
    Array.isArray(history) &&
    // 對話紀錄中的每一筆都要通過檢查
    history.every(
      (m) =>
        // 角色只能是面試官或候選人
        (m?.role === "interviewer" || m?.role === "candidate") &&
        // 內容必須是字串
        typeof m.content === "string" &&
        // 內容不能超過字數上限
        m.content.length <= MAX_ANSWER_LENGTH,
    // every 結束
    )
  // return 條件式結束
  );
// isValidRequest 函式結束
}

// 處理 POST /api/interview 請求：出下一題（並點評上一題），或在答完所有題目後給出評分
export async function POST(request: Request) {
  // 若沒有設定 OpenAI 金鑰，直接回傳 500 錯誤
  if (!process.env.OPENAI_API_KEY) {
    // 回傳錯誤訊息與 HTTP 狀態碼 500
    return Response.json({ error: "伺服器未設定 OPENAI_API_KEY" }, { status: 500 });
  // if 結束
  }

  // 解析請求的 JSON；若格式壞掉則得到 null
  const body = await request.json().catch(() => null);
  // 驗證請求內容
  if (!isValidRequest(body)) {
    // 不合法就回傳 400 錯誤
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  // if 結束
  }

  // 取出職缺描述、總題數與對話紀錄
  const { jobDescription, totalQuestions, history } = body;
  // 計算候選人已經回答了幾題（= 候選人訊息的數量）
  const answered = history.filter((m) => m.role === "candidate").length;
  // 建立 OpenAI 客戶端（會自動讀取環境變數 OPENAI_API_KEY）
  const client = new OpenAI();
  // 每次呼叫模型都會用到的前置訊息：系統提示詞 + 目前為止的對話紀錄
  const baseMessages = [
    // 系統提示詞，設定面試官角色與規則
    { role: "system" as const, content: systemPrompt(jobDescription, totalQuestions) },
    // 目前為止的面試對話紀錄
    ...toOpenAIMessages(history),
  // baseMessages 結束
  ];

  // 用 try 包住 OpenAI 呼叫，以便統一處理錯誤
  try {
    // 情況一：面試剛開始（還沒有任何回答）→ 只出第一題
    if (answered === 0) {
      // 呼叫 OpenAI 產生第一題
      const completion = await client.chat.completions.create({
        // 指定使用的模型
        model: MODEL,
        // 前置訊息後面加上「請出第 1 題」的指令
        messages: [
          // 系統提示詞（此時還沒有對話紀錄）
          ...baseMessages,
          // 提示模型現在要出第 1 題
          { role: "system", content: `請提出第 1 題（共 ${totalQuestions} 題）。` },
        // messages 陣列結束
        ],
      // API 呼叫結束
      });
      // 組成回傳給前端的「題目」回應
      const result: InterviewResponse = {
        // 回應類型：題目
        type: "question",
        // 這是第 1 題
        questionNumber: 1,
        // 取出模型回覆的題目文字並去掉前後空白；若沒有內容則用空字串
        content: completion.choices[0]?.message.content?.trim() ?? "",
      // 回應物件結束
      };
      // 以 JSON 回傳題目
      return Response.json(result);
    // if 結束
    }

    // 情況二：還有題目沒問完 → 點評剛答完的題目，並出下一題
    if (answered < totalQuestions) {
      // 呼叫 OpenAI，一次取得上一題的點評、參考解答與下一題
      const completion = await client.chat.completions.create({
        // 指定使用的模型
        model: MODEL,
        // 要求模型一定要輸出合法的 JSON 物件
        response_format: { type: "json_object" },
        // 前置訊息後面加上點評與出題的指令
        messages: [
          // 系統提示詞 + 對話紀錄
          ...baseMessages,
          // 要求點評上一題並出下一題的指令
          {
            // 以 system 角色下指令
            role: "system",
            // 說明點評要求、下一題題號，以及 JSON 輸出格式
            content: `${REVIEW_INSTRUCTIONS}
接著提出第 ${answered + 1} 題（共 ${totalQuestions} 題）。
只回傳 JSON，格式如下：
{"feedback": "針對剛剛回答的點評", "modelAnswer": "剛剛那題的參考解答", "nextQuestion": "下一題題目"}`,
          // 指令訊息結束
          },
        // messages 陣列結束
        ],
      // API 呼叫結束
      });
      // 把模型回傳的 JSON 字串解析成物件；若沒有內容則解析空物件
      const data = JSON.parse(completion.choices[0]?.message.content ?? "{}") as QuestionReview & {
        // 額外的欄位：下一題題目
        nextQuestion: string;
      // 型別定義結束
      };
      // 組成回傳給前端的「題目 + 上一題點評」回應
      const result: InterviewResponse = {
        // 回應類型：題目
        type: "question",
        // 下一題的題號
        questionNumber: answered + 1,
        // 下一題的題目內容
        content: data.nextQuestion?.trim() ?? "",
        // 上一題的點評與參考解答
        review: { feedback: data.feedback, modelAnswer: data.modelAnswer },
      // 回應物件結束
      };
      // 以 JSON 回傳
      return Response.json(result);
    // if 結束
    }

    // 情況三：所有題目都答完 → 點評最後一題，並給出整體評分與建議
    const completion = await client.chat.completions.create({
      // 指定使用的模型
      model: MODEL,
      // 要求模型一定要輸出合法的 JSON 物件
      response_format: { type: "json_object" },
      // 前置訊息後面加上評分的指令
      messages: [
        // 系統提示詞 + 完整對話紀錄
        ...baseMessages,
        // 要求點評最後一題並給整體評分的指令
        {
          // 以 system 角色下指令
          role: "system",
          // 說明點評要求、整體評分內容，以及 JSON 輸出格式
          content: `面試結束。${REVIEW_INSTRUCTIONS}
然後針對候選人整體表現評分，並給出優點與具體改進建議。
只回傳 JSON，格式如下：
{"feedback": "針對最後一題回答的點評", "modelAnswer": "最後一題的參考解答",
 "score": 0-100 的整數, "summary": "整體評語", "strengths": ["優點"...], "improvements": ["具體改進建議"...]}`,
        // 指令訊息結束
        },
      // messages 陣列結束
      ],
    // API 呼叫結束
    });
    // 把模型回傳的 JSON 字串解析成物件；若沒有內容則解析空物件
    const data = JSON.parse(
      // 取出模型回覆的文字
      completion.choices[0]?.message.content ?? "{}",
    // 轉型成「單題點評 + 整體評分」的合併型別
    ) as QuestionReview & Evaluation;
    // 組成回傳給前端的「評分」回應
    const result: InterviewResponse = {
      // 回應類型：評分
      type: "evaluation",
      // 最後一題的點評與參考解答
      review: { feedback: data.feedback, modelAnswer: data.modelAnswer },
      // 整體評分結果
      evaluation: {
        // 分數
        score: data.score,
        // 整體評語
        summary: data.summary,
        // 優點清單
        strengths: data.strengths ?? [],
        // 改進建議清單
        improvements: data.improvements ?? [],
      // evaluation 物件結束
      },
    // 回應物件結束
    };
    // 以 JSON 回傳評分結果
    return Response.json(result);
  // 捕捉呼叫 OpenAI 或解析 JSON 時發生的錯誤
  } catch (error) {
    // 在伺服器終端機印出錯誤，方便除錯
    console.error("OpenAI request failed:", error);
    // 回傳 502 錯誤給前端，不暴露內部細節
    return Response.json({ error: "AI 服務暫時無法使用，請稍後再試" }, { status: 502 });
  // try/catch 結束
  }
// POST 函式結束
}
