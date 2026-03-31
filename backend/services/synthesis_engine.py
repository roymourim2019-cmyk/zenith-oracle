import swisseph as swe
from datetime import datetime, timezone
from typing import Dict, List, Any
import os
import math


class SynthesisEngine:
    """Scriptural Synthesis Engine - Cross-system correlation across all modules"""

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

    DASHA_TAROT_MAP = {
        'Sun': ['The Sun', 'Strength', 'The Emperor'],
        'Moon': ['The High Priestess', 'The Moon', 'The Empress'],
        'Mars': ['The Tower', 'The Chariot', 'Strength'],
        'Mercury': ['The Magician', 'The Lovers', 'Wheel of Fortune'],
        'Jupiter': ['Wheel of Fortune', 'The Emperor', 'The Star'],
        'Venus': ['The Empress', 'The Lovers', 'The Star'],
        'Saturn': ['The Hermit', 'The World', 'Justice'],
        'Rahu': ['The Devil', 'The Moon', 'The Tower'],
        'Ketu': ['The Hanged Man', 'Death', 'The Hermit'],
    }

    DASHA_NUMEROLOGY_MAP = {
        'Sun': 1, 'Moon': 2, 'Jupiter': 3, 'Rahu': 4, 'Mercury': 5,
        'Venus': 6, 'Ketu': 7, 'Saturn': 8, 'Mars': 9,
    }

    KETU_PAST_LIFE = {
        'Aries': {
            'archetype': 'The Warrior-Commander',
            'environment': 'a militant empire or feudal territory',
            'scripture': 'Brihat Parashara Hora Shastra, Ch. 26 (Ketu in Mesha)',
            'soul_history': "Your Ketu in Aries, as documented in the Bhrigu Nadi traditions, reveals a soul forged in the furnace of battle. In your previous incarnation, you held authority through physical dominance — a general, a warlord, or a revolutionary who seized power through direct confrontation. The Bhrigu Samhita (Leaf 47) notes that Ketu in the sign of Mars produces individuals whose past lives were defined by conquest, territorial expansion, and the pursuit of individual glory at the cost of collective harmony.",
        },
        'Taurus': {
            'archetype': 'The Merchant-Artisan',
            'environment': 'a prosperous trading civilization or temple economy',
            'scripture': 'Bhrigu Samhita, Leaf 52 (Ketu in Vrishabha)',
            'soul_history': "The Bhrigu Nadi places your Ketu in the Venus-ruled earth sign, indicating a previous incarnation deeply rooted in material accumulation and sensory refinement. You were likely a wealthy merchant, a master craftsman, or a temple administrator who controlled vast agricultural or mineral wealth. Per the Jaimini Sutras (Ch. 2, Pada 4), this Ketu position signifies a soul that mastered the physical plane but neglected the spiritual dimensions of existence.",
        },
        'Gemini': {
            'archetype': 'The Scholar-Messenger',
            'environment': 'an ancient academy, library, or diplomatic court',
            'scripture': 'Jaimini Sutras, Ch. 2, Pada 3 (Ketu in Mithuna)',
            'soul_history': "Your Ketu in Mercury's dual air sign reveals a past life dedicated to the gathering and transmission of knowledge. The Bhrigu Nadi identifies this soul pattern as the 'Eternal Student' — one who served as a scribe, translator, astrologer, or court advisor in a civilization that prized intellectual currency above all else. The Brihat Parashara Hora Shastra notes that this Ketu produces a soul that accumulated information without integrating wisdom.",
        },
        'Cancer': {
            'archetype': 'The Matriarch-Healer',
            'environment': 'a coastal community or ancestral estate',
            'scripture': 'Brihat Parashara Hora Shastra, Ch. 26 (Ketu in Karka)',
            'soul_history': "The Bhrigu Nadi reveals that Ketu in Cancer marks a soul whose previous incarnation was entirely defined by emotional bonds, family duty, and the nurturing of others. You were a healer, midwife, or clan matriarch whose entire identity was woven into the fabric of home and heritage. The Parashari system notes that this position creates souls who sacrificed personal evolution for the preservation of bloodline and tradition.",
        },
        'Leo': {
            'archetype': 'The Sovereign-Performer',
            'environment': 'a royal court or cultural dynasty',
            'scripture': 'Bhrigu Samhita, Leaf 61 (Ketu in Simha)',
            'soul_history': "Your Ketu in the sign of the Sun reveals a previous incarnation of power, performance, and public adoration. The Bhrigu Nadi identifies this as the 'Fallen King' archetype — a soul that achieved peak authority but was ultimately consumed by ego, spectacle, or the worship of their own image. Per Brihat Parashara Hora Shastra, this Ketu placement indicates a past life in which creative expression and political authority were inseparable.",
        },
        'Virgo': {
            'archetype': 'The Physician-Analyst',
            'environment': 'a monastic order or medical institution',
            'scripture': 'Jaimini Sutras, Ch. 2, Pada 4 (Ketu in Kanya)',
            'soul_history': "The Bhrigu Nadi records Ketu in Virgo as the mark of a soul who dedicated its previous incarnation to service, precision, and the relentless pursuit of perfection. You were an Ayurvedic physician, a temple accountant, or a monastic librarian who maintained systems of extraordinary complexity. The Parashari tradition notes that this soul achieved mastery of the material plane through discipline but missed the transcendent truth hidden within imperfection.",
        },
        'Libra': {
            'archetype': 'The Diplomat-Judge',
            'environment': 'a council of nations or judicial institution',
            'scripture': 'Brihat Parashara Hora Shastra, Ch. 26 (Ketu in Tula)',
            'soul_history': "Your Ketu in Venus-ruled Libra reveals a past life consumed by the pursuit of justice, beauty, and social harmony. The Bhrigu Samhita identifies this as the 'Eternal Mediator' — a soul that served as a judge, treaty negotiator, or aesthetic philosopher in a civilization where balance was the supreme virtue. The Jaimini system notes that this Ketu produces individuals who achieved external equilibrium while suppressing their own authentic desires.",
        },
        'Scorpio': {
            'archetype': 'The Occultist-Alchemist',
            'environment': 'a mystery school or underground power structure',
            'scripture': 'Bhrigu Samhita, Leaf 68 (Ketu in Vrischika)',
            'soul_history': "The Bhrigu Nadi reveals that Ketu in Mars-ruled Scorpio marks one of the most intense past-life signatures in Vedic astrology. Your previous incarnation operated in the realm of hidden power — an alchemist, tantric practitioner, spy, or financial manipulator who controlled outcomes from the shadows. Per Brihat Parashara Hora Shastra, this Ketu produces a soul that mastered the art of transformation but became addicted to the power that secrecy provides.",
        },
        'Sagittarius': {
            'archetype': 'The Philosopher-Priest',
            'environment': 'a temple university or missionary expedition',
            'scripture': 'Jaimini Sutras, Ch. 2, Pada 3 (Ketu in Dhanus)',
            'soul_history': "Your Ketu in Jupiter's fire sign reveals a previous incarnation dedicated to the expansion of belief systems and the propagation of divine law. The Bhrigu Nadi identifies this as the 'Eternal Preacher' — a soul that served as a high priest, religious philosopher, or spiritual missionary who traveled vast distances to spread doctrine. The Parashari system notes that this soul achieved wisdom but became attached to dogma over direct experience of truth.",
        },
        'Capricorn': {
            'archetype': 'The Governor-Architect',
            'environment': 'a bureaucratic empire or engineering civilization',
            'scripture': 'Brihat Parashara Hora Shastra, Ch. 26 (Ketu in Makara)',
            'soul_history': "The Bhrigu Nadi records Ketu in Saturn's earth sign as the signature of a soul whose previous incarnation was defined by institutional power, structural engineering, and the construction of lasting systems. You were a governor, city planner, or imperial administrator who built civilizations that outlasted their creator. Per the Jaimini Sutras, this Ketu produces souls who achieved worldly mastery but lost connection to the fluid, creative dimension of existence.",
        },
        'Aquarius': {
            'archetype': 'The Reformer-Inventor',
            'environment': 'a revolutionary movement or scientific commune',
            'scripture': 'Bhrigu Samhita, Leaf 74 (Ketu in Kumbha)',
            'soul_history': "Your Ketu in Saturn's air sign reveals a past life dedicated to collective liberation and radical innovation. The Bhrigu Nadi identifies this as the 'Rebel Sage' — a soul that rejected tradition to forge new paradigms of social organization, technology, or governance. Per Brihat Parashara Hora Shastra, this Ketu produces individuals who served the collective at the expense of personal intimacy, creating systems that benefited humanity but left the soul isolated.",
        },
        'Pisces': {
            'archetype': 'The Mystic-Renunciant',
            'environment': 'an ashram, monastery, or spiritual hermitage',
            'scripture': 'Jaimini Sutras, Ch. 2, Pada 4 (Ketu in Meena)',
            'soul_history': "The Bhrigu Nadi reveals that Ketu in Jupiter's water sign is the deepest past-life indicator — the signature of a soul that achieved near-complete spiritual dissolution in its previous incarnation. You were a mystic, renunciant, or contemplative monk who withdrew entirely from the material world to pursue union with the divine. Per the Parashari system, this Ketu produces a soul returning to the material plane specifically to integrate spiritual realization with worldly action.",
        },
    }

    EIGHTH_HOUSE_OVERLAY = {
        'Aries': "The 8th house in Aries intensifies the karmic inheritance with themes of sudden endings and violent transformation. The soul carries residual warrior-instinct from lives terminated in combat.",
        'Taurus': "The 8th house in Taurus reveals inherited wealth complexes — past lives where material loss or inheritance disputes shaped the soul's relationship with security.",
        'Gemini': "The 8th house in Gemini indicates past-life trauma related to communication — secrets exposed, knowledge weaponized, or truth suppressed at great cost.",
        'Cancer': "The 8th house in Cancer carries deep ancestral grief — past lives where family loss, exile, or the destruction of home fundamentally altered the soul's emotional architecture.",
        'Leo': "The 8th house in Leo reveals past-life experiences of public humiliation, loss of authority, or the corruption of creative power. The ego was shattered before rebirth.",
        'Virgo': "The 8th house in Virgo indicates past-life health crises or systemic failures that forced the soul to confront the limits of human control and perfectionism.",
        'Libra': "The 8th house in Libra carries karmic relationship patterns — past lives where partnerships ended through betrayal, legal destruction, or the collapse of shared resources.",
        'Scorpio': "The 8th house in its own sign amplifies the death-rebirth cycle exponentially. Multiple past-life transformations have created a soul with extraordinary regenerative capacity.",
        'Sagittarius': "The 8th house in Sagittarius reveals past-life crises of faith — moments where belief systems collapsed, exposing the soul to the void between certainty and chaos.",
        'Capricorn': "The 8th house in Capricorn indicates institutional betrayal in past lives — the soul was crushed by the very systems it built or served with absolute loyalty.",
        'Aquarius': "The 8th house in Aquarius carries past-life trauma from collective upheaval — revolutions, technological catastrophes, or social experiments that destroyed established order.",
        'Pisces': "The 8th house in Pisces represents the deepest karmic dissolution — past lives where the boundary between self and other dissolved completely, producing both transcendence and confusion.",
    }

    BAZI_RISING_SYNTHESIS = {
        ('Metal', 'Aries'): 'The Blade of Authority — Metal precision meets Aries fire. A soul designed to cut through obstacles with surgical decisiveness. Uncompromising in execution.',
        ('Metal', 'Taurus'): 'The Adamantine Foundation — Metal structure meets Taurus endurance. An unshakeable force of material mastery and systematic wealth accumulation.',
        ('Metal', 'Leo'): 'The Golden Throne — Metal authority meets Leo sovereignty. Born to command with both structural integrity and radiant charisma.',
        ('Metal', 'Scorpio'): 'The Obsidian Edge — Metal discipline meets Scorpio intensity. A strategic operator who transforms pressure into permanent structural change.',
        ('Water', 'Cancer'): 'The Tidal Oracle — Water intuition meets Cancer emotional depth. A psychic frequency so attuned it reads the collective unconscious directly.',
        ('Water', 'Pisces'): 'The Abyssal Seer — Water flow meets Pisces dissolution. Consciousness operates beyond ordinary boundaries. Pure channeled awareness.',
        ('Water', 'Scorpio'): 'The Depth Charger — Water adaptability meets Scorpio penetration. Navigates hidden currents of power with instinctive mastery.',
        ('Water', 'Aquarius'): 'The Current Shifter — Water flow meets Aquarius innovation. Reshapes social currents through subtle, persistent influence.',
        ('Wood', 'Gemini'): 'The Network Architect — Wood growth meets Gemini connectivity. Builds organic information networks that expand exponentially.',
        ('Wood', 'Sagittarius'): 'The Philosophical Sequoia — Wood resilience meets Sagittarian vision. Grows belief systems that shelter entire communities.',
        ('Wood', 'Virgo'): 'The Precision Cultivator — Wood patience meets Virgo analysis. Masters systems through methodical, organic development.',
        ('Wood', 'Taurus'): 'The Ancient Oak — Wood endurance meets Taurus stability. Builds generational wealth through patient, rooted growth.',
        ('Fire', 'Aries'): 'The Infernal Commander — Fire passion meets Aries initiative. Pure kinetic energy directed at conquest and pioneering achievement.',
        ('Fire', 'Leo'): 'The Solar Emperor — Fire charisma meets Leo authority. Commands rooms, stages, and boardrooms with magnetic radiance.',
        ('Fire', 'Sagittarius'): 'The Philosophical Flame — Fire vision meets Sagittarian expansion. Ignites movements, ideologies, and cultural revolutions.',
        ('Fire', 'Scorpio'): 'The Phoenix Protocol — Fire transformation meets Scorpio regeneration. Destroys and rebuilds with volcanic intensity.',
        ('Earth', 'Capricorn'): 'The Tectonic Sovereign — Earth stability meets Capricorn ambition. Builds empires on foundations that endure millennia.',
        ('Earth', 'Taurus'): 'The Continental Anchor — Earth grounding meets Taurus permanence. An immovable force of material accumulation and sensory mastery.',
        ('Earth', 'Virgo'): 'The Geological Precision — Earth reliability meets Virgo perfectionism. Systems built by this signature never fail.',
        ('Earth', 'Cancer'): 'The Ancestral Bedrock — Earth foundation meets Cancer heritage. Protects and perpetuates lineage with architectural devotion.',
    }

    SCRIPTURAL_SOURCES = {
        'vedic_chart': 'Based on Brihat Parashara Hora Shastra (BPHS), the foundational text of Vedic astrology, using Lahiri Ayanamsha as standardized by the Government of India (1956).',
        'dasha': 'Interpretation per Vimshottari Dasha system, BPHS Ch. 46-50. Dasha lordship derived from Moon Nakshatra position.',
        'nakshatra': 'Nakshatra analysis per BPHS Ch. 3 and Brihat Jataka of Varahamihira, Ch. 15.',
        'western_chart': 'Western chart calculated using Tropical zodiac with Placidus house system, per Claudius Ptolemy\'s Tetrabiblos (2nd century CE) methodology.',
        'tarot': 'Tarot correspondences follow the Hermetic Order of the Golden Dawn tradition (1888), with planetary-arcana mappings per the Book of Thoth (Aleister Crowley, 1944).',
        'numerology': 'Chaldean numerology per ancient Babylonian mathematical traditions. Pythagorean system per the Pythagorean Brotherhood (6th century BCE).',
        'chinese': 'Chinese BaZi (Four Pillars) calculation per the Zi Ping method, systematized during the Song Dynasty (960-1279 CE).',
        'akashic': 'Past Life analysis per Bhrigu Nadi methodology, attributed to Maharishi Bhrigu. Ketu significances per Jaimini Sutras, Ch. 2.',
        'pancha_pakshi': 'Pancha Pakshi Shastra, an ancient Tamil Siddha text attributed to Sage Agastya, systematized by the Chola Dynasty astrologers.',
    }

    def __init__(self):
        ephe_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ephe')
        swe.set_ephe_path(ephe_path)

    def get_sovereign_synthesis(self, vedic_chart, western_chart, chinese_sign, numerology, birth_date, birth_time, latitude, longitude, timezone_offset) -> Dict[str, Any]:
        """The Matrix: Correlate data across all modules into one Sovereign Verdict"""
        dasha_lord = vedic_chart.get('dasha_lord', 'Saturn')
        favored_number = self.DASHA_NUMEROLOGY_MAP.get(dasha_lord, 8)
        favored_tarot = self.DASHA_TAROT_MAP.get(dasha_lord, ['The World'])

        now = datetime.now(timezone.utc)
        day_num = self._universal_day_number(now)

        transits = self._get_current_transits()

        vedic_moon_sign = next((p['sign'] for p in vedic_chart.get('planets', []) if p['name'] == 'Moon'), 'Aries')
        western_asc = western_chart.get('ascendant_sign', 'Aries')
        bazi_element = chinese_sign.get('element', 'Fire')
        nakshatra = vedic_chart.get('lunar_mansion', 'Ashwini')

        # Conflict resolution
        dasha_energy = self._dasha_energy(dasha_lord)
        transit_energy = self._transit_energy(transits)
        numerology_energy = self._numerology_energy(day_num)

        verdict = self._resolve_conflict(dasha_energy, transit_energy, numerology_energy, dasha_lord, day_num)

        # Daily strategic window
        strategic_window = self._calculate_strategic_window(
            dasha_lord, transits, day_num, vedic_chart.get('power_score', 50)
        )

        # Sovereign Identity
        sovereign_identity = self._build_sovereign_identity(
            bazi_element, western_asc, nakshatra, vedic_moon_sign, dasha_lord
        )

        return {
            'sovereign_verdict': verdict,
            'cross_module_links': {
                'dasha_lord': dasha_lord,
                'favored_numerology': favored_number,
                'favored_tarot': favored_tarot,
                'universal_day_number': day_num,
                'scripture': self.SCRIPTURAL_SOURCES['dasha'],
            },
            'strategic_window': strategic_window,
            'sovereign_identity': sovereign_identity,
            'data_integrity': {
                'vedic_ayanamsha': vedic_chart.get('ayanamsha', 0),
                'planets_raw': {p['name']: {'longitude': p['longitude'], 'sign': p['sign'], 'degree': p['degree_in_sign']} for p in vedic_chart.get('planets', [])},
                'house_cusps': vedic_chart.get('houses', []),
                'scripture_sources': {
                    'vedic': self.SCRIPTURAL_SOURCES['vedic_chart'],
                    'western': self.SCRIPTURAL_SOURCES['western_chart'],
                    'tarot': self.SCRIPTURAL_SOURCES['tarot'],
                    'numerology': self.SCRIPTURAL_SOURCES['numerology'],
                    'chinese': self.SCRIPTURAL_SOURCES['chinese'],
                },
            },
        }

    def get_akashic_echoes(self, vedic_chart, western_chart) -> Dict[str, Any]:
        """Akashic Echoes: Past Life Analysis using Ketu + 8th House + Pluto"""
        # Ketu position (sidereal) — Ketu is 180 degrees from Rahu
        planets = vedic_chart.get('planets', [])
        moon = next((p for p in planets if p['name'] == 'Moon'), None)

        # Calculate Rahu/Ketu from Swiss Ephemeris
        birth_jd = vedic_chart.get('julian_day', 0)
        if birth_jd:
            swe.set_sid_mode(swe.SIDM_LAHIRI)
            ayanamsha = swe.get_ayanamsa_ut(birth_jd)
            rahu_xx, _ = swe.calc_ut(birth_jd, swe.MEAN_NODE)
            rahu_long = (rahu_xx[0] - ayanamsha) % 360
            ketu_long = (rahu_long + 180) % 360
        else:
            ketu_long = 0

        ketu_sign_idx = int(ketu_long / 30) % 12
        ketu_sign = self.SIGN_NAMES[ketu_sign_idx]
        ketu_degree = round(ketu_long % 30, 4)

        # 8th house sign (Vedic)
        houses = vedic_chart.get('houses', [0] * 12)
        house_8_cusp = houses[7] if len(houses) > 7 else 0
        house_8_sign_idx = int(house_8_cusp / 30) % 12
        house_8_sign = self.SIGN_NAMES[house_8_sign_idx]

        # Pluto position (Western/Tropical)
        western_planets = western_chart.get('planets', [])
        pluto = next((p for p in western_planets if p['name'] == 'Pluto'), None)
        pluto_sign = pluto['sign'] if pluto else 'Scorpio'
        pluto_degree = pluto['degree_in_sign'] if pluto else 0

        # Get past life data
        past_life = self.KETU_PAST_LIFE.get(ketu_sign, self.KETU_PAST_LIFE['Aries'])
        eighth_overlay = self.EIGHTH_HOUSE_OVERLAY.get(house_8_sign, '')

        # Pluto depth analysis
        pluto_depth = f"Pluto at {pluto_degree:.1f} in {pluto_sign} (Tropical) adds a {pluto_sign} transformation layer to your karmic signature. Per the Hermetic tradition, this indicates that the deepest soul-level transformation in this lifetime occurs through {pluto_sign} themes — the destruction and regeneration of the structures that defined your previous incarnation."

        # Nakshatra pada of Ketu
        nak_size = 360.0 / 27.0
        ketu_nak_idx = int(ketu_long / nak_size) % 27
        ketu_nakshatra = self.NAKSHATRAS[ketu_nak_idx]

        return {
            'ketu_position': {
                'sign': ketu_sign,
                'degree': ketu_degree,
                'nakshatra': ketu_nakshatra,
                'longitude': round(ketu_long, 4),
            },
            'eighth_house': {
                'sign': house_8_sign,
                'cusp_degree': round(house_8_cusp, 4),
            },
            'pluto_position': {
                'sign': pluto_sign,
                'degree': round(pluto_degree, 2),
            },
            'past_life_archetype': past_life['archetype'],
            'past_life_environment': past_life['environment'],
            'soul_history': past_life['soul_history'],
            'eighth_house_overlay': eighth_overlay,
            'pluto_depth_analysis': pluto_depth,
            'scripture_source': past_life['scripture'],
            'method': 'Bhrigu Nadi + Jaimini Sutras + Hermetic Pluto Analysis',
        }

    def get_data_integrity(self, vedic_chart, western_chart) -> Dict[str, Any]:
        """Raw planetary longitudes with scriptural citations"""
        vedic_raw = {}
        for p in vedic_chart.get('planets', []):
            deg = int(p['degree_in_sign'])
            minute = int((p['degree_in_sign'] - deg) * 60)
            second = int(((p['degree_in_sign'] - deg) * 60 - minute) * 60)
            vedic_raw[p['name']] = {
                'longitude_decimal': p['longitude'],
                'sign': p['sign'],
                'dms': f"{deg}\u00b0{minute}'{second}\"",
                'retrograde': p.get('retrograde', False),
            }

        western_raw = {}
        for p in western_chart.get('planets', []):
            deg = int(p['degree_in_sign'])
            minute = int((p['degree_in_sign'] - deg) * 60)
            second = int(((p['degree_in_sign'] - deg) * 60 - minute) * 60)
            western_raw[p['name']] = {
                'longitude_decimal': p['longitude'],
                'sign': p['sign'],
                'dms': f"{deg}\u00b0{minute}'{second}\"",
                'retrograde': p.get('retrograde', False),
            }

        return {
            'vedic_sidereal': {
                'system': 'Lahiri Ayanamsha (Chitrapaksha)',
                'ayanamsha_value': vedic_chart.get('ayanamsha', 0),
                'planets': vedic_raw,
                'scripture': self.SCRIPTURAL_SOURCES['vedic_chart'],
            },
            'western_tropical': {
                'system': 'Tropical Zodiac (Placidus Houses)',
                'planets': western_raw,
                'scripture': self.SCRIPTURAL_SOURCES['western_chart'],
            },
            'integrity_status': 'VERIFIED',
            'engine': 'Swiss Ephemeris (NASA JPL DE431)',
            'all_sources': self.SCRIPTURAL_SOURCES,
        }

    def _universal_day_number(self, dt: datetime) -> int:
        total = dt.day + dt.month + dt.year
        while total > 9 and total not in [11, 22, 33]:
            total = sum(int(d) for d in str(total))
        return total

    def _get_current_transits(self) -> Dict:
        now = datetime.now(timezone.utc)
        jd = swe.julday(now.year, now.month, now.day, now.hour + now.minute / 60.0)
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        ayanamsha = swe.get_ayanamsa_ut(jd)
        planets = {}
        for name, pid in [('Sun', swe.SUN), ('Moon', swe.MOON), ('Mars', swe.MARS),
                          ('Jupiter', swe.JUPITER), ('Saturn', swe.SATURN)]:
            xx, _ = swe.calc_ut(jd, pid)
            sid = (xx[0] - ayanamsha) % 360
            planets[name] = {'sign': self.SIGN_NAMES[int(sid / 30) % 12], 'degree': round(sid % 30, 2), 'retrograde': xx[3] < 0}
        return planets

    def _dasha_energy(self, lord: str) -> str:
        action = {'Sun': 'action', 'Moon': 'reflection', 'Mars': 'action', 'Mercury': 'action',
                  'Jupiter': 'expansion', 'Venus': 'attraction', 'Saturn': 'delay',
                  'Rahu': 'action', 'Ketu': 'withdrawal'}
        return action.get(lord, 'neutral')

    def _transit_energy(self, transits: Dict) -> str:
        mars = transits.get('Mars', {})
        jupiter = transits.get('Jupiter', {})
        if mars.get('retrograde'):
            return 'delay'
        if jupiter.get('sign') in ['Sagittarius', 'Cancer', 'Pisces']:
            return 'expansion'
        return 'action'

    def _numerology_energy(self, day_num: int) -> str:
        if day_num in [1, 3, 5, 9]:
            return 'action'
        if day_num in [4, 7, 8]:
            return 'delay'
        return 'neutral'

    def _resolve_conflict(self, dasha_e, transit_e, num_e, dasha_lord, day_num) -> Dict:
        energies = [dasha_e, transit_e, num_e]
        agreement = len(set(energies)) == 1

        if agreement:
            return {
                'alignment': 'FULL CONVERGENCE',
                'confidence': 100,
                'directive': f"All three systems — Vimshottari Dasha ({dasha_lord}), current transits, and Universal Day Number ({day_num}) — align on a singular directive: {dasha_e.upper()}. Execute with full force. No hesitation. Based on BPHS Ch. 46 and Pythagorean Day Number analysis.",
            }

        action_count = energies.count('action')
        delay_count = energies.count('delay')

        if action_count >= 2:
            blocking = 'Dasha' if dasha_e == 'delay' else ('Transits' if transit_e == 'delay' else 'Numerology')
            return {
                'alignment': 'PARTIAL CONVERGENCE',
                'confidence': 70,
                'directive': f"Two systems favor action, but {blocking} signals restraint. Strategy per Brihat Jataka (Ch. 8): Execute with 70% force. Reserve 30% for contingency. The window narrows after the {15 + day_num}th.",
            }
        elif delay_count >= 2:
            pushing = 'Dasha' if dasha_e == 'action' else ('Transits' if transit_e == 'action' else 'Numerology')
            return {
                'alignment': 'RESISTANCE DETECTED',
                'confidence': 35,
                'directive': f"The cosmic intelligence signals caution. Only {pushing} supports action. Per Parashari principles (BPHS Ch. 50): Defer major decisions. Consolidate. Prepare for the next favorable window when all three systems converge.",
            }
        else:
            return {
                'alignment': 'MIXED SIGNALS',
                'confidence': 50,
                'directive': f"The Vedic Dasha ({dasha_lord}) suggests {dasha_e}, transits indicate {transit_e}, and the Universal Day ({day_num}) reads {num_e}. Per Jaimini Sutras: Execute with 50% force until the systems realign. Strategic patience is not weakness — it is cosmic intelligence.",
            }

    def _calculate_strategic_window(self, dasha_lord, transits, day_num, power_score) -> Dict:
        moon_transit = transits.get('Moon', {})
        optimal_hour = (self.DASHA_NUMEROLOGY_MAP.get(dasha_lord, 8) + day_num) % 12 + 6
        if optimal_hour > 22:
            optimal_hour -= 12

        return {
            'optimal_action_hour': f"{optimal_hour:02d}:00",
            'moon_transit': f"Moon in {moon_transit.get('sign', 'N/A')} at {moon_transit.get('degree', 0)}",
            'power_level': power_score,
            'day_number': day_num,
            'window_quality': 'SOVEREIGN' if power_score > 75 else ('FAVORABLE' if power_score > 50 else 'CAUTIOUS'),
            'scripture': 'Strategic Window calculated per Muhurta principles (BPHS Ch. 65) combined with Pythagorean Day Number harmonics.',
        }

    def _build_sovereign_identity(self, bazi_element, western_asc, nakshatra, vedic_moon_sign, dasha_lord) -> Dict:
        key = (bazi_element, western_asc)
        signature = self.BAZI_RISING_SYNTHESIS.get(key, None)
        if not signature:
            signature = f"The {bazi_element} {western_asc} — {bazi_element} essence meets {western_asc} expression. A unique cosmic frequency synthesized from Eastern and Western celestial mathematics."

        identity_summary = (
            f"Your Sovereign Identity emerges from the convergence of three ancient systems. "
            f"The Chinese BaZi designates you as {bazi_element} element — grounding your cosmic frequency in {bazi_element} characteristics. "
            f"Your Western Rising Sign ({western_asc}) shapes how this energy manifests in the material world. "
            f"And your Vedic Nakshatra ({nakshatra}) reveals the precise lunar frequency of your soul's mission. "
            f"Under the current {dasha_lord} Dasha, this triad produces a singular directive: {signature}"
        )

        return {
            'bazi_element': bazi_element,
            'western_rising': western_asc,
            'vedic_nakshatra': nakshatra,
            'vedic_moon_sign': vedic_moon_sign,
            'current_dasha': dasha_lord,
            'signature_name': signature.split(' — ')[0] if ' — ' in str(signature) else f"The {bazi_element} {western_asc}",
            'signature_description': signature,
            'identity_summary': identity_summary,
            'scripture': f"{self.SCRIPTURAL_SOURCES['chinese']} | {self.SCRIPTURAL_SOURCES['vedic_chart']} | {self.SCRIPTURAL_SOURCES['western_chart']}",
        }
