export type DocSection = {
  title: string;
  items: DocItem[];
};

export type DocItem = {
  slug: string;
  title: string;
  description?: string;
};

export type DocContent = {
  title: string;
  description: string;
  body: string; // HTML content
};

export const docsNav: DocSection[] = [
  {
    title: "快速开始",
    items: [
      { slug: "", title: "介绍", description: "了解 OmniPost 的核心能力与设计理念" },
      { slug: "getting-started", title: "安装与配置", description: "本地部署与基础配置指南" },
      { slug: "concepts", title: "基本概念", description: "内容、平台版本、发布任务等核心概念" },
    ],
  },
  {
    title: "平台指南",
    items: [
      { slug: "platforms/wechat", title: "微信公众号", description: "完整配置指南：从 AppID 到发布" },
      { slug: "platforms/zhihu", title: "知乎", description: "知乎回答与文章适配规则详解" },
      { slug: "platforms/xiaohongshu", title: "小红书", description: "小红书笔记适配规则与封面建议" },
      { slug: "platforms/bilibili", title: "Bilibili", description: "B 站专栏适配规则与互动元素" },
    ],
  },
  {
    title: "LLM 配置",
    items: [
      { slug: "llm-setup", title: "配置 LLM 接口", description: "各平台 API Key 获取与填入的完整步骤" },
      { slug: "prompt-design", title: "Prompt 设计", description: "了解 OmniPost 的 Prompt 架构与自定义方法" },
      { slug: "model-selection", title: "模型选择建议", description: "不同模型的适用场景与效果对比" },
    ],
  },
  {
    title: "API 参考",
    items: [
      { slug: "api/contents", title: "内容管理 API", description: "创建、查询与更新内容" },
      { slug: "api/publish", title: "发布 API", description: "模拟发布与真实平台对接" },
      { slug: "api/settings", title: "设置 API", description: "LLM 配置与平台凭证管理" },
    ],
  },
];

const docs: Record<string, DocContent> = {
  // =====================================================================
  // 介绍
  // =====================================================================
  "": {
    title: "介绍",
    description: "了解 OmniPost 的核心能力与设计理念",
    body: `
<p>OmniPost 是一个<strong>多平台内容适配工作台</strong>——你用 Markdown 写一次内容，它帮你一键生成适配微信公众号、知乎、小红书、Bilibili 等平台的版本，智能调整排版、语气与标签。</p>

<h2>为什么需要 OmniPost？</h2>

<p>每个内容平台都有自己的"语言"：微信公众号适合深度长文，知乎需要专业开篇和互动引导，小红书强调口语化和 emoji 节奏，B 站专栏讲究分段结构和社区氛围。</p>

<p>手动为每个平台改写内容耗时耗力，而且难以保持一致性。OmniPost 通过 LLM 理解你的内容核心，自动完成跨平台风格迁移。</p>

<h2>核心能力</h2>

<ul>
  <li><strong>智能内容理解</strong>——LLM 提取内容摘要、核心要点、关键词、受众定位与语气</li>
  <li><strong>多平台适配生成</strong>——为每个平台生成专属版本，包括标题、正文、标签、封面建议</li>
  <li><strong>风格预设系统</strong>——casual 与 professional 两套预设，支持细粒度格式化控制</li>
  <li><strong>平台预览渲染</strong>——仿真预览各平台的实际展示效果</li>
  <li><strong>内容校验</strong>——自动检测标题长度、标签数量等平台规则，给出三级校验结果</li>
  <li><strong>模拟 & 真实发布</strong>——先模拟发布查看效果，确认后可对接真实平台 API</li>
</ul>

<h2>技术栈</h2>

<p>OmniPost 基于 Next.js 14 App Router + React 18 + TypeScript + Tailwind CSS 3 构建，使用 Zod 进行运行时校验，数据存储在本地 JSON 文件中（可迁移至 SQLite）。</p>
`,
  },

  // =====================================================================
  // 安装与配置
  // =====================================================================
  "getting-started": {
    title: "安装与配置",
    description: "本地部署与基础配置指南",
    body: `
<h2>环境要求</h2>
<ul>
  <li>Node.js 18+</li>
  <li>npm / yarn / pnpm</li>
</ul>

<h2>第一步：克隆项目</h2>

<pre><code>git clone https://github.com/your-org/omnipost.git
cd omnipost</code></pre>

<h2>第二步：安装依赖</h2>

<pre><code>npm install</code></pre>

<h2>第三步：配置环境变量</h2>

<p>复制 <code>.env.example</code> 为 <code>.env.local</code>：</p>

<pre><code>cp .env.example .env.local</code></pre>

<p>编辑 <code>.env.local</code>，填入以下内容：</p>

<table>
  <thead>
    <tr><th>变量</th><th>说明</th><th>是否必需</th><th>默认值</th></tr>
  </thead>
  <tbody>
    <tr><td><code>OMNIPOST_USE_LLM</code></td><td>是否启用 LLM 生成</td><td>否</td><td><code>false</code></td></tr>
    <tr><td><code>OPENAI_API_KEY</code></td><td>OpenAI 兼容接口的 API Key</td><td>否*</td><td>—</td></tr>
    <tr><td><code>OMNIPOST_OPENAI_BASE_URL</code></td><td>API 地址</td><td>否</td><td><code>https://api.openai.com/v1</code></td></tr>
    <tr><td><code>OMNIPOST_OPENAI_MODEL</code></td><td>模型名称</td><td>否</td><td><code>gpt-4o-mini</code></td></tr>
    <tr><td><code>OMNIPOST_ENCRYPTION_KEY</code></td><td>UI 端密钥加密密钥</td><td>推荐</td><td>—</td></tr>
  </tbody>
</table>

<div class="docs-callout info">
  <strong>*注意：</strong>API Key 也可以在 UI 界面中配置（系统设置 &gt; LLM 配置），优先级高于环境变量。如果两者都未配置，OmniPost 将使用内置 Mock 数据。
</div>

<h2>第四步：启动开发服务器</h2>

<pre><code>npm run dev</code></pre>

<p>访问 <code>http://localhost:3000</code>：</p>
<ul>
  <li>首页（Landing）—— <code>/</code></li>
  <li>工作台 —— <code>/workspace</code></li>
  <li>文档 —— <code>/docs</code></li>
  <li>系统设置 —— <code>/settings</code></li>
</ul>

<h2>第五步：构建生产版本</h2>

<pre><code>npm run build
npm run start</code></pre>

<p>生产构建输出到 <code>.next</code> 目录，默认监听 3000 端口。</p>
`,
  },

  // =====================================================================
  // 基本概念
  // =====================================================================
  concepts: {
    title: "基本概念",
    description: "内容、平台版本、发布任务等核心概念",
    body: `
<h2>原始内容 (Content)</h2>

<p>你在编辑器中用 Markdown 撰写的原始内容。它包含标题、正文、标签、图片等信息，是适配生成的起点。</p>

<h2>平台版本 (PlatformContent)</h2>

<p>原始内容经 LLM 适配后，为每个目标平台生成的专属版本。每个平台版本包含：</p>
<ul>
  <li><strong>标题</strong>——按平台规则重新生成的标题</li>
  <li><strong>正文</strong>——经格式化和风格优化后的内容</li>
  <li><strong>摘要/导语</strong>——平台特定的摘要或开篇</li>
  <li><strong>标签</strong>——平台优化后的内容标签</li>
  <li><strong>封面建议</strong>——推荐的封面图方向</li>
  <li><strong>校验结果</strong>——平台规则校验的通过/警告/错误信息</li>
</ul>

<h2>风格预设 (StylePreset)</h2>

<p>两套内置风格：</p>
<ul>
  <li><strong>casual</strong>——轻松、口语化的表达方式</li>
  <li><strong>professional</strong>——正式、专业的表达方式</li>
</ul>

<p>可通过高级设置进行更细粒度的格式化控制。</p>

<h2>发布任务 (PublishTask)</h2>

<p>每次发布操作创建一个发布任务，包含发布模式（mock/real）、目标平台、各平台发布状态与结果链接。</p>

<h2>工作流步骤</h2>
<ol>
  <li><strong>Input（输入）</strong>——撰写原始 Markdown 内容</li>
  <li><strong>Adapt（适配）</strong>——LLM 生成各平台版本</li>
  <li><strong>Preview（预览）</strong>——查看和微调各平台版本</li>
  <li><strong>Publish（发布）</strong>——模拟或真实发布</li>
</ol>
`,
  },

  // =====================================================================
  // 微信公众号 — 超详细版
  // =====================================================================
  "platforms/wechat": {
    title: "微信公众号 — 完整配置指南",
    description: "从零开始：获取 AppID 和 AppSecret、填入 OmniPost、生成内容、发布",
    body: `
<h2>概述</h2>

<p>微信公众号是 OmniPost 首个支持<strong>真实发布</strong>的平台。配置完成后，你可以直接在 OmniPost 中将内容推送到公众号草稿箱。</p>

<h2>第一步：获取微信公众号 AppID 和 AppSecret</h2>

<p>这两个值需要从微信公众平台后台获取。请按照以下步骤操作：</p>

<h3>1.1 登录微信公众平台</h3>

<p>打开浏览器，访问 <a href="https://mp.weixin.qq.com" target="_blank" rel="noopener">https://mp.weixin.qq.com</a>，使用你的公众号管理员微信扫码登录。</p>

<div class="docs-callout warning">
  <strong>注意：</strong>必须是<strong>服务号</strong>或<strong>订阅号</strong>（已认证），个人号无法使用 API 发布功能。确保你的公众号已经通过微信认证。
</div>

<h3>1.2 找到 AppID</h3>

<p>登录后，在左侧菜单栏点击 <strong>"设置与开发"</strong>（页面底部附近）→ 选择 <strong>"基本配置"</strong>。</p>

<p>在基本配置页面中，你会看到：</p>
<ul>
  <li><strong>AppID（应用 ID）</strong>——一串以 <code>wx</code> 开头的字符，如 <code>wx1234567890abcdef</code></li>
  <li>这就是你需要复制保存的第一个值</li>
</ul>

<div class="docs-callout tip">
  <strong>提示：</strong>AppID 是公开信息，不会变动。你可以直接复制保存。
</div>

<h3>1.3 获取 AppSecret</h3>

<p>在同一个 <strong>"基本配置"</strong> 页面中，找到 <strong>"AppSecret（应用密钥）"</strong>。</p>

<p>AppSecret 默认是隐藏的。点击旁边的 <strong>"重置"</strong> 按钮：</p>
<ol>
  <li>系统会要求你再次扫描二维码验证管理员身份</li>
  <li>验证通过后，页面会显示新的 AppSecret（一串 32 位字符）</li>
  <li><strong>立即复制保存！</strong>关闭页面后将无法再次查看</li>
</ol>

<div class="docs-callout warning">
  <strong>⚠️ 重要：</strong>AppSecret 仅在重置时显示一次！请务必在关闭页面前复制并妥善保存。如果遗失，只能再次重置（之前的 AppSecret 会失效）。
</div>

<h3>1.4 配置 IP 白名单（重要）</h3>

<p>在 <strong>"基本配置"</strong> 页面中，找到 <strong>"IP 白名单"</strong> 设置区域。</p>

<p>点击 <strong>"修改"</strong>，将你的服务器 IP 地址添加进去（每行一个）。如果你在本地开发，可以暂时添加你的公网 IP。部署到服务器后，需要更新为服务器的出口 IP。</p>

<div class="docs-callout info">
  <strong>开发阶段：</strong>你可以先跳过 IP 白名单配置，本地 Mock 发布不需要。但要进行真实 API 发布时，必须配置。
</div>

<h2>第二步：在 OmniPost 中填入凭证</h2>

<h3>2.1 打开设置页面</h3>

<p>在 OmniPost 中，点击左侧导航栏的 <strong>"系统设置"</strong>（或直接访问 <code>/settings</code>）。</p>

<h3>2.2 找到"平台凭证"卡片</h3>

<p>在设置页面中，往下滚动找到 <strong>"平台凭证"</strong> 区域。你会看到各平台的配置卡片。</p>

<h3>2.3 填写微信公众号凭证</h3>

<p>在 <strong>"微信公众号"</strong> 卡片中：</p>
<ol>
  <li>在 <strong>"AppID"</strong> 输入框中，粘贴从微信公众平台复制的 AppID（以 <code>wx</code> 开头）</li>
  <li>在 <strong>"AppSecret"</strong> 输入框中，粘贴 AppSecret（32 位字符串）</li>
  <li>点击 <strong>"保存"</strong> 按钮</li>
</ol>

<p>保存成功后，微信公众号卡片上会显示 <strong>"已配置"</strong> 状态标记。</p>

<h2>第三步：生成公众号适配内容</h2>

<h3>3.1 进入工作台</h3>

<p>点击左侧导航的 <strong>"内容中心"</strong> 或 <strong>"新建内容"</strong>，进入编辑界面。</p>

<h3>3.2 撰写原始内容</h3>

<p>在左侧面板中：</p>
<ol>
  <li>输入文章<strong>标题</strong></li>
  <li>添加<strong>标签</strong>（按 Enter 确认）</li>
  <li>选择<strong>风格预设</strong>（casual 或 professional）</li>
  <li>在 Markdown 编辑器中撰写<strong>正文</strong></li>
  <li>可选：上传封面图</li>
</ol>

<h3>3.3 一键适配</h3>

<p>在右侧面板中：</p>
<ol>
  <li>确认 <strong>"微信公众号"</strong> 开关已打开（绿色状态）</li>
  <li>点击 <strong>"一键适配"</strong> 按钮</li>
  <li>等待几秒钟，AI 生成完成后自动展示预览</li>
</ol>

<h3>3.4 检查与微调</h3>

<p>生成完成后，你可以：</p>
<ul>
  <li>在预览区查看微信公众号文章的手机端仿真效果</li>
  <li>查看右侧校验面板的规则检查结果（标题长度、摘要字数等）</li>
  <li>如有需要，直接在编辑区修改标题、正文或标签</li>
  <li>点击 <strong>"保存草稿"</strong> 保存修改</li>
</ul>

<h2>第四步：发布到公众号</h2>

<h3>4.1 模拟发布（先预览）</h3>

<p>在底部 <strong>"发布设置"</strong> 面板中：</p>
<ol>
  <li>勾选 <strong>"微信公众号"</strong></li>
  <li>点击 <strong>"模拟发布"</strong></li>
  <li>查看生成的模拟链接，确认效果满意</li>
</ol>

<h3>4.2 真实发布</h3>

<p>确认无误后：</p>
<ol>
  <li>确保已配置 AppID 和 AppSecret（第二步已完成）</li>
  <li>在发布设置中勾选 <strong>"微信公众号"</strong></li>
  <li>选择发布模式为 <strong>"真实发布"</strong></li>
  <li>点击 <strong>"发布"</strong></li>
  <li>系统会调用微信 API，将内容推送到公众号<strong>草稿箱</strong></li>
</ol>

<div class="docs-callout info">
  <strong>说明：</strong>目前 OmniPost 将内容推送到公众号的<strong>草稿箱</strong>，不会直接群发。你可以在微信公众平台后台检查草稿，确认无误后手动群发。这样可以避免误操作。
</div>

<h2>第五步：在微信公众平台查看草稿</h2>

<p>发布完成后，回到 <a href="https://mp.weixin.qq.com" target="_blank" rel="noopener">微信公众平台</a>：</p>
<ol>
  <li>点击左侧菜单 <strong>"管理"</strong> → <strong>"素材管理"</strong></li>
  <li>你会在草稿列表中看到 OmniPost 推送的内容</li>
  <li>点击草稿可以预览、编辑，或点击 <strong>"群发"</strong> 正式发布</li>
</ol>

<div class="docs-callout tip">
  <strong>建议工作流：</strong>OmniPost 生成 → 推送到草稿箱 → 在微信后台预览手机效果 → 微调 → 定时群发或立即群发。这样既利用了 AI 的适配能力，又保留了人工审核的安全感。
</div>

<h2>常见问题</h2>

<h3>Q: 为什么发布失败了？</h3>
<p>常见原因：</p>
<ul>
  <li>AppID 或 AppSecret 填写错误——请重新核对</li>
  <li>IP 白名单未配置——在微信公众平台"基本配置"中添加服务器 IP</li>
  <li>公众号未认证——个人订阅号不支持 API 调用</li>
  <li>Access Token 过期——OmniPost 会自动刷新，通常不需手动处理</li>
</ul>

<h3>Q: 可以同时发布到多个公众号吗？</h3>
<p>当前版本支持配置一个微信公众号。多账号管理在规划中。</p>
`,
  },

  // =====================================================================
  // 知乎
  // =====================================================================
  "platforms/zhihu": {
    title: "知乎",
    description: "知乎回答与文章适配规则详解",
    body: `
<h2>平台特点</h2>

<p>知乎以高质量问答和专业知识分享为核心，用户期待有深度、有结构的内容。回答通常以"结论先行"的方式组织，强调逻辑性和可读性。</p>

<h2>适配规则</h2>

<table>
  <thead><tr><th>项目</th><th>规则</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>标题</td><td>15-40 字</td><td>问题导向或知识承诺型标题效果更佳。避免标题党。</td></tr>
    <tr><td>开篇</td><td>结论先行</td><td>自动生成"先说结论"风格的开篇段落</td></tr>
    <tr><td>正文</td><td>Markdown 渲染</td><td>支持标题层级、引用块、列表、加粗、图片插入</td></tr>
    <tr><td>话题标签</td><td>3-5 个</td><td>选择精准、高关注度的话题</td></tr>
    <tr><td>结尾互动</td><td>引导话术</td><td>生成点赞/收藏/评论的互动引导</td></tr>
  </tbody>
</table>

<h2>内容风格建议</h2>

<p>知乎用户偏好专业、客观、有数据支撑的表达。OmniPost 会在适配时：</p>
<ul>
  <li>保留专业术语和关键数据</li>
  <li>优化段落结构，每段有明确的小主题</li>
  <li>适当使用引用块突出核心观点</li>
  <li>在结尾添加引导讨论的互动语</li>
</ul>

<h2>在 OmniPost 中使用</h2>

<ol>
  <li>在工作台左侧写好 Markdown 原文</li>
  <li>右侧平台选择中勾选 <strong>"知乎"</strong></li>
  <li>点击"一键适配"，等待生成</li>
  <li>在预览区查看知乎回答样式（500px 宽度仿真）</li>
  <li>手动微调标题或正文后保存</li>
  <li>目前知乎支持<strong>模拟发布</strong>，真实 API 接入规划中</li>
</ol>

<div class="docs-callout info">
  <strong>提示：</strong>知乎适配会自动为你的内容生成"开篇结论"，如果你不需要，可以在预览区直接删除。
</div>
`,
  },

  // =====================================================================
  // 小红书
  // =====================================================================
  "platforms/xiaohongshu": {
    title: "小红书",
    description: "小红书笔记适配规则与封面建议",
    body: `
<h2>平台特点</h2>

<p>小红书是生活方式社区的领军平台，以"种草"笔记为核心。内容强调真实感、视觉吸引力和口语化表达，emoji 使用频繁。</p>

<h2>适配规则</h2>

<table>
  <thead><tr><th>项目</th><th>规则</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>标题</td><td>5-20 字</td><td>口语化、有吸引力，自动添加适当 emoji</td></tr>
    <tr><td>正文</td><td>短段落 + emoji</td><td>每段 2-4 行，标签以 #话题 形式内嵌</td></tr>
    <tr><td>封面</td><td>3:4 竖版</td><td>建议 1080×1440 像素，高质量视觉图</td></tr>
    <tr><td>标签</td><td>5-10 个话题</td><td>包含热门话题标签和长尾标签</td></tr>
    <tr><td>语气</td><td>亲切口语</td><td>使用"姐妹们""宝子们"等社区语气</td></tr>
  </tbody>
</table>

<h2>在 OmniPost 中使用</h2>

<ol>
  <li>在工作台写好 Markdown 原文（建议选择 <strong>casual</strong> 风格预设）</li>
  <li>右侧平台选择中勾选 <strong>"小红书"</strong></li>
  <li>点击"一键适配"，AI 会自动：<ul>
    <li>将正式表达转换为口语化语气</li>
    <li>在适当位置插入 emoji</li>
    <li>生成热门话题标签建议</li>
    <li>提供封面图方向和文案建议</li>
  </ul></li>
  <li>在预览区查看小红书笔记卡片样式（360px 宽度仿真）</li>
  <li>检查标签和 emoji 是否合适，手动微调</li>
  <li>目前小红书支持<strong>模拟发布</strong></li>
</ol>

<div class="docs-callout tip">
  <strong>小技巧：</strong>casual 风格预设最适合小红书。如果你的内容偏专业（如教程类），可以在生成后手动调整语气，去掉部分 emoji 保持适度的专业感。
</div>
`,
  },

  // =====================================================================
  // Bilibili
  // =====================================================================
  "platforms/bilibili": {
    title: "Bilibili",
    description: "B 站专栏适配规则与互动元素",
    body: `
<h2>平台特点</h2>

<p>B 站专栏区是 ACG 文化和知识分享的交流场所，用户年轻化，内容偏好轻松有趣或深度硬核。专栏支持丰富的排版和多媒体嵌入。</p>

<h2>适配规则</h2>

<table>
  <thead><tr><th>项目</th><th>规则</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>标题</td><td>10-30 字</td><td>有趣、有梗或信息量大，吸引点击</td></tr>
    <tr><td>正文</td><td>分段清晰</td><td>每段有明确主题，段落间留白</td></tr>
    <tr><td>封面</td><td>16:9 横版</td><td>建议 1200×675 像素</td></tr>
    <tr><td>互动</td><td>"一键三连"引导</td><td>生成符合 B 站社区习惯的互动话术</td></tr>
    <tr><td>分区</td><td>自动建议</td><td>根据内容主题推荐合适的专栏分区</td></tr>
  </tbody>
</table>

<h2>在 OmniPost 中使用</h2>

<ol>
  <li>在工作台写好 Markdown 原文</li>
  <li>右侧平台选择中勾选 <strong>"Bilibili"</strong></li>
  <li>点击"一键适配"，AI 会自动：<ul>
    <li>优化段落节奏，适应移动端阅读</li>
    <li>添加轻松的社区语气</li>
    <li>生成"点赞投币收藏"互动引导</li>
    <li>建议合适的专栏分区</li>
  </ul></li>
  <li>在预览区查看 B 站专栏样式（520px 宽度仿真）</li>
  <li>目前 Bilibili 支持<strong>模拟发布</strong></li>
</ol>
`,
  },

  // =====================================================================
  // LLM 配置 — 超详细版
  // =====================================================================
  "llm-setup": {
    title: "配置 LLM 接口 — 完整指南",
    description: "从获取 API Key 到填入 OmniPost，支持 OpenAI、DeepSeek、Moonshot 等",
    body: `
<h2>概述</h2>

<p>OmniPost 兼容 OpenAI Chat Completions API 格式，你可以使用任何兼容此格式的 AI 服务。LLM 配置有两种方式：</p>

<ol>
  <li><strong>UI 界面配置</strong>（推荐，优先级更高）——在设置页面直接填写</li>
  <li><strong>环境变量配置</strong>——在 <code>.env.local</code> 中设置</li>
</ol>

<p>如果两者都未配置，OmniPost 将使用内置的 Mock 模板生成内容（无 LLM 调用，效果有限）。</p>

<div class="docs-callout warning">
  <strong>前置条件：</strong>你需要先拥有一个 AI 服务的 API Key。以下是各平台的获取方法。
</div>

<h2>方式一：在 UI 界面配置（推荐）</h2>

<h3>第一步：打开设置页面</h3>

<p>启动 OmniPost 后，点击左侧导航栏的 <strong>"系统设置"</strong>，或直接访问 <code>/settings</code>。</p>

<h3>第二步：找到 LLM 配置卡片</h3>

<p>在设置页面顶部，你会看到 <strong>"LLM 配置"</strong> 卡片。</p>

<h3>第三步：填写配置信息</h3>

<p>在 LLM 配置卡片中，依次填写以下字段：</p>

<table>
  <thead><tr><th>字段</th><th>说明</th><th>示例值</th></tr></thead>
  <tbody>
    <tr><td><strong>Base URL</strong></td><td>API 地址（不同服务商地址不同）</td><td>见下方各平台说明</td></tr>
    <tr><td><strong>API Key</strong></td><td>你的密钥</td><td>以 <code>sk-</code> 或服务商特定前缀开头</td></tr>
    <tr><td><strong>Model</strong></td><td>模型名称</td><td>如 <code>gpt-4o-mini</code></td></tr>
  </tbody>
</table>

<h3>第四步：测试连接</h3>

<p>填写完成后，点击 <strong>"测试连接"</strong> 按钮。系统会发送测试请求验证配置是否正确。</p>
<ul>
  <li>✅ <strong>连接成功</strong>——绿色提示，可以开始使用</li>
  <li>❌ <strong>连接失败</strong>——红色提示，请检查 Base URL、API Key 和网络</li>
</ul>

<h3>第五步：保存配置</h3>

<p>测试通过后，点击 <strong>"保存"</strong> 按钮。API Key 会以 AES-256-GCM 加密存储在本地。</p>

<div class="docs-callout tip">
  <strong>安全提示：</strong>在 UI 中保存的 API Key 会加密存储。加密密钥由 <code>OMNIPOST_ENCRYPTION_KEY</code> 环境变量提供。请妥善保管此密钥。
</div>

<h2>方式二：通过环境变量配置</h2>

<p>在项目根目录的 <code>.env.local</code> 文件中添加：</p>

<pre><code>OMNIPOST_USE_LLM=true
OPENAI_API_KEY=sk-your-api-key-here
OMNIPOST_OPENAI_BASE_URL=https://api.openai.com/v1
OMNIPOST_OPENAI_MODEL=gpt-4o-mini</code></pre>

<p>修改后需要<strong>重启开发服务器</strong>才能生效。</p>

<h2>各平台 API Key 获取指南</h2>

<h3>OpenAI 官方</h3>

<ol>
  <li>访问 <a href="https://platform.openai.com" target="_blank" rel="noopener">platform.openai.com</a> 并登录</li>
  <li>点击右上角头像 → <strong>"View API keys"</strong></li>
  <li>点击 <strong>"Create new secret key"</strong></li>
  <li>给 Key 取个名字（如 "omnipost"），选择权限后点击创建</li>
  <li><strong>立即复制 Key</strong>（以 <code>sk-proj-</code> 或 <code>sk-</code> 开头），关闭后将无法再次查看</li>
</ol>

<table>
  <thead><tr><th>字段</th><th>值</th></tr></thead>
  <tbody>
    <tr><td>Base URL</td><td><code>https://api.openai.com/v1</code></td></tr>
    <tr><td>Model</td><td><code>gpt-4o-mini</code>（推荐）或 <code>gpt-4o</code></td></tr>
  </tbody>
</table>

<div class="docs-callout warning">
  <strong>注意：</strong>OpenAI API 需要绑定信用卡并预充值。新用户通常有免费额度，用完后需付费。
</div>

<h3>DeepSeek</h3>

<ol>
  <li>访问 <a href="https://platform.deepseek.com" target="_blank" rel="noopener">platform.deepseek.com</a> 并登录</li>
  <li>点击左侧 <strong>"API Keys"</strong></li>
  <li>点击 <strong>"创建 API Key"</strong>，输入名称后创建</li>
  <li>复制 Key</li>
</ol>

<table>
  <thead><tr><th>字段</th><th>值</th></tr></thead>
  <tbody>
    <tr><td>Base URL</td><td><code>https://api.deepseek.com/v1</code></td></tr>
    <tr><td>Model</td><td><code>deepseek-chat</code></td></tr>
  </tbody>
</table>

<div class="docs-callout tip">
  <strong>推荐：</strong>DeepSeek 性价比极高，中文理解能力出色，非常适合 OmniPost 的中文内容适配场景。价格约为 OpenAI 的 1/10。
</div>

<h3>Moonshot（月之暗面/Kimi）</h3>

<ol>
  <li>访问 <a href="https://platform.moonshot.cn" target="_blank" rel="noopener">platform.moonshot.cn</a> 并登录</li>
  <li>进入控制台，点击 <strong>"API Key 管理"</strong></li>
  <li>创建新 Key 并复制</li>
</ol>

<table>
  <thead><tr><th>字段</th><th>值</th></tr></thead>
  <tbody>
    <tr><td>Base URL</td><td><code>https://api.moonshot.cn/v1</code></td></tr>
    <tr><td>Model</td><td><code>moonshot-v1-8k</code></td></tr>
  </tbody>
</table>

<h3>智谱 AI (GLM)</h3>

<ol>
  <li>访问 <a href="https://open.bigmodel.cn" target="_blank" rel="noopener">open.bigmodel.cn</a> 并登录</li>
  <li>进入控制台 → <strong>"API Keys"</strong></li>
  <li>复制已有 Key 或创建新 Key</li>
</ol>

<table>
  <thead><tr><th>字段</th><th>值</th></tr></thead>
  <tbody>
    <tr><td>Base URL</td><td><code>https://open.bigmodel.cn/api/paas/v4</code></td></tr>
    <tr><td>Model</td><td><code>glm-4-flash</code></td></tr>
  </tbody>
</table>

<h3>本地模型 (Ollama / vLLM)</h3>

<p>如果你在本地运行了 Ollama 或其他兼容 OpenAI 格式的服务：</p>

<table>
  <thead><tr><th>字段</th><th>值</th></tr></thead>
  <tbody>
    <tr><td>Base URL</td><td><code>http://localhost:11434/v1</code>（Ollama 默认）</td></tr>
    <tr><td>API Key</td><td>可留空或填任意值（如 <code>ollama</code>）</td></tr>
    <tr><td>Model</td><td>你拉取的模型名，如 <code>qwen2.5:7b</code></td></tr>
  </tbody>
</table>

<div class="docs-callout info">
  <strong>隐私优先：</strong>使用本地模型可以确保内容完全不出本机。但本地模型在中文适配效果上可能不如云端大模型。
</div>

<h2>配置验证</h2>

<p>无论使用哪种方式配置，建议都使用设置页面中的 <strong>"测试连接"</strong> 功能验证连通性。测试成功后再进行内容生成。</p>
`,
  },

  // =====================================================================
  // Prompt 设计
  // =====================================================================
  "prompt-design": {
    title: "Prompt 设计",
    description: "了解 OmniPost 的 Prompt 架构与自定义方法",
    body: `
<h2>Prompt 架构</h2>

<p>OmniPost 的 Prompt 由以下组件组装而成（核心代码在 <code>src/lib/prompts/builder.ts</code>）：</p>

<ul>
  <li><strong>共享系统头</strong>——中文专业编辑的全局指令，定义角色（专业的多平台内容编辑）和行为准则</li>
  <li><strong>平台技能定义</strong>——每个平台独立的定位、标题规则、正文规则（<code>src/lib/skills/{platform}.json</code>）</li>
  <li><strong>风格预设片段</strong>——casual 或 professional 的语气描述（<code>src/lib/presets/{style}.ts</code>）</li>
</ul>

<h2>用户消息结构</h2>

<p>每次生成的用户消息包含：</p>
<ul>
  <li>原始标题、正文和标签</li>
  <li>目标平台的适配规则 JSON</li>
  <li>期望的输出 JSON Schema（确保 LLM 输出结构化数据）</li>
</ul>

<h2>LLM 调用流程</h2>

<p>OmniPost 采用两阶段生成流程：</p>
<ol>
  <li><strong>内容理解（extractContentBrief）</strong>——发送原始文本到 LLM，提取结构化摘要：核心主题、主要观点、关键词、保留细节、目标受众、语气</li>
  <li><strong>平台生成（generateViaOpenAICompatible）</strong>——结合内容摘要 + 平台规则 + 风格预设，为每个平台调用 LLM，输出格式由平台 Zod Schema 校验</li>
</ol>

<p>每次 LLM 调用使用 <code>response_format: { type: "json_object" }</code> 确保结构化输出。</p>

<h2>自定义平台规则</h2>

<p>每个平台的技能定义存储在 <code>src/lib/skills/{platform}.json</code>，包含以下字段：</p>
<ul>
  <li><code>positioning</code>——平台定位描述（告诉 LLM 这是什么平台）</li>
  <li><code>titleRule</code>——标题规则（长度、风格要求）</li>
  <li><code>bodyRule</code>——正文规则（段落、格式、语气）</li>
  <li><code>outputSchema</code>——输出 JSON 的结构定义</li>
  <li><code>editableFields</code>——用户在前端可编辑的字段列表</li>
</ul>

<p>你可以直接编辑这些 JSON 文件来调整各平台的适配行为。修改后无需重启（Next.js 热更新）。</p>

<h2>添加新平台</h2>

<p>要添加新平台（如抖音、微博），需要：</p>
<ol>
  <li>在 <code>src/lib/skills/</code> 创建平台技能 JSON</li>
  <li>在 <code>src/lib/validators/</code> 创建校验器</li>
  <li>在 <code>src/components/preview/</code> 创建预览组件</li>
  <li>在 <code>src/types/index.ts</code> 的 <code>PLATFORMS</code> 中添加平台 ID</li>
</ol>
`,
  },

  "model-selection": {
    title: "模型选择建议",
    description: "不同模型的适用场景与效果对比",
    body: `
<h2>推荐模型</h2>

<table>
  <thead><tr><th>模型</th><th>服务商</th><th>适用场景</th><th>特点</th></tr></thead>
  <tbody>
    <tr><td><strong>gpt-4o-mini</strong></td><td>OpenAI</td><td>日常使用（推荐）</td><td>性价比最优，速度快，质量稳定</td></tr>
    <tr><td><strong>gpt-4o</strong></td><td>OpenAI</td><td>高质量要求</td><td>理解能力更强，适配更精准</td></tr>
    <tr><td><strong>deepseek-chat</strong></td><td>DeepSeek</td><td>中文内容（推荐）</td><td>中文理解极好，价格低，速度快</td></tr>
    <tr><td><strong>moonshot-v1-8k</strong></td><td>Moonshot</td><td>长文处理</td><td>中文长文本处理好</td></tr>
    <tr><td><strong>glm-4-flash</strong></td><td>智谱 AI</td><td>免费额度</td><td>有免费额度，适合试用</td></tr>
    <tr><td><strong>本地模型</strong></td><td>Ollama/vLLM</td><td>完全离线</td><td>隐私优先，但效果可能不如云端</td></tr>
  </tbody>
</table>

<h2>选择考量</h2>

<ul>
  <li><strong>速度</strong>——小模型（如 gpt-4o-mini、deepseek-chat）生成一个平台版本约 3-8 秒</li>
  <li><strong>质量</strong>——大模型在标题创意、语气把控和平台规则遵守上更出色</li>
  <li><strong>成本</strong>——每次生成约 2000-5000 token，按模型定价估算费用。DeepSeek 价格约为 OpenAI 的 1/10</li>
  <li><strong>隐私</strong>——使用本地模型可确保内容不外传</li>
</ul>

<h2>我们的推荐</h2>

<p>对于大多数中文内容创作者，我们推荐 <strong>DeepSeek (deepseek-chat)</strong>：</p>
<ul>
  <li>中文理解能力一流</li>
  <li>价格极低（百万 token 仅需 1-2 元）</li>
  <li>响应速度快</li>
  <li>完美兼容 OpenAI API 格式</li>
</ul>

<p>如果你更看重稳定性和全球可用性，<strong>gpt-4o-mini</strong> 是可靠的选择。</p>
`,
  },

  // =====================================================================
  // API: 内容管理
  // =====================================================================
  "api/contents": {
    title: "内容管理 API",
    description: "创建原始内容、生成平台适配版本、查询与更新",
    body: `
<h2>概述</h2>

<p>内容管理 API 处理原始内容的创建和平台版本的生成与更新。所有 API 返回 JSON 格式，使用 Zod 校验请求体。</p>

<h2>创建原始内容</h2>

<p><code>POST /api/contents</code></p>

<pre><code>// Request Body
{
  "rawText": "string (必填) — Markdown 格式的原始内容",
  "title": "string (可选) — 文章标题",
  "images": "ImageAsset[] (可选) — 图片资源列表",
  "userTags": "string[] (可选) — 用户标签"
}

// Response: Content 对象</code></pre>

<h2>生成平台版本</h2>

<p><code>POST /api/contents/:id/generate</code></p>

<pre><code>// Request Body
{
  "platforms": ["wechat", "zhihu", "xiaohongshu", "bilibili"],
  "stylePreset": "casual" | "professional"
}

// Response
{
  "contentId": "string",
  "platformContents": [ PlatformContent, ... ]
}</code></pre>

<p>此接口会为每个指定的平台调用 LLM 生成适配版本。如果未配置 LLM，则使用 Mock 模板。</p>

<h2>查询平台版本</h2>

<p><code>GET /api/platform-contents/:id</code></p>

<p>获取单个平台版本的完整信息（包括标题、正文、标签、校验结果等）。</p>

<h2>更新平台版本</h2>

<p><code>PUT /api/platform-contents/:id</code></p>

<pre><code>// Request Body（部分字段即可）
{
  "title": "修改后的标题",
  "body": "修改后的正文",
  "tags": ["标签1", "标签2"]
}

// Response: 更新后的 PlatformContent</code></pre>

<p>用户手动编辑预览内容后，通过此接口保存修改。</p>
`,
  },

  // =====================================================================
  // API: 发布
  // =====================================================================
  "api/publish": {
    title: "发布 API",
    description: "模拟发布与真实平台 API 对接",
    body: `
<h2>概述</h2>

<p>发布 API 支持两种模式：模拟发布（mock）用于预览效果，真实发布（real）对接平台 API。</p>

<h2>统一发布接口</h2>

<p><code>POST /api/publish/submit</code></p>

<pre><code>// Request Body
{
  "contentId": "string",
  "mode": "mock" | "real",
  "platforms": ["wechat", "zhihu"],
  "platformContentIds": {
    "wechat": "pc_xxx",
    "zhihu": "pc_yyy"
  }
}

// Response: PublishTask</code></pre>

<h2>模拟发布（mock）</h2>

<p>不调用真实平台 API，生成模拟 URL（如 <code>/mock/wechat/pc_xxx</code>）。可在 OmniPost 内查看预览效果。</p>

<h2>真实发布（real）</h2>

<p>调用平台官方 API 发布内容。目前支持：</p>
<ul>
  <li><strong>微信公众号</strong>——推送到草稿箱（需要 AppID + AppSecret）</li>
  <li>更多平台接入中</li>
</ul>

<p>真实发布前，请确保已在设置页面配置对应平台的凭证。</p>

<h2>查询发布历史</h2>

<p><code>GET /api/publish/tasks</code></p>

<p>返回所有发布任务的列表，按创建时间倒序。每个任务包含状态（pending/publishing/success/failed/partial）、时间戳和平台级结果。</p>

<h2>PublishTask 结构</h2>

<pre><code>{
  "id": "pt_xxx",
  "contentId": "c_xxx",
  "title": "文章标题",
  "mode": "mock" | "real",
  "status": "success" | "failed" | "partial" | "pending" | "publishing",
  "results": [
    {
      "id": "pr_xxx",
      "platform": "wechat",
      "platformContentId": "pc_xxx",
      "status": "success" | "failed",
      "url": "https://...",
      "message": "发布成功" | "错误信息"
    }
  ],
  "createdAt": "ISO 8601",
  "finishedAt": "ISO 8601 | null"
}</code></pre>
`,
  },

  // =====================================================================
  // API: 设置
  // =====================================================================
  "api/settings": {
    title: "设置 API",
    description: "LLM 配置与平台凭证的 CRUD 操作",
    body: `
<h2>LLM 配置</h2>

<table>
  <thead><tr><th>方法</th><th>路由</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>GET</td><td><code>/api/settings/llm</code></td><td>获取当前 LLM 配置（密钥已脱敏）</td></tr>
    <tr><td>PUT</td><td><code>/api/settings/llm</code></td><td>保存 LLM 配置</td></tr>
    <tr><td>DELETE</td><td><code>/api/settings/llm</code></td><td>删除 LLM 配置</td></tr>
    <tr><td>POST</td><td><code>/api/settings/llm/test</code></td><td>测试 LLM 连接</td></tr>
  </tbody>
</table>

<pre><code>// PUT /api/settings/llm Request Body
{
  "provider": "openai-compatible",
  "apiKey": "sk-...",
  "baseUrl": "https://api.openai.com/v1",
  "model": "gpt-4o-mini",
  "enabled": true
}</code></pre>

<h2>平台凭证</h2>

<table>
  <thead><tr><th>方法</th><th>路由</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>GET</td><td><code>/api/settings/platform</code></td><td>获取各平台凭证状态</td></tr>
    <tr><td>PUT</td><td><code>/api/settings/platform</code></td><td>保存平台凭证</td></tr>
    <tr><td>DELETE</td><td><code>/api/settings/platform</code></td><td>删除平台凭证</td></tr>
  </tbody>
</table>

<pre><code>// PUT /api/settings/platform Request Body
{
  "platform": "wechat",
  "credentials": {
    "appId": "wx1234567890abcdef",
    "appSecret": "your-secret-here"
  }
}</code></pre>

<h2>响应格式</h2>

<p>所有 API 返回 JSON 格式。成功时直接返回数据对象。错误时返回：</p>
<pre><code>{ "error": "错误描述信息" }</code></pre>
`,
  },
};

export function getDocContent(slug: string): DocContent | null {
  return docs[slug] ?? null;
}

export function getAllDocSlugs(): string[] {
  return Object.keys(docs);
}
