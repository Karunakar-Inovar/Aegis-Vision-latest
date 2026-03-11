import { NextRequest, NextResponse } from "next/server";
import type { IncidentDraft, IncidentResponse } from "@/services/chatbot/types";

const REQUIRED_FIELDS = [
  "defectType",
  "severity",
  "confidence",
  "sourceType",
  "sourceFileId",
  "annotatedImageUrl",
  "modelId",
  "timestamp",
] as const;

function validateDraft(body: Record<string, unknown>): string | null {
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null) {
      return `Missing required field: ${field}`;
    }
  }
  if (typeof body.defectType !== "string" || !body.defectType.trim()) {
    return "defectType must be a non-empty string";
  }
  if (!["critical", "major", "minor"].includes(String(body.severity))) {
    return "severity must be critical, major, or minor";
  }
  if (
    typeof body.confidence !== "number" ||
    body.confidence < 0 ||
    body.confidence > 1
  ) {
    return "confidence must be a number between 0 and 1";
  }
  if (
    !["chatbot-image", "chatbot-video-frame"].includes(String(body.sourceType))
  ) {
    return "sourceType must be chatbot-image or chatbot-video-frame";
  }
  return null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    console.log("[Chatbot Mock] POST /api/chatbot/incident — invalid JSON");
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const error = validateDraft(body);
  if (error) {
    console.log("[Chatbot Mock] POST /api/chatbot/incident — validation:", error);
    return NextResponse.json({ error }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 800));

  const incidentId = `INC-${Math.floor(100000 + Math.random() * 900000)}`;
  const createdAt = new Date().toISOString();

  const response: IncidentResponse = {
    incidentId,
    status: "created",
    createdAt,
    link: `/incidents/${incidentId}`,
  };

  console.log(
    "[Chatbot Mock] POST /api/chatbot/incident — created:",
    incidentId,
    (body as IncidentDraft).defectType
  );
  return NextResponse.json(response);
}
