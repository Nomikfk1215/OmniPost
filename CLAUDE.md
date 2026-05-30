# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost, default port)
npm run build        # Production build
npm run start        # Start production server
npm run typecheck    # tsc --noEmit (no tests configured yet)
```

## Architecture

OmniPost is a **multi-platform content adaptation workbench** — write a single piece of content in Markdown, generate platform-specific versions (WeChat/Zhihu/Xiaohongshu/Bilibili) via LLM or rule-based mock, preview and edit each version, then simulate publishing.

**Stack:** Next.js 14 App Router + React 18 + TypeScript strict + Tailwind CSS 3 + Zod + Drizzle ORM (schema defined, not wired at runtime).

### Storage: JSON file, not SQLite

Drizzle schema exists at `db/schema.ts` but **is not used at runtime**. All data lives in a single JSON file at `.data/omnipost-store.json` managed by `src/lib/db/json-store.ts` (in-memory cache after first read). The `src/lib/db/*.ts` modules (`contents.ts`, `platform-contents.ts`, `publish-tasks.ts`) all call `readStore()`/`writeStore()` from `json-store.ts`. The Drizzle schema is documented as the migration target for switching to SQLite later.

### State management: single Context + useReducer

`src/components/workspace/WorkflowProvider.tsx` wraps the entire workspace page. One `WorkspaceState` object holds everything: `rawContent`, `settings` (platforms, stylePreset, formatting), `platformContents` (a `Record<Platform, PlatformSlot>` where each slot is `idle | loading | ready | error`), `step` (input → adapt → preview → publish), and publish state.

Side effects (API calls) live in `useCallback` action creators inside the provider: `generate()` creates content via `POST /api/contents` then generates adaptations via `POST /api/contents/:id/generate`; `publish()` posts to `POST /api/publish/mock`. No React Query/SWR — data is fetched fresh per action.

### LLM pipeline (two-phase)

`src/lib/llm/generate.ts` orchestrates generation in two phases:

1. **`extractContentBrief()`** — sends raw text to LLM, extracts structured summary (`ContentBrief` schema: coreTopic, mainPoints, keywords, retainedDetails, audience, tone)
2. **`generateViaOpenAICompatible()`** — for each platform, calls `buildPrompt()` which assembles a platform-specific system prompt (shared header + platform skill definition + style preset) and user message, then calls LLM with `response_format: { type: "json_object" }`, validates output against the platform's Zod schema

LLM config resolution priority (`src/lib/llm/settings-store.ts`): **UI-saved key > `OPENAI_API_KEY` env var > null (mock fallback)**. API keys are AES-256-GCM encrypted at rest.

### Prompt assembly

`src/lib/prompts/builder.ts` → `buildPrompt()` loads:
- Platform skill from `src/lib/skills/{platform}.json` (positioning, titleRule, bodyRule, outputSchema, editableFields)
- Style preset from `src/lib/presets/{style}.ts` (tone fragment)
- Shared system header (Chinese instructions for a professional multi-platform editor)

The assembled user message includes original title, body, tags, platform rules JSON, and output schema JSON — the LLM sees the exact schema it must produce.

### Platform system

Each platform is defined by two things:
1. **Skill JSON** (`src/lib/skills/{platform}.json`) — positioning, content rules, output schema, editable fields
2. **Validator** (`src/lib/validators/{platform}.ts`) — checks like title length, tag count, emoji presence, cover suggestion

New platforms require: a skill JSON, a validator, a preview component (`src/components/preview/{Platform}Preview.tsx`), an entry in `PreviewRenderer.tsx`, and the platform ID added to the `PLATFORMS` tuple in `src/types/index.ts`.

### Route structure

All API routes are Next.js App Router Route Handlers under `src/app/api/`. They use Zod for request body validation and return JSON. Key routes:

| Route | Purpose |
|---|---|
| `POST /api/contents` | Create raw Content |
| `POST /api/contents/:id/generate` | Run LLM/mock generation for selected platforms |
| `GET/PUT /api/platform-contents/:id` | Read/update a single platform version |
| `POST /api/publish/mock` | Simulated publish (creates PublishTask with mock URLs) |
| `GET /api/publish/tasks` | List publish history |
| `GET/PUT/DELETE /api/settings/llm` | LLM config CRUD |
| `POST /api/settings/llm/test` | Test LLM connection |

Pages: `/workspace` (main editor), `/records` (publish history), `/settings` (LLM config), `/mock/[platform]/[id]` (simulated published detail).

## Key patterns

- **Path alias:** `@/*` maps to `src/*` (configured in `tsconfig.json`)
- **Validation:** All API input validated with Zod; all generated platform content re-validated with platform-specific validators
- **IDs:** Use `createId(prefix)` from `src/lib/utils.ts` (generates `{prefix}_{random}`)
- **UI components:** Hand-rolled in `src/components/ui/` (Button, Badge, Input, Textarea, Field) — no shadcn/ui
- **Types:** All in `src/types/index.ts` as a single file — no separate module files
- **No test framework** configured yet — `npm run typecheck` is the only verification command

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `OMNIPOST_USE_LLM` | Set to `true` to enable env-level LLM fallback |
| `OPENAI_API_KEY` | API key for OpenAI-compatible provider |
| `OMNIPOST_OPENAI_BASE_URL` | Base URL (default `https://api.openai.com/v1`) |
| `OMNIPOST_OPENAI_MODEL` | Model name (default `gpt-4o-mini`) |
| `OMNIPOST_ENCRYPTION_KEY` | Secret for encrypting UI-saved API keys (AES-256-GCM) |
