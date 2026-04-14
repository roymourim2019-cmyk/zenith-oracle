"""
Test Daily Oracle Features - Iteration 10
Tests for:
- GET /api/daily-oracle endpoint
- GET /api/daily-tarot-card endpoint
- POST /api/payment/create-order returns 404 (payment removed)
- Regression tests for existing endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_BIRTH_INFO = {
    "name": "Roy Alpha",
    "birth_date": "1990-06-15",
    "birth_time": "12:00:00",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone_offset": 5.5
}


class TestDailyOracleEndpoint:
    """Tests for GET /api/daily-oracle endpoint"""
    
    def test_daily_oracle_returns_200(self):
        """Daily oracle endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/daily-oracle returns 200")
    
    def test_daily_oracle_has_required_fields(self):
        """Daily oracle should have all required fields"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        # Check top-level fields
        required_fields = ['date', 'day_number', 'moon_sign', 'sun_sign', 'moon_element', 
                          'energy_level', 'theme', 'transits', 'teaser', 'extended', 'scripture']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        print("✓ Daily oracle has all required top-level fields")
    
    def test_daily_oracle_energy_level_valid(self):
        """Energy level should be between 20 and 98"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        energy = data.get('energy_level')
        assert isinstance(energy, int), f"Energy level should be int, got {type(energy)}"
        assert 20 <= energy <= 98, f"Energy level {energy} out of range [20, 98]"
        print(f"✓ Energy level is valid: {energy}%")
    
    def test_daily_oracle_teaser_fields(self):
        """Teaser should have headline, summary, lucky_number, lucky_color"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        teaser = data.get('teaser', {})
        teaser_fields = ['headline', 'summary', 'lucky_number', 'lucky_color']
        for field in teaser_fields:
            assert field in teaser, f"Missing teaser field: {field}"
        
        assert isinstance(teaser['lucky_number'], int), "lucky_number should be int"
        assert isinstance(teaser['lucky_color'], str), "lucky_color should be string"
        print(f"✓ Teaser fields valid: lucky_number={teaser['lucky_number']}, lucky_color={teaser['lucky_color']}")
    
    def test_daily_oracle_extended_fields(self):
        """Extended reading should have career, love, health, wealth, best_hours, avoid_hours, mantra"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        extended = data.get('extended', {})
        extended_fields = ['career', 'love', 'health', 'wealth', 'best_hours', 'avoid_hours', 'mantra']
        for field in extended_fields:
            assert field in extended, f"Missing extended field: {field}"
            assert isinstance(extended[field], str), f"Extended {field} should be string"
            assert len(extended[field]) > 0, f"Extended {field} should not be empty"
        print("✓ Extended reading has all required fields with content")
    
    def test_daily_oracle_transits_has_7_planets(self):
        """Transits should have 7 planets with sign, degree, speed"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        transits = data.get('transits', {})
        expected_planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
        
        for planet in expected_planets:
            assert planet in transits, f"Missing planet in transits: {planet}"
            planet_data = transits[planet]
            assert 'sign' in planet_data, f"{planet} missing sign"
            assert 'degree' in planet_data, f"{planet} missing degree"
            assert 'speed' in planet_data, f"{planet} missing speed"
        
        print(f"✓ Transits has all 7 planets: {list(transits.keys())}")
    
    def test_daily_oracle_scripture_present(self):
        """Scripture field should be present and non-empty"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        scripture = data.get('scripture', '')
        assert isinstance(scripture, str), "Scripture should be string"
        assert len(scripture) > 0, "Scripture should not be empty"
        assert 'Swiss Ephemeris' in scripture, "Scripture should mention Swiss Ephemeris"
        print(f"✓ Scripture present: {scripture[:80]}...")


class TestDailyTarotCardEndpoint:
    """Tests for GET /api/daily-tarot-card endpoint"""
    
    def test_daily_tarot_card_returns_200(self):
        """Daily tarot card endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/daily-tarot-card")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/daily-tarot-card returns 200")
    
    def test_daily_tarot_card_has_required_fields(self):
        """Daily tarot card should have name, arcana, element, upright, meaning, daily_guidance, scripture"""
        response = requests.get(f"{BASE_URL}/api/daily-tarot-card")
        data = response.json()
        
        required_fields = ['name', 'arcana', 'element', 'upright', 'meaning', 'daily_guidance', 'scripture']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print(f"✓ Daily tarot card has all required fields")
    
    def test_daily_tarot_card_data_types(self):
        """Verify data types of daily tarot card fields"""
        response = requests.get(f"{BASE_URL}/api/daily-tarot-card")
        data = response.json()
        
        assert isinstance(data['name'], str), "name should be string"
        assert isinstance(data['arcana'], str), "arcana should be string"
        assert isinstance(data['element'], str), "element should be string"
        assert isinstance(data['upright'], bool), "upright should be boolean"
        assert isinstance(data['meaning'], str), "meaning should be string"
        assert isinstance(data['daily_guidance'], str), "daily_guidance should be string"
        assert isinstance(data['scripture'], str), "scripture should be string"
        
        print(f"✓ Daily tarot card: {data['name']} ({data['arcana']} Arcana, {'Upright' if data['upright'] else 'Reversed'})")


class TestPaymentRemoval:
    """Tests to verify payment endpoints are removed (404)"""
    
    def test_payment_create_order_returns_404(self):
        """POST /api/payment/create-order should return 404"""
        response = requests.post(f"{BASE_URL}/api/payment/create-order", json={"amount": 100})
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ POST /api/payment/create-order returns 404 (payment removed)")
    
    def test_payment_verify_returns_404(self):
        """POST /api/payment/verify should return 404"""
        response = requests.post(f"{BASE_URL}/api/payment/verify", json={"order_id": "test"})
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ POST /api/payment/verify returns 404 (payment removed)")


class TestRegressionVedicBirthChart:
    """Regression tests for POST /api/vedic/birth-chart"""
    
    def test_vedic_birth_chart_works(self):
        """Vedic birth chart should still work"""
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=TEST_BIRTH_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'planets' in data, "Missing planets in response"
        assert 'ascendant_sign' in data, "Missing ascendant_sign"
        assert 'dasha_lord' in data, "Missing dasha_lord"
        assert 'power_score' in data, "Missing power_score"
        
        print(f"✓ POST /api/vedic/birth-chart works: Ascendant={data['ascendant_sign']}, Dasha={data['dasha_lord']}")


class TestRegressionTarotReading:
    """Regression tests for POST /api/tarot/reading"""
    
    def test_tarot_reading_works(self):
        """Tarot reading should still work"""
        payload = {
            "question": "What does today hold?",
            "num_cards": 3,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'cards' in data, "Missing cards in response"
        assert len(data['cards']) == 3, f"Expected 3 cards, got {len(data['cards'])}"
        assert 'interpretation' in data, "Missing interpretation"
        
        print(f"✓ POST /api/tarot/reading works: {len(data['cards'])} cards drawn")


class TestRegressionChineseCalculate:
    """Regression tests for POST /api/chinese/calculate"""
    
    def test_chinese_calculate_works(self):
        """Chinese astrology should still work"""
        response = requests.post(f"{BASE_URL}/api/chinese/calculate", json=TEST_BIRTH_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'animal_sign' in data, "Missing animal_sign"
        assert 'element' in data, "Missing element"
        
        print(f"✓ POST /api/chinese/calculate works: {data['animal_sign']} ({data['element']})")


class TestRegressionNumerologyCalculate:
    """Regression tests for POST /api/numerology/calculate"""
    
    def test_numerology_calculate_works(self):
        """Numerology should still work"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json=TEST_BIRTH_INFO)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'chaldean_number' in data, "Missing chaldean_number"
        assert 'pythagorean_number' in data, "Missing pythagorean_number"
        
        print(f"✓ POST /api/numerology/calculate works: Chaldean={data['chaldean_number']}, Pythagorean={data['pythagorean_number']}")


class TestHealthAndRoot:
    """Basic health and root endpoint tests"""
    
    def test_health_endpoint(self):
        """Health endpoint should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        print("✓ GET /api/health returns healthy")
    
    def test_root_endpoint(self):
        """Root endpoint should return API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert 'message' in data
        print("✓ GET /api/ returns API info")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
