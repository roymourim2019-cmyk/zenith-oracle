"""
Test suite for Zenith Oracle - Interactive Tarot Module
Tests the new JSON body POST /api/tarot/reading endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTarotReadingEndpoint:
    """Tests for POST /api/tarot/reading with JSON body"""
    
    def test_basic_tarot_reading_3_cards(self):
        """Test basic 3-card tarot reading without personalization"""
        payload = {
            "question": "What strategic insight do I need today?",
            "num_cards": 3,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields
        assert "question" in data
        assert data["question"] == payload["question"]
        assert "reading_type" in data
        assert data["reading_type"] == "general"
        assert "cards" in data
        assert len(data["cards"]) == 3
        assert "positions" in data
        assert len(data["positions"]) == 3
        assert "interpretation" in data
        assert len(data["interpretation"]) > 0
        assert "scripture" in data
        
        # Verify card structure
        for card in data["cards"]:
            assert "name" in card
            assert "arcana" in card
            assert "upright_meaning" in card
            assert "position" in card
        
        print(f"✓ Basic 3-card reading works. Cards: {[c['name'] for c in data['cards']]}")
    
    def test_tarot_reading_5_cards(self):
        """Test 5-card tarot reading"""
        payload = {
            "question": "What is my career path?",
            "num_cards": 5,
            "reading_type": "career"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert len(data["cards"]) == 5
        assert len(data["positions"]) == 5
        assert data["reading_type"] == "career"
        assert "Career" in data["reading_name"]
        
        print(f"✓ 5-card career reading works. Positions: {data['positions']}")
    
    def test_all_reading_types(self):
        """Test all 5 reading types: general, career, aura, energy, love"""
        reading_types = ["general", "career", "aura", "energy", "love"]
        
        for rt in reading_types:
            payload = {
                "question": f"Test question for {rt} reading",
                "num_cards": 3,
                "reading_type": rt
            }
            response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
            
            assert response.status_code == 200, f"Reading type '{rt}' failed: {response.text}"
            data = response.json()
            assert data["reading_type"] == rt
            print(f"✓ Reading type '{rt}' works - {data['reading_name']}")
    
    def test_invalid_reading_type(self):
        """Test that invalid reading type returns 400"""
        payload = {
            "question": "Test question",
            "num_cards": 3,
            "reading_type": "invalid_type"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        assert response.status_code == 400, f"Expected 400 for invalid reading type, got {response.status_code}"
        print("✓ Invalid reading type correctly returns 400")
    
    def test_num_cards_validation_below_minimum(self):
        """Test that num_cards < 3 returns validation error"""
        payload = {
            "question": "Test question",
            "num_cards": 2,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        # Pydantic validation should return 422
        assert response.status_code == 422, f"Expected 422 for num_cards=2, got {response.status_code}"
        print("✓ num_cards < 3 correctly returns 422 validation error")
    
    def test_num_cards_validation_above_maximum(self):
        """Test that num_cards > 5 returns validation error"""
        payload = {
            "question": "Test question",
            "num_cards": 6,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        # Pydantic validation should return 422
        assert response.status_code == 422, f"Expected 422 for num_cards=6, got {response.status_code}"
        print("✓ num_cards > 5 correctly returns 422 validation error")
    
    def test_personalized_reading_with_birth_data(self):
        """Test personalized reading with birth data returns moon_sign, dasha_lord, power_score"""
        payload = {
            "question": "What does my aura reveal?",
            "num_cards": 3,
            "reading_type": "aura",
            "birth_date": "1990-05-20",
            "birth_time": "14:30:00",
            "latitude": 28.6139,
            "longitude": 77.209
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "personalization" in data
        personalization = data["personalization"]
        
        # Verify personalization fields
        assert "moon_sign" in personalization
        assert personalization["moon_sign"] is not None, "moon_sign should not be None with birth data"
        assert "dasha_lord" in personalization
        assert personalization["dasha_lord"] is not None, "dasha_lord should not be None with birth data"
        assert "power_score" in personalization
        assert personalization["power_score"] is not None, "power_score should not be None with birth data"
        assert "element_affinity" in personalization
        
        print(f"✓ Personalized reading works:")
        print(f"  Moon Sign: {personalization['moon_sign']}")
        print(f"  Dasha Lord: {personalization['dasha_lord']}")
        print(f"  Power Score: {personalization['power_score']}")
        print(f"  Element Affinity: {personalization['element_affinity']}")
    
    def test_reading_without_birth_data_has_null_personalization(self):
        """Test that reading without birth data has null personalization values"""
        payload = {
            "question": "General question",
            "num_cards": 3,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        personalization = data.get("personalization", {})
        assert personalization.get("moon_sign") is None
        assert personalization.get("dasha_lord") is None
        assert personalization.get("power_score") is None
        
        print("✓ Reading without birth data has null personalization values")
    
    def test_love_reading_positions(self):
        """Test love reading has correct position labels"""
        payload = {
            "question": "What about my relationship?",
            "num_cards": 3,
            "reading_type": "love"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        expected_positions = ['Your Energy', 'Their Energy', 'Connection Point']
        assert data["positions"] == expected_positions, f"Expected {expected_positions}, got {data['positions']}"
        
        print(f"✓ Love reading has correct positions: {data['positions']}")
    
    def test_energy_reading_positions(self):
        """Test energy reading has correct position labels"""
        payload = {
            "question": "What is my energy today?",
            "num_cards": 3,
            "reading_type": "energy"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        expected_positions = ['Morning Energy', 'Afternoon Shift', 'Evening Resolution']
        assert data["positions"] == expected_positions, f"Expected {expected_positions}, got {data['positions']}"
        
        print(f"✓ Energy reading has correct positions: {data['positions']}")


class TestExistingEndpoints:
    """Verify existing endpoints still work"""
    
    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        
        print(f"✓ Health endpoint works: {data}")
    
    def test_oracle_feed_endpoint(self):
        """Test /api/oracle-feed endpoint"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "transit_alerts" in data
        assert "psychic_update" in data
        assert "historical_parallels" in data
        assert "current_transits" in data
        
        print(f"✓ Oracle feed endpoint works. Transit alerts: {len(data['transit_alerts'])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
