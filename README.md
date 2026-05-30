<div align="center">

<!-- ANIMATED HEADER BANNER -->
<svg width="100%" viewBox="0 0 860 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
    <linearGradient id="wechat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#07C160" />
      <stop offset="100%" stop-color="#06AD56" />
    </linearGradient>
    <linearGradient id="zhihu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0066FF" />
      <stop offset="100%" stop-color="#0052CC" />
    </linearGradient>
    <linearGradient id="xiaohongshu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF2442" />
      <stop offset="100%" stop-color="#E61B35" />
    </linearGradient>
    <linearGradient id="bilibili" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FB7299" />
      <stop offset="100%" stop-color="#E85D80" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <style>
      @keyframes float1 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
      @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-6px) rotate(-2deg); } }
      @keyframes float3 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      @keyframes float4 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-5px) scale(1.05); } }
      @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      @keyframes drawLine { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
      @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
      @keyframes rotateSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .f1 { animation: float1 4s ease-in-out infinite; }
      .f2 { animation: float2 5s ease-in-out infinite; }
      .f3 { animation: float3 3.5s ease-in-out infinite; }
      .f4 { animation: float4 6s ease-in-out infinite; }
      .pulse { animation: pulse 3s ease-in-out infinite; }
      .line-anim { stroke-dasharray: 200; animation: drawLine 2s ease-out forwards; }
      .fade-up { animation: fadeSlideUp 0.8s ease-out forwards; }
      .rotate-slow { animation: rotateSlow 20s linear infinite; transform-origin: center; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="860" height="240" rx="20" fill="url(#bgGrad)" />

  <!-- Decorative grid dots -->
  <g opacity="0.06">
    <circle cx="40" cy="40" r="1.5" fill="#fff" /><circle cx="80" cy="40" r="1.5" fill="#fff" />
    <circle cx="120" cy="40" r="1.5" fill="#fff" /><circle cx="160" cy="40" r="1.5" fill="#fff" />
    <circle cx="200" cy="40" r="1.5" fill="#fff" /><circle cx="240" cy="40" r="1.5" fill="#fff" />
    <circle cx="40" cy="80" r="1.5" fill="#fff" /><circle cx="120" cy="80" r="1.5" fill="#fff" />
    <circle cx="200" cy="80" r="1.5" fill="#fff" /><circle cx="280" cy="80" r="1.5" fill="#fff" />
    <circle cx="80" cy="120" r="1.5" fill="#fff" /><circle cx="160" cy="120" r="1.5" fill="#fff" />
    <circle cx="240" cy="120" r="1.5" fill="#fff" /><circle cx="40" cy="160" r="1.5" fill="#fff" />
    <circle cx="120" cy="200" r="1.5" fill="#fff" /><circle cx="200" cy="200" r="1.5" fill="#fff" />
    <circle cx="620" cy="40" r="1.5" fill="#fff" /><circle cx="660" cy="40" r="1.5" fill="#fff" />
    <circle cx="700" cy="40" r="1.5" fill="#fff" /><circle cx="740" cy="40" r="1.5" fill="#fff" />
    <circle cx="780" cy="40" r="1.5" fill="#fff" /><circle cx="820" cy="40" r="1.5" fill="#fff" />
    <circle cx="660" cy="80" r="1.5" fill="#fff" /><circle cx="740" cy="80" r="1.5" fill="#fff" />
    <circle cx="820" cy="80" r="1.5" fill="#fff" /><circle cx="700" cy="120" r="1.5" fill="#fff" />
    <circle cx="780" cy="120" r="1.5" fill="#fff" />
  </g>

  <!-- Floating platform icons -->
  <g class="f1" filter="url(#glow)">
    <rect x="660" y="70" width="44" height="44" rx="10" fill="url(#wechat)" opacity="0.9" />
    <text x="682" y="98" text-anchor="middle" fill="#fff" font-size="20">微</text>
  </g>
  <g class="f2" filter="url(#glow)">
    <rect x="740" y="50" width="44" height="44" rx="10" fill="url(#zhihu)" opacity="0.9" />
    <text x="762" y="78" text-anchor="middle" fill="#fff" font-size="20">知</text>
  </g>
  <g class="f3" filter="url(#glow)">
    <rect x="700" y="110" width="44" height="44" rx="10" fill="url(#xiaohongshu)" opacity="0.9" />
    <text x="722" y="138" text-anchor="middle" fill="#fff" font-size="18">红</text>
  </g>
  <g class="f4" filter="url(#glow)">
    <rect x="780" y="90" width="44" height="44" rx="10" fill="url(#bilibili)" opacity="0.9" />
    <text x="802" y="118" text-anchor="middle" fill="#fff" font-size="18">B</text>
  </g>

  <!-- Connection lines between platform icons -->
  <g class="pulse" stroke="#475569" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.5">
    <line x1="682" y1="92" x2="740" y2="72" />
    <line x1="682" y1="92" x2="722" y2="132" />
    <line x1="762" y1="72" x2="802" y2="112" />
    <line x1="722" y1="132" x2="802" y2="112" />
  </g>

  <!-- Central content hub -->
  <g class="fade-up">
    <circle cx="100" cy="120" r="55" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="4 6" class="rotate-slow" opacity="0.4" />
    <circle cx="100" cy="120" r="40" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
    <text x="100" y="115" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="monospace">content</text>
    <text x="100" y="130" text-anchor="middle" fill="#38bdf8" font-size="11" font-family="monospace">→ adapt →</text>
  </g>

  <!-- Connecting lines: center to platforms -->
  <g class="pulse" stroke="#475569" stroke-width="1" stroke-dasharray="3 4" opacity="0.3">
    <line x1="140" y1="105" x2="660" y2="92" />
    <line x1="140" y1="115" x2="740" y2="72" />
    <line x1="140" y1="125" x2="700" y2="132" />
    <line x1="140" y1="135" x2="780" y2="112" />
  </g>

  <!-- Title text -->
  <text x="50" y="210" font-family="system-ui,-apple-system,sans-serif" font-size="36" font-weight="800" fill="url(#textGrad)" filter="url(#glow)">OmniPost</text>
  <text x="258" y="213" font-family="system-ui,-apple-system,sans-serif" font-size="14" fill="#64748b">多平台内容适配工作台</text>
</svg>

<br/>
<br/>

<!-- BADGES -->
<p>
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white&labelColor=0f172a" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0f172a" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0f172a" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white&labelColor=0f172a" alt="Zod" />
  <img src="https://img.shields.io/badge/Drizzle-0-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black&labelColor=0f172a" alt="Drizzle ORM" />
</p>

<p>
  <img src="https://img.shields.io/badge/⚡_LLM_Powered-OpenAI_Compatible-10b981?style=flat-square&labelColor=0f172a" alt="LLM Powered" />
  <img src="https://img.shields.io/badge/🎯_Multi--Platform-4_Channels-6366f1?style=flat-square&labelColor=0f172a" alt="Multi-Platform" />
  <img src="https://img.shields.io/badge/🔒_Encrypted_Keys-AES--256--GCM-f59e0b?style=flat-square&labelColor=0f172a" alt="Encrypted Keys" />
  <img src="https://img.shields.io/badge/license-MIT-94a3b8?style=flat-square&labelColor=0f172a" alt="License" />
</p>

</div>

---

<br/>

<!-- PLATFORM COLOR BAR -->
<div align="center">
  <svg width="560" height="6" viewBox="0 0 560 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="140" height="6" rx="3" fill="#07C160"/>
    <rect x="140" width="140" height="6" fill="#0066FF"/>
    <rect x="280" width="140" height="6" fill="#FF2442"/>
    <rect x="420" width="140" height="6" fill="#FB7299"/>
  </svg>
</div>

## ✨ 核心能力

<table>
<tr>
<td width="50%">

### 🎨 一次创作，多端适配

在统一的 Markdown 编辑器中撰写原始内容，一键生成适配**微信公众号、知乎、小红书、B 站专栏**的差异化版本。每个平台拥有独立的编辑面板、预览视图和规则校验。

</td>
<td width="50%">

### 🤖 LLM 驱动的内容改写

接入 OpenAI 兼容接口，通过**两阶段 pipeline**（内容摘要提取 → 平台适配生成）智能改写。每个平台拥有专属 Skill 定义（定位、标题规则、正文规则），结合风格预设（专业干货 / 轻松随性）精准控制输出。

</td>
</tr>
<tr>
<td width="50%">

### 📋 实时规则校验

每个平台版本提交前自动校验：**标题长度、摘要字数、标签数量、Emoji 使用、封面图建议**等。校验结果即时反馈，确保生成内容符合各平台规范。

</td>
<td width="50%">

### 🚀 模拟发布闭环

一键创建模拟发布任务，自动生成各平台的 mock 详情页。在**发布记录**中查看历史任务、访问链接、追溯发布状态，完整体验从创作到发布的工作流。

</td>
</tr>
</table>

<br/>

---

## 🧩 平台适配矩阵

<table align="center">
<tr align="center">
  <td>
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#07C160"/>
      <text x="24" y="30" text-anchor="middle" fill="#fff" font-size="20" font-weight="700">微</text>
    </svg>
  </td>
  <td>
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#0066FF"/>
      <text x="24" y="30" text-anchor="middle" fill="#fff" font-size="20" font-weight="700">知</text>
    </svg>
  </td>
  <td>
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FF2442"/>
      <text x="24" y="30" text-anchor="middle" fill="#fff" font-size="18" font-weight="700">红</text>
    </svg>
  </td>
  <td>
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FB7299"/>
      <text x="24" y="30" text-anchor="middle" fill="#fff" font-size="20" font-weight="700">B</text>
    </svg>
  </td>
</tr>
<tr align="center">
  <td><b>微信公众号</b></td>
  <td><b>知乎</b></td>
  <td><b>小红书</b></td>
  <td><b>B 站专栏</b></td>
</tr>
<tr align="center">
  <td><sub>深度长文 · 排版精致</sub></td>
  <td><sub>专业问答 · 理性克制</sub></td>
  <td><sub>轻量种草 · Emoji 友好</sub></td>
  <td><sub>社区活泼 · 标题党 OK</sub></td>
</tr>
<tr align="center">
  <td><code>title ≤ 64</code></td>
  <td><code>title ≤ 48</code></td>
  <td><code>title ≤ 20</code></td>
  <td><code>title ≤ 30</code></td>
</tr>
</table>

<br/>

---

## 🏗️ 架构总览

<div align="center">

<svg width="760" height="340" viewBox="0 0 760 340" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="archBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </linearGradient>
    <filter id="shadow1">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.06"/>
    </filter>
    <filter id="shadow2">
      <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <style>
      @keyframes flowDash { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
      @keyframes glowPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      .flow { stroke-dasharray: 6 3; animation: flowDash 0.6s linear infinite; }
      .gp { animation: glowPulse 2.5s ease-in-out infinite; }
    </style>
  </defs>

  <rect width="760" height="340" rx="14" fill="url(#archBg)" stroke="#e2e8f0" stroke-width="1"/>

  <!-- User / Browser -->
  <rect x="30" y="20" width="140" height="44" rx="8" fill="#0f172a" filter="url(#shadow1)"/>
  <text x="100" y="38" text-anchor="middle" fill="#e2e8f0" font-size="11" font-family="monospace">Browser</text>
  <text x="100" y="54" text-anchor="middle" fill="#94a3b8" font-size="13" font-family="system-ui">🖥️ 用户界面</text>

  <!-- Next.js App Router -->
  <rect x="30" y="90" width="140" height="70" rx="8" fill="#fff" stroke="#cbd5e1" stroke-width="1" filter="url(#shadow1)"/>
  <text x="100" y="115" text-anchor="middle" fill="#0f172a" font-size="12" font-family="system-ui" font-weight="600">Next.js 14</text>
  <text x="100" y="133" text-anchor="middle" fill="#64748b" font-size="11" font-family="monospace">App Router</text>
  <text x="100" y="150" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">React 18 + TS</text>

  <!-- API Routes -->
  <rect x="250" y="30" width="120" height="50" rx="8" fill="#fff" stroke="#818cf8" stroke-width="1.5" filter="url(#shadow1)"/>
  <text x="310" y="52" text-anchor="middle" fill="#4f46e5" font-size="11" font-family="monospace" font-weight="600">API Routes</text>
  <text x="310" y="68" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">Zod 校验</text>

  <!-- LLM Pipeline -->
  <rect x="250" y="100" width="120" height="50" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" filter="url(#shadow1)"/>
  <text x="310" y="122" text-anchor="middle" fill="#059669" font-size="11" font-family="monospace" font-weight="600">LLM Pipeline</text>
  <text x="310" y="138" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">2-Phase Gen</text>

  <!-- Prompt Builder -->
  <rect x="250" y="170" width="120" height="50" rx="8" fill="#fff" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow1)"/>
  <text x="310" y="192" text-anchor="middle" fill="#d97706" font-size="11" font-family="monospace" font-weight="600">Prompt 组装</text>
  <text x="310" y="208" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">Skills + Presets</text>

  <!-- Platform Validators -->
  <rect x="250" y="240" width="120" height="50" rx="8" fill="#fff" stroke="#ec4899" stroke-width="1.5" filter="url(#shadow1)"/>
  <text x="310" y="262" text-anchor="middle" fill="#db2777" font-size="11" font-family="monospace" font-weight="600">校验器</text>
  <text x="310" y="278" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">Per-Platform</text>

  <!-- JSON Store -->
  <rect x="450" y="30" width="120" height="50" rx="8" fill="#fff" stroke="#cbd5e1" stroke-width="1" filter="url(#shadow1)"/>
  <text x="510" y="52" text-anchor="middle" fill="#0f172a" font-size="11" font-family="monospace" font-weight="600">Data Store</text>
  <text x="510" y="68" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">JSON File</text>

  <!-- Skills -->
  <rect x="450" y="100" width="120" height="50" rx="8" fill="#fff" stroke="#cbd5e1" stroke-width="1" filter="url(#shadow1)"/>
  <text x="510" y="120" text-anchor="middle" fill="#0f172a" font-size="11" font-family="monospace" font-weight="600">Skill 定义</text>
  <text x="510" y="138" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">JSON Config</text>

  <!-- Presets -->
  <rect x="450" y="170" width="120" height="50" rx="8" fill="#fff" stroke="#cbd5e1" stroke-width="1" filter="url(#shadow1)"/>
  <text x="510" y="190" text-anchor="middle" fill="#0f172a" font-size="11" font-family="monospace" font-weight="600">风格预设</text>
  <text x="510" y="208" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">Professional/Casual</text>

  <!-- Settings -->
  <rect x="450" y="240" width="120" height="50" rx="8" fill="#fff" stroke="#cbd5e1" stroke-width="1" filter="url(#shadow1)"/>
  <text x="510" y="262" text-anchor="middle" fill="#0f172a" font-size="11" font-family="monospace" font-weight="600">LLM 设置</text>
  <text x="510" y="278" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">AES Encrypted</text>

  <!-- Output: Platform Contents -->
  <rect x="630" y="100" width="110" height="80" rx="8" fill="#1e293b" filter="url(#shadow2)"/>
  <text x="685" y="125" text-anchor="middle" fill="#38bdf8" font-size="10" font-family="monospace" font-weight="600">Platform</text>
  <text x="685" y="140" text-anchor="middle" fill="#38bdf8" font-size="10" font-family="monospace" font-weight="600">Contents</text>
  <text x="685" y="160" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace">mock URL</text>

  <!-- Connection Lines -->
  <!-- Browser → Next.js -->
  <line x1="170" y1="42" x2="250" y2="55" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGray)"/>
  <!-- Next.js → API -->
  <line x1="100" y1="160" x2="100" y2="185" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="100" y1="185" x2="250" y2="162" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGray)"/>
  <!-- API → LLM -->
  <line x1="310" y1="80" x2="310" y2="100" stroke="#10b981" stroke-width="1.5" class="flow"/>
  <!-- LLM → Prompt -->
  <line x1="310" y1="150" x2="310" y2="170" stroke="#f59e0b" stroke-width="1.5" class="flow"/>
  <!-- Prompt → Validators -->
  <line x1="310" y1="220" x2="310" y2="240" stroke="#ec4899" stroke-width="1.5" class="flow"/>
  <!-- API → Store -->
  <line x1="370" y1="55" x2="450" y2="55" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGray)"/>
  <!-- LLM ↔ Skills -->
  <line x1="370" y1="122" x2="450" y2="122" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 4"/>
  <!-- Skills → Presets -->
  <line x1="510" y1="150" x2="510" y2="170" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 3"/>
  <!-- Presets → Settings -->
  <line x1="510" y1="220" x2="510" y2="240" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 3"/>
  <!-- Validators → Platform Contents -->
  <line x1="370" y1="265" x2="630" y2="155" stroke="#38bdf8" stroke-width="1.5" class="flow" marker-end="url(#arrowBlue)"/>

  <!-- Arrows -->
  <defs>
    <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
    <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8"/>
    </marker>
  </defs>
</svg>

</div>

<br/>

---

## 📦 项目结构

```
src/
├── app/
│   ├── api/                         # Next.js Route Handlers
│   │   ├── contents/                #   原始内容 CRUD
│   │   ├── platform-contents/       #   平台版本读写
│   │   ├── publish/                 #   模拟发布 & 记录
│   │   └── settings/llm/            #   LLM 配置管理
│   ├── workspace/                   # 三栏工作台页面
│   ├── records/                     # 发布记录页面
│   ├── settings/                    # 系统设置页面
│   └── mock/[platform]/[id]/        # 模拟发布详情页
├── components/
│   ├── workspace/                   #   工作台组件（三栏面板）
│   │   ├── WorkflowProvider.tsx     #     全局状态 (Context + useReducer)
│   │   ├── LeftPanel.tsx            #     原始内容输入
│   │   ├── CenterPanel.tsx          #     平台版本编辑 & 预览
│   │   └── PublishSettingsPanel.tsx #     发布配置
│   ├── preview/                     #   平台预览组件
│   │   ├── WechatPreview.tsx        #     公众号风格
│   │   ├── ZhihuPreview.tsx         #     知乎风格
│   │   ├── XiaohongshuPreview.tsx   #     小红书风格
│   │   └── BilibiliPreview.tsx      #     B站风格
│   └── ui/                          #   通用 UI 组件
├── lib/
│   ├── llm/                         #   LLM 生成 pipeline
│   │   ├── generate.ts              #     两阶段生成编排
│   │   └── settings-store.ts        #     API Key 加密存储
│   ├── prompts/builder.ts           #   Prompt 组装 (Skills + Presets)
│   ├── skills/*.json                #   各平台 Skill 定义
│   ├── presets/*.ts                 #   风格预设片段
│   ├── validators/*.ts              #   平台校验器
│   └── db/                          #   本地 JSON 数据层
├── types/index.ts                   # 全局类型定义
└── middleware.ts                    # 请求日志
```

<br/>

---

## 🚀 快速开始

<table>
<tr>
<td width="33%" align="center">

### 1️⃣ 安装依赖

```bash
npm install
```

</td>
<td width="33%" align="center">

### 2️⃣ 启动开发服务器

```bash
npm run dev
```

<br/>
<sub>默认访问 → http://127.0.0.1:3000/workspace</sub>

</td>
<td width="33%" align="center">

### 3️⃣ 类型检查

```bash
npm run typecheck
```

</td>
</tr>
</table>

### 环境要求

- **Node.js** ≥ 18.17（推荐 20 LTS）
- **npm**（随 Node.js 安装）

### 生产构建

```bash
npm run build
npm run start
```

---

## ⚙️ 环境变量

> 默认情况下平台生成走本地 mock 逻辑，无需配置即可体验完整工作流。  
> 若要启用 LLM 真实生成，配置以下环境变量或通过 `/settings` 页面 UI 配置。

```bash
# 复制示例文件
cp .env.example .env.local
```

| 变量 | 说明 | 默认值 |
|---|---|---|
| `OMNIPOST_USE_LLM` | 启用 LLM 环境级兜底 | `false` |
| `OPENAI_API_KEY` | OpenAI 兼容 API 密钥 | — |
| `OMNIPOST_OPENAI_BASE_URL` | API 地址 | `https://api.openai.com/v1` |
| `OMNIPOST_OPENAI_MODEL` | 模型名称 | `gpt-4o-mini` |
| `OMNIPOST_ENCRYPTION_KEY` | UI 密钥加密密钥 | 本地开发默认值 |

> ⚡ **优先级**: UI 保存的 Key > 环境变量 > mock 回退  
> 🔐 **加密**: UI 配置的 API Key 经 AES-256-GCM 加密后落盘

---

## 🔌 API 速查

| Method | Route | 说明 |
|---|---|---|
| `POST` | `/api/contents` | 创建原始内容 |
| `POST` | `/api/contents/:id/generate` | 生成平台适配版本 |
| `GET` / `PUT` | `/api/platform-contents/:id` | 读写平台版本 |
| `GET` / `PUT` / `DELETE` | `/api/settings/llm` | LLM 配置管理 |
| `POST` | `/api/settings/llm/test` | 测试 LLM 连接 |
| `POST` | `/api/publish/mock` | 创建模拟发布任务 |
| `GET` | `/api/publish/tasks` | 查询发布记录 |

---

## 🗺️ 路线图

<table>
<tr>
  <td><code>v1.0</code></td>
  <td>✅</td>
  <td>三栏工作台 · 4 平台适配 · LLM/Mock 双模式 · 规则校验 · 模拟发布</td>
</tr>
<tr>
  <td><code>v1.1</code></td>
  <td>🏗️</td>
  <td>SQLite 持久化 · 图片上传与管理 · 批量发布</td>
</tr>
<tr>
  <td><code>v1.2</code></td>
  <td>📋</td>
  <td>更多平台支持 · 自定义 Style Preset · 发布到真实平台 API</td>
</tr>
<tr>
  <td><code>v2.0</code></td>
  <td>💡</td>
  <td>协作编辑 · 版本历史 · 内容分析仪表盘</td>
</tr>
</table>

<br/>

---

<div align="center">

<svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="60" rx="12" fill="#0f172a"/>
  <text x="200" y="28" text-anchor="middle" fill="#64748b" font-size="12" font-family="system-ui">Built with</text>
  <text x="200" y="48" text-anchor="middle" fill="#e2e8f0" font-size="13" font-family="system-ui">
    Next.js · React · TypeScript · Tailwind CSS · Zod · Drizzle ORM
  </text>
</svg>

<br/>
<br/>

<sub>Made with ❤️ for content creators · MIT License</sub>

</div>
