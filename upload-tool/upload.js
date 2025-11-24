/**
 * R2 批量上传工具
 * 支持：批量上传、断点续传、进度显示、并发控制
 * 使用: node upload.js <folder-path> [prefix]
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { createReadStream } = require('fs');
const ProgressBar = require('progress');

// 从配置文件读取（需要创建 config.json）
const config = require('./config.json');

// 初始化 S3 客户端（R2 兼容 S3 API）
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.R2_ACCESS_KEY_ID,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = config.BUCKET_NAME;
const MAX_CONCURRENT = 3; // 最大并发上传数
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 分块

/**
 * 检查文件是否已存在
 */
async function fileExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * 上传单个文件
 */
async function uploadFile(localPath, s3Key, skipExisting = true) {
  // 检查是否已存在
  if (skipExisting && await fileExists(s3Key)) {
    console.log(`⏭️  跳过已存在: ${s3Key}`);
    return { skipped: true };
  }

  const fileSize = fs.statSync(localPath).size;
  const fileStream = createReadStream(localPath);

  const bar = new ProgressBar(`📤 ${path.basename(localPath)} [:bar] :percent :etas`, {
    complete: '█',
    incomplete: '░',
    width: 30,
    total: fileSize
  });

  // 监听文件流进度
  let uploaded = 0;
  fileStream.on('data', (chunk) => {
    uploaded += chunk.length;
    bar.tick(chunk.length);
  });

  try {
    // 获取文件 MIME 类型
    const contentType = getContentType(localPath);

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: contentType,
    }));

    console.log(`✅ 上传成功: ${s3Key}`);
    return { success: true, size: fileSize };

  } catch (error) {
    console.error(`❌ 上传失败: ${s3Key}`, error.message);
    return { error: error.message };
  }
}

/**
 * 获取文件 MIME 类型
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.m3u8': 'application/vnd.apple.mpegurl',
    '.ts': 'video/mp2t',
    '.vtt': 'text/vtt',
    '.srt': 'application/x-subrip',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * 递归获取目录下所有视频文件
 */
function getVideoFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getVideoFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m3u8', '.ts'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * 批量上传（并发控制）
 */
async function batchUpload(folderPath, prefix = 'video/') {
  console.log(`🔍 扫描文件夹: ${folderPath}`);

  const videoFiles = getVideoFiles(folderPath);
  console.log(`📦 找到 ${videoFiles.length} 个视频文件\n`);

  if (videoFiles.length === 0) {
    console.log('⚠️  没有找到视频文件');
    return;
  }

  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
    totalSize: 0
  };

  // 并发控制
  const queue = [...videoFiles];
  const workers = [];

  for (let i = 0; i < MAX_CONCURRENT; i++) {
    workers.push(async () => {
      while (queue.length > 0) {
        const localPath = queue.shift();
        if (!localPath) break;

        // 生成 S3 key
        const relativePath = path.relative(folderPath, localPath);
        const s3Key = prefix + relativePath.replace(/\\/g, '/');

        const result = await uploadFile(localPath, s3Key);

        if (result.success) {
          results.success++;
          results.totalSize += result.size;
        } else if (result.skipped) {
          results.skipped++;
        } else {
          results.failed++;
        }
      }
    });
  }

  await Promise.all(workers.map(w => w()));

  // 打印统计信息
  console.log('\n📊 上传统计:');
  console.log(`✅ 成功: ${results.success}`);
  console.log(`⏭️  跳过: ${results.skipped}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(`📦 总大小: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB`);
}

/**
 * 上传单个文件（命令行调用）
 */
async function uploadSingle(filePath, s3Key) {
  if (!fs.existsSync(filePath)) {
    console.error('❌ 文件不存在:', filePath);
    process.exit(1);
  }

  console.log(`📤 上传文件: ${filePath}`);
  console.log(`📍 目标路径: ${s3Key}\n`);

  const result = await uploadFile(filePath, s3Key, false);

  if (result.success) {
    console.log('\n✅ 上传完成!');
  } else if (result.error) {
    console.error('\n❌ 上传失败:', result.error);
    process.exit(1);
  }
}

// 命令行入口
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('用法:');
    console.log('  批量上传: node upload.js <folder-path> [prefix]');
    console.log('  单个文件: node upload.js --file <file-path> <s3-key>');
    console.log('\n示例:');
    console.log('  node upload.js ./videos video/collection/');
    console.log('  node upload.js --file ./video.mp4 video/sample.mp4');
    process.exit(1);
  }

  if (args[0] === '--file') {
    if (args.length < 3) {
      console.error('❌ 请提供文件路径和 S3 key');
      process.exit(1);
    }
    uploadSingle(args[1], args[2]);
  } else {
    const folderPath = args[0];
    const prefix = args[1] || 'video/';

    if (!fs.existsSync(folderPath)) {
      console.error('❌ 文件夹不存在:', folderPath);
      process.exit(1);
    }

    batchUpload(folderPath, prefix);
  }
}

module.exports = { uploadFile, batchUpload, uploadSingle };

