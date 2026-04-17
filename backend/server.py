from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pathlib import Path
import asyncio
import logging

from core.config import settings
from core.redis_client import redis_client
from services.gemini_service import GeminiService
from services.notification_scheduler import daily_notification_scheduler
from routes import all_routers

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

gemini_service = GeminiService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await redis_client.connect()
    await gemini_service.initialize()
    scheduler_task = asyncio.create_task(daily_notification_scheduler())
    logging.info("All services initialized (push scheduler started)")
    yield
    scheduler_task.cancel()
    await redis_client.disconnect()
    logging.info("All services shut down")

app = FastAPI(
    title="Zenith Oracle API",
    description="High-Resonance Mathematical Precision | Enterprise Astrology Engine",
    version="1.0.0",
    lifespan=lifespan
)

api_router = APIRouter(prefix="/api")

for router in all_routers:
    api_router.include_router(router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.cors_origins.split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
