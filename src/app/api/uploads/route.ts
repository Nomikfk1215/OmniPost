import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createId } from "@/lib/utils";
import type { ImageAsset } from "@/types";

export const runtime = "nodejs";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const maxFileSize = 8 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);

function getExtension(file: File) {
  const ext = path.extname(file.name).toLowerCase();

  if (ext) {
    return ext;
  }

  if (file.type === "image/jpeg") {
    return ".jpg";
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  if (file.type === "image/gif") {
    return ".gif";
  }

  if (file.type === "image/svg+xml") {
    return ".svg";
  }

  return ".img";
}

function safeBaseName(fileName: string) {
  const parsed = path.parse(fileName).name || "image";
  return parsed.replace(/[^\w.-]+/g, "-").slice(0, 64) || "image";
}

function isImageFile(value: FormDataEntryValue): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

async function saveFile(file: File): Promise<ImageAsset> {
  if (!file.type.startsWith("image/") || (file.type && !allowedMimeTypes.has(file.type))) {
    throw new Error("unsupported-type");
  }

  if (file.size > maxFileSize) {
    throw new Error("too-large");
  }

  const id = createId("img");
  const extension = getExtension(file);
  const fileName = `${id}-${safeBaseName(file.name)}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return {
    id,
    source: "upload",
    name: file.name || fileName,
    fileName,
    url: `/uploads/${fileName}`,
    mimeType: file.type || undefined,
    size: file.size,
    createdAt: new Date().toISOString()
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter(isImageFile);

  if (!files.length) {
    return NextResponse.json({ error: "no image files" }, { status: 400 });
  }

  try {
    const images = await Promise.all(files.map(saveFile));
    return NextResponse.json({ images });
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload failed";
    const status = message === "too-large" || message === "unsupported-type" ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
