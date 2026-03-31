"""
Test suite for Zenith Oracle Astrology Sections
Tests: Vedic Chart, Western Chart, Chinese Astrology, Numerology Calculator
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://power-meter-12.preview.emergentagent.com')

# Test data as specified in the review request
TEST_BIRTH_INFO = {
    "name": "Roy Alpha",
    "birth_date": "1990-06-15",
    "birth_time": "10:30:00",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone_offset": 5.5
}

# Chinese astrology only needs birth_date
TEST_CHINESE_INFO = {
    "name": "User",
    "birth_date": "1990-06-15",
    "birth_time": "12:00:00",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone_offset": 5.5
}

# Numerology needs name + birth_date
TEST_NUMEROLOGY_INFO = {
    "name": "Roy Alpha",
    "birth_date": "1990-06-15",
    "birth_time": "12:00:00",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone_offset": 5.5
}


class TestHealthEndpoint:
    """Basic health check to ensure API is running"""
    
    def test_health_check(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health check passed: {data}")


class TestVedicChartAPI:
    """Tests for Vedic Chart endpoints"""
    
    def test_vedic_birth_chart_success(self):
        """POST /api/vedic/birth-chart returns valid chart with planets, ascendant, dasha_lord, power_score"""
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=TEST_BIRTH_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify required fields
        assert "person_name" in data, "Missing person_name"
        assert data["person_name"] == "Roy Alpha"
        
        assert "planets" in data, "Missing planets"
        assert isinstance(data["planets"], list), "planets should be a list"
        assert len(data["planets"]) >= 7, f"Expected at least 7 planets, got {len(data['planets'])}"
        
        # Check planet structure
        for planet in data["planets"]:
            assert "name" in planet, "Planet missing name"
            assert "longitude" in planet, "Planet missing longitude"
            assert "sign" in planet, "Planet missing sign"
            assert "degree_in_sign" in planet, "Planet missing degree_in_sign"
            assert "retrograde" in planet, "Planet missing retrograde"
        
        assert "ascendant" in data, "Missing ascendant"
        assert isinstance(data["ascendant"], (int, float)), "ascendant should be numeric"
        
        assert "ascendant_sign" in data, "Missing ascendant_sign"
        
        assert "dasha_lord" in data, "Missing dasha_lord"
        assert data["dasha_lord"] in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
        
        assert "power_score" in data, "Missing power_score"
        assert 0 <= data["power_score"] <= 100, f"power_score should be 0-100, got {data['power_score']}"
        
        assert "lunar_mansion" in data, "Missing lunar_mansion (nakshatra)"
        assert "ayanamsha" in data, "Missing ayanamsha"
        assert "julian_day" in data, "Missing julian_day"
        
        print(f"✓ Vedic birth chart: Ascendant={data['ascendant_sign']}, Dasha Lord={data['dasha_lord']}, Power Score={data['power_score']}")
    
    def test_vedic_dasha_periods_success(self):
        """POST /api/vedic/dasha-periods returns valid dasha periods"""
        response = requests.post(f"{BASE_URL}/api/vedic/dasha-periods", json=TEST_BIRTH_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "periods" in data, "Missing periods"
        assert isinstance(data["periods"], list), "periods should be a list"
        assert len(data["periods"]) >= 1, "Should have at least 1 dasha period"
        
        # Check period structure
        for period in data["periods"]:
            assert "lord" in period, "Period missing lord"
            assert "start_date" in period, "Period missing start_date"
            assert "end_date" in period, "Period missing end_date"
            assert "duration_years" in period, "Period missing duration_years"
            assert "is_current" in period, "Period missing is_current"
        
        # At least one should be current
        current_periods = [p for p in data["periods"] if p["is_current"]]
        assert len(current_periods) >= 1, "Should have at least one current dasha period"
        
        print(f"✓ Vedic dasha periods: {len(data['periods'])} periods, current lord={current_periods[0]['lord']}")
    
    def test_vedic_pancha_pakshi_success(self):
        """POST /api/vedic/pancha-pakshi returns valid pancha-pakshi data"""
        response = requests.post(f"{BASE_URL}/api/vedic/pancha-pakshi", json=TEST_BIRTH_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        assert "pancha_pakshi" in data, "Missing pancha_pakshi"
        pakshi = data["pancha_pakshi"]
        
        assert "birth_bird" in pakshi, "Missing birth_bird"
        assert pakshi["birth_bird"] in ["Vulture", "Owl", "Crow", "Cock", "Peacock"]
        
        assert "current_state" in pakshi, "Missing current_state"
        assert pakshi["current_state"] in ["Ruling", "Eating", "Walking", "Sleeping", "Dying"]
        
        assert "power_level" in pakshi, "Missing power_level"
        assert 0 <= pakshi["power_level"] <= 100
        
        assert "strategic_guidance" in pakshi, "Missing strategic_guidance"
        
        print(f"✓ Pancha-Pakshi: Bird={pakshi['birth_bird']}, State={pakshi['current_state']}, Power={pakshi['power_level']}%")


class TestWesternChartAPI:
    """Tests for Western Chart endpoints"""
    
    def test_western_birth_chart_success(self):
        """POST /api/western/birth-chart returns valid chart with planets, ascendant_sign, midheaven_sign, houses"""
        response = requests.post(f"{BASE_URL}/api/western/birth-chart", json=TEST_BIRTH_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify required fields
        assert "planets" in data, "Missing planets"
        assert isinstance(data["planets"], list), "planets should be a list"
        assert len(data["planets"]) >= 10, f"Expected at least 10 planets (including outer), got {len(data['planets'])}"
        
        # Check planet structure
        for planet in data["planets"]:
            assert "name" in planet, "Planet missing name"
            assert "longitude" in planet, "Planet missing longitude"
            assert "sign" in planet, "Planet missing sign"
            assert "degree_in_sign" in planet, "Planet missing degree_in_sign"
            assert "retrograde" in planet, "Planet missing retrograde"
        
        assert "ascendant" in data, "Missing ascendant"
        assert "ascendant_sign" in data, "Missing ascendant_sign"
        
        assert "midheaven" in data, "Missing midheaven"
        assert "midheaven_sign" in data, "Missing midheaven_sign"
        
        assert "houses" in data, "Missing houses"
        assert isinstance(data["houses"], list), "houses should be a list"
        assert len(data["houses"]) == 12, f"Expected 12 houses, got {len(data['houses'])}"
        
        assert "julian_day" in data, "Missing julian_day"
        
        print(f"✓ Western birth chart: ASC={data['ascendant_sign']}, MC={data['midheaven_sign']}, {len(data['planets'])} planets")


class TestChineseAstrologyAPI:
    """Tests for Chinese Astrology endpoints"""
    
    def test_chinese_calculate_success(self):
        """POST /api/chinese/calculate returns animal_sign, element, yin_yang, personality_traits, compatible_signs"""
        response = requests.post(f"{BASE_URL}/api/chinese/calculate", json=TEST_CHINESE_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify required fields
        assert "animal_sign" in data, "Missing animal_sign"
        valid_animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
        assert data["animal_sign"] in valid_animals, f"Invalid animal_sign: {data['animal_sign']}"
        
        assert "element" in data, "Missing element"
        valid_elements = ["Metal", "Water", "Wood", "Fire", "Earth"]
        assert data["element"] in valid_elements, f"Invalid element: {data['element']}"
        
        assert "yin_yang" in data, "Missing yin_yang"
        assert data["yin_yang"] in ["Yin", "Yang"], f"Invalid yin_yang: {data['yin_yang']}"
        
        assert "personality_traits" in data, "Missing personality_traits"
        assert isinstance(data["personality_traits"], list), "personality_traits should be a list"
        assert len(data["personality_traits"]) >= 3, "Should have at least 3 personality traits"
        
        assert "compatible_signs" in data, "Missing compatible_signs"
        assert isinstance(data["compatible_signs"], list), "compatible_signs should be a list"
        assert len(data["compatible_signs"]) >= 2, "Should have at least 2 compatible signs"
        
        assert "lucky_numbers" in data, "Missing lucky_numbers"
        assert isinstance(data["lucky_numbers"], list), "lucky_numbers should be a list"
        
        assert "lucky_colors" in data, "Missing lucky_colors"
        assert isinstance(data["lucky_colors"], list), "lucky_colors should be a list"
        
        # 1990 is Year of the Horse (Metal)
        assert data["animal_sign"] == "Horse", f"1990 should be Horse, got {data['animal_sign']}"
        assert data["element"] == "Metal", f"1990 should be Metal, got {data['element']}"
        assert data["yin_yang"] == "Yang", f"1990 should be Yang, got {data['yin_yang']}"
        
        print(f"✓ Chinese astrology: {data['animal_sign']} ({data['element']}, {data['yin_yang']}), traits={data['personality_traits'][:3]}")


class TestNumerologyAPI:
    """Tests for Numerology endpoints"""
    
    def test_numerology_calculate_success(self):
        """POST /api/numerology/calculate returns chaldean_number, pythagorean_number, vedic_number, interpretation"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json=TEST_NUMEROLOGY_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify required fields
        assert "name" in data, "Missing name"
        assert data["name"] == "Roy Alpha"
        
        assert "birth_date" in data, "Missing birth_date"
        
        assert "chaldean_number" in data, "Missing chaldean_number"
        assert isinstance(data["chaldean_number"], int), "chaldean_number should be int"
        assert 1 <= data["chaldean_number"] <= 9, f"chaldean_number should be 1-9, got {data['chaldean_number']}"
        
        assert "pythagorean_number" in data, "Missing pythagorean_number"
        assert isinstance(data["pythagorean_number"], int), "pythagorean_number should be int"
        # Pythagorean can be 1-9 or master numbers 11, 22, 33
        valid_pyth = list(range(1, 10)) + [11, 22, 33]
        assert data["pythagorean_number"] in valid_pyth, f"Invalid pythagorean_number: {data['pythagorean_number']}"
        
        assert "vedic_number" in data, "Missing vedic_number"
        assert isinstance(data["vedic_number"], int), "vedic_number should be int"
        assert 1 <= data["vedic_number"] <= 9, f"vedic_number should be 1-9, got {data['vedic_number']}"
        
        # Birth date is 1990-06-15, day=15, 1+5=6
        assert data["vedic_number"] == 6, f"Vedic number for day 15 should be 6, got {data['vedic_number']}"
        
        assert "interpretation" in data, "Missing interpretation"
        assert isinstance(data["interpretation"], str), "interpretation should be string"
        
        assert "lucky_numbers" in data, "Missing lucky_numbers"
        assert isinstance(data["lucky_numbers"], list), "lucky_numbers should be a list"
        
        assert "lucky_colors" in data, "Missing lucky_colors"
        assert isinstance(data["lucky_colors"], list), "lucky_colors should be a list"
        
        print(f"✓ Numerology: Chaldean={data['chaldean_number']}, Pythagorean={data['pythagorean_number']}, Vedic={data['vedic_number']}")


class TestTarotRegression:
    """Regression test for Tarot module (verified in iteration_7)"""
    
    def test_tarot_reading_still_works(self):
        """POST /api/tarot/reading should still work (regression)"""
        payload = {
            "question": "What does the future hold?",
            "num_cards": 3,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        assert response.status_code == 200, f"Tarot regression failed: {response.status_code}: {response.text}"
        
        data = response.json()
        assert "cards" in data, "Missing cards in tarot response"
        assert len(data["cards"]) == 3, f"Expected 3 cards, got {len(data['cards'])}"
        
        print(f"✓ Tarot regression: 3-card reading works, cards={[c['name'] for c in data['cards']]}")


class TestInputValidation:
    """Test input validation for all endpoints"""
    
    def test_vedic_missing_required_fields(self):
        """Vedic endpoint should validate required fields"""
        # Missing birth_time
        payload = {
            "name": "Test",
            "birth_date": "1990-06-15",
            "latitude": 28.6139,
            "longitude": 77.209
        }
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=payload)
        assert response.status_code == 422, f"Expected 422 for missing birth_time, got {response.status_code}"
        print("✓ Vedic validation: Missing birth_time returns 422")
    
    def test_chinese_missing_birth_date(self):
        """Chinese endpoint should validate birth_date"""
        payload = {
            "name": "Test",
            "birth_time": "12:00:00",
            "latitude": 28.6139,
            "longitude": 77.209
        }
        response = requests.post(f"{BASE_URL}/api/chinese/calculate", json=payload)
        assert response.status_code == 422, f"Expected 422 for missing birth_date, got {response.status_code}"
        print("✓ Chinese validation: Missing birth_date returns 422")
    
    def test_numerology_missing_name(self):
        """Numerology endpoint should validate name"""
        payload = {
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 28.6139,
            "longitude": 77.209
        }
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json=payload)
        assert response.status_code == 422, f"Expected 422 for missing name, got {response.status_code}"
        print("✓ Numerology validation: Missing name returns 422")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
