@echo off
echo ======== DEPLOY START ========

set SRC=%~dp0dist
set DEST=C:\inetpub\wwwroot\MyFrontend

echo Deploying from "%SRC%" to "%DEST%"
echo Copying files...

robocopy "%SRC%" "%DEST%" *.* /S /E /DCOPY:DA /COPY:DAT /PURGE /MIR /R:1000000 /W:30 /XD node_modules .git .github

set RC=%ERRORLEVEL%

if %RC% LEQ 3 (
  echo ✅ Deployment completed successfully!
  exit /b 0
) else (
  echo ❌ Deployment failed with error code %RC%!
  exit /b %RC%
)
