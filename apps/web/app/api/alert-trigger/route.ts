import { NextResponse } from "next/server";
import OpenAI from "openai";

console.log("[alert-trigger/route] THESYS_API_KEY:", process.env.THESYS_API_KEY ? "KEY: set" : "KEY: missing");
console.log("[alert-trigger/route] AEGIS_API_URL:", process.env.AEGIS_API_URL ?? "(not set)");

const SYSTEM_PROMPT = `You are AegisVision's alert renderer. Generate a compact, urgent incident card UI.
<ui_rules>
- Render severity badge, camera ID, alert type, timestamp, thumbnail (as image), description.
- Critical: red pulsing border. High: orange border. Medium: yellow. Low: blue.
- Include buttons: Acknowledge, View Camera, Escalate to Supervisor.
- Keep the card compact — it appears as a floating overlay on the operator dashboard.
</ui_rules>`;

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed/",
  apiKey: process.env.THESYS_API_KEY,
});

const VALID_SEVERITIES = ["critical", "high", "medium", "low"] as const;

interface AlertPayload {
  alertId: string;
  cameraId: string;
  severity: (typeof VALID_SEVERITIES)[number];
  type: string;
  timestamp: string;
  thumbnailUrl?: string;
  description: string;
  location?: string;
}

function validatePayload(
  body: unknown
): { valid: true; data: AlertPayload } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const b = body as Record<string, unknown>;
  const missing: string[] = [];

  if (!b.alertId || typeof b.alertId !== "string") missing.push("alertId");
  if (!b.cameraId || typeof b.cameraId !== "string") missing.push("cameraId");
  if (!b.severity || !VALID_SEVERITIES.includes(b.severity as any))
    missing.push("severity (must be critical | high | medium | low)");
  if (!b.type || typeof b.type !== "string") missing.push("type");
  if (!b.timestamp || typeof b.timestamp !== "string")
    missing.push("timestamp");
  if (!b.description || typeof b.description !== "string")
    missing.push("description");

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing or invalid fields: ${missing.join(", ")}`,
    };
  }

  return { valid: true, data: body as AlertPayload };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const result = validatePayload(body);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const response = await client.chat.completions.create({
      model: "c1-nightly",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(result.data) },
      ],
    });

    return NextResponse.json({
      c1Response: response.choices[0]?.message?.content ?? null,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Thesys API call failed";
    console.error("[alert-trigger] Thesys API error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
