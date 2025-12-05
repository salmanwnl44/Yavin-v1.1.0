# YAVIN v1.1.0 - AI Editor 

This repository contains a scaffold for the YAVIN 1 AI-powered code editor project.

This initial scaffold was created to match the Week 1 roadmap: project structure, basic frontend and backend skeletons, and a docker-compose file to run services locally for development.

What was added in this scaffold:
- `docker-compose.yml` for quick local orchestration (postgres, backend, frontend, qdrant placeholder)
- `backend/` minimal FastAPI app and `requirements.txt`
- `frontend/` minimal package.json (Vite + React with JSX)
- `.env.example` with placeholders for local dev
- `.gitignore` ignoring typical artifacts

Next steps you can ask me to do:
- Expand Week 1 Day 1-2 tasks into GitHub issues or a project board.
- Initialize the frontend with Vite + React + JSX tooling.
- Install backend dependencies and run the FastAPI app inside Docker.
- Add basic CI (GitHub Actions) pipeline for lint/test.

How to run the basic scaffold (requires Docker):

1. Copy `.env.example` -> `.env` and fill in values.
2. From the repo root run:

```powershell
# Start services
docker-compose up --build
```

3. The backend FastAPI app will be available at http://localhost:8000/ (if Docker started it)

Notes:
- This is an initial scaffold only. It doesn't install npm/python packages automatically on the host. The Docker services will perform `pip install` / `npm install` at container start as defined in `docker-compose.yml`.
- No secrets or API keys are included. Use `.env` locally and keep sensitive values out of source control.
