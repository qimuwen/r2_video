# Cloudflare R2 视频服务器

> 基于 Cloudflare Workers + R2 的视频流服务，支持防盗链、Range 请求、CDN 缓存。

<div align="center">

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-username/r2-video-server)

**[📖 快速开始](QUICK-START.md)** · **[📋 检查清单](CHECKLIST.md)** · **[🔌 API 文档](API.md)**

</div>

---

## 🚀 5 分钟快速部署

### 方式 1：网页部署（推荐）⭐

```bash
# 在浏览器中打开
deploy.html
```

1. 填写 R2 存储桶名称
2. 点击"自动生成密钥"
3. 提交，复制命令
4. 在终端运行 → 完成！

### 方式 2：命令行部署

```bash
cd worker
npm install
npx wrangler login
# 修改 wrangler.toml 配置
npx wrangler deploy
```

**📚 详细步骤：** [QUICK-START.md](QUICK-START.md)

---

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 🎬 **Range 请求** | 支持进度条拖动，秒开任意位置 |
| 🔐 **防盗链保护** | URL 签名 + 过期时间验证 |
| ⚡ **CDN 加速** | Cloudflare 全球 300+ 节点缓存 |
| 📤 **批量上传** | 断点续传，并发控制 |
| 🎨 **前端播放器** | 开箱即用的视频列表和播放器 |
| 🔗 **链接生成器** | 命令行 + 网页版签名工具 |

---

## 📦 项目结构

```
r2-video-server/
├── deploy.html              # 🌟 交互式部署页面
├── worker/                  # Worker 服务
│   ├── src/index.js        # 核心代码
│   └── wrangler.toml       # ⚠️ 需要配置
├── frontend/                # 前端播放器
│   ├── index.html          # ⚠️ 需要配置
│   └── player.html         # ⚠️ 需要配置
├── upload-tool/             # 批量上传工具
│   ├── upload.js
│   └── config.json         # ⚠️ 需要创建
├── link-generator/          # 签名链接生成器
│   ├── cli.js
│   └── web/index.html
├── QUICK-START.md           # 📖 快速开始指南
├── CHECKLIST.md             # ✅ 部署检查清单
├── API.md                   # 🔌 API 文档
└── GUIDE.md                 # 📚 使用指南
```

---

## ⚙️ 快速配置

### 必须修改的 3 个地方

#### 1. Worker 配置 (`worker/wrangler.toml`)

```toml
[[r2_buckets]]
bucket_name = "your-bucket-name"  # ⚠️ 改为你的存储桶

[vars]
SECRET_KEY = "your-secret-key"    # ⚠️ 改为强密钥（32位+）
```

#### 2. 前端配置 (`frontend/index.html` 和 `player.html`)

```javascript
const WORKER_URL = 'https://your-worker.workers.dev';  // ⚠️ Worker URL
const SECRET_KEY = 'your-secret-key';  // ⚠️ 与上面相同
```

#### 3. 上传工具 (`upload-tool/config.json` - 新建文件)

```json
{
  "ACCOUNT_ID": "your-account-id",
  "BUCKET_NAME": "your-bucket-name",
  "R2_ACCESS_KEY_ID": "your-access-key",
  "R2_SECRET_ACCESS_KEY": "your-secret-key"
}
```

**📚 详细配置：** [QUICK-START.md](QUICK-START.md)

---

## 📖 使用示例

### 上传视频

```bash
cd upload-tool
npm install
node upload.js /path/to/videos
```

### 生成签名链接

```bash
cd link-generator
node cli.js video/sample.mp4 86400  # 24小时有效期
```

### 播放视频

打开 `frontend/index.html` 或访问：
```
https://your-worker.workers.dev/video/sample.mp4?expires=xxx&signature=xxx
```

---

## 🐛 常见问题

| 问题 | 快速解决 |
|------|---------|
| **403 错误** | 检查密钥是否一致，链接是否过期 |
| **Bucket not found** | 确认存储桶已创建，名称正确 |
| **上传失败** | 检查 R2 API Token 权限 |
| **前端无法加载** | 检查 WORKER_URL 和 SECRET_KEY 配置 |

**详细排错：** [QUICK-START.md](QUICK-START.md#常见问题)

---

## 📚 文档导航

| 文档 | 说明 |
|------|------|
| **[QUICK-START.md](QUICK-START.md)** | 快速开始指南（必读）|
| **[CHECKLIST.md](CHECKLIST.md)** | 部署检查清单 |
| [API.md](API.md) | API 接口文档 |
| [GUIDE.md](GUIDE.md) | 详细使用指南 |

---

## 🔐 安全建议

1. 使用强密钥（至少 32 位随机字符串）
2. 定期轮换密钥（建议每 90 天）
3. 配置域名白名单限制访问来源
4. 监控日志：`npx wrangler tail`

---

## 📄 许可证

MIT License - 随意使用和修改

---

<div align="center">

**[⭐ 开始部署](QUICK-START.md)** · **[🐛 报告问题](issues/)**

Made with ❤️

</div>

