"""
Iteration 12 Backend Tests - Zenith Oracle
Testing: API endpoints, Swiss Ephemeris calculations, Daily Oracle, Oracle Feed
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Health check and basic API tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "mongodb" in data
        print(f"Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert "Zenith Oracle" in data["message"]
        print(f"Root endpoint passed: {data}")


class TestDailyOracleAPI:
    """Daily Oracle endpoint tests - real Swiss Ephemeris data"""
    
    def test_daily_oracle_returns_data(self):
        """Test /api/daily-oracle returns real transit data"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "date" in data
        assert "day_number" in data
        assert "moon_sign" in data
        assert "sun_sign" in data
        assert "moon_element" in data
        assert "energy_level" in data
        assert "theme" in data
        assert "transits" in data
        assert "teaser" in data
        assert "extended" in data
        assert "scripture" in data
        
        # Validate transit data structure
        transits = data["transits"]
        assert "Sun" in transits
        assert "Moon" in transits
        assert "Mercury" in transits
        assert "Venus" in transits
        assert "Mars" in transits
        assert "Jupiter" in transits
        assert "Saturn" in transits
        
        # Validate each planet has sign and degree
        for planet, info in transits.items():
            assert "sign" in info
            assert "degree" in info
            assert "speed" in info
        
        # Validate teaser structure
        teaser = data["teaser"]
        assert "headline" in teaser
        assert "summary" in teaser
        assert "lucky_number" in teaser
        assert "lucky_color" in teaser
        
        # Validate extended structure
        extended = data["extended"]
        assert "career" in extended
        assert "love" in extended
        assert "health" in extended
        assert "wealth" in extended
        assert "best_hours" in extended
        assert "avoid_hours" in extended
        assert "mantra" in extended
        
        print(f"Daily Oracle passed - Moon in {data['moon_sign']}, Energy: {data['energy_level']}%")


class TestOracleFeedAPI:
    """Oracle Feed endpoint tests - live transit data"""
    
    def test_oracle_feed_returns_data(self):
        """Test /api/oracle-feed returns live transit data"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "generated_at" in data
        assert "transit_alerts" in data
        assert "psychic_update" in data
        assert "current_transits" in data
        
        # Validate current_transits structure
        transits = data["current_transits"]
        assert "Sun" in transits
        assert "Moon" in transits
        
        # Validate each planet has nakshatra data
        for planet, info in transits.items():
            assert "sign" in info
            assert "degree" in info
            assert "nakshatra" in info
            assert "pada" in info
        
        # Validate psychic_update
        psychic = data["psychic_update"]
        assert "collective_energy_rating" in psychic
        assert "moon_phase" in psychic
        assert "guidance" in psychic
        
        print(f"Oracle Feed passed - Moon Phase: {psychic['moon_phase']}, Energy: {psychic['collective_energy_rating']}")


class TestDailyTarotCard:
    """Daily Tarot Card endpoint tests"""
    
    def test_daily_tarot_card(self):
        """Test /api/daily-tarot-card returns card of the day"""
        response = requests.get(f"{BASE_URL}/api/daily-tarot-card")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "name" in data
        assert "arcana" in data
        assert "element" in data
        assert "upright" in data
        assert "meaning" in data
        assert "daily_guidance" in data
        
        print(f"Daily Tarot Card passed - Card: {data['name']}, Arcana: {data['arcana']}")


class TestVedicChartAPI:
    """Vedic Chart endpoint tests - Swiss Ephemeris calculations"""
    
    def test_vedic_birth_chart(self):
        """Test /api/vedic/birth-chart returns accurate chart data"""
        payload = {
            "name": "TEST_User",
            "birth_date": "1990-06-15",
            "birth_time": "10:30:00",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "timezone_offset": 5.5
        }
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "person_name" in data
        assert "julian_day" in data
        assert "chart_type" in data
        assert "planets" in data
        assert "ascendant" in data
        assert "ascendant_sign" in data
        assert "ayanamsha" in data
        assert "lunar_mansion" in data
        assert "dasha_lord" in data
        assert "power_score" in data
        
        # Validate planets array
        planets = data["planets"]
        assert len(planets) >= 7  # At least 7 planets
        
        for planet in planets:
            assert "name" in planet
            assert "sign" in planet
            assert "longitude" in planet
            assert "degree_in_sign" in planet
        
        print(f"Vedic Chart passed - Ascendant: {data['ascendant_sign']}, Dasha: {data['dasha_lord']}")


class TestNumerologyAPI:
    """Numerology endpoint tests"""
    
    def test_numerology_calculate(self):
        """Test /api/numerology/calculate returns numerology data"""
        payload = {
            "name": "TEST_User",
            "birth_date": "1990-06-15",
            "birth_time": "10:30:00",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "timezone_offset": 5.5
        }
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields (Chaldean, Pythagorean, Vedic triple-system)
        assert "chaldean_number" in data
        assert "pythagorean_number" in data
        assert "vedic_number" in data
        assert "interpretation" in data
        assert "lucky_numbers" in data
        assert "lucky_colors" in data
        
        print(f"Numerology passed - Chaldean: {data['chaldean_number']}, Pythagorean: {data['pythagorean_number']}, Vedic: {data['vedic_number']}")


class TestTarotReadingAPI:
    """Tarot Reading endpoint tests"""
    
    def test_tarot_reading(self):
        """Test /api/tarot/reading returns tarot reading"""
        payload = {
            "question": "What does today hold?",
            "num_cards": 3,
            "reading_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "cards" in data
        assert len(data["cards"]) == 3
        
        for card in data["cards"]:
            assert "name" in card
            assert "position" in card
        
        print(f"Tarot Reading passed - Cards: {[c['name'] for c in data['cards']]}")


class TestAccuracyLabAPI:
    """Accuracy Lab endpoint tests - Swiss Ephemeris engine status"""
    
    def test_engine_status(self):
        """Test /api/accuracy/engine-status returns Swiss Ephemeris status"""
        response = requests.get(f"{BASE_URL}/api/accuracy/engine-status")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert data["engine_name"] == "Swiss Ephemeris"
        assert "version" in data
        assert data["ephemeris_basis"] == "NASA JPL DE431"
        assert data["status"] == "ACTIVE"
        assert "delta_t" in data
        assert "ayanamsha_value" in data
        assert data["precision"] == "Arc-Second"
        assert data["integrity_verified"] == True
        
        print(f"Engine Status passed - Delta-T: {data['delta_t']}, Ayanamsha: {data['ayanamsha_value']}")


class TestAlphaBriefingAPI:
    """Alpha Briefing endpoint tests - Gemini AI + Swiss Ephemeris"""
    
    def test_alpha_briefing(self):
        """Test /api/alpha-briefing returns AI-generated briefing"""
        response = requests.post(f"{BASE_URL}/api/alpha-briefing")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "date" in data
        assert "day" in data
        assert "briefing" in data
        assert "transits" in data
        assert "day_number" in data
        assert "scripture" in data
        
        # Briefing should have content
        assert len(data["briefing"]) > 50
        
        print(f"Alpha Briefing passed - Day: {data['day']}, Transits: {len(data['transits'])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
