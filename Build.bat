@echo off
echo ======== BUILD START ========

REM Check if package.json exists
if not exist package.json (
  echo No package.json found - skipping build
  exit /b 0
)

REM Install dependencies if node_modules missing
if not exist node_modules (
  echo Installing dependencies...
  call npm install
) else (
  echo node_modules already exists, skipping npm install
)

REM Build Angular project
echo Running Angular build...
call npx ng build --configuration production

if %errorlevel% neq 0 (
  echo Angular build failed!
  exit /b %errorlevel%
)

echo ======== BUILD SUCCESS ========
exit /b 0
