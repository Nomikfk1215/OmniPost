# OmniPost API 配置模块设计文档

> 版本：V1.0  
> 日期：2026-05-29  
> 类型：功能设计  
> 关联文档：`prd.md`、`tech-stack.md`、`prompt-design.md`

---

## 1. 问题背景

当前 LLM 接入方式为纯环境变量注入（`process.env.OPENAI_API_KEY` + `OMNIPOST_USE_LLM`）：

- 用户改 Key 必须重启服务
- 非技术人员不会操作 `.env` 文件
- 没有 UI 感知——用户不知道自己跑在 mock 模式
- 无法测试 API 连通性

OmniPost 定位是"个人/小团队自部署工具"，不应要求用户编辑配置文件才能使用核心功能。

---

## 2. 设计目标

1. 用户可在 UI 中配置 API Key，即时生效，无需重启服务
2. API Key 密文存储，不返回明文给客户端
3. 支持连通性测试
4. 环境变量作为兜底默认值，UI 配置覆盖环境变量
5. 未配置时 UI 有明确提示

---

## 3. 架构决策

### 3.1 配置优先级

```
UI 设置（运行时） > 环境变量（部署默认） > Mock Fallback
```

### 3.2 数据流

```
用户输入 Key ──→ POST /api/settings ──→ 服务端加密落盘（JSON store）
                                             │
生成内容时 ──→ GET settings store ──→ 有值？──→ 用 settings 中的 Key
                                              │
                                              └──→ 读 process.env ──→ 有值？──→ 用 env Key
                                                                           │
                                                                           └──→ Mock Fallback
```

### 3.3 安全原则

| 原则 | 实现方式 |
|------|----------|
| Key 不出服务端 | 客户端永远只拿到脱敏形式（`sk-****xxxx`） |
| 服务端加密存储 | 落盘前用 `crypto.createCipheriv` 加密 |
| 不记录在日志 | 生成日志屏蔽 Key 内容 |
| 传输安全 | 仅通过服务端 API route 操作，不暴露在 `GET /api/settings` 的响应中 |

### 3.4 为什么不用环境变量方案

| 维度 | 纯环境变量 | UI 配置 + env 兜底 |
|------|-----------|-------------------|
| 用户操作 | 编辑文件 → 重启 | 页面输入 → 保存 |
| 即时生效 | 否（需重启） | 是 |
| 非技术人员可用 | 否 | 是 |
| 多 Key 切换 | 不方便 | 方便 |
| 安全性 | 高 | 高（加密落盘） |
| 实现复杂度 | 低 | 中 |

---

## 4. 数据模型

### 4.1 Settings 存储结构

```ts
type LLMSettings = {
  provider: "openai-compatible";  // V1 仅支持此类型
  apiKey: string;                 // 加密后的 Key
  baseUrl: string;                // API 地址
  model: string;                  // 模型名称
  enabled: boolean;               // 是否启用 LLM
  updatedAt: string;
};
```

### 4.2 客户端 API 响应（脱敏版）

```ts
type LLMSettingsPublic = {
  configured: boolean;            // 是否已配置 Key
  maskedKey: string | null;       // 脱敏展示，如 "sk-****x9zA"
  baseUrl: string;
  model: string;
  enabled: boolean;
  connectionStatus: "unknown" | "testing" | "connected" | "failed";
  lastTestedAt: string | null;
};
```

---

## 5. API 设计

### 5.1 获取配置状态

```
GET /api/settings/llm
```

响应：

```json
{
  "configured": true,
  "maskedKey": "sk-****x9zA",
  "baseUrl": "https://api.openai.com/v1",
  "model": "gpt-4o-mini",
  "enabled": true,
  "connectionStatus": "connected",
  "lastTestedAt": "2026-05-29T08:00:00Z"
}
```

### 5.2 保存 API 配置

```
PUT /api/settings/llm
```

请求体：

```json
{
  "apiKey": "sk-new-key",
  "baseUrl": "https://api.openai.com/v1",
  "model": "gpt-4o-mini",
  "enabled": true
}
```

行为：
- 如果 `apiKey` 为空字符串 `""`：清除已有 Key
- 如果 `apiKey` 为脱敏格式（以 `****` 结尾）：保持原有 Key 不变，仅更新其他字段
- 否则：加密新 Key 并覆盖

响应：返回脱敏版 `LLMSettingsPublic`

### 5.3 测试连接

```
POST /api/settings/llm/test
```

行为：
- 用当前 Key 发一个轻量请求到 `{baseUrl}/chat/completions`
- 请求体：`{ "model": "gpt-4o-mini", "messages": [{ "role": "user", "content": "ping" }], "max_tokens": 1 }`
- 返回是否连通

响应：

```json
{
  "ok": true,
  "latencyMs": 342,
  "testedAt": "2026-05-29T08:05:00Z"
}
```

### 5.4 删除配置

```
DELETE /api/settings/llm
```

行为：清除已保存的 API Key，降级到环境变量或 mock 模式。

---

## 6. UI 设计

### 6.1 入口

在侧边栏导航中，将原有的 "平台账号"（当前为不可点击按钮）替换为 "系统设置"，指向 `/settings`。

```tsx
{ label: "系统设置", href: "/settings", icon: Settings }
```

### 6.2 设置页面布局

```
┌─────────────────────────────────────────────────┐
│  ← 返回    OmniPost Workspace                   │
│            系统设置                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─ AI 生成配置 ────────────────────────────────┐│
│  │                                              ││
│  │  AI 模型接入                                  ││
│  │  接入 API 后将使用 AI 智能改写内容，替代默认  ││
│  │  的模板格式生成。                             ││
│  │                                              ││
│  │  启用 LLM 生成    [==== Toggle ====]          ││
│  │                                              ││
│  │  API 地址                                    ││
│  │  ┌──────────────────────────────────────┐    ││
│  │  │ https://api.openai.com/v1            │    ││
│  │  └──────────────────────────────────────┘    ││
│  │                                              ││
│  │  模型名称                                    ││
│  │  ┌──────────────────────────────────────┐    ││
│  │  │ gpt-4o-mini                          │    ││
│  │  └──────────────────────────────────────┘    ││
│  │                                              ││
│  │  API Key                                    ││
│  │  ┌──────────────────────────────────────┐    ││
│  │  │ ●●●●●●●●●●          [👁 显示/隐藏]  │    ││
│  │  │ sk-****x9zA                         │    ││
│  │  └──────────────────────────────────────┘    ││
│  │                                              ││
│  │  ┌────────────────────┐  ┌──────────────┐   ││
│  │  │  🔄 测试连接        │  │  💾 保存配置  │   ││
│  │  └────────────────────┘  └──────────────┘   ││
│  │                                              ││
│  │  连接状态: 🟢 已连接 (2026-05-29 08:05)      ││
│  │                                              ││
│  └──────────────────────────────────────────────┘│
│                                                 │
│  ┌─ 当前模式状态 ───────────────────────────────┐│
│  │  生成模式: Mock 模板 / LLM 智能生成           ││
│  │  环境变量: 未配置 / 已配置（作为兜底）        ││
│  └──────────────────────────────────────────────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6.3 交互细节

| 状态 | 行为 |
|------|------|
| 无 Key | 显示"未配置 API Key，当前使用模板模式"提示 |
| Key 已配置但未测试 | 显示"已保存，可测试连接确认是否可用" |
| 连接测试中 | 按钮显示 loading，状态变为 "测试中..." |
| 连接成功 | 绿色状态 + 延迟数值 + 时间戳 |
| 连接失败 | 红色状态 + 错误信息摘要 |
| 保存成功 | Toast 提示 "配置已保存" |
| Toggle 关闭 | 即使有 Key 也用 Mock 模式 |

### 6.4 输入框处理

- API Key 输入框默认 `type="password"`，右侧有显示/隐藏切换
- 已保存 Key 后，输入框显示脱敏密文（`sk-****x9zA`），placeholder 为 "留空则不修改现有 Key"
- 修改 Key 时清除脱敏显示，重新输入
- API 地址和模型名称正常文本输入

---

## 7. 实现计划

### 7.1 文件变更清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/app/settings/page.tsx` | 设置页面 |
| 新增 | `src/app/api/settings/llm/route.ts` | API 配置的 CRUD |
| 新增 | `src/app/api/settings/llm/test/route.ts` | 连接测试 |
| 新增 | `src/lib/crypto.ts` | 加解密工具函数 |
| 新增 | `src/lib/llm/settings-store.ts` | LLM 设置的存取逻辑 |
| 修改 | `src/lib/llm/generate.ts` | 读取逻辑改为 settings → env → mock 优先级 |
| 修改 | `src/components/shell/AppNav.tsx` | "平台账号" → "系统设置" + 路由 |
| 修改 | `src/lib/db/json-store.ts` | 新增 llmSettings 的读写方法 |
| 新增 | `src/components/settings/LLMSettingsCard.tsx` | API 配置卡片组件 |

### 7.2 开发顺序

1. 后端：加密工具 + settings store 读写逻辑
2. 后端：`GET/PUT/DELETE /api/settings/llm` 路由
3. 后端：`POST /api/settings/llm/test` 连接测试
4. 修改 `generate.ts`：settings → env → mock 三级优先级
5. 前端：`/settings` 页面 + `LLMSettingsCard` 组件
6. 前端：`AppNav` 侧边栏菜单更新
7. 集成测试：配置 → 保存 → 测试连接 → 生成内容验证

### 7.3 加密方案

```ts
// src/lib/crypto.ts
import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.OMNIPOST_ENCRYPTION_KEY 
  ?? "omnipost-dev-key-32-chars-fixed!!"; // 生产环境必须通过 env 覆盖

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "utf-8"), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, dataHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "utf-8"), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf-8");
}
```

---

## 8. generate.ts 改动

最小改动，在现有逻辑前插入 settings store 查询：

```ts
// 原逻辑
if (process.env.OMNIPOST_USE_LLM !== "true" || !process.env.OPENAI_API_KEY) {
  return null;
}

// 改后
async function getLLMConfig(): Promise<{
  enabled: boolean; apiKey: string | null; baseUrl: string; model: string;
} | null> {
  // 1. 优先读 UI 设置
  const stored = await getLLMSettings();
  if (stored?.enabled && stored.apiKey) {
    return {
      enabled: true,
      apiKey: decrypt(stored.apiKey),
      baseUrl: stored.baseUrl,
      model: stored.model
    };
  }

  // 2. 回退到环境变量
  if (process.env.OMNIPOST_USE_LLM === "true" && process.env.OPENAI_API_KEY) {
    return {
      enabled: true,
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OMNIPOST_OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      model: process.env.OMNIPOST_OPENAI_MODEL ?? "gpt-4o-mini"
    };
  }

  // 3. 无可用配置
  return null;
}
```

---

## 9. 验收标准

- [ ] 用户可在 `/settings` 页面输入 API Key、地址、模型并保存
- [ ] API Key 以密文形式存储，客户端只获取脱敏版本
- [ ] "测试连接"按钮可验证配置是否可用
- [ ] 生成内容时优先使用 UI 配置，再回退环境变量，最后 mock
- [ ] 侧边栏"系统设置"可正常导航
- [ ] 配置保存后即时生效，无需重启服务
- [ ] mock 模式下 workspace 页面有明确提示
- [ ] `npm run typecheck` 通过
- [ ] `npm run build` 通过
