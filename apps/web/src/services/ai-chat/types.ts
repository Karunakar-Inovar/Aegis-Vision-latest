/**
 * AI Chat message and attachment types for the full-page vision AI interface.
 */

/** Detection model types: AegisVision trained models + Custom for general vision AI */
export const DETECTION_MODEL_TYPES = [
  { value: "ppe", label: "PPE Compliance", description: "Detect safety gear (helmet, vest, goggles)" },
  { value: "smoke", label: "Smoke & Fire", description: "Detect smoke, fire, or hazardous fumes" },
  { value: "scratch", label: "Scratch Detection", description: "Surface scratches and defects" },
  { value: "defect", label: "General Defects", description: "Quality defects, dents, anomalies" },
  { value: "custom", label: "Custom / General", description: "Ask anything — uses general vision AI" },
] as const;

export type DetectionModelType = (typeof DETECTION_MODEL_TYPES)[number]["value"];

export interface Attachment {
  id: string;
  type: "image" | "video";
  fileName: string;
  fileSize: number;
  localUrl: string;
  fileId?: string;
  uploadStatus: "pending" | "uploading" | "uploaded" | "failed";
  uploadProgress?: number;
}

export interface MessageAction {
  label: string;
  type: "log-incident" | "export-pdf" | "view-details" | "retry";
  payload?: unknown;
}

export interface ChatMessageMetadata {
  annotatedImageUrl?: string;
  defects?: Array<{
    id: string;
    type: string;
    confidence: number;
    severity: "critical" | "major" | "minor";
    boundingBox?: { x: number; y: number; width: number; height: number };
  }>;
  summary?: {
    totalDefects?: number;
    passRate?: number;
    [key: string]: unknown;
  };
  actions?: MessageAction[];
  processingTimeMs?: number;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  metadata?: ChatMessageMetadata;
}

export interface AttachedFile {
  id: string;
  file: File;
  type: "image" | "video";
  fileName: string;
  fileSize: number;
  localUrl: string;
}
