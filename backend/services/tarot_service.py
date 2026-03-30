import random
from typing import List, Dict, Any
from datetime import datetime

class TarotService:
    """Tarot reading service with 78+44 Alpha Strategy cards"""
    
    MAJOR_ARCANA = [
        {'name': 'The Fool', 'number': 0, 'upright': 'New beginnings, spontaneity, innocence', 'reversed': 'Recklessness, risk-taking'},
        {'name': 'The Magician', 'number': 1, 'upright': 'Manifestation, resourcefulness, power', 'reversed': 'Manipulation, poor planning'},
        {'name': 'The High Priestess', 'number': 2, 'upright': 'Intuition, sacred knowledge, divine feminine', 'reversed': 'Secrets, disconnected'},
        {'name': 'The Empress', 'number': 3, 'upright': 'Femininity, beauty, nature, abundance', 'reversed': 'Creative block, dependence'},
        {'name': 'The Emperor', 'number': 4, 'upright': 'Authority, establishment, structure, father figure', 'reversed': 'Domination, control issues'},
        {'name': 'The Hierophant', 'number': 5, 'upright': 'Spiritual wisdom, tradition, conformity', 'reversed': 'Rebellion, subversiveness'},
        {'name': 'The Lovers', 'number': 6, 'upright': 'Love, harmony, relationships, values alignment', 'reversed': 'Disharmony, imbalance'},
        {'name': 'The Chariot', 'number': 7, 'upright': 'Control, willpower, success, action', 'reversed': 'Lack of control, opposition'},
        {'name': 'Strength', 'number': 8, 'upright': 'Strength, courage, persuasion, influence', 'reversed': 'Weakness, self-doubt'},
        {'name': 'The Hermit', 'number': 9, 'upright': 'Soul searching, introspection, inner guidance', 'reversed': 'Isolation, loneliness'},
        {'name': 'Wheel of Fortune', 'number': 10, 'upright': 'Good luck, karma, life cycles, destiny', 'reversed': 'Bad luck, resistance to change'},
        {'name': 'Justice', 'number': 11, 'upright': 'Justice, fairness, truth, cause and effect', 'reversed': 'Unfairness, lack of accountability'},
        {'name': 'The Hanged Man', 'number': 12, 'upright': 'Pause, surrender, letting go, new perspectives', 'reversed': 'Delays, resistance'},
        {'name': 'Death', 'number': 13, 'upright': 'Endings, change, transformation, transition', 'reversed': 'Resistance to change, stagnation'},
        {'name': 'Temperance', 'number': 14, 'upright': 'Balance, moderation, patience, purpose', 'reversed': 'Imbalance, excess'},
        {'name': 'The Devil', 'number': 15, 'upright': 'Shadow self, attachment, addiction, restriction', 'reversed': 'Releasing limiting beliefs'},
        {'name': 'The Tower', 'number': 16, 'upright': 'Sudden change, upheaval, chaos, revelation', 'reversed': 'Personal transformation, avoidance'},
        {'name': 'The Star', 'number': 17, 'upright': 'Hope, faith, purpose, renewal, spirituality', 'reversed': 'Lack of faith, despair'},
        {'name': 'The Moon', 'number': 18, 'upright': 'Illusion, fear, anxiety, subconscious, intuition', 'reversed': 'Release of fear, confusion'},
        {'name': 'The Sun', 'number': 19, 'upright': 'Positivity, fun, warmth, success, vitality', 'reversed': 'Inner child, feeling down'},
        {'name': 'Judgement', 'number': 20, 'upright': 'Judgement, rebirth, inner calling, absolution', 'reversed': 'Self-doubt, inner critic'},
        {'name': 'The World', 'number': 21, 'upright': 'Completion, accomplishment, travel, achievement', 'reversed': 'Seeking closure, delays'}
    ]
    
    SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles']
    
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
    
    def __init__(self):
        random.seed()
    
    def draw_cards(self, question: str, num_cards: int = 3) -> Dict[str, Any]:
        """Draw tarot cards for a reading"""
        deck = self._create_full_deck()
        random.shuffle(deck)
        
        drawn_cards = deck[:num_cards]
        
        interpretation = self._interpret_cards(drawn_cards, question)
        
        return {
            'question': question,
            'spread_type': f'{num_cards}-Card Spread',
            'cards': drawn_cards,
            'interpretation': interpretation,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _create_full_deck(self) -> List[Dict[str, Any]]:
        """Create full tarot deck with Alpha Strategy cards"""
        deck = []
        
        for card in self.MAJOR_ARCANA:
            deck.append({
                'name': card['name'],
                'arcana': 'Major',
                'number': card['number'],
                'upright_meaning': card['upright'],
                'reversed_meaning': card['reversed'],
                'image_url': f'/images/tarot/major_{card["number"]}.png'
            })
        
        ranks = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King']
        for suit in self.SUITS:
            for rank in ranks:
                deck.append({
                    'name': f'{rank} of {suit}',
                    'arcana': 'Minor',
                    'suit': suit,
                    'upright_meaning': self._get_minor_meaning(suit, rank, True),
                    'reversed_meaning': self._get_minor_meaning(suit, rank, False),
                    'image_url': f'/images/tarot/{suit.lower()}_{rank.lower()}.png'
                })
        
        for card in self.ALPHA_STRATEGY_CARDS[:10]:
            deck.append({
                'name': card['name'],
                'arcana': 'Alpha Strategy',
                'upright_meaning': card['meaning'],
                'reversed_meaning': f'Blocked: {card["meaning"]}',
                'image_url': f'/images/tarot/alpha_{card["name"].lower().replace(" ", "_")}.png'
            })
        
        return deck
    
    def _get_minor_meaning(self, suit: str, rank: str, upright: bool) -> str:
        """Generate meaning for minor arcana cards"""
        suit_meanings = {
            'Wands': 'energy, passion, action' if upright else 'delays, frustration',
            'Cups': 'emotions, relationships, feelings' if upright else 'emotional turmoil',
            'Swords': 'intellect, conflict, communication' if upright else 'confusion, arguments',
            'Pentacles': 'material, finances, career' if upright else 'financial loss'
        }
        return f"{rank}: {suit_meanings.get(suit, 'transformation')}"
    
    def _interpret_cards(self, cards: List[Dict], question: str) -> str:
        """Generate interpretation for drawn cards"""
        if len(cards) == 1:
            return f"For '{question}': {cards[0]['name']} indicates {cards[0]['upright_meaning']}. This is your singular focus point."
        
        elif len(cards) == 3:
            return f"Past: {cards[0]['name']} - {cards[0]['upright_meaning']}. Present: {cards[1]['name']} - {cards[1]['upright_meaning']}. Future: {cards[2]['name']} - {cards[2]['upright_meaning']}. This progression suggests a journey from foundation to action."
        
        else:
            card_names = ', '.join(c['name'] for c in cards)
            return f"The cards {card_names} weave together to answer '{question}' with a message of transformation and strategic action."