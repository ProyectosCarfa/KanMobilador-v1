@echo off
cd /d %~dp0

echo INICIANDO ADB

adb.exe start-server >nul
adb.exe devices

echo.
echo LEYENDO IP GUARDADA
if not exist ip.txt (
  echo ❌ ERROR: Primero presiona "Reconectar ADB"
  pause
  exit
)

set /p IP=<ip.txt

echo IP: %IP%

echo.
echo ACTIVANDO WIFI

adb.exe tcpip 5555
timeout /t 3 >nul

echo.
echo CONECTANDO
adb.exe connect %IP%:5555

echo.
echo INICIANDO SCRCPY
echo.
echo Resolución fija
echo.
scrcpy.exe -s %IP%:5555 --video-bit-rate=32M --max-fps=60 --video-codec=h265 --stay-awake --window-title="DRAGONEMU 4K" --window-borderless
pause
