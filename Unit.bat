@echo off
if exist package.json (
  echo Running unit tests...
  call npm test
) else (
  echo No package.json found - skipping tests
)
