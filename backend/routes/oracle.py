from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from services.vedic_service import VedicAstrologyService
from services.tarot_service import TarotService
from services.cache_service import CacheService
from core.redis_client import redis_client
from models.astro_models import OracleFeedResponse
import swisseph as swe
import random

router = APIRouter(tags=["Oracle & Daily"])

vedic_service = VedicAstrologyService()
tarot_service = TarotService()

async def get_cache_service() -> CacheService:
    return CacheService(redis_client.get_client(), prefix="zenith")


@router.get("/oracle-feed")
async def get_oracle_feed(cache: CacheService = Depends(get_cache_service)):
    cache_key = "oracle_feed:current"
    cached = await cache.get(cache_key)
    if cached:
        return OracleFeedResponse(**cached)
    try:
        feed = vedic_service.generate_oracle_feed()
        await cache.set(cache_key, feed, ttl=900)
        return OracleFeedResponse(**feed)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Oracle Feed generation failed: {str(e)}")


@router.get("/daily-oracle")
async def get_daily_oracle():
    try:
        now = datetime.now(timezone.utc)
        jd_now = swe.julday(now.year, now.month, now.day, now.hour + now.minute / 60.0)

        planets = [
            (swe.SUN, "Sun"), (swe.MOON, "Moon"), (swe.MERCURY, "Mercury"),
            (swe.VENUS, "Venus"), (swe.MARS, "Mars"), (swe.JUPITER, "Jupiter"),
            (swe.SATURN, "Saturn"),
        ]
        signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]

        transit_data = {}
        for planet_id, name in planets:
            pos = swe.calc_ut(jd_now, planet_id)[0]
            sign_idx = int(pos[0] / 30) % 12
            deg = pos[0] % 30
            transit_data[name] = {"sign": signs[sign_idx], "degree": round(deg, 2), "speed": round(pos[3], 4)}

        moon_sign = transit_data["Moon"]["sign"]
        sun_sign = transit_data["Sun"]["sign"]
        day_num = (now.day + now.month) % 9 + 1

        element_map = {"Aries":"Fire","Leo":"Fire","Sagittarius":"Fire","Taurus":"Earth","Virgo":"Earth","Capricorn":"Earth","Gemini":"Air","Libra":"Air","Aquarius":"Air","Cancer":"Water","Scorpio":"Water","Pisces":"Water"}
        moon_element = element_map.get(moon_sign, "Fire")

        energy_base = 50
        if transit_data["Jupiter"]["speed"] > 0: energy_base += 15
        if transit_data["Venus"]["speed"] > 0: energy_base += 10
        if transit_data["Mars"]["speed"] > 0: energy_base += 8
        if transit_data["Saturn"]["speed"] < 0: energy_base -= 10
        energy = min(max(energy_base + random.randint(-5, 5), 20), 98)

        horoscope_themes = {
            "Fire": {"mood": "Ambitious", "color": "Crimson Red", "focus": "Leadership & Bold Moves", "warning": "Avoid impulsive decisions before midday"},
            "Earth": {"mood": "Grounded", "color": "Forest Green", "focus": "Financial Strategy & Stability", "warning": "Don't resist change — adapt to new intel"},
            "Air": {"mood": "Inspired", "color": "Sky Blue", "focus": "Communication & Networking", "warning": "Overthinking kills momentum — act on instinct"},
            "Water": {"mood": "Intuitive", "color": "Deep Indigo", "focus": "Emotional Intelligence & Creativity", "warning": "Set boundaries — your energy is magnetic today"},
        }
        theme = horoscope_themes.get(moon_element, horoscope_themes["Fire"])

        career_msgs = [
            f"With the Moon in {moon_sign}, strategic patience is your superpower. Negotiate hard after {12 + day_num % 6}:00.",
            f"Mercury's position favors bold proposals. Send that pitch — the stars align for {moon_element.lower()} signs today.",
            f"Jupiter in {transit_data['Jupiter']['sign']} amplifies luck in joint ventures. Partnerships formed today carry cosmic momentum.",
        ]
        love_msgs = [
            f"Venus in {transit_data['Venus']['sign']} at {transit_data['Venus']['degree']:.0f}\u00B0 softens conversations. Lead with vulnerability tonight.",
            f"The {moon_sign} Moon magnetizes deep connections. Someone from your past may resurface unexpectedly.",
            "Mars-Venus energy creates tension that transforms into passion. Lean into honest dialogue.",
        ]
        health_activity = {'Fire':'high-intensity cardio','Earth':'yoga & grounding','Air':'breathwork','Water':'swimming or meditation'}.get(moon_element, 'mindful movement')
        growth_type = 'growth' if day_num in [3,6,8] else ('caution' if day_num in [4,7] else 'opportunity')
        invest_advice = 'Invest boldly.' if day_num in [3,8] else 'Hold positions.'

        health_msgs = [
            f"{moon_element} element dominant today — {health_activity} is your best move.",
            f"Energy peaks at {9 + day_num % 4}AM and dips at {2 + day_num % 3}PM. Schedule demanding tasks accordingly.",
        ]
        wealth_msgs = [
            f"Universal Day Number {day_num} resonates with {growth_type}. {invest_advice}",
            f"Saturn in {transit_data['Saturn']['sign']} demands discipline. Long-term plays over quick wins.",
        ]

        rng = random.Random(now.strftime("%Y%m%d"))

        return {
            "date": now.strftime("%Y-%m-%d"),
            "day_number": day_num,
            "moon_sign": moon_sign,
            "sun_sign": sun_sign,
            "moon_element": moon_element,
            "energy_level": energy,
            "theme": theme,
            "transits": transit_data,
            "teaser": {
                "headline": f"{theme['mood']} Energy Dominates — Moon in {moon_sign}",
                "summary": f"Today's cosmic energy ({energy}%) favors {theme['focus'].lower()}. {theme['warning']}.",
                "lucky_number": day_num,
                "lucky_color": theme["color"],
            },
            "extended": {
                "career": rng.choice(career_msgs),
                "love": rng.choice(love_msgs),
                "health": rng.choice(health_msgs),
                "wealth": rng.choice(wealth_msgs),
                "best_hours": f"{9 + day_num % 3}AM-{11 + day_num % 2}AM, {4 + day_num % 3}PM-{6 + day_num % 2}PM",
                "avoid_hours": f"{1 + day_num % 2}PM-{3 + day_num % 2}PM",
                "mantra": f"I am aligned with the {moon_element.lower()} within. My power is {['infinite','unstoppable','magnetic','sovereign'][day_num % 4]}.",
            },
            "scripture": f"Transit data computed via Swiss Ephemeris (NASA JPL DE431). Moon position: {moon_sign} {transit_data['Moon']['degree']:.2f}\u00B0. Universal Day Number per Chaldean reduction of {now.strftime('%d/%m/%Y')}.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Daily oracle failed: {str(e)}")


@router.get("/daily-tarot-card")
async def get_daily_tarot_card():
    try:
        now = datetime.now(timezone.utc)
        seed = int(now.strftime("%Y%m%d"))
        card = tarot_service.draw_daily_card(seed)
        return card
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Daily tarot card failed: {str(e)}")
