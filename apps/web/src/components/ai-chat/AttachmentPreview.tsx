"use client";

import { useState } from "react";
import type { Attachment } from "@/services/ai-chat/types";

interface AttachmentPreviewProps {
  attachment: Attachment;
}

export function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (attachment.type === "image") {
    return (
      <>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="block max-w-[300px] overflow-hidden rounded-xl border border-gray-200 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <img
            src={attachment.localUrl}
            alt={attachment.fileName}
            className="max-h-48 w-auto object-contain"
          />
        </button>
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxOpen(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Escape" && setLightboxOpen(false)}
          >
            <img
              src={attachment.localUrl}
              alt={attachment.fileName}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }

  // Video
  return (
    <div className="max-w-[300px] overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      <video
        src={attachment.localUrl}
        controls
        className="max-h-48 w-full"
        preload="metadata"
      />
      <p className="truncate px-2 py-1 text-xs text-gray-500">
        {attachment.fileName}
      </p>
    </div>
  );
}
