import { casualPreset } from "./casual";
import { freshPreset } from "./fresh";
import { professionalPreset } from "./professional";
import type { StylePreset } from "@/types";

export const STYLE_PRESETS = {
  fresh: freshPreset,
  professional: professionalPreset,
  casual: casualPreset
} satisfies Record<StylePreset, { id: StylePreset; label: string; fragment: string }>;

export function loadStylePreset(stylePreset: StylePreset) {
  return STYLE_PRESETS[stylePreset];
}
