"use client";

import { useEffect, useState } from "react";
import { Film, Play } from "lucide-react";
import type { ChatMessage } from "@/services/chatbot/types";
import { formatFileSize, formatDuration } from "@/services/chatbot/api";

interface VideoMetadata {
  fileUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  status?: "uploading" | "loaded" | "error";
}

interface VideoMessageProps {
  message: ChatMessage;
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

export function VideoMessage({ message }: VideoMessageProps) {
  const meta = (message.metadata ?? {}) as VideoMetadata;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isUploading = meta.status === "uploading";
  const hasThumbnail = meta.thumbnailUrl && !isUploading;
  const durationStr =
    meta.duration != null ? formatDuration(meta.duration) : null;

  useEffect(() => {
    return () => {
      if (meta.fileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(meta.fileUrl);
      }
      if (meta.thumbnailUrl?.startsWith("blob:") && meta.thumbnailUrl !== meta.fileUrl) {
        URL.revokeObjectURL(meta.thumbnailUrl);
      }
    };
  }, [meta.fileUrl, meta.thumbnailUrl]);

  return (
    <div className="animate-msg-enter flex flex-col items-end">
      <div className="max-w-[85%]">
        <div
          className="relative max-w-[240px] cursor-pointer overflow-hidden rounded-xl"
          onClick={() => !isUploading && setLightboxOpen(true)}
        >
          {hasThumbnail ? (
            <>
              <img
                src={meta.thumbnailUrl}
                alt={meta.fileName ?? "Video thumbnail"}
                className="aspect-video w-full max-w-[240px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute left-2 top-2 rounded bg-black/50 p-1">
                <Film className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
                <Play className="h-5 w-5 fill-indigo-600 text-indigo-600" />
              </div>
              {durationStr && (
                <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs text-white">
                  {durationStr}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-video max-w-[240px] flex-col items-center justify-center rounded-xl bg-gray-200">
              <Film className="mb-1 h-8 w-8 text-gray-400" />
              <span className="text-xs text-gray-500">Video uploaded</span>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full animate-pulse rounded-full bg-white"
                  style={{ width: "60%" }}
                />
              </div>
            </div>
          )}
        </div>
        {(meta.fileName || meta.fileSize != null) && (
          <p className="mt-1 truncate text-xs text-gray-500">
            {meta.fileName}
            {meta.fileSize != null && ` · ${formatFileSize(meta.fileSize)}`}
          </p>
        )}
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
          <video
            src={meta.fileUrl}
            controls
            controlsList="nodownload"
            className="max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
