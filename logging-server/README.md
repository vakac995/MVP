# Logging Server

A simple log streaming server built with FastAPI and WebSockets. This server streams log files to connected clients in real time, allowing for live log monitoring and reporting.

## Features
- **Real-time log streaming**: Clients can subscribe to log files and receive updates as new lines are appended.
- **WebSocket API**: Subscribe/unsubscribe to log files, list available logs, and receive log updates over WebSocket.
- **REST API**: Basic endpoints for health check and reporting.
- **CORS enabled**: Allows cross-origin requests for easy integration with web clients.

## Requirements
- Python 3.10+
- FastAPI
- Uvicorn
- Requests
- Websockets

Install dependencies:
```bash
pip install -r requirements.txt
```
Or, using the dependencies in `pyproject.toml`:
```bash
pip install fastapi uvicorn requests websockets
```

## Usage

### Start the Server
```bash
python logging-server.py
```
The server will start on port 9000 by default.

### Log Directory
- The server streams logs from the `../logs` directory (relative to the script).
- Only files ending with `.log` are listed and available for streaming.

## API Reference

### REST Endpoints
- `GET /` — Health check. Returns a simple message.
- `POST /` — Accepts a JSON report and broadcasts it to all clients subscribed to the `ERRORS` channel.

### WebSocket Endpoint
- `ws://<host>:9000/` — Main WebSocket endpoint.

#### WebSocket Message Types
- **Subscribe to a log file**
  ```json
  { "type": "subscribe", "source": "example.log", "lines": 100 }
  ```
  - `source`: Log file name (e.g., `app.log`)
  - `lines`: (Optional) Number of initial lines to send (default: 100)

- **Unsubscribe from a log file**
  ```json
  { "type": "unsubscribe", "source": "example.log" }
  ```

- **List available log files**
  ```json
  { "type": "list" }
  ```
  - Response:
    ```json
    { "type": "list", "files": ["app.log", "server.log"] }
    ```

- **Log update messages**
  - When subscribed, clients receive messages:
    ```json
    { "source": "app.log", "content": "<log line>" }
    ```

- **Error messages**
  - On invalid requests:
    ```json
    { "type": "error", "message": "<error description>" }
    ```

## Example WebSocket Client (Python)
```python
import asyncio
import websockets
import json

async def main():
    uri = "ws://localhost:9000/"
    async with websockets.connect(uri) as ws:
        await ws.send(json.dumps({"type": "subscribe", "source": "app.log", "lines": 50}))
        while True:
            msg = await ws.recv()
            print(msg)

asyncio.run(main())
```

## Configuration
- **Log directory**: Change `LOG_DIR` in `logging-server.py` to set the log files location.
- **Port**: Change `PORT` in `logging-server.py` to set the server port.

## License
MIT
