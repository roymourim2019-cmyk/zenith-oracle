"""
Iteration 14 Backend Tests - Zenith Oracle
Tests: VAPID keys, push notifications, PDF generation, daily oracle, vedic/western charts, synthesis
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndVAPID:
    """Health check and VAPID key verification"""
    
    def test_health_endpoint(self):
        """GET /api/health returns healthy with redis=connected"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["redis"] == "connected"
        assert data["mongodb"] == "connected"
        print("✓ Health endpoint: healthy with redis=connected")
    
    def test_vapid_key_returns_real_key(self):
        """GET /api/notifications/vapid-key returns real VAPID public key starting with 'BNnI'"""
        response = requests.get(f"{BASE_URL}/api/notifications/vapid-key")
        assert response.status_code == 200
        data = response.json()
        assert "public_key" in data
        assert data["public_key"].startswith("BNnI"), f"VAPID key should start with 'BNnI', got: {data['public_key'][:10]}"
        assert len(data["public_key"]) > 50, "VAPID key should be a full-length key"
        print(f"✓ VAPID key verified: {data['public_key'][:20]}...")


class TestPushNotifications:
    """Push notification subscribe/unsubscribe/stats tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test subscription data"""
        self.test_endpoint = "https://test.example.com/push/iteration14_test"
        self.test_keys = {"p256dh": "test_p256dh_key_iter14", "auth": "test_auth_key_iter14"}
        self.test_user = "TestUserIter14"
    
    def test_subscribe_stores_subscription(self):
        """POST /api/notifications/subscribe stores subscription correctly"""
        response = requests.post(f"{BASE_URL}/api/notifications/subscribe", json={
            "endpoint": self.test_endpoint,
            "keys": self.test_keys,
            "user_name": self.test_user
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "subscribed"
        assert "endpoint_hash" in data
        assert len(data["endpoint_hash"]) == 16
        print(f"✓ Subscription stored with hash: {data['endpoint_hash']}")
    
    def test_stats_returns_active_subscribers(self):
        """GET /api/notifications/stats returns active_subscribers count and last_dispatch"""
        # First subscribe to ensure at least one active subscriber
        requests.post(f"{BASE_URL}/api/notifications/subscribe", json={
            "endpoint": self.test_endpoint + "_stats",
            "keys": self.test_keys,
            "user_name": self.test_user
        })
        
        response = requests.get(f"{BASE_URL}/api/notifications/stats")
        assert response.status_code == 200
        data = response.json()
        assert "active_subscribers" in data
        assert isinstance(data["active_subscribers"], int)
        assert data["active_subscribers"] >= 0
        assert "last_dispatch" in data
        print(f"✓ Stats: {data['active_subscribers']} active subscribers, last dispatch: {data['last_dispatch']}")
    
    def test_unsubscribe_deactivates_subscription(self):
        """POST /api/notifications/unsubscribe deactivates subscription"""
        # First subscribe
        requests.post(f"{BASE_URL}/api/notifications/subscribe", json={
            "endpoint": self.test_endpoint + "_unsub",
            "keys": self.test_keys,
            "user_name": self.test_user
        })
        
        # Then unsubscribe
        response = requests.post(f"{BASE_URL}/api/notifications/unsubscribe", json={
            "endpoint": self.test_endpoint + "_unsub",
            "keys": self.test_keys
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unsubscribed"
        print("✓ Unsubscribe successful")
    
    def test_dispatch_daily_sends_notifications(self):
        """POST /api/notifications/dispatch-daily sends daily notifications"""
        response = requests.post(f"{BASE_URL}/api/notifications/dispatch-daily")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "dispatched"
        assert "sent" in data
        assert "failed" in data
        assert "payload" in data
        assert "title" in data["payload"]
        assert "body" in data["payload"]
        print(f"✓ Daily dispatch: sent={data['sent']}, failed={data['failed']}, payload title: {data['payload']['title']}")


class TestPDFGeneration:
    """PDF report generation tests"""
    
    def test_chart_pdf_generates_valid_pdf(self):
        """POST /api/chart-pdf generates valid PDF file with birth chart data"""
        response = requests.post(f"{BASE_URL}/api/chart-pdf", json={
            "name": "Roy",
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 22.5726,
            "longitude": 88.3639,
            "timezone_offset": 5.5
        })
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/pdf"
        assert "attachment" in response.headers.get("content-disposition", "")
        
        # Verify PDF magic bytes
        content = response.content
        assert content[:5] == b'%PDF-', "Response should be a valid PDF file"
        assert len(content) > 1000, "PDF should have substantial content"
        print(f"✓ PDF generated: {len(content)} bytes, valid PDF header")


class TestAstrologyEndpoints:
    """Astrology calculation endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test birth data"""
        self.birth_data = {
            "name": "Roy",
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 22.5726,
            "longitude": 88.3639,
            "timezone_offset": 5.5
        }
    
    def test_daily_oracle_returns_swiss_ephemeris_data(self):
        """GET /api/daily-oracle returns real Swiss Ephemeris data"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "date" in data
        assert "moon_sign" in data
        assert "sun_sign" in data
        assert "transits" in data
        assert "scripture" in data
        
        # Verify transits contain real planetary data
        transits = data["transits"]
        assert "Sun" in transits
        assert "Moon" in transits
        assert "degree" in transits["Sun"]
        assert "sign" in transits["Sun"]
        
        # Verify scripture mentions Swiss Ephemeris
        assert "Swiss Ephemeris" in data["scripture"]
        print(f"✓ Daily oracle: Moon in {data['moon_sign']}, Sun in {data['sun_sign']}, energy: {data['energy_level']}")
    
    def test_vedic_birth_chart_returns_planets_and_ayanamsha(self):
        """POST /api/vedic/birth-chart returns chart with planets and ayanamsha"""
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=self.birth_data)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "planets" in data
        assert "ayanamsha" in data
        assert "ascendant_sign" in data
        assert "lunar_mansion" in data
        assert "dasha_lord" in data
        
        # Verify planets
        assert len(data["planets"]) >= 7
        for planet in data["planets"]:
            assert "name" in planet
            assert "sign" in planet
            assert "longitude" in planet
        
        # Verify ayanamsha is Lahiri (~23-24 degrees)
        assert 23 < data["ayanamsha"] < 25, f"Ayanamsha should be ~23-24, got {data['ayanamsha']}"
        print(f"✓ Vedic chart: Asc={data['ascendant_sign']}, Ayanamsha={data['ayanamsha']:.4f}, Dasha={data['dasha_lord']}")
    
    def test_synthesis_sovereign_verdict_returns_cross_system(self):
        """POST /api/synthesis/sovereign-verdict returns cross-system synthesis"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=self.birth_data)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "sovereign_verdict" in data
        assert "cross_module_links" in data
        assert "strategic_window" in data
        assert "sovereign_identity" in data
        assert "data_integrity" in data
        
        # Verify sovereign verdict
        verdict = data["sovereign_verdict"]
        assert "alignment" in verdict
        assert "confidence" in verdict
        assert "directive" in verdict
        
        # Verify cross-system data
        identity = data["sovereign_identity"]
        assert "bazi_element" in identity
        assert "western_rising" in identity
        assert "vedic_nakshatra" in identity
        
        print(f"✓ Synthesis: alignment={verdict['alignment']}, confidence={verdict['confidence']}%, identity={identity['signature_name']}")


class TestCleanup:
    """Cleanup test subscriptions"""
    
    def test_cleanup_test_subscriptions(self):
        """Cleanup test subscriptions created during testing"""
        test_endpoints = [
            "https://test.example.com/push/iteration14_test",
            "https://test.example.com/push/iteration14_test_stats",
            "https://test.example.com/push/iteration14_test_unsub"
        ]
        for endpoint in test_endpoints:
            requests.post(f"{BASE_URL}/api/notifications/unsubscribe", json={
                "endpoint": endpoint,
                "keys": {"p256dh": "test", "auth": "test"}
            })
        print("✓ Test subscriptions cleaned up")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
