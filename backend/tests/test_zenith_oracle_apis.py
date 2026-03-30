"""
Zenith Oracle API Tests - Testing new Pancha-Pakshi, Nakshatra Padas, and Oracle Feed endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data for birth info
TEST_BIRTH_INFO = {
    "name": "TEST_Roy",
    "birth_date": "1990-05-20",
    "birth_time": "14:30:00",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone_offset": 5.5
}


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "redis" in data
        assert "mongodb" in data
        print(f"✓ Health check passed: {data}")


class TestOracleFeedEndpoint:
    """Oracle Feed endpoint tests - GET /api/oracle-feed"""
    
    def test_oracle_feed_returns_200(self):
        """Test oracle-feed endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        assert response.status_code == 200
        print("✓ Oracle Feed returns 200")
    
    def test_oracle_feed_structure(self):
        """Test oracle-feed response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        assert response.status_code == 200
        data = response.json()
        
        # Check required top-level fields
        assert "generated_at" in data, "Missing generated_at field"
        assert "transit_alerts" in data, "Missing transit_alerts field"
        assert "psychic_update" in data, "Missing psychic_update field"
        assert "historical_parallels" in data, "Missing historical_parallels field"
        assert "current_transits" in data, "Missing current_transits field"
        print("✓ Oracle Feed has correct top-level structure")
    
    def test_oracle_feed_transit_alerts(self):
        """Test transit_alerts array structure"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        data = response.json()
        
        assert isinstance(data["transit_alerts"], list), "transit_alerts should be a list"
        
        if len(data["transit_alerts"]) > 0:
            alert = data["transit_alerts"][0]
            assert "type" in alert, "Alert missing type"
            assert "title" in alert, "Alert missing title"
            assert "message" in alert, "Alert missing message"
            assert "severity" in alert, "Alert missing severity"
            assert "icon" in alert, "Alert missing icon"
            print(f"✓ Transit alerts structure valid. Found {len(data['transit_alerts'])} alerts")
    
    def test_oracle_feed_psychic_update(self):
        """Test psychic_update structure"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        data = response.json()
        
        psychic = data["psychic_update"]
        assert "collective_energy_rating" in psychic, "Missing collective_energy_rating"
        assert "quality" in psychic, "Missing quality"
        assert "moon_phase" in psychic, "Missing moon_phase"
        assert "guidance" in psychic, "Missing guidance"
        assert "tithi" in psychic, "Missing tithi"
        
        # Validate energy rating is 0-100
        assert 0 <= psychic["collective_energy_rating"] <= 100, "Energy rating out of range"
        print(f"✓ Psychic update valid: {psychic['quality']} ({psychic['collective_energy_rating']}/100)")
    
    def test_oracle_feed_historical_parallels(self):
        """Test historical_parallels structure"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        data = response.json()
        
        parallels = data["historical_parallels"]
        assert isinstance(parallels, list), "historical_parallels should be a list"
        assert len(parallels) >= 2, "Should have at least Saturn and Jupiter parallels"
        
        for parallel in parallels:
            assert "planet" in parallel, "Parallel missing planet"
            assert "sign" in parallel, "Parallel missing sign"
            assert "degree" in parallel, "Parallel missing degree"
            assert "parallel" in parallel, "Parallel missing parallel text"
        
        # Check Saturn and Jupiter are present
        planets = [p["planet"] for p in parallels]
        assert "Saturn" in planets, "Missing Saturn historical parallel"
        assert "Jupiter" in planets, "Missing Jupiter historical parallel"
        print(f"✓ Historical parallels valid: {planets}")
    
    def test_oracle_feed_current_transits(self):
        """Test current_transits structure with Nakshatra Pada info"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        data = response.json()
        
        transits = data["current_transits"]
        expected_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]
        
        for planet in expected_planets:
            assert planet in transits, f"Missing {planet} in current_transits"
            planet_data = transits[planet]
            assert "sign" in planet_data, f"{planet} missing sign"
            assert "degree" in planet_data, f"{planet} missing degree"
            assert "nakshatra" in planet_data, f"{planet} missing nakshatra"
            assert "pada" in planet_data, f"{planet} missing pada"
            assert "retrograde" in planet_data, f"{planet} missing retrograde"
            
            # Validate pada is 1-4
            assert 1 <= planet_data["pada"] <= 4, f"{planet} pada out of range"
        
        print(f"✓ Current transits valid with Nakshatra Pada info for all planets")


class TestPanchaPakshiEndpoint:
    """Pancha-Pakshi endpoint tests - POST /api/vedic/pancha-pakshi"""
    
    def test_pancha_pakshi_returns_200(self):
        """Test pancha-pakshi endpoint returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/vedic/pancha-pakshi",
            json=TEST_BIRTH_INFO
        )
        assert response.status_code == 200
        print("✓ Pancha-Pakshi returns 200")
    
    def test_pancha_pakshi_response_structure(self):
        """Test pancha-pakshi response has correct structure"""
        response = requests.post(
            f"{BASE_URL}/api/vedic/pancha-pakshi",
            json=TEST_BIRTH_INFO
        )
        data = response.json()
        
        # Check top-level fields
        assert "person_name" in data, "Missing person_name"
        assert "moon_nakshatra" in data, "Missing moon_nakshatra"
        assert "moon_sign" in data, "Missing moon_sign"
        assert "nakshatra_pada" in data, "Missing nakshatra_pada"
        assert "pancha_pakshi" in data, "Missing pancha_pakshi"
        
        assert data["person_name"] == TEST_BIRTH_INFO["name"]
        print(f"✓ Pancha-Pakshi response structure valid for {data['person_name']}")
    
    def test_pancha_pakshi_bird_data(self):
        """Test pancha_pakshi bird data structure"""
        response = requests.post(
            f"{BASE_URL}/api/vedic/pancha-pakshi",
            json=TEST_BIRTH_INFO
        )
        data = response.json()
        pp = data["pancha_pakshi"]
        
        # Check required fields
        assert "birth_bird" in pp, "Missing birth_bird"
        assert "birth_bird_sanskrit" in pp, "Missing birth_bird_sanskrit"
        assert "birth_bird_attributes" in pp, "Missing birth_bird_attributes"
        assert "current_state" in pp, "Missing current_state"
        assert "power_level" in pp, "Missing power_level"
        assert "is_daytime" in pp, "Missing is_daytime"
        assert "current_period" in pp, "Missing current_period"
        assert "period_label" in pp, "Missing period_label"
        assert "all_birds" in pp, "Missing all_birds"
        assert "weekday" in pp, "Missing weekday"
        assert "strategic_guidance" in pp, "Missing strategic_guidance"
        
        # Validate bird is one of the 5 birds
        valid_birds = ["Vulture", "Owl", "Crow", "Cock", "Peacock"]
        assert pp["birth_bird"] in valid_birds, f"Invalid bird: {pp['birth_bird']}"
        
        # Validate state is one of the 5 states
        valid_states = ["Ruling", "Eating", "Walking", "Sleeping", "Dying"]
        assert pp["current_state"] in valid_states, f"Invalid state: {pp['current_state']}"
        
        # Validate power level
        assert 0 <= pp["power_level"] <= 100, "Power level out of range"
        
        # Validate all_birds has all 5 birds
        assert len(pp["all_birds"]) == 5, "all_birds should have 5 birds"
        for bird in valid_birds:
            assert bird in pp["all_birds"], f"Missing {bird} in all_birds"
        
        print(f"✓ Pancha-Pakshi bird data valid: {pp['birth_bird']} ({pp['birth_bird_sanskrit']}) - {pp['current_state']} ({pp['power_level']}%)")
    
    def test_pancha_pakshi_nakshatra_pada(self):
        """Test nakshatra_pada structure in pancha-pakshi response"""
        response = requests.post(
            f"{BASE_URL}/api/vedic/pancha-pakshi",
            json=TEST_BIRTH_INFO
        )
        data = response.json()
        pada = data["nakshatra_pada"]
        
        # Check required fields
        assert "nakshatra" in pada, "Missing nakshatra"
        assert "nakshatra_index" in pada, "Missing nakshatra_index"
        assert "pada" in pada, "Missing pada"
        assert "degree_in_nakshatra" in pada, "Missing degree_in_nakshatra"
        assert "nakshatra_lord" in pada, "Missing nakshatra_lord"
        assert "pada_lord" in pada, "Missing pada_lord"
        assert "navamsha_sign" in pada, "Missing navamsha_sign"
        assert "total_padas_elapsed" in pada, "Missing total_padas_elapsed"
        
        # Validate pada is 1-4
        assert 1 <= pada["pada"] <= 4, f"Pada out of range: {pada['pada']}"
        
        # Validate nakshatra_index is 0-26
        assert 0 <= pada["nakshatra_index"] <= 26, f"Nakshatra index out of range"
        
        print(f"✓ Nakshatra Pada valid: {pada['nakshatra']} Pada {pada['pada']} (Lord: {pada['pada_lord']})")
    
    def test_pancha_pakshi_strategic_guidance(self):
        """Test strategic guidance contains ancient/strategic tone"""
        response = requests.post(
            f"{BASE_URL}/api/vedic/pancha-pakshi",
            json=TEST_BIRTH_INFO
        )
        data = response.json()
        guidance = data["pancha_pakshi"]["strategic_guidance"]
        
        # Check guidance is not empty
        assert len(guidance) > 50, "Strategic guidance too short"
        
        # Check for strategic/ancient tone keywords
        strategic_keywords = ["cosmic", "celestial", "dominion", "authority", "strategic", 
                            "tides", "time", "energy", "rebirth", "wisdom", "influence"]
        has_strategic_tone = any(kw.lower() in guidance.lower() for kw in strategic_keywords)
        assert has_strategic_tone, f"Guidance lacks strategic/ancient tone: {guidance[:100]}..."
        
        print(f"✓ Strategic guidance has proper tone: '{guidance[:80]}...'")


class TestNakshatraPadasEndpoint:
    """Nakshatra Padas endpoint tests - GET /api/vedic/nakshatra-padas"""
    
    def test_nakshatra_padas_returns_200(self):
        """Test nakshatra-padas endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/vedic/nakshatra-padas")
        assert response.status_code == 200
        print("✓ Nakshatra Padas returns 200")
    
    def test_nakshatra_padas_structure(self):
        """Test nakshatra-padas response structure"""
        response = requests.get(f"{BASE_URL}/api/vedic/nakshatra-padas")
        data = response.json()
        
        # Check required fields
        assert "moon_longitude" in data, "Missing moon_longitude"
        assert "moon_sign" in data, "Missing moon_sign"
        assert "nakshatra_detail" in data, "Missing nakshatra_detail"
        assert "moon_phase" in data, "Missing moon_phase"
        assert "tithi" in data, "Missing tithi"
        
        print(f"✓ Nakshatra Padas structure valid")
    
    def test_nakshatra_padas_detail(self):
        """Test nakshatra_detail structure"""
        response = requests.get(f"{BASE_URL}/api/vedic/nakshatra-padas")
        data = response.json()
        detail = data["nakshatra_detail"]
        
        # Check required fields
        assert "nakshatra" in detail, "Missing nakshatra"
        assert "nakshatra_index" in detail, "Missing nakshatra_index"
        assert "pada" in detail, "Missing pada"
        assert "degree_in_nakshatra" in detail, "Missing degree_in_nakshatra"
        assert "nakshatra_lord" in detail, "Missing nakshatra_lord"
        assert "pada_lord" in detail, "Missing pada_lord"
        assert "navamsha_sign" in detail, "Missing navamsha_sign"
        assert "total_padas_elapsed" in detail, "Missing total_padas_elapsed"
        
        # Validate pada is 1-4
        assert 1 <= detail["pada"] <= 4, f"Pada out of range: {detail['pada']}"
        
        print(f"✓ Nakshatra detail valid: Moon in {detail['nakshatra']} Pada {detail['pada']}")
    
    def test_nakshatra_padas_moon_data(self):
        """Test moon data in nakshatra-padas response"""
        response = requests.get(f"{BASE_URL}/api/vedic/nakshatra-padas")
        data = response.json()
        
        # Validate moon_longitude is 0-360
        assert 0 <= data["moon_longitude"] < 360, "Moon longitude out of range"
        
        # Validate moon_sign is a valid sign
        valid_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        assert data["moon_sign"] in valid_signs, f"Invalid moon sign: {data['moon_sign']}"
        
        # Validate tithi is 1-30
        assert 1 <= data["tithi"] <= 30, f"Tithi out of range: {data['tithi']}"
        
        print(f"✓ Moon data valid: {data['moon_sign']} at {data['moon_longitude']:.2f}, Tithi {data['tithi']}")


class TestVedicBirthChartEndpoint:
    """Vedic Birth Chart endpoint tests - POST /api/vedic/birth-chart"""
    
    def test_vedic_birth_chart_returns_200(self):
        """Test vedic birth-chart endpoint returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/vedic/birth-chart",
            json=TEST_BIRTH_INFO
        )
        assert response.status_code == 200
        print("✓ Vedic Birth Chart returns 200")
    
    def test_vedic_birth_chart_structure(self):
        """Test vedic birth-chart response structure"""
        response = requests.post(
            f"{BASE_URL}/api/vedic/birth-chart",
            json=TEST_BIRTH_INFO
        )
        data = response.json()
        
        # Check required fields
        assert "person_name" in data, "Missing person_name"
        assert "planets" in data, "Missing planets"
        assert "ascendant" in data, "Missing ascendant"
        assert "ascendant_sign" in data, "Missing ascendant_sign"
        assert "lunar_mansion" in data, "Missing lunar_mansion"
        assert "dasha_lord" in data, "Missing dasha_lord"
        assert "power_score" in data, "Missing power_score"
        
        print(f"✓ Vedic Birth Chart structure valid for {data['person_name']}")


class TestInputValidation:
    """Input validation tests"""
    
    def test_pancha_pakshi_missing_name(self):
        """Test pancha-pakshi with missing name"""
        invalid_data = {**TEST_BIRTH_INFO}
        del invalid_data["name"]
        
        response = requests.post(
            f"{BASE_URL}/api/vedic/pancha-pakshi",
            json=invalid_data
        )
        assert response.status_code == 422, "Should return 422 for missing name"
        print("✓ Validation: Missing name returns 422")
    
    def test_pancha_pakshi_invalid_date_format(self):
        """Test pancha-pakshi with invalid date format"""
        invalid_data = {**TEST_BIRTH_INFO, "birth_date": "20-05-1990"}
        
        response = requests.post(
            f"{BASE_URL}/api/vedic/pancha-pakshi",
            json=invalid_data
        )
        assert response.status_code == 422, "Should return 422 for invalid date format"
        print("✓ Validation: Invalid date format returns 422")
    
    def test_pancha_pakshi_invalid_latitude(self):
        """Test pancha-pakshi with invalid latitude"""
        invalid_data = {**TEST_BIRTH_INFO, "latitude": 100}  # > 90
        
        response = requests.post(
            f"{BASE_URL}/api/vedic/pancha-pakshi",
            json=invalid_data
        )
        assert response.status_code == 422, "Should return 422 for invalid latitude"
        print("✓ Validation: Invalid latitude returns 422")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
