# OmniPost V1 技术选型

> 目标：24-48 小时 AI Coding 可交付
> 原则：零额外基础设施、全栈一把梭、组件现成、类型安全

---

## 1. 总览

| 层 | 选型 | 理由 |
|---|---|---|
| 前端框架 | Next.js 14 (App Router) | API Route 当后端，不需要起两个服务 |
| UI 组件 | shadcn/ui + Tailwind CSS | 组件直接复制到项目，样式原子化 |
| AI 调用 | Vercel AI SDK (`ai` + `@ai-sdk/openai` 兼容) | 统一 LLM 调用接口，内置 streaming |
| 数据库 | SQLite + Drizzle ORM | 单文件零配置，Drizzle 类型安全 |
| 图片存储 | 本地 `public/uploads/` | V1 不搞云存储 |
| 表单 | react-hook-form + zod | 表单状态 + 校验 |
| 状态管理 | React Context + useReducer | 三栏状态不复杂，不需要 Redux |
| 部署 | Vercel / 本地 `next start` | Demo 可直接 localhost |

---

## 2. 为什么用一个 Next.js 全搞定

24 小时不允许拆前后端两个仓库。Next.js App Router：

```
src/app/
├── page.tsx              # 工作台首页
├── workspace/
│   └── page.tsx          # 创作台
├── records/
│   └── page.tsx          # 发布记录
├── mock/
│   └── [platform]/[id]/page.tsx
└── api/
    ├── contents/route.ts
    ├── contents/[id]/generate/route.ts
    ├── platform-contents/[id]/route.ts
    └── publish/mock/route.ts
```

前端页面 + API 路由在同一项目内，不需要 CORS，不需要独立部署。

---

## 3. AI 模型选择

| 方案 | 说明 |
|---|---|
| 首选 | Claude API（Anthropic），通过 `@ai-sdk/anthropic` |
| 备选 | OpenAI 兼容接口，通过 `@ai-sdk/openai` |

模型要求：**支持 Structured Outputs / JSON Mode**，因为平台内容生成需要严格的 JSON Schema 约束。

Vercel AI SDK 的好处：
- `generateObject()` 直接输出 Typed JSON，不需要自己写 JSON 解析和重试
- `streamObject()` 可流式展示生成进度

---

## 4. 数据库

### 4.1 选 SQLite 的理由

- 零配置，`npx drizzle-kit push` 直接建表
- 单文件存储，Demo 可随时重置
- Drizzle ORM 全面 TypeScript 类型推导

### 4.2 表结构概览

```ts
// contents — 原始内容
// platform_contents — 每个平台的生成结果
// publish_tasks — 发布任务
// publish_results — 每个平台的发布结果
```

---

## 5. 组件清单

### 5.1 shadcn/ui 直接用

```text
Button, Input, Textarea, Tabs, Badge, Card,
Dialog, Select, Label, Separator, ScrollArea,
Toast (sonner), Tooltip
```

### 5.2 自建组件

```text
PlatformTabGroup       — 中栏平台 Tab 切换
PlatformEditor         — 各平台编辑表单（按平台渲染不同字段）
PlatformPreview        — 仿平台预览（公众号 / 知乎 / 小红书 / B站）
ValidationPanel        — 右栏校验结果展示
StepIndicator          — 顶部步骤条
WorkflowProvider       — 创作台状态 Context
```

---

## 6. 开发工具

| 工具 | 用途 |
|---|---|
| TypeScript (strict) | 类型安全 |
| ESLint + Prettier | 代码风格 |
| Tailwind CSS | 样式 |
| Drizzle Kit | 数据库迁移 |
| tsx | 运行脚本（seed 等） |

---

## 7. 范围说明

本文件只记录技术选型和开发约束。功能边界以 `prd.md` 第 5 节为准，避免在多份文档里重复维护裁剪项。
