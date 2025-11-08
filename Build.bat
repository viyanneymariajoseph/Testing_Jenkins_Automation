@echo off
echo ======== BUILD START ========

REM --- Change directory to workspace root (for Jenkins) ---
cd /d "%~dp0"

REM --- Check for package.json ---
if not exist package.json (
  echo No package.json found - skipping build
  exit /b 0
)

REM --- Install dependencies if node_modules missing ---
if not exist node_modules (
  echo Installing dependencies...
  call npm install --legacy-peer-deps
) else (
  echo node_modules already exists, skipping npm install
)

REM --- Run Angular production build ---
echo Running Angular build...
call npx ng build --configuration production

if %errorlevel% neq 0 (
  echo ❌ Angular build failed!
  exit /b %errorlevel%
)

echo ======== BUILD SUCCESS ========
exit /b 0
