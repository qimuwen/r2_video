# ✅ 部署检查清单

打印此页面，完成部署时逐项勾选。

---

## 📋 第一步：准备工作

- [ ] 已注册 Cloudflare 账号
- [ ] 已创建 R2 存储桶（记录存储桶名称：________________）
- [ ] 已生成 R2 API Token（记录保存在安全位置）
- [ ] 已安装 Node.js 和 npm
- [ ] 已安装 Wrangler CLI：`npm install -g wrangler`
- [ ] 已生成强密钥（记录密钥：________________）

---

## 📋 第二步：配置 Worker

### 文件：`worker/wrangler.toml`

- [ ] 修改 `bucket_name` 为：________________
- [ ] 修改 `preview_bucket_name` 为：________________
- [ ] 修改 `SECRET_KEY` 为：________________
- [ ] （可选）配置 `ALLOWED_DOMAINS`

### 部署 Worker

```bash
cd worker
npm install
npx wrangler login
npx wrangler deploy
```

- [ ] 部署成功
- [ ] 记录 Worker URL：________________
- [ ] 测试健康检查：`curl https://[Worker-URL]/health`

---

## 📋 第三步：配置前端

### 文件：`frontend/index.html`（第 44-45 行）

- [ ] 修改 `WORKER_URL` 为：________________
- [ ] 修改 `SECRET_KEY` 为：________________
- [ ] （可选）修改 `sampleVideos` 数组为实际视频数据

### 文件：`frontend/player.html`

- [ ] 搜索并修改 `WORKER_URL` 为：________________
- [ ] 搜索并修改 `SECRET_KEY` 为：________________

### 测试前端

- [ ] 在浏览器中打开 `index.html`
- [ ] 页面正常显示
- [ ] 无控制台错误

---

## 📋 第四步：配置上传工具

### 创建文件：`upload-tool/config.json`

```json
{
  "ACCOUNT_ID": "________________",
  "BUCKET_NAME": "________________",
  "R2_ACCESS_KEY_ID": "________________",
  "R2_SECRET_ACCESS_KEY": "________________"
}
```

- [ ] 文件已创建
- [ ] 所有字段已填写
- [ ] 添加到 `.gitignore`（防止泄露）

### 上传测试视频

```bash
cd upload-tool
npm install
node upload.js /path/to/test/video
```

- [ ] 依赖安装成功
- [ ] 测试视频上传成功
- [ ] 在 Cloudflare Dashboard 中确认视频存在

---

## 📋 第五步：配置链接生成器（可选）

### 文件：`link-generator/cli.js`（第 9-10 行）

- [ ] 修改 `DEFAULT_WORKER_URL` 为：________________
- [ ] 修改 `DEFAULT_SECRET_KEY` 为：________________

### 文件：`link-generator/web/index.html`

- [ ] 搜索并修改 `WORKER_URL`
- [ ] 搜索并修改 `SECRET_KEY`

### 测试链接生成

```bash
cd link-generator
node cli.js video/test.mp4 3600
```

- [ ] 成功生成签名链接
- [ ] 链接复制到浏览器可以访问
- [ ] 视频能够正常播放

---

## 📋 第六步：安全性检查

### 密钥一致性

确认以下所有文件的 `SECRET_KEY` 完全相同：

- [ ] `worker/wrangler.toml`
- [ ] `frontend/index.html`
- [ ] `frontend/player.html`
- [ ] `link-generator/cli.js`
- [ ] `link-generator/web/index.html`

### 敏感信息保护

- [ ] `config.json` 已添加到 `.gitignore`
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 密钥未硬编码在公开的代码中
- [ ] （生产环境）使用 Wrangler Secrets 管理密钥

---

## 📋 第七步：功能测试

### Worker 测试

- [ ] 健康检查正常：`/health` 返回 200
- [ ] 签名验证工作正常（正确签名可访问）
- [ ] 过期链接被拒绝（403 错误）
- [ ] 错误签名被拒绝（403 错误）

### 视频播放测试

- [ ] 视频能够正常加载
- [ ] 视频能够正常播放
- [ ] 进度条拖动秒开（Range 请求工作）
- [ ] 播放速度调节正常
- [ ] 全屏功能正常

### 跨设备测试

- [ ] 桌面浏览器（Chrome）
- [ ] 桌面浏览器（Firefox）
- [ ] 移动浏览器（iOS Safari）
- [ ] 移动浏览器（Android Chrome）

---

## 📋 第八步：性能检查

### CDN 缓存

- [ ] 第一次访问：`CF-Cache-Status: MISS`
- [ ] 第二次访问：`CF-Cache-Status: HIT`
- [ ] 缓存时间设置正确

### 加载速度

- [ ] 视频首屏加载 < 3 秒
- [ ] 拖动进度条响应 < 1 秒
- [ ] 网络慢速下降级播放正常

---

## 📋 第九步：生产环境部署（可选）

### 自定义域名

- [ ] 在 `wrangler.toml` 中配置路由
- [ ] 在 Cloudflare DNS 中添加 CNAME
- [ ] 更新所有配置文件中的 URL
- [ ] 测试自定义域名访问

### Cloudflare Pages 部署前端

```bash
cd frontend
npx wrangler pages deploy . --project-name=r2-video-frontend
```

- [ ] 前端部署成功
- [ ] 记录 Pages URL：________________
- [ ] 通过 Pages URL 访问正常

### 域名白名单

- [ ] 在 `wrangler.toml` 中配置 `ALLOWED_DOMAINS`
- [ ] 测试白名单域名可访问
- [ ] 测试非白名单域名被拒绝

---

## 📋 第十步：文档和备份

### 文档整理

- [ ] 记录所有配置信息（存储在安全位置）
- [ ] 保存密钥备份（加密存储）
- [ ] 记录 Worker URL 和 Pages URL
- [ ] 记录 R2 API Token（单独保存）

### 配置备份

- [ ] 备份 `wrangler.toml`
- [ ] 备份 `config.json`（加密）
- [ ] 备份前端配置文件
- [ ] 创建部署文档

---

## ✅ 部署完成！

恭喜！你已成功部署 Cloudflare R2 视频服务器。

### 📝 重要信息记录

| 项目 | 值 |
|------|---|
| Worker URL | ________________ |
| Pages URL（如有） | ________________ |
| R2 存储桶名称 | ________________ |
| Account ID | ________________ |
| 密钥（加密存储） | ________________ |

### 📚 后续步骤

1. **监控和维护**
   - 定期查看 Worker 日志：`npx wrangler tail`
   - 监控 R2 存储用量
   - 关注 Cloudflare 账单

2. **内容管理**
   - 定期上传新视频
   - 清理过期或不需要的视频
   - 更新前端视频列表

3. **性能优化**
   - 分析访问日志
   - 优化缓存策略
   - 考虑启用 Argo Smart Routing

4. **安全维护**
   - 定期更换密钥
   - 审查访问日志
   - 更新依赖包

---

## 🐛 遇到问题？

- 查看 [README.md](./README.md) - 完整文档
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) - 配置速查表
- 查看 [API.md](./API.md) - API 文档
- 查看 [GUIDE.md](./GUIDE.md) - 使用指南

### 常见问题快速诊断

| 问题 | 检查项 | 文档位置 |
|------|--------|---------|
| 403 错误 | 密钥一致性、链接过期 | README.md Q1 |
| Bucket not found | 存储桶名称、R2 启用 | README.md Q2 |
| 上传失败 | API Token、config.json | README.md Q3 |
| 视频列表空 | WORKER_URL、sampleVideos | README.md Q4 |

---

**部署日期**: ____________

**部署人员**: ____________

**备注**: ____________________________________________

____________________________________________

____________________________________________
的