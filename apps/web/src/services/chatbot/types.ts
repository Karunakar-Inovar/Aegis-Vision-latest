// === Message Types ===
export type ChatMessageType =
  | "text"
  | "image"
  | "video"
  | "detection-result"
  | "video-report"
  | "video-analysis-progress"
  | "incident-card"
  | "log-all-confirmation"
  | "model-select"
  | "model-confirmation"
  | "api-error";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string; // ISO
  type: ChatMessageType;
  metadata?: Record<string, unknown>;
}

// === Upload ===
export type MediaType = "image" | "video";

export interface UploadResponse {
  fileId: string;
  fileUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  mediaType: MediaType;
  duration?: number; // seconds, only for video
}

// === Image Detection ===
export interface DetectionRequest {
  fileId: string;
  modelId: string;
  confidenceThreshold?: number; // default 0.5
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
} // normalized 0-1

export interface Defect {
  id: string;
  type: string; // e.g., "Scratch", "Dent", "Crack"
  confidence: number; // 0-1
  severity: "critical" | "major" | "minor";
  boundingBox: BoundingBox;
}

export interface DefectsBySeverity {
  critical: number;
  major: number;
  minor: number;
}

export interface DetectionResult {
  annotatedImageUrl: string;
  originalImageUrl: string;
  defects: Defect[];
  summary: {
    totalDefects: number;
    bySeverity: DefectsBySeverity;
    passRate: number;
  };
  modelInfo: {
    modelName: string;
    modelVersion: string;
    inferenceTimeMs: number;
  };
  timestamp: string;
}

// === Video Analysis ===
export interface VideoAnalysisRequest {
  fileId: string;
  modelId: string;
  confidenceThreshold?: number;
  frameInterval?: number; // seconds between frame extractions, default 2
}

export interface FlaggedFrame {
  frameNumber: number;
  timestamp: string; // e.g., "0:14"
  thumbnailUrl: string;
  annotatedThumbnailUrl: string;
  defects: Defect[];
}

export interface VideoAnalysisResult {
  totalFramesAnalyzed: number;
  clipDuration: string; // e.g., "2:34"
  defectsSummary: {
    total: number;
    bySeverity: DefectsBySeverity;
    byType: Record<string, number>; // e.g., { "Scratch": 5, "Dent": 2 }
  };
  flaggedFrames: FlaggedFrame[];
  timeline: Array<{ timestamp: string; defectCount: number }>; // for mini chart
  modelInfo: {
    modelName: string;
    modelVersion: string;
  };
  processingTimeMs: number;
}

export interface VideoAnalysisProgress {
  stage:
    | "uploading"
    | "extracting-frames"
    | "detecting"
    | "generating-report"
    | "complete"
    | "error";
  progress: number; // 0-100
  currentFrame?: number;
  totalFrames?: number;
  message: string; // human-readable status
}

// === Incident ===
export interface IncidentDraft {
  defectType: string;
  severity: "critical" | "major" | "minor";
  confidence: number;
  sourceType: "chatbot-image" | "chatbot-video-frame";
  sourceFileId: string;
  annotatedImageUrl: string;
  modelId: string;
  frameTimestamp?: string; // only for video frame sources
  notes?: string;
  timestamp: string;
}

export interface IncidentResponse {
  incidentId: string;
  status: "created";
  createdAt: string;
  link: string;
}

// === Model ===
export interface ModelInfo {
  id: string;
  name: string;
  version: string;
  type: string;
  deployedOn: string;
  lastUpdated: string;
}

// === Chatbot State ===
export interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  selectedModelId: string | null;
  uploadProgress: {
    active: boolean;
    progress: number;
    fileName: string;
    mediaType: MediaType;
    fileSize?: number;
  } | null;
  videoAnalysisProgress: VideoAnalysisProgress | null;
}
