"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { AnnotatedImage } from "../AnnotatedImage";
import type { ChatMessage, DetectionResult, Defect } from "@/services/chatbot/types";

interface DetectionResultMessageProps {
  message: ChatMessage;
  onLogIncident?: (result: DetectionResult) => void;
}

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

function severityColor(severity: Defect["severity"]) {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "major":
      return "bg-amber-500";
    case "minor":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

const MAX_DEFECTS_VISIBLE = 4;

export function DetectionResultMessage({
  message,
  onLogIncident,
}: DetectionResultMessageProps) {
  const result = (message.metadata ?? {}) as DetectionResult;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const defects = result.defects ?? [];
  const totalDefects = result.summary?.totalDefects ?? defects.length;
  const hasDefects = totalDefects > 0;
  const visibleDefects = defects.slice(0, MAX_DEFECTS_VISIBLE);
  const moreCount = defects.length - MAX_DEFECTS_VISIBLE;

  if (!result.annotatedImageUrl && !result.originalImageUrl) {
    return null;
  }

  return (
    <div className="animate-msg-enter-scale flex max-w-[95%] flex-col items-start">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div
          className="cursor-pointer overflow-hidden rounded-t-xl"
          onClick={() => setLightboxOpen(true)}
        >
          {hasDefects && defects.length > 0 ? (
            <AnnotatedImage
              imageUrl={result.originalImageUrl ?? result.annotatedImageUrl ?? ""}
              defects={defects}
              onImageClick={() => setLightboxOpen(true)}
            />
          ) : (
            <img
              src={result.annotatedImageUrl ?? result.originalImageUrl}
              alt="Detection result"
              className="w-full object-cover"
            />
          )}
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          {!hasDefects ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <div className="font-medium">No Defects Found</div>
                <div className="text-sm text-green-600">All clear</div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2 text-gray-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                <span className="font-semibold">
                  {totalDefects} Defect{totalDefects !== 1 ? "s" : ""} Found
                </span>
              </div>
              <div className="space-y-1.5">
                {visibleDefects.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${severityColor(d.severity)}`}
                    />
                    <span className="flex-1">{d.type}</span>
                    <span className="text-gray-500">
                      {Math.round(d.confidence * 100)}%
                    </span>
                  </div>
                ))}
                {moreCount > 0 && (
                  <button
                    type="button"
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    +{moreCount} more
                  </button>
                )}
              </div>
            </>
          )}

          {result.modelInfo && (
            <p className="mt-2 text-xs text-gray-400">
              {result.modelInfo.modelName} v{result.modelInfo.modelVersion}
              {result.modelInfo.inferenceTimeMs != null &&
                ` · ${result.modelInfo.inferenceTimeMs}ms`}
            </p>
          )}

          {hasDefects && onLogIncident && (
            <button
              type="button"
              onClick={() => onLogIncident(result)}
              className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Log as Incident
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {formatTimestamp(message.timestamp)}
      </p>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setLightboxOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw]"
          >
            {hasDefects && defects.length > 0 ? (
              <AnnotatedImage
                imageUrl={result.originalImageUrl ?? result.annotatedImageUrl ?? ""}
                defects={defects}
              />
            ) : (
              <img
                src={result.annotatedImageUrl ?? result.originalImageUrl}
                alt="Detection result"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
