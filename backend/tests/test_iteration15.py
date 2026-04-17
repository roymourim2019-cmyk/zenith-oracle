"""
Iteration 15 Tests - ASO Optimization & AdSense Integration
Tests for:
- Backend API health and functionality
- Daily Oracle with Swiss Ephemeris data
- PDF generation
- VAPID keys for push notifications
- Vedic birth chart
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendHealth:
    """Health check and basic API tests"""
    
    def test_health_endpoint(self):
        """GET /api/health returns healthy"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy" or "healthy" in str(data).lower()
        print(f"Health check passed: {data}")

class TestDailyOracle:
    """Daily Oracle endpoint tests"""
    
    def test_daily_oracle_returns_swiss_ephemeris_data(self):
        """GET /api/daily-oracle returns real Swiss Ephemeris transit data"""
        response = requests.get(f"{BASE_URL}/api/daily-oracle", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        # Verify Swiss Ephemeris data is present
        assert "transits" in data or "current_transits" in data or "planets" in data
        print(f"Daily Oracle response keys: {list(data.keys())}")
        
        # Check for moon sign (key indicator of real ephemeris data)
        has_moon_data = any(key in str(data).lower() for key in ["moon", "lunar", "chandra"])
        assert has_moon_data, "Daily oracle should contain moon/lunar data"
        print("Daily Oracle contains Swiss Ephemeris transit data")

class TestPDFGeneration:
    """PDF generation endpoint tests"""
    
    def test_chart_pdf_generates_valid_pdf(self):
        """POST /api/chart-pdf generates valid PDF"""
        payload = {
            "name": "Roy",
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 22.5726,
            "longitude": 88.3639
        }
        response = requests.post(f"{BASE_URL}/api/chart-pdf", json=payload, timeout=30)
        assert response.status_code == 200
        
        # Verify it's a PDF
        content_type = response.headers.get("Content-Type", "")
        assert "pdf" in content_type.lower() or response.content[:4] == b'%PDF'
        
        # Check PDF magic bytes
        assert response.content[:4] == b'%PDF', "Response should be a valid PDF file"
        print(f"PDF generated successfully, size: {len(response.content)} bytes")

class TestNotifications:
    """Push notification VAPID key tests"""
    
    def test_vapid_key_returns_real_key(self):
        """GET /api/notifications/vapid-key returns real VAPID key"""
        response = requests.get(f"{BASE_URL}/api/notifications/vapid-key", timeout=10)
        assert response.status_code == 200
        data = response.json()
        
        # VAPID public key should be present
        vapid_key = data.get("public_key") or data.get("vapid_key") or data.get("publicKey")
        assert vapid_key is not None, "VAPID public key should be returned"
        
        # Real VAPID keys are base64url encoded and typically 87 chars
        assert len(vapid_key) > 40, f"VAPID key seems too short: {len(vapid_key)} chars"
        assert vapid_key != "XXXXXXXX", "VAPID key should not be a placeholder"
        print(f"VAPID key returned: {vapid_key[:20]}... ({len(vapid_key)} chars)")

class TestVedicBirthChart:
    """Vedic birth chart endpoint tests"""
    
    def test_vedic_birth_chart_returns_data(self):
        """POST /api/vedic/birth-chart returns chart data"""
        payload = {
            "name": "Roy",
            "birth_date": "1990-06-15",
            "birth_time": "12:00:00",
            "latitude": 22.5726,
            "longitude": 88.3639
        }
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=payload, timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        # Verify Vedic chart data
        assert "planets" in data or "chart" in data or "ascendant" in data
        print(f"Vedic birth chart response keys: {list(data.keys())}")
        
        # Check for ayanamsha (Lahiri should be ~23-24 degrees)
        if "ayanamsha" in data:
            ayanamsha = data["ayanamsha"]
            if isinstance(ayanamsha, (int, float)):
                assert 23 < ayanamsha < 25, f"Ayanamsha should be ~23.7 degrees, got {ayanamsha}"
                print(f"Ayanamsha (Lahiri): {ayanamsha}")
        
        print("Vedic birth chart data verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
