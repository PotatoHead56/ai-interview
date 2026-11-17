"use client";

import { useSyncExternalStore } from "react";
import { API_KEY_HEADER, API_KEY_PATTERN } from "@/lib/interview";

const STORAGE_KEY = "ai-interview:openai-api-key";
const CHANGE_EVENT = "ai-interview:api-key-change";
const OPEN_SETTINGS_EVENT = "ai-interview:open-api-key-settings";

// localStorage 不可用時（無痕模式、封鎖網站資料）退回只存在記憶體，重新整理後就會消失
let memoryKey: string | null = null;

function readApiKey(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryKey;
  } catch {
    return memoryKey;
  }
}

function notifyChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveApiKey(key: string) {
  memoryKey = key;
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // 寫入失敗時仍保留記憶體中的值
  }
  notifyChange();
}

export function clearApiKey() {
  memoryKey = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 忽略
  }
  notifyChange();
}

function subscribe(callback: () => void) {
  // storage 事件讓其他分頁的變更也能同步
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

// 伺服器端渲染時沒有 localStorage，一律視為尚未設定
export function useApiKey() {
  return useSyncExternalStore(subscribe, readApiKey, () => null);
}

// reason 會顯示在設定視窗上方，告訴使用者為什麼需要重新設定
export function openApiKeySettings(reason?: string) {
  window.dispatchEvent(new CustomEvent<string | undefined>(OPEN_SETTINGS_EVENT, { detail: reason }));
}

export function onOpenApiKeySettings(callback: (reason?: string) => void) {
  const listener = (e: Event) => callback((e as CustomEvent<string | undefined>).detail);
  window.addEventListener(OPEN_SETTINGS_EVENT, listener);
  return () => window.removeEventListener(OPEN_SETTINGS_EVENT, listener);
}

// 向伺服器確認金鑰是否有效；回傳 null 代表有效，否則回傳錯誤訊息
export async function verifyApiKey(key: string): Promise<string | null> {
  try {
    const res = await fetch("/api/verify-key", {
      method: "POST",
      headers: { [API_KEY_HEADER]: key },
    });
    if (res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data.error ?? "金鑰驗證失敗，請稍後再試。";
  } catch {
    return "無法連線到伺服器，請確認網路後再試。";
  }
}

export function maskApiKey(key: string) {
  return key.length <= 12 ? "••••••••" : `${key.slice(0, 7)}••••••••${key.slice(-4)}`;
}

export function isLikelyOpenAIKey(key: string) {
  return API_KEY_PATTERN.test(key);
}
