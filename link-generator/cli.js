#!/usr/bin/env node
/**
 * R2 视频链接生成器 - 命令行版本
 * 使用: node cli.js <video-path> <expires-in-seconds> [worker-url] [secret-key]
 */

const crypto = require('crypto');

// 默认配置（可以从环境变量或配置文件读取）
const DEFAULT_WORKER_URL = process.env.WORKER_URL || 'https://your-worker.workers.dev';
const DEFAULT_SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this';

/**
 * 生成签名 URL
 */
function generateSignedUrl(workerUrl, path, secretKey, expiresIn = 3600) {
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const data = `${path}:${expires}`;

  // 生成 HMAC-SHA256 签名
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(data)
    .digest('hex');

  // 构建完整 URL
  const baseUrl = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;
  return `${baseUrl}/${path}?expires=${expires}&signature=${signature}`;
}

/**
 * 格式化过期时间显示
 */
function formatExpiresIn(seconds) {
  if (seconds < 60) return `${seconds} 秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时`;
  return `${Math.floor(seconds / 86400)} 天`;
}

/**
 * 命令行入口
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
R2 视频链接生成器 - 命令行版本

用法:
  node cli.js <video-path> [expires-in-seconds] [worker-url] [secret-key]

参数:
  video-path          R2 中的视频路径（必填）
  expires-in-seconds  有效期（秒），默认 3600（1小时）
  worker-url          Worker 域名，默认从环境变量 WORKER_URL 读取
  secret-key          密钥，默认从环境变量 SECRET_KEY 读取

示例:
  # 基本使用（使用默认配置）
  node cli.js video/sample.mp4

  # 指定 24 小时有效期
  node cli.js video/sample.mp4 86400

  # 完整指定所有参数
  node cli.js video/sample.mp4 3600 https://my-worker.workers.dev my-secret-key

环境变量:
  WORKER_URL    默认 Worker 域名
  SECRET_KEY    默认密钥

快捷别名:
  1h, 1小时    = 3600
  6h, 6小时    = 21600
  1d, 1天, 24h = 86400
  7d, 7天, 1w  = 604800
  30d, 30天, 1m = 2592000
    `);
    process.exit(0);
  }

  const videoPath = args[0];
  let expiresIn = args[1] || '3600';
  const workerUrl = args[2] || DEFAULT_WORKER_URL;
  const secretKey = args[3] || DEFAULT_SECRET_KEY;

  // 解析快捷别名
  const aliases = {
    '1h': 3600, '1小时': 3600,
    '6h': 21600, '6小时': 21600,
    '1d': 86400, '1天': 86400, '24h': 86400,
    '7d': 604800, '7天': 604800, '1w': 604800,
    '30d': 2592000, '30天': 2592000, '1m': 2592000,
  };

  if (aliases[expiresIn]) {
    expiresIn = aliases[expiresIn];
  } else {
    expiresIn = parseInt(expiresIn);
    if (isNaN(expiresIn) || expiresIn < 1) {
      console.error('❌ 错误: 无效的过期时间');
      process.exit(1);
    }
  }

  // 检查配置
  if (workerUrl === DEFAULT_WORKER_URL && DEFAULT_WORKER_URL.includes('your-worker')) {
    console.warn('⚠️  警告: 使用的是默认 Worker URL，请设置环境变量 WORKER_URL 或作为参数传入');
  }

  if (secretKey === DEFAULT_SECRET_KEY && DEFAULT_SECRET_KEY.includes('change-this')) {
    console.warn('⚠️  警告: 使用的是默认密钥，请设置环境变量 SECRET_KEY 或作为参数传入');
  }

  // 生成签名链接
  const signedUrl = generateSignedUrl(workerUrl, videoPath, secretKey, expiresIn);

  // 输出结果
  console.log('\n✅ 签名链接生成成功!\n');
  console.log(`📹 视频路径: ${videoPath}`);
  console.log(`⏰ 有效期: ${formatExpiresIn(expiresIn)}`);
  console.log(`🔗 签名链接:\n`);
  console.log(signedUrl);
  console.log('');
}

// 如果作为模块导入，导出函数
if (require.main === module) {
  main();
} else {
  module.exports = { generateSignedUrl };
}

