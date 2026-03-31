# 部署指南

本文档帮助你将 Image Background Remover 部署到 Cloudflare Workers。

---

## 前置要求

1. **Cloudflare 账号**：https://dash.cloudflare.com
2. **Remove.bg API Key**：https://www.remove.bg/api

---

## 第一步：获取 Remove.bg API Key

1. 打开 https://www.remove.bg/api
2. 注册账号
3. 进入 API 页面，获取你的 API Key
4. 免费版每月 50 张，付费版 $0.07/张

---

## 第二步：安装依赖

```bash
cd image-background-remover
npm install
```

---

## 第三步：配置 API Key

编辑 `wrangler.toml` 文件，将你的 API Key 填入：

```toml
[vars]
REMOVE_BG_API_KEY = "你的API Key"
```

---

## 第四步：部署

```bash
npm run deploy
# 或者
npx wrangler deploy
```

部署成功后，Cloudflare 会给你一个类似这样的域名：
```
https://image-background-remover.your-account.workers.dev
```

---

## 第五步（可选）：绑定自定义域名

如果你有自己的域名：

```bash
npx wrangler routes add "your-domain.com/*"
```

---

## 测试

1. 打开部署后的域名
2. 拖拽或上传一张图片
3. 等待处理完成
4. 点击下载

---

## 本地开发

```bash
npx wrangler dev
```

---

## 费用说明

| 服务 | 费用 |
|------|------|
| Cloudflare Workers | 免费（每月 10 万次请求） |
| Remove.bg API | 免费版每月 50 张，付费 $0.07/张 |

---

## 常见问题

**Q: 提示 "REMOVE_BG_API_KEY not configured"**  
A: 检查 wrangler.toml 中的 API Key 是否正确填入

**Q: 处理很慢**  
A: 图片越大处理时间越长，正常现象

**Q: 超出免费额度**  
A: 需要付费或换用其他 API

---

## 后续维护

- 查看日志：`npx wrangler tail`
- 版本回滚：在 Cloudflare Dashboard 中操作

---

**文档结束**
