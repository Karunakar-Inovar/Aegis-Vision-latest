"use client";

import type { ChatMessage, FlaggedFrame, VideoAnalysisResult } from "@/services/chatbot/types";

interface LogAllConfirmationMessageProps {
  message: ChatMessage;
  onConfirm: (messageId: string) => void;
  onCancel: (messageId: string) => void;
  onRetryFailed?: (messageId: string) => void;
}

interface LogAllMetadata {
  result?: VideoAnalysisResult;
  sourceFileId?: string;
  fileId?: string;
  modelId?: string;
  flaggedFrames: FlaggedFrame[];
  status?: "pending" | "progress" | "success" | "partial-failure" | "cancelled";
  progress?: { current: number; total: number };
  incidentIds?: string[];
  failedFrames?: FlaggedFrame[];
}

export function LogAllConfirmationMessage({
  message,
  onConfirm,
  onCancel,
  onRetryFailed,
}: LogAllConfirmationMessageProps) {
  const meta = (message.metadata ?? {}) as LogAllMetadata;
  const flaggedFrames = meta.flaggedFrames ?? [];
  const status = meta.status ?? "pending";
  const n = flaggedFrames.length;

  if (n === 0 && status === "pending") return null;

  if (status === "cancelled") {
    return (
      <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-600">Batch logging cancelled.</p>
        </div>
      </div>
    );
  }

  if (status === "progress" && meta.progress) {
    const { current, total } = meta.progress;
    return (
      <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-700">
            Logging incident {current} of {total}...
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(current / total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (status === "success" && meta.incidentIds) {
    const ids = meta.incidentIds;
    return (
      <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
          <p className="mb-3 text-sm font-medium text-green-800">
            Successfully created {ids.length} incident{ids.length !== 1 ? "s" : ""}
          </p>
          <div className="max-h-24 overflow-y-auto rounded bg-white/80 p-2 text-xs text-gray-700">
            {ids.map((id) => (
              <div key={id} className="font-mono">
                {id}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "partial-failure" && meta.incidentIds && meta.failedFrames) {
    const succeeded = meta.incidentIds.length;
    const failed = meta.failedFrames.length;
    return (
      <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <p className="mb-2 text-sm font-medium text-amber-800">
            {succeeded} succeeded, {failed} failed.
          </p>
          <p className="mb-3 text-xs text-amber-700">
            Failed frames: {meta.failedFrames.map((f) => f.timestamp).join(", ")}
          </p>
          {onRetryFailed && (
            <button
              type="button"
              onClick={() => onRetryFailed(message.id)}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            >
              Retry failed
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <p className="mb-3 text-sm text-gray-700">
          This will create {n} incident{n !== 1 ? "s" : ""}, one for each
          flagged frame. Proceed?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onConfirm(message.id)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Yes, log all
          </button>
          <button
            type="button"
            onClick={() => onCancel(message.id)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
