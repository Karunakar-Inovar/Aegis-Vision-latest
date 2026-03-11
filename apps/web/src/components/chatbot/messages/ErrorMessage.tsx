"use client";

import { RefreshCw } from "lucide-react";
import type { ChatMessage } from "@/services/chatbot/types";

interface ErrorMessageProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
}

interface ApiErrorMetadata {
  error: string;
  operation: string;
  retryCount?: number;
  context?: Record<string, unknown>;
}

const MAX_RETRIES = 3;

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const meta = (message.metadata ?? {}) as ApiErrorMetadata;
  const error = meta.error ?? "An error occurred.";
  const retryCount = meta.retryCount ?? 0;
  const canRetry = retryCount < MAX_RETRIES && onRetry;
  const maxRetriesReached = retryCount >= MAX_RETRIES;

  const displayMessage = maxRetriesReached
    ? "Unable to connect. Please check your connection."
    : error;

  return (
    <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
      <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-medium text-red-800">{displayMessage}</p>
        {canRetry && (
          <button
            type="button"
            onClick={() => onRetry(message.id)}
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
