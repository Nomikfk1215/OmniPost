import {
  buildAssistCopyPayload,
  getAssistCopyImages
} from "@/lib/publish/assist-copy";
import type { PlatformContent } from "@/types";

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function imageToDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`image fetch failed: ${response.status}`);
  }

  return blobToDataUrl(await response.blob());
}

async function inlineImages(html: string, content: PlatformContent, baseUrl: string) {
  let nextHtml = html;
  const images = getAssistCopyImages(content, baseUrl);

  for (const image of images) {
    try {
      const dataUrl = await imageToDataUrl(image.url);
      nextHtml = nextHtml
        .split(image.url)
        .join(dataUrl)
        .replace(
          new RegExp(`data-omnipost-image="${image.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g"),
          ""
        );
    } catch {
      nextHtml = nextHtml
        .replace(
          new RegExp(
            `<figure>\\s*<img[^>]+data-omnipost-image="${image.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>\\s*</figure>`,
            "g"
          ),
          ""
        )
        .replace(
          new RegExp(`<img[^>]+data-omnipost-image="${image.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "g"),
          ""
        );
    }
  }

  return nextHtml;
}

function copyWithTextarea(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export async function copyPlatformContentAsRichText(content: PlatformContent) {
  const baseUrl = window.location.origin;
  const payload = buildAssistCopyPayload(content, baseUrl);
  const html = await inlineImages(payload.html, content, baseUrl);

  try {
    if (navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([payload.text], { type: "text/plain" })
        })
      ]);
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload.text);
      return;
    }
  } catch {
    // Fall through to the textarea fallback.
  }

  copyWithTextarea(payload.text);
}
