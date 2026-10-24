"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  DEFAULT_QUESTIONS,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type ChatMessage,
  type Evaluation,
  type InterviewResponse,
  type QuestionReview,
} from "@/lib/interview";

const MAX_JD_LENGTH = 5000;
const MAX_ANSWER_LENGTH = 3000;

const TIPS = [
  "貼上完整的職缺描述，包含職責與條件，題目會更貼近真實面試。",
  "回答時盡量具體：情境、你做了什麼、帶來什麼結果。",
  "被追問不代表答錯，是面試官想聽更多細節。",
];

function InterviewerAvatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-serif text-sm font-black text-paper">
      面
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score || 0));
  return (
    <div className="relative grid h-36 w-36 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--line)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--coral)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <div className="text-center">
        <p className="font-serif text-4xl font-black">{clamped}</p>
        <p className="font-mono text-xs text-muted">/ 100</p>
      </div>
    </div>
  );
}

function ReviewCard({ index, review }: { index: number; review: QuestionReview }) {
  return (
    <div className="animate-rise flex flex-col gap-3 rounded-2xl border border-line bg-card p-5 text-sm sm:ml-10">
      <p className="font-mono text-[11px] tracking-widest text-coral uppercase">第 {index + 1} 題點評</p>
      <p className="leading-relaxed text-ink-2">{review.feedback}</p>
      <div className="rounded-xl border-l-4 border-moss bg-moss-soft p-4 leading-relaxed whitespace-pre-wrap">
        <p className="mb-1.5 font-mono text-[11px] tracking-widest text-moss uppercase">參考解答</p>
        {review.modelAnswer}
      </div>
    </div>
  );
}

export function InterviewApp() {
  const [jobDescription, setJobDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  // reviews[i] 是第 i+1 題的點評與參考解答
  const [reviews, setReviews] = useState<QuestionReview[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const started = history.length > 0;

  useEffect(() => {
    if (started) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [started, history, reviews, evaluation, loading]);

  // 回傳是否成功，讓呼叫端在失敗時可以還原狀態
  async function callInterview(nextHistory: ChatMessage[]): Promise<boolean> {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, totalQuestions, history: nextHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");

      const result = data as InterviewResponse;
      const review = result.review;
      if (review) setReviews((prev) => [...prev, review]);
      if (result.type === "question") {
        setQuestionNumber(result.questionNumber);
        setHistory([...nextHistory, { role: "interviewer", content: result.content }]);
      } else {
        setHistory(nextHistory);
        setEvaluation(result.evaluation);
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function handleStart(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    callInterview([]);
  }

  async function submitAnswer() {
    if (!answer.trim() || loading) return;
    const previousHistory = history;
    const previousAnswer = answer;
    const nextHistory: ChatMessage[] = [...history, { role: "candidate", content: answer.trim() }];
    setHistory(nextHistory);
    setAnswer("");
    // 失敗時把回答放回輸入框，讓使用者可以直接重送
    if (!(await callInterview(nextHistory))) {
      setHistory(previousHistory);
      setAnswer(previousAnswer);
    }
  }

  function handleAnswer(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    submitAnswer();
  }

  // Ctrl / ⌘ + Enter 送出回答
  function handleAnswerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submitAnswer();
    }
  }

  function handleRestart() {
    setHistory([]);
    setEvaluation(null);
    setReviews([]);
    setQuestionNumber(0);
    setAnswer("");
    setError("");
  }

  const errorBanner = error && (
    <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft px-4 py-3 text-sm text-coral">
      {error}
    </p>
  );

  if (!started) {
    return (
      <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:py-16">
        <form
          onSubmit={handleStart}
          className="flex flex-col gap-7 rounded-3xl border border-line bg-card p-6 shadow-[0_20px_50px_-30px_rgb(22_21_27/0.3)] sm:p-9"
        >
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs tracking-widest text-coral uppercase">Step 1 · 設定</span>
            <h1 className="font-serif text-3xl font-black sm:text-4xl">設定你的模擬面試</h1>
            <p className="text-ink-2">貼上想應徵的職缺，選好題數，面試官就會開始提問。</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label htmlFor="jd" className="font-bold">
                職缺描述
              </label>
              <span className="font-mono text-xs text-muted">
                {jobDescription.length} / {MAX_JD_LENGTH}
              </span>
            </div>
            <textarea
              id="jd"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              maxLength={MAX_JD_LENGTH}
              placeholder={"例如：\n前端工程師\n・熟悉 React / Next.js 與 TypeScript\n・具備 2 年以上 Web 開發經驗\n・重視效能優化與使用者體驗"}
              className="resize-y rounded-2xl border border-line bg-paper p-4 leading-relaxed outline-none transition-colors placeholder:text-muted focus:border-ink"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-bold">題數</span>
              <span className="text-sm text-muted">
                {MIN_QUESTIONS}–{MAX_QUESTIONS} 題
              </span>
            </div>
            <div className="flex items-center rounded-full border border-line bg-paper p-1">
              <button
                type="button"
                aria-label="減少題數"
                onClick={() => setTotalQuestions((n) => Math.max(MIN_QUESTIONS, n - 1))}
                disabled={totalQuestions <= MIN_QUESTIONS}
                className="grid h-9 w-9 place-items-center rounded-full text-lg transition-colors hover:bg-paper-2 disabled:opacity-30"
              >
                −
              </button>
              <span className="w-12 text-center font-serif text-xl font-black" aria-live="polite">
                {totalQuestions}
              </span>
              <button
                type="button"
                aria-label="增加題數"
                onClick={() => setTotalQuestions((n) => Math.min(MAX_QUESTIONS, n + 1))}
                disabled={totalQuestions >= MAX_QUESTIONS}
                className="grid h-9 w-9 place-items-center rounded-full text-lg transition-colors hover:bg-paper-2 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {errorBanner}

          <button
            type="submit"
            disabled={loading || !jobDescription.trim()}
            className="rounded-full bg-coral px-6 py-4 font-medium text-white shadow-[0_10px_30px_-10px_var(--coral)] transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? "面試官準備中…" : "開始面試"}
          </button>
        </form>

        <aside className="flex flex-col gap-6 lg:pt-4">
          <h2 className="font-mono text-xs tracking-widest text-muted uppercase">面試小提醒</h2>
          <ol className="flex flex-col gap-5">
            {TIPS.map((tip, i) => (
              <li key={tip} className="flex gap-4">
                <span className="font-serif text-2xl font-black text-coral">0{i + 1}</span>
                <p className="leading-relaxed text-ink-2">{tip}</p>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl bg-ink p-5 text-sm leading-relaxed text-paper/80">
            每答完一題，你會立刻看到<span className="text-paper">點評</span>與
            <span className="text-paper">參考解答</span>；全部答完後，還有整體評分與改進建議。
          </div>
        </aside>
      </main>
    );
  }

  const answeredCount = reviews.length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      {/* 進度列 */}
      <div className="sticky top-16 z-30 -mx-4 flex flex-col gap-3 border-b border-line bg-paper/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold">{evaluation ? "面試完成" : `第 ${questionNumber} / ${totalQuestions} 題`}</span>
          <details className="group relative">
            <summary className="cursor-pointer list-none text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
              查看職缺描述 <span className="inline-block transition-transform group-open:rotate-180">▾</span>
            </summary>
            <p className="absolute right-0 z-10 mt-2 max-h-72 w-[min(22rem,80vw)] overflow-auto rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-2 shadow-xl">
              {jobDescription}
            </p>
          </details>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < answeredCount ? "bg-ink" : i === answeredCount && !evaluation ? "bg-coral" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 對話 */}
      <div className="flex flex-col gap-4">
        {history.map((m, i) => {
          // 候選人的第幾則回答（0 起算），用來對應該題的點評
          const answerIndex =
            m.role === "candidate"
              ? history.slice(0, i + 1).filter((h) => h.role === "candidate").length - 1
              : -1;
          const review = answerIndex >= 0 ? reviews[answerIndex] : undefined;
          return (
            <Fragment key={i}>
              {m.role === "interviewer" ? (
                <div className="animate-rise flex gap-2.5">
                  <InterviewerAvatar />
                  <p className="max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-card px-4 py-3 leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              ) : (
                <p className="animate-rise ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 leading-relaxed whitespace-pre-wrap text-paper">
                  {m.content}
                </p>
              )}
              {review && <ReviewCard index={answerIndex} review={review} />}
            </Fragment>
          );
        })}
        {loading && (
          <div className="flex gap-2.5" aria-live="polite">
            <InterviewerAvatar />
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-line bg-card px-4 py-3.5">
              <span className="sr-only">面試官思考中</span>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-2"
                  style={{ animationDelay: `${dot * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {errorBanner}

      {evaluation ? (
        <section className="animate-rise flex flex-col gap-8 rounded-3xl border border-line bg-card p-6 shadow-[0_20px_50px_-30px_rgb(22_21_27/0.3)] sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ScoreRing score={evaluation.score} />
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <span className="font-mono text-xs tracking-widest text-coral uppercase">面試結果</span>
              <h2 className="font-serif text-2xl font-black">整體評分</h2>
              <p className="leading-relaxed text-ink-2">{evaluation.summary}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-moss-soft p-5">
              <h3 className="mb-3 font-bold text-moss">優點</h3>
              <ul className="flex flex-col gap-2 text-sm leading-relaxed">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-moss">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-coral-soft p-5">
              <h3 className="mb-3 font-bold text-coral">改進建議</h3>
              <ul className="flex flex-col gap-2 text-sm leading-relaxed">
                {evaluation.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-coral">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="self-center rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-coral sm:self-start"
          >
            再練一場
          </button>
        </section>
      ) : (
        <form
          onSubmit={handleAnswer}
          className="sticky bottom-4 flex flex-col gap-3 rounded-3xl border border-line bg-card p-3 shadow-[0_20px_50px_-20px_rgb(22_21_27/0.35)]"
        >
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleAnswerKeyDown}
            rows={3}
            maxLength={MAX_ANSWER_LENGTH}
            placeholder="輸入你的回答…"
            disabled={loading}
            aria-label="你的回答"
            className="resize-none bg-transparent px-3 pt-2 leading-relaxed outline-none placeholder:text-muted disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-3 pl-3">
            <span className="font-mono text-xs text-muted">Ctrl / ⌘ + Enter 送出</span>
            <button
              type="submit"
              disabled={loading || !answer.trim()}
              className="rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
            >
              送出回答
            </button>
          </div>
        </form>
      )}

      <div ref={bottomRef} />
    </main>
  );
}
