from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from services.vedic_service import VedicAstrologyService
from services.cache_service import CacheService
from core.redis_client import redis_client
from models.astro_models import BirthInfo, VedicChartResponse, PlanetPosition, DashaPeriod
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
import os

router = APIRouter(tags=["Vedic Astrology"])

vedic_service = VedicAstrologyService()
mongo_client = AsyncIOMotorClient(settings.mongo_url)
db = mongo_client[settings.db_name]

async def get_cache_service() -> CacheService:
    return CacheService(redis_client.get_client(), prefix="zenith")


@router.post("/vedic/birth-chart", response_model=VedicChartResponse)
async def calculate_vedic_chart(
    birth_info: BirthInfo,
    cache: CacheService = Depends(get_cache_service),
):
    cache_key = f"vedic:{birth_info.birth_date}:{birth_info.birth_time}:{birth_info.latitude:.2f}:{birth_info.longitude:.2f}"
    cached = await cache.get(cache_key)
    if cached:
        return VedicChartResponse(**cached)
    try:
        chart_data = vedic_service.calculate_birth_chart(
            birth_info.birth_date, birth_info.birth_time,
            birth_info.latitude, birth_info.longitude, birth_info.timezone_offset
        )
        response = VedicChartResponse(
            person_name=birth_info.name,
            birth_datetime=f"{birth_info.birth_date} {birth_info.birth_time}",
            location={"latitude": birth_info.latitude, "longitude": birth_info.longitude},
            julian_day=chart_data['julian_day'],
            chart_type="Vedic Sidereal",
            planets=[PlanetPosition(**p) for p in chart_data['planets']],
            ascendant=chart_data['ascendant'],
            ascendant_sign=chart_data['ascendant_sign'],
            midheaven=chart_data['midheaven'],
            ayanamsha=chart_data['ayanamsha'],
            lunar_mansion=chart_data['lunar_mansion'],
            dasha_lord=chart_data['dasha_lord'],
            dasha_balance_years=chart_data['dasha_balance_years'],
            houses=chart_data['houses'],
            power_score=chart_data['power_score']
        )
        await cache.set(cache_key, response.model_dump(), ttl=86400)
        await db.charts.insert_one({
            "name": birth_info.name, "chart_type": "vedic",
            "data": response.model_dump(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart calculation failed: {str(e)}")


@router.post("/vedic/dasha-periods")
async def get_dasha_periods(
    birth_info: BirthInfo,
    cache: CacheService = Depends(get_cache_service),
):
    cache_key = f"dasha:{birth_info.birth_date}:{birth_info.birth_time}:{birth_info.latitude:.2f}"
    cached = await cache.get(cache_key)
    if cached:
        return {"periods": [DashaPeriod(**p) for p in cached]}
    try:
        periods = vedic_service.calculate_dasha_periods(birth_info.model_dump())
        await cache.set(cache_key, periods, ttl=86400)
        return {"periods": [DashaPeriod(**p) for p in periods]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dasha calculation failed: {str(e)}")


@router.post("/vedic/divisional-chart/{d_number}")
async def get_divisional_chart(
    d_number: int,
    birth_info: BirthInfo,
    cache: CacheService = Depends(get_cache_service),
):
    if d_number < 1 or d_number > 60:
        raise HTTPException(status_code=400, detail="D-number must be between 1 and 60")
    cache_key = f"div:{d_number}:{birth_info.birth_date}:{birth_info.birth_time}:{birth_info.latitude:.2f}"
    cached = await cache.get(cache_key)
    if cached:
        return cached
    try:
        div_chart = vedic_service.calculate_divisional_chart(birth_info.model_dump(), d_number)
        await cache.set(cache_key, div_chart, ttl=86400)
        return div_chart
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Divisional chart calculation failed: {str(e)}")


@router.post("/vedic/pancha-pakshi")
async def calculate_pancha_pakshi(
    birth_info: BirthInfo,
    cache: CacheService = Depends(get_cache_service),
):
    try:
        chart = vedic_service.calculate_birth_chart(
            birth_info.birth_date, birth_info.birth_time,
            birth_info.latitude, birth_info.longitude, birth_info.timezone_offset
        )
        moon_pos = next(p for p in chart['planets'] if p['name'] == 'Moon')
        nakshatra_size = 360.0 / 27.0
        nakshatra_index = int(moon_pos['longitude'] / nakshatra_size) % 27
        pakshi = vedic_service.calculate_pancha_pakshi(nakshatra_index)
        pada_info = vedic_service.get_nakshatra_pada(moon_pos['longitude'])
        return {
            "person_name": birth_info.name,
            "moon_nakshatra": chart['lunar_mansion'],
            "moon_sign": moon_pos['sign'],
            "nakshatra_pada": pada_info,
            "pancha_pakshi": pakshi,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pancha-Pakshi calculation failed: {str(e)}")


@router.get("/vedic/nakshatra-padas")
async def get_all_nakshatra_padas():
    try:
        transits = vedic_service.calculate_current_transits()
        moon = transits['planets']['Moon']
        pada_info = vedic_service.get_nakshatra_pada(moon['longitude'])
        return {
            "moon_longitude": moon['longitude'],
            "moon_sign": moon['sign'],
            "nakshatra_detail": pada_info,
            "moon_phase": transits['moon_phase'],
            "tithi": transits['tithi'],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nakshatra Pada calculation failed: {str(e)}")
