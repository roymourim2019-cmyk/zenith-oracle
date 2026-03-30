"""
Test suite for Zenith Oracle Sensory UI Upgrade features
Tests: Vocal Oracle API, Oracle Feed, Pancha Pakshi integration
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVocalOracleAPI:
    """Tests for POST /api/vocal-oracle endpoint - Gemini-powered strategic briefing"""
    
    def test_vocal_oracle_success(self):
        """Test Vocal Oracle returns briefing with all required fields"""
        payload = {
            "name": "Roy",
            "birth_date": "1990-05-20",
            "birth_time": "14:30:00",
            "latitude": 28.6139,
            "longitude": 77.209,
            "timezone_offset": 5.5
        }
        
        response = requests.post(f"{BASE_URL}/api/vocal-oracle", json=payload, timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify all required fields are present
        assert "briefing" in data, "Missing 'briefing' field"
        assert "dasha_lord" in data, "Missing 'dasha_lord' field"
        assert "power_score" in data, "Missing 'power_score' field"
        assert "pakshi_bird" in data, "Missing 'pakshi_bird' field"
        assert "pakshi_state" in data, "Missing 'pakshi_state' field"
        
        # Verify data types
        assert isinstance(data["briefing"], str), "briefing should be string"
        assert isinstance(data["power_score"], (int, float)), "power_score should be numeric"
        assert len(data["briefing"]) > 10, "briefing should have meaningful content"
        
        print(f"✓ Vocal Oracle returned: dasha_lord={data['dasha_lord']}, power_score={data['power_score']}, pakshi_bird={data['pakshi_bird']}")
    
    def test_vocal_oracle_missing_fields(self):
        """Test Vocal Oracle handles missing required fields"""
        payload = {
            "name": "Test"
            # Missing birth_date, birth_time, latitude, longitude
        }
        
        response = requests.post(f"{BASE_URL}/api/vocal-oracle", json=payload, timeout=10)
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
    
    def test_vocal_oracle_different_user(self):
        """Test Vocal Oracle with different birth data"""
        payload = {
            "name": "Alice",
            "birth_date": "1985-12-15",
            "birth_time": "08:00:00",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "timezone_offset": -5.0
        }
        
        response = requests.post(f"{BASE_URL}/api/vocal-oracle", json=payload, timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert "briefing" in data
        assert "dasha_lord" in data
        print(f"✓ Different user test passed: dasha_lord={data['dasha_lord']}")


class TestOracleFeedAPI:
    """Tests for GET /api/oracle-feed endpoint - Live transit feed"""
    
    def test_oracle_feed_success(self):
        """Test Oracle Feed returns all required sections"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify required sections
        assert "transit_alerts" in data, "Missing 'transit_alerts'"
        assert "psychic_update" in data, "Missing 'psychic_update'"
        assert "current_transits" in data, "Missing 'current_transits'"
        
        # Verify transit_alerts structure
        assert isinstance(data["transit_alerts"], list)
        if len(data["transit_alerts"]) > 0:
            alert = data["transit_alerts"][0]
            assert "title" in alert
            assert "message" in alert
        
        # Verify psychic_update structure
        psychic = data["psychic_update"]
        assert "moon_phase" in psychic
        assert "collective_energy_rating" in psychic
        
        # Verify current_transits has planetary data
        transits = data["current_transits"]
        assert "Sun" in transits or "Moon" in transits, "Missing planetary transits"
        
        print(f"✓ Oracle Feed: moon_phase={psychic['moon_phase']}, energy={psychic['collective_energy_rating']}")
    
    def test_oracle_feed_transit_data_structure(self):
        """Test Oracle Feed transit data has proper structure"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        transits = data.get("current_transits", {})
        
        # Check Moon transit structure
        if "Moon" in transits:
            moon = transits["Moon"]
            assert "sign" in moon, "Moon missing 'sign'"
            assert "degree" in moon, "Moon missing 'degree'"
            assert "nakshatra" in moon, "Moon missing 'nakshatra'"
            assert "pada" in moon, "Moon missing 'pada'"
            print(f"✓ Moon transit: {moon['sign']} {moon['degree']:.1f}° in {moon['nakshatra']} P{moon['pada']}")


class TestPanchaPakshiAPI:
    """Tests for POST /api/vedic/pancha-pakshi endpoint"""
    
    def test_pancha_pakshi_success(self):
        """Test Pancha Pakshi returns bird and state data"""
        payload = {
            "name": "Roy",
            "birth_date": "1990-05-20",
            "birth_time": "14:30:00",
            "latitude": 28.6139,
            "longitude": 77.209,
            "timezone_offset": 5.5
        }
        
        response = requests.post(f"{BASE_URL}/api/vedic/pancha-pakshi", json=payload, timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify Pancha Pakshi structure
        assert "pancha_pakshi" in data, "Missing 'pancha_pakshi'"
        pakshi = data["pancha_pakshi"]
        
        assert "birth_bird" in pakshi, "Missing 'birth_bird'"
        assert "current_state" in pakshi, "Missing 'current_state'"
        assert "power_level" in pakshi, "Missing 'power_level'"
        
        print(f"✓ Pancha Pakshi: bird={pakshi['birth_bird']}, state={pakshi['current_state']}, power={pakshi['power_level']}%")


class TestHealthAndEngineStatus:
    """Tests for health and engine status endpoints"""
    
    def test_health_check(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health: status={data['status']}, mongodb={data['mongodb']}")
    
    def test_engine_status(self):
        """Test Swiss Ephemeris engine status"""
        response = requests.get(f"{BASE_URL}/api/accuracy/engine-status", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        assert data["engine_name"] == "Swiss Ephemeris"
        assert data["status"] == "ACTIVE"
        assert "ayanamsha_value" in data
        print(f"✓ Engine: {data['engine_name']} - {data['status']}, ayanamsha={data['ayanamsha_value']:.4f}")


class TestVedicChartAPI:
    """Tests for Vedic chart calculation - used by Vocal Oracle"""
    
    def test_vedic_birth_chart(self):
        """Test Vedic birth chart calculation"""
        payload = {
            "name": "Roy",
            "birth_date": "1990-05-20",
            "birth_time": "14:30:00",
            "latitude": 28.6139,
            "longitude": 77.209,
            "timezone_offset": 5.5
        }
        
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=payload, timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify chart structure
        assert "planets" in data
        assert "ascendant_sign" in data
        assert "dasha_lord" in data
        assert "power_score" in data
        assert "lunar_mansion" in data
        
        print(f"✓ Vedic Chart: ascendant={data['ascendant_sign']}, dasha={data['dasha_lord']}, power={data['power_score']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
