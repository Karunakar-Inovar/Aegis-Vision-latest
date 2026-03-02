import OpenAI from "openai";
import { zodFunction } from "openai/helpers/zod";
import { fromOpenAICompletion } from "@crayonai/stream";
import { getMessageStore } from "./messageStore";
import {
  getAlertsSchema,
  getCameraFeedSchema,
  acknowledgeAlertSchema,
  getIncidentHistorySchema,
  getAlerts,
  getCameraFeed,
  acknowledgeAlert,
  getIncidentHistory,
} from "./aegisTools";

const SYSTEM_PROMPT = `You are AegisVision's AI security operations assistant helping operators monitor cameras and respond to incidents.

<ui_rules>
- For a single alert: render an incident card with severity badge (color-coded: red=critical, orange=high, yellow=medium, blue=low), camera ID, alert type, timestamp, thumbnail image if available, and a description.
- Always include three action buttons on incident cards: "Acknowledge", "View Camera", "Escalate".
- For lists of alerts: use a card list grouped by severity, critical first.
- For camera feeds: render a camera overlay card with the feed URL displayed as an image, camera ID, location label, and status indicator.
- For incident history: use a timeline component or table with sortable columns.
- When showing multiple cameras: use a responsive grid layout (2-3 columns).
- Never respond with plain text only — always generate a UI component even for simple confirmations.
- For acknowledgement confirmations: show a compact success card with the alert ID and operator note.
</ui_rules>`;

console.log("[chat/route] THESYS_API_KEY:", process.env.THESYS_API_KEY ? "KEY: set" : "KEY: missing");
console.log("[chat/route] AEGIS_API_URL:", process.env.AEGIS_API_URL ?? "(not set)");

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed/",
  apiKey: process.env.THESYS_API_KEY,
});

export async function POST(req: Request) {
  const { prompt, threadId, responseId } = await req.json();

  const store = getMessageStore(threadId);

  if (store.messageList.length === 0) {
    store.addMessage({ role: "system", content: SYSTEM_PROMPT });
  }

  store.addMessage({ role: "user", content: prompt });

  const runner = client.chat.completions.runTools({
    model: "c1-nightly",
    stream: true,
    messages: store.getOpenAICompatibleMessageList(),
    tools: [
      zodFunction({
        name: "getAlerts",
        parameters: getAlertsSchema,
        function: getAlerts,
        description:
          "Fetch security alerts, optionally filtered by camera ID and severity level",
      }),
      zodFunction({
        name: "getCameraFeed",
        parameters: getCameraFeedSchema,
        function: getCameraFeed,
        description:
          "Get a camera's live feed snapshot URL and stream metadata",
      }),
      zodFunction({
        name: "acknowledgeAlert",
        parameters: acknowledgeAlertSchema,
        function: acknowledgeAlert,
        description:
          "Acknowledge a security alert with an optional operator note",
      }),
      zodFunction({
        name: "getIncidentHistory",
        parameters: getIncidentHistorySchema,
        function: getIncidentHistory,
        description:
          "Retrieve incident history for a time range, optionally filtered by camera",
      }),
    ],
  });

  const stream = fromOpenAICompletion(runner, {
    onFinish: async () => {
      const content = await runner.finalContent();
      store.addMessage({
        id: responseId,
        role: "assistant",
        content: content ?? "",
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
