# 🚀 一键部署指南

本文档详细说明如何使用一键部署功能快速部署 R2 视频服务器。

---

## 📋 目录

1. [网页交互式部署](#1-网页交互式部署-推荐)
2. [GitHub Actions 自动部署](#2-github-actions-自动部署)
3. [Cloudflare Deploy Button](#3-cloudflare-deploy-button)
4. [Vercel 一键部署](#4-vercel-一键部署)
5. [配置说明](#配置说明)
6. [常见问题](#常见问题)

---

## 1. 网页交互式部署（推荐）⭐

**最简单的方式！** 无需命令行，通过网页表单完成所有配置。

### 步骤：

#### 第 1 步：打开部署页面

**本地打开：**
```bash
# 双击文件
deploy.html
```

**或在浏览器中输入：**
```
file:///path/to/r2-video-server/deploy.html
```

#### 第 2 步：选择部署平台

页面提供两个选项卡：
- **Cloudflare Workers** - 部署视频代理服务（必须）
- **Vercel** - 部署前端播放器（可选）

#### 第 3 步：填写配置

**Cloudflare Workers 配置：**

| 字段 | 说明 | 示例 |
|------|------|------|
| R2 存储桶名称 | 在 Cloudflare 创建的存储桶 | `my-videos` |
| 防盗链密钥 | 点击"自动生成"或手动输入 | 自动生成 64 位密钥 |
| 允许的域名 | 可选，用逗号分隔 | `example.com,www.example.com` |
| Worker 名称 | Worker 的唯一标识 | `r2-video-proxy` |

**表单验证：**
- ✅ 密钥长度必须 ≥ 32 位
- ✅ Worker 名称全局唯一
- ✅ 存储桶必须已创建

#### 第 4 步：生成部署配置

点击 **"🚀 部署到 Cloudflare Workers"** 按钮后，页面会显示：

1. **完整的部署命令**
   ```bash
   cd worker && npm install && npx wrangler deploy \
     --var SECRET_KEY:your-generated-key \
     --var BUCKET_NAME:my-videos
   ```

2. **配置信息汇总**
   - 存储桶名称
   - 密钥（请妥善保存）
   - 允许的域名（如有）

3. **后续步骤指引**
   - Fork 仓库
   - 运行部署命令
   - 配置前端文件

#### 第 5 步：下载配置

点击 **"📥 下载配置文件"** 保存配置到本地：

```json
{
  "platform": "Cloudflare Workers",
  "bucket_name": "my-videos",
  "secret_key": "a8f5f167f44f4964e6c998dee827110c...",
  "allowed_domains": "example.com",
  "worker_name": "r2-video-proxy",
  "note": "请妥善保管此配置文件，不要泄露密钥！"
}
```

---

## 2. GitHub Actions 自动部署

**适合：** 需要 CI/CD 自动化部署的团队

### 前置准备

1. Fork 此仓库到你的 GitHub 账号
2. 获取 Cloudflare API Token
3. 配置 GitHub Secrets

### 步骤：

#### 第 1 步：获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **My Profile** → **API Tokens**
3. 点击 **Create Token**
4. 选择模板：**Edit Cloudflare Workers**
5. 保存生成的 Token

#### 第 2 步：配置 GitHub Secrets

在你的 GitHub 仓库中：

1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下 Secrets：

| Secret 名称 | 值 | 获取方式 |
|------------|---|---------|
| `CLOUDFLARE_API_TOKEN` | 你的 API Token | 上一步生成 |
| `CLOUDFLARE_ACCOUNT_ID` | 账户 ID | Dashboard 右侧栏 |
| `WORKER_NAME` | Worker 名称 | 自定义（如 `r2-video-proxy`） |
| `SECRET_KEY` | 防盗链密钥 | 使用 deploy.html 生成 |
| `BUCKET_NAME` | 存储桶名称 | 你的 R2 存储桶 |

#### 第 3 步：触发部署

**方式 1：推送代码**
```bash
git add .
git commit -m "Configure deployment"
git push origin main
```

**方式 2：手动触发**
1. 进入 GitHub 仓库的 **Actions** 标签
2. 选择 **Deploy to Cloudflare Workers**
3. 点击 **Run workflow**

#### 第 4 步：查看部署结果

在 Actions 页面查看部署日志：
- ✅ 绿色勾号：部署成功
- ❌ 红色叉号：部署失败（查看日志排查）

部署成功后会显示：
```
✅ Worker deployed successfully!
🔗 Worker URL: https://r2-video-proxy.workers.dev
```

---

## 3. Cloudflare Deploy Button

**适合：** 快速测试和个人项目

### 步骤：

#### 第 1 步：点击部署按钮

在 README.md 中点击：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-username/r2-video-server)

#### 第 2 步：授权 GitHub

首次使用需要授权 Cloudflare 访问你的 GitHub 账号。

#### 第 3 步：填写配置

在弹出的页面中填写：

| 字段 | 说明 |
|------|------|
| **BUCKET_NAME** | R2 存储桶名称 |
| **SECRET_KEY** | 点击"Generate"自动生成或手动输入 |
| **ALLOWED_DOMAINS** | 可选，域名白名单 |

#### 第 4 步：部署

1. 点击 **Deploy** 按钮
2. 等待部署完成（约 30 秒）
3. 复制生成的 Worker URL

#### 第 5 步：验证部署

```bash
# 测试健康检查
curl https://your-worker.workers.dev/health

# 应返回
{
  "status": "ok",
  "service": "R2 Video Proxy",
  "timestamp": "2024-11-24T..."
}
```

---

## 4. Vercel 一键部署

**用途：** 部署前端播放器（Worker 仍需部署到 Cloudflare）

### 步骤：

#### 第 1 步：部署 Worker

先使用上述任一方式部署 Cloudflare Worker，获取 Worker URL。

#### 第 2 步：点击 Vercel 部署按钮

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/r2-video-server)

#### 第 3 步：配置项目

| 字段 | 说明 | 示例 |
|------|------|------|
| **Repository Name** | 仓库名称 | `r2-video-frontend` |
| **WORKER_URL** | Worker 地址 | `https://r2-video-proxy.xxx.workers.dev` |
| **SECRET_KEY** | 与 Worker 相同的密钥 | 从配置文件复制 |

#### 第 4 步：部署并访问

1. 点击 **Deploy**
2. 等待构建完成
3. 访问 Vercel 提供的 URL（如 `https://r2-video-frontend.vercel.app`）

---

## 配置说明

### 必需配置

| 配置项 | 说明 | 示例 | 如何获取 |
|--------|------|------|---------|
| **BUCKET_NAME** | R2 存储桶名称 | `my-videos` | Cloudflare Dashboard → R2 |
| **SECRET_KEY** | 防盗链密钥 | `a8f5f167f44f...` | 使用 deploy.html 生成 |

### 可选配置

| 配置项 | 说明 | 示例 | 默认值 |
|--------|------|------|--------|
| **ALLOWED_DOMAINS** | 域名白名单 | `example.com` | 无限制 |
| **WORKER_NAME** | Worker 名称 | `r2-video-proxy` | `r2-video-proxy` |

### 环境变量优先级

```
命令行参数 > GitHub Secrets > wrangler.toml > 默认值
```

---

## 常见问题

### Q1: 一键部署按钮无法点击？

**可能原因：**
- 浏览器拦截弹窗
- GitHub 未授权

**解决方法：**
1. 允许浏览器弹窗
2. 检查 GitHub 授权状态
3. 手动复制 URL 到浏览器

### Q2: 部署失败，提示 "Bucket not found"？

**原因：** R2 存储桶不存在

**解决方法：**
```bash
# 创建存储桶
npx wrangler r2 bucket create my-videos
```

### Q3: GitHub Actions 部署失败？

**检查清单：**
- [ ] API Token 是否有效
- [ ] Secrets 是否配置正确
- [ ] 存储桶是否已创建
- [ ] Account ID 是否正确

**查看日志：**
```
GitHub 仓库 → Actions → 失败的工作流 → 查看详细日志
```

### Q4: 如何更新已部署的配置？

**方法 1：重新部署**
```bash
cd worker
npx wrangler deploy --var SECRET_KEY:new-key
```

**方法 2：使用 Secrets**
```bash
npx wrangler secret put SECRET_KEY
# 输入新密钥
```

**方法 3：在 Dashboard 修改**
1. Cloudflare Dashboard → Workers & Pages
2. 选择你的 Worker
3. Settings → Variables → Edit

### Q5: 前端配置如何自动化？

创建 `frontend/.env` 文件：

```bash
WORKER_URL=https://r2-video-proxy.xxx.workers.dev
SECRET_KEY=your-secret-key
```

然后在 HTML 中读取：

```javascript
// 从环境变量或查询参数读取
const WORKER_URL = new URLSearchParams(window.location.search).get('worker') 
                   || process.env.WORKER_URL 
                   || 'https://default.workers.dev';
```

### Q6: 可以自动同步配置到前端吗？

可以！创建部署脚本 `deploy.sh`：

```bash
#!/bin/bash

# 1. 读取配置
WORKER_URL=$(npx wrangler deployments list | grep "URL" | awk '{print $2}')
SECRET_KEY=$1

# 2. 更新前端配置
sed -i "s|WORKER_URL = '.*'|WORKER_URL = '$WORKER_URL'|g" frontend/index.html
sed -i "s|SECRET_KEY = '.*'|SECRET_KEY = '$SECRET_KEY'|g" frontend/index.html

# 3. 部署前端到 Vercel
cd frontend && vercel --prod
```

使用：
```bash
./deploy.sh "your-secret-key"
```

---

## 部署对比

| 方式 | 难度 | 时间 | 自动化 | 适用场景 |
|------|------|------|--------|---------|
| 网页交互式 | ⭐ | 5 分钟 | ❌ | 初次部署、个人项目 |
| GitHub Actions | ⭐⭐ | 10 分钟 | ✅ | 团队项目、CI/CD |
| Deploy Button | ⭐ | 3 分钟 | ❌ | 快速测试 |
| Vercel | ⭐ | 5 分钟 | ✅ | 前端部署 |
| 手动部署 | ⭐⭐⭐ | 15 分钟 | ❌ | 高级定制 |

---

## 推荐部署流程

### 个人项目
1. 使用 **deploy.html** 生成配置
2. 点击 **Deploy Button** 一键部署 Worker
3. 本地打开 frontend/index.html 测试

### 团队项目
1. 使用 **deploy.html** 生成配置
2. 配置 **GitHub Actions** 自动部署
3. 使用 **Vercel** 部署前端
4. 配置自定义域名

### 生产环境
1. 手动创建 R2 存储桶
2. 使用 **Wrangler Secrets** 管理密钥
3. 配置 **GitHub Actions** + 环境分支
4. 启用监控和日志

---

## 相关文档

- [README.md](./README.md) - 完整文档
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 配置速查表
- [CHECKLIST.md](./CHECKLIST.md) - 部署检查清单
- [deploy.html](./deploy.html) - 交互式部署页面

---

## 需要帮助？

- 📖 查看 [完整文档](./README.md)
- 💬 提交 [Issue](https://github.com/your-username/r2-video-server/issues)
- 🌟 给项目点个 Star！

