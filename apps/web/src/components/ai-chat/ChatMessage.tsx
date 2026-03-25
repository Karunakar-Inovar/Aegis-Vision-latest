"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import { FormattedContent } from "./FormattedContent";
import { AnnotatedImageOverlay } from "./AnnotatedImageOverlay";
import { AnnotatedImageResult } from "./AnnotatedImageResult";
import type { ChatMessage as ChatMessageType } from "@/services/ai-chat/types";

interface ChatMessageProps {
  message: ChatMessageType;
  previousUserImageUrl?: string;
  onRegenerate?: (messageId: string) => void;
}

const SEVERITY_BADGE = {
  critical: "bg-red-100 text-red-800",
  major: "bg-amber-100 text-amber-800",
  minor: "bg-yellow-100 text-yellow-800",
} as const;

export function ChatMessage({
  message,
  previousUserImageUrl,
  onRegenerate,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = useCallback(async () => {
    if (!message.content) return;
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const handleFeedback = useCallback((type: "up" | "down") => {
    setFeedback((prev) => (prev === type ? null : type));
  }, []);
  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%]">
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap justify-end gap-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="relative overflow-hidden rounded-xl border border-gray-200"
                >
                  {att.type === "video" ? (
                    <video
                      src={att.localUrl}
                      controls
                      className="max-h-[200px] max-w-[280px] rounded-xl"
                    />
                  ) : (
                    <img
                      src={att.localUrl}
                      alt={att.fileName}
                      className="max-h-[200px] max-w-[280px] rounded-xl object-cover"
                    />
                  )}
                  <p className="px-2 py-1 text-xs text-gray-400">{att.fileName}</p>
                </div>
              ))}
            </div>
          )}
          {message.content ? (
            <div className="rounded-2xl rounded-br-md bg-gray-100 px-4 py-3 text-sm text-gray-800">
              {message.content}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="group flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
      </div>
      <div className="max-w-[90%] flex-1">
        <div className="text-sm leading-relaxed text-gray-800">
          <FormattedContent content={message.content} />
        </div>
        {message.metadata?.type === "detection-result" && (
          <AnnotatedImageResult
            imageUrl={
              (message.metadata.imageUrl as string) || previousUserImageUrl || ""
            }
            capturedFrameUrl={
              message.metadata.capturedFrameUrl as string | undefined
            }
            detections={
              (message.metadata.detections as Array<{
                id: string;
                label: string;
                confidence: number;
                severity: "critical" | "major" | "minor" | "info";
                boundingBox: { x: number; y: number; width: number; height: number };
                description?: string;
              }>) ?? []
            }
            modelName={(message.metadata.modelName as string) ?? "Detection"}
            processingTime={(message.metadata.processingTime as number) ?? 0}
            detectionModel={(message.metadata.detectionModel as string) ?? ""}
            metadata={
              typeof message.metadata?.mediaType === "string"
                ? { mediaType: message.metadata.mediaType }
                : undefined
            }
          />
        )}
        {message.metadata?.defects &&
          message.metadata.defects.length > 0 &&
          message.metadata?.type !== "detection-result" &&
          previousUserImageUrl && (
            <div className="mt-3">
              <AnnotatedImageOverlay
                imageUrl={previousUserImageUrl}
                defects={message.metadata.defects}
                alt="Detection result with bounding boxes"
                className="max-w-full"
              />
            </div>
          )}
        {message.metadata?.annotatedImageUrl &&
          !message.metadata?.defects?.length &&
          message.metadata?.type !== "detection-result" &&
          !previousUserImageUrl && (
            <div className="mt-3">
              <img
                src={message.metadata.annotatedImageUrl}
                alt="Annotated result"
                className="max-w-full rounded-lg border border-gray-200"
              />
            </div>
          )}
        {message.metadata?.defects &&
          message.metadata.defects.length > 0 &&
          message.metadata?.type !== "detection-result" && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Detection breakdown
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-2 pr-3 font-medium text-gray-600">#</th>
                      <th className="pb-2 pr-3 font-medium text-gray-600">Type</th>
                      <th className="pb-2 pr-3 font-medium text-gray-600">Confidence</th>
                      <th className="pb-2 font-medium text-gray-600">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {message.metadata.defects.map((d, i) => (
                      <tr
                        key={d.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-2 pr-3 text-gray-700">{i + 1}</td>
                        <td className="py-2 pr-3 font-medium text-gray-800">
                          {d.type}
                        </td>
                        <td className="py-2 pr-3 text-gray-700">
                          {Math.round(d.confidence * 100)}%
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                              SEVERITY_BADGE[d.severity] ?? SEVERITY_BADGE.minor
                            }`}
                          >
                            {d.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {message.metadata.summary && (
                <div className="mt-2 flex flex-wrap gap-3 border-t border-gray-200 pt-2 text-xs text-gray-600">
                  {message.metadata.summary.totalDefects != null && (
                    <span>Total: {message.metadata.summary.totalDefects}</span>
                  )}
                  {message.metadata.summary.passRate != null && (
                    <span>Pass rate: {message.metadata.summary.passRate}%</span>
                  )}
                  {message.metadata.summary.complianceScore != null && (
                    <span>
                      Compliance: {message.metadata.summary.complianceScore}%
                    </span>
                  )}
                  {message.metadata.processingTimeMs != null && (
                    <span>
                      Processed in {message.metadata.processingTimeMs}ms
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        {(message.metadata?.actions?.length ?? 0) > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.metadata!.actions!.map((action, i) => (
              <button
                key={i}
                type="button"
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title={copied ? "Copied!" : "Copy"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleFeedback("up")}
            className={`rounded-md p-1.5 transition-colors ${
              feedback === "up"
                ? "bg-indigo-50 text-indigo-500"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title="Good response"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFeedback("down")}
            className={`rounded-md p-1.5 transition-colors ${
              feedback === "down"
                ? "bg-red-50 text-red-500"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title="Bad response"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={() => onRegenerate(message.id)}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="Regenerate"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
