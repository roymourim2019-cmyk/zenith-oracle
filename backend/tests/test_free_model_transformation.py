"""
Test Suite for Zenith Oracle Free Model Transformation
Tests: Payment removal, core APIs, compatibility checker APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasics:
    """Basic health and API availability tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert "Zenith Oracle" in data["message"]
        print(f"✓ API root: {data}")
    
    def test_health_check(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health check: {data}")


class TestPaymentRemoval:
    """Verify payment endpoints are removed"""
    
    def test_payment_create_order_removed(self):
        """POST /api/payment/create-order should return 404"""
        response = requests.post(f"{BASE_URL}/api/payment/create-order", json={
            "amount": 999,
            "currency": "INR"
        })
        # Should be 404 (Not Found) since payment routes are removed
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Payment create-order endpoint removed (404)")
    
    def test_payment_verify_removed(self):
        """POST /api/payment/verify should return 404"""
        response = requests.post(f"{BASE_URL}/api/payment/verify", json={
            "order_id": "test",
            "payment_id": "test"
        })
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Payment verify endpoint removed (404)")
    
    def test_subscription_endpoint_removed(self):
        """GET /api/subscription should return 404"""
        response = requests.get(f"{BASE_URL}/api/subscription")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Subscription endpoint removed (404)")


class TestCoreAstrologyAPIs:
    """Test core astrology APIs still work (all free now)"""
    
    @pytest.fixture
    def birth_info(self):
        return {
            "name": "Test User",
            "birth_date": "1990-06-15",
            "birth_time": "10:30:00",
            "latitude": 28.6139,
            "longitude": 77.209,
            "timezone_offset": 5.5
        }
    
    def test_vedic_birth_chart(self, birth_info):
        """POST /api/vedic/birth-chart"""
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=birth_info)
        assert response.status_code == 200
        data = response.json()
        assert "planets" in data
        assert "ascendant_sign" in data
        assert "dasha_lord" in data
        assert "power_score" in data
        print(f"✓ Vedic birth chart: Ascendant={data['ascendant_sign']}, Dasha={data['dasha_lord']}")
    
    def test_western_birth_chart(self, birth_info):
        """POST /api/western/birth-chart"""
        response = requests.post(f"{BASE_URL}/api/western/birth-chart", json=birth_info)
        assert response.status_code == 200
        data = response.json()
        assert "planets" in data
        assert "ascendant_sign" in data
        print(f"✓ Western birth chart: Ascendant={data['ascendant_sign']}")
    
    def test_chinese_calculate(self, birth_info):
        """POST /api/chinese/calculate"""
        response = requests.post(f"{BASE_URL}/api/chinese/calculate", json=birth_info)
        assert response.status_code == 200
        data = response.json()
        assert "animal_sign" in data
        assert "element" in data
        assert "compatible_signs" in data
        print(f"✓ Chinese astrology: {data['animal_sign']} ({data['element']})")
    
    def test_numerology_calculate(self, birth_info):
        """POST /api/numerology/calculate"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json=birth_info)
        assert response.status_code == 200
        data = response.json()
        assert "chaldean_number" in data
        assert "pythagorean_number" in data
        assert "vedic_number" in data
        print(f"✓ Numerology: Chaldean={data['chaldean_number']}, Pythagorean={data['pythagorean_number']}")
    
    def test_tarot_reading(self):
        """POST /api/tarot/reading"""
        response = requests.post(f"{BASE_URL}/api/tarot/reading", json={
            "question": "What does today hold?",
            "num_cards": 3,
            "reading_type": "general"
        })
        assert response.status_code == 200
        data = response.json()
        assert "cards" in data
        assert len(data["cards"]) == 3
        print(f"✓ Tarot reading: {len(data['cards'])} cards drawn")


class TestCompatibilityAPIs:
    """Test APIs used by Compatibility Checker"""
    
    def test_compatibility_vedic_for_two_people(self):
        """Test Vedic API for both persons in compatibility check"""
        person1 = {
            "name": "Alice",
            "birth_date": "1990-03-15",
            "birth_time": "12:00:00",
            "latitude": 28.6139,
            "longitude": 77.209,
            "timezone_offset": 5.5
        }
        person2 = {
            "name": "Bob",
            "birth_date": "1988-07-22",
            "birth_time": "12:00:00",
            "latitude": 28.6139,
            "longitude": 77.209,
            "timezone_offset": 5.5
        }
        
        # Get Vedic charts for both
        r1 = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=person1)
        r2 = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=person2)
        
        assert r1.status_code == 200
        assert r2.status_code == 200
        
        d1 = r1.json()
        d2 = r2.json()
        
        # Check Moon signs for compatibility
        moon1 = next((p for p in d1['planets'] if p['name'] == 'Moon'), None)
        moon2 = next((p for p in d2['planets'] if p['name'] == 'Moon'), None)
        
        assert moon1 is not None
        assert moon2 is not None
        print(f"✓ Compatibility Vedic: Person1 Moon={moon1['sign']}, Person2 Moon={moon2['sign']}")
    
    def test_compatibility_numerology_for_two_people(self):
        """Test Numerology API for both persons"""
        person1 = {"name": "Alice", "birth_date": "1990-03-15", "birth_time": "12:00:00", "latitude": 28.6139, "longitude": 77.209, "timezone_offset": 5.5}
        person2 = {"name": "Bob", "birth_date": "1988-07-22", "birth_time": "12:00:00", "latitude": 28.6139, "longitude": 77.209, "timezone_offset": 5.5}
        
        r1 = requests.post(f"{BASE_URL}/api/numerology/calculate", json=person1)
        r2 = requests.post(f"{BASE_URL}/api/numerology/calculate", json=person2)
        
        assert r1.status_code == 200
        assert r2.status_code == 200
        
        d1 = r1.json()
        d2 = r2.json()
        
        print(f"✓ Compatibility Numerology: Person1 Chaldean={d1['chaldean_number']}, Person2 Chaldean={d2['chaldean_number']}")
    
    def test_compatibility_chinese_for_two_people(self):
        """Test Chinese API for both persons"""
        person1 = {"name": "Alice", "birth_date": "1990-03-15", "birth_time": "12:00:00", "latitude": 28.6139, "longitude": 77.209, "timezone_offset": 5.5}
        person2 = {"name": "Bob", "birth_date": "1988-07-22", "birth_time": "12:00:00", "latitude": 28.6139, "longitude": 77.209, "timezone_offset": 5.5}
        
        r1 = requests.post(f"{BASE_URL}/api/chinese/calculate", json=person1)
        r2 = requests.post(f"{BASE_URL}/api/chinese/calculate", json=person2)
        
        assert r1.status_code == 200
        assert r2.status_code == 200
        
        d1 = r1.json()
        d2 = r2.json()
        
        # Check if compatible
        is_compatible = d2['animal_sign'] in d1.get('compatible_signs', [])
        print(f"✓ Compatibility Chinese: {d1['animal_sign']} + {d2['animal_sign']} (Compatible: {is_compatible})")


class TestOracleFeed:
    """Test Oracle Feed for home page ticker"""
    
    def test_oracle_feed(self):
        """GET /api/oracle-feed"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        assert response.status_code == 200
        data = response.json()
        assert "current_transits" in data
        assert "psychic_update" in data
        print(f"✓ Oracle Feed: Moon phase={data['psychic_update'].get('moon_phase', 'N/A')}")


class TestAccuracyEngine:
    """Test accuracy/engine status endpoint"""
    
    def test_engine_status(self):
        """GET /api/accuracy/engine-status"""
        response = requests.get(f"{BASE_URL}/api/accuracy/engine-status")
        assert response.status_code == 200
        data = response.json()
        assert data["engine_name"] == "Swiss Ephemeris"
        assert data["status"] == "ACTIVE"
        print(f"✓ Engine status: {data['engine_name']} - {data['status']}")


class TestPWAManifest:
    """Test PWA manifest accessibility"""
    
    def test_manifest_json(self):
        """GET /manifest.json"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        assert data["short_name"] == "Zenith Oracle"
        assert data["display"] == "standalone"
        assert data["theme_color"] == "#020617"  # Obsidian
        print(f"✓ PWA Manifest: {data['short_name']} - theme={data['theme_color']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
