@echo off
echo ======== DEPLOY START ========

set SRC=dist
set DEST=C:\inetpub\wwwroot\MyFrontend

echo Deploying from "%SRC%" to "%DEST%"

if not exist "%SRC%" (
  echo ❌ Build output not found! Nothing to deploy.
  exit /b 1
)

if not exist "%DEST%" mkdir "%DEST%"

robocopy "%SRC%" "%DEST%" /MIR /XD node_modules .git .github >nul

if %errorlevel% GEQ 8 (
  echo ❌ Deployment failed (Robocopy error %errorlevel%)
  exit /b %errorlevel%
)

echo ======== DEPLOY SUCCESS ========
exit /b 0
