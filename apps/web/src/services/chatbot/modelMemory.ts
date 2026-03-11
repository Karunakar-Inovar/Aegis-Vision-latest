const STORAGE_KEY = "aegisvision-chatbot-last-model";

export function getLastUsedModelId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setLastUsedModelId(modelId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, modelId);
}

export function clearLastUsedModelId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
