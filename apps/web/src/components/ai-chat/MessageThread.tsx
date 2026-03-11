"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/services/ai-chat/types";

interface MessageThreadProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onRegenerate?: (messageId: string) => void;
}

function AssistantThinking() {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
      </div>
      <div className="flex items-center gap-1 py-3">
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-300"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-300"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-300"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

export function MessageThread({
  messages,
  isLoading,
  onRegenerate,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="w-full py-6">
      <div className="w-full space-y-6">
        {messages.map((msg, i) => {
          const prevUserMsg = messages
            .slice(0, i)
            .reverse()
            .find((m) => m.role === "user");
          const prevUserImage = prevUserMsg?.attachments?.find(
            (a) => a.type === "image"
          );
          return (
            <ChatMessage
              key={msg.id}
              message={msg}
              previousUserImageUrl={prevUserImage?.localUrl}
              onRegenerate={onRegenerate}
            />
          );
        })}
        {isLoading && <AssistantThinking />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
