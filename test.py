# -*- coding: utf-8 -*-
"""
R2 视频服务测试脚本
测试上传、链接生成、Worker 连接等功能
"""

import os
import sys
import time

# 测试配置
TEST_VIDEO_PATH = "video/test/sample.mp4"
TEST_WORKER_URL = "https://your-worker.workers.dev"  # 修改为你的 Worker URL
TEST_SECRET_KEY = "your-secret-key-change-this"  # 修改为你的密钥


def test_r2_config():
    """测试 R2 配置是否正确"""
    print("🧪 测试 R2 配置...")

    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'r2'))
        from config import ACCOUNT_ID, BUCKET_NAME, R2_ID, R2_API_TOKEN

        print(f"✅ Account ID: {ACCOUNT_ID}")
        print(f"✅ Bucket Name: {BUCKET_NAME}")
        print(f"✅ R2 Access Key ID: {R2_ID[:10]}...")
        print("✅ R2 配置读取成功!\n")
        return True
    except Exception as e:
        print(f"❌ R2 配置错误: {e}\n")
        return False


def test_boto3():
    """测试 boto3 库是否已安装"""
    print("🧪 测试 boto3 库...")

    try:
        import boto3
        from tqdm import tqdm
        print(f"✅ boto3 版本: {boto3.__version__}")
        print("✅ tqdm 已安装")
        print("✅ 依赖库检查通过!\n")
        return True
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("请运行: pip install -r requirements.txt\n")
        return False


def test_upload_script():
    """测试上传脚本是否可用"""
    print("🧪 测试上传脚本...")

    try:
        from upload_videos import generate_signed_url, get_content_type

        # 测试内容类型识别
        assert get_content_type("test.mp4") == "video/mp4"
        assert get_content_type("test.webm") == "video/webm"

        print("✅ 上传脚本导入成功")
        print("✅ 内容类型识别正常\n")
        return True
    except Exception as e:
        print(f"❌ 上传脚本错误: {e}\n")
        return False


def test_link_generator():
    """测试链接生成器"""
    print("🧪 测试链接生成器...")

    try:
        from generate_link import generate_signed_url

        # 生成测试链接
        test_url = generate_signed_url(
            TEST_VIDEO_PATH,
            expires_in=3600,
            worker_url=TEST_WORKER_URL,
            secret_key=TEST_SECRET_KEY
        )

        print(f"✅ 生成测试链接: {test_url[:50]}...")

        # 验证链接格式
        assert "expires=" in test_url
        assert "signature=" in test_url

        print("✅ 链接格式验证通过\n")
        return True
    except Exception as e:
        print(f"❌ 链接生成器错误: {e}\n")
        return False


def test_r2_connection():
    """测试 R2 连接"""
    print("🧪 测试 R2 连接...")

    try:
        import boto3
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'r2'))
        from config import ACCOUNT_ID, BUCKET_NAME, R2_ID, R2_API_TOKEN

        # 创建 S3 客户端
        s3_client = boto3.client(
            's3',
            endpoint_url=f'https://{ACCOUNT_ID}.r2.cloudflarestorage.com',
            aws_access_key_id=R2_ID,
            aws_secret_access_key=R2_API_TOKEN,
            region_name='auto'
        )

        # 尝试列出存储桶
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, MaxKeys=5)

        if 'Contents' in response:
            print(f"✅ 成功连接到 R2 存储桶")
            print(f"✅ 存储桶中有 {response.get('KeyCount', 0)} 个对象")
        else:
            print(f"✅ 连接成功，但存储桶为空")

        print("✅ R2 连接测试通过!\n")
        return True
    except Exception as e:
        print(f"❌ R2 连接失败: {e}\n")
        return False


def test_file_structure():
    """测试文件结构是否完整"""
    print("🧪 测试文件结构...")

    base_dir = os.path.dirname(__file__)
    required_files = [
        'README.md',
        'GUIDE.md',
        'requirements.txt',
        'upload_videos.py',
        'generate_link.py',
        'worker/src/index.js',
        'worker/wrangler.toml',
        'worker/package.json',
        'upload-tool/upload.js',
        'upload-tool/config.json',
        'link-generator/web/index.html',
        'link-generator/cli.js',
        'frontend/index.html',
        'frontend/player.html',
        'frontend/style.css',
    ]

    missing_files = []
    for file in required_files:
        file_path = os.path.join(base_dir, file)
        if os.path.exists(file_path):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} (缺失)")
            missing_files.append(file)

    if missing_files:
        print(f"\n⚠️  缺失 {len(missing_files)} 个文件")
        return False
    else:
        print("\n✅ 所有必需文件都存在!\n")
        return True


def run_all_tests():
    """运行所有测试"""
    print("=" * 60)
    print("🚀 R2 视频服务完整性测试")
    print("=" * 60)
    print()

    results = {
        "文件结构": test_file_structure(),
        "依赖库": test_boto3(),
        "R2 配置": test_r2_config(),
        "上传脚本": test_upload_script(),
        "链接生成器": test_link_generator(),
        "R2 连接": test_r2_connection(),
    }

    print("=" * 60)
    print("📊 测试结果汇总")
    print("=" * 60)

    for test_name, result in results.items():
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{test_name}: {status}")

    passed = sum(results.values())
    total = len(results)

    print()
    print(f"通过率: {passed}/{total} ({passed/total*100:.0f}%)")
    print("=" * 60)

    if passed == total:
        print("\n🎉 所有测试通过! 系统已就绪!")
        print("\n下一步:")
        print("1. 部署 Worker: cd worker && npx wrangler deploy")
        print("2. 上传视频: python upload_videos.py <folder>")
        print("3. 生成链接: python generate_link.py <video-path>")
    else:
        print("\n⚠️  部分测试失败，请检查上述错误")

    print()


if __name__ == '__main__':
    run_all_tests()

