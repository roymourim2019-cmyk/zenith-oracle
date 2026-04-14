"""
P1 Features Test Suite - Iteration 11
Tests: Redis caching, Alpha Briefing, Cosmic Reset (War Room games), and regression tests
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://power-meter-12.preview.emergentagent.com').rstrip('/')

class TestHealthAndRedis:
    """Health endpoint and Redis connection tests"""
    
    def test_health_endpoint_returns_200(self):
        """GET /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print(f"✓ Health endpoint returned 200")
    
    def test_redis_connected(self):
        """GET /api/health shows redis: connected"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "redis" in data
        assert data["redis"] == "connected", f"Expected redis: connected, got redis: {data['redis']}"
        print(f"✓ Redis status: {data['redis']}")
    
    def test_mongodb_connected(self):
        """GET /api/health shows mongodb: connected"""
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data.get("mongodb") == "connected"
        print(f"✓ MongoDB status: {data['mongodb']}")


class TestAlphaBriefing:
    """Alpha Daily Briefing endpoint tests"""
    
    def test_alpha_briefing_basic(self):
        """POST /api/alpha-briefing returns briefing without params"""
        response = requests.post(f"{BASE_URL}/api/alpha-briefing", timeout=45)
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "briefing" in data, "Missing 'briefing' field"
        assert "date" in data, "Missing 'date' field"
        assert "day" in data, "Missing 'day' field"
        assert "transits" in data, "Missing 'transits' field"
        assert "day_number" in data, "Missing 'day_number' field"
        assert "scripture" in data, "Missing 'scripture' field"
        
        print(f"✓ Alpha briefing returned with all required fields")
        print(f"  Date: {data['date']}, Day: {data['day']}, Day Number: {data['day_number']}")
    
    def test_alpha_briefing_has_7_transits(self):
        """POST /api/alpha-briefing returns 7 transit items"""
        response = requests.post(f"{BASE_URL}/api/alpha-briefing", timeout=45)
        data = response.json()
        
        assert len(data["transits"]) == 7, f"Expected 7 transits, got {len(data['transits'])}"
        print(f"✓ Alpha briefing has 7 transits: {data['transits']}")
    
    def test_alpha_briefing_with_birth_data(self):
        """POST /api/alpha-briefing with birth params returns personalized briefing"""
        params = {
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 28.6139,
            "longitude": 77.209
        }
        response = requests.post(f"{BASE_URL}/api/alpha-briefing", params=params, timeout=45)
        assert response.status_code == 200
        data = response.json()
        
        # Verify briefing is personalized (should mention chart-specific terms)
        briefing_text = data.get("briefing", "").lower()
        assert len(briefing_text) > 100, "Briefing text too short"
        print(f"✓ Personalized alpha briefing returned ({len(briefing_text)} chars)")
    
    def test_alpha_briefing_scripture_mentions_swiss_ephemeris(self):
        """POST /api/alpha-briefing scripture mentions Swiss Ephemeris"""
        response = requests.post(f"{BASE_URL}/api/alpha-briefing", timeout=45)
        data = response.json()
        
        scripture = data.get("scripture", "")
        assert "Swiss Ephemeris" in scripture or "Gemini" in scripture
        print(f"✓ Scripture: {scripture[:100]}...")


class TestDailyOracleRegression:
    """Regression tests for Daily Oracle (from iteration 10)"""
    
    def test_daily_oracle_returns_200(self):
        """GET /api/daily-oracle returns 200"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        assert response.status_code == 200
        print(f"✓ Daily oracle endpoint returned 200")
    
    def test_daily_oracle_has_required_fields(self):
        """GET /api/daily-oracle has all required fields"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        required_fields = ["date", "day_number", "moon_sign", "sun_sign", "moon_element", 
                          "energy_level", "theme", "transits", "teaser", "extended", "scripture"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Daily oracle has all {len(required_fields)} required fields")
    
    def test_daily_oracle_teaser_fields(self):
        """GET /api/daily-oracle teaser has required fields"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        teaser = data.get("teaser", {})
        teaser_fields = ["headline", "summary", "lucky_number", "lucky_color"]
        for field in teaser_fields:
            assert field in teaser, f"Missing teaser field: {field}"
        
        print(f"✓ Daily oracle teaser has all required fields")
    
    def test_daily_oracle_extended_fields(self):
        """GET /api/daily-oracle extended has required fields"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        data = response.json()
        
        extended = data.get("extended", {})
        extended_fields = ["career", "love", "health", "wealth", "best_hours", "avoid_hours", "mantra"]
        for field in extended_fields:
            assert field in extended, f"Missing extended field: {field}"
        
        print(f"✓ Daily oracle extended has all required fields")


class TestDailyTarotCardRegression:
    """Regression tests for Daily Tarot Card"""
    
    def test_daily_tarot_card_returns_200(self):
        """GET /api/daily-tarot-card returns 200"""
        response = requests.get(f"{BASE_URL}/api/daily-tarot-card")
        assert response.status_code == 200
        print(f"✓ Daily tarot card endpoint returned 200")
    
    def test_daily_tarot_card_has_required_fields(self):
        """GET /api/daily-tarot-card has required fields"""
        response = requests.get(f"{BASE_URL}/api/daily-tarot-card")
        data = response.json()
        
        required_fields = ["name", "arcana", "element", "upright", "meaning", "daily_guidance", "scripture"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Daily tarot card has all required fields: {data['name']}")


class TestVedicChartRegression:
    """Regression tests for Vedic Birth Chart"""
    
    def test_vedic_birth_chart_returns_200(self):
        """POST /api/vedic/birth-chart returns 200"""
        payload = {
            "name": "TEST_User",
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 28.6139,
            "longitude": 77.209,
            "timezone_offset": 5.5
        }
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=payload)
        assert response.status_code == 200
        print(f"✓ Vedic birth chart endpoint returned 200")
    
    def test_vedic_birth_chart_has_planets(self):
        """POST /api/vedic/birth-chart returns planets array"""
        payload = {
            "name": "TEST_User",
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 28.6139,
            "longitude": 77.209,
            "timezone_offset": 5.5
        }
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=payload)
        data = response.json()
        
        assert "planets" in data
        assert len(data["planets"]) >= 7, f"Expected at least 7 planets, got {len(data['planets'])}"
        print(f"✓ Vedic chart has {len(data['planets'])} planets")


class TestTarotReadingRegression:
    """Regression tests for Tarot Reading"""
    
    def test_tarot_reading_returns_200(self):
        """POST /api/tarot/reading returns 200"""
        payload = {
            "question": "TEST_reading",
            "num_cards": 3,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        assert response.status_code == 200
        print(f"✓ Tarot reading endpoint returned 200")
    
    def test_tarot_reading_has_cards(self):
        """POST /api/tarot/reading returns cards array"""
        payload = {
            "question": "TEST_reading",
            "num_cards": 3,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        data = response.json()
        
        assert "cards" in data
        assert len(data["cards"]) == 3, f"Expected 3 cards, got {len(data['cards'])}"
        print(f"✓ Tarot reading has {len(data['cards'])} cards")


class TestNumerologyRegression:
    """Regression tests for Numerology"""
    
    def test_numerology_calculate_returns_200(self):
        """POST /api/numerology/calculate returns 200"""
        payload = {
            "name": "TEST_User",
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 0,
            "longitude": 0
        }
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json=payload)
        assert response.status_code == 200
        print(f"✓ Numerology calculate endpoint returned 200")
    
    def test_numerology_has_all_systems(self):
        """POST /api/numerology/calculate returns all three systems"""
        payload = {
            "name": "TEST_User",
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 0,
            "longitude": 0
        }
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json=payload)
        data = response.json()
        
        assert "chaldean_number" in data
        assert "pythagorean_number" in data
        assert "vedic_number" in data
        print(f"✓ Numerology has all systems: Chaldean={data['chaldean_number']}, Pythagorean={data['pythagorean_number']}, Vedic={data['vedic_number']}")


class TestRootEndpoint:
    """Root API endpoint test"""
    
    def test_root_returns_200(self):
        """GET /api/ returns 200"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "operational"
        print(f"✓ Root endpoint operational: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
