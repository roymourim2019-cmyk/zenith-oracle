import random
from typing import List, Dict, Any
from datetime import datetime, timezone


class TarotService:
    """Tarot reading service with 78+44 Alpha Strategy cards"""
    
    MAJOR_ARCANA = [
        {'name': 'The Fool', 'number': 0, 'upright': 'New beginnings, spontaneity, innocence', 'reversed': 'Recklessness, risk-taking', 'element': 'Air', 'planet': 'Uranus'},
        {'name': 'The Magician', 'number': 1, 'upright': 'Manifestation, resourcefulness, power', 'reversed': 'Manipulation, poor planning', 'element': 'Air', 'planet': 'Mercury'},
        {'name': 'The High Priestess', 'number': 2, 'upright': 'Intuition, sacred knowledge, divine feminine', 'reversed': 'Secrets, disconnected', 'element': 'Water', 'planet': 'Moon'},
        {'name': 'The Empress', 'number': 3, 'upright': 'Femininity, beauty, nature, abundance', 'reversed': 'Creative block, dependence', 'element': 'Earth', 'planet': 'Venus'},
        {'name': 'The Emperor', 'number': 4, 'upright': 'Authority, establishment, structure, father figure', 'reversed': 'Domination, control issues', 'element': 'Fire', 'planet': 'Aries'},
        {'name': 'The Hierophant', 'number': 5, 'upright': 'Spiritual wisdom, tradition, conformity', 'reversed': 'Rebellion, subversiveness', 'element': 'Earth', 'planet': 'Taurus'},
        {'name': 'The Lovers', 'number': 6, 'upright': 'Love, harmony, relationships, values alignment', 'reversed': 'Disharmony, imbalance', 'element': 'Air', 'planet': 'Gemini'},
        {'name': 'The Chariot', 'number': 7, 'upright': 'Control, willpower, success, action', 'reversed': 'Lack of control, opposition', 'element': 'Water', 'planet': 'Cancer'},
        {'name': 'Strength', 'number': 8, 'upright': 'Strength, courage, persuasion, influence', 'reversed': 'Weakness, self-doubt', 'element': 'Fire', 'planet': 'Leo'},
        {'name': 'The Hermit', 'number': 9, 'upright': 'Soul searching, introspection, inner guidance', 'reversed': 'Isolation, loneliness', 'element': 'Earth', 'planet': 'Virgo'},
        {'name': 'Wheel of Fortune', 'number': 10, 'upright': 'Good luck, karma, life cycles, destiny', 'reversed': 'Bad luck, resistance to change', 'element': 'Fire', 'planet': 'Jupiter'},
        {'name': 'Justice', 'number': 11, 'upright': 'Justice, fairness, truth, cause and effect', 'reversed': 'Unfairness, lack of accountability', 'element': 'Air', 'planet': 'Libra'},
        {'name': 'The Hanged Man', 'number': 12, 'upright': 'Pause, surrender, letting go, new perspectives', 'reversed': 'Delays, resistance', 'element': 'Water', 'planet': 'Neptune'},
        {'name': 'Death', 'number': 13, 'upright': 'Endings, change, transformation, transition', 'reversed': 'Resistance to change, stagnation', 'element': 'Water', 'planet': 'Scorpio'},
        {'name': 'Temperance', 'number': 14, 'upright': 'Balance, moderation, patience, purpose', 'reversed': 'Imbalance, excess', 'element': 'Fire', 'planet': 'Sagittarius'},
        {'name': 'The Devil', 'number': 15, 'upright': 'Shadow self, attachment, addiction, restriction', 'reversed': 'Releasing limiting beliefs', 'element': 'Earth', 'planet': 'Capricorn'},
        {'name': 'The Tower', 'number': 16, 'upright': 'Sudden change, upheaval, chaos, revelation', 'reversed': 'Personal transformation, avoidance', 'element': 'Fire', 'planet': 'Mars'},
        {'name': 'The Star', 'number': 17, 'upright': 'Hope, faith, purpose, renewal, spirituality', 'reversed': 'Lack of faith, despair', 'element': 'Air', 'planet': 'Aquarius'},
        {'name': 'The Moon', 'number': 18, 'upright': 'Illusion, fear, anxiety, subconscious, intuition', 'reversed': 'Release of fear, confusion', 'element': 'Water', 'planet': 'Pisces'},
        {'name': 'The Sun', 'number': 19, 'upright': 'Positivity, fun, warmth, success, vitality', 'reversed': 'Inner child, feeling down', 'element': 'Fire', 'planet': 'Sun'},
        {'name': 'Judgement', 'number': 20, 'upright': 'Judgement, rebirth, inner calling, absolution', 'reversed': 'Self-doubt, inner critic', 'element': 'Fire', 'planet': 'Pluto'},
        {'name': 'The World', 'number': 21, 'upright': 'Completion, accomplishment, travel, achievement', 'reversed': 'Seeking closure, delays', 'element': 'Earth', 'planet': 'Saturn'}
    ]
    
    SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles']
    SUIT_ELEMENTS = {'Wands': 'Fire', 'Cups': 'Water', 'Swords': 'Air', 'Pentacles': 'Earth'}
    
    ALPHA_STRATEGY_CARDS = [
        {'name': 'Strategic Pivot', 'meaning': 'Time to change direction for maximum advantage'},
        {'name': 'Market Dominance', 'meaning': 'Assert your authority in your chosen field'},
        {'name': 'Hidden Opportunity', 'meaning': 'A concealed advantage awaits discovery'},
        {'name': 'Power Alliance', 'meaning': 'Strategic partnerships will multiply your strength'},
        {'name': 'Calculated Risk', 'meaning': 'Bold action with measured consequences'},
        {'name': 'Resource Consolidation', 'meaning': 'Gather your assets for the next phase'},
        {'name': 'Competitive Edge', 'meaning': 'Your unique advantage is about to manifest'},
        {'name': 'Legacy Building', 'meaning': 'Actions now create lasting impact'},
        {'name': 'Innovation Strike', 'meaning': 'Revolutionary thinking breaks the mold'},
        {'name': 'Temporal Advantage', 'meaning': 'Timing is everything - act precisely'},
    ]

    SIGN_ELEMENTS = {
        'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
        'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
        'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
        'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
    }

    DASHA_ARCANA = {
        'Sun': [19, 8, 4], 'Moon': [2, 18, 3], 'Mars': [16, 7, 8],
        'Mercury': [1, 6, 10], 'Jupiter': [10, 4, 17], 'Venus': [3, 6, 17],
        'Saturn': [9, 21, 11], 'Rahu': [15, 18, 16], 'Ketu': [12, 13, 9],
    }

    READING_TYPES = {
        'general': {
            'name': 'General Oracle Reading',
            'positions_3': ['Past Influence', 'Present State', 'Future Path'],
            'positions_5': ['Root Cause', 'Recent Past', 'Present', 'Near Future', 'Outcome'],
            'scripture': 'Celtic Cross variation per Golden Dawn tradition (1888).',
        },
        'career': {
            'name': 'Career & Ambition Reading',
            'positions_3': ['Current Position', 'Hidden Challenge', 'Strategic Move'],
            'positions_5': ['Foundation', 'Obstacle', 'Aspiration', 'Hidden Influence', 'Outcome'],
            'scripture': 'Vocational spread per Hermetic Tarot tradition. Pentacles and Wands prioritized.',
        },
        'aura': {
            'name': 'Aura & Spiritual Energy',
            'positions_3': ['Inner Light', 'Shadow Layer', 'Radiance Path'],
            'positions_5': ['Root Chakra', 'Heart Chakra', 'Third Eye', 'Crown', 'Aura Signature'],
            'scripture': 'Chakra-Tarot correspondence per Theosophical Society (1875) and Book of Thoth.',
        },
        'energy': {
            'name': "Today's Energy Forecast",
            'positions_3': ['Morning Energy', 'Afternoon Shift', 'Evening Resolution'],
            'positions_5': ['Dawn', 'Morning Peak', 'Solar Noon', 'Twilight', 'Night Wisdom'],
            'scripture': 'Temporal Tarot spread per Planetary Hours system (Agrippa, 1533).',
        },
        'love': {
            'name': 'Relationship & Heart Reading',
            'positions_3': ['Your Energy', 'Their Energy', 'Connection Point'],
            'positions_5': ['Your Heart', 'Their Heart', 'The Bond', 'Hidden Truth', 'Destiny'],
            'scripture': 'Relationship spread per Cups-dominant reading (Golden Dawn, Mathers 1888).',
        },
    }
    
    def __init__(self):
        random.seed()
    
    def draw_personalized(self, question, num_cards, reading_type,
                          birth_date=None, moon_sign=None,
                          dasha_lord=None, power_score=None):
        """Draw cards personalized to the user's astrological profile"""
        deck = self._create_full_deck()
        
        if moon_sign or dasha_lord:
            deck = self._weight_deck(deck, moon_sign, dasha_lord)
        
        random.shuffle(deck)
        
        seen = set()
        drawn = []
        for card in deck:
            if card['name'] not in seen:
                seen.add(card['name'])
                drawn.append(card)
            if len(drawn) >= num_cards:
                break
        
        rtype = self.READING_TYPES.get(reading_type, self.READING_TYPES['general'])
        positions = rtype.get(f'positions_{num_cards}', rtype['positions_3'])
        
        for i, card in enumerate(drawn):
            card['position'] = positions[i] if i < len(positions) else f'Card {i+1}'
        
        interpretation = self._interpret_personalized(
            drawn, question, reading_type, moon_sign, dasha_lord, power_score
        )
        
        return {
            'question': question,
            'reading_type': reading_type,
            'reading_name': rtype['name'],
            'spread_type': f'{num_cards}-Card {rtype["name"]}',
            'cards': drawn,
            'positions': positions[:num_cards],
            'interpretation': interpretation,
            'scripture': rtype['scripture'],
            'personalization': {
                'moon_sign': moon_sign,
                'dasha_lord': dasha_lord,
                'power_score': power_score,
                'element_affinity': self.SIGN_ELEMENTS.get(moon_sign) if moon_sign else None,
            },
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }
    
    def draw_cards(self, question, num_cards=3):
        """Backward compatible basic draw"""
        return self.draw_personalized(question, num_cards, 'general')
    
    def _weight_deck(self, deck, moon_sign=None, dasha_lord=None):
        element = self.SIGN_ELEMENTS.get(moon_sign) if moon_sign else None
        favored_majors = self.DASHA_ARCANA.get(dasha_lord, []) if dasha_lord else []
        
        weighted = []
        for card in deck:
            weight = 1
            if element and card.get('suit') and self.SUIT_ELEMENTS.get(card['suit']) == element:
                weight += 2
            if element and card.get('element') == element:
                weight += 1
            if card.get('number') in favored_majors and card.get('arcana') == 'Major':
                weight += 3
            for _ in range(weight):
                weighted.append(card)
        return weighted

    def _interpret_personalized(self, cards, question, reading_type, moon_sign, dasha_lord, power_score):
        parts = []
        if moon_sign:
            parts.append(f"With your Moon in {moon_sign}, the {self.SIGN_ELEMENTS.get(moon_sign, 'cosmic')} element courses through this reading.")
        if dasha_lord:
            parts.append(f"Under {dasha_lord} Dasha governance, the deck resonates with {dasha_lord}'s frequency.")
        
        for card in cards:
            pos = card.get('position', 'Position')
            name = card['name']
            meaning = card['upright_meaning']
            if reading_type == 'aura':
                parts.append(f"{pos}: {name} — Your spiritual field pulses with {meaning}. This layer of your aura demands conscious attention.")
            elif reading_type == 'career':
                parts.append(f"{pos}: {name} — In the realm of ambition, {meaning}. Strategic execution indicated.")
            elif reading_type == 'energy':
                parts.append(f"{pos}: {name} — During this window, {meaning} governs your energetic flow.")
            elif reading_type == 'love':
                parts.append(f"{pos}: {name} — The heart speaks: {meaning}.")
            else:
                parts.append(f"{pos}: {name} — {meaning}.")
        
        major_count = sum(1 for c in cards if c.get('arcana') == 'Major')
        if major_count >= 2:
            parts.append("Multiple Major Arcana cards signal powerful cosmic forces at play. The universe demands decisive action.")
        if power_score and power_score > 70:
            parts.append(f"Your Power Index of {power_score}% amplifies every card. Execute with full force.")
        elif power_score and power_score < 40:
            parts.append(f"Your Power Index of {power_score}% suggests conservation. Be strategic, not aggressive.")
        return ' '.join(parts)
    
    def _create_full_deck(self):
        deck = []
        for card in self.MAJOR_ARCANA:
            deck.append({
                'name': card['name'], 'arcana': 'Major', 'number': card['number'],
                'element': card.get('element', ''), 'planet': card.get('planet', ''),
                'upright_meaning': card['upright'], 'reversed_meaning': card['reversed'],
            })
        ranks = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King']
        for suit in self.SUITS:
            for rank in ranks:
                deck.append({
                    'name': f'{rank} of {suit}', 'arcana': 'Minor', 'suit': suit,
                    'element': self.SUIT_ELEMENTS[suit],
                    'upright_meaning': self._get_minor_meaning(suit, rank, True),
                    'reversed_meaning': self._get_minor_meaning(suit, rank, False),
                })
        for card in self.ALPHA_STRATEGY_CARDS[:10]:
            deck.append({
                'name': card['name'], 'arcana': 'Alpha Strategy',
                'upright_meaning': card['meaning'],
                'reversed_meaning': f'Blocked: {card["meaning"]}',
            })
        return deck
    
    def _get_minor_meaning(self, suit, rank, upright):
        suit_meanings = {
            'Wands': 'energy, passion, action' if upright else 'delays, frustration',
            'Cups': 'emotions, relationships, feelings' if upright else 'emotional turmoil',
            'Swords': 'intellect, conflict, communication' if upright else 'confusion, arguments',
            'Pentacles': 'material, finances, career' if upright else 'financial loss'
        }
        return f"{rank}: {suit_meanings.get(suit, 'transformation')}"

    def draw_daily_card(self, seed: int) -> dict:
        """Return a single deterministic card of the day based on date seed"""
        rng = random.Random(seed)
        all_cards = list(self.MAJOR_ARCANA) + list(self.ALPHA_STRATEGY_CARDS)
        card_data = rng.choice(all_cards)
        upright = rng.random() > 0.3

        daily_messages = {
            'Fire': 'Take bold action today. Your initiative will be rewarded.',
            'Water': 'Trust your intuition. Emotional clarity guides your path.',
            'Air': 'Communicate your ideas. Mental agility is your strength.',
            'Earth': 'Build something lasting today. Patience yields prosperity.',
        }

        meaning_text = card_data.get('upright', '') if upright else card_data.get('reversed', '')
        if not meaning_text:
            meaning_text = card_data.get('meaning', card_data.get('strategic_meaning', 'Cosmic insight awaits'))

        return {
            'name': card_data.get('name', card_data.get('rank', 'Unknown')),
            'arcana': 'Major' if 'number' in card_data and card_data.get('number', 99) <= 21 else ('Alpha Strategy' if 'strategic_meaning' in card_data else 'Minor'),
            'element': card_data.get('element', 'Earth'),
            'planet': card_data.get('planet', ''),
            'upright': upright,
            'meaning': meaning_text,
            'daily_guidance': daily_messages.get(card_data.get('element', 'Fire'), daily_messages['Fire']),
            'scripture': 'Card of the Day selected via seeded Mersenne Twister (MT19937) keyed to UTC date. Correspondences per Golden Dawn tradition.',
        }
