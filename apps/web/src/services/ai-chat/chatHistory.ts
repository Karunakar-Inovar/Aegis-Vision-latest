/**
 * localStorage persistence for AI Chat conversations (MVP).
 * Manages conversation CRUD, pinning, search, and time grouping.
 */

import type { ChatMessage } from "./types";

const STORAGE_KEY = "aegisvision-ai-chat-history";

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface TimeGroup {
  label: string;
  chats: ChatConversation[];
}

function getStored(): ChatConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStored(conversations: ChatConversation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.warn("[chatHistory] Failed to persist:", e);
  }
}

function sortConversations(conversations: ChatConversation[]): ChatConversation[] {
  return [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function getAllConversations(): ChatConversation[] {
  return sortConversations(getStored());
}

export function getConversation(id: string): ChatConversation | null {
  const all = getStored();
  return all.find((c) => c.id === id) ?? null;
}

export function createConversation(): ChatConversation {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const conv: ChatConversation = {
    id,
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
    isPinned: false,
  };
  const all = getStored();
  setStored([conv, ...all]);
  return conv;
}

export function updateConversation(
  id: string,
  updates: Partial<ChatConversation>
): void {
  const all = getStored();
  const idx = all.findIndex((c) => c.id === id);
  if (idx < 0) return;
  const updated: ChatConversation = {
    ...all[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  setStored(all);
}

export function deleteConversation(id: string): void {
  const all = getStored().filter((c) => c.id !== id);
  setStored(all);
}

export function renameConversation(id: string, title: string): void {
  updateConversation(id, { title: title.trim() || "New Chat" });
}

export function pinConversation(id: string): void {
  updateConversation(id, { isPinned: true });
}

export function unpinConversation(id: string): void {
  updateConversation(id, { isPinned: false });
}

export function searchConversations(query: string): ChatConversation[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllConversations();
  const all = getStored();
  return sortConversations(
    all.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some(
          (m) =>
            m.content?.toLowerCase().includes(q) ||
            m.attachments?.some((a) => a.fileName?.toLowerCase().includes(q))
        )
    )
  );
}

export function autoTitleConversation(id: string, firstMessage: string): void {
  const text = firstMessage.trim();
  if (!text) return;
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .slice(0, 40);
  const title = cleaned.length >= 40 ? cleaned.slice(0, 37) + "..." : cleaned;
  updateConversation(id, { title });
}

export function groupByTime(
  conversations: ChatConversation[]
): Array<{ label: string; chats: ChatConversation[] }> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const groups: Record<string, ChatConversation[]> = {
    "Today": [],
    "Yesterday": [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    "Older": [],
  };

  for (const chat of conversations) {
    const d = new Date(chat.updatedAt);
    if (d >= todayStart) {
      groups["Today"].push(chat);
    } else if (d >= yesterdayStart) {
      groups["Yesterday"].push(chat);
    } else if (d >= sevenDaysAgo) {
      groups["Previous 7 Days"].push(chat);
    } else if (d >= thirtyDaysAgo) {
      groups["Previous 30 Days"].push(chat);
    } else {
      groups["Older"].push(chat);
    }
  }

  const labels = [
    "Today",
    "Yesterday",
    "Previous 7 Days",
    "Previous 30 Days",
    "Older",
  ];
  return labels
    .filter((label) => groups[label].length > 0)
    .map((label) => ({ label, chats: groups[label] }));
}
