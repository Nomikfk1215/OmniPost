# OmniPost 多平台内容发布工具 V1 PRD

> 文档定位：总文档  
> 版本：V1.0  
> 目标周期：24 小时可交付 Demo  
> 相关文档：  
> - `产品形态和页面分区设计.md`：说明产品长什么样、页面怎么拆。  
> - `渠道分析.md`：说明公众号、知乎、小红书、B站专栏的内容格式、发布流程和案例差异。  
> - `tech-stack.md`：技术选型（框架、数据库、AI 模型、状态管理）。  
> - `prompt-design.md`：AI Prompt 模板、风格片段、输出 JSON Schema。  
> - `project-structure.md`：项目目录结构、状态管理设计、组件树、校验器设计。  

---

## 1. 产品一句话

**OmniPost 是一个多平台内容发布工作台。**

用户输入一份原始内容，系统自动生成适合微信公众号、知乎、小红书、B站专栏的多个发布版本，并支持编辑、预览、规则校验和一键模拟发布。

V1 核心闭环：

```text
输入内容
  ↓
内容结构化
  ↓
平台适配
  ↓
结果编辑
  ↓
多平台预览
  ↓
一键模拟发布
  ↓
发布记录
```

---

## 2. 产品定位

OmniPost V1 不是：

```text
不是聊天机器人
不是完整 CMS
不是真实平台发布后台
不是完全自主 Agent
```

OmniPost V1 是：

```text
一个多平台内容创作与模拟发布工作台
```

核心价值是：

> 帮助创作者把一份原始内容快速改造成多个平台适合发布的版本。

---

## 3. 背景与问题

创作者经常需要把同一份内容发布到多个平台，但每个平台的内容形态不同：

| 平台 | 创作者通常要做的额外工作 |
|---|---|
| 微信公众号 | 改成长文结构、写摘要、整理封面、处理排版 |
| 知乎 | 改成问题式标题、结论先行、分点论证、降低营销感 |
| 小红书 | 改成短标题、短句、emoji、标签、图片笔记 |
| B站专栏 | 改成有看点标题、简介、分区、标签、专栏正文 |

当前痛点：

```text
重复复制粘贴
反复改标题
反复调语气
反复改排版
不知道每个平台应该怎么写
真实发布接口和平台权限复杂
```

---

## 4. V1 产品目标

### 4.1 核心目标

V1 只追求一个完整闭环：

```text
输入一份内容
  ↓
生成多个平台版本
  ↓
用户编辑确认
  ↓
平台样式预览
  ↓
模拟发布成功
```

### 4.2 成功标准

V1 完成后，用户可以：

1. 输入一份标题、正文和可选配图。
2. 选择目标平台：公众号、知乎、小红书、B站专栏。
3. 选择风格预设，首版至少稳定支持“专业干货型”。
4. 一次生成四个平台的差异化内容。
5. 在同一个工作台中编辑各平台内容。
6. 看到当前平台的仿真预览。
7. 看到标题长度、标签数量、摘要长度、图片建议等校验结果。
8. 一键模拟发布。
9. 在发布记录中查看模拟发布结果和链接。

---

## 5. V1 功能边界

本节是 V1 开发范围的唯一判断入口。其他文档只描述页面、结构或平台规则，不再单独扩展范围。

| 模块 | 本轮做到哪 | 边界 |
|---|---|---|
| 内容输入 | 标题、正文、可选图片上传或本地预览、用户标签 | 不做 OCR、长图识别、图片裁剪、图片编辑 |
| 平台选择 | 四个平台多选：公众号、知乎、小红书、B站专栏 | 不做账号绑定和平台授权 |
| 风格选择 | 至少稳定支持“专业干货型”；“轻松种草型”作为 48h 增强 | 不做大量风格库和用户自定义风格 |
| 平台适配 | 基于平台 Skill + 风格 Preset 生成结构化 JSON | 不做自主 Agent、多轮规划、流式复杂编排 |
| 结果编辑 | 用户可编辑标题、正文、摘要、标签、平台特有字段 | 不做富文本深度编辑器 |
| 平台预览 | 当前平台右侧预览，四个平台样式有明显差异 | 不追求真实平台 1:1 还原 |
| 规则校验 | 用代码校验字段必填、长度、标签数量、平台特有建议 | 不把 AI 输出当作唯一校验依据 |
| 模拟发布 | 创建模拟发布任务，生成各平台结果和可查看链接 | 不调用真实平台 API，不做浏览器自动发布 |
| 发布记录 | 展示历史模拟发布任务、平台、状态、时间和链接 | 不做数据分析、评论管理、定时发布 |
| 扩展架构 | 保留平台注册表、Skill、Validator、Preview 映射 | 不做独立平台配置管理页面 |

---

## 6. 核心用户流程

### 6.1 文字 + 图片输入流程

```text
进入工作台
  ↓
点击新建内容
  ↓
选择“文字 + 图片”
  ↓
输入标题、正文、上传图片
  ↓
选择平台和风格
  ↓
点击生成
  ↓
中栏出现各平台版本
  ↓
用户逐个平台编辑
  ↓
右栏查看预览和校验
  ↓
一键模拟发布
  ↓
查看发布记录和模拟链接
```

## 7. 产品形态概述

V1 推荐使用三栏式工作台。

```text
左栏：原始内容输入
中栏：平台版本编辑
右栏：平台预览与规则校验
```

整体结构：

```text
顶部导航
  ↓
步骤条
  ↓
平台与风格设置
  ↓
三栏创作区
  ↓
模拟发布状态
  ↓
发布记录
```

详细页面设计见：

```text
产品形态和页面分区设计.md
```

---

## 8. 平台差异概述

V1 选择四个平台：

```text
微信公众号
知乎
小红书
B站专栏
```

四个平台不是简单换语气，而是内容结构不同。

| 平台 | V1 输出重点 |
|---|---|
| 微信公众号 | 标题、摘要、封面建议、长文正文、排版结构 |
| 知乎 | 问题式标题、结论先行、分点论证、标签 |
| 小红书 | 短标题、emoji、短句、话题标签、图片建议 |
| B站专栏 | 有看点标题、简介、正文、标签、分区建议 |

详细案例见：

```text
渠道分析.md
```

---

## 9. 风格预设设计

### 9.1 总体策略

这里避免：

```text
N 个风格 × 4 个平台 = N×4 套模板
```

V1 做：

```text
4 个平台 Skill + N 个全局风格 Preset
```

运行时组合：

```text
原始内容 + 平台 Skill + 风格 Preset = 平台最终内容
```

### 9.2 平台 Skill 负责什么

平台 Skill 定义平台稳定规则：

```text
平台定位
标题规则
正文规则
摘要规则
标签规则
图片规则
输出字段
校验规则
Prompt 约束
```

例如小红书 Skill：

```text
标题短
正文短句
可以使用 emoji
需要话题标签
图片优先
建议 3:4 封面
```

### 9.3 风格 Preset 负责什么

风格 Preset 定义表达倾向：

```text
语气
结构
emoji 程度
营销感强弱
叙事方式
```

V1 两个风格：

| 风格 | 说明 | 更适合 |
|---|---|---|
| 专业干货型 | 理性、结构化、信息密度高 | 公众号、知乎、B站专栏 |
| 轻松种草型 | 口语化、体验感、适度 emoji | 小红书、B站专栏 |

### 9.4 冲突优先级

当平台规则和风格冲突时，优先级为：

```text
平台硬规则 > 内容安全规则 > 平台 Skill > 风格 Preset > 用户补充偏好
```

示例：

用户选择“轻松种草型”并发布到知乎时：

```text
可以更通俗、更有个人经验
但不能变成大量 emoji 和夸张标题
```

---

## 10. AI 与代码职责边界

### 10.1 架构原则

V1 不是让 AI 自己操作全流程。

V1 是：

```text
代码调度流程
AI 完成生成
代码做校验和发布
```

### 10.2 职责表

| 步骤 | 负责方 | 说明 |
|---|---|---|
| 用户输入表单 | 代码 | 前端表单和校验 |
| 图片上传 | 代码 | 存储文件、生成 URL |
| 内容结构提取 | AI | 摘要、关键词、段落结构 |
| 统一内容模型 | 代码 + AI | AI 辅助提取，代码落结构 |
| 加载平台 Skill | 代码 | 从 JSON 或数据库读取 |
| 拼接 Prompt | 代码 | 原文 + Skill + Preset + Schema |
| 平台内容生成 | AI | 标题、正文、摘要、标签 |
| JSON 解析 | 代码 | 解析模型输出 |
| 规则校验 | 代码 | 字数、标签、必填字段 |
| 预览渲染 | 代码 | 前端组件 |
| 人工编辑 | 用户 + 代码 | 修改内容 |
| 模拟发布 | 代码 | 写入发布任务 |
| 发布记录 | 代码 | 查询数据库 |

---

## 11. 工作流设计

### 11.1 主工作流

```text
Input Parser
  ↓
Content Extractor
  ↓
Content Normalizer
  ↓
Platform Skill Loader
  ↓
Prompt Builder
  ↓
LLM Adapter
  ↓
JSON Parser
  ↓
Rule Validator
  ↓
Preview Renderer
  ↓
Mock Publisher
```

### 11.2 伪代码

```ts
async function runWorkflow(input) {
  const parsedInput = await parseInput(input);

  const extracted = await extractContent(parsedInput);

  const unifiedContent = normalizeContent(extracted);

  const outputs = [];

  for (const platform of input.platforms) {
    const skill = loadPlatformSkill(platform);
    const preset = loadStylePreset(input.stylePreset);

    const prompt = buildPrompt({
      content: unifiedContent,
      skill,
      preset
    });

    const generated = await callLLM(prompt);

    const platformContent = parsePlatformContent(generated, skill.outputSchema);

    const validation = validatePlatformContent(platformContent, skill);

    outputs.push({
      platform,
      platformContent,
      validation
    });
  }

  return outputs;
}
```

---

## 12. 数据结构设计

### 12.1 Content

```ts
type Content = {
  id: string;
  title?: string;
  rawText: string;
  images: string[];
  userTags?: string[];
  createdAt: string;
  updatedAt: string;
};
```

### 12.2 UnifiedContent

```ts
type UnifiedContent = {
  id: string;
  title: string;
  summary: string;
  body: Array<{
    type: "heading" | "paragraph" | "image";
    content: string;
  }>;
  images: string[];
  tags: string[];
};
```

### 12.3 PlatformContent

```ts
type PlatformContent = {
  id: string;
  contentId: string;
  platform: "wechat" | "zhihu" | "xiaohongshu" | "bilibili";
  title: string;
  body: string;
  summary?: string;
  digest?: string;
  description?: string;
  tags?: string[];
  imageSuggestions?: string[];
  categorySuggestion?: string;
  validation: ValidationResult;
  createdAt: string;
};
```

### 12.4 ValidationResult

```ts
type ValidationResult = {
  passed: boolean;
  level: "pass" | "warning" | "error";
  warnings: string[];
};
```

### 12.5 PublishTask

```ts
type PublishTask = {
  id: string;
  contentId: string;
  mode: "mock";
  status: "pending" | "publishing" | "success" | "failed";
  results: PublishResult[];
  createdAt: string;
  finishedAt?: string;
};
```

---

## 13. 后端接口设计

### 13.1 创建内容

```http
POST /api/contents
```

### 13.2 生成平台内容

```http
POST /api/contents/{contentId}/generate
```

### 13.3 更新平台内容

```http
PUT /api/platform-contents/{platformContentId}
```

### 13.4 模拟发布

```http
POST /api/publish/mock
```

### 13.5 获取发布记录

```http
GET /api/publish/tasks
```

---

## 14. 扩展更多平台

### 14.1 新增平台时要补什么

如果只新增“内容适配 + 预览 + 模拟发布”，需要补：

```text
skill.json
validator.ts
preview.tsx
mockPublisher.ts
platformRegistry 注册项
```

### 14.2 新增平台流程

```text
新增平台 Skill
  ↓
新增校验规则
  ↓
新增预览组件
  ↓
新增模拟发布配置
  ↓
注册到平台列表
```

主工作流不需要改。

### 14.3 新增平台成本判断

| 新增能力 | 难度 |
|---|---|
| 内容适配 | 低 |
| 预览样式 | 中 |
| 模拟发布 | 低 |
| 官方 API 发布 | 高 |
| 浏览器辅助发布 | 高 |

---

## 15. V1 24-48 小时开发顺序

### P0：先完成闭环

```text
创作台三栏主页面
标题 / 正文 / 可选图片输入
四个平台选择
专业干货型风格
四个平台内容生成
平台结果编辑
右侧预览
规则校验
模拟发布
发布记录
```

### P1：闭环完成后补强

```text
轻松种草型风格
通用模拟详情页
重新生成单个平台
图片上传体验优化
模拟发布状态的视觉优化
```

---

## 16. Demo 路线

推荐演示：

```text
1. 打开工作台
2. 输入一篇文章：如何用 AI 提升学习效率
3. 可选上传一张配图
4. 选择公众号、知乎、小红书、B站专栏
5. 选择专业干货型
6. 点击生成
7. 展示四个平台版本
8. 切换小红书，展示短标题、emoji、标签、图片建议
9. 切换公众号，展示摘要、长文结构、封面建议
10. 切换知乎，展示问题式标题、结论先行
11. 切换 B站专栏，展示简介、标签、分区建议
12. 一键模拟发布
13. 查看发布记录和模拟链接
```

---

## 17. 风险与处理

| 风险 | 处理 |
|---|---|
| AI 输出不稳定 | 强制 JSON Schema，失败重试 |
| AI 生成不符合平台要求 | 代码校验兜底 |
| API Key 缺失或接口不可用 | 提供本地 mock 生成结果，保证演示闭环 |
| 页面太复杂 | 主流程集中在三栏工作台 |

---

## 18. 总结

OmniPost V1 的核心不是“把内容自动发出去”，而是：

```text
把一份内容变成适合多个平台发布的多个版本
```

V1 的正确产品形态是：

```text
三栏式多平台内容创作工作台
```

V1 的正确技术策略是：

```text
固定工作流 + 平台 Skill + 风格 Preset + LLM 生成节点 + 代码校验 + 模拟发布
```
