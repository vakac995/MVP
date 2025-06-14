#!/bin/bash
# Run all zaJedno MVP services locally (frontend, backend, logging-server)
# Usage: bash run_all.sh

set -e

# Start backend (services)
echo "[services] Installing Python dependencies..."
cd services
python -m pip install --upgrade pip
pip install -r requirements.txt
if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
  echo "[services] Copied .env.example to .env. Please edit .env if needed."
fi
echo "[services] Starting backend (FastAPI on :8000)..."
python main.py &
cd ..

# Start logging-server
echo "[logging-server] Installing Python dependencies..."
cd logging-server
python -m pip install --upgrade pip
pip install -r requirements.txt
echo "[logging-server] Starting logging server (on :9000)..."
python logging-server.py &
cd ..

# Start frontend (app)
echo "[app] Installing Node dependencies..."
cd app
pnpm install
echo "[app] Starting Vite dev server (on :5173)..."
pnpm dev &
cd ..

echo "All services started!"
echo "- Frontend:     http://localhost:5173"
echo "- Backend API:  http://localhost:8000"
echo "- Log server:   ws://localhost:9000"

wait
