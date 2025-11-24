# Cloudflare R2 视频服务器 - 完整解决方案

本项目提供了一个基于 Cloudflare Workers + R2 的完整视频流服务方案。

## 📁 项目结构

```
videoR2/
├── README.md                    # 主文档（你正在看的这个）
├── upload_videos.py             # Python 批量上传工具（推荐）
├── generate_link.py             # Python 签名链接生成器
│
├── worker/                      # Cloudflare Workers 代码
│   ├── src/index.js            # Worker 主代码
│   ├── wrangler.toml           # Workers 配置文件
│   └── package.json            # Node.js 依赖
│
├── upload-tool/                 # Node.js 上传工具（可选）
│   ├── upload.js               # JavaScript 上传脚本
│   ├── package.json
│   └── config.json             # 上传配置（已包含你的凭证）
│
├── link-generator/              # 链接生成器
│   ├── web/
│   │   └── index.html          # 网页版生成器（推荐）
│   └── cli.js                  # Node.js CLI 版本
│
└── frontend/                    # 前端播放页面
    ├── index.html              # 视频列表页
    ├── player.html             # 播放器页面
    └── style.css               # 样式文件
```

## 🚀 快速开始（5 分钟部署）

### 步骤 1: 部署 Worker

```bash
cd worker
npm install
npx wrangler login
npx wrangler deploy
```

记下部署后的 Worker URL，例如：`https://r2-video-proxy.your-account.workers.dev`

### 步骤 2: 配置 Worker

在 Cloudflare Dashboard 中：
1. 找到你的 Worker
2. 设置环境变量：
   - `SECRET_KEY`: 设置一个强密码（用于防盗链）
   - `ALLOWED_DOMAINS`: 允许的域名（可选）
3. 绑定 R2 存储桶：
   - 变量名：`R2_BUCKET`
   - 存储桶：`bluffer`

或者直接修改 `worker/wrangler.toml` 文件中的配置。

### 步骤 3: 上传视频（Python 版本 - 推荐）

```bash
# 安装依赖
pip install boto3 tqdm

# 批量上传文件夹
python upload_videos.py "D:\Videos" video/my-collection/

# 上传单个文件
python upload_videos.py --file "D:\video.mp4" video/sample.mp4
```

### 步骤 4: 生成播放链接

**方法 1：使用 Python 脚本**
```bash
python generate_link.py video/sample.mp4 1d
```

**方法 2：使用网页生成器（推荐）**
1. 打开 `link-generator/web/index.html`
2. 输入 Worker URL、视频路径、密钥
3. 选择有效期，点击生成
4. 复制链接即可使用

**方法 3：使用前端播放页面**
1. 打开 `frontend/index.html`（需要配置 WORKER_URL 和 SECRET_KEY）
2. 浏览视频列表，点击播放

## 📝 详细说明

### Worker 功能特性

✅ **Range 请求支持** - 支持视频拖动、断点续播  
✅ **防盗链保护** - URL 签名 + 过期时间  
✅ **Referer 验证** - 域名白名单（可选）  
✅ **CDN 缓存** - 自动边缘缓存优化  
✅ **CORS 支持** - 跨域访问配置  
✅ **多格式支持** - mp4, webm, mov, avi, mkv 等  

### 上传工具使用

**Python 版本（upload_videos.py）**
- ✅ 自动读取 `../r2/config.py` 配置
- ✅ 支持批量上传、断点续传
- ✅ 实时进度显示
- ✅ 跳过已存在文件
- ✅ 支持所有主流视频格式

**Node.js 版本（upload-tool/upload.js）**
- 需要先 `npm install`
- 配置文件：`config.json`（已包含）

### 签名链接生成

**为什么需要签名？**
- 防止直接盗链
- 控制链接有效期
- 保护视频资源

**签名算法：**
```
data = "{video_path}:{expires_timestamp}"
signature = HMAC_SHA256(SECRET_KEY, data)
url = "{WORKER_URL}/{video_path}?expires={expires}&signature={signature}"
```

### 前端播放器

**功能：**
- 视频列表展示
- 搜索和筛选
- 自定义播放器
- 倍速播放
- 全屏支持
- 键盘快捷键

**部署：**
1. 修改 `frontend/index.html` 中的 `WORKER_URL` 和 `SECRET_KEY`
2. 部署到 Cloudflare Pages：
   ```bash
   cd frontend
   npx wrangler pages deploy .
   ```

## 🔧 配置文件说明

### worker/wrangler.toml
```toml
name = "r2-video-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "bluffer"  # 你的存储桶名

[vars]
SECRET_KEY = "your-secret-key-change-this"  # 修改为强密码
# ALLOWED_DOMAINS = "yourdomain.com"  # 可选
```

### upload-tool/config.json
```json
{
  "ACCOUNT_ID": "768ea0dadac8b5b9c1b466cb24ba0ccf",
  "BUCKET_NAME": "bluffer",
  "R2_ACCESS_KEY_ID": "06c81f386344ac4456b8ae94f31aad04",
  "R2_SECRET_ACCESS_KEY": "d176007e57ad34f99ccddfc4809c299d80862208130915a194cad537c388a440"
}
```

## 💡 使用示例

### 示例 1：上传整个视频文件夹
```bash
python upload_videos.py "C:\Users\PC\Videos\Course" video/course/
```

### 示例 2：生成 7 天有效期的链接
```bash
python generate_link.py video/course/lesson1.mp4 7d
```

### 示例 3：在网页中嵌入视频
```html
<video controls>
  <source src="https://your-worker.workers.dev/video/sample.mp4?expires=...&signature=..." type="video/mp4">
</video>
```

## 🔒 安全建议

1. **修改默认密钥** - 将 `SECRET_KEY` 改为强密码
2. **设置域名白名单** - 配置 `ALLOWED_DOMAINS` 限制访问来源
3. **合理设置过期时间** - 根据需求设置链接有效期
4. **保护配置文件** - 不要将包含密钥的配置文件上传到公开仓库
5. **定期更换密钥** - 定期更新 SECRET_KEY 提高安全性

## 📊 性能优化

- **CDN 缓存**: 视频自动缓存 24 小时
- **Range 支持**: 按需加载，节省带宽
- **边缘计算**: Cloudflare 全球 CDN 加速
- **智能压缩**: 自动内容压缩

## 🐛 故障排查

**问题 1：上传失败**
- 检查 `config.py` 或 `config.json` 中的凭证是否正确
- 确认 R2 存储桶名称是否为 `bluffer`
- 查看是否有网络连接问题

**问题 2：视频无法播放**
- 确认签名是否过期
- 检查 Worker 是否正确绑定 R2_BUCKET
- 验证 SECRET_KEY 是否一致

**问题 3：403 Forbidden**
- 检查 Referer 是否在白名单中
- 确认签名是否正确
- 查看链接是否已过期

## 📚 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 🎯 下一步计划

- [ ] 添加视频转码功能
- [ ] 支持 HLS 流式传输
- [ ] 增加访问统计
- [ ] 添加水印功能
- [ ] 支持字幕上传和管理

## 📄 许可证

MIT License - 随意使用和修改

---

## 快速命令参考

```bash
# Worker 部署
cd worker && npm install && npx wrangler deploy

# Python 批量上传（推荐）
python upload_videos.py <folder> <prefix>

# Python 生成链接
python generate_link.py <video-path> <expires>

# Node.js 上传
cd upload-tool && npm install && node upload.js <folder>

# 打开网页生成器
start link-generator/web/index.html

# 打开前端播放器
start frontend/index.html
```

有问题？查看各个工具的 `--help` 选项获取更多帮助！

