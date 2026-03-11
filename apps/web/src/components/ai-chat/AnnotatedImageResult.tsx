"use client";

import { useState } from "react";
import { ScanLine, CheckCircle2, ImageOff } from "lucide-react";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Detection {
  id: string;
  label: string;
  confidence: number;
  severity: "critical" | "major" | "minor" | "info";
  boundingBox: { x: number; y: number; width: number; height: number };
  description?: string;
}

interface AnnotatedImageResultProps {
  imageUrl: string;
  detections: Detection[];
  modelName: string;
  processingTime: number;
  metadata?: { mediaType?: string };
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#EF4444";
    case "major":
      return "#F97316";
    case "minor":
      return "#EAB308";
    case "info":
      return "#3B82F6";
    default:
      return "#6B7280";
  }
}

function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "major":
      return "bg-orange-100 text-orange-700";
    case "minor":
      return "bg-yellow-100 text-yellow-700";
    case "info":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function AnnotatedImageResult({
  imageUrl,
  detections,
  modelName,
  processingTime,
  metadata,
}: AnnotatedImageResultProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const isVideo =
    metadata?.mediaType === "video" ||
    imageUrl?.includes(".mp4") ||
    imageUrl?.includes(".mov") ||
    imageUrl?.includes(".webm");

  return (
    <div className="my-3 space-y-3">
      {/* Annotated image or video — only render when URL is present */}
      {imageUrl && (
        <>
          {isVideo ? (
            <div className="w-full max-w-[500px]">
              <video
                src={imageUrl}
                controls
                className="w-full rounded-xl border border-gray-200"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Bounding boxes shown for individual frames. Click a timestamp to view.
              </p>
            </div>
          ) : (
            <div className="relative inline-block w-full max-w-[500px] rounded-xl overflow-hidden border border-gray-200">
              {!imageError && (
                <img
                  src={imageUrl}
                  alt="Detection result"
                  className="w-full h-auto block rounded-xl"
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    setImageLoaded(true);
                    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                  }}
                  onError={() => setImageError(true)}
                />
              )}

              {/* Bounding box overlays — only render after image has loaded */}
              {imageLoaded &&
                !imageError &&
                detections.map((det) => (
                  <div
                    key={det.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${det.boundingBox.x * 100}%`,
                      top: `${det.boundingBox.y * 100}%`,
                      width: `${det.boundingBox.width * 100}%`,
                      height: `${det.boundingBox.height * 100}%`,
                      border: `2px solid ${getSeverityColor(det.severity)}`,
                      backgroundColor: `${getSeverityColor(det.severity)}15`,
                    }}
                  >
                    <span
                      className="absolute left-0 whitespace-nowrap text-xs font-medium px-1.5 py-0.5 rounded text-white leading-none"
                      style={{
                        backgroundColor: getSeverityColor(det.severity),
                        bottom: "100%",
                        marginBottom: "2px",
                      }}
                    >
                      {det.label} {Math.round(det.confidence * 100)}%
                    </span>
                  </div>
                ))}

              {/* Image error fallback */}
              {imageError && (
                <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageOff className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">Image could not be displayed</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Detection summary card */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">
              Detection Results
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {modelName} • {processingTime}ms
          </span>
        </div>

        {/* Results list */}
        {detections.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {[...detections]
                .sort((a, b) => b.confidence - a.confidence)
                .map((det) => (
                  <div
                    key={det.id}
                    className="px-4 py-2.5 flex items-start gap-3"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getSeverityColor(det.severity) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {det.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(det.confidence * 100)}% confidence
                        </span>
                      </div>
                      {det.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {det.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getSeverityBadgeClass(det.severity)}`}
                    >
                      {det.severity}
                    </span>
                  </div>
                ))}
            </div>

            {/* Footer summary */}
            <div className="px-4 py-2.5 border-t border-gray-200 bg-white flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {detections.length} detection
                {detections.length !== 1 ? "s" : ""} found
              </span>
              <button
                type="button"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Log as Incident →
              </button>
            </div>
          </>
        ) : (
          <div className="px-4 py-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-sm font-medium text-green-700">
              No issues detected
            </p>
            <p className="text-xs text-gray-500">The image passed inspection</p>
          </div>
        )}
      </div>
    </div>
  );
}
