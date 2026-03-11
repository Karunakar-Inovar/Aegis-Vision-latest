import { NextRequest, NextResponse } from "next/server";
import type { MediaType, UploadResponse } from "@/services/chatbot/types";

function detectMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "image"; // fallback
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    console.log("[Chatbot Mock] POST /api/chatbot/upload — invalid form data");
    return NextResponse.json(
      { error: "Invalid multipart form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    console.log("[Chatbot Mock] POST /api/chatbot/upload — no file provided");
    return NextResponse.json(
      { error: "No file provided. Use form field 'file'." },
      { status: 400 }
    );
  }

  const mediaType = detectMediaType(file.type);
  const delayMs = mediaType === "image" ? 1500 : 3000;
  await new Promise((r) => setTimeout(r, delayMs));

  const fileId = crypto.randomUUID();
  const duration =
    mediaType === "video"
      ? Math.floor(15 + Math.random() * 165)
      : undefined;

  const response: UploadResponse = {
    fileId,
    fileUrl: `https://placeholder.aegisvision.io/files/${fileId}`,
    thumbnailUrl: `https://placeholder.aegisvision.io/thumbnails/${fileId}`,
    fileName: file.name,
    fileSize: file.size,
    mediaType,
    duration,
  };

  console.log(
    "[Chatbot Mock] POST /api/chatbot/upload —",
    file.name,
    mediaType,
    file.size,
    "bytes"
  );
  return NextResponse.json(response);
}
