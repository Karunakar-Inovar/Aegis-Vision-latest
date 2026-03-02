import { z } from "zod";

const AEGIS_API_URL = process.env.AEGIS_API_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getAlertsSchema = z.object({
  cameraId: z.string().optional(),
  severity: z
    .enum(["critical", "high", "medium", "low", "all"])
    .default("all"),
  limit: z.number().int().positive().default(10),
});

export const getCameraFeedSchema = z.object({
  cameraId: z.string(),
});

export const acknowledgeAlertSchema = z.object({
  alertId: z.string(),
  operatorNote: z.string().optional(),
});

export const getIncidentHistorySchema = z.object({
  cameraId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

export type GetAlertsParams = z.infer<typeof getAlertsSchema>;
export type GetCameraFeedParams = z.infer<typeof getCameraFeedSchema>;
export type AcknowledgeAlertParams = z.infer<typeof acknowledgeAlertSchema>;
export type GetIncidentHistoryParams = z.infer<
  typeof getIncidentHistorySchema
>;

type ToolResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Tool functions
// ---------------------------------------------------------------------------

export async function getAlerts(
  raw: unknown,
): Promise<ToolResult> {
  const parsed = getAlertsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { cameraId, severity, limit } = parsed.data;
  const params = new URLSearchParams();
  if (cameraId) params.set("cameraId", cameraId);
  if (severity !== "all") params.set("severity", severity);
  params.set("limit", String(limit));

  const res = await fetch(`${AEGIS_API_URL}/alerts?${params}`);
  if (!res.ok) {
    return { success: false, error: `GET /alerts failed (${res.status})` };
  }
  return { success: true, data: await res.json() };
}

export async function getCameraFeed(
  raw: unknown,
): Promise<ToolResult> {
  const parsed = getCameraFeedSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { cameraId } = parsed.data;
  const res = await fetch(`${AEGIS_API_URL}/cameras/${cameraId}/feed`);
  if (!res.ok) {
    return {
      success: false,
      error: `GET /cameras/${cameraId}/feed failed (${res.status})`,
    };
  }
  return { success: true, data: await res.json() };
}

export async function acknowledgeAlert(
  raw: unknown,
): Promise<ToolResult> {
  const parsed = acknowledgeAlertSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { alertId, operatorNote } = parsed.data;
  const res = await fetch(`${AEGIS_API_URL}/alerts/${alertId}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: operatorNote }),
  });
  if (!res.ok) {
    return {
      success: false,
      error: `POST /alerts/${alertId}/acknowledge failed (${res.status})`,
    };
  }
  return { success: true, data: await res.json() };
}

export async function getIncidentHistory(
  raw: unknown,
): Promise<ToolResult> {
  const parsed = getIncidentHistorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { cameraId, startTime, endTime } = parsed.data;
  const params = new URLSearchParams();
  if (cameraId) params.set("cameraId", cameraId);
  params.set("startTime", startTime);
  params.set("endTime", endTime);

  const res = await fetch(`${AEGIS_API_URL}/incidents?${params}`);
  if (!res.ok) {
    return {
      success: false,
      error: `GET /incidents failed (${res.status})`,
    };
  }
  return { success: true, data: await res.json() };
}

// ---------------------------------------------------------------------------
// Registry map — convenient for dynamic OpenAI tool registration
// ---------------------------------------------------------------------------

export const aegisToolSchemas = {
  getAlerts: getAlertsSchema,
  getCameraFeed: getCameraFeedSchema,
  acknowledgeAlert: acknowledgeAlertSchema,
  getIncidentHistory: getIncidentHistorySchema,
} as const;

export const aegisToolFunctions = {
  getAlerts,
  getCameraFeed,
  acknowledgeAlert,
  getIncidentHistory,
} as const;
