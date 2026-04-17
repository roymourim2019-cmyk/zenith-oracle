import swisseph as swe
from typing import Dict, List, Any
import os

class WesternAstrologyService:
    """Western Astrology calculations (Tropical zodiac)"""
    
    SIGN_NAMES = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    PLANET_IDS = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mercury': swe.MERCURY,
        'Venus': swe.VENUS,
        'Mars': swe.MARS,
        'Jupiter': swe.JUPITER,
        'Saturn': swe.SATURN,
        'Uranus': swe.URANUS,
        'Neptune': swe.NEPTUNE,
        'Pluto': swe.PLUTO
    }
    
    def __init__(self):
        ephe_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ephe')
        swe.set_ephe_path(ephe_path)
    
    def calculate_birth_chart(self, birth_date: str, birth_time: str,
                             latitude: float, longitude: float,
                             timezone_offset: float = 0) -> Dict[str, Any]:
        """Calculate Western tropical birth chart"""
        year, month, day = map(int, birth_date.split('-'))
        hour, minute, second = map(int, birth_time.split(':'))
        
        local_time = hour + minute/60 + second/3600
        utc_time = local_time - timezone_offset
        
        jd = swe.julday(year, month, day, utc_time)
        
        planets = []
        for name, planet_id in self.PLANET_IDS.items():
            xx, ret = swe.calc_ut(jd, planet_id, swe.FLG_SPEED)
            longitude = xx[0]
            sign_number = int(longitude / 30) % 12
            
            planets.append({
                'name': name,
                'longitude': round(longitude, 4),
                'latitude': round(xx[1], 4),
                'speed': round(xx[3], 4),
                'retrograde': xx[3] < 0,
                'sign': self.SIGN_NAMES[sign_number],
                'degree_in_sign': round(longitude % 30, 4)
            })
        
        cusps, ascmc = swe.houses(jd, latitude, longitude, b'P')
        
        ascendant = ascmc[0]
        midheaven = ascmc[1]
        
        houses = [cusps[i] for i in range(12)]

        aspects = self._calculate_aspects(planets)

        return {
            'julian_day': jd,
            'chart_type': 'Western Tropical',
            'planets': planets,
            'ascendant': round(ascendant, 4),
            'ascendant_sign': self.SIGN_NAMES[int(ascendant / 30) % 12],
            'midheaven': round(midheaven, 4),
            'midheaven_sign': self.SIGN_NAMES[int(midheaven / 30) % 12],
            'houses': [round(h, 4) for h in houses],
            'aspects': aspects
        }

    def _calculate_aspects(self, planets: list) -> list:
        ASPECT_DEFS = [
            ('Conjunction', 0, 8),
            ('Opposition', 180, 8),
            ('Trine', 120, 8),
            ('Square', 90, 7),
            ('Sextile', 60, 6),
            ('Quincunx', 150, 3),
            ('Semi-Sextile', 30, 2),
        ]
        aspects = []
        for i in range(len(planets)):
            for j in range(i + 1, len(planets)):
                p1 = planets[i]
                p2 = planets[j]
                diff = abs(p1['longitude'] - p2['longitude'])
                if diff > 180:
                    diff = 360 - diff
                for name, angle, orb in ASPECT_DEFS:
                    if abs(diff - angle) <= orb:
                        strength = round((1 - abs(diff - angle) / orb) * 100, 1)
                        aspects.append({
                            'planet1': p1['name'],
                            'planet2': p2['name'],
                            'aspect': name,
                            'angle': round(diff, 2),
                            'orb': round(abs(diff - angle), 2),
                            'strength': strength,
                        })
                        break
        aspects.sort(key=lambda a: a['strength'], reverse=True)
        return aspects