@echo off
echo ========================================
echo 正在整理项目文件...
echo ========================================
echo.

REM 1. 备份当前 README
echo [1/5] 备份原 README...
if exist README.md.bak del README.md.bak
copy README.md README.md.bak >nul
echo ✓ 已备份到 README.md.bak

REM 2. 使用新的简洁 README
echo [2/5] 替换为简洁版 README...
del README.md
ren README.md.new README.md
echo ✓ README 已更新

REM 3. 创建 archive 文件夹并移动旧文档
echo [3/5] 归档多余文档...
if not exist archive mkdir archive
if exist DEPLOYMENT.md move DEPLOYMENT.md archive\ >nul
if exist ONE-CLICK-DEPLOY.md move ONE-CLICK-DEPLOY.md archive\ >nul
if exist DEPLOY-SYSTEM.md move DEPLOY-SYSTEM.md archive\ >nul
if exist README-NEW.md move README-NEW.md archive\ >nul
if exist 一键部署已完成.md move 一键部署已完成.md archive\ >nul
if exist 文档整理说明.md move 文档整理说明.md archive\ >nul
if exist wrangler.deploy.toml move wrangler.deploy.toml archive\ >nul
echo ✓ 已移动到 archive 文件夹

REM 4. 删除临时配置文件
echo [4/5] 清理临时文件...
if exist cloudflare.json del cloudflare.json
if exist vercel.json del vercel.json
echo ✓ 临时文件已删除

REM 5. 整理 .github 文件夹（如果不需要 GitHub Actions）
echo [5/5] 检查 GitHub Actions...
if exist .github\workflows (
    echo   保留 .github/workflows/deploy.yml
    echo   如需删除 GitHub Actions，请手动删除 .github 文件夹
) else (
    echo   未找到 GitHub Actions 配置
)

echo.
echo ========================================
echo ✓ 项目整理完成！
echo ========================================
echo.
echo 当前文档结构：
echo   README.md          - 项目主页（已简化）
echo   QUICK-START.md     - 快速开始指南
echo   CHECKLIST.md       - 部署检查清单
echo   API.md             - API 文档
echo   GUIDE.md           - 使用指南
echo   deploy.html        - 交互式部署页面
echo.
echo 旧文档已移至 archive 文件夹
echo 原 README 备份为 README.md.bak
echo.
pause

