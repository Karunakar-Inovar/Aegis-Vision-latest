/**
 * AI Chat service — handles send → upload → process → respond flow.
 * Supports detection model types (PPE, Smoke, Scratch, etc.) and general vision AI.
 */

import type { ChatMessage } from "./types";

const UPLOAD_BASE = "/api/chatbot/upload";
const MESSAGE_BASE = "/api/ai-chat/message";

interface UploadedAttachment {
  fileId: string;
  type: "image" | "video";
  fileName: string;
  fileUrl?: string;
}

async function uploadFile(file: File): Promise<UploadedAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(UPLOAD_BASE, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || `Upload failed: ${res.statusText}`
    );
  }

  const data = (await res.json()) as {
    fileId: string;
    fileUrl: string;
    fileName: string;
    mediaType: "image" | "video";
  };

  return {
    fileId: data.fileId,
    type: data.mediaType,
    fileName: data.fileName,
    fileUrl: data.fileUrl,
  };
}

export interface SendMessageResponse {
  content: string;
  metadata?: ChatMessage["metadata"];
}

export async function sendMessage(
  content: string,
  attachments: File[],
  conversationHistory: ChatMessage[]
): Promise<SendMessageResponse> {
  const uploadedAttachments = await Promise.all(
    attachments.map((file) => uploadFile(file))
  );

  const res = await fetch(MESSAGE_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: content,
      attachments: uploadedAttachments.map((a) => ({
        fileId: a.fileId,
        type: a.type,
        fileName: a.fileName,
      })),
      history: conversationHistory.slice(-20),
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || `Request failed: ${res.statusText}`
    );
  }

  return res.json() as Promise<SendMessageResponse>;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (metadata?: ChatMessage["metadata"]) => void;
  onError: (error: Error) => void;
}

export async function sendMessageStream(
  content: string,
  attachments: File[],
  conversationHistory: ChatMessage[],
  detectionModel: string | null,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const uploaded = await Promise.all(
      attachments.map((file) => uploadFile(file))
    );

    const res = await fetch(MESSAGE_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        attachments: uploaded.map((a) => ({
          fileId: a.fileId,
          type: a.type,
          fileName: a.fileName,
        })),
        history: conversationHistory.slice(-20),
        detectionModel: detectionModel || null,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { error?: string }).error || `Request failed: ${res.statusText}`
      );
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";
    let inMetadata = false;

    while (true) {
      const { done, value } = await reader.read();
      buffer += value ? decoder.decode(value, { stream: true }) : "";

      if (inMetadata) {
        try {
          const metadata = JSON.parse(buffer) as ChatMessage["metadata"];
          callbacks.onComplete(
            Object.keys(metadata).length > 0 ? metadata : undefined
          );
          return;
        } catch {
          if (done) {
            callbacks.onComplete();
            return;
          }
        }
        continue;
      }

      if (buffer.includes("__META__")) {
        const [text, metaPart] = buffer.split("__META__");
        if (text) callbacks.onToken(text);
        buffer = metaPart ?? "";
        inMetadata = true;
        if (done) {
          try {
            const metadata = JSON.parse(buffer) as ChatMessage["metadata"];
            callbacks.onComplete(
              Object.keys(metadata).length > 0 ? metadata : undefined
            );
          } catch {
            callbacks.onComplete();
          }
          return;
        }
        continue;
      }

      callbacks.onToken(buffer);
      buffer = "";
      if (done) break;
    }

    callbacks.onComplete();
  } catch (err) {
    callbacks.onError(
      err instanceof Error ? err : new Error("Stream failed")
    );
  }
}
