import { env } from "@/shared/config";

function buildKey(key: string) {
  return `${env.VITE_APP_NAME}_${key}`;
}

export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(buildKey(key));
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function setLocalStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildKey(key), JSON.stringify(value));
}

export function removeLocalStorage(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(buildKey(key));
}
