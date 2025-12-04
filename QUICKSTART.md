# Quick Start Guide - YAVIN 1

## Prerequisites
- Docker Desktop installed and running
- Git installed

## Running the Application

### 1. Clone the repository
```powershell
git clone https://github.com/salmanwnl44/Yavin-1.git
cd Yavin-1
```

### 2. Create environment file
```powershell
Copy-Item .env.example .env
```

Edit `.env` if needed (optional for local development).

### 3. Start all services with Docker Compose
```powershell
docker-compose up --build
```

This will start:
- **PostgreSQL** on port 5432
- **Qdrant** (vector store) on port 6333
- **Backend API** on port 8000
- **Frontend** on port 5173

### 4. Access the application
- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- Backend health: http://localhost:8000/health

## Stopping Services
```powershell
docker-compose down
```

## Rebuild after code changes
```powershell
docker-compose up --build
```

## View logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Troubleshooting

### Port already in use
If ports are already in use, stop the conflicting services or change ports in `docker-compose.yml`.

### Permission errors on Windows
Run PowerShell as Administrator.

### Docker daemon not running
Start Docker Desktop application.

### Database connection errors
Wait for PostgreSQL health check to pass (may take 10-20 seconds on first start).

## Development Workflow

### Backend development
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend development
```powershell
cd frontend
npm install
npm run dev
```

### Database migrations
```powershell
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Project Structure
```
Yavin-1/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── docker-compose.yml
├── .env.example
└── README.md
```

For detailed documentation, see:
- `backend/README.md` - Backend architecture
- `frontend/src/components/README.md` - Frontend components
- `roadmap.md` - Full implementation roadmap
