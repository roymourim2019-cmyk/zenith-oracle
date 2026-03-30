import swisseph as swe
from datetime import datetime, timezone
from typing import Dict, List, Any
import os
import math

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
        'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
        'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ]
    
    NAKSHATRA_LORDS = [
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
        'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu',
        'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
        'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus',
        'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter',
        'Saturn', 'Mercury'
    ]
    
    NAKSHATRA_PADA_LORDS = [
        ['Mars', 'Venus', 'Mercury', 'Moon'],       # Ashwini
        ['Sun', 'Mercury', 'Venus', 'Mars'],         # Bharani
        ['Jupiter', 'Saturn', 'Saturn', 'Jupiter'],   # Krittika
        ['Mars', 'Venus', 'Mercury', 'Moon'],         # Rohini
        ['Sun', 'Mars', 'Jupiter', 'Saturn'],         # Mrigasira
        ['Saturn', 'Saturn', 'Jupiter', 'Mercury'],   # Ardra
        ['Jupiter', 'Saturn', 'Saturn', 'Jupiter'],   # Punarvasu
        ['Mars', 'Venus', 'Mercury', 'Moon'],         # Pushya
        ['Mercury', 'Moon', 'Sun', 'Mars'],           # Ashlesha
        ['Mars', 'Venus', 'Mercury', 'Moon'],         # Magha
        ['Sun', 'Mercury', 'Venus', 'Mars'],          # Purva Phalguni
        ['Jupiter', 'Saturn', 'Saturn', 'Jupiter'],   # Uttara Phalguni
        ['Mars', 'Venus', 'Mercury', 'Moon'],         # Hasta
        ['Sun', 'Mars', 'Jupiter', 'Saturn'],         # Chitra
        ['Jupiter', 'Saturn', 'Saturn', 'Jupiter'],   # Swati
        ['Mars', 'Venus', 'Mercury', 'Moon'],         # Vishakha
        ['Saturn', 'Saturn', 'Jupiter', 'Mercury'],   # Anuradha
        ['Mercury', 'Moon', 'Sun', 'Mars'],           # Jyeshtha
        ['Mars', 'Venus', 'Mercury', 'Moon'],         # Mula
        ['Sun', 'Mercury', 'Venus', 'Mars'],          # Purva Ashadha
        ['Jupiter', 'Saturn', 'Saturn', 'Jupiter'],   # Uttara Ashadha
        ['Mars', 'Venus', 'Mercury', 'Moon'],         # Shravana
        ['Sun', 'Mars', 'Jupiter', 'Saturn'],         # Dhanishta
        ['Jupiter', 'Saturn', 'Saturn', 'Jupiter'],   # Shatabhisha
        ['Mars', 'Venus', 'Mercury', 'Moon'],         # Purva Bhadrapada
        ['Saturn', 'Saturn', 'Jupiter', 'Mercury'],   # Uttara Bhadrapada
        ['Mercury', 'Moon', 'Sun', 'Mars'],           # Revati
    ]
    
    PANCHA_PAKSHI_BIRDS = ['Vulture', 'Owl', 'Crow', 'Cock', 'Peacock']
    PANCHA_PAKSHI_STATES = ['Ruling', 'Eating', 'Walking', 'Sleeping', 'Dying']
    
    BIRD_SANSKRIT = {
        'Vulture': 'Griddhra', 'Owl': 'Uluka', 'Crow': 'Kaaka',
        'Cock': 'Kukkuda', 'Peacock': 'Mayura'
    }
    
    BIRD_ATTRIBUTES = {
        'Vulture': {'element': 'Ether', 'direction': 'Center', 'quality': 'Destruction & Rebirth'},
        'Owl': {'element': 'Air', 'direction': 'North-West', 'quality': 'Stealth & Wisdom'},
        'Crow': {'element': 'Fire', 'direction': 'South', 'quality': 'Intelligence & Speed'},
        'Cock': {'element': 'Earth', 'direction': 'East', 'quality': 'Alertness & Dominance'},
        'Peacock': {'element': 'Water', 'direction': 'West', 'quality': 'Authority & Grace'},
    }
    
    DAY_RULING_BIRD = {
        0: 2,  # Monday -> Crow
        1: 3,  # Tuesday -> Cock
        2: 4,  # Wednesday -> Peacock
        3: 0,  # Thursday -> Vulture
        4: 1,  # Friday -> Owl
        5: 2,  # Saturday -> Crow
        6: 4,  # Sunday -> Peacock
    }
    
    STATE_POWER = {
        'Ruling': 100, 'Eating': 75, 'Walking': 50, 'Sleeping': 25, 'Dying': 10
    }
    
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
    
    def get_nakshatra_pada(self, moon_longitude: float) -> Dict[str, Any]:
        """Calculate Nakshatra and Pada (quarter) from Moon's sidereal longitude"""
        nakshatra_span = 360.0 / 27.0  # 13.3333 degrees
        pada_span = nakshatra_span / 4.0  # 3.3333 degrees
        
        nakshatra_index = int(moon_longitude / nakshatra_span) % 27
        degree_in_nakshatra = moon_longitude % nakshatra_span
        pada_number = int(degree_in_nakshatra / pada_span) + 1
        if pada_number > 4:
            pada_number = 4
        
        nakshatra_name = self.NAKSHATRAS[nakshatra_index]
        lord = self.NAKSHATRA_LORDS[nakshatra_index]
        pada_lord = self.NAKSHATRA_PADA_LORDS[nakshatra_index][pada_number - 1]
        
        navamsha_sign_index = (nakshatra_index * 4 + (pada_number - 1)) % 12
        navamsha_sign = self.SIGN_NAMES[navamsha_sign_index]
        
        return {
            'nakshatra': nakshatra_name,
            'nakshatra_index': nakshatra_index,
            'pada': pada_number,
            'degree_in_nakshatra': round(degree_in_nakshatra, 4),
            'nakshatra_lord': lord,
            'pada_lord': pada_lord,
            'navamsha_sign': navamsha_sign,
            'total_padas_elapsed': nakshatra_index * 4 + pada_number,
        }
    
    def calculate_pancha_pakshi(self, moon_nakshatra_index: int, target_datetime: datetime = None) -> Dict[str, Any]:
        """Calculate Pancha-Pakshi (5-Bird) state based on Natal Moon Nakshatra and current time"""
        if target_datetime is None:
            target_datetime = datetime.now(timezone.utc)
        
        birth_bird_index = moon_nakshatra_index % 5
        birth_bird = self.PANCHA_PAKSHI_BIRDS[birth_bird_index]
        
        weekday = target_datetime.weekday()
        day_ruling_index = self.DAY_RULING_BIRD[weekday]
        
        hour = target_datetime.hour + target_datetime.minute / 60.0
        is_daytime = 6.0 <= hour < 18.0
        
        if is_daytime:
            hours_elapsed = hour - 6.0
        else:
            hours_elapsed = (hour - 18.0) % 12.0
        
        period_duration = 12.0 / 5.0  # 2.4 hours per period
        current_period = min(int(hours_elapsed / period_duration), 4)
        
        bird_state_offset = (birth_bird_index - day_ruling_index) % 5
        state_index = (bird_state_offset + current_period) % 5
        current_state = self.PANCHA_PAKSHI_STATES[state_index]
        
        power_level = self.STATE_POWER[current_state]
        
        period_start_hour = (6.0 if is_daytime else 18.0) + current_period * period_duration
        
        all_birds_states = {}
        for i, bird_name in enumerate(self.PANCHA_PAKSHI_BIRDS):
            offset = (i - day_ruling_index) % 5
            s_index = (offset + current_period) % 5
            all_birds_states[bird_name] = self.PANCHA_PAKSHI_STATES[s_index]
        
        strategic_guidance = self._get_pakshi_guidance(current_state, birth_bird, is_daytime)
        
        return {
            'birth_bird': birth_bird,
            'birth_bird_sanskrit': self.BIRD_SANSKRIT[birth_bird],
            'birth_bird_attributes': self.BIRD_ATTRIBUTES[birth_bird],
            'current_state': current_state,
            'power_level': power_level,
            'is_daytime': is_daytime,
            'current_period': current_period + 1,
            'period_label': f"{'Day' if is_daytime else 'Night'} Period {current_period + 1} of 5",
            'all_birds': all_birds_states,
            'weekday': target_datetime.strftime('%A'),
            'strategic_guidance': strategic_guidance,
        }
    
    def _get_pakshi_guidance(self, state: str, bird: str, is_daytime: bool) -> str:
        """Generate strategic guidance based on bird state"""
        phase = "daylight hours" if is_daytime else "nocturnal hours"
        guidance_map = {
            'Ruling': f"The {bird} commands the {phase}. Peak authority is yours. Launch decisive actions, negotiate from strength, and claim your dominion. The Tides of Time bow to your will.",
            'Eating': f"The {bird} gathers sustenance during these {phase}. A period of accumulation and nourishment. Absorb knowledge, consolidate resources, and fortify alliances.",
            'Walking': f"The {bird} traverses the {phase} with purpose. Movement and transition define this window. Travel, communicate, and expand your sphere of influence.",
            'Sleeping': f"The {bird} rests during these {phase}. Conserve your cosmic energy. Avoid confrontation, defer major decisions, and let the celestial currents carry you.",
            'Dying': f"The {bird} withdraws during these {phase}. A period of dissolution and surrender. Release what no longer serves you. The cosmos demands stillness before rebirth.",
        }
        return guidance_map.get(state, "Observe the celestial patterns.")
    
    def calculate_current_transits(self) -> Dict[str, Any]:
        """Calculate real-time planetary transits using Swiss Ephemeris"""
        now = datetime.now(timezone.utc)
        jd = swe.julday(now.year, now.month, now.day, now.hour + now.minute / 60.0)
        
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        ayanamsha = swe.get_ayanamsa_ut(jd)
        
        planets = {}
        planet_ids = {
            'Sun': swe.SUN, 'Moon': swe.MOON, 'Mercury': swe.MERCURY,
            'Venus': swe.VENUS, 'Mars': swe.MARS, 'Jupiter': swe.JUPITER,
            'Saturn': swe.SATURN,
        }
        
        for name, pid in planet_ids.items():
            xx, ret = swe.calc_ut(jd, pid)
            sid_long = (xx[0] - ayanamsha) % 360
            sign_idx = int(sid_long / 30) % 12
            nak_idx = int(sid_long / (360.0 / 27.0)) % 27
            pada = int((sid_long % (360.0 / 27.0)) / (360.0 / 27.0 / 4.0)) + 1
            if pada > 4:
                pada = 4
            
            planets[name] = {
                'longitude': round(sid_long, 4),
                'sign': self.SIGN_NAMES[sign_idx],
                'degree_in_sign': round(sid_long % 30, 4),
                'nakshatra': self.NAKSHATRAS[nak_idx],
                'pada': pada,
                'speed': round(xx[3], 4),
                'retrograde': xx[3] < 0,
            }
        
        moon_long = planets['Moon']['longitude']
        sun_long = planets['Sun']['longitude']
        phase_angle = (moon_long - sun_long) % 360
        
        if phase_angle < 12:
            moon_phase = "New Moon"
        elif phase_angle < 90:
            moon_phase = "Waxing Crescent"
        elif phase_angle < 102:
            moon_phase = "First Quarter"
        elif phase_angle < 168:
            moon_phase = "Waxing Gibbous"
        elif phase_angle < 192:
            moon_phase = "Full Moon"
        elif phase_angle < 270:
            moon_phase = "Waning Gibbous"
        elif phase_angle < 282:
            moon_phase = "Last Quarter"
        else:
            moon_phase = "Waning Crescent"
        
        tithi_number = int(phase_angle / 12) + 1
        if tithi_number > 30:
            tithi_number = 30
        
        aspects = self._calculate_aspects(planets)
        
        return {
            'timestamp': now.isoformat(),
            'julian_day': jd,
            'ayanamsha': round(ayanamsha, 6),
            'planets': planets,
            'moon_phase': moon_phase,
            'phase_angle': round(phase_angle, 2),
            'tithi': tithi_number,
            'aspects': aspects,
        }
    
    def _calculate_aspects(self, planets: Dict) -> List[Dict]:
        """Calculate major aspects between planets"""
        aspect_types = {
            0: {'name': 'Conjunction', 'orb': 8, 'nature': 'fusion'},
            60: {'name': 'Sextile', 'orb': 4, 'nature': 'harmonious'},
            90: {'name': 'Square', 'orb': 7, 'nature': 'tension'},
            120: {'name': 'Trine', 'orb': 7, 'nature': 'harmonious'},
            180: {'name': 'Opposition', 'orb': 8, 'nature': 'polarity'},
        }
        
        found = []
        planet_names = list(planets.keys())
        
        for i in range(len(planet_names)):
            for j in range(i + 1, len(planet_names)):
                p1 = planet_names[i]
                p2 = planet_names[j]
                l1 = planets[p1]['longitude']
                l2 = planets[p2]['longitude']
                
                diff = abs(l1 - l2) % 360
                if diff > 180:
                    diff = 360 - diff
                
                for exact_angle, info in aspect_types.items():
                    orb = abs(diff - exact_angle)
                    if orb <= info['orb']:
                        found.append({
                            'planet1': p1,
                            'planet2': p2,
                            'aspect': info['name'],
                            'nature': info['nature'],
                            'exact_angle': exact_angle,
                            'actual_angle': round(diff, 2),
                            'orb': round(orb, 2),
                            'applying': planets[p1]['speed'] > planets[p2]['speed'],
                        })
                        break
        
        found.sort(key=lambda x: x['orb'])
        return found
    
    def generate_oracle_feed(self) -> Dict[str, Any]:
        """Generate the Oracle Feed - transit alerts, psychic updates, historical parallels"""
        transits = self.calculate_current_transits()
        now = datetime.now(timezone.utc)
        
        transit_alerts = []
        for name, data in transits['planets'].items():
            if data['retrograde']:
                transit_alerts.append({
                    'type': 'retrograde',
                    'title': f"{name} Retrograde in {data['sign']}",
                    'message': f"The ancient force of {name} reverses through {data['sign']} at {data['degree_in_sign']:.1f}. The Tides of Time demand introspection in matters governed by this celestial body.",
                    'severity': 'high' if name in ['Saturn', 'Mars'] else 'medium',
                    'icon': 'retrograde',
                })
        
        tight_aspects = [a for a in transits['aspects'] if a['orb'] < 3]
        for asp in tight_aspects[:3]:
            if asp['nature'] == 'tension':
                msg = f"A {asp['aspect']} between {asp['planet1']} and {asp['planet2']} tightens to {asp['orb']:.1f} orb. Celestial friction generates transformative pressure. Navigate with strategic awareness."
            elif asp['nature'] == 'harmonious':
                msg = f"A {asp['aspect']} between {asp['planet1']} and {asp['planet2']} approaches perfection at {asp['orb']:.1f} orb. The celestial alignment opens corridors of opportunity."
            else:
                msg = f"A {asp['aspect']} of {asp['planet1']} and {asp['planet2']} at {asp['orb']:.1f} orb. Two cosmic forces merge, creating a vortex of concentrated energy."
            
            transit_alerts.append({
                'type': 'aspect',
                'title': f"{asp['planet1']}-{asp['planet2']} {asp['aspect']}",
                'message': msg,
                'severity': 'high' if asp['nature'] == 'tension' else 'medium',
                'icon': 'aspect',
            })
        
        moon_data = transits['planets']['Moon']
        transit_alerts.append({
            'type': 'lunar',
            'title': f"Moon traverses {moon_data['nakshatra']} Pada {moon_data['pada']}",
            'message': f"The Lunar Oracle enters {moon_data['nakshatra']} in {moon_data['sign']}. {transits['moon_phase']} energy permeates the collective consciousness. Tithi {transits['tithi']} governs the tides.",
            'severity': 'low',
            'icon': 'moon',
        })
        
        phase = transits['moon_phase']
        phase_energy = {
            'New Moon': {'rating': 35, 'quality': 'Introspective', 'guidance': 'Seeds planted in darkness yield the most potent harvest. Set intentions beneath the veiled sky.'},
            'Waxing Crescent': {'rating': 55, 'quality': 'Emerging', 'guidance': 'The first light of intention breaks the horizon. Momentum gathers like the gathering storm.'},
            'First Quarter': {'rating': 70, 'quality': 'Determined', 'guidance': 'The celestial half-light demands decisive action. Obstacles are merely tests of resolve.'},
            'Waxing Gibbous': {'rating': 80, 'quality': 'Amplifying', 'guidance': 'Cosmic energy builds toward its crescendo. Refine your strategy as the light intensifies.'},
            'Full Moon': {'rating': 100, 'quality': 'Peak Radiance', 'guidance': 'The full lunar disc illuminates all that was hidden. Peak authority. Harvest what you have cultivated.'},
            'Waning Gibbous': {'rating': 75, 'quality': 'Distributing', 'guidance': 'Share the wisdom gained at peak. The light recedes but its warmth remains potent.'},
            'Last Quarter': {'rating': 50, 'quality': 'Releasing', 'guidance': 'Release attachments that have completed their cycle. The cosmos clears space for renewal.'},
            'Waning Crescent': {'rating': 30, 'quality': 'Dissolving', 'guidance': 'The final whisper before silence. Surrender to the void. Rebirth approaches.'},
        }
        
        energy = phase_energy.get(phase, {'rating': 50, 'quality': 'Neutral', 'guidance': 'Observe the celestial patterns.'})
        
        psychic_update = {
            'collective_energy_rating': energy['rating'],
            'quality': energy['quality'],
            'moon_phase': phase,
            'guidance': energy['guidance'],
            'tithi': transits['tithi'],
        }
        
        saturn_data = transits['planets']['Saturn']
        jupiter_data = transits['planets']['Jupiter']
        
        saturn_parallels = {
            'Aries': "The last time Saturn traversed Aries, empires restructured their foundations. Markets that overextended faced correction. The pattern repeats.",
            'Taurus': "Saturn in Taurus historically forced a reckoning with material excess. The Great Depression began under a similar celestial signature.",
            'Gemini': "When Saturn last entered Gemini, communication networks transformed permanently. Information became both weapon and currency.",
            'Cancer': "Saturn's passage through Cancer coincided with shifts in housing and family structures. Ancestral patterns demanded resolution.",
            'Leo': "The last Saturn in Leo transit saw leaders tested by the weight of their own ambitions. Only those with true sovereignty survived.",
            'Virgo': "Saturn in Virgo historically demanded perfection in systems and health. What cannot be optimized is eliminated.",
            'Libra': "Saturn exalted in Libra last time brought sweeping judicial reforms and alliance restructuring across global powers.",
            'Scorpio': "Saturn's descent into Scorpio historically exposed hidden debts and secret power structures. Truth became unavoidable.",
            'Sagittarius': "When Saturn traversed Sagittarius, belief systems crumbled and new philosophies emerged from the ashes.",
            'Capricorn': "Saturn in its own sign last brought institutional overhaul. Those who built on solid foundations thrived.",
            'Aquarius': "Saturn's last passage through Aquarius rewrote the social contract. Technology displaced tradition permanently.",
            'Pisces': "Saturn in Pisces historically dissolved the boundaries between the material and spiritual. Collective consciousness shifted.",
        }
        
        historical_parallels = [
            {
                'planet': 'Saturn',
                'sign': saturn_data['sign'],
                'degree': round(saturn_data['degree_in_sign'], 1),
                'parallel': saturn_parallels.get(saturn_data['sign'], "Saturn's current position echoes ancient transformations."),
            },
        ]
        
        jupiter_sign = jupiter_data['sign']
        historical_parallels.append({
            'planet': 'Jupiter',
            'sign': jupiter_sign,
            'degree': round(jupiter_data['degree_in_sign'], 1),
            'parallel': f"Jupiter at {jupiter_data['degree_in_sign']:.1f} in {jupiter_sign} mirrors expansion cycles of the past. When the Great Benefic last graced this degree, opportunities emerged for those aligned with cosmic timing.",
        })
        
        return {
            'generated_at': now.isoformat(),
            'transit_alerts': transit_alerts,
            'psychic_update': psychic_update,
            'historical_parallels': historical_parallels,
            'current_transits': {k: {'sign': v['sign'], 'degree': v['degree_in_sign'], 'nakshatra': v['nakshatra'], 'pada': v['pada'], 'retrograde': v['retrograde']} for k, v in transits['planets'].items()},
        }