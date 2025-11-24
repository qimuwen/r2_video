# 🎯 一键部署系统说明

本项目已配置完整的一键部署功能，支持多种部署方式。

---

## 📦 新增文件说明

### 1. `deploy.html` - 交互式部署页面 ⭐

**用途：** 最简单的部署方式，通过网页表单完成所有配置

**功能：**
- ✅ 图形化配置界面
- ✅ 自动生成 64 位安全密钥
- ✅ 实时输入验证
- ✅ 支持 Cloudflare 和 Vercel 两种平台
- ✅ 生成完整的部署命令
- ✅ 可下载配置文件（JSON 格式）

**使用方法：**
```bash
# 直接在浏览器中打开
double-click deploy.html

# 或使用 Web 服务器
python -m http.server 8000
# 然后访问 http://localhost:8000/deploy.html
```

**工作流程：**
1. 打开页面 → 选择平台（Cloudflare/Vercel）
2. 填写必要配置（存储桶、密钥等）
3. 点击"自动生成"按钮生成安全密钥
4. 提交表单，页面生成部署命令和配置信息
5. 下载配置文件保存
6. 按照页面指引完成部署

---

### 2. `cloudflare.json` - Cloudflare 部署配置

**用途：** Cloudflare Deploy Button 的配置文件

**功能：**
- 定义必需的环境变量
- 配置自动生成密钥
- 设置构建和部署命令

**集成方式：**
在 README.md 中添加部署按钮：
```markdown
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)]
(https://deploy.workers.cloudflare.com/?url=YOUR_REPO_URL)
```

---

### 3. `vercel.json` - Vercel 部署配置

**用途：** Vercel 一键部署配置

**功能：**
- 指定输出目录（frontend）
- 定义环境变量
- 配置部署区域

**集成方式：**
在 README.md 中添加部署按钮：
```markdown
[![Deploy with Vercel](https://vercel.com/button)]
(https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)
```

---

### 4. `.github/workflows/deploy.yml` - GitHub Actions

**用途：** 自动化 CI/CD 部署

**触发条件：**
- 推送到 `main` 或 `master` 分支
- 手动触发（workflow_dispatch）

**功能：**
- 自动安装依赖
- 部署到 Cloudflare Workers
- 输出部署信息

**配置 Secrets：**
在 GitHub 仓库设置中添加：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `WORKER_NAME`

---

### 5. `ONE-CLICK-DEPLOY.md` - 一键部署完整指南

**用途：** 详细的一键部署文档

**内容：**
- 4 种部署方式的详细说明
- 每种方式的步骤截图（可添加）
- 常见问题解答
- 部署方式对比表
- 推荐部署流程

---

### 6. `wrangler.deploy.toml` - 部署模板

**用途：** Worker 部署的配置模板

**特点：**
- 使用变量占位符（$BUCKET_NAME, $SECRET_KEY）
- 包含详细的部署说明注释
- 可被部署脚本自动替换

---

## 🚀 部署方式对比

| 方式 | 文件 | 难度 | 时间 | 自动化 | 适合人群 |
|------|------|------|------|--------|---------|
| 网页交互式 | `deploy.html` | ⭐ | 5min | ❌ | 新手、初次部署 |
| Deploy Button | `cloudflare.json` | ⭐ | 3min | ❌ | 快速测试 |
| GitHub Actions | `.github/workflows/` | ⭐⭐ | 10min | ✅ | 团队、CI/CD |
| Vercel | `vercel.json` | ⭐ | 5min | ✅ | 前端部署 |
| 手动部署 | `README.md` | ⭐⭐⭐ | 15min | ❌ | 高级定制 |

---

## 📋 完整部署流程示例

### 场景 1：个人快速部署

```bash
# 第 1 步：打开交互式部署页面
open deploy.html

# 第 2 步：填写配置
# - 存储桶名称: my-videos
# - 点击"自动生成"密钥
# - 填写域名（可选）

# 第 3 步：点击"部署"按钮，复制生成的命令

# 第 4 步：在终端运行
cd worker
npm install
npx wrangler deploy --var SECRET_KEY:生成的密钥 --var BUCKET_NAME:my-videos

# 第 5 步：记录 Worker URL
# https://r2-video-proxy.xxx.workers.dev

# 第 6 步：更新前端配置
# 编辑 frontend/index.html 和 player.html
# 填入 Worker URL 和密钥

# 完成！
```

---

### 场景 2：GitHub 自动部署

```bash
# 第 1 步：Fork 仓库
https://github.com/your-username/r2-video-server/fork

# 第 2 步：配置 GitHub Secrets
# 进入仓库 Settings → Secrets → Actions
# 添加：
# - CLOUDFLARE_API_TOKEN
# - CLOUDFLARE_ACCOUNT_ID
# - WORKER_NAME

# 第 3 步：修改配置文件
# 编辑 worker/wrangler.toml
# 填入存储桶名称和密钥

# 第 4 步：推送代码
git add .
git commit -m "Configure deployment"
git push origin main

# 第 5 步：查看部署状态
# GitHub → Actions → 查看运行状态

# 自动部署完成！
```

---

### 场景 3：一键部署到 Vercel（前端）

```bash
# 前提：Worker 已部署（使用场景 1 或 2）

# 第 1 步：点击 README 中的 Vercel 按钮
[![Deploy with Vercel](https://vercel.com/button)](...)

# 第 2 步：填写环境变量
# - WORKER_URL: https://r2-video-proxy.xxx.workers.dev
# - SECRET_KEY: 与 Worker 相同的密钥

# 第 3 步：点击 Deploy

# 第 4 步：访问 Vercel 提供的 URL
# https://r2-video-frontend.vercel.app

# 前端部署完成！
```

---

## 🔧 自定义部署

### 修改 deploy.html

**添加自定义字段：**
```html
<div class="form-group">
    <label>自定义配置</label>
    <input type="text" id="custom-field" placeholder="输入值">
</div>
```

**修改验证逻辑：**
```javascript
// 在表单提交事件中添加
if (customField.length < 10) {
    showError('error-id', '自定义字段至少 10 位！');
    return;
}
```

---

### 修改 GitHub Actions

**添加多环境部署：**
```yaml
jobs:
  deploy:
    strategy:
      matrix:
        environment: [dev, staging, production]
    steps:
      - name: Deploy to ${{ matrix.environment }}
        run: npx wrangler deploy --env ${{ matrix.environment }}
```

**添加通知：**
```yaml
- name: Notify on success
  if: success()
  run: |
    curl -X POST https://your-webhook.com \
      -d "status=success&url=$WORKER_URL"
```

---

## 🔐 安全建议

### 1. 密钥管理

**❌ 不要：**
```javascript
// 不要在代码中硬编码密钥
const SECRET_KEY = "my-secret-key";
```

**✅ 应该：**
```javascript
// 使用环境变量
const SECRET_KEY = process.env.SECRET_KEY;

// 或使用 Wrangler Secrets
npx wrangler secret put SECRET_KEY
```

### 2. 配置文件保护

在 `.gitignore` 中添加：
```gitignore
# 敏感配置
config.json
.env
.env.local
*.key
*.secret

# 下载的配置
r2-video-config.json
```

### 3. GitHub Secrets

**定期轮换：**
```bash
# 每 90 天更换一次 API Token
# 更换后更新 GitHub Secrets
```

---

## 📊 部署统计

部署完成后，项目提供以下功能：

| 功能 | 状态 | 文件 |
|------|------|------|
| Worker 服务 | ✅ | `worker/src/index.js` |
| 防盗链保护 | ✅ | 签名验证 |
| Range 请求 | ✅ | 支持进度条拖动 |
| CDN 缓存 | ✅ | Cloudflare 自动 |
| 前端播放器 | ✅ | `frontend/` |
| 上传工具 | ✅ | `upload-tool/` |
| 链接生成器 | ✅ | `link-generator/` |
| 一键部署 | ✅ | `deploy.html` 等 |

---

## 🆘 问题排查

### 部署失败检查清单

- [ ] Node.js 版本 ≥ 16
- [ ] Wrangler 已安装：`npm install -g wrangler`
- [ ] 已登录 Cloudflare：`npx wrangler login`
- [ ] R2 存储桶已创建
- [ ] 配置文件语法正确（JSON/TOML）
- [ ] 密钥长度 ≥ 32 位
- [ ] GitHub Secrets 配置完整
- [ ] API Token 权限足够

### 常见错误

**错误 1：`Authentication error`**
```bash
# 重新登录
npx wrangler login
```

**错误 2：`Bucket not found`**
```bash
# 创建存储桶
npx wrangler r2 bucket create my-videos
```

**错误 3：`Name already taken`**
```bash
# 使用唯一的 Worker 名称
# 修改 wrangler.toml 中的 name 字段
```

---

## 📞 获取帮助

- 📖 [完整文档](./README.md)
- 🚀 [部署指南](./ONE-CLICK-DEPLOY.md)
- ✅ [检查清单](./CHECKLIST.md)
- 💬 [提交 Issue](https://github.com/your-username/r2-video-server/issues)

---

## 🎉 完成

恭喜！你现在拥有：

1. ✅ 功能完整的视频流服务
2. ✅ 多种部署方式可选
3. ✅ 完善的文档和工具
4. ✅ 自动化 CI/CD 流程

享受你的视频服务吧！🎬

