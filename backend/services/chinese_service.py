from typing import Dict, List
from datetime import datetime

class ChineseAstrologyService:
    """Chinese Astrology calculations (Lunisolar 1900-2100)"""
    
    ANIMALS = [
        'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
        'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
    ]
    
    ELEMENTS = ['Metal', 'Water', 'Wood', 'Fire', 'Earth']
    
    ANIMAL_TRAITS = {
        'Rat': ['intelligent', 'adaptable', 'quick-witted', 'charming', 'artistic'],
        'Ox': ['loyal', 'reliable', 'thorough', 'strong', 'reasonable'],
        'Tiger': ['enthusiastic', 'courageous', 'ambitious', 'leadership', 'confident'],
        'Rabbit': ['trustworthy', 'empathic', 'modest', 'diplomatic', 'sincere'],
        'Dragon': ['confident', 'intelligent', 'enthusiastic', 'charismatic', 'ambitious'],
        'Snake': ['wise', 'mysterious', 'intuitive', 'graceful', 'materialistic'],
        'Horse': ['animated', 'active', 'energetic', 'independent', 'optimistic'],
        'Goat': ['calm', 'gentle', 'sympathetic', 'creative', 'artistic'],
        'Monkey': ['sharp', 'smart', 'curious', 'clever', 'mischievous'],
        'Rooster': ['observant', 'hardworking', 'courageous', 'talented', 'confident'],
        'Dog': ['loyal', 'honest', 'prudent', 'faithful', 'responsible'],
        'Pig': ['compassionate', 'generous', 'diligent', 'optimistic', 'social']
    }
    
    COMPATIBILITY = {
        'Rat': ['Dragon', 'Monkey', 'Ox'],
        'Ox': ['Rat', 'Snake', 'Rooster'],
        'Tiger': ['Horse', 'Dog', 'Pig'],
        'Rabbit': ['Goat', 'Dog', 'Pig'],
        'Dragon': ['Rat', 'Monkey', 'Rooster'],
        'Snake': ['Ox', 'Rooster', 'Dragon'],
        'Horse': ['Tiger', 'Goat', 'Dog'],
        'Goat': ['Rabbit', 'Horse', 'Pig'],
        'Monkey': ['Rat', 'Dragon', 'Snake'],
        'Rooster': ['Ox', 'Snake', 'Dragon'],
        'Dog': ['Tiger', 'Rabbit', 'Horse'],
        'Pig': ['Rabbit', 'Goat', 'Tiger']
    }
    
    def calculate_chinese_sign(self, birth_date: str) -> Dict[str, any]:
        """Calculate Chinese zodiac sign and element"""
        year = int(birth_date.split('-')[0])
        
        animal_index = (year - 1900) % 12
        animal = self.ANIMALS[animal_index]
        
        element_index = ((year - 1900) % 10) // 2
        element = self.ELEMENTS[element_index]
        
        yin_yang = 'Yang' if year % 2 == 0 else 'Yin'
        
        lucky_numbers = [(animal_index + i) % 10 for i in range(1, 4)]
        lucky_colors = self._get_lucky_colors(element)
        
        return {
            'animal_sign': animal,
            'element': element,
            'yin_yang': yin_yang,
            'lucky_numbers': lucky_numbers,
            'lucky_colors': lucky_colors,
            'personality_traits': self.ANIMAL_TRAITS[animal],
            'compatible_signs': self.COMPATIBILITY[animal],
            'birth_year': year
        }
    
    def _get_lucky_colors(self, element: str) -> List[str]:
        """Get lucky colors for element"""
        color_map = {
            'Metal': ['White', 'Gold', 'Silver'],
            'Water': ['Black', 'Blue', 'Navy'],
            'Wood': ['Green', 'Teal', 'Jade'],
            'Fire': ['Red', 'Orange', 'Purple'],
            'Earth': ['Yellow', 'Brown', 'Beige']
        }
        return color_map.get(element, ['Gold', 'Silver', 'Bronze'])