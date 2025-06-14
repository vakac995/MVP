# MVP Migration from solarapp.dev: Kanban Guide

This document provides a step-by-step Kanban-style checklist to migrate your FastAPI MVP away from solarapp.dev and set up a simple, local-first backend.

---

## :white_check_box: 1. Project Preparation

- [ ] Clone your repo locally
- [ ] Ensure Python 3.11+ and PostgreSQL are installed
- [ ] Install dependencies: `pip install -r requirements.txt` (or use the provided pip command)

---

## :white_check_box: 2. Environment Setup

- [ ] Create a `.env` file in your project root:
  ```env
  NEON_CONN_URL=postgresql://user:password@localhost:5432/your_db
  # For file uploads (optional)
  AWS_REGION=us-east-1
  AWS_BUCKET_NAME=your-bucket
  AWS_S3_KEY=your-aws-key
  # Remove or ignore any solarapp.dev-specific keys
  ```
- [ ] Create your local Postgres database (e.g., `createdb your_db`)

---

## :white_check_box: 3. Database Migration

- [ ] Review models in `core/` and generate SQL `CREATE TABLE` statements
- [ ] Manually create tables in your database, or use a migration tool (e.g., Alembic, or a custom script)
- [ ] Test DB connection with your FastAPI app

---

## :white_check_box: 4. Authentication Refactor

- [ ] Remove all OAuth/solarapp.dev auth logic (e.g., in `api/utils.py` and related files)
- [ ] Add FastAPI JWT-based authentication:
  - Use `fastapi.security.OAuth2PasswordBearer` and `OAuth2PasswordRequestForm`
  - Store users in your Postgres DB
  - Issue JWT tokens on login
- [ ] Update protected endpoints to use JWT auth

---

## :white_check_box: 5. File Storage (Optional)

- [ ] For MVP, store files locally (e.g., in a `media/` folder)
- [ ] If S3 compatibility is needed, use MinIO (local S3-compatible server) or AWS S3
- [ ] Update upload/download logic to use your chosen storage

---

## :white_check_box: 6. Remove/Replace solarapp.dev Integrations

- [ ] Search for all `solarapp.dev`, `ROUTER_BASE_URL`, and related keys in code
- [ ] Remove or replace with your own endpoints/services
- [ ] Refactor the `solar/` module to remove tight coupling to solarapp.dev

---

## :white_check_box: 7. Testing & Launch

- [ ] Start your FastAPI app: `python main.py`
- [ ] Test all endpoints (auth, CRUD, uploads)
- [ ] Update documentation as needed

---

## :white_check_box: 8. (Optional) Next Steps

- [ ] Add Alembic for DB migrations
- [ ] Add Docker for local dev
- [ ] Add CI/CD for automated testing/deployment

---

## Resources

- [FastAPI Security Docs](https://fastapi.tiangolo.com/tutorial/security/)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
- [MinIO Quickstart](https://min.io/docs/minio/linux/quickstart.html)

---

**Tip:** Tackle one card at a time. Check off as you go for a smooth migration!
