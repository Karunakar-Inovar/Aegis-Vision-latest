"use client";

import type { ChatMessage } from "@/services/chatbot/types";

interface ModelConfirmationMessageProps {
  message: ChatMessage;
  onRunInspection: (messageId: string) => void;
  onChangeModel: (messageId: string) => void;
}

export function ModelConfirmationMessage({
  message,
  onRunInspection,
  onChangeModel,
}: ModelConfirmationMessageProps) {
  const meta = (message.metadata ?? {}) as {
    fileId?: string;
    mediaType?: "image" | "video";
    modelId?: string;
    modelName?: string;
    durationStr?: string;
  };
  const modelName = meta.modelName ?? "selected model";
  const mediaType = meta.mediaType ?? "image";
  const durationStr = meta.durationStr;

  const mainText =
    mediaType === "image"
      ? `Image received. Running inspection with **${modelName}**...`
      : `Video received (${durationStr ?? "—"}). Starting analysis with **${modelName}**...`;

  return (
    <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
      <div className="max-w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
          {mainText.replace(/\*\*(.*?)\*\*/g, "$1")}
        </p>
        <p className="mt-1.5 text-xs text-gray-500">
          Using your last model.{" "}
          <button
            type="button"
            onClick={() => onChangeModel(message.id)}
            className="font-medium text-indigo-600 underline hover:text-indigo-700"
          >
            Change model
          </button>
        </p>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => onRunInspection(message.id)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Run Inspection →
          </button>
        </div>
      </div>
    </div>
  );
}
