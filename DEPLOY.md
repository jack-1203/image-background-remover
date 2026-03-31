# 部署指南

本文档帮助你将 Image Background Remover 部署上线。

---

## 系统架构

```
┌─────────────┐      ┌─────────────────┐      ┌─────────────┐
│   用户浏览器  │ ──▶ │   Next.js 前端   │ ──▶ │ Cloudflare  │
│             │      │   (Vercel)      │      │  Workers    │
└─────────────┘      └─────────────────┘      └─────────────┘
                                                      │
                                                      ▼
                                             ┌─────────────┐
                                             │ Remove.bg  │
                                             │    API     │
                                             └─────────────┘
```

---

## 前置要求

1. **Cloudflare 账号**：https://dash.cloudflare.com
2. **Vercel 账号**：https://vercel.com（免费托管 Next.js）
3. **Remove.bg API Key**：https://www.remove.bg/api

---

## 第一步：获取 Remove.bg API Key

1. 打开 https://www.remove.bg/api
2. 注册账号
3. 获取你的 API Key
4. 免费版每月 50 张，付费版 $0.07/张

---

## 第二步：部署后端（Cloudflare Workers）

### 2.1 安装依赖

```bash
cd image-background-remover
npm install
```

### 2.2 配置 API Key

编辑 `wrangler.toml`：

```toml
[vars]
REMOVE_BG_API_KEY = "你的API Key"
```

### 2.3 部署

```bash
npx wrangler deploy
```

部署成功后获取你的 Workers 域名，例如：
```
https://image-background-remover.xxxyyy.workers.dev
```

---

## 第三步：部署前端（Next.js）

### 3.1 配置环境变量

```bash
cd frontend
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 Workers 域名：

```bash
NEXT_PUBLIC_API_URL=https://image-background-remover.xxxyyy.workers.dev
```

### 3.2 推送到 GitHub

项目已包含前端代码，推送到 GitHub：

```bash
cd frontend
git add .
git commit -m "feat: 添加 Next.js 前端"
git push
```

### 3.3 部署到 Vercel

1. 打开 https://vercel.com
2. 点击 "New Project"
3. 导入 `image-background-remover` 仓库
4. 选择 `frontend` 目录作为根目录
5. 在 Environment Variables 中添加：
   - `NEXT_PUBLIC_API_URL` = 你的 Workers 域名
6. 点击 Deploy

---

## 第四步：绑定域名（可选）

### Vercel 绑定自定义域名

1. 在 Vercel 项目设置中添加自定义域名
2. 配置 DNS 解析

### Cloudflare Workers 绑定域名

```bash
npx wrangler routes add "api.your-domain.com/*"
```

---

## 测试

1. 打开 Vercel 部署的域名
2. 拖拽或上传一张图片
3. 等待 AI 处理
4. 点击下载透明背景图片

---

## 费用说明

| 服务 | 免费额度 | 付费 |
|------|----------|------|
| Cloudflare Workers | 10万次/月 | $5/10万次 |
| Vercel | 100GB 带宽/月 | $20/100GB |
| Remove.bg API | 50张/月 | $0.07/张 |

---

## 本地开发

### 后端
```bash
cd image-background-remover
npx wrangler dev
```

### 前端
```bash
cd frontend
npm run dev
```

---

## 项目结构

```
image-background-remover/
├── src/
│   └── index.ts       # Cloudflare Workers 后端
├── wrangler.toml      # 配置文件
├── frontend/          # Next.js 前端
│   ├── src/app/       # Next.js App Router
│   ├── .env.example   # 环境变量示例
│   └── package.json   # 前端依赖
├── DEPLOY.md          # 本文档
└── mvp-requirement.md # 需求文档
```

---

## 常见问题

**Q: 提示 "REMOVE_BG_API_KEY not configured"**  
A: 检查 wrangler.toml 中的 API Key

**Q: 前端无法上传图片**  
A: 检查 NEXT_PUBLIC_API_URL 是否正确指向 Workers 域名

**Q: 处理很慢**  
A: 图片越大处理时间越长，正常现象

**Q: Vercel 部署失败**  
A: 确保选择 frontend 目录作为项目根目录

---

**文档结束**
