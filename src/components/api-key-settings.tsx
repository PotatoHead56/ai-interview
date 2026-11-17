"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearApiKey,
  isLikelyOpenAIKey,
  maskApiKey,
  onOpenApiKeySettings,
  saveApiKey,
  useApiKey,
  verifyApiKey,
} from "@/lib/api-key";

function KeyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="7" cy="10" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.25 10H17m-2 0v2.5M13 10v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Header 上的設定按鈕與 API Key 設定視窗（全站只渲染一次）
export function ApiKeySettings() {
  const apiKey = useApiKey();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  // 從其他頁面打開視窗時帶來的原因，例如「金鑰無效」
  const [reason, setReason] = useState("");
  const [verifying, setVerifying] = useState(false);

  function open(openReason?: string) {
    setDraft("");
    setVisible(false);
    setError("");
    setReason(openReason ?? "");
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }

  // 讓其他頁面（例如面試頁）也能打開這個視窗
  useEffect(() => onOpenApiKeySettings(open), []);

  function close() {
    dialogRef.current?.close();
  }

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const key = draft.trim();
    if (!isLikelyOpenAIKey(key)) {
      setError("格式看起來不正確，OpenAI API Key 通常以 sk- 開頭。");
      return;
    }
    // 先向 OpenAI 確認金鑰有效才儲存
    setVerifying(true);
    setError("");
    const verifyError = await verifyApiKey(key);
    setVerifying(false);
    if (verifyError) {
      setError(verifyError);
      return;
    }
    saveApiKey(key);
    setReason("");
    close();
  }

  function handleClear() {
    clearApiKey();
    setDraft("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => open()}
        className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-sm text-ink-2 transition-colors hover:border-ink hover:text-ink"
        aria-label={apiKey ? "API Key 已設定，開啟設定" : "尚未設定 API Key，開啟設定"}
      >
        <span className={`h-2 w-2 rounded-full ${apiKey ? "bg-moss" : "bg-coral"}`} />
        <KeyIcon />
        <span className="hidden sm:inline">API Key</span>
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          // 點擊視窗外的背景關閉
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs tracking-widest text-coral uppercase">Settings</span>
              <h2 className="font-serif text-2xl font-black">OpenAI API Key</h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="關閉"
              className="grid h-8 w-8 place-items-center rounded-full text-ink-2 transition-colors hover:bg-paper-2"
            >
              ✕
            </button>
          </div>

          {reason && (
            <p
              role="alert"
              className="rounded-2xl border border-coral/30 bg-coral-soft px-4 py-3 text-sm leading-relaxed font-medium text-coral"
            >
              {reason}
            </p>
          )}

          <p className="text-sm leading-relaxed text-ink-2">
            本服務採用 BYOK（自備金鑰）模式：使用你自己的 OpenAI API Key 呼叫 AI，費用由 OpenAI 依用量直接向你計費。可到{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline decoration-coral underline-offset-4"
            >
              OpenAI 後台
            </a>{" "}
            建立金鑰。
          </p>

          <div
            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm ${
              apiKey && !reason ? "bg-moss-soft" : "bg-coral-soft"
            }`}
          >
            {apiKey ? (
              <>
                <span className="flex flex-col gap-0.5">
                  {/* 帶著原因打開視窗時，代表目前的金鑰已被 OpenAI 拒絕 */}
                  <span className={`font-bold ${reason ? "text-coral" : "text-moss"}`}>
                    {reason ? "目前的金鑰無法使用" : "已設定"}
                  </span>
                  <span className="font-mono text-xs text-ink-2">{maskApiKey(apiKey)}</span>
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full border border-moss/30 px-3 py-1.5 text-xs font-medium text-moss transition-colors hover:bg-white"
                >
                  清除金鑰
                </button>
              </>
            ) : (
              <span className="font-bold text-coral">尚未設定 API Key</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="api-key" className="font-bold">
              {apiKey ? "更換金鑰" : "輸入金鑰"}
            </label>
            <div className="flex items-center rounded-2xl border border-line bg-paper pr-2 transition-colors focus-within:border-ink">
              <input
                ref={inputRef}
                id="api-key"
                type={visible ? "text" : "password"}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError("");
                }}
                disabled={verifying}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs text-ink-2 transition-colors hover:bg-paper-2"
              >
                {visible ? "隱藏" : "顯示"}
              </button>
            </div>
            {error && (
              <p role="alert" className="text-sm text-coral">
                {error}
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-muted">
            <li>・金鑰只儲存在這個瀏覽器的 localStorage，不會存到我們的伺服器。</li>
            <li>・每次面試請求時才會帶上金鑰，由伺服器轉交 OpenAI 使用後即丟棄。</li>
            <li>・在公用電腦上使用後，記得按「清除金鑰」。</li>
          </ul>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!draft.trim() || verifying}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-coral disabled:opacity-40 disabled:hover:bg-ink"
            >
              {verifying ? "驗證中…" : "驗證並儲存"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
