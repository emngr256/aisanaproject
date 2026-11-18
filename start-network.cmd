@echo off
cd /d "%~dp0"
if not exist node_modules (
  call npm.cmd install
  if errorlevel 1 exit /b 1
)
if not exist .next\BUILD_ID (
  call npm.cmd run build
  if errorlevel 1 exit /b 1
)
echo.
echo StudyFlow - local network mode, port 3001
echo On this computer: http://localhost:3001
echo On another computer: http://YOUR-WIFI-IP:3001
echo Your current network addresses:
powershell.exe -NoProfile -Command "Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway } | Select-Object InterfaceAlias,@{Name='WiFi_IP';Expression={$_.IPv4Address.IPAddress}} | Format-Table -AutoSize"
echo Keep this window open while using the app.
echo.
node node_modules\next\dist\bin\next start --hostname 0.0.0.0 --port 3001
if errorlevel 1 pause
