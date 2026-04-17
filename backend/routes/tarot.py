from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from services.tarot_service import TarotService
from services.vedic_service import VedicAstrologyService
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

router = APIRouter(tags=["Tarot"])

tarot_service = TarotService()
vedic_service = VedicAstrologyService()
mongo_client = AsyncIOMotorClient(settings.mongo_url)
db = mongo_client[settings.db_name]


class TarotReadingRequest(BaseModel):
    question: str
    num_cards: int = Field(default=3, ge=3, le=5)
    reading_type: str = "general"
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone_offset: float = 5.5


@router.post("/tarot/reading")
async def get_tarot_reading(req: TarotReadingRequest):
    if req.reading_type not in ('general', 'career', 'aura', 'energy', 'love'):
        raise HTTPException(status_code=400, detail="Invalid reading type")
    try:
        moon_sign = None
        dasha_lord = None
        power_score = None
        if req.birth_date and req.birth_time and req.latitude is not None and req.longitude is not None:
            chart = vedic_service.calculate_birth_chart(
                req.birth_date, req.birth_time,
                req.latitude, req.longitude, req.timezone_offset
            )
            moon_pos = next((p for p in chart['planets'] if p['name'] == 'Moon'), None)
            if moon_pos:
                moon_sign = moon_pos['sign']
            dasha_lord = chart.get('dasha_lord')
            power_score = chart.get('power_score')

        reading = tarot_service.draw_personalized(
            question=req.question, num_cards=req.num_cards,
            reading_type=req.reading_type, birth_date=req.birth_date,
            moon_sign=moon_sign, dasha_lord=dasha_lord, power_score=power_score,
        )
        await db.tarot_readings.insert_one({
            "question": req.question, "num_cards": req.num_cards,
            "reading_type": req.reading_type, "reading": reading,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return reading
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tarot reading failed: {str(e)}")
