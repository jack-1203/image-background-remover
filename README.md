# 🖼️ Image Background Remover

AI-powered tool to remove image backgrounds, deployed on Cloudflare Workers.

## 功能特性

- 🚀 一键去除图片背景
- 📱 支持拖拽上传
- 🔒 无存储，纯内存处理
- 💸 零服务器成本（Cloudflare 免费额度）

## 技术栈

- **后端**: Cloudflare Workers
- **AI 服务**: Remove.bg API
- **前端**: 原生 HTML + JavaScript

## 快速部署

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在 `wrangler.toml` 中添加你的 Remove.bg API Key：

```toml
[vars]
REMOVE_BG_API_KEY = "你的API密钥"
```

### 3. 部署

```bash
npm run deploy
```

或者使用 wrangler：

```bash
npx wrangler deploy
```

## 本地开发

```bash
npx wrangler dev
```

## 使用方法

1. 打开部署后的网站
2. 拖拽或点击上传图片
3. 等待 AI 处理
4. 下载去除背景后的图片

## 费用说明

| 服务 | 费用 |
|------|------|
| Cloudflare Workers | 免费（每月 10 万次调用） |
| Remove.bg API | $0.07/张 |

## License

MIT
