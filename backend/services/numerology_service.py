from typing import Dict, List

class NumerologyService:
    """Numerology calculations: Chaldean, Pythagorean, Vedic"""
    
    CHALDEAN_MAP = {
        'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
        'B': 2, 'K': 2, 'R': 2,
        'C': 3, 'G': 3, 'L': 3, 'S': 3,
        'D': 4, 'M': 4, 'T': 4,
        'E': 5, 'H': 5, 'N': 5, 'X': 5,
        'U': 6, 'V': 6, 'W': 6,
        'O': 7, 'Z': 7,
        'F': 8, 'P': 8
    }
    
    PYTHAGOREAN_MAP = {
        'A': 1, 'J': 1, 'S': 1,
        'B': 2, 'K': 2, 'T': 2,
        'C': 3, 'L': 3, 'U': 3,
        'D': 4, 'M': 4, 'V': 4,
        'E': 5, 'N': 5, 'W': 5,
        'F': 6, 'O': 6, 'X': 6,
        'G': 7, 'P': 7, 'Y': 7,
        'H': 8, 'Q': 8, 'Z': 8,
        'I': 9, 'R': 9
    }
    
    NUMBER_MEANINGS = {
        1: "Leadership, Independence, Pioneer",
        2: "Cooperation, Balance, Diplomacy",
        3: "Creativity, Expression, Joy",
        4: "Stability, Organization, Hard work",
        5: "Freedom, Adventure, Change",
        6: "Responsibility, Nurturing, Harmony",
        7: "Wisdom, Spirituality, Analysis",
        8: "Power, Success, Material wealth",
        9: "Compassion, Completion, Humanitarian",
        11: "Intuition, Inspiration, Master number",
        22: "Master builder, Visionary, Achievement",
        33: "Master teacher, Spiritual elevation"
    }
    
    def calculate_numerology(self, name: str, birth_date: str) -> Dict[str, any]:
        """Calculate all numerology numbers"""
        chaldean = self._calculate_chaldean(name)
        pythagorean = self._calculate_pythagorean(name)
        vedic = self._calculate_vedic_from_date(birth_date)
        
        return {
            'name': name,
            'birth_date': birth_date,
            'chaldean_number': chaldean,
            'pythagorean_number': pythagorean,
            'vedic_number': vedic,
            'interpretation': self.NUMBER_MEANINGS.get(chaldean, 'Unique vibration'),
            'lucky_numbers': [chaldean, pythagorean, vedic],
            'lucky_colors': self._get_lucky_colors(chaldean)
        }
    
    def _calculate_chaldean(self, name: str) -> int:
        """Calculate Chaldean number (1-8)"""
        name_clean = name.upper().replace(' ', '')
        total = sum(self.CHALDEAN_MAP.get(char, 0) for char in name_clean if char.isalpha())
        while total > 9:
            total = sum(int(digit) for digit in str(total))
        return total
    
    def _calculate_pythagorean(self, name: str) -> int:
        """Calculate Pythagorean number (1-9)"""
        name_clean = name.upper().replace(' ', '')
        total = sum(self.PYTHAGOREAN_MAP.get(char, 0) for char in name_clean if char.isalpha())
        while total > 9 and total not in [11, 22, 33]:
            total = sum(int(digit) for digit in str(total))
        return total
    
    def _calculate_vedic_from_date(self, birth_date: str) -> int:
        """Calculate Vedic number from birth date"""
        day = int(birth_date.split('-')[2])
        if day > 9:
            day = sum(int(d) for d in str(day))
        return day
    
    def _get_lucky_colors(self, number: int) -> List[str]:
        """Get lucky colors for number"""
        color_map = {
            1: ['Red', 'Orange', 'Gold'],
            2: ['White', 'Cream', 'Green'],
            3: ['Yellow', 'Purple', 'Violet'],
            4: ['Blue', 'Gray', 'Silver'],
            5: ['Light Gray', 'White', 'Turquoise'],
            6: ['Pink', 'Blue', 'Rose'],
            7: ['Light Green', 'Yellow', 'White'],
            8: ['Black', 'Dark Blue', 'Brown'],
            9: ['Red', 'Crimson', 'Maroon']
        }
        return color_map.get(number, ['Gold', 'Silver', 'Bronze'])