# Cloudflare R2 视频服务器 - API 文档

## Worker API 端点

### 1. 健康检查

**请求:**
```
GET https://your-worker.workers.dev/
GET https://your-worker.workers.dev/health
```

**响应:**
```json
{
  "status": "ok",
  "service": "R2 Video Proxy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. 获取视频（无签名）

**请求:**
```
GET https://your-worker.workers.dev/video/sample.mp4
```

**响应:**
- 如果配置了 SECRET_KEY，将返回 403 Forbidden
- 否则返回视频流

### 3. 获取视频（带签名）

**请求:**
```
GET https://your-worker.workers.dev/video/sample.mp4?expires=1234567890&signature=abc123...
```

**响应头:**
```
Content-Type: video/mp4
Content-Length: 12345678
Accept-Ranges: bytes
Cache-Control: public, max-age=86400
Access-Control-Allow-Origin: *
```

### 4. Range 请求（支持拖动）

**请求:**
```
GET https://your-worker.workers.dev/video/sample.mp4?expires=...&signature=...
Range: bytes=0-1023
```

**响应:**
```
Status: 206 Partial Content
Content-Range: bytes 0-1023/12345678
Content-Length: 1024
```

## Python API

### upload_videos.py

#### 批量上传
```python
from upload_videos import batch_upload

batch_upload(
    folder_path='D:/Videos/Course',
    prefix='video/course/'
)
```

#### 单文件上传
```python
from upload_videos import upload_file_with_progress

result = upload_file_with_progress(
    local_path='D:/video.mp4',
    s3_key='video/sample.mp4',
    skip_existing=True
)

if result.get('success'):
    print(f"上传成功，大小: {result['size']} 字节")
```

### generate_link.py

#### 生成签名链接
```python
from generate_link import generate_signed_url

url = generate_signed_url(
    video_path='video/sample.mp4',
    expires_in=86400,  # 24小时
    worker_url='https://your-worker.workers.dev',
    secret_key='your-secret-key'
)

print(url)
# 输出: https://your-worker.workers.dev/video/sample.mp4?expires=1234567890&signature=abc123...
```

## JavaScript API

### 生成签名链接（浏览器端）

```javascript
async function generateSignedUrl(videoPath, expiresIn = 3600) {
    const workerUrl = 'https://your-worker.workers.dev';
    const secretKey = 'your-secret-key';
    
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const data = `${videoPath}:${expires}`;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(data)
    );
    
    const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    
    return `${workerUrl}/${videoPath}?expires=${expires}&signature=${signatureHex}`;
}

// 使用示例
const url = await generateSignedUrl('video/sample.mp4', 86400);
console.log(url);
```

### 生成签名链接（Node.js）

```javascript
const crypto = require('crypto');

function generateSignedUrl(videoPath, expiresIn = 3600) {
    const workerUrl = 'https://your-worker.workers.dev';
    const secretKey = 'your-secret-key';
    
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const data = `${videoPath}:${expires}`;
    
    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(data)
        .digest('hex');
    
    return `${workerUrl}/${videoPath}?expires=${expires}&signature=${signature}`;
}

// 使用示例
const url = generateSignedUrl('video/sample.mp4', 86400);
console.log(url);
```

## 前端集成示例

### HTML5 Video 标签

```html
<video controls width="800">
    <source src="https://your-worker.workers.dev/video/sample.mp4?expires=...&signature=..." type="video/mp4">
    <track src="https://your-worker.workers.dev/video/sample.vtt?expires=...&signature=..." kind="subtitles" srclang="zh" label="中文">
    您的浏览器不支持 HTML5 视频。
</video>
```

### Video.js 播放器

```html
<!DOCTYPE html>
<html>
<head>
    <link href="https://vjs.zencdn.net/8.0.4/video-js.css" rel="stylesheet">
</head>
<body>
    <video id="my-video" class="video-js" controls preload="auto" width="800" height="450">
        <source src="signed-video-url" type="video/mp4">
    </video>
    
    <script src="https://vjs.zencdn.net/8.0.4/video.min.js"></script>
    <script>
        var player = videojs('my-video', {
            playbackRates: [0.5, 1, 1.5, 2],
            controlBar: {
                volumePanel: { inline: false }
            }
        });
    </script>
</body>
</html>
```

### React 组件

```jsx
import React, { useState, useEffect } from 'react';

function VideoPlayer({ videoPath }) {
    const [signedUrl, setSignedUrl] = useState('');
    
    useEffect(() => {
        async function getSignedUrl() {
            // 调用后端 API 获取签名 URL
            const response = await fetch(`/api/video-url?path=${videoPath}`);
            const data = await response.json();
            setSignedUrl(data.url);
        }
        
        getSignedUrl();
    }, [videoPath]);
    
    return (
        <video controls width="100%">
            <source src={signedUrl} type="video/mp4" />
        </video>
    );
}

export default VideoPlayer;
```

## REST API 示例（可选：构建自己的后端）

### Express.js 后端

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
const WORKER_URL = 'https://your-worker.workers.dev';
const SECRET_KEY = 'your-secret-key';

// 生成视频签名链接
app.get('/api/video-url', (req, res) => {
    const videoPath = req.query.path;
    const expiresIn = parseInt(req.query.expires) || 3600;
    
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const data = `${videoPath}:${expires}`;
    
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(data)
        .digest('hex');
    
    const url = `${WORKER_URL}/${videoPath}?expires=${expires}&signature=${signature}`;
    
    res.json({ url, expires });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### Flask 后端

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import time

app = Flask(__name__)

WORKER_URL = 'https://your-worker.workers.dev'
SECRET_KEY = 'your-secret-key'

@app.route('/api/video-url')
def get_video_url():
    video_path = request.args.get('path')
    expires_in = int(request.args.get('expires', 3600))
    
    expires = int(time.time()) + expires_in
    data = f"{video_path}:{expires}"
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest()
    
    url = f"{WORKER_URL}/{video_path}?expires={expires}&signature={signature}"
    
    return jsonify({'url': url, 'expires': expires})

if __name__ == '__main__':
    app.run(port=3000)
```

## 错误处理

### 错误代码

| 状态码 | 说明 | 解决方案 |
|--------|------|----------|
| 403 | 签名无效或已过期 | 重新生成签名链接 |
| 403 | Referer 不在白名单中 | 添加域名到 ALLOWED_DOMAINS |
| 404 | 视频不存在 | 检查视频路径是否正确 |
| 416 | Range 请求无效 | 检查 Range 头格式 |
| 500 | 服务器内部错误 | 查看 Worker 日志 |

### 错误响应示例

```json
{
    "error": "Invalid or expired signature",
    "code": 403,
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 性能优化建议

### 1. 启用 CDN 缓存
```javascript
// 在 Worker 中设置更长的缓存时间
headers.set('Cache-Control', 'public, max-age=2592000'); // 30天
```

### 2. 使用 HLS 流式传输（高级）
```javascript
// 转换视频为 HLS 格式
// 生成 .m3u8 播放列表和 .ts 分片
```

### 3. 预加载常用视频
```javascript
// 在前端预加载视频元数据
<link rel="preload" as="video" href="video-url">
```

### 4. 自适应码率
```javascript
// 提供多个码率版本
const qualities = {
    '1080p': 'video/sample_1080p.mp4',
    '720p': 'video/sample_720p.mp4',
    '480p': 'video/sample_480p.mp4'
};
```

## 监控和日志

### Worker 日志查看
```bash
# 实时查看日志
npx wrangler tail

# 查看特定时间段的日志
npx wrangler tail --since 1h
```

### 自定义日志记录
```javascript
// 在 Worker 中添加日志
console.log('Video accessed:', {
    path: path,
    ip: request.headers.get('CF-Connecting-IP'),
    timestamp: new Date().toISOString()
});
```

## 安全最佳实践

1. **定期更换密钥**: 每 90 天更换一次 SECRET_KEY
2. **设置合理的过期时间**: 根据业务需求设置，避免过长
3. **启用 Referer 验证**: 限制只能从你的网站访问
4. **监控异常流量**: 使用 Cloudflare Analytics
5. **限制文件大小**: 在上传时检查文件大小
6. **备份重要视频**: 定期备份到其他存储

## 常见问题 FAQ

**Q: 视频加载很慢怎么办？**
A: 检查 CDN 缓存是否生效，考虑使用 HLS 流式传输

**Q: 如何限制单个 IP 的访问次数？**
A: 在 Worker 中使用 KV 存储记录访问次数

**Q: 支持 HTTPS 吗？**
A: 是的，Cloudflare Workers 默认提供 HTTPS

**Q: 如何添加水印？**
A: 需要使用视频处理服务，或在前端使用 Canvas 叠加

**Q: 可以直接播放 YouTube 链接吗？**
A: 不可以，只支持 R2 中存储的视频文件

