@echo off
if exist package.json (
  echo Running lint...
  call npm run lint || echo "Lint failed (non-fatal)"
) else (
  echo No package.json found - skipping quality checks
)
