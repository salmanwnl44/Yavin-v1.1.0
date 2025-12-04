from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down application")


@app.get("/")
async def root():
    return JSONResponse({"message": "YAVIN 1 backend running", "version": settings.APP_VERSION})


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "app": settings.APP_NAME})
