from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from services.gemini_service import GeminiService
from services.vedic_service import VedicAstrologyService
from emergentintegrations.llm.chat import UserMessage
import swisseph as swe

router = APIRouter(tags=["AI & Briefings"])

gemini_service = GeminiService()
vedic_service = VedicAstrologyService()


class VocalOracleRequest(BaseModel):
    name: str
    birth_date: str
    birth_time: str
    latitude: float
    longitude: float
    timezone_offset: float = 5.5


@router.post("/ai/chart-insights")
async def get_ai_insights(chart_data: dict, question: Optional[str] = None):
    try:
        insights = await gemini_service.get_chart_insights(chart_data, question)
        return {"insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI insights failed: {str(e)}")


@router.get("/ai/daily-briefing")
async def get_daily_briefing(user_name: str = "Elite User", power_score: float = 75.0):
    try:
        user_profile = {"name": user_name, "power_score": power_score, "current_transit": "Favorable"}
        briefing = await gemini_service.get_daily_briefing(user_profile)
        return {"briefing": briefing}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Daily briefing failed: {str(e)}")


@router.post("/vocal-oracle")
async def vocal_oracle_briefing(req: VocalOracleRequest):
    try:
        chart = vedic_service.calculate_birth_chart(
            req.birth_date, req.birth_time,
            req.latitude, req.longitude, req.timezone_offset
        )
        transits = vedic_service.calculate_current_transits()
        moon_pos = next(p for p in chart['planets'] if p['name'] == 'Moon')
        nak_size = 360.0 / 27.0
        nak_idx = int(moon_pos['longitude'] / nak_size) % 27
        pakshi = vedic_service.calculate_pancha_pakshi(nak_idx)

        context = f"""STRATEGIC BRIEFING DATA:
Subject: {req.name}
Ascendant: {chart.get('ascendant_sign', 'N/A')}
Moon: {moon_pos['sign']} in {chart.get('lunar_mansion', 'N/A')}
Dasha Lord: {chart.get('dasha_lord', 'N/A')} ({chart.get('dasha_balance_years', 0):.1f} years remaining)
Power Score: {chart.get('power_score', 0)}/100
Pancha-Pakshi: {pakshi['birth_bird']} — Currently {pakshi['current_state']} (Power: {pakshi['power_level']}%)
Moon Phase: {transits['moon_phase']}
Active Aspects: {', '.join(f"{a['planet1']}-{a['planet2']} {a['aspect']}" for a in transits['aspects'][:3])}

Generate a 3-sentence strategic briefing. Sentence 1: Current cosmic position and authority level. Sentence 2: One decisive tactical move for the next 12 hours. Sentence 3: The single biggest risk to avoid. Tone: Authoritative, concise, alpha. No hedging."""

        briefing = await gemini_service.answer_question(context, "")

        return {
            "briefing": briefing,
            "dasha_lord": chart.get('dasha_lord', 'N/A'),
            "power_score": chart.get('power_score', 0),
            "pakshi_state": pakshi['current_state'],
            "pakshi_bird": pakshi['birth_bird'],
            "moon_phase": transits['moon_phase'],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vocal Oracle failed: {str(e)}")


@router.post("/alpha-briefing")
async def get_alpha_briefing(birth_date: str = None, birth_time: str = None, latitude: float = None, longitude: float = None):
    try:
        now = datetime.now(timezone.utc)
        jd_now = swe.julday(now.year, now.month, now.day, now.hour + now.minute / 60.0)

        planets = [
            (swe.SUN, "Sun"), (swe.MOON, "Moon"), (swe.MERCURY, "Mercury"),
            (swe.VENUS, "Venus"), (swe.MARS, "Mars"), (swe.JUPITER, "Jupiter"),
            (swe.SATURN, "Saturn"),
        ]
        signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]

        transit_summary = []
        for pid, name in planets:
            pos = swe.calc_ut(jd_now, pid)[0]
            sign = signs[int(pos[0] / 30) % 12]
            deg = pos[0] % 30
            transit_summary.append(f"{name} in {sign} at {deg:.1f}\u00B0")

        user_chart_context = ""
        if birth_date and birth_time and latitude is not None and longitude is not None:
            try:
                chart = vedic_service.calculate_birth_chart(birth_date, birth_time, latitude, longitude, 5.5)
                moon_pos = next((p for p in chart['planets'] if p['name'] == 'Moon'), None)
                user_chart_context = f"\nUser's Vedic Chart: Ascendant {chart.get('ascendant_sign','')}, Moon in {moon_pos['sign'] if moon_pos else 'unknown'}, Dasha Lord: {chart.get('dasha_lord','')}, Power Score: {chart.get('power_score',0)}/100."
            except Exception:
                pass

        day_num = (now.day + now.month) % 9 + 1

        prompt = f"""You are the Alpha Oracle delivering a 60-SECOND MORNING STRATEGY BRIEFING. Today is {now.strftime('%A, %B %d, %Y')}.

Current Planetary Transits (Swiss Ephemeris):
{chr(10).join(transit_summary)}

Universal Day Number: {day_num}
{user_chart_context}

Deliver a POWERFUL, CONCISE morning briefing covering:
1. TODAY'S COSMIC ENERGY (2 sentences — what element dominates, energy level)
2. STRATEGIC MOVE OF THE DAY (2 sentences — one concrete action based on transits)
3. DANGER ZONE (1 sentence — what to avoid and why)
4. POWER MANTRA (1 sentence — an empowering affirmation)

Style: Authoritative, alpha, strategic. No fluff. Every sentence is a weapon of clarity. Use real transit positions. Keep it under 150 words."""

        await gemini_service.initialize()
        briefing_text = await gemini_service.chat.send_message(UserMessage(text=prompt))

        return {
            "date": now.strftime("%Y-%m-%d"),
            "day": now.strftime("%A"),
            "briefing": briefing_text,
            "transits": transit_summary,
            "day_number": day_num,
            "scripture": f"Alpha Briefing powered by Swiss Ephemeris (NASA JPL DE431) + Gemini AI. Transit data for JD {jd_now:.4f}.",
        }

    except Exception as e:
        return {
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "day": datetime.now(timezone.utc).strftime("%A"),
            "briefing": f"The cosmos is momentarily veiled. Transit data shows the Moon moves through the zodiac, carrying today's strategic potential. Trust your foundation today. Error: {str(e)}",
            "transits": [],
            "day_number": 1,
            "scripture": "Fallback briefing. Gemini API temporarily unavailable.",
        }
