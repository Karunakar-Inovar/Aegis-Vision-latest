"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Check,
  AlertTriangle,
  XCircle,
  Info,
  BarChart3,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import {
  DetectionCharts,
  getDetectionChartConfig,
} from "./DetectionCharts";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  severity: "critical" | "major" | "minor" | "info";
  boundingBox: { x: number; y: number; width: number; height: number };
  description?: string;
}

type OverallStatus = "pass" | "warning" | "fail" | "info";

interface AnnotatedImageResultProps {
  imageUrl?: string;
  /** JPEG data URL from video frame capture, or image blob URL — highest priority for the base raster. */
  capturedFrameUrl?: string;
  detections: Detection[];
  modelName: string;
  processingTime: number;
  detectionModel: string;
  metadata?: { mediaType?: string };
  onLogIncidents?: (detections: Detection[]) => void;
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

function escapeSvgText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateMockAnnotatedImage(
  detections: Detection[],
  detectionModel?: string
): string {
  const getSevColor = (severity: string) => {
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
  };

  const boxes = detections
    .map((d) => {
      const color = getSevColor(d.severity);
      const x = Math.round(d.boundingBox.x * 600);
      const y = Math.round(d.boundingBox.y * 400);
      const w = Math.round(d.boundingBox.width * 600);
      const h = Math.round(d.boundingBox.height * 400);
      const labelW = Math.max(d.label.length * 7 + 16, 60);
      const labelY = Math.max(0, y - 20);
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="2.5" rx="4"/>
      <rect x="${x}" y="${labelY}" width="${labelW}" height="18" fill="${color}" rx="3"/>
      <text x="${x + 6}" y="${labelY + 13}" font-size="11" fill="white" font-family="system-ui,sans-serif" font-weight="600">${escapeSvgText(d.label)}</text>`;
    })
    .join("");

  let scene = "";
  const isPPE =
    detectionModel === "ppe-detection" || detectionModel === "safety-hazard";
  const isSurface = [
    "scratch-detection",
    "dent-detection",
    "crack-detection",
    "surface-anomaly",
  ].includes(detectionModel ?? "");
  const isFire = detectionModel === "fire-smoke-detection";

  if (isPPE) {
    scene = `<rect width="600" height="320" fill="#e5e7eb"/><rect y="320" width="600" height="80" fill="#d1d5db"/><rect y="315" width="600" height="5" fill="#9ca3af"/><rect x="20" y="180" width="80" height="140" rx="4" fill="#94a3b8"/><rect x="25" y="185" width="70" height="60" rx="2" fill="#64748b"/><rect x="500" y="200" width="80" height="120" rx="4" fill="#94a3b8"/><rect x="120" y="280" width="360" height="20" rx="4" fill="#6b7280"/><rect x="130" y="284" width="340" height="12" rx="2" fill="#4b5563"/><circle cx="135" cy="290" r="8" fill="#374151"/><circle cx="475" cy="290" r="8" fill="#374151"/><g transform="translate(160,170)"><circle cx="20" cy="10" r="12" fill="#78716c"/><rect x="8" y="22" width="24" height="40" rx="4" fill="#78716c"/><rect x="4" y="62" width="12" height="35" rx="2" fill="#78716c"/><rect x="24" y="62" width="12" height="35" rx="2" fill="#78716c"/><ellipse cx="20" cy="2" rx="14" ry="6" fill="#eab308"/></g><g transform="translate(280,180)"><circle cx="20" cy="10" r="12" fill="#78716c"/><rect x="8" y="22" width="24" height="40" rx="4" fill="#78716c"/><rect x="4" y="62" width="12" height="30" rx="2" fill="#78716c"/><rect x="24" y="62" width="12" height="30" rx="2" fill="#78716c"/><ellipse cx="20" cy="2" rx="14" ry="6" fill="#eab308"/></g><g transform="translate(400,175)"><circle cx="20" cy="10" r="12" fill="#78716c"/><rect x="8" y="22" width="24" height="40" rx="4" fill="#78716c"/><rect x="4" y="62" width="12" height="33" rx="2" fill="#78716c"/><rect x="24" y="62" width="12" height="33" rx="2" fill="#78716c"/></g><rect x="100" y="0" width="4" height="40" fill="#d1d5db"/><rect x="85" y="38" width="34" height="8" rx="2" fill="#fbbf24"/><rect x="300" y="0" width="4" height="40" fill="#d1d5db"/><rect x="285" y="38" width="34" height="8" rx="2" fill="#fbbf24"/>`;
  } else if (isSurface) {
    scene = `<rect width="600" height="400" fill="#cbd5e1"/><rect x="20" y="20" width="560" height="360" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/><line x1="40" y1="60" x2="560" y2="60" stroke="#d1d5db" stroke-width="0.5"/><line x1="40" y1="120" x2="560" y2="120" stroke="#d1d5db" stroke-width="0.5"/><line x1="40" y1="180" x2="560" y2="180" stroke="#d1d5db" stroke-width="0.5"/><line x1="40" y1="240" x2="560" y2="240" stroke="#d1d5db" stroke-width="0.5"/><line x1="40" y1="300" x2="560" y2="300" stroke="#d1d5db" stroke-width="0.5"/><line x1="80" y1="100" x2="230" y2="115" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/><line x1="350" y1="250" x2="430" y2="260" stroke="#94a3b8" stroke-width="1" stroke-linecap="round"/><line x1="200" y1="20" x2="200" y2="380" stroke="#94a3b8" stroke-width="0.3" stroke-dasharray="4,4"/><line x1="400" y1="20" x2="400" y2="380" stroke="#94a3b8" stroke-width="0.3" stroke-dasharray="4,4"/>`;
  } else if (isFire) {
    scene = `<rect width="600" height="400" fill="#374151"/><rect y="250" width="600" height="150" fill="#4b5563"/><rect x="50" y="150" width="120" height="250" rx="2" fill="#6b7280"/><rect x="430" y="180" width="120" height="220" rx="2" fill="#6b7280"/><rect x="220" y="200" width="160" height="200" rx="2" fill="#6b7280"/><rect x="70" y="170" width="30" height="25" rx="1" fill="#fbbf24" fill-opacity="0.4"/><rect x="120" y="170" width="30" height="25" rx="1" fill="#fbbf24" fill-opacity="0.3"/><rect x="240" y="220" width="30" height="25" rx="1" fill="#fbbf24" fill-opacity="0.4"/><ellipse cx="470" cy="100" rx="80" ry="50" fill="#9ca3af" fill-opacity="0.4"/><ellipse cx="490" cy="80" rx="60" ry="40" fill="#9ca3af" fill-opacity="0.3"/>`;
  } else {
    scene = `<rect width="600" height="400" fill="#f1f5f9"/><rect y="300" width="600" height="100" fill="#e2e8f0"/><rect x="30" y="100" width="100" height="200" rx="3" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="150" x2="130" y2="150" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="200" x2="130" y2="200" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="250" x2="130" y2="250" stroke="#94a3b8" stroke-width="1"/><rect x="470" y="80" width="100" height="220" rx="3" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/><line x1="470" y1="130" x2="570" y2="130" stroke="#94a3b8" stroke-width="1"/><line x1="470" y1="180" x2="570" y2="180" stroke="#94a3b8" stroke-width="1"/><rect x="40" y="110" width="25" height="20" rx="2" fill="#94a3b8"/><rect x="75" y="112" width="20" height="18" rx="2" fill="#a1a1aa"/><rect x="250" y="280" width="60" height="30" rx="3" fill="#6b7280"/><rect x="240" y="265" width="30" height="20" rx="2" fill="#9ca3af"/><circle cx="260" cy="315" r="8" fill="#374151"/><circle cx="300" cy="315" r="8" fill="#374151"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">${scene}${boxes}<text x="580" y="390" text-anchor="end" font-size="9" fill="#94a3b8" fill-opacity="0.5" font-family="system-ui">AegisVision AI</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getSummaryData(
  detections: Detection[],
  detectionModel: string
): {
  overallStatus: OverallStatus;
  summaryTitle: string;
  summarySubtitle: string;
  keyMetric: string;
  metricLabel: string;
} {
  const criticalCount = detections.filter((d) => d.severity === "critical").length;
  const majorCount = detections.filter((d) => d.severity === "major").length;
  const totalIssues = detections.filter((d) => d.severity !== "info").length;
  const totalDetections = detections.length;

  if (totalDetections === 0) {
    return {
      overallStatus: "pass",
      summaryTitle: "No Detections",
      summarySubtitle: "No objects or issues found in this image",
      keyMetric: "0",
      metricLabel: "Detections",
    };
  }

  let overallStatus: OverallStatus;
  if (totalIssues === 0) overallStatus = "pass";
  else if (criticalCount > 0) overallStatus = "fail";
  else if (majorCount > 0) overallStatus = "warning";
  else overallStatus = "info";

  switch (detectionModel) {
    case "ppe-detection": {
      const compliant = detections.filter((d) => d.severity === "info").length;
      const rate = Math.round((compliant / totalDetections) * 100);
      return {
        overallStatus:
          rate >= 80 ? "pass" : rate >= 60 ? "warning" : "fail",
        summaryTitle:
          rate >= 80 ? "PPE Compliance Passed" : "PPE Issues Detected",
        summarySubtitle: `${totalIssues} violation${totalIssues !== 1 ? "s" : ""} found across ${totalDetections} checks`,
        keyMetric: `${rate}%`,
        metricLabel: "Compliance",
      };
    }

    case "scratch-detection":
    case "dent-detection":
    case "crack-detection":
    case "surface-anomaly": {
      const qualityScore = Math.max(
        0,
        100 -
          (criticalCount * 25 +
            majorCount * 15 +
            (totalIssues - criticalCount - majorCount) * 5)
      );
      return {
        overallStatus,
        summaryTitle:
          totalIssues === 0
            ? "Quality Check Passed"
            : `${totalIssues} Defect${totalIssues !== 1 ? "s" : ""} Found`,
        summarySubtitle:
          totalIssues === 0
            ? "No defects detected on this surface"
            : `${criticalCount} critical, ${majorCount} major detected`,
        keyMetric: `${qualityScore}/100`,
        metricLabel: "Quality Score",
      };
    }

    case "fire-smoke-detection":
      return {
        overallStatus:
          criticalCount > 0 ? "fail" : majorCount > 0 ? "warning" : "pass",
        summaryTitle:
          criticalCount > 0
            ? "🚨 Fire/Smoke Alert"
            : majorCount > 0
              ? "⚠️ Potential Hazard"
              : "All Clear",
        summarySubtitle: `${totalDetections} region${totalDetections !== 1 ? "s" : ""} analyzed`,
        keyMetric: criticalCount > 0 ? "HIGH" : majorCount > 0 ? "MED" : "LOW",
        metricLabel: "Risk Level",
      };

    case "object-counting":
      return {
        overallStatus: "info",
        summaryTitle: "Object Count Complete",
        summarySubtitle: "Detected across the full image",
        keyMetric: `${totalDetections}`,
        metricLabel: "Objects Found",
      };

    default:
      return {
        overallStatus,
        summaryTitle:
          totalIssues === 0
            ? "No Issues Detected"
            : `${totalIssues} Issue${totalIssues !== 1 ? "s" : ""} Found`,
        summarySubtitle: `${totalDetections} total detections`,
        keyMetric: `${totalDetections}`,
        metricLabel: "Detections",
      };
  }
}

function getStatusBgColor(status: string) {
  switch (status) {
    case "pass":
      return "bg-green-50 border-b border-green-100";
    case "warning":
      return "bg-amber-50 border-b border-amber-100";
    case "fail":
      return "bg-red-50 border-b border-red-100";
    default:
      return "bg-blue-50 border-b border-blue-100";
  }
}

function getStatusIconBg(status: string) {
  switch (status) {
    case "pass":
      return "bg-green-100";
    case "warning":
      return "bg-amber-100";
    case "fail":
      return "bg-red-100";
    default:
      return "bg-blue-100";
  }
}

function getMetricColor(status: string) {
  switch (status) {
    case "pass":
      return "text-green-600";
    case "warning":
      return "text-amber-600";
    case "fail":
      return "text-red-600";
    default:
      return "text-blue-600";
  }
}

export function AnnotatedImageResult({
  imageUrl = "",
  capturedFrameUrl,
  detections,
  modelName,
  processingTime,
  detectionModel,
  metadata,
  onLogIncidents,
}: AnnotatedImageResultProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [chartsExpanded, setChartsExpanded] = useState(false);
  const [selectedDetections, setSelectedDetections] = useState<Set<string>>(
    new Set()
  );
  const [isSelectMode, setIsSelectMode] = useState(false);

  const isVideo =
    metadata?.mediaType === "video" ||
    imageUrl.includes(".mp4") ||
    imageUrl.includes(".mov") ||
    imageUrl.includes(".webm") ||
    imageUrl.includes(".avi");

  const rasterSrc =
    capturedFrameUrl ||
    (imageUrl && !isVideo ? imageUrl : "");

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [rasterSrc]);

  const sortedDetections = useMemo(
    () => [...detections].sort((a, b) => b.confidence - a.confidence),
    [detections]
  );

  const summary = useMemo(
    () => getSummaryData(detections, detectionModel),
    [detections, detectionModel]
  );

  const hasCharts = useMemo(
    () => getDetectionChartConfig(detectionModel, detections).length > 0,
    [detectionModel, detections]
  );

  const localMockSvg = useMemo(
    () => generateMockAnnotatedImage(detections, detectionModel),
    [detections, detectionModel]
  );

  const mockFrameSrc = localMockSvg;

  const showHtmlOverlays =
    Boolean(rasterSrc) &&
    imageLoaded &&
    !imageError &&
    detections.length > 0;

  const toggleDetection = (id: string) => {
    setSelectedDetections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (!isSelectMode) setIsSelectMode(true);
  };

  const toggleAll = () => {
    if (selectedDetections.size === detections.length) {
      setSelectedDetections(new Set());
      setIsSelectMode(false);
    } else {
      setSelectedDetections(new Set(detections.map((d) => d.id)));
    }
  };

  const handleLogIncidents = () => {
    if (detections.length === 0) return;
    const detectionsToLog =
      selectedDetections.size > 0
        ? detections.filter((d) => selectedDetections.has(d.id))
        : detections;

    onLogIncidents?.(detectionsToLog);

    setSelectedDetections(new Set());
    setIsSelectMode(false);
  };

  const {
    overallStatus,
    summaryTitle,
    summarySubtitle,
    keyMetric,
    metricLabel,
  } = summary;

  return (
    <div className="my-4 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        className={`flex flex-shrink-0 items-center justify-between px-5 py-3.5 ${getStatusBgColor(overallStatus)}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${getStatusIconBg(overallStatus)}`}
          >
            {overallStatus === "pass" && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            {overallStatus === "warning" && (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            {overallStatus === "fail" && (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {overallStatus === "info" && (
              <Info className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {summaryTitle}
            </p>
            <p className="text-xs text-gray-500">{summarySubtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${getMetricColor(overallStatus)}`}>
            {keyMetric}
          </p>
          <p className="text-xs text-gray-400">{metricLabel}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row">
          <div className="border-gray-100 p-4 lg:w-1/2 lg:border-r">
            <div className="relative overflow-hidden rounded-xl bg-gray-100">
              {rasterSrc ? (
                imageError ? (
                  <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gray-100">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="mx-auto mb-1 h-8 w-8" />
                      <p className="text-xs">Could not load image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={rasterSrc}
                      alt="Detection result"
                      className="block h-auto w-full rounded-xl"
                      onLoad={() => {
                        setImageLoaded(true);
                        setImageError(false);
                      }}
                      onError={() => {
                        setImageError(true);
                        setImageLoaded(false);
                      }}
                    />
                    {showHtmlOverlays &&
                      detections.map((det) => (
                        <div
                          key={det.id}
                          className="pointer-events-none absolute"
                          style={{
                            left: `${det.boundingBox.x * 100}%`,
                            top: `${det.boundingBox.y * 100}%`,
                            width: `${det.boundingBox.width * 100}%`,
                            height: `${det.boundingBox.height * 100}%`,
                            border: `2px solid ${getSeverityColor(det.severity)}`,
                            backgroundColor: `${getSeverityColor(det.severity)}10`,
                          }}
                        >
                          <span
                            className="absolute left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
                            style={{
                              backgroundColor: getSeverityColor(det.severity),
                              bottom: "100%",
                              marginBottom: "2px",
                            }}
                          >
                            {det.label}{" "}
                            {Math.round(det.confidence * 100)}%
                          </span>
                        </div>
                      ))}
                  </>
                )
              ) : (
                <img
                  src={mockFrameSrc}
                  alt="Detection overlay"
                  className="block h-auto w-full rounded-xl"
                />
              )}
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-xs text-gray-400">{modelName}</span>
              <span className="text-xs text-gray-400">{processingTime}ms</span>
            </div>
          </div>

          <div className="flex flex-col lg:w-1/2">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Detections ({detections.length})
            </span>
            {isSelectMode && detections.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAll();
                }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                {selectedDetections.size === detections.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            )}
          </div>

          <div className="max-h-[300px] flex-1 divide-y divide-gray-50 overflow-y-auto">
            {sortedDetections.length > 0 ? (
              sortedDetections.map((det) => (
                <div
                  key={det.id}
                  role="button"
                  tabIndex={0}
                  className="group flex cursor-pointer items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-gray-50/50"
                  onClick={() => toggleDetection(det.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleDetection(det.id);
                    }
                  }}
                >
                  <div
                    className={`
                      mt-0.5 flex-shrink-0 transition-all duration-150
                      ${
                        isSelectMode || selectedDetections.has(det.id)
                          ? "w-4 opacity-100"
                          : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-100"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-4 w-4 items-center justify-center rounded border-2 transition-colors
                        ${
                          selectedDetections.has(det.id)
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-300 bg-white"
                        }
                      `}
                    >
                      {selectedDetections.has(det.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>

                  <div
                    className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: getSeverityColor(det.severity),
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-800">
                        {det.label}
                      </span>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {Math.round(det.confidence * 100)}%
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getSeverityBadgeClass(det.severity)}`}
                        >
                          {det.severity}
                        </span>
                      </div>
                    </div>
                    {det.description && (
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {det.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-green-500" />
                <p className="text-sm font-medium text-green-700">
                  No issues detected
                </p>
                <p className="text-xs text-gray-500">
                  The image passed inspection
                </p>
              </div>
            )}
          </div>
        </div>
        </div>

        {hasCharts && (
          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => setChartsExpanded(!chartsExpanded)}
              className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Detailed Analytics
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${chartsExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {chartsExpanded && (
              <div className="animate-in slide-in-from-top-2 px-5 pb-4 duration-200">
                <DetectionCharts
                  detections={detections}
                  modelName={modelName}
                  detectionModel={detectionModel}
                  embedded
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {selectedDetections.size > 0
              ? `${selectedDetections.size} of ${detections.length} selected`
              : `${detections.length} detection${detections.length !== 1 ? "s" : ""}`}
          </span>

          <div className="hidden items-center gap-1.5 md:flex">
            {detections.some((d) => d.severity === "critical") && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                {detections.filter((d) => d.severity === "critical").length}{" "}
                Critical
              </span>
            )}
            {detections.some((d) => d.severity === "major") && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
                {detections.filter((d) => d.severity === "major").length} Major
              </span>
            )}
            {detections.some((d) => d.severity === "minor") && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                {detections.filter((d) => d.severity === "minor").length} Minor
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogIncidents}
            disabled={detections.length === 0}
            className={`
              flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors
              ${
                detections.length === 0
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }
            `}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {selectedDetections.size > 0
              ? `Log ${selectedDetections.size} Incident${selectedDetections.size !== 1 ? "s" : ""}`
              : "Log as Incident"}
          </button>
        </div>
      </div>
    </div>
  );
}
