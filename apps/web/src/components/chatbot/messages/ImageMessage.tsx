"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import type { ChatMessage } from "@/services/chatbot/types";
import { formatFileSize } from "@/services/chatbot/api";

interface ImageMetadata {
  fileUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  status?: "uploading" | "loaded" | "error";
}

interface ImageMessageProps {
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

export function ImageMessage({ message }: ImageMessageProps) {
  const meta = (message.metadata ?? {}) as ImageMetadata;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isUploading = meta.status === "uploading";
  const hasError = meta.status === "error" || imgError;
  const src = meta.thumbnailUrl ?? meta.fileUrl ?? "";

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
          onClick={() => !isUploading && !hasError && setLightboxOpen(true)}
        >
          {hasError ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl bg-gray-100">
              <ImageOff className="h-8 w-8 text-gray-400" />
              <span className="text-xs text-gray-500">Image unavailable</span>
            </div>
          ) : (
            <>
              <img
                src={src}
                alt={meta.fileName ?? "Uploaded image"}
                className="max-h-[180px] w-full max-w-[240px] object-cover"
                onError={() => setImgError(true)}
              />
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
            </>
          )}
        </div>
        {(meta.fileName || meta.fileSize != null) && !hasError && (
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
          <img
            src={meta.fileUrl ?? src}
            alt={meta.fileName ?? "Image"}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
