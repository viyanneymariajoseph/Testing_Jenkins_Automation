@echo off
REM Deploy built Angular app to IIS
if exist dist (
  set SRC=dist
) else if exist build (
  set SRC=build
) else (
  echo No build output found!
  exit /b 1
)

set DEST=C:\inetpub\wwwroot\MyFrontend

echo Deploying from %SRC% to %DEST%

if not exist "%DEST%" mkdir "%DEST%"
robocopy "%SRC%" "%DEST%" /MIR /XD node_modules .git .github

if %errorlevel% GEQ 8 (
  echo Robocopy reported a failure (errorlevel %errorlevel%)
  exit /b %errorlevel%
)

echo Deploy complete.
exit /b 0
