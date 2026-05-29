export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function createId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

export function formatDateTime(value: string | number | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function splitTags(value: string) {
  return value
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeTag(tag: string, withHash = false) {
  const clean = tag.trim().replace(/^#/, "");
  return withHash ? `#${clean}` : clean;
}

export function summarizeText(text: string, max = 96) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) {
    return compact;
  }

  return `${compact.slice(0, max - 1)}...`;
}
