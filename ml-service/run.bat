@echo off
REM SmartSpend AI - ML Service Quick Start Script for Windows

echo.
echo ======================================
echo  SmartSpend AI - ML Service
echo ======================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip is not installed
    pause
    exit /b 1
)

echo [OK] pip found
echo.

REM Check if requirements are installed
echo Checking dependencies...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo.
    echo [INSTALL] Installing dependencies from requirements.txt...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

echo.
echo ======================================
echo  Starting ML Service
echo ======================================
echo.
echo Service URL: http://localhost:8000
echo Docs URL:   http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the service
echo.

python -m uvicorn app:app --reload --port 8000

pause
