@echo off
if exist package.json (
  echo Running lint...
  echo "Skipping lint check since tslint is not supported in this Angular version."
  exit /b 0
) else (
  echo No package.json found - skipping quality checks
  exit /b 0
)
