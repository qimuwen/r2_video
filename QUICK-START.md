# 🚀 快速开始指南

> **5 分钟完成部署！** 选择最适合你的方式。

---

## 📋 部署前准备

- ✅ Cloudflare 账号（[免费注册](https://dash.cloudflare.com/sign-up)）
- ✅ 已创建 R2 存储桶（Dashboard → R2 → 创建存储桶）
- ✅ Node.js 16+ 已安装

---

## 🎯 三种部署方式

### 方式 1️⃣：网页交互式部署 ⭐ 推荐新手

**最简单！** 无需命令行，填表单即可。

```bash
# 在浏览器中打开
deploy.html
```

**步骤：**
1. 打开 `deploy.html`
2. 填写 R2 存储桶名称
3. 点击"自动生成密钥"
4. 提交表单，复制生成的命令
5. 在终端运行命令
6. 完成！🎉

---

### 方式 2️⃣：命令行部署 ⚡ 最直接

```bash
# 1. 克隆/下载项目
cd worker

# 2. 安装依赖
npm install

# 3. 登录 Cloudflare
npx wrangler login

# 4. 修改配置 worker/wrangler.toml
# - bucket_name: 你的存储桶名称
# - SECRET_KEY: 生成一个强密钥（至少32位）

# 5. 部署
npx wrangler deploy

# 6. 记下 Worker URL
# 输出: https://r2-video-proxy.xxx.workers.dev
```

**生成密钥：**
```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 方式 3️⃣：GitHub Actions 自动部署 🤖 适合团队

**推送代码自动部署！**

**步骤：**

1. **Fork 仓库到你的 GitHub**

2. **配置 GitHub Secrets**（Settings → Secrets → Actions）
   
   | Secret 名称 | 获取方式 |
   |------------|---------|
   | `CLOUDFLARE_API_TOKEN` | Dashboard → My Profile → API Tokens → Create Token |
   | `CLOUDFLARE_ACCOUNT_ID` | Dashboard 右侧栏 |
   | `BUCKET_NAME` | 你的 R2 存储桶名称 |
   | `SECRET_KEY` | 使用命令生成（见上方） |

3. **修改配置文件**
   ```bash
   # 编辑 worker/wrangler.toml
   # 填入你的配置
   ```

4. **推送代码**
   ```bash
   git add .
   git commit -m "Configure deployment"
   git push origin main
   ```

5. **查看部署状态**
   - GitHub → Actions → 查看运行状态
   - 部署成功后获取 Worker URL

---

## ⚙️ 必须修改的配置

### 📝 配置速查表

| 文件 | 位置 | 必须修改 |
|------|------|---------|
| **Worker 配置** | `worker/wrangler.toml` | |
| → 存储桶名称 | 第 7 行 `bucket_name` | ✅ |
| → 防盗链密钥 | 第 13 行 `SECRET_KEY` | ✅ |
| → 域名白名单 | 第 14 行 `ALLOWED_DOMAINS` | 🔸 可选 |
| **前端配置** | `frontend/index.html` | |
| → Worker URL | 第 44 行 `WORKER_URL` | ✅ |
| → 密钥 | 第 45 行 `SECRET_KEY` | ✅ |
| **前端配置** | `frontend/player.html` | |
| → Worker URL | 搜索 `WORKER_URL` | ✅ |
| → 密钥 | 搜索 `SECRET_KEY` | ✅ |
| **上传工具配置** | `upload-tool/config.json` | |
| → 新建文件 | 参考 `.env.example` | ✅ |

### 📄 配置文件示例

**worker/wrangler.toml:**
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "my-videos"  # ⚠️ 改这里

[vars]
SECRET_KEY = "a8f5f167f44f4964e6c998dee827110c..."  # ⚠️ 改这里
```

**frontend/index.html:**
```javascript
const WORKER_URL = 'https://r2-video-proxy.xxx.workers.dev';  // ⚠️ 改这里
const SECRET_KEY = 'a8f5f167f44f4964e6c998dee827110c...';  // ⚠️ 改这里
```

**upload-tool/config.json（新建）:**
```json
{
  "ACCOUNT_ID": "你的账户ID",
  "BUCKET_NAME": "my-videos",
  "R2_ACCESS_KEY_ID": "R2 API Token ID",
  "R2_SECRET_ACCESS_KEY": "R2 API Token Secret"
}
```

**获取 R2 API Token：**
1. Dashboard → R2 → 管理 API 令牌
2. 创建 API 令牌
3. 复制 Access Key ID 和 Secret Access Key

---

## ✅ 部署验证

```bash
# 1. 测试 Worker 健康状态
curl https://your-worker.workers.dev/health

# 应返回
{
  "status": "ok",
  "service": "R2 Video Proxy",
  "timestamp": "..."
}

# 2. 上传测试视频
cd upload-tool
npm install
node upload.js /path/to/test-video.mp4

# 3. 生成测试链接
cd link-generator
node cli.js video/test-video.mp4 3600

# 4. 在浏览器中测试播放
# 打开生成的链接，查看视频是否能正常播放
```

---

## 🔧 常见配置

### 自定义缓存时间

编辑 `worker/src/index.js`：
```javascript
const cacheTime = 86400;  // 24小时
// 或 604800 (7天)
// 或 2592000 (30天)
```

### 配置域名白名单

编辑 `worker/wrangler.toml`：
```toml
[vars]
ALLOWED_DOMAINS = "yourdomain.com,www.yourdomain.com"
```

### 自定义 Worker 域名

```toml
routes = [
  { pattern = "videos.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

然后在 Cloudflare DNS 添加 CNAME：
- 类型：CNAME
- 名称：videos
- 目标：your-worker.workers.dev
- 代理：已代理（橙色云朵）

---

## 🐛 常见问题

### Q: 403 Forbidden 错误？
**原因：** 密钥不匹配或链接过期

**解决：**
```bash
# 1. 检查所有配置文件的 SECRET_KEY 是否完全一致
# 2. 重新生成签名链接
# 3. 测试 Worker
curl https://your-worker.workers.dev/health
```

### Q: Bucket not found？
**原因：** 存储桶名称错误或未创建

**解决：**
```bash
# 列出所有存储桶
npx wrangler r2 bucket list

# 创建存储桶
npx wrangler r2 bucket create my-videos
```

### Q: 上传失败？
**原因：** R2 API Token 权限不足

**解决：**
1. 检查 Token 权限：需要 "Admin Read & Write"
2. 重新生成 Token
3. 更新 `upload-tool/config.json`

### Q: 前端无法加载视频？
**解决：**
1. 检查 `WORKER_URL` 是否正确（必须是完整 URL）
2. 检查 `SECRET_KEY` 是否与 Worker 一致
3. 打开浏览器开发者工具查看错误信息
4. 确认视频已上传到 R2

---

## 📚 更多文档

- 📖 [README.md](README.md) - 完整项目文档
- ✅ [CHECKLIST.md](CHECKLIST.md) - 部署检查清单（可打印）
- 🔌 [API.md](API.md) - API 接口文档
- 📚 [GUIDE.md](GUIDE.md) - 详细使用指南

---

## 🎉 部署完成后

1. **上传视频**
   ```bash
   cd upload-tool
   node upload.js /path/to/videos
   ```

2. **配置前端**
   - 更新 `frontend/index.html` 中的视频列表
   - 部署前端到 Cloudflare Pages 或本地使用

3. **生成分享链接**
   ```bash
   cd link-generator
   node cli.js video/your-video.mp4 86400
   ```

4. **享受你的视频服务！** 🎬

---

**需要帮助？** 查看 [README.md](README.md) 或提交 Issue。

