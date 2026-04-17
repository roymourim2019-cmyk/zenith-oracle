from fastapi import APIRouter, Depends, HTTPException
from services.western_service import WesternAstrologyService
from services.cache_service import CacheService
from core.redis_client import redis_client
from models.astro_models import BirthInfo

router = APIRouter(tags=["Western Astrology"])

western_service = WesternAstrologyService()

async def get_cache_service() -> CacheService:
    return CacheService(redis_client.get_client(), prefix="zenith")


@router.post("/western/birth-chart")
async def calculate_western_chart(
    birth_info: BirthInfo,
    cache: CacheService = Depends(get_cache_service),
):
    cache_key = f"western:{birth_info.birth_date}:{birth_info.birth_time}:{birth_info.latitude:.2f}:{birth_info.longitude:.2f}"
    cached = await cache.get(cache_key)
    if cached:
        return cached
    try:
        chart_data = western_service.calculate_birth_chart(
            birth_info.birth_date, birth_info.birth_time,
            birth_info.latitude, birth_info.longitude, birth_info.timezone_offset
        )
        await cache.set(cache_key, chart_data, ttl=86400)
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Western chart calculation failed: {str(e)}")
