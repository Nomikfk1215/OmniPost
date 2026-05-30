import type { ReactNode } from "react";

type MarkdownBodyProps = {
  text: string;
  variant?: "default" | "zhihu" | "bilibili";
};

function renderInline(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(
        <strong key={`${match.index}-strong`} className="font-semibold text-gray-950">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      nodes.push(
        <code key={`${match.index}-code`} className="rounded bg-gray-100 px-1 py-0.5 text-[0.92em] text-gray-800">
          {match[3]}
        </code>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : text;
}

function cleanMarker(text: string) {
  return text.trim().replace(/^[-*]\s+/, "").replace(/^\d+[.)、]\s+/, "");
}

export function MarkdownBody({ text, variant = "default" }: MarkdownBodyProps) {
  const lines = text.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      blocks.push(
        <h2 key={index} className="mt-5 text-base font-semibold leading-7 text-gray-950 first:mt-0">
          {renderInline(heading[2])}
        </h2>
      );
      index += 1;
      continue;
    }

    if (/^>\s+/.test(line)) {
      blocks.push(
        <blockquote key={index} className="border-l-4 border-gray-200 pl-3 text-gray-600">
          {renderInline(line.replace(/^>\s+/, ""))}
        </blockquote>
      );
      index += 1;
      continue;
    }

    const ordered = /^\d+[.)、]\s+/.test(line);
    const unordered = /^[-*]\s+/.test(line);

    if (ordered || unordered) {
      const items: string[] = [];

      while (index < lines.length) {
        const itemLine = lines[index].trim();
        const itemMatches = ordered ? /^\d+[.)、]\s+/.test(itemLine) : /^[-*]\s+/.test(itemLine);

        if (!itemMatches) {
          break;
        }

        items.push(cleanMarker(itemLine));
        index += 1;
      }

      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={index}
          className={ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}
        >
          {items.map((item, itemIndex) => (
            <li key={`${index}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ListTag>
      );
      continue;
    }

    blocks.push(
      <p key={index} className={variant === "zhihu" ? "text-gray-800" : "text-gray-800"}>
        {renderInline(line)}
      </p>
    );
    index += 1;
  }

  return <div className="space-y-3 text-sm leading-7">{blocks}</div>;
}
