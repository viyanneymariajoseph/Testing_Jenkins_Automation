@echo off
echo ======== DEPLOY START ========
set SRC_DIR=%~dp0dist
set DEST_DIR=C:\inetpub\wwwroot\MyFrontend

echo Deploying from "%SRC_DIR%" to "%DEST_DIR%"
if not exist "%DEST_DIR%" (
  echo Target directory does not exist. Creating it...
  mkdir "%DEST_DIR%"
)

echo Copying files...
robocopy "%SRC_DIR%" "%DEST_DIR%" /E /MIR /XD node_modules .git .github

if %errorlevel% LEQ 1 (
  echo ✅ Deployment successful!
  exit /b 0
) else (
  echo ❌ Deployment failed with error code %errorlevel%!
  exit /b 3
)
