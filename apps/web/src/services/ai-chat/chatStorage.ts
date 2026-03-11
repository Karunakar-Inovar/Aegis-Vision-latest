/**
 * localStorage persistence for AI Chat conversations (MVP).
 * No backend persistence yet.
 */

import type { ChatMessage } from "./types";

const STORAGE_KEY = "aegisvision-ai-chat-conversations";

export interface StoredConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

function getStored(): StoredConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStored(conversations: StoredConversation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.warn("[chatStorage] Failed to persist:", e);
  }
}

export function loadConversations(): StoredConversation[] {
  return getStored();
}

export function loadConversation(id: string): StoredConversation | null {
  const all = getStored();
  return all.find((c) => c.id === id) ?? null;
}

export function saveConversation(conv: StoredConversation) {
  const all = getStored();
  const idx = all.findIndex((c) => c.id === conv.id);
  const updated = { ...conv, updatedAt: new Date().toISOString() };
  const next =
    idx >= 0
      ? all.map((c) => (c.id === conv.id ? updated : c))
      : [updated, ...all];
  // Keep most recent 50 conversations
  const trimmed = next.slice(0, 50);
  setStored(trimmed);
}

export function deleteConversation(id: string) {
  const all = getStored().filter((c) => c.id !== id);
  setStored(all);
}

export function getConversationSummaries(): ConversationSummary[] {
  return getStored().map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt,
  }));
}

export function generateConversationTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New Chat";
  const text = firstUser.content?.trim() || "";
  if (!text) return "New Chat";
  return text.length > 40 ? text.slice(0, 37) + "..." : text;
}
