"use client";

import { useState } from "react";
import { Film } from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FrameDetailLightbox } from "../FrameDetailLightbox";
import type {
  ChatMessage,
  VideoAnalysisResult,
  FlaggedFrame,
  Defect,
} from "@/services/chatbot/types";

interface VideoReportMetadata extends VideoAnalysisResult {
  sourceFileId?: string;
  modelId?: string;
}

interface VideoReportMessageProps {
  message: ChatMessage;
  onLogAllIncidents?: (result: VideoAnalysisResult) => void;
  onLogFrameIncident?: (
    frame: FlaggedFrame,
    metadata: { sourceFileId?: string; modelId?: string }
  ) => void;
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

function severityHex(severity: Defect["severity"]) {
  switch (severity) {
    case "critical":
      return "#EF4444";
    case "major":
      return "#F97316";
    case "minor":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

function worstSeverityInFrame(frame: FlaggedFrame): Defect["severity"] {
  if (frame.defects.length === 0) return "minor";
  const order = { critical: 0, major: 1, minor: 2 };
  return frame.defects.reduce((a, b) =>
    order[a.severity] <= order[b.severity] ? a : b
  ).severity;
}

const MAX_FRAMES_VISIBLE = 6;

const SEVERITY_ORDER = { critical: 0, major: 1, minor: 2 } as const;

function getSegmentColor(
  point: { timestamp: string; defectCount: number },
  flaggedFrames: FlaggedFrame[]
): string {
  if (point.defectCount === 0) return "#22C55E";
  const frame = flaggedFrames.find((f) => f.timestamp === point.timestamp);
  if (!frame || frame.defects.length === 0) return "#EF4444";
  const worst = frame.defects.reduce((a, b) =>
    SEVERITY_ORDER[a.severity] <= SEVERITY_ORDER[b.severity] ? a : b
  );
  return severityHex(worst.severity);
}

export function VideoReportMessage({
  message,
  onLogAllIncidents,
  onLogFrameIncident,
}: VideoReportMessageProps) {
  const result = (message.metadata ?? {}) as VideoReportMetadata;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const flaggedFrames = result.flaggedFrames ?? [];
  const totalDefects = result.defectsSummary?.total ?? 0;
  const hasCritical =
    (result.defectsSummary?.bySeverity?.critical ?? 0) > 0;
  const visibleFrames = flaggedFrames.slice(0, MAX_FRAMES_VISIBLE);
  const moreFrames = flaggedFrames.length - MAX_FRAMES_VISIBLE;
  const timeline = result.timeline ?? [];

  const chartData = timeline.map((point) => ({
    ...point,
    fill: getSegmentColor(point, flaggedFrames),
    displayValue: Math.max(point.defectCount, 1),
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleLogFrame = (frame: FlaggedFrame) => {
    onLogFrameIncident?.(frame, {
      sourceFileId: result.sourceFileId,
      modelId: result.modelId,
    });
  };

  return (
    <div className="animate-msg-enter flex max-w-[95%] flex-col items-start">
      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-gray-900">
              Video Analysis Complete
            </span>
          </div>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {result.totalFramesAnalyzed ?? 0} frames
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                hasCritical ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {totalDefects} defects
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {result.clipDuration ?? "—"}
            </span>
          </div>

          {result.defectsSummary?.byType &&
            Object.keys(result.defectsSummary.byType).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.defectsSummary.byType).map(
                  ([type, count]) => (
                    <span
                      key={type}
                      className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                    >
                      {type}: {count}
                    </span>
                  )
                )}
              </div>
            )}

          {chartData.length > 0 && (
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height={48}>
                <BarChart
                  data={chartData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis hide dataKey="timestamp" />
                  <YAxis hide domain={[0, "auto"]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const p = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs shadow-md">
                          {p.timestamp} — {p.defectCount} defect
                          {p.defectCount !== 1 ? "s" : ""}
                        </div>
                      );
                    }}
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  />
                  <Bar
                    dataKey="displayValue"
                    fill="#22C55E"
                    radius={[1, 1, 0, 0]}
                    maxBarSize={24}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {visibleFrames.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {visibleFrames.map((frame, idx) => {
                const worst = worstSeverityInFrame(frame);
                return (
                  <button
                    key={frame.frameNumber}
                    type="button"
                    onClick={() => openLightbox(idx)}
                    className="group relative aspect-video overflow-hidden rounded-lg bg-gray-100"
                  >
                    <img
                      src={frame.annotatedThumbnailUrl ?? frame.thumbnailUrl}
                      alt={`Frame ${frame.timestamp}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      {frame.timestamp}
                    </div>
                    <div
                      className={`absolute right-1 top-1 h-2 w-2 rounded-full ${severityColor(worst)}`}
                    />
                    <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                      {frame.defects.length} defect
                      {frame.defects.length !== 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
              {moreFrames > 0 && (
                <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-500">
                  +{moreFrames} more
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {onLogAllIncidents && flaggedFrames.length > 0 && (
              <button
                type="button"
                onClick={() => onLogAllIncidents(result)}
                className="rounded-lg border-2 border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                Log All as Incidents
              </button>
            )}
            <button
              type="button"
              title="Coming in v2"
              className="cursor-not-allowed rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-400"
            >
              Log Selected
            </button>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {formatTimestamp(message.timestamp)}
      </p>

      <FrameDetailLightbox
        flaggedFrames={flaggedFrames}
        initialFrameIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onLogIncident={handleLogFrame}
      />
    </div>
  );
}
