"use client";

import { useSyncExternalStore } from "react";

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

export function openApiKeySettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export function onOpenApiKeySettings(callback: () => void) {
  window.addEventListener(OPEN_SETTINGS_EVENT, callback);
  return () => window.removeEventListener(OPEN_SETTINGS_EVENT, callback);
}

export function maskApiKey(key: string) {
  return key.length <= 12 ? "••••••••" : `${key.slice(0, 7)}••••••••${key.slice(-4)}`;
}

export function isLikelyOpenAIKey(key: string) {
  return /^sk-[\w-]{16,}$/.test(key);
}
