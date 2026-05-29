import { casualPreset } from "./casual";
import { professionalPreset } from "./professional";
import type { StylePreset } from "@/types";

export const STYLE_PRESETS = {
  professional: professionalPreset,
  casual: casualPreset
} satisfies Record<StylePreset, { id: StylePreset; label: string; fragment: string }>;

export function loadStylePreset(stylePreset: StylePreset) {
  return STYLE_PRESETS[stylePreset];
}
