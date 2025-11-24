# 🚀 部署配置速查表

快速查找需要修改的配置项位置和内容。

---

## 📋 必须修改的配置（5 个文件）

### 1️⃣ worker/wrangler.toml

```toml
# 第 7-8 行：R2 存储桶名称
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "bluffer"  # ⚠️ 改为你的 R2 存储桶名称
preview_bucket_name = "bluffer"  # ⚠️ 改为你的 R2 存储桶名称

# 第 13 行：防盗链密钥
[vars]
SECRET_KEY = "your-secret-key-change-this"  # ⚠️ 改为强密钥
```

**如何获取存储桶名称：**
- Cloudflare Dashboard → R2 → 创建存储桶
- 记下你创建的存储桶名称（如 `my-videos`）

**如何生成密钥：**
```bash
# Linux/Mac/Windows Git Bash
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 输出示例：
# a8f5f167f44f4964e6c998dee827110c03f0fe78a36d1c9f1f9e5a8c2a9e5d8f
```

---

### 2️⃣ frontend/index.html

```javascript
// 第 44-45 行：Worker 配置
const WORKER_URL = 'https://your-worker.workers.dev'; // ⚠️ 改为你的 Worker URL
const SECRET_KEY = 'your-secret-key-change-this'; // ⚠️ 改为与 wrangler.toml 相同的密钥
```

**如何获取 Worker URL：**
```bash
cd worker
npx wrangler deploy

# 输出示例：
# Published r2-video-proxy (1.2 sec)
#   https://r2-video-proxy.abc123.workers.dev  ← 复制这个 URL
```

**修改示例视频数据（第 48-75 行）：**
```javascript
const sampleVideos = [
    {
        id: 1,
        title: '我的第一个视频',  // ⚠️ 改为实际标题
        path: 'videos/my-video.mp4',  // ⚠️ 改为 R2 中的实际路径
        thumbnail: 'https://example.com/thumb.jpg',  // ⚠️ 改为实际缩略图
        duration: '10:25',
        views: 1234,
        uploadDate: '2024-11-24'
    }
];
```

---

### 3️⃣ frontend/player.html

```javascript
// 搜索 "WORKER_URL" 和 "SECRET_KEY"（通常在 <script> 标签中）
const WORKER_URL = 'https://your-worker.workers.dev';  // ⚠️ 改为你的 Worker URL
const SECRET_KEY = 'your-secret-key-change-this';  // ⚠️ 改为相同的密钥
```

**位置查找方法：**
1. 打开 `player.html`
2. 按 Ctrl+F 搜索 `WORKER_URL`
3. 搜索 `SECRET_KEY`
4. 修改这两个配置

---

### 4️⃣ upload-tool/config.json（新建文件）

**文件不存在，需要手动创建：**

```json
{
  "ACCOUNT_ID": "your-cloudflare-account-id",
  "BUCKET_NAME": "your-bucket-name",
  "R2_ACCESS_KEY_ID": "your-r2-access-key-id",
  "R2_SECRET_ACCESS_KEY": "your-r2-secret-access-key"
}
```

**如何获取这些信息：**

1. **ACCOUNT_ID**：
   - Cloudflare Dashboard → 右侧栏 → Account ID
   - 格式：32 位十六进制字符串（如 `abc123def456...`）

2. **BUCKET_NAME**：
   - 就是你在 `wrangler.toml` 中填写的存储桶名称

3. **R2_ACCESS_KEY_ID** 和 **R2_SECRET_ACCESS_KEY**：
   - Cloudflare Dashboard → R2 → 管理 API 令牌
   - 点击"创建 API 令牌"
   - 类型选择："管理 R2 读写"
   - 复制生成的 Access Key ID 和 Secret Access Key

**完整示例：**
```json
{
  "ACCOUNT_ID": "abc123def456789012345678901234ab",
  "BUCKET_NAME": "my-videos",
  "R2_ACCESS_KEY_ID": "a1b2c3d4e5f6g7h8i9j0",
  "R2_SECRET_ACCESS_KEY": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd"
}
```

---

### 5️⃣ link-generator/cli.js

```javascript
// 第 9-10 行：默认配置
const DEFAULT_WORKER_URL = process.env.WORKER_URL || 'https://your-worker.workers.dev';
const DEFAULT_SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this';
```

---

## 📋 可选配置（3 个文件）

### 🔸 link-generator/web/index.html

```javascript
// 搜索 "WORKER_URL" 和 "SECRET_KEY"
const WORKER_URL = 'https://your-worker.workers.dev';
const SECRET_KEY = 'your-secret-key-change-this';
```

### 🔸 .env 文件（新建，用于本地开发）

```bash
WORKER_URL=https://r2-video-proxy.abc123.workers.dev
SECRET_KEY=a8f5f167f44f4964e6c998dee827110c
ACCOUNT_ID=abc123def456789012345678901234ab
BUCKET_NAME=my-videos
R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0
R2_SECRET_ACCESS_KEY=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd
```

### 🔸 worker/wrangler.toml - 域名白名单

```toml
[vars]
SECRET_KEY = "your-secret-key"
ALLOWED_DOMAINS = "yourdomain.com,www.yourdomain.com"  # ⚠️ 添加允许的域名
```

---

## ✅ 配置验证清单

部署前请确认：

| 配置项 | 文件 | 状态 |
|--------|------|------|
| ✅ R2 存储桶名称 | `worker/wrangler.toml` | [ ] |
| ✅ Worker 密钥 | `worker/wrangler.toml` | [ ] |
| ✅ Worker URL | `frontend/index.html` | [ ] |
| ✅ 前端密钥 | `frontend/index.html` | [ ] |
| ✅ 播放器 URL | `frontend/player.html` | [ ] |
| ✅ 播放器密钥 | `frontend/player.html` | [ ] |
| ✅ R2 配置文件 | `upload-tool/config.json` | [ ] |
| ✅ 链接生成器 | `link-generator/cli.js` | [ ] |
| 🔸 域名白名单 | `worker/wrangler.toml` | [ ] |
| 🔸 环境变量 | `.env` | [ ] |

---

## 🔑 密钥一致性检查

**所有配置文件中的 `SECRET_KEY` 必须完全相同！**

检查以下文件：
- [ ] `worker/wrangler.toml` → `SECRET_KEY`
- [ ] `frontend/index.html` → `SECRET_KEY`
- [ ] `frontend/player.html` → `SECRET_KEY`
- [ ] `link-generator/cli.js` → `DEFAULT_SECRET_KEY`
- [ ] `link-generator/web/index.html` → `SECRET_KEY`

**验证方法：**
```bash
# Linux/Mac
grep -r "SECRET_KEY" --include="*.toml" --include="*.html" --include="*.js" .

# Windows PowerShell
Select-String -Path .\**\*.toml,.\**\*.html,.\**\*.js -Pattern "SECRET_KEY"
```

---

## 🚀 快速部署命令

### 1. 部署 Worker
```bash
cd worker
npm install
npx wrangler login
npx wrangler deploy
# 记下输出的 Worker URL
```

### 2. 配置上传工具
```bash
cd upload-tool
npm install
# 创建 config.json（参考上面的模板）
node upload.js /path/to/videos
```

### 3. 测试部署
```bash
# 测试 Worker
curl https://your-worker.workers.dev/health

# 生成测试链接
cd link-generator
node cli.js video/test.mp4 3600

# 打开浏览器测试前端
# 双击 frontend/index.html
```

---

## 🐛 快速排错

### 问题：403 Forbidden
- ✅ 检查所有文件的 `SECRET_KEY` 是否一致
- ✅ 检查链接是否过期
- ✅ 测试 Worker：`curl https://your-worker.workers.dev/health`

### 问题：Bucket not found
- ✅ 确认 R2 存储桶已创建
- ✅ 检查 `wrangler.toml` 中的 `bucket_name`
- ✅ 运行：`npx wrangler r2 bucket list`

### 问题：上传失败
- ✅ 检查 `upload-tool/config.json` 是否存在
- ✅ 验证 R2 API Token 权限
- ✅ 确认 Account ID 正确

### 问题：视频列表为空
- ✅ 检查 `frontend/index.html` 中的 `WORKER_URL`
- ✅ 修改 `sampleVideos` 数组
- ✅ 确认视频已上传到 R2

---

## 📞 需要帮助？

1. 查看完整文档：[README.md](./README.md)
2. 查看 API 文档：[API.md](./API.md)
3. 查看使用指南��[GUIDE.md](./GUIDE.md)
4. Cloudflare 官方文档：
   - Workers: https://developers.cloudflare.com/workers/
   - R2: https://developers.cloudflare.com/r2/

