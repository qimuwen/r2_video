# -*- coding: utf-8 -*-
"""
R2 视频签名链接生成器 - Python 版本
使用: python generate_link.py <video-path> [expires-in-seconds]
"""

import sys
import hmac
import hashlib
import time

# 配置（请修改为你的实际配置）
WORKER_URL = "https://your-worker.workers.dev"
SECRET_KEY = "your-secret-key-change-this"


def generate_signed_url(video_path, expires_in=3600, worker_url=WORKER_URL, secret_key=SECRET_KEY):
    """
    生成签名 URL

    Args:
        video_path: R2 中的视频路径
        expires_in: 有效期（秒）
        worker_url: Worker 域名
        secret_key: 密钥

    Returns:
        str: 签名后的 URL
    """
    # 计算过期时间戳
    expires = int(time.time()) + expires_in

    # 构建签名数据
    data = f"{video_path}:{expires}"

    # 生成 HMAC-SHA256 签名
    signature = hmac.new(
        secret_key.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest()

    # 构建完整 URL
    base_url = worker_url.rstrip('/')
    signed_url = f"{base_url}/{video_path}?expires={expires}&signature={signature}"

    return signed_url


def format_time(seconds):
    """格式化时间显示"""
    if seconds < 60:
        return f"{seconds} 秒"
    elif seconds < 3600:
        return f"{seconds // 60} 分钟"
    elif seconds < 86400:
        return f"{seconds // 3600} 小时"
    else:
        return f"{seconds // 86400} 天"


def main():
    """命令行入口"""
    if len(sys.argv) < 2 or sys.argv[1] in ['--help', '-h']:
        print("""
R2 视频签名链接生成器

用法:
  python generate_link.py <video-path> [expires-in-seconds]

参数:
  video-path          R2 中的视频路径（必填）
  expires-in-seconds  有效期（秒），默认 3600（1小时）

快捷别名:
  1h, 1小时  = 3600
  6h, 6小时  = 21600
  1d, 1天    = 86400
  7d, 7天    = 604800
  30d, 30天  = 2592000

示例:
  python generate_link.py video/sample.mp4
  python generate_link.py video/sample.mp4 86400
  python generate_link.py video/sample.mp4 1d

配置:
  在脚本中修改 WORKER_URL 和 SECRET_KEY
  当前 Worker URL: {WORKER_URL}
        """)
        sys.exit(0)

    video_path = sys.argv[1]

    # 解析过期时间
    expires_in = 3600  # 默认 1 小时
    if len(sys.argv) > 2:
        time_str = sys.argv[2]

        # 快捷别名
        aliases = {
            '1h': 3600, '1小时': 3600,
            '6h': 21600, '6小时': 21600,
            '1d': 86400, '1天': 86400,
            '7d': 604800, '7天': 604800,
            '30d': 2592000, '30天': 2592000,
        }

        if time_str in aliases:
            expires_in = aliases[time_str]
        else:
            try:
                expires_in = int(time_str)
                if expires_in < 1:
                    print("❌ 错误: 过期时间必须大于 0")
                    sys.exit(1)
            except ValueError:
                print(f"❌ 错误: 无效的过期时间 '{time_str}'")
                sys.exit(1)

    # 检查配置
    if 'your-worker' in WORKER_URL:
        print("⚠️  警告: 请在脚本中修改 WORKER_URL 配置")

    if 'change-this' in SECRET_KEY:
        print("⚠️  警告: 请在脚本中修改 SECRET_KEY 配置")

    # 生成签名链接
    signed_url = generate_signed_url(video_path, expires_in)

    # 输出结果
    print("\n✅ 签名链接生成成功!\n")
    print(f"📹 视频路径: {video_path}")
    print(f"⏰ 有效期: {format_time(expires_in)}")
    print(f"🔗 签名链接:\n")
    print(signed_url)
    print()


if __name__ == '__main__':
    main()

