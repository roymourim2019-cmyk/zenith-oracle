from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class BirthInfo(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    birth_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    birth_time: str = Field(..., pattern=r"^\d{2}:\d{2}:\d{2}$")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone_offset: float = Field(default=5.5, ge=-12, le=14)

class PlanetPosition(BaseModel):
    name: str
    longitude: float
    latitude: float
    speed: float
    retrograde: bool
    sign: str
    degree_in_sign: float
    house: Optional[int] = None

class VedicChartResponse(BaseModel):
    person_name: str
    birth_datetime: str
    location: Dict[str, float]
    julian_day: float
    chart_type: str
    planets: List[PlanetPosition]
    ascendant: float
    ascendant_sign: str
    midheaven: float
    ayanamsha: float
    lunar_mansion: str
    dasha_lord: str
    dasha_balance_years: float
    houses: List[float]
    power_score: float

class DashaPeriod(BaseModel):
    lord: str
    start_date: str
    end_date: str
    duration_years: float
    is_current: bool = False

class DivisionalChart(BaseModel):
    d_number: int
    chart_name: str
    planets: List[PlanetPosition]

class NumerologyResult(BaseModel):
    name: str
    birth_date: str
    chaldean_number: int
    pythagorean_number: int
    vedic_number: int
    interpretation: str
    lucky_numbers: List[int]
    lucky_colors: List[str]

class TarotCard(BaseModel):
    name: str
    arcana: str
    suit: Optional[str] = None
    number: Optional[int] = None
    upright_meaning: str
    reversed_meaning: str
    image_url: str

class TarotReading(BaseModel):
    question: str
    spread_type: str
    cards: List[TarotCard]
    interpretation: str
    timestamp: datetime

class ChineseAstrology(BaseModel):
    birth_date: str
    animal_sign: str
    element: str
    yin_yang: str
    lucky_numbers: List[int]
    lucky_colors: List[str]
    personality_traits: List[str]
    compatible_signs: List[str]

class PaymentOrder(BaseModel):
    amount: int
    currency: str = "INR"
    receipt: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    subscription_tier: str = "free"
    credits: int = 0
    birth_info: Optional[BirthInfo] = None
    created_at: datetime

class PowerMeterData(BaseModel):
    overall_score: float
    strength_areas: List[str]
    challenge_areas: List[str]
    transit_influence: float
    dasha_influence: float
    recommendation: str

class NakshatraPadaResult(BaseModel):
    nakshatra: str
    nakshatra_index: int
    pada: int
    degree_in_nakshatra: float
    nakshatra_lord: str
    pada_lord: str
    navamsha_sign: str
    total_padas_elapsed: int

class PanchaPakshiResult(BaseModel):
    birth_bird: str
    birth_bird_sanskrit: str
    birth_bird_attributes: Dict[str, str]
    current_state: str
    power_level: int
    is_daytime: bool
    current_period: int
    period_label: str
    all_birds: Dict[str, str]
    weekday: str
    strategic_guidance: str

class TransitAlert(BaseModel):
    type: str
    title: str
    message: str
    severity: str
    icon: str

class PsychicUpdate(BaseModel):
    collective_energy_rating: int
    quality: str
    moon_phase: str
    guidance: str
    tithi: int

class HistoricalParallel(BaseModel):
    planet: str
    sign: str
    degree: float
    parallel: str

class OracleFeedResponse(BaseModel):
    generated_at: str
    transit_alerts: List[TransitAlert]
    psychic_update: PsychicUpdate
    historical_parallels: List[HistoricalParallel]
    current_transits: Dict[str, Any]