# OmniPost V1 AI Prompt 工程设计

> 目标：定义每个平台的 Prompt 模板、风格片段、输出 JSON Schema，确保 AI 生成结果稳定可解析。

---

## 1. 架构回顾

```
原始内容 + 平台 Skill + 风格 Preset → Prompt → LLM → JSON → 校验
```

Prompt 由三段拼接：

```text
[System Prompt]       ← 一次性设定角色 + 平台规则
[Style Fragment]      ← 风格 Preset 的语气/结构要求
[User Content]        ← 用户原始标题 + 正文 + 图片引用
[Output Schema]       ← JSON Schema，通过 structured output 强制遵守
```

---

## 2. 共享 System Prompt 头部（所有平台共用）

```
你是一个专业的多平台内容编辑助手。你的任务是将用户提供的原始内容，
改写为适合指定平台发布的版本。

通用规则：
- 保留原始内容的核心信息和观点，不编造事实。
- 根据平台特点调整标题、结构、语气和表达方式。
- 输出的 JSON 必须严格符合指定的 schema。
- 标签使用中文或中英混合，不使用纯英文标签。
- 如果用户没有提供标题，根据正文生成一个合适的标题。
```

---

## 3. 风格 Preset 片段

### 3.1 专业干货型（默认）

```
风格要求：
- 语气理性、克制、信息密度高。
- 结构清晰：先给结论或框架，再展开细节。
- 避免情绪化表达和夸张修辞。
- 少用 emoji，仅在结构分点时可使用 ✅ 等符号。
- 像一篇值得收藏的工具方法论文章。
```

### 3.2 轻松种草型

```
风格要求：
- 语气口语化、亲切、有个人体验感。
- 可以适度使用 emoji 增加可读性。
- 结构可以是"痛点→体验→收获"的叙事方式。
- 像朋友在分享一个自己用过觉得好的方法。
- 但仍然要保持信息准确，不夸大。
```

---

## 4. 四个平台 Prompt 模板

### 4.1 微信公众号

#### 平台规则

```
平台：微信公众号
定位：长文深度阅读、观点表达、私域传播

标题规则：
- 长度不超过 30 字（中文）。
- 清晰有信息量，能表达文章收益，适合转发。
- 不使用大量 emoji，不使用"震惊""速看"等标题党写法。

摘要规则：
- 不超过 120 字，概括文章核心内容。
- 让读者一眼知道这篇文章讲什么。

正文规则：
- 使用 HTML 格式，包含 <h2>、<p>、<strong>、<blockquote> 等标签。
- 结构完整：引言 → 分节（2-4 个小标题）→ 总结。
- 段落不宜过长，每段 3-5 句。
- 重点内容使用 <strong> 加粗。

封面建议：
- 描述封面图应突出的关键词和风格。

图片建议：
- 建议在哪些位置配什么类型的图片。
```

#### 输出 Schema

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string", "maxLength": 60 },
    "digest": { "type": "string", "maxLength": 120 },
    "html": { "type": "string" },
    "coverSuggestion": { "type": "string" },
    "imageSuggestions": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 5
    }
  },
  "required": ["title", "digest", "html"]
}
```

---

### 4.2 知乎

#### 平台规则

```
平台：知乎
定位：知识问答、经验分享、理性讨论

标题规则：
- 使用问题式标题（如"普通人如何..."）或清晰的观点式标题。
- 让人一眼知道你要回答什么问题。
- 不使用 emoji，不情绪化。

正文规则：
- 开头第一段直接给结论，不铺垫。
- 正文按"原因分析 → 方法步骤 → 注意事项"的结构展开。
- 每个论点单独成段，用序号或小标题区分。
- 减少营销感，强调个人经验和可操作性。
- 不使用 emoji。

标签规则：
- 2-5 个标签，使用中文短语。
```

#### 输出 Schema

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "openingConclusion": { "type": "string", "maxLength": 200 },
    "body": { "type": "string" },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 2,
      "maxItems": 5
    }
  },
  "required": ["title", "openingConclusion", "body", "tags"]
}
```

---

### 4.3 小红书

#### 平台规则

```
平台：小红书
定位：生活方式分享、种草、经验笔记

标题规则：
- 短标题，不超过 20 字。
- 直接、有结果感、带情绪（如"真的香""救了我""太好用了"）。
- 可以适度使用 emoji。

正文规则：
- 短句优先，多用换行分隔。
- 使用 emoji 增加可读性和亲和力。
- 结构建议：痛点 → 方法清单 → 适合人群。
- 分点使用 ✅ ✨ 等符号。
- 正文末尾加入互动引导（如"收藏起来慢慢看"）。

标签规则：
- 3-8 个话题标签，带 # 前缀。
- 标签涵盖内容主题、领域、人群。

图片建议：
- 建议使用 3:4 比例封面图。
- 封面标题建议控制在 6-10 字。
```

#### 输出 Schema

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string", "maxLength": 40 },
    "body": { "type": "string" },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 3,
      "maxItems": 8
    },
    "imageSuggestions": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 3
    },
    "interactionGuide": { "type": "string", "maxLength": 50 }
  },
  "required": ["title", "body", "tags"]
}
```

---

### 4.4 B站专栏

#### 平台规则

```
平台：B站专栏
定位：年轻化知识分享、视频内容补充

标题规则：
- 有看点、能吸引点击，但不过分标题党。
- 可以比公众号更口语化一些，像视频标题的风格。
- 长度控制在 30 字以内。

简介规则：
- 用 2-3 句话概括专栏内容，让读者决定是否继续看。

正文规则：
- 开头轻松引入，不端着。
- 可以分点，但语气比知乎随意。
- 适合年轻用户阅读，可以适度玩梗。

标签规则：
- 3-10 个标签，中文短语。

分区建议：
- 给出推荐的分区，如"知识""科技""生活"等。
```

#### 输出 Schema

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string", "maxLength": 60 },
    "description": { "type": "string", "maxLength": 200 },
    "body": { "type": "string" },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 3,
      "maxItems": 10
    },
    "categorySuggestion": { "type": "string" },
    "coverSuggestion": { "type": "string" }
  },
  "required": ["title", "description", "body", "tags", "categorySuggestion"]
}
```

---

## 5. Prompt 拼接逻辑（伪代码）

```ts
function buildPrompt(params: {
  content: { title?: string; body: string; userTags?: string[] };
  platform: Platform;
  stylePreset: StylePreset;
}): { systemPrompt: string; userMessage: string; schema: JsonSchema } {

  const platformConfig = PLATFORM_CONFIGS[params.platform];
  const styleFragment = STYLE_FRAGMENTS[params.stylePreset];

  const systemPrompt = [
    SHARED_SYSTEM_HEADER,
    platformConfig.rules,
    styleFragment,
  ].join("\n\n");

  const userMessage = [
    params.content.title ? `原标题：${params.content.title}` : "",
    `正文：\n${params.content.body}`,
    params.content.userTags?.length
      ? `用户标签：${params.content.userTags.join("、")}`
      : "",
  ].filter(Boolean).join("\n\n");

  return {
    systemPrompt,
    userMessage,
    schema: platformConfig.outputSchema,
  };
}
```

---

## 6. 错误处理策略

| 场景 | 处理 |
|---|---|
| AI 返回 JSON 解析失败 | Vercel AI SDK `generateObject()` 自动重试 3 次 |
| AI 返回字段缺失 | Schema required 字段校验，缺失时重新生成单平台 |
| AI 生成内容为空 | 前端展示错误状态，提示用户重试 |
| API 超时（>30s） | 前端显示超时提示，保留已生成内容 |
| Token 超限 | 正文过长时在拼接前截断（保留前 3000 字） |

---

## 7. 降级方案

如果 Vercel AI SDK 接入遇到问题，降级为：

```ts
// 直接调用 fetch，手动拼接 role/content
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
  body: JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  }),
});
```

然后在代码中手动解析 JSON 并重试。
