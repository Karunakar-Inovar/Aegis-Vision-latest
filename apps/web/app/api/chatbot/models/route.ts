import { NextResponse } from "next/server";
import type { ModelInfo } from "@/services/chatbot/types";

const MOCK_MODELS: ModelInfo[] = [
  {
    id: "model-scratch-v2",
    name: "Scratch Detector",
    version: "2.1.0",
    type: "Scratch Detection",
    deployedOn: "Line 3 • Camera 07",
    lastUpdated: "2025-02-28",
  },
  {
    id: "model-dent-v1",
    name: "Dent Classifier",
    version: "1.4.2",
    type: "Dent Detection",
    deployedOn: "Line 1 • Camera 03",
    lastUpdated: "2025-03-01",
  },
  {
    id: "model-crack-v3",
    name: "Crack Analyzer",
    version: "3.0.1",
    type: "Crack Detection",
    deployedOn: "Line 2 • Camera 05",
    lastUpdated: "2025-02-15",
  },
  {
    id: "model-surface-v1",
    name: "Surface Anomaly",
    version: "1.0.0",
    type: "Surface Inspection",
    deployedOn: "Line 4 • Camera 12",
    lastUpdated: "2025-03-02",
  },
];

export async function GET() {
  await new Promise((r) => setTimeout(r, 200));
  console.log("[Chatbot Mock] GET /api/chatbot/models — 4 models");
  return NextResponse.json(MOCK_MODELS);
}
