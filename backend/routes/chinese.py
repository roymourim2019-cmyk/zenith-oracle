from fastapi import APIRouter, Depends, HTTPException
from services.chinese_service import ChineseAstrologyService
from services.cache_service import CacheService
from core.redis_client import redis_client
from models.astro_models import BirthInfo, ChineseAstrology

router = APIRouter(tags=["Chinese Astrology"])

chinese_service = ChineseAstrologyService()

async def get_cache_service() -> CacheService:
    return CacheService(redis_client.get_client(), prefix="zenith")


@router.post("/chinese/calculate")
async def calculate_chinese_astrology(
    birth_info: BirthInfo,
    cache: CacheService = Depends(get_cache_service),
):
    cache_key = f"chinese:{birth_info.birth_date}"
    cached = await cache.get(cache_key)
    if cached:
        return ChineseAstrology(**cached)
    try:
        result = chinese_service.calculate_chinese_sign(birth_info.birth_date)
        chinese_data = ChineseAstrology(birth_date=birth_info.birth_date, **result)
        await cache.set(cache_key, chinese_data.model_dump(), ttl=31536000)
        return chinese_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chinese astrology calculation failed: {str(e)}")
