#!/usr/bin/env bash
# DnD-Soundscape 1-Click Startup for macOS and Linux

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo "  DnD-Soundscape - Adventure Audio Management System (v1.0.0)"
echo "  Published by Krarilotus"
echo "======================================================================"
echo ""

# Determine python command
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    if command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        echo "[!] Python 3 is not installed. Please install Python 3."
        exit 1
    fi
fi

# Open browser in background
(sleep 1 && (xdg-open http://localhost:8777 || open http://localhost:8777 || python3 -m webbrowser http://localhost:8777)) 2>/dev/null &

# Run server
$PYTHON_CMD tools/serve.py 8777
