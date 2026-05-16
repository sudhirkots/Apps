@echo off
setlocal
set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not exist "%PY%" (
  echo Python was not found at %PY%
  echo Reopen PowerShell and try: python server.py
  pause
  exit /b 1
)
cd /d "%~dp0"
"%PY%" server.py
