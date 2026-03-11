"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnnotatedImage } from "./AnnotatedImage";
import type { Defect, FlaggedFrame } from "@/services/chatbot/types";

const SEVERITY_COLORS = {
  critical: "bg-red-500",
  major: "bg-amber-500",
  minor: "bg-gray-400",
} as const;

interface FrameDetailLightboxProps {
  flaggedFrames: FlaggedFrame[];
  initialFrameIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onLogIncident: (frame: FlaggedFrame) => void;
}

export function FrameDetailLightbox({
  flaggedFrames,
  initialFrameIndex,
  isOpen,
  onClose,
  onLogIncident,
}: FrameDetailLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialFrameIndex);
  const touchStartRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(
        Math.min(
          Math.max(0, initialFrameIndex),
          Math.max(0, flaggedFrames.length - 1)
        )
      );
    }
  }, [isOpen, initialFrameIndex, flaggedFrames.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((i) =>
          Math.min(flaggedFrames.length - 1, i + 1)
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, flaggedFrames.length]);

  if (!isOpen || flaggedFrames.length === 0) return null;

  const frame = flaggedFrames[currentIndex] ?? flaggedFrames[0];
  const total = flaggedFrames.length;
  const idx = currentIndex;

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setCurrentIndex((i) => Math.min(total - 1, i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-label="Frame detail"
    >
      <div
        className="flex max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <span className="text-sm font-medium text-gray-700">
            Frame {idx + 1} of {total}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="transition-opacity duration-200">
            <AnnotatedImage
              imageUrl={frame.annotatedThumbnailUrl ?? frame.thumbnailUrl}
              defects={frame.defects}
            />
          </div>

          {idx > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-70 transition-opacity hover:opacity-100"
              aria-label="Previous frame"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {idx < total - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-70 transition-opacity hover:opacity-100"
              aria-label="Next frame"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="border-t border-gray-200 px-4 py-3">
          <div className="mb-2 text-sm font-medium text-gray-700">
            Frame at {frame.timestamp}
          </div>
          {frame.defects.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {frame.defects.map((d: Defect) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_COLORS[d.severity] ?? SEVERITY_COLORS.minor}`}
                  />
                  <span className="flex-1">{d.type}</span>
                  <span className="text-gray-500">
                    {Math.round(d.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onLogIncident(frame)}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Log This Frame as Incident
          </button>
        </div>
      </div>
    </div>
  );
}
