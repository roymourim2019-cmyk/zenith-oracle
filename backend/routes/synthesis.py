from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.vedic_service import VedicAstrologyService
from services.western_service import WesternAstrologyService
from services.chinese_service import ChineseAstrologyService
from services.numerology_service import NumerologyService
from services.synthesis_engine import SynthesisEngine

router = APIRouter(tags=["Synthesis"])

vedic_service = VedicAstrologyService()
western_service = WesternAstrologyService()
chinese_service = ChineseAstrologyService()
numerology_service = NumerologyService()
synthesis_engine = SynthesisEngine()


class SynthesisRequest(BaseModel):
    name: str
    birth_date: str
    birth_time: str
    latitude: float
    longitude: float
    timezone_offset: float = 5.5


@router.post("/synthesis/sovereign-verdict")
async def get_sovereign_verdict(req: SynthesisRequest):
    try:
        vedic = vedic_service.calculate_birth_chart(
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        western = western_service.calculate_birth_chart(
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        chinese = chinese_service.calculate_chinese_sign(req.birth_date)
        numerology = numerology_service.calculate_numerology(req.name, req.birth_date)
        result = synthesis_engine.get_sovereign_synthesis(
            vedic, western, chinese, numerology,
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sovereign Synthesis failed: {str(e)}")


@router.post("/synthesis/akashic-echoes")
async def get_akashic_echoes(req: SynthesisRequest):
    try:
        vedic = vedic_service.calculate_birth_chart(
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        western = western_service.calculate_birth_chart(
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        result = synthesis_engine.get_akashic_echoes(vedic, western)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Akashic Echoes failed: {str(e)}")


@router.post("/synthesis/data-integrity")
async def get_data_integrity(req: SynthesisRequest):
    try:
        vedic = vedic_service.calculate_birth_chart(
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        western = western_service.calculate_birth_chart(
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        result = synthesis_engine.get_data_integrity(vedic, western)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data Integrity check failed: {str(e)}")


@router.post("/synthesis/sovereign-identity")
async def get_sovereign_identity(req: SynthesisRequest):
    try:
        vedic = vedic_service.calculate_birth_chart(
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        western = western_service.calculate_birth_chart(
            req.birth_date, req.birth_time, req.latitude, req.longitude, req.timezone_offset
        )
        chinese = chinese_service.calculate_chinese_sign(req.birth_date)
        dasha_lord = vedic.get('dasha_lord', 'Saturn')
        moon_sign = next((p['sign'] for p in vedic.get('planets', []) if p['name'] == 'Moon'), 'Aries')
        identity = synthesis_engine._build_sovereign_identity(
            chinese['element'], western['ascendant_sign'],
            vedic.get('lunar_mansion', 'Ashwini'), moon_sign, dasha_lord
        )
        return identity
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sovereign Identity failed: {str(e)}")
