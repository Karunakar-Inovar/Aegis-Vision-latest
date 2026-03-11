"use client";

import type { ChatMessage } from "@/services/chatbot/types";

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

interface TextMessageProps {
  message: ChatMessage;
}

export function TextMessage({ message }: TextMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="animate-msg-enter flex w-full flex-col items-center">
        <div className="max-w-[85%] rounded-xl bg-amber-50 px-4 py-2.5 text-center text-sm leading-relaxed text-amber-800">
          {message.content}
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`animate-msg-enter flex max-w-[85%] flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      <div
        className={`max-w-full rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-indigo-600 text-white"
            : "rounded-bl-md bg-gray-100 text-gray-800"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {formatTimestamp(message.timestamp)}
      </p>
    </div>
  );
}
