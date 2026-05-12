@echo off
cd /d %~dp0

echo =========================
echo INICIANDO ADB
echo =========================

adb.exe start-server >nul
adb.exe devices

echo.
echo =========================
echo LEYENDO IP GUARDADA
echo =========================

if not exist ip.txt (
  echo ❌ ERROR: Primero presiona "Reconectar ADB"
  pause
  exit
)

set /p IP=<ip.txt

echo IP: %IP%

echo.
echo =========================
echo ACTIVANDO WIFI
echo =========================

adb.exe tcpip 5555
timeout /t 3 >nul

echo.
echo =========================
echo CONECTANDO
echo =========================

adb.exe connect %IP%:5555

echo.
echo =========================
echo INICIANDO SCRCPY
echo =========================
echo.
echo 📱 Resolución fija: 1080x1920
echo 🔒 Ventana bloqueada (sin redimensionar)
echo.
scrcpy.exe -s %IP%:5555 --video-bit-rate=32M --max-fps=60 --video-codec=h265 --stay-awake --window-title="DRAGONEMU 4K" --window-borderless
pause
