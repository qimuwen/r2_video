@echo off
echo ================================================
echo    Cloudflare R2 视频服务器 - 快速启动脚本
echo ================================================
echo.

:menu
echo 请选择操作:
echo.
echo 1. 安装 Python 依赖
echo 2. 安装 Worker 依赖
echo 3. 部署 Worker
echo 4. 测试系统
echo 5. 上传视频（批量）
echo 6. 生成签名链接
echo 7. 打开网页链接生成器
echo 8. 打开前端播放器
echo 9. 退出
echo.
set /p choice=请输入选项 (1-9):

if "%choice%"=="1" goto install_python
if "%choice%"=="2" goto install_worker
if "%choice%"=="3" goto deploy_worker
if "%choice%"=="4" goto test_system
if "%choice%"=="5" goto upload_videos
if "%choice%"=="6" goto generate_link
if "%choice%"=="7" goto open_web_generator
if "%choice%"=="8" goto open_frontend
if "%choice%"=="9" goto end

echo 无效选项，请重新选择
goto menu

:install_python
echo.
echo 正在安装 Python 依赖...
pip install -r requirements.txt
echo.
echo 安装完成！
pause
goto menu

:install_worker
echo.
echo 正在安装 Worker 依赖...
cd worker
call npm install
cd ..
echo.
echo 安装完成！
pause
goto menu

:deploy_worker
echo.
echo 正在部署 Worker...
cd worker
call npx wrangler login
call npx wrangler deploy
cd ..
echo.
echo 部署完成！
pause
goto menu

:test_system
echo.
echo 正在运行系统测试...
python test.py
pause
goto menu

:upload_videos
echo.
set /p folder=请输入视频文件夹路径:
set /p prefix=请输入 R2 路径前缀 (默认: video/):
if "%prefix%"=="" set prefix=video/
echo.
python upload_videos.py "%folder%" %prefix%
pause
goto menu

:generate_link
echo.
set /p video_path=请输入视频路径:
set /p expires=请输入有效期 (默认: 1d):
if "%expires%"=="" set expires=1d
echo.
python generate_link.py %video_path% %expires%
pause
goto menu

:open_web_generator
echo.
echo 正在打开网页链接生成器...
start link-generator\web\index.html
goto menu

:open_frontend
echo.
echo 正在打开前端播放器...
start frontend\index.html
goto menu

:end
echo.
echo 感谢使用！
exit

