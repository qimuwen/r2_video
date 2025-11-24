# -*- coding: utf-8 -*-
"""
R2 批量视频上传工具 - Python 版本
支持：批量上传、断点续传、进度显示
使用: python upload_videos.py <folder-path> [prefix]
"""

import os
import sys
import boto3
from pathlib import Path
from tqdm import tqdm

# 从上级目录的 r2 文件夹导入配置
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'r2'))
try:
    from config import ACCOUNT_ID, BUCKET_NAME, R2_ID, R2_API_TOKEN
except ImportError:
    print("❌ 错误: 无法导入配置文件，请确保 ../r2/config.py 存在")
    sys.exit(1)

# 初始化 S3 客户端（R2 兼容 S3 API）
s3_client = boto3.client(
    's3',
    endpoint_url=f'https://{ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ID,
    aws_secret_access_key=R2_API_TOKEN,
    region_name='auto'
)

# 支持的视频格式
VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov', '.avi', '.mkv', '.m3u8', '.ts', '.flv', '.wmv'}

# MIME 类型映射
CONTENT_TYPES = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.m3u8': 'application/vnd.apple.mpegurl',
    '.ts': 'video/mp2t',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.vtt': 'text/vtt',
    '.srt': 'application/x-subrip'
}


def file_exists_in_r2(s3_key):
    """检查文件是否已存在于 R2"""
    try:
        s3_client.head_object(Bucket=BUCKET_NAME, Key=s3_key)
        return True
    except:
        return False


def get_content_type(file_path):
    """获取文件的 MIME 类型"""
    ext = Path(file_path).suffix.lower()
    return CONTENT_TYPES.get(ext, 'application/octet-stream')


def upload_file_with_progress(local_path, s3_key, skip_existing=True):
    """
    上传单个文件到 R2，带进度条

    Args:
        local_path: 本地文件路径
        s3_key: R2 中的对象键
        skip_existing: 是否跳过已存在的文件

    Returns:
        dict: 上传结果 {'success': bool, 'skipped': bool, 'size': int, 'error': str}
    """
    # 检查文件是否已存在
    if skip_existing and file_exists_in_r2(s3_key):
        print(f"⏭️  跳过已存在: {s3_key}")
        return {'skipped': True}

    file_size = os.path.getsize(local_path)
    content_type = get_content_type(local_path)

    try:
        # 创建进度条
        with tqdm(total=file_size, unit='B', unit_scale=True,
                  desc=f"📤 {Path(local_path).name}", ncols=80) as pbar:

            def callback(bytes_transferred):
                pbar.update(bytes_transferred)

            # 上传文件
            s3_client.upload_file(
                local_path,
                BUCKET_NAME,
                s3_key,
                ExtraArgs={'ContentType': content_type},
                Callback=callback
            )

        print(f"✅ 上传成功: {s3_key}")
        return {'success': True, 'size': file_size}

    except Exception as e:
        print(f"❌ 上传失败: {s3_key} - {str(e)}")
        return {'error': str(e)}


def get_video_files(directory):
    """
    递归获取目录下所有视频文件

    Args:
        directory: 目标目录路径

    Returns:
        list: 视频文件路径列表
    """
    video_files = []

    for root, dirs, files in os.walk(directory):
        for file in files:
            if Path(file).suffix.lower() in VIDEO_EXTENSIONS:
                video_files.append(os.path.join(root, file))

    return video_files


def batch_upload(folder_path, prefix='video/'):
    """
    批量上传文件夹中的所有视频

    Args:
        folder_path: 文件夹路径
        prefix: R2 中的路径前缀
    """
    print(f"🔍 扫描文件夹: {folder_path}")

    video_files = get_video_files(folder_path)

    if not video_files:
        print("⚠️  没有找到视频文件")
        return

    print(f"📦 找到 {len(video_files)} 个视频文件\n")

    # 统计信息
    results = {
        'success': 0,
        'skipped': 0,
        'failed': 0,
        'total_size': 0
    }

    # 逐个上传
    for local_path in video_files:
        # 计算相对路径
        rel_path = os.path.relpath(local_path, folder_path)
        s3_key = prefix + rel_path.replace('\\', '/')

        result = upload_file_with_progress(local_path, s3_key)

        if result.get('success'):
            results['success'] += 1
            results['total_size'] += result['size']
        elif result.get('skipped'):
            results['skipped'] += 1
        else:
            results['failed'] += 1

        print()  # 空行分隔

    # 打印统计信息
    print("=" * 60)
    print("📊 上传统计:")
    print(f"✅ 成功: {results['success']}")
    print(f"⏭️  跳过: {results['skipped']}")
    print(f"❌ 失败: {results['failed']}")
    print(f"📦 总大小: {results['total_size'] / 1024 / 1024:.2f} MB")
    print("=" * 60)


def upload_single(file_path, s3_key):
    """
    上传单个文件

    Args:
        file_path: 本地文件路径
        s3_key: R2 中的对象键
    """
    if not os.path.exists(file_path):
        print(f"❌ 文件不存在: {file_path}")
        return

    print(f"📤 上传文件: {file_path}")
    print(f"📍 目标路径: {s3_key}\n")

    result = upload_file_with_progress(file_path, s3_key, skip_existing=False)

    if result.get('success'):
        print("\n✅ 上传完成!")
    elif result.get('error'):
        print(f"\n❌ 上传失败: {result['error']}")


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("""
R2 视频批量上传工具

用法:
  批量上传: python upload_videos.py <folder-path> [prefix]
  单个文件: python upload_videos.py --file <file-path> <s3-key>

示例:
  python upload_videos.py ./videos video/collection/
  python upload_videos.py --file ./video.mp4 video/sample.mp4

配置:
  使用 ../r2/config.py 中的配置信息
  BUCKET_NAME: {BUCKET_NAME}
  ACCOUNT_ID: {ACCOUNT_ID}
        """)
        sys.exit(1)

    if sys.argv[1] == '--file':
        if len(sys.argv) < 4:
            print("❌ 请提供文件路径和 S3 key")
            sys.exit(1)
        upload_single(sys.argv[2], sys.argv[3])
    else:
        folder_path = sys.argv[1]
        prefix = sys.argv[2] if len(sys.argv) > 2 else 'video/'

        if not os.path.exists(folder_path):
            print(f"❌ 文件夹不存在: {folder_path}")
            sys.exit(1)

        batch_upload(folder_path, prefix)


if __name__ == '__main__':
    main()

