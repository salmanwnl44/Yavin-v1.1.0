# YAVIN 1 Backend Structure

## Project Organization

### `/app/core/`
Core application configuration and infrastructure:
- `config.py` - Application settings using Pydantic
- `database.py` - SQLAlchemy async database setup
- `logging.py` - Loguru logger configuration

### `/app/api/`
API routes and endpoints:
- `__init__.py` - Main API router registration

### `/app/models/`
SQLAlchemy ORM models:
- Define database tables and relationships

### `/app/schemas/`
Pydantic schemas:
- Request/response validation models

### `/app/services/`
Business logic layer:
- Service classes for data processing

### `/alembic/`
Database migrations:
- `env.py` - Alembic environment configuration
- `versions/` - Migration scripts

## Development Setup

### Run migrations
```bash
alembic upgrade head
```

### Create new migration
```bash
alembic revision --autogenerate -m "description"
```

### Run development server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Architecture Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Dependency Injection**: Loose coupling via FastAPI dependencies
- **Async/Await**: Non-blocking I/O operations
