"""
Iteration 13 Backend Tests - Zenith Oracle
Tests: Health, Daily Oracle, Oracle Feed, Engine Status, Vedic, Western, Chinese, 
Numerology, Tarot, Synthesis, and Push Notifications endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test birth data from agent context
TEST_BIRTH_DATA = {
    "name": "Roy",
    "birth_date": "1990-06-15",
    "birth_time": "12:00:00",
    "latitude": 22.5726,
    "longitude": 88.3639,
    "timezone_offset": 5.5
}


class TestSystemEndpoints:
    """System and health check endpoints"""
    
    def test_health_check(self):
        """GET /api/health returns healthy with redis=connected"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["redis"] == "connected"
        assert "mongodb" in data
        print(f"✓ Health check passed: {data}")
    
    def test_engine_status(self):
        """GET /api/accuracy/engine-status returns ACTIVE engine"""
        response = requests.get(f"{BASE_URL}/api/accuracy/engine-status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ACTIVE"
        assert data["engine_name"] == "Swiss Ephemeris"
        assert "delta_t" in data
        assert "ayanamsha_value" in data
        assert data["precision"] == "Arc-Second"
        print(f"✓ Engine status: {data['engine_name']} - {data['status']}")


class TestOracleEndpoints:
    """Daily Oracle and Oracle Feed endpoints"""
    
    def test_daily_oracle(self):
        """GET /api/daily-oracle returns real Swiss Ephemeris transit data"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        assert response.status_code == 200
        data = response.json()
        
        # Required fields
        assert "date" in data
        assert "moon_sign" in data
        assert "energy_level" in data
        assert "transits" in data
        
        # Validate transits contain 7 planets
        transits = data["transits"]
        expected_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]
        for planet in expected_planets:
            assert planet in transits, f"Missing planet: {planet}"
            assert "sign" in transits[planet]
            assert "degree" in transits[planet]
        
        # Validate energy level is reasonable
        assert 0 <= data["energy_level"] <= 100
        
        print(f"✓ Daily Oracle: Moon in {data['moon_sign']}, Energy {data['energy_level']}%")
    
    def test_oracle_feed(self):
        """GET /api/oracle-feed returns current_transits with 7 planets"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        assert response.status_code == 200
        data = response.json()
        
        assert "current_transits" in data
        assert "generated_at" in data
        
        # Validate 7 planets in current_transits
        transits = data["current_transits"]
        expected_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]
        for planet in expected_planets:
            assert planet in transits, f"Missing planet in oracle feed: {planet}"
            assert "sign" in transits[planet]
            assert "nakshatra" in transits[planet]
            assert "pada" in transits[planet]
        
        print(f"✓ Oracle Feed: {len(transits)} planets with nakshatra data")


class TestVedicEndpoints:
    """Vedic astrology endpoints"""
    
    def test_vedic_birth_chart(self):
        """POST /api/vedic/birth-chart returns chart with planets, ascendant_sign, ayanamsha"""
        response = requests.post(
            f"{BASE_URL}/api/vedic/birth-chart",
            json=TEST_BIRTH_DATA
        )
        assert response.status_code == 200
        data = response.json()
        
        # Required fields
        assert "planets" in data
        assert "ascendant_sign" in data
        assert "ayanamsha" in data
        assert "dasha_lord" in data
        assert "lunar_mansion" in data
        
        # Validate planets array
        assert len(data["planets"]) >= 7
        planet_names = [p["name"] for p in data["planets"]]
        assert "Sun" in planet_names
        assert "Moon" in planet_names
        
        print(f"✓ Vedic Chart: Ascendant {data['ascendant_sign']}, Dasha Lord {data['dasha_lord']}")


class TestWesternEndpoints:
    """Western astrology endpoints"""
    
    def test_western_birth_chart(self):
        """POST /api/western/birth-chart returns chart data"""
        response = requests.post(
            f"{BASE_URL}/api/western/birth-chart",
            json=TEST_BIRTH_DATA
        )
        assert response.status_code == 200
        data = response.json()
        
        # Required fields
        assert "planets" in data
        assert "ascendant_sign" in data
        assert "chart_type" in data
        
        # Validate it's tropical
        assert data["chart_type"] == "Western Tropical"
        
        print(f"✓ Western Chart: {data['chart_type']}, Ascendant {data['ascendant_sign']}")


class TestChineseEndpoints:
    """Chinese astrology endpoints"""
    
    def test_chinese_calculate(self):
        """POST /api/chinese/calculate returns zodiac animal and element"""
        response = requests.post(
            f"{BASE_URL}/api/chinese/calculate",
            json=TEST_BIRTH_DATA
        )
        assert response.status_code == 200
        data = response.json()
        
        # Required fields (API uses animal_sign not animal)
        assert "animal_sign" in data
        assert "element" in data
        assert "yin_yang" in data
        
        # 1990 is Year of the Horse
        assert data["animal_sign"] == "Horse"
        assert data["element"] == "Metal"
        
        print(f"✓ Chinese Astrology: {data['element']} {data['animal_sign']} ({data['yin_yang']})")


class TestNumerologyEndpoints:
    """Numerology endpoints"""
    
    def test_numerology_calculate(self):
        """POST /api/numerology/calculate returns numerology data"""
        response = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json=TEST_BIRTH_DATA
        )
        assert response.status_code == 200
        data = response.json()
        
        # Required fields (API uses chaldean/pythagorean/vedic numbers)
        assert "chaldean_number" in data
        assert "pythagorean_number" in data
        assert "vedic_number" in data
        assert "interpretation" in data
        
        # Validate numbers are in valid range (1-9 or master numbers)
        assert 1 <= data["chaldean_number"] <= 33
        
        print(f"✓ Numerology: Chaldean {data['chaldean_number']}, Pythagorean {data['pythagorean_number']}, Vedic {data['vedic_number']}")


class TestTarotEndpoints:
    """Tarot reading endpoints"""
    
    def test_tarot_reading(self):
        """POST /api/tarot/reading returns card reading"""
        response = requests.post(
            f"{BASE_URL}/api/tarot/reading",
            json={
                "question": "What does today hold for me?",
                "num_cards": 3,
                "reading_type": "general",
                **TEST_BIRTH_DATA
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Required fields
        assert "cards" in data
        assert "interpretation" in data
        
        # Validate cards array
        assert len(data["cards"]) == 3
        for card in data["cards"]:
            assert "name" in card
            assert "position" in card
        
        print(f"✓ Tarot Reading: {len(data['cards'])} cards drawn")


class TestSynthesisEndpoints:
    """Cross-system synthesis endpoints"""
    
    def test_sovereign_verdict(self):
        """POST /api/synthesis/sovereign-verdict returns cross-system verdict"""
        response = requests.post(
            f"{BASE_URL}/api/synthesis/sovereign-verdict",
            json=TEST_BIRTH_DATA
        )
        assert response.status_code == 200
        data = response.json()
        
        # Required fields for synthesis
        assert "sovereign_identity" in data or "synthesis_score" in data or "verdict" in data
        
        print(f"✓ Sovereign Verdict: Cross-system synthesis completed")


class TestNotificationEndpoints:
    """Push notification endpoints"""
    
    def test_vapid_key(self):
        """GET /api/notifications/vapid-key returns public key"""
        response = requests.get(f"{BASE_URL}/api/notifications/vapid-key")
        assert response.status_code == 200
        data = response.json()
        
        assert "public_key" in data
        assert len(data["public_key"]) > 20  # VAPID keys are long
        
        print(f"✓ VAPID Key: {data['public_key'][:30]}...")
    
    def test_notification_subscribe(self):
        """POST /api/notifications/subscribe stores subscription"""
        test_subscription = {
            "endpoint": "https://test-push-service.example.com/test-endpoint-iteration13",
            "keys": {
                "p256dh": "test_p256dh_key_iteration13",
                "auth": "test_auth_key_iteration13"
            },
            "user_name": "Test User Iteration 13"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/notifications/subscribe",
            json=test_subscription
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "subscribed"
        assert "endpoint_hash" in data
        
        print(f"✓ Subscription created: {data['endpoint_hash']}")
        return data["endpoint_hash"]
    
    def test_notification_unsubscribe(self):
        """POST /api/notifications/unsubscribe deactivates subscription"""
        test_subscription = {
            "endpoint": "https://test-push-service.example.com/test-endpoint-unsubscribe-13",
            "keys": {
                "p256dh": "test_p256dh_key_unsub",
                "auth": "test_auth_key_unsub"
            }
        }
        
        # First subscribe
        requests.post(f"{BASE_URL}/api/notifications/subscribe", json=test_subscription)
        
        # Then unsubscribe
        response = requests.post(
            f"{BASE_URL}/api/notifications/unsubscribe",
            json=test_subscription
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "unsubscribed"
        
        print(f"✓ Unsubscription successful")
    
    def test_notification_stats(self):
        """GET /api/notifications/stats returns active subscriber count"""
        response = requests.get(f"{BASE_URL}/api/notifications/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "active_subscribers" in data
        assert isinstance(data["active_subscribers"], int)
        assert data["active_subscribers"] >= 0
        
        print(f"✓ Notification Stats: {data['active_subscribers']} active subscribers")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
