from fastapi import APIRouter, Depends, HTTPException
from services.numerology_service import NumerologyService
from services.cache_service import CacheService
from core.redis_client import redis_client
from models.astro_models import BirthInfo, NumerologyResult

router = APIRouter(tags=["Numerology"])

numerology_service = NumerologyService()

async def get_cache_service() -> CacheService:
    return CacheService(redis_client.get_client(), prefix="zenith")


@router.post("/numerology/calculate", response_model=NumerologyResult)
async def calculate_numerology(
    birth_info: BirthInfo,
    cache: CacheService = Depends(get_cache_service),
):
    cache_key = f"numerology:{birth_info.name}:{birth_info.birth_date}"
    cached = await cache.get(cache_key)
    if cached:
        return NumerologyResult(**cached)
    try:
        result = numerology_service.calculate_numerology(birth_info.name, birth_info.birth_date)
        numerology_data = NumerologyResult(**result)
        await cache.set(cache_key, numerology_data.model_dump(), ttl=31536000)
        return numerology_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Numerology calculation failed: {str(e)}")
