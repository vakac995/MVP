# Logging Server: Maintenance & Migration Kanban

This checklist helps you maintain, migrate, or extend the logging-server as your infrastructure or requirements evolve.

---

## 🟦 To Do

### 1. **Configuration Changes**
- [ ] Update log directory (`LOG_DIR` in `logging-server.py`) if log file location changes
- [ ] Change server port (`PORT` in `logging-server.py`) as needed
- [ ] Update dependencies in `pyproject.toml` if new features or security updates are required

### 2. **Feature Extensions**
- [ ] Add authentication (e.g., API keys, JWT) if public access is not desired
- [ ] Add support for new log formats or sources if needed
- [ ] Integrate with external monitoring or alerting systems if required

### 3. **Deployment & Scaling**
- [ ] Containerize the service (Docker) for easier deployment
- [ ] Set up process management (e.g., systemd, supervisor) for production
- [ ] Configure logging-server to run behind a reverse proxy (e.g., Nginx) if needed

### 4. **Testing & QA**
- [ ] Test WebSocket and REST endpoints after any change
- [ ] Test with multiple clients and large log files
- [ ] Monitor resource usage and optimize as needed

### 5. **Documentation & Cleanup**
- [ ] Update README with any new features or configuration changes
- [ ] Remove unused code or dependencies

---

## ✅ Done
- Initial setup and configuration
- Real-time log streaming via WebSockets
- REST API for health check and reporting
- CORS enabled for web integration

---

This kanban is intentionally minimal, as the logging-server is not tied to solarapp.dev and is already vendor-neutral.
