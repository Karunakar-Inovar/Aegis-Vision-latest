import { NextRequest, NextResponse } from "next/server";
import type {
  Defect,
  FlaggedFrame,
  VideoAnalysisProgress,
  VideoAnalysisRequest,
  VideoAnalysisResult,
} from "@/services/chatbot/types";

const MODEL_LOOKUP: Record<
  string,
  { name: string; version: string; defectTypes: string[] }
> = {
  "model-scratch-v2": {
    name: "Scratch Detector",
    version: "2.1.0",
    defectTypes: ["Scratch", "Surface Scratch", "Deep Scratch"],
  },
  "model-dent-v1": {
    name: "Dent Classifier",
    version: "1.4.2",
    defectTypes: ["Dent", "Minor Dent", "Major Dent"],
  },
  "model-crack-v3": {
    name: "Crack Analyzer",
    version: "3.0.1",
    defectTypes: ["Crack", "Hairline Crack", "Structural Crack"],
  },
  "model-surface-v1": {
    name: "Surface Anomaly",
    version: "1.0.0",
    defectTypes: ["Scratch", "Dent", "Crack", "Discoloration", "Pitting"],
  },
};

interface JobState {
  progress: VideoAnalysisProgress;
  result?: VideoAnalysisResult;
  fileId: string;
  modelId: string;
  clipDuration?: string;
}

const jobStore = new Map<string, JobState>();

function getSeverity(confidence: number): "critical" | "major" | "minor" {
  if (confidence > 0.9) return "critical";
  if (confidence > 0.8) return "major";
  return "minor";
}

function generateDefects(modelId: string, count: number): Defect[] {
  const model = MODEL_LOOKUP[modelId] ?? MODEL_LOOKUP["model-surface-v1"];
  const defects: Defect[] = [];

  for (let i = 0; i < count; i++) {
    const confidence = 0.72 + Math.random() * 0.27;
    const type =
      model.defectTypes[Math.floor(Math.random() * model.defectTypes.length)];
    const size = 0.05 + Math.random() * 0.25;
    defects.push({
      id: crypto.randomUUID(),
      type,
      confidence: Math.round(confidence * 100) / 100,
      severity: getSeverity(confidence),
      boundingBox: {
        x: Math.random() * (1 - size),
        y: Math.random() * (1 - size),
        width: size,
        height: size,
      },
    });
  }

  return defects;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseTimestamp(ts: string): number {
  const [m, s] = ts.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

function buildVideoAnalysisResult(
  jobId: string,
  fileId: string,
  modelId: string,
  clipDuration: string
): VideoAnalysisResult {
  const model = MODEL_LOOKUP[modelId] ?? MODEL_LOOKUP["model-surface-v1"];
  const totalFramesAnalyzed = 30 + Math.floor(Math.random() * 61);
  const flaggedCount = 3 + Math.floor(Math.random() * 6);

  const flaggedFrames: FlaggedFrame[] = [];
  const byType: Record<string, number> = {};
  let totalCritical = 0;
  let totalMajor = 0;
  let totalMinor = 0;

  const durationParts = clipDuration.split(":").map(Number);
  const totalSeconds =
    (durationParts[0] || 0) * 60 + (durationParts[1] || 0) || 90;
  const step = totalSeconds / (flaggedCount + 1);

  for (let i = 0; i < flaggedCount; i++) {
    const frameTime = Math.floor(step * (i + 1));
    const defectCount = 1 + Math.floor(Math.random() * 3);
    const defects = generateDefects(modelId, defectCount);

    defects.forEach((d) => {
      byType[d.type] = (byType[d.type] ?? 0) + 1;
      if (d.severity === "critical") totalCritical++;
      else if (d.severity === "major") totalMajor++;
      else totalMinor++;
    });

    flaggedFrames.push({
      frameNumber: Math.floor((frameTime / totalSeconds) * totalFramesAnalyzed),
      timestamp: formatTimestamp(frameTime),
      thumbnailUrl: `https://placeholder.aegisvision.io/video/${fileId}/frame-${i}`,
      annotatedThumbnailUrl: `https://placeholder.aegisvision.io/video/${fileId}/frame-${i}-annotated`,
      defects,
    });
  }

  const timelinePoints = 10 + Math.floor(Math.random() * 6);
  const timeline: Array<{ timestamp: string; defectCount: number }> = [];

  for (let i = 0; i < timelinePoints; i++) {
    const t = (totalSeconds * i) / Math.max(1, timelinePoints - 1);
    const ts = formatTimestamp(t);
    const frame = flaggedFrames.find(
      (f) => Math.abs(parseTimestamp(f.timestamp) - t) < 3
    );
    timeline.push({
      timestamp: ts,
      defectCount: frame ? frame.defects.length : 0,
    });
  }

  return {
    totalFramesAnalyzed,
    clipDuration,
    defectsSummary: {
      total: totalCritical + totalMajor + totalMinor,
      bySeverity: {
        critical: totalCritical,
        major: totalMajor,
        minor: totalMinor,
      },
      byType,
    },
    flaggedFrames,
    timeline,
    modelInfo: { modelName: model.name, modelVersion: model.version },
    processingTimeMs: 6000 + Math.floor(Math.random() * 6000),
  };
}

export async function POST(req: NextRequest) {
  let body: VideoAnalysisRequest;
  try {
    body = await req.json();
  } catch {
    console.log("[Chatbot Mock] POST /api/chatbot/analyze-video — invalid JSON");
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { fileId, modelId } = body;
  if (!fileId || !modelId) {
    console.log(
      "[Chatbot Mock] POST /api/chatbot/analyze-video — missing fileId or modelId"
    );
    return NextResponse.json(
      { error: "fileId and modelId are required" },
      { status: 400 }
    );
  }

  const jobId = crypto.randomUUID();
  const clipDuration =
    Math.random() > 0.5
      ? `${1 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`
      : "1:30";

  const progress: VideoAnalysisProgress = {
    stage: "extracting-frames",
    progress: 10,
    message: "Extracting key frames from video...",
  };

  jobStore.set(jobId, {
    progress,
    fileId,
    modelId,
    clipDuration,
  });

  setTimeout(() => {
    const job = jobStore.get(jobId);
    if (!job) return;
    job.progress = {
      stage: "detecting",
      progress: 30,
      currentFrame: 5,
      totalFrames: 45,
      message: "Running defect detection on frames...",
    };
  }, 2000);

  setTimeout(() => {
    const job = jobStore.get(jobId);
    if (!job) return;
    job.progress = {
      stage: "detecting",
      progress: 60,
      currentFrame: 28,
      totalFrames: 45,
      message: "Running defect detection on frames...",
    };
  }, 4000);

  setTimeout(() => {
    const job = jobStore.get(jobId);
    if (!job) return;
    job.progress = {
      stage: "generating-report",
      progress: 85,
      message: "Generating analysis report...",
    };
  }, 6000);

  setTimeout(() => {
    const job = jobStore.get(jobId);
    if (!job) return;
    const result = buildVideoAnalysisResult(
      jobId,
      job.fileId,
      job.modelId,
      job.clipDuration ?? "1:30"
    );
    job.progress = {
      stage: "complete",
      progress: 100,
      message: "Analysis complete",
    };
    job.result = result;
  }, 8000);

  console.log(
    "[Chatbot Mock] POST /api/chatbot/analyze-video — jobId:",
    jobId,
    "fileId:",
    fileId
  );
  return NextResponse.json({ jobId });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const wantResult = searchParams.get("result") === "true";

  if (!jobId) {
    console.log("[Chatbot Mock] GET /api/chatbot/analyze-video — missing jobId");
    return NextResponse.json(
      { error: "jobId query parameter is required" },
      { status: 400 }
    );
  }

  const job = jobStore.get(jobId);
  if (!job) {
    console.log("[Chatbot Mock] GET /api/chatbot/analyze-video — job not found:", jobId);
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  if (wantResult) {
    if (job.progress.stage !== "complete" || !job.result) {
      console.log(
        "[Chatbot Mock] GET /api/chatbot/analyze-video — result not ready:",
        jobId
      );
      return NextResponse.json(
        { error: "Analysis not complete. Poll status first." },
        { status: 400 }
      );
    }
    console.log("[Chatbot Mock] GET /api/chatbot/analyze-video?result=true —", jobId);
    return NextResponse.json(job.result);
  }

  console.log("[Chatbot Mock] GET /api/chatbot/analyze-video — status:", jobId);
  return NextResponse.json(job.progress);
}
