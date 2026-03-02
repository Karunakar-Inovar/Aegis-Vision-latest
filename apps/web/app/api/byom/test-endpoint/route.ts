import { NextRequest, NextResponse } from "next/server";

interface TestEndpointBody {
  url: string;
  authType: "none" | "api-key" | "bearer";
  apiKey?: string;
  bearerToken?: string;
  timeoutMs?: number;
}

interface TestCheck {
  key: string;
  label: string;
  description: string;
  passed: boolean;
  fixMessage: string | null;
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * POST /api/byom/test-endpoint
 *
 * Accepts a target URL + auth config, simulates an HTTP round-trip to the
 * inference endpoint, and returns structured validation checks, a mock
 * latency measurement, and a sample inference output payload.
 *
 * In production this would actually fetch the URL; for now the response is
 * fully mocked so the frontend can be developed without a live backend.
 */
export async function POST(req: NextRequest) {
  let body: TestEndpointBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { url, authType, apiKey, bearerToken, timeoutMs = 30_000 } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: '"url" is required' },
      { status: 400 },
    );
  }

  const validUrl = isValidUrl(url);
  const authOk =
    authType === "none" ||
    (authType === "api-key" && !!apiKey?.trim()) ||
    (authType === "bearer" && !!bearerToken?.trim());
  const timeoutOk = timeoutMs > 0 && timeoutMs <= 120_000;

  // Simulate network latency (80 – 180 ms)
  const simulatedLatencyMs = Math.round(80 + Math.random() * 100);
  await new Promise((r) => setTimeout(r, simulatedLatencyMs));

  const reachable = validUrl;
  const httpStatus = reachable ? 200 : 0;
  const responseOk = reachable && httpStatus === 200;

  const checks: TestCheck[] = [
    {
      key: "url_valid",
      label: "URL Valid",
      description: validUrl
        ? `${url} — well-formed HTTPS endpoint`
        : `"${url}" is not a valid HTTP/HTTPS URL`,
      passed: validUrl,
      fixMessage: validUrl
        ? null
        : "Provide a URL starting with https:// (or http:// for local dev)",
    },
    {
      key: "auth_configured",
      label: "Auth Configured",
      description:
        authType === "none"
          ? "No authentication required"
          : authOk
            ? `${authType === "api-key" ? "API Key" : "Bearer Token"} provided`
            : `${authType === "api-key" ? "API Key" : "Bearer Token"} is missing`,
      passed: authOk,
      fixMessage: authOk
        ? null
        : `Enter a valid ${authType === "api-key" ? "API key" : "bearer token"}`,
    },
    {
      key: "timeout_valid",
      label: "Timeout Valid",
      description: timeoutOk
        ? `${timeoutMs.toLocaleString()} ms — within acceptable range`
        : `${timeoutMs} ms is out of the 1 – 120 000 ms range`,
      passed: timeoutOk,
      fixMessage: timeoutOk
        ? null
        : "Set timeout between 1 ms and 120 000 ms",
    },
    {
      key: "endpoint_reachable",
      label: "Endpoint Reachable",
      description: reachable
        ? `HTTP ${httpStatus} in ${simulatedLatencyMs} ms`
        : "Could not reach the endpoint",
      passed: reachable,
      fixMessage: reachable
        ? null
        : "Verify the URL is correct and the server is running",
    },
    {
      key: "response_schema",
      label: "Response Schema Valid",
      description: responseOk
        ? "Response conforms to AegisVision inference contract"
        : "Cannot validate — endpoint unreachable",
      passed: responseOk,
      fixMessage: responseOk
        ? null
        : "Ensure the endpoint returns { predictions, confidence, latency }",
    },
  ];

  const allPassed = checks.every((c) => c.passed);

  const sampleOutput = responseOk
    ? {
        predictions: [
          { label: "hardhat", confidence: 0.96, bbox: [120, 45, 280, 190] },
          { label: "vest", confidence: 0.91, bbox: [100, 180, 310, 420] },
        ],
        model: "external-inference-v1",
        processingMs: simulatedLatencyMs,
      }
    : null;

  return NextResponse.json({
    success: allPassed,
    latencyMs: simulatedLatencyMs,
    httpStatus,
    checks,
    sampleOutput,
  });
}
