import swisseph as swe
from datetime import datetime
from typing import Dict, List, Any
import os

class VedicAstrologyService:
    """Vedic Astrology calculations using Swiss Ephemeris"""
    
    SIGN_NAMES = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    NAKSHATRAS = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira',
        'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
        'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
        'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
        'Purva Ashadha', 'Uttara Ashadha', 'Abhijit', 'Shravana',
        'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada'
    ]
    
    NAKSHATRA_LORDS = [
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
        'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu',
        'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
        'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus',
        'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter',
        'Saturn', 'Mercury'
    ]
    
    DASHA_YEARS = {
        'Sun': 6, 'Moon': 10, 'Mars': 7, 'Mercury': 17,
        'Jupiter': 16, 'Venus': 20, 'Saturn': 19, 'Rahu': 18, 'Ketu': 7
    }
    
    PLANET_IDS = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mercury': swe.MERCURY,
        'Venus': swe.VENUS,
        'Mars': swe.MARS,
        'Jupiter': swe.JUPITER,
        'Saturn': swe.SATURN,
    }
    
    def __init__(self):
        ephe_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ephe')
        swe.set_ephe_path(ephe_path)
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    def calculate_birth_chart(self, birth_date: str, birth_time: str,
                             latitude: float, longitude: float,
                             timezone_offset: float = 5.5) -> Dict[str, Any]:
        """Calculate complete Vedic birth chart"""
        year, month, day = map(int, birth_date.split('-'))
        hour, minute, second = map(int, birth_time.split(':'))
        
        local_time = hour + minute/60 + second/3600
        utc_time = local_time - timezone_offset
        
        jd = swe.julday(year, month, day, utc_time)
        
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        ayanamsha = swe.get_ayanamsa_ut(jd)
        
        planets = []
        for name, planet_id in self.PLANET_IDS.items():
            xx, ret = swe.calc_ut(jd, planet_id)
            longitude = (xx[0] - ayanamsha) % 360
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
        
        cusps, ascmc = swe.houses_ex(jd, latitude, longitude, b'P')
        ascendant = (ascmc[0] - ayanamsha) % 360
        midheaven = (ascmc[1] - ayanamsha) % 360
        
        moon_pos = (planets[1]['longitude'])  # Moon is second
        nakshatra_size = 360 / 27
        nakshatra_number = int(moon_pos / nakshatra_size) % 27
        degrees_in_nakshatra = moon_pos % nakshatra_size
        
        lord_index = nakshatra_number % 9
        dasha_lord = self.NAKSHATRA_LORDS[lord_index]
        proportion_elapsed = degrees_in_nakshatra / nakshatra_size
        dasha_balance = self.DASHA_YEARS[dasha_lord] * (1 - proportion_elapsed)
        
        houses = [(cusps[i] - ayanamsha) % 360 for i in range(12)]
        
        power_score = self._calculate_power_score(planets, houses)
        
        return {
            'julian_day': jd,
            'ayanamsha': round(ayanamsha, 4),
            'planets': planets,
            'ascendant': round(ascendant, 4),
            'ascendant_sign': self.SIGN_NAMES[int(ascendant / 30) % 12],
            'midheaven': round(midheaven, 4),
            'lunar_mansion': self.NAKSHATRAS[nakshatra_number],
            'dasha_lord': dasha_lord,
            'dasha_balance_years': round(dasha_balance, 2),
            'houses': [round(h, 4) for h in houses],
            'power_score': power_score
        }
    
    def _calculate_power_score(self, planets: List[Dict], houses: List[float]) -> float:
        """Calculate power meter score (0-100)"""
        score = 50.0
        
        for planet in planets:
            if planet['name'] in ['Sun', 'Mars', 'Jupiter']:
                if not planet['retrograde']:
                    score += 5
            
            if planet['speed'] > 0:
                score += 2
        
        score = min(100, max(0, score))
        return round(score, 2)
    
    def calculate_dasha_periods(self, birth_info: Dict) -> List[Dict[str, Any]]:
        """Calculate Vimshottari Dasha periods"""
        chart = self.calculate_birth_chart(
            birth_info['birth_date'],
            birth_info['birth_time'],
            birth_info['latitude'],
            birth_info['longitude'],
            birth_info.get('timezone_offset', 5.5)
        )
        
        jd = chart['julian_day']
        dasha_lord = chart['dasha_lord']
        balance_years = chart['dasha_balance_years']
        
        lord_index = list(self.DASHA_YEARS.keys()).index(dasha_lord)
        
        periods = []
        current_jd = jd
        
        first_period_end_jd = current_jd + (balance_years * 365.25)
        start_date = swe.revjul(current_jd)
        end_date = swe.revjul(first_period_end_jd)
        
        periods.append({
            'lord': dasha_lord,
            'start_date': f"{int(start_date[0])}-{int(start_date[1]):02d}-{int(start_date[2]):02d}",
            'end_date': f"{int(end_date[0])}-{int(end_date[1]):02d}-{int(end_date[2]):02d}",
            'duration_years': round(balance_years, 2),
            'is_current': True
        })
        
        current_jd = first_period_end_jd
        
        for i in range(1, 9):
            current_lord_index = (lord_index + i) % 9
            lord_name = list(self.DASHA_YEARS.keys())[current_lord_index]
            dasha_years = self.DASHA_YEARS[lord_name]
            dasha_end_jd = current_jd + (dasha_years * 365.25)
            
            start_date = swe.revjul(current_jd)
            end_date = swe.revjul(dasha_end_jd)
            
            periods.append({
                'lord': lord_name,
                'start_date': f"{int(start_date[0])}-{int(start_date[1]):02d}-{int(start_date[2]):02d}",
                'end_date': f"{int(end_date[0])}-{int(end_date[1]):02d}-{int(end_date[2]):02d}",
                'duration_years': dasha_years,
                'is_current': False
            })
            
            current_jd = dasha_end_jd
        
        return periods
    
    def calculate_divisional_chart(self, birth_info: Dict, d_number: int) -> Dict[str, Any]:
        """Calculate divisional charts (D1-D60)"""
        chart = self.calculate_birth_chart(
            birth_info['birth_date'],
            birth_info['birth_time'],
            birth_info['latitude'],
            birth_info['longitude'],
            birth_info.get('timezone_offset', 5.5)
        )
        
        if d_number == 1:
            return chart
        
        divisional_planets = []
        for planet in chart['planets']:
            long = planet['longitude']
            div_long = self._calculate_divisional_longitude(long, d_number)
            sign_num = int(div_long / 30) % 12
            
            divisional_planets.append({
                **planet,
                'longitude': div_long,
                'sign': self.SIGN_NAMES[sign_num],
                'degree_in_sign': div_long % 30
            })
        
        return {
            'd_number': d_number,
            'planets': divisional_planets
        }
    
    def _calculate_divisional_longitude(self, longitude: float, d_number: int) -> float:
        """Calculate divisional chart position"""
        sign = int(longitude / 30) % 12
        degree_in_sign = longitude % 30
        
        division_size = 30 / d_number
        division_number = int(degree_in_sign / division_size)
        
        if d_number == 9:
            movable_signs = [0, 3, 6, 9]
            fixed_signs = [1, 4, 7, 10]
            
            if sign in movable_signs:
                navamsha_sign = (sign + division_number) % 12
            elif sign in fixed_signs:
                navamsha_sign = (sign + 4 + division_number) % 12
            else:
                navamsha_sign = (sign + 8 + division_number) % 12
            
            return navamsha_sign * 30 + (degree_in_sign % division_size)
        
        divisional_sign = (sign * d_number + division_number) % 12
        return divisional_sign * 30 + (degree_in_sign % division_size)