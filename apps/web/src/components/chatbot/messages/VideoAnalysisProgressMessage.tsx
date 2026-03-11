"use client";

import { BarChart2, Film, Search } from "lucide-react";
import type { ChatMessage } from "@/services/chatbot/types";

interface VideoAnalysisProgressMessageProps {
  message: ChatMessage;
  onCancelAnalysis?: () => void;
}

interface ProgressMetadata {
  stage?: string;
  progress?: number;
  currentFrame?: number;
  totalFrames?: number;
  message?: string;
}

export function VideoAnalysisProgressMessage({
  message,
  onCancelAnalysis,
}: VideoAnalysisProgressMessageProps) {
  const meta = (message.metadata ?? {}) as ProgressMetadata;
  const stage = meta.stage ?? "extracting-frames";
  const progress = meta.progress ?? 0;

  const label =
    stage === "extracting-frames"
      ? "Extracting frames..."
      : stage === "detecting"
        ? meta.currentFrame != null && meta.totalFrames != null
          ? `Analyzing frame ${meta.currentFrame} of ${meta.totalFrames}...`
          : "Analyzing frames..."
        : stage === "generating-report"
          ? "Generating report..."
          : meta.message ?? message.content;

  return (
    <div className="animate-msg-enter flex max-w-[95%] flex-col">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm">
          {stage === "extracting-frames" && (
            <Film className="h-4 w-4 shrink-0 animate-pulse text-indigo-600" />
          )}
          {stage === "detecting" && (
            <Search className="h-4 w-4 shrink-0 animate-pulse text-indigo-600" />
          )}
          {stage === "generating-report" && (
            <BarChart2 className="h-4 w-4 shrink-0 animate-pulse text-indigo-600" />
          )}
          {!["extracting-frames", "detecting", "generating-report"].includes(
            stage
          ) && (
            <Film className="h-4 w-4 shrink-0 text-gray-400" />
          )}
          <span className="min-w-0 flex-1 font-medium text-gray-700">
            {label}
          </span>
          <span className="shrink-0 text-gray-500">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {onCancelAnalysis && (
          <button
            type="button"
            onClick={onCancelAnalysis}
            className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">
            Cancel Analysis
          </button>
        )}
      </div>
    </div>
  );
}
