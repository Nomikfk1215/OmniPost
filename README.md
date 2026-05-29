# OmniPost

OmniPost 是一个多平台内容创作与模拟发布工作台。  
输入一份原始内容后，可以生成微信公众号、知乎、小红书、B 站专栏的差异化版本，并支持编辑、预览、规则校验和模拟发布。

## 功能特性

- 三栏工作台：原始内容输入 / 平台版本编辑 / 预览与校验
- 多平台生成：`wechat` / `zhihu` / `xiaohongshu` / `bilibili`
- 风格预设：`professional`、`casual`
- 规则校验：标题、摘要、标签、平台特有字段校验
- 模拟发布：生成发布任务与可访问的 mock 页面
- 发布记录：查看历史发布任务和链接

## 技术栈

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Zod
- Drizzle ORM (当前 demo 运行时使用本地 JSON store，Drizzle schema 保留在 `db/`)

## 本地运行

### 1) 安装依赖

```bash
npm install
```

### 2) 开发模式

```bash
npm run dev
```

默认地址：

```text
http://127.0.0.1:3000/workspace
```

### 3) 生产模式

```bash
npm run build
npm run start
```

### 4) 类型检查

```bash
npm run typecheck
```

## 可选环境变量

默认情况下，平台生成走本地 mock 逻辑。  
如果要启用 OpenAI-compatible 接口，配置以下变量：

```bash
OMNIPOST_USE_LLM=true
OPENAI_API_KEY=your_key
OMNIPOST_OPENAI_BASE_URL=https://api.openai.com/v1
OMNIPOST_OPENAI_MODEL=gpt-4o-mini
```

未配置或调用失败时会自动回退到 mock 生成，保证演示闭环可用。

## 目录结构

```text
src/
  app/
    api/                      # 后端 API 路由
    workspace/                # 工作台页面
    records/                  # 发布记录页面
    mock/[platform]/[id]/     # 模拟详情页面
  components/
    workspace/                # 三栏工作台组件
    preview/                  # 平台预览组件
    publish/                  # 发布记录相关组件
  lib/
    skills/                   # 平台规则
    presets/                  # 风格预设
    llm/                      # 生成逻辑（LLM + mock）
    validators/               # 平台校验器
    db/                       # demo 数据层（JSON store）
db/
  schema.ts                   # Drizzle 表结构定义
docs/                         # PRD / 技术方案 / prompt 设计
```

## 主要 API

- `POST /api/contents`：创建原始内容
- `POST /api/contents/{id}/generate`：生成平台内容
- `PUT /api/platform-contents/{id}`：更新平台内容
- `POST /api/publish/mock`：创建模拟发布任务
- `GET /api/publish/tasks`：查询发布记录

## 推送到 GitHub

如果你已安装并登录 GitHub CLI（`gh auth status` 显示已登录）：

```bash
# 在项目根目录执行
git init
git add .
git commit -m "feat: init OmniPost V1"

# 创建远程仓库并推送
gh repo create OmniPost --private --source . --remote origin --push
```

如果仓库已存在：

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## 备注

- `public/uploads/` 仅保留 `.gitkeep`，上传文件不会进入版本控制
- `.data/` 为本地运行数据，已在 `.gitignore` 中忽略
