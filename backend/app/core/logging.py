import sys
from loguru import logger
from app.core.config import get_settings

settings = get_settings()

# Remove default logger
logger.remove()

# Add custom logger with formatting
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="DEBUG" if settings.DEBUG else "INFO",
)

# Add file logger
logger.add(
    "logs/yavin1.log",
    rotation="10 MB",
    retention="10 days",
    compression="zip",
    level="INFO",
)


def get_logger():
    return logger
