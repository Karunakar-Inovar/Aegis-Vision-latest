"use client";

import { useState } from "react";
import type { Defect } from "@/services/chatbot/types";

const SEVERITY_STYLES = {
  critical: {
    border: "#EF4444",
    fill: "rgba(239, 68, 68, 0.1)",
    label: "bg-[#EF4444]",
  },
  major: {
    border: "#F97316",
    fill: "rgba(249, 115, 22, 0.1)",
    label: "bg-[#F97316]",
  },
  minor: {
    border: "#EAB308",
    fill: "rgba(234, 179, 8, 0.1)",
    label: "bg-[#EAB308]",
  },
} as const;

interface AnnotatedImageProps {
  imageUrl: string;
  defects: Defect[];
  onImageClick?: () => void;
}

export function AnnotatedImage({
  imageUrl,
  defects,
  onImageClick,
}: AnnotatedImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full">
      <div
        className={`relative min-h-[120px] overflow-hidden rounded-xl bg-gray-200 ${onImageClick ? "cursor-pointer" : ""}`}
        onClick={onImageClick}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-300" />
        )}
        <img
          src={imageUrl}
          alt="Annotated inspection"
          className="relative block w-full"
          onLoad={() => setLoaded(true)}
        />
        {loaded &&
          defects.map((defect, index) => {
            const style =
              SEVERITY_STYLES[defect.severity] ?? SEVERITY_STYLES.minor;
            const { x, y, width, height } = defect.boundingBox;
            const leftPct = x * 100;
            const topPct = y * 100;
            const widthPct = Math.max(width * 100, 5);
            const heightPct = Math.max(height * 100, 5);
            const labelText = `${defect.type} ${Math.round(defect.confidence * 100)}%`;
            const labelInside = topPct < 8;
            const labelOffset = index * 20;

            return (
              <div
                key={defect.id}
                className="absolute min-h-[20px] min-w-[20px]"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-sm"
                  style={{
                    border: `2px solid ${style.border}`,
                    backgroundColor: style.fill,
                  }}
                />
                <div
                  className={`absolute left-0 z-10 whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium text-white ${style.label}`}
                  style={{
                    top: labelInside ? "0" : "-1.75rem",
                    transform: labelInside
                      ? undefined
                      : `translateY(-${labelOffset}px)`,
                  }}
                >
                  {labelText}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
