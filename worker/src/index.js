/**
 * Cloudflare Workers - R2 视频代理服务
 * 功能：防盗链、Range请求、CDN缓存、流式传输
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // 移除开头的 /

    // CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // 健康检查
    if (path === '' || path === 'health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'R2 Video Proxy',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证签名（防盗链）
    if (env.SECRET_KEY) {
      const isValid = await verifySignature(url, env.SECRET_KEY);
      if (!isValid) {
        return new Response('Invalid or expired signature', { status: 403 });
      }
    }

    // Referer 白名单检查（可选）
    if (env.ALLOWED_DOMAINS) {
      const referer = request.headers.get('Referer');
      const allowedDomains = env.ALLOWED_DOMAINS.split(',');

      if (referer) {
        const refererHost = new URL(referer).hostname;
        const isAllowed = allowedDomains.some(domain =>
          refererHost === domain || refererHost.endsWith('.' + domain)
        );

        if (!isAllowed) {
          return new Response('Forbidden - Invalid referer', { status: 403 });
        }
      }
    }

    try {
      // 从 R2 获取对象
      const object = await env.R2_BUCKET.get(path, {
        range: request.headers.get('Range') || undefined
      });

      if (!object) {
        return new Response('Video not found', { status: 404 });
      }

      // 构建响应头
      const headers = new Headers();

      // 设置 Content-Type
      const contentType = getContentType(path);
      headers.set('Content-Type', contentType);

      // 处理 Range 请求
      const range = request.headers.get('Range');
      let status = 200;

      if (range && object.range) {
        status = 206; // Partial Content
        headers.set('Content-Range',
          `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`
        );
        headers.set('Content-Length', object.range.length.toString());
      } else {
        headers.set('Content-Length', object.size.toString());
      }

      // 允许 Range 请求
      headers.set('Accept-Ranges', 'bytes');

      // 缓存控制
      headers.set('Cache-Control', 'public, max-age=86400'); // 24小时
      headers.set('ETag', object.etag);

      // CORS 头
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Range');
      headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

      // 其他头
      if (object.httpMetadata) {
        if (object.httpMetadata.contentDisposition) {
          headers.set('Content-Disposition', object.httpMetadata.contentDisposition);
        }
        if (object.httpMetadata.contentEncoding) {
          headers.set('Content-Encoding', object.httpMetadata.contentEncoding);
        }
      }

      return new Response(object.body, {
        status,
        headers
      });

    } catch (error) {
      console.error('Error fetching from R2:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

/**
 * 验证 URL 签名
 */
async function verifySignature(url, secretKey) {
  const expires = url.searchParams.get('expires');
  const signature = url.searchParams.get('signature');

  if (!expires || !signature) {
    return false;
  }

  // 检查是否过期
  const now = Math.floor(Date.now() / 1000);
  if (parseInt(expires) < now) {
    return false;
  }

  // 验证签名
  const path = url.pathname.slice(1);
  const data = `${path}:${expires}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

/**
 * 根据文件扩展名返回 Content-Type
 */
function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();

  const types = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'm3u8': 'application/vnd.apple.mpegurl',
    'ts': 'video/mp2t',
    'flv': 'video/x-flv',
    'wmv': 'video/x-ms-wmv',
    'vtt': 'text/vtt',
    'srt': 'application/x-subrip'
  };

  return types[ext] || 'application/octet-stream';
}

/**
 * 处理 CORS 预检请求
 */
function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

