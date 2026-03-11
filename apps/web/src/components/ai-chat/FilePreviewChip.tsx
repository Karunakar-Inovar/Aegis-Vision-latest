"use client";

import { X } from "lucide-react";
import type { AttachedFile } from "@/services/ai-chat/types";

interface FilePreviewChipProps {
  file: AttachedFile;
  onRemove: (id: string) => void;
}

export function FilePreviewChip({ file, onRemove }: FilePreviewChipProps) {
  const truncatedName =
    file.fileName.length > 20
      ? file.fileName.slice(0, 17) + "..."
      : file.fileName;

  return (
    <div
      className="group/chip relative flex h-[60px] w-[60px] flex-shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      title={file.fileName}
    >
      {file.type === "image" ? (
        <img
          src={file.localUrl}
          alt={file.fileName}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <svg
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover/chip:opacity-100">
        {truncatedName}
      </span>
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="absolute right-0.5 top-0.5 rounded bg-black/50 p-0.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover/chip:opacity-100"
        aria-label="Remove file"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
