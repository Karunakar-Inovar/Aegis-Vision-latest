import { NextRequest, NextResponse } from "next/server";

/**
 * Mock AI Chat endpoint — simulates general-purpose vision AI and detection model responses.
 * In production, this would integrate with OpenAI Vision, Gemini, or trained detection models.
 */

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface HistoryMessage {
  role: string;
  content: string;
  attachments?: Array<unknown>;
}

interface DetectionResult {
  id: string;
  label: string;
  confidence: number;
  severity: "critical" | "major" | "minor" | "info";
  boundingBox: { x: number; y: number; width: number; height: number };
  description?: string;
}

function generateDetectionResults(
  detectionModel: string,
  _message: string
): {
  textResponse: string;
  detections: DetectionResult[];
  modelName: string;
  processingTime: number;
} | null {
  const processingTime = 200 + Math.floor(Math.random() * 300);

  switch (detectionModel) {
    case "ppe-detection":
      return {
        modelName: "PPE Kit Detection v2.1",
        processingTime,
        textResponse:
          "I've analyzed the image using the **PPE Kit Detection** model. Here are the results:\n\n**Compliance Score: 75%**\n\n4 out of 6 workers are fully compliant. 2 workers have missing safety equipment that needs immediate attention.",
        detections: [
          {
            id: "d1",
            label: "Missing Goggles",
            confidence: 0.94,
            severity: "major",
            boundingBox: { x: 0.15, y: 0.2, width: 0.12, height: 0.2 },
            description: "Worker near station E not wearing safety goggles",
          },
          {
            id: "d2",
            label: "Missing Ear Protection",
            confidence: 0.87,
            severity: "major",
            boundingBox: { x: 0.6, y: 0.15, width: 0.14, height: 0.25 },
            description: "Worker near machinery without ear protection",
          },
          {
            id: "d3",
            label: "Hard Hat ✓",
            confidence: 0.98,
            severity: "info",
            boundingBox: { x: 0.3, y: 0.1, width: 0.1, height: 0.12 },
            description: "All workers wearing hard hats correctly",
          },
          {
            id: "d4",
            label: "Hi-Vis Vest ✓",
            confidence: 0.96,
            severity: "info",
            boundingBox: { x: 0.35, y: 0.3, width: 0.15, height: 0.2 },
            description: "All workers wearing high-visibility vests",
          },
        ],
      };

    case "fire-smoke-detection":
      return {
        modelName: "Fire & Smoke Detection v3.0",
        processingTime,
        textResponse:
          "I've analyzed the image using the **Fire & Smoke Detection** model.\n\n**Alert Level: ⚠️ Warning**\n\nSmoke-like patterns detected in one region. Recommend immediate visual verification by on-site personnel.",
        detections: [
          {
            id: "d1",
            label: "Smoke Detected",
            confidence: 0.82,
            severity: "critical",
            boundingBox: { x: 0.55, y: 0.05, width: 0.3, height: 0.25 },
            description:
              "Smoke-like haze detected in upper-right area of the image",
          },
          {
            id: "d2",
            label: "Heat Source",
            confidence: 0.71,
            severity: "major",
            boundingBox: { x: 0.6, y: 0.2, width: 0.15, height: 0.15 },
            description: "Possible heat source identified beneath smoke region",
          },
        ],
      };

    case "scratch-detection":
      return {
        modelName: "Scratch Detection v2.1",
        processingTime,
        textResponse:
          "I've inspected the image using the **Scratch Detection** model.\n\n**Quality Score: 72/100**\n\n2 scratches detected on the surface. The major scratch may affect product aesthetics and should be reviewed.",
        detections: [
          {
            id: "d1",
            label: "Scratch",
            confidence: 0.94,
            severity: "major",
            boundingBox: { x: 0.1, y: 0.15, width: 0.25, height: 0.08 },
            description:
              "Linear scratch, ~3.2cm length, surface-level, does not penetrate coating",
          },
          {
            id: "d2",
            label: "Scratch",
            confidence: 0.78,
            severity: "minor",
            boundingBox: { x: 0.5, y: 0.6, width: 0.15, height: 0.05 },
            description:
              "Hairline scratch, ~1cm, barely visible, within acceptable tolerance",
          },
        ],
      };

    case "dent-detection":
      return {
        modelName: "Dent Detection v1.4",
        processingTime,
        textResponse:
          "I've analyzed the image using the **Dent Detection** model.\n\n**Quality Score: 85/100**\n\n1 minor dent detected. Within acceptable tolerance for this product category.",
        detections: [
          {
            id: "d1",
            label: "Dent",
            confidence: 0.82,
            severity: "minor",
            boundingBox: { x: 0.45, y: 0.4, width: 0.12, height: 0.1 },
            description:
              "Shallow dent, ~1.5cm diameter, minimal surface deformation",
          },
        ],
      };

    case "crack-detection":
      return {
        modelName: "Crack Detection v3.0",
        processingTime,
        textResponse:
          "I've inspected the image using the **Crack Detection** model.\n\n**Structural Risk: 🔴 High**\n\n2 cracks detected. The major crack requires immediate attention and may indicate structural fatigue.",
        detections: [
          {
            id: "d1",
            label: "Crack",
            confidence: 0.96,
            severity: "critical",
            boundingBox: { x: 0.2, y: 0.3, width: 0.3, height: 0.04 },
            description:
              "Major crack, ~4.5cm, extends through surface layer, signs of propagation",
          },
          {
            id: "d2",
            label: "Micro-crack",
            confidence: 0.73,
            severity: "minor",
            boundingBox: { x: 0.65, y: 0.55, width: 0.1, height: 0.03 },
            description: "Hairline micro-crack, early stage, monitor for growth",
          },
        ],
      };

    case "surface-anomaly":
      return {
        modelName: "Surface Anomaly v1.0",
        processingTime,
        textResponse:
          "I've analyzed the surface using the **Surface Anomaly** model.\n\n**Surface Quality: Good (3 minor anomalies)**\n\nNo critical issues found. Minor anomalies detected that are within normal manufacturing variance.",
        detections: [
          {
            id: "d1",
            label: "Discoloration",
            confidence: 0.85,
            severity: "minor",
            boundingBox: { x: 0.3, y: 0.2, width: 0.1, height: 0.1 },
            description: "Slight color variation, likely material batch difference",
          },
          {
            id: "d2",
            label: "Texture Irregularity",
            confidence: 0.72,
            severity: "minor",
            boundingBox: { x: 0.55, y: 0.65, width: 0.08, height: 0.08 },
            description: "Surface texture slightly rougher than standard",
          },
          {
            id: "d3",
            label: "Mark",
            confidence: 0.68,
            severity: "minor",
            boundingBox: { x: 0.15, y: 0.7, width: 0.06, height: 0.06 },
            description: "Faint tooling mark from manufacturing process",
          },
        ],
      };

    case "safety-hazard":
      return {
        modelName: "Safety Hazard Detection v2.0",
        processingTime,
        textResponse:
          "I've analyzed the scene using the **Safety Hazard Detection** model.\n\n**Risk Level: ⚠️ Medium**\n\n3 potential hazards identified. Immediate corrective actions recommended for the tripping hazard.",
        detections: [
          {
            id: "d1",
            label: "Tripping Hazard",
            confidence: 0.91,
            severity: "major",
            boundingBox: { x: 0.4, y: 0.75, width: 0.2, height: 0.1 },
            description: "Cables running across walkway, not covered or marked",
          },
          {
            id: "d2",
            label: "Blocked Exit",
            confidence: 0.84,
            severity: "critical",
            boundingBox: { x: 0.8, y: 0.3, width: 0.15, height: 0.4 },
            description: "Emergency exit partially blocked by equipment",
          },
          {
            id: "d3",
            label: "Wet Floor",
            confidence: 0.76,
            severity: "minor",
            boundingBox: { x: 0.1, y: 0.6, width: 0.2, height: 0.15 },
            description: "Wet surface near workstation, no warning sign placed",
          },
        ],
      };

    case "vehicle-detection":
      return {
        modelName: "Vehicle Detection v1.2",
        processingTime,
        textResponse:
          "I've analyzed the image using the **Vehicle Detection** model.\n\n**Vehicles Found: 4**\n\n2 trucks and 2 forklifts detected in the facility area.",
        detections: [
          {
            id: "d1",
            label: "Truck",
            confidence: 0.97,
            severity: "info",
            boundingBox: { x: 0.05, y: 0.3, width: 0.3, height: 0.25 },
            description: "Delivery truck, parked at loading dock",
          },
          {
            id: "d2",
            label: "Truck",
            confidence: 0.95,
            severity: "info",
            boundingBox: { x: 0.6, y: 0.25, width: 0.25, height: 0.2 },
            description: "Transport truck, engine running",
          },
          {
            id: "d3",
            label: "Forklift",
            confidence: 0.91,
            severity: "info",
            boundingBox: { x: 0.35, y: 0.5, width: 0.12, height: 0.15 },
            description: "Forklift in operation near warehouse",
          },
          {
            id: "d4",
            label: "Forklift",
            confidence: 0.88,
            severity: "info",
            boundingBox: { x: 0.7, y: 0.55, width: 0.1, height: 0.12 },
            description: "Forklift parked, no operator",
          },
        ],
      };

    case "object-counting":
      return {
        modelName: "Object Counting v1.0",
        processingTime,
        textResponse:
          "I've analyzed the image using the **Object Counting** model.\n\n**Total Objects: 12**\n\nDetected and counted 12 distinct objects in the scene. Each is marked with a bounding box.",
        detections: Array.from({ length: 12 }, (_, i) => ({
          id: `d${i + 1}`,
          label: `Object ${i + 1}`,
          confidence: 0.7 + Math.random() * 0.28,
          severity: "info" as const,
          boundingBox: {
            x: Math.random() * 0.7,
            y: Math.random() * 0.7,
            width: 0.05 + Math.random() * 0.1,
            height: 0.05 + Math.random() * 0.1,
          },
          description: `Detected object at position ${i + 1}`,
        })),
      };

    case "face-detection":
      return {
        modelName: "Face Detection v1.0",
        processingTime,
        textResponse:
          "I've analyzed the image using the **Face Detection** model.\n\n**Faces Found: 5**\n\n5 faces detected in the scene.",
        detections: [
          {
            id: "d1",
            label: "Face",
            confidence: 0.95,
            severity: "info",
            boundingBox: { x: 0.1, y: 0.2, width: 0.12, height: 0.15 },
            description: "Face detected in foreground",
          },
          {
            id: "d2",
            label: "Face",
            confidence: 0.92,
            severity: "info",
            boundingBox: { x: 0.35, y: 0.25, width: 0.1, height: 0.12 },
            description: "Face detected center",
          },
          {
            id: "d3",
            label: "Face",
            confidence: 0.88,
            severity: "info",
            boundingBox: { x: 0.6, y: 0.3, width: 0.11, height: 0.14 },
            description: "Face detected right side",
          },
          {
            id: "d4",
            label: "Face",
            confidence: 0.82,
            severity: "info",
            boundingBox: { x: 0.2, y: 0.55, width: 0.09, height: 0.11 },
            description: "Face detected mid-ground",
          },
          {
            id: "d5",
            label: "Face",
            confidence: 0.75,
            severity: "info",
            boundingBox: { x: 0.7, y: 0.6, width: 0.08, height: 0.1 },
            description: "Face detected background",
          },
        ],
      };

    default:
      return null;
  }
}

type DetectionModelType =
  | "ppe"
  | "smoke"
  | "scratch"
  | "defect"
  | "custom";

function generateMockResponse(
  message: string,
  hasAttachments: boolean,
  hasVideo: boolean,
  history: HistoryMessage[] = [],
  detectionType: DetectionModelType = "defect"
): { content: string; metadata?: Record<string, unknown> } {
  const lower = message.toLowerCase().trim();

  // Check for short follow-up messages that need contextual responses
  const shortFollowUps = [
    "yes",
    "no",
    "sure",
    "please",
    "ok",
    "okay",
    "tell me more",
    "go ahead",
    "show me",
    "do it",
    "yeah",
    "yep",
    "nope",
  ];
  const isFollowUp =
    message.trim().length < 30 &&
    shortFollowUps.some((f) => lower.includes(f));

  if (isFollowUp && history.length > 0) {
    const lastAssistant = [...history]
      .reverse()
      .find((m) => m.role === "assistant");

    if (!lastAssistant) {
      // No previous assistant message, fall through to normal response
    } else {
      const lastContent = lastAssistant.content.toLowerCase();
      const userSaysYes = [
        "yes",
        "yeah",
        "yep",
        "sure",
        "please",
        "ok",
        "okay",
        "go ahead",
        "do it",
        "show me",
      ].some((w) => lower === w || lower.startsWith(w + " "));
      const userSaysNo = [
        "no",
        "nope",
        "no thanks",
        "not now",
        "skip",
        "never mind",
        "that's all",
        "i'm good",
      ].some((w) => lower === w || lower.startsWith(w + " "));

      // Handle NO first — always give a polite closing response
      if (userSaysNo) {
        return {
          content:
            "No problem! If you need anything else, feel free to upload another image or video, or ask me any question. I'm here to help! 👋",
        };
      }

      // Handle YES — match to what was previously offered
      if (userSaysYes) {
        if (
          lastContent.includes("highlight their locations") ||
          lastContent.includes("how many people") ||
          lastContent.includes("person")
        ) {
          return {
            content: `Here's the breakdown of people I identified:

1. **Person 1** — foreground, walking left, wearing a dark jacket
2. **Person 2** — foreground, center, wearing a white top
3. **Person 3** — foreground, right side, carrying a bag
4. **Person 4** — mid-ground, partially obscured
5. **Person 5** — background, near the building entrance
6. **Person 6** — background, walking right
7. **Person 7** — far background, barely visible

Would you like me to analyze anything else about this image?`,
          };
        }

        if (
          lastContent.includes("compliance score") ||
          lastContent.includes("safety") ||
          lastContent.includes("ppe")
        ) {
          return {
            content: `Here are the detailed findings:

**Workers with complete PPE:**
- Worker 1 (station A): Hard hat ✅, Goggles ✅, Vest ✅
- Worker 2 (station B): Hard hat ✅, Goggles ✅, Vest ✅

**Workers with incomplete PPE:**
- Worker 5 (station E): Hard hat ✅, Goggles ❌, Vest ✅
- Worker 6 (near machinery): Hard hat ✅, Goggles ❌, Vest ✅, Ear protection ❌

I recommend generating an incident report for the PPE violations. Should I do that?`,
          };
        }

        if (
          lastContent.includes("log these as incidents") ||
          lastContent.includes("incident report")
        ) {
          return {
            content: `I've prepared the incident reports:

✅ **INC-204891** — Scratch defect, Major severity, logged to Line 3
✅ **INC-204892** — Dent defect, Minor severity, logged to Line 3

Both incidents are now visible in the AegisVision Incidents dashboard. The assigned quality engineer will be notified automatically.

Is there anything else I can help with?`,
          };
        }

        if (
          lastContent.includes("defect") ||
          lastContent.includes("scratch") ||
          lastContent.includes("dent") ||
          lastContent.includes("quality score")
        ) {
          return {
            content: `Here's a more detailed analysis of each defect:

**Defect 1 — Scratch (94% confidence)**
- Location: Upper-left quadrant
- Length: Approximately 3.2cm
- Depth: Surface-level, does not penetrate coating
- Severity: **Major** — may affect product aesthetics

**Defect 2 — Dent (82% confidence)**
- Location: Center of the component
- Size: ~1.5cm diameter
- Depth: Shallow deformation
- Severity: **Minor** — within acceptable tolerance

Would you like me to log these as incidents in AegisVision?`,
          };
        }

        // Generic yes response when context doesn't match anything specific
        return {
          content: `Sure! Let me provide more details based on my previous analysis.

If you'd like me to focus on a specific area or aspect of the image, just let me know. I can:
- Zoom in on specific regions
- Compare with reference standards
- Provide measurements or annotations
- Generate a detailed report

What would you like me to do?`,
        };
      }

      // Short message that's neither clearly yes or no — treat as a question about the context
      return {
        content:
          "Could you clarify what you'd like me to do? I can continue analyzing the current image, or you can upload a new one. Just let me know!",
      };
    }
  }

  // Treat as having context when attachments in current request OR in history (e.g. regenerate)
  const hasAttachmentsInHistory = history.some(
    (m) => m.role === "user" && (m.attachments?.length ?? 0) > 0
  );
  const effectiveHasAttachments = hasAttachments || hasAttachmentsInHistory;

  // ── Detection-type-specific responses (AegisVision trained models) ─────────
  if (effectiveHasAttachments && detectionType !== "custom") {
    if (detectionType === "ppe") {
      return {
        content: `**PPE Compliance Analysis** (AegisVision trained model)

- ✅ 4 workers wearing hard hats
- ❌ 2 workers without safety goggles
- ✅ All workers wearing high-visibility vests
- ⚠️ 1 worker near machinery without ear protection

**Compliance score: 75%**. I recommend addressing the missing safety goggles.`,
        metadata: {
          annotatedImageUrl: "https://placeholder.aegisvision.io/annotated/ppe",
          defects: [
            {
              id: "1",
              type: "Missing goggles",
              confidence: 0.94,
              severity: "major",
              boundingBox: { x: 0.35, y: 0.2, width: 0.12, height: 0.15 },
            },
            {
              id: "2",
              type: "Missing goggles",
              confidence: 0.88,
              severity: "major",
              boundingBox: { x: 0.62, y: 0.45, width: 0.1, height: 0.12 },
            },
            {
              id: "3",
              type: "Missing ear protection",
              confidence: 0.82,
              severity: "minor",
              boundingBox: { x: 0.5, y: 0.6, width: 0.15, height: 0.2 },
            },
          ],
          summary: { complianceScore: 75, violations: 3 },
          processingTimeMs: 1240,
        },
      };
    }
    if (detectionType === "smoke") {
      return {
        content: `**Smoke & Fire Detection** (AegisVision trained model)

- ⚠️ **1 smoke anomaly detected** — upper-right area (confidence: 89%)
- No active flame detected in frame
- Recommend immediate inspection of the flagged region

**Status: Alert** — verify if this is steam, dust, or actual smoke.`,
        metadata: {
          annotatedImageUrl: "https://placeholder.aegisvision.io/annotated/smoke",
          defects: [
            {
              id: "1",
              type: "Smoke anomaly",
              confidence: 0.89,
              severity: "critical",
              boundingBox: { x: 0.72, y: 0.05, width: 0.22, height: 0.18 },
            },
          ],
          summary: { smokeDetected: 1, flameDetected: 0 },
          processingTimeMs: 980,
        },
      };
    }
    if (detectionType === "scratch") {
      return {
        content: `**Scratch Detection** (AegisVision trained model)

- **Scratch 1** (94% confidence) — upper-left region, ~3.2cm
- **Scratch 2** (78% confidence) — center-right, surface-level
- **Scratch 3** (68% confidence) — lower edge, minor

**Total: 3 scratches**. Severity: 1 major, 2 minor.`,
        metadata: {
          annotatedImageUrl:
            "https://placeholder.aegisvision.io/annotated/scratch",
          defects: [
            {
              id: "1",
              type: "Scratch",
              confidence: 0.94,
              severity: "major",
              boundingBox: { x: 0.1, y: 0.15, width: 0.2, height: 0.1 },
            },
            {
              id: "2",
              type: "Scratch",
              confidence: 0.78,
              severity: "minor",
              boundingBox: { x: 0.55, y: 0.4, width: 0.15, height: 0.08 },
            },
            {
              id: "3",
              type: "Scratch",
              confidence: 0.68,
              severity: "minor",
              boundingBox: { x: 0.3, y: 0.82, width: 0.25, height: 0.06 },
            },
          ],
          summary: { totalDefects: 3, passRate: 72 },
          processingTimeMs: 1520,
        },
      };
    }
    if (detectionType === "defect") {
      return {
        content: `**Defect Detection** (AegisVision trained model)

- **Scratch** (94% confidence) — upper-left region
- **Dent** (82% confidence) — center
- **Surface anomaly** (68% confidence) — bottom-right

**Quality score: 72/100**. Would you like to log these as incidents?`,
        metadata: {
          annotatedImageUrl:
            "https://placeholder.aegisvision.io/annotated/defect",
          defects: [
            {
              id: "1",
              type: "Scratch",
              confidence: 0.94,
              severity: "major",
              boundingBox: { x: 0.1, y: 0.15, width: 0.2, height: 0.1 },
            },
            {
              id: "2",
              type: "Dent",
              confidence: 0.82,
              severity: "critical",
              boundingBox: { x: 0.4, y: 0.4, width: 0.15, height: 0.12 },
            },
            {
              id: "3",
              type: "Surface anomaly",
              confidence: 0.68,
              severity: "minor",
              boundingBox: { x: 0.7, y: 0.75, width: 0.2, height: 0.15 },
            },
          ],
          summary: { totalDefects: 3, passRate: 72 },
          processingTimeMs: 1842,
        },
      };
    }
  }

  if (!effectiveHasAttachments) {
    return {
      content: `I'd be happy to help! To analyze an image or video, please attach a file using the paperclip button. I can help with:

- **Quality inspection** — detect defects, scratches, dents
- **Object counting** — count items, people, components
- **Safety analysis** — PPE compliance, hazard detection
- **General analysis** — describe scenes, identify objects

What would you like to inspect?`,
    };
  }

  if (
    effectiveHasAttachments &&
    (lower.includes("count") ||
      lower.includes("how many") ||
      lower.includes("number of"))
  ) {
    return {
      content: `Based on my analysis of the image, I can identify **7 people** in the scene. 3 are in the foreground and 4 are in the background. Would you like me to highlight their locations?`,
    };
  }

  if (
    effectiveHasAttachments &&
    (lower.includes("defect") ||
      lower.includes("inspect") ||
      lower.includes("scratch") ||
      lower.includes("dent") ||
      lower.includes("quality"))
  ) {
    return {
      content: `I've inspected the image and found **3 defects**:

- **Scratch** (high confidence: 94%) — upper-left region
- **Dent** (medium confidence: 82%) — center
- **Surface anomaly** (low confidence: 68%) — bottom-right

The overall quality score is **72/100**. Would you like to log these as incidents?`,
      metadata: {
        annotatedImageUrl: "https://placeholder.aegisvision.io/annotated/sample",
        defects: [
          {
            id: "1",
            type: "Scratch",
            confidence: 0.94,
            severity: "major",
            boundingBox: { x: 0.1, y: 0.15, width: 0.2, height: 0.1 },
          },
          {
            id: "2",
            type: "Dent",
            confidence: 0.82,
            severity: "critical",
            boundingBox: { x: 0.4, y: 0.4, width: 0.15, height: 0.12 },
          },
          {
            id: "3",
            type: "Surface anomaly",
            confidence: 0.68,
            severity: "minor",
            boundingBox: { x: 0.7, y: 0.75, width: 0.2, height: 0.15 },
          },
        ],
        summary: { totalDefects: 3, passRate: 72 },
        processingTimeMs: 1842,
      },
    };
  }

  if (
    effectiveHasAttachments &&
    (lower.includes("safety") ||
      lower.includes("ppe") ||
      lower.includes("helmet") ||
      lower.includes("hazard"))
  ) {
    return {
      content: `I've analyzed the image for safety compliance:

- ✅ 4 workers wearing hard hats
- ❌ 2 workers without safety goggles
- ✅ All workers wearing high-visibility vests
- ⚠️ 1 worker near machinery without ear protection

**Compliance score: 75%**. I recommend addressing the missing safety goggles.`,
    };
  }

  if (
    effectiveHasAttachments &&
    (lower.includes("describe") ||
      lower.includes("what's happening") ||
      lower.includes("tell me about"))
  ) {
    return {
      content: `This image shows a manufacturing floor with an active production line. I can see conveyor belts with metal components moving through an inspection station. There are 5 workers visible, and overhead lighting is fluorescent. The equipment appears to be stamping press machinery, likely for automotive parts.`,
    };
  }

  if (
    effectiveHasAttachments &&
    hasVideo &&
    (lower.includes("video") || lower.includes("clip"))
  ) {
    return {
      content: `I've analyzed your video clip (duration: 2:34). Here's what I found:

**Key moments:**
- 0:14 — Defect visible on conveyor (scratch)
- 0:38 — Worker adjusts machine settings
- 1:12 — Product passes inspection cleanly
- 1:52 — Another defect spotted (dent)

**Summary:** 2 defects found across 47 frames analyzed. The defect rate is approximately 4.3%.`,
    };
  }

  // Default response (when we have attachments/context)
  if (effectiveHasAttachments) {
    return {
      content: `I've analyzed the uploaded image. Here's what I observe:

The scene appears to be an industrial or manufacturing environment. I can identify several key elements that suggest quality inspection or production monitoring is taking place. The lighting and equipment layout are typical of such facilities.

Could you be more specific about what you'd like me to look for? I can help with defect detection, counting objects, safety checks, and more.`,
    };
  }

  return {
    content: `I'd be happy to help! To analyze an image or video, please attach a file using the paperclip button.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = (body.message as string) || "";
    const attachments = (body.attachments as Array<{ type: string }>) || [];
    const stream = (body.stream as boolean) ?? true;
    const history = (body.history as HistoryMessage[]) || [];
    const detectionModel = (body.detectionModel as string) || null;

    const hasAttachments = attachments.length > 0;
    const hasVideo = attachments.some((a) => a.type === "video");

    // When detectionModel is provided and we have attachments, use specialized detection
    let fullResponse: string;
    let metadata: Record<string, unknown> | undefined;

    if (detectionModel && hasAttachments) {
      const results = generateDetectionResults(detectionModel, message);
      if (results) {
        fullResponse = results.textResponse;
        metadata = {
          type: "detection-result",
          detections: results.detections,
          modelName: results.modelName,
          processingTime: results.processingTime,
          detectionModel,
        };
      } else {
        // Unknown model, fall through to general AI
        const mock = generateMockResponse(
          message,
          hasAttachments,
          hasVideo,
          history,
          "custom"
        );
        fullResponse = mock.content;
        metadata = mock.metadata;
      }
    } else {
      const mock = generateMockResponse(
        message,
        hasAttachments,
        hasVideo,
        history,
        "custom"
      );
      fullResponse = mock.content;
      metadata = mock.metadata;
    }

    if (!stream) {
      const delayMs = 2000 + Math.random() * 2000;
      await delay(delayMs);
      return NextResponse.json({ content: fullResponse, metadata });
    }

    // Stream response word-by-word for typewriter effect
    const words = fullResponse.split(/\s+/).filter(Boolean);

    const streamBody = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((r) =>
            setTimeout(r, 30 + Math.random() * 50)
          );
        }
        controller.enqueue(
          encoder.encode("\n\n__META__" + JSON.stringify(metadata ?? {}))
        );
        controller.close();
      },
    });

    return new Response(streamBody, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[AI Chat] POST /api/ai-chat/message error:", err);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
