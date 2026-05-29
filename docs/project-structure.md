# OmniPost V1 项目结构与状态管理

> 目标：开发前明确代码分层架构、目录组织、状态流转。

---

## 1. 架构分层

```
┌──────────────────────────────────────────┐
│  UI 层 (components/)                      │
│  纯渲染，通过 Context 读写状态              │
├──────────────────────────────────────────┤
│  状态层 (WorkflowProvider)                 │
│  useReducer 管理创作台全部状态              │
│  所有业务动作在此 dispatch                 │
├──────────────────────────────────────────┤
│  数据层 (lib/db/)                         │
│  Drizzle ORM 封装 CRUD                    │
├──────────────────────────────────────────┤
│  AI 层 (lib/llm/ + lib/prompts/)          │
│  Prompt 拼接 → LLM 调用 → Schema 校验      │
│  与 UI 无关，纯函数组合                     │
├──────────────────────────────────────────┤
│  规则层 (lib/skills/ + lib/validators/)   │
│  平台 Skill JSON + 平台校验函数             │
│  可注册、可扩展                            │
└──────────────────────────────────────────┘
```

依赖方向：**UI → 状态 → 数据/AI/规则**，下层不依赖上层。

---

## 2. 目录结构

```
omnipost/
├── db/
│   ├── schema.ts              # Drizzle 表定义（4 张表）
│   └── index.ts               # 数据库连接
├── public/uploads/            # 用户上传图片
├── src/
│   ├── app/                   # Next.js 路由（纯页面入口，不放业务逻辑）
│   │   ├── layout.tsx
│   │   ├── page.tsx           # 工作台首页
│   │   ├── workspace/page.tsx # 创作台
│   │   ├── records/page.tsx   # 发布记录
│   │   ├── mock/[platform]/[id]/page.tsx # 通用模拟详情
│   │   └── api/               # API Route Handler
│   │       ├── contents/
│   │       │   ├── route.ts
│   │       │   └── [id]/generate/route.ts
│   │       ├── platform-contents/[id]/route.ts
│   │       └── publish/mock/route.ts
│   │
│   ├── components/            # 纯 UI 组件，不含业务逻辑
│   │   ├── ui/                # shadcn/ui
│   │   ├── workspace/
│   │   │   ├── WorkflowProvider.tsx   # Context + useReducer
│   │   │   ├── LeftPanel.tsx
│   │   │   ├── CenterPanel.tsx
│   │   │   └── RightPanel.tsx
│   │   ├── preview/           # 各平台预览（纯渲染）
│   │   └── publish/
│   │
│   ├── lib/
│   │   ├── skills/            # 平台 Skill（JSON 文件）
│   │   │   ├── registry.ts    # 注册/加载
│   │   │   ├── wechat.json
│   │   │   ├── zhihu.json
│   │   │   ├── xiaohongshu.json
│   │   │   └── bilibili.json
│   │   ├── presets/           # 风格片段
│   │   │   ├── professional.ts
│   │   │   └── casual.ts      # 48h 增强
│   │   ├── prompts/builder.ts # Prompt 拼接
│   │   ├── llm/
│   │   │   ├── generate.ts    # generateObject() 调用
│   │   │   └── schemas.ts     # Zod Schema（各平台输出约束）
│   │   ├── validators/        # 代码校验
│   │   │   ├── index.ts
│   │   │   ├── wechat.ts
│   │   │   ├── zhihu.ts
│   │   │   ├── xiaohongshu.ts
│   │   │   └── bilibili.ts
│   │   └── db/                # 数据层 CRUD
│   │       ├── contents.ts
│   │       ├── platform-contents.ts
│   │       └── publish-tasks.ts
│   │
│   └── types/index.ts
```

目录设计原则：
- `app/` 下只放路由入口，不放组件实现
- `components/` 下纯 UI，只通过 props 和 Context 拿数据
- `lib/` 下所有业务逻辑，与 React 解耦

---

## 3. 创作台状态管理

### 3.1 方案

用单个 `WorkflowProvider`（Context + useReducer），不拆多个 Context。

理由：三栏共享同一份数据（左栏输入 → 中栏编辑 → 右栏预览），拆多个 Context 反而要处理跨 Context 同步，不如一个 Provider 直截了当。

### 3.2 状态结构

```ts
type WorkspaceState = {
  step: "input" | "adapt" | "preview" | "publish";

  rawContent: {
    title: string;
    body: string;
    images: File[];
    userTags: string[];
  };

  settings: {
    platforms: Platform[];    // 用户勾选的平台
    stylePreset: StylePreset; // 首版至少 professional
  };

  // 每个平台的生成状态
  platformContents: Record<Platform, {
    status: "idle" | "loading" | "ready" | "error";
    data: PlatformContent | null;
    error?: string;
  }>;

  activePlatformTab: Platform; // 中栏当前显示的 Tab
};
```

### 3.3 数据流

```text
用户输入（LeftPanel）
  │ UPDATE_RAW
  ▼
WorkflowProvider ──── 所有面板读取 state
  │
  │ 点击"生成"
  ▼
dispatch(START_GENERATION)
  │ POST /api/contents → /api/contents/{id}/generate
  │ AI 返回后 dispatch(PLATFORM_GENERATED, data)
  ▼
CenterPanel  读取 platformContents[activeTab] 展示编辑
RightPanel   读取 platformContents[activeTab] 展示预览 + 校验
```

三个面板不是互相通信，而是**都只和 Provider 通信**。LeftPanel 只管 dispatch(UPDATE_RAW)，CenterPanel 只管读 `platformContents` 和 dispatch(UPDATE_PLATFORM_CONTENT)，RightPanel 只读当前 Tab 的数据。

---

## 4. 组件树

```
WorkspacePage
└── WorkflowProvider
    ├── StepIndicator
    ├── SettingsBar
    │   ├── PlatformSelector    (多选)
    │   ├── StyleSelector       (单选)
    │   └── GenerateButton
    ├── LeftPanel
    │   ├── TitleInput
    │   ├── BodyTextarea
    │   ├── ImageUploader
    │   └── TagInput
    ├── CenterPanel
    │   ├── PlatformTabs        (4 个平台 Tab)
    │   └── PlatformEditor      (按 activeTab 渲染不同字段)
    └── RightPanel
        ├── PreviewRenderer     (按 activeTab 渲染对应预览)
        └── ValidationPanel     (当前平台校验结果)
```

---

## 5. 扩展更多平台

新增一个平台只需改 4 个地方，主工作流不动：

| 步骤 | 文件 | 说明 |
|---|---|---|
| 1. Skill 定义 | `lib/skills/new-platform.json` | 平台规则 + 输出 Schema |
| 2. 校验规则 | `lib/validators/new-platform.ts` | 导出 `(content) => ValidationItem[]` |
| 3. 预览组件 | `components/preview/NewPlatformPreview.tsx` | 纯渲染组件 |
| 4. 注册 | `lib/skills/registry.ts` 加一行 | 平台识别 + 消费 |

PlatformEditor 通过 `skill.outputSchema` 自动渲染字段，不需要为每个平台写单独的编辑表单。

校验和预览都通过 `Record<Platform, Validator/Component>` 映射路由，不用 if-else。

---

## 6. 范围说明

本文件只描述当前实现结构。功能边界以 `prd.md` 第 5 节为准，目录里不再单独维护裁剪清单。
