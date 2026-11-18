@echo off
cd /d "%~dp0"
if not exist node_modules (
  call npm.cmd install
  if errorlevel 1 exit /b 1
)
echo.
echo Aisana: http://localhost:3000
echo Keep this window open while using the app.
echo.
call npm.cmd run dev
