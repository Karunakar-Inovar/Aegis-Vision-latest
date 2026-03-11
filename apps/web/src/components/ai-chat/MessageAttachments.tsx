"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Attachment } from "@/services/ai-chat/types";

interface MessageAttachmentsProps {
  attachments: Attachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = attachments.filter((a) => a.type === "image");
  const imageCount = images.length;

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : i <= 0 ? imageCount - 1 : i - 1
    );
  }, [imageCount]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : i >= imageCount - 1 ? 0 : i + 1
    );
  }, [imageCount]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  if (attachments.length === 0) return null;

  const renderAttachment = (att: Attachment, index: number) => {
    if (att.type === "image") {
      const imgIndex = images.findIndex((a) => a.id === att.id);
      return (
        <button
          key={att.id}
          type="button"
          onClick={() => openLightbox(imgIndex)}
          className="block overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <img
            src={att.localUrl}
            alt={att.fileName}
            className="h-full w-full object-cover"
          />
        </button>
      );
    }
    return (
      <div
        key={att.id}
        className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
      >
        <video
          src={att.localUrl}
          controls
          className="h-full w-full"
          preload="metadata"
        />
        <p className="truncate px-2 py-1 text-xs text-gray-500">
          {att.fileName}
        </p>
      </div>
    );
  };

  if (attachments.length === 1) {
    return (
      <>
        <div className="max-w-[300px]">{renderAttachment(attachments[0], 0)}</div>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <Lightbox
            image={images[lightboxIndex]}
            onClose={closeLightbox}
            onPrev={goPrev}
            onNext={goNext}
            hasMultiple={imageCount > 1}
          />
        )}
      </>
    );
  }

  if (attachments.length === 2) {
    return (
      <>
        <div className="flex gap-2">
          {attachments.map((att, i) => (
            <div key={att.id} className="w-[150px] flex-1">
              {renderAttachment(att, i)}
            </div>
          ))}
        </div>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <Lightbox
            image={images[lightboxIndex]}
            onClose={closeLightbox}
            onPrev={goPrev}
            onNext={goNext}
            hasMultiple={imageCount > 1}
          />
        )}
      </>
    );
  }

  const displayCount = Math.min(4, attachments.length);
  const overflowCount = Math.max(0, attachments.length - 4);

  return (
    <>
      <div className="grid max-w-[320px] grid-cols-2 gap-2">
        {attachments.slice(0, displayCount).map((att, i) => (
          <div key={att.id} className="relative">
            {renderAttachment(att, i)}
            {i === 3 && overflowCount > 0 && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-lg font-medium text-white"
                aria-hidden
              >
                +{overflowCount}
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && images[lightboxIndex] && (
        <Lightbox
          image={images[lightboxIndex]}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
          hasMultiple={imageCount > 1}
        />
      )}
    </>
  );
}

function Lightbox({
  image,
  onClose,
  onPrev,
  onNext,
  hasMultiple,
}: {
  image: Attachment;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasMultiple: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-10 rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Previous"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}
      <img
        src={image.localUrl}
        alt={image.fileName}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Next"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}
    </div>
  );
}
