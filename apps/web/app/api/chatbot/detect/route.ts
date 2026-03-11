import { NextRequest, NextResponse } from "next/server";
import type {
  Defect,
  DetectionRequest,
  DetectionResult,
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

function getSeverity(confidence: number): "critical" | "major" | "minor" {
  if (confidence > 0.9) return "critical";
  if (confidence > 0.8) return "major";
  return "minor";
}

function generateDefects(
  modelId: string,
  count: number
): Defect[] {
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

export async function POST(req: NextRequest) {
  let body: DetectionRequest;
  try {
    body = await req.json();
  } catch {
    console.log("[Chatbot Mock] POST /api/chatbot/detect — invalid JSON");
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { fileId, modelId } = body;
  if (!fileId || !modelId) {
    console.log("[Chatbot Mock] POST /api/chatbot/detect — missing fileId or modelId");
    return NextResponse.json(
      { error: "fileId and modelId are required" },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 2500));

  const roll = Math.random();
  let defectCount: number;
  if (roll < 0.65) defectCount = 1 + Math.floor(Math.random() * 3);
  else if (roll < 0.9) defectCount = 0;
  else defectCount = 4 + Math.floor(Math.random() * 3);

  const defects = defectCount > 0 ? generateDefects(modelId, defectCount) : [];
  const bySeverity = {
    critical: defects.filter((d) => d.severity === "critical").length,
    major: defects.filter((d) => d.severity === "major").length,
    minor: defects.filter((d) => d.severity === "minor").length,
  };

  const model = MODEL_LOOKUP[modelId] ?? MODEL_LOOKUP["model-surface-v1"];
  const inferenceTimeMs = Math.floor(180 + Math.random() * 270);

  const result: DetectionResult = {
    annotatedImageUrl: `https://placeholder.aegisvision.io/annotated/${fileId}`,
    originalImageUrl: `https://placeholder.aegisvision.io/files/${fileId}`,
    defects,
    summary: {
      totalDefects: defects.length,
      bySeverity,
      passRate: defectCount === 0 ? 100 : Math.round((1 - defectCount / 6) * 100),
    },
    modelInfo: {
      modelName: model.name,
      modelVersion: model.version,
      inferenceTimeMs,
    },
    timestamp: new Date().toISOString(),
  };

  console.log(
    "[Chatbot Mock] POST /api/chatbot/detect —",
    fileId,
    modelId,
    defectCount,
    "defects"
  );
  return NextResponse.json(result);
}
