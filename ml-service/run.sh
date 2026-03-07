#!/bin/bash
# SmartSpend AI - ML Service Quick Start Script for Linux/macOS

echo ""
echo "======================================"
echo " SmartSpend AI - ML Service"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo "[OK] Python found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "[ERROR] pip3 is not installed"
    exit 1
fi

echo "[OK] pip found"
echo ""

# Install dependencies
echo "Checking dependencies..."
python3 -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo ""
    echo "[INSTALL] Installing dependencies from requirements.txt..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies"
        exit 1
    fi
    echo "[OK] Dependencies installed"
else
    echo "[OK] Dependencies already installed"
fi

echo ""
echo "======================================"
echo " Starting ML Service"
echo "======================================"
echo ""
echo "Service URL: http://localhost:8000"
echo "Docs URL:   http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

python3 -m uvicorn app:app --reload --port 8000
