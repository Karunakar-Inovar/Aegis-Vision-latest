import config from "app/config";
import type {
  DetectionRequest,
  DetectionResult,
  IncidentDraft,
  IncidentResponse,
  MediaType,
  ModelInfo,
  UploadResponse,
  VideoAnalysisProgress,
  VideoAnalysisRequest,
  VideoAnalysisResult,
} from "./types";

const CHATBOT_BASE = "/api/chatbot";
const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // 100 MB
export const VIDEO_MAX_DURATION_SEC = 300; // 5 minutes

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/bmp",
  "image/tiff",
];
const VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // mov
  "video/webm",
  "video/x-msvideo", // avi
];

// --- Error classes ---
export class ChatbotApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = "ChatbotApiError";
  }
}

export class ChatbotValidationError extends ChatbotApiError {
  constructor(message: string) {
    super(message);
    this.name = "ChatbotValidationError";
  }
}

// --- Helpers ---

export function validateMediaFile(
  file: File
): { valid: boolean; error?: string; mediaType: MediaType } {
  const mediaType: MediaType = VIDEO_TYPES.includes(file.type)
    ? "video"
    : IMAGE_TYPES.includes(file.type)
      ? "image"
      : "image"; // fallback for validation failure

  if (!IMAGE_TYPES.includes(file.type) && !VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Allowed: images (jpg, jpeg, png, bmp, tiff), videos (mp4, mov, webm, avi).`,
      mediaType: "image",
    };
  }

  const maxBytes = mediaType === "video" ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  if (file.size > maxBytes) {
    const maxLabel = mediaType === "video" ? "100 MB" : "10 MB";
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum (${maxLabel}).`,
      mediaType,
    };
  }

  return { valid: true, mediaType };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return config.apiUrl?.replace(/\/api\/?$/, "") || "";
  }
  return "";
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "error" in body
        ? String((body as { error?: string }).error)
        : null) ||
      res.statusText ||
      `Request failed with status ${res.status}`;
    throw new ChatbotApiError(msg, res.status, body);
  }

  return body as T;
}

// --- API methods ---

export async function uploadMedia(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new ChatbotValidationError(validation.error!);
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${CHATBOT_BASE}/upload`;

  return new Promise<UploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadResponse;
          resolve(data);
        } catch {
          reject(
            new ChatbotApiError(
              "Invalid response from upload endpoint",
              xhr.status,
              xhr.responseText
            )
          );
        }
      } else {
        let body: unknown;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          body = xhr.responseText;
        }
        const msg =
          body &&
          typeof body === "object" &&
          "error" in body
            ? String((body as { error?: string }).error)
            : xhr.statusText || `Upload failed (${xhr.status})`;
        reject(new ChatbotApiError(msg, xhr.status, body));
      }
    });

    xhr.addEventListener("error", () => {
      reject(
        new ChatbotApiError(
          "Network error: unable to reach upload endpoint. Check your connection."
        )
      );
    });

    xhr.addEventListener("abort", () => {
      reject(new ChatbotApiError("Upload was aborted"));
    });

    xhr.open("POST", url);
    xhr.send(formData);
  });
}

export async function detectDefects(
  request: DetectionRequest
): Promise<DetectionResult> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${CHATBOT_BASE}/detect`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  return handleResponse<DetectionResult>(res);
}

export async function analyzeVideo(
  request: VideoAnalysisRequest
): Promise<{ jobId: string }> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${CHATBOT_BASE}/analyze-video`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  return handleResponse<{ jobId: string }>(res);
}

export async function getVideoAnalysisStatus(
  jobId: string
): Promise<VideoAnalysisProgress> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${CHATBOT_BASE}/analyze-video?jobId=${encodeURIComponent(jobId)}`;

  const res = await fetch(url, { method: "GET" });
  return handleResponse<VideoAnalysisProgress>(res);
}

export async function getVideoAnalysisResult(
  jobId: string
): Promise<VideoAnalysisResult> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${CHATBOT_BASE}/analyze-video?jobId=${encodeURIComponent(jobId)}&result=true`;

  const res = await fetch(url, { method: "GET" });
  return handleResponse<VideoAnalysisResult>(res);
}

export async function createIncident(
  draft: IncidentDraft
): Promise<IncidentResponse> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${CHATBOT_BASE}/incident`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });

  return handleResponse<IncidentResponse>(res);
}

export async function getAvailableModels(): Promise<ModelInfo[]> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${CHATBOT_BASE}/models`;

  const res = await fetch(url, { method: "GET" });
  return handleResponse<ModelInfo[]>(res);
}
