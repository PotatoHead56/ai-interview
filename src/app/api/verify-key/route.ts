// 匯入 OpenAI 官方 SDK，用來向 OpenAI 確認金鑰是否有效
import OpenAI from "openai";
// 從共用模組匯入 header 名稱與金鑰格式規則（前後端共用）
import { API_KEY_HEADER, API_KEY_PATTERN } from "@/lib/interview";

// 處理 POST /api/verify-key 請求：在使用者儲存金鑰前，確認這把金鑰能不能用
export async function POST(request: Request) {
  // 從請求 header 取出使用者輸入的 OpenAI API Key
  const apiKey = request.headers.get(API_KEY_HEADER)?.trim() ?? "";
  // 格式不對就不用問 OpenAI 了，直接回傳 400
  if (!API_KEY_PATTERN.test(apiKey)) {
    // 回傳格式錯誤的說明
    return Response.json({ error: "格式不正確，OpenAI API Key 通常以 sk- 開頭。" }, { status: 400 });
  // if 結束
  }

  // 用使用者的金鑰建立 OpenAI 客戶端；金鑰只在這次請求中使用，不會被保存
  const client = new OpenAI({ apiKey });

  // 用 try 包住 OpenAI 呼叫，以便分辨不同的錯誤
  try {
    // 列出可用模型：不會產生 token 費用，最適合用來驗證金鑰
    await client.models.list();
    // 呼叫成功代表金鑰有效
    return Response.json({ valid: true });
  // 捕捉 OpenAI 回傳的錯誤
  } catch (error) {
    // 401：金鑰錯誤、已被刪除或已撤銷
    if (error instanceof OpenAI.AuthenticationError) {
      // 回傳 401 與說明
      return Response.json(
        // 錯誤訊息
        { error: "OpenAI 拒絕了這把金鑰：可能打錯字、已被刪除或已撤銷，請確認後再試。" },
        // HTTP 狀態碼 401
        { status: 401 },
      // Response.json 結束
      );
    // if 結束
    }
    // 403：金鑰有效，只是權限受限、不能列出模型；不影響面試功能，視為有效
    if (error instanceof OpenAI.PermissionDeniedError) {
      // 回傳驗證成功
      return Response.json({ valid: true });
    // if 結束
    }
    // 只印出錯誤名稱與狀態碼，避免把錯誤訊息中的金鑰片段寫進伺服器紀錄
    console.error("API key verification failed:", error instanceof OpenAI.APIError ? `${error.name} ${error.status}` : error);
    // 其他錯誤（網路問題、OpenAI 服務異常）回傳 502，請使用者稍後再試
    return Response.json({ error: "目前無法連線到 OpenAI 驗證金鑰，請稍後再試。" }, { status: 502 });
  // try/catch 結束
  }
// POST 函式結束
}
