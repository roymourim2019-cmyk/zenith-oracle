"""
Test Suite for Scriptural Synthesis & Authenticity Engine Features
Tests: View Calculation Logic, DMS format, [LIVE] ticker, Karmic Mission, Solfeggio tones
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data for Saturn Dasha user with Ketu in Cancer
TEST_BODY = {
    "name": "Roy",
    "birth_date": "1990-05-20",
    "birth_time": "14:30:00",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone_offset": 5.5
}


class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health endpoint working")


class TestAkashicEchoesKarmicMission:
    """Test Akashic Echoes endpoint with karmic_mission field"""
    
    def test_akashic_echoes_returns_karmic_mission(self):
        """POST /api/synthesis/akashic-echoes returns karmic_mission field"""
        response = requests.post(f"{BASE_URL}/api/synthesis/akashic-echoes", json=TEST_BODY)
        assert response.status_code == 200
        data = response.json()
        
        # Verify karmic_mission field exists
        assert "karmic_mission" in data, "karmic_mission field missing from response"
        print(f"✅ karmic_mission field present")
        
        # Verify karmic_mission contains 2026-specific guidance
        assert "2026" in data["karmic_mission"], "karmic_mission should contain 2026-specific guidance"
        print(f"✅ karmic_mission contains 2026 reference")
        
        # Verify other required fields
        assert "past_life_archetype" in data
        assert "soul_history" in data
        assert "ketu_position" in data
        assert "eighth_house" in data
        assert "pluto_position" in data
        print("✅ All Akashic Echoes fields present")
    
    def test_akashic_echoes_ketu_position_structure(self):
        """Verify Ketu position has correct structure"""
        response = requests.post(f"{BASE_URL}/api/synthesis/akashic-echoes", json=TEST_BODY)
        assert response.status_code == 200
        data = response.json()
        
        ketu = data["ketu_position"]
        assert "sign" in ketu
        assert "degree" in ketu
        assert "nakshatra" in ketu
        assert "longitude" in ketu
        print(f"✅ Ketu position: {ketu['sign']} {ketu['degree']:.2f}° ({ketu['nakshatra']})")


class TestOracleFeedLiveFormat:
    """Test Oracle Feed endpoint for [LIVE] format"""
    
    def test_oracle_feed_returns_transit_alerts(self):
        """GET /api/oracle-feed returns transit_alerts for [LIVE] display"""
        response = requests.get(f"{BASE_URL}/api/oracle-feed")
        assert response.status_code == 200
        data = response.json()
        
        # Verify transit_alerts exists for [LIVE] ticker
        assert "transit_alerts" in data, "transit_alerts field missing"
        assert isinstance(data["transit_alerts"], list)
        print(f"✅ transit_alerts present with {len(data['transit_alerts'])} alerts")
        
        # Verify current_transits for ticker display
        assert "current_transits" in data
        transits = data["current_transits"]
        assert len(transits) > 0, "Should have current transit data"
        print(f"✅ current_transits present with {len(transits)} planets")
        
        # Verify psychic_update for energy rating
        assert "psychic_update" in data
        assert "collective_energy_rating" in data["psychic_update"]
        assert "moon_phase" in data["psychic_update"]
        print(f"✅ psychic_update: {data['psychic_update']['moon_phase']}, Energy: {data['psychic_update']['collective_energy_rating']}/100")


class TestVedicChartDMSFormat:
    """Test Vedic chart endpoint for DMS format"""
    
    def test_vedic_chart_returns_dms_compatible_data(self):
        """POST /api/vedic/birth-chart returns degree_in_sign for DMS conversion"""
        response = requests.post(f"{BASE_URL}/api/vedic/birth-chart", json=TEST_BODY)
        assert response.status_code == 200
        data = response.json()
        
        # Verify planets array exists
        assert "planets" in data
        assert len(data["planets"]) > 0
        
        # Verify each planet has degree_in_sign for DMS conversion
        for planet in data["planets"][:7]:  # First 7 planets
            assert "name" in planet
            assert "sign" in planet
            assert "degree_in_sign" in planet
            assert "longitude" in planet
            
            # Verify degree_in_sign is a valid number for DMS conversion
            deg = planet["degree_in_sign"]
            assert 0 <= deg < 30, f"degree_in_sign should be 0-30, got {deg}"
            
            # Calculate DMS
            d = int(deg)
            m = int((deg - d) * 60)
            s = int(((deg - d) * 60 - m) * 60)
            print(f"✅ {planet['name']}: {planet['sign']} {d}°{m}'{s}\"")
        
        print("✅ All planets have DMS-compatible data")


class TestDataIntegrityEndpoint:
    """Test Data Integrity endpoint for raw ephemeris and scripture"""
    
    def test_data_integrity_returns_dms_format(self):
        """POST /api/synthesis/data-integrity returns DMS formatted positions"""
        response = requests.post(f"{BASE_URL}/api/synthesis/data-integrity", json=TEST_BODY)
        assert response.status_code == 200
        data = response.json()
        
        # Verify vedic_sidereal section
        assert "vedic_sidereal" in data
        vedic = data["vedic_sidereal"]
        assert "planets" in vedic
        assert "ayanamsha_value" in vedic
        
        # Verify DMS format in planets
        for name, planet_data in vedic["planets"].items():
            assert "dms" in planet_data, f"DMS missing for {name}"
            assert "°" in planet_data["dms"], f"DMS format incorrect for {name}"
            print(f"✅ {name}: {planet_data['dms']} {planet_data['sign']}")
        
        # Verify western_tropical section
        assert "western_tropical" in data
        western = data["western_tropical"]
        assert "planets" in western
        
        # Verify integrity status
        assert data["integrity_status"] == "VERIFIED"
        assert "JPL DE431" in data["engine"]
        print(f"✅ Integrity Status: {data['integrity_status']}, Engine: {data['engine']}")
    
    def test_data_integrity_returns_scriptural_sources(self):
        """Verify scriptural sources are included"""
        response = requests.post(f"{BASE_URL}/api/synthesis/data-integrity", json=TEST_BODY)
        assert response.status_code == 200
        data = response.json()
        
        assert "all_sources" in data
        sources = data["all_sources"]
        
        # Verify key scriptural sources
        assert "vedic_chart" in sources
        assert "BPHS" in sources["vedic_chart"] or "Brihat Parashara" in sources["vedic_chart"]
        
        assert "western_chart" in sources
        assert "Ptolemy" in sources["western_chart"] or "Tetrabiblos" in sources["western_chart"]
        
        assert "tarot" in sources
        assert "Golden Dawn" in sources["tarot"]
        
        print("✅ All scriptural sources present")


class TestSovereignVerdictConflictResolution:
    """Test Sovereign Verdict for conflict resolution"""
    
    def test_sovereign_verdict_returns_alignment(self):
        """POST /api/synthesis/sovereign-verdict returns conflict resolution"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=TEST_BODY)
        assert response.status_code == 200
        data = response.json()
        
        # Verify sovereign_verdict structure
        assert "sovereign_verdict" in data
        verdict = data["sovereign_verdict"]
        assert "alignment" in verdict
        assert "confidence" in verdict
        assert "directive" in verdict
        
        # Verify alignment is one of expected values
        valid_alignments = ["FULL CONVERGENCE", "PARTIAL CONVERGENCE", "RESISTANCE DETECTED", "MIXED SIGNALS"]
        assert verdict["alignment"] in valid_alignments, f"Unexpected alignment: {verdict['alignment']}"
        
        # Verify confidence is a percentage
        assert 0 <= verdict["confidence"] <= 100
        
        print(f"✅ Alignment: {verdict['alignment']}, Confidence: {verdict['confidence']}%")
    
    def test_sovereign_verdict_cross_module_links(self):
        """Verify cross-module links for interconnected predictions"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=TEST_BODY)
        assert response.status_code == 200
        data = response.json()
        
        assert "cross_module_links" in data
        links = data["cross_module_links"]
        
        assert "dasha_lord" in links
        assert "favored_numerology" in links
        assert "favored_tarot" in links
        assert "universal_day_number" in links
        
        print(f"✅ Dasha Lord: {links['dasha_lord']}, Favored #: {links['favored_numerology']}")
        print(f"✅ Favored Tarot: {links['favored_tarot']}")


class TestTarotEndpoint:
    """Test Tarot endpoint for card data"""
    
    def test_tarot_reading_returns_arcana_type(self):
        """POST /api/tarot/reading returns cards with arcana type"""
        response = requests.post(
            f"{BASE_URL}/api/tarot/reading",
            params={"question": "What is my path?", "num_cards": 3}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "cards" in data
        assert len(data["cards"]) == 3
        
        for card in data["cards"]:
            assert "name" in card
            assert "arcana" in card
            # 78 traditional cards (Major/Minor) + 44 Alpha Strategy cards
            assert card["arcana"] in ["Major", "Minor", "Alpha Strategy"], f"Invalid arcana: {card['arcana']}"
            assert "upright_meaning" in card
            print(f"✅ {card['name']} - {card['arcana']} Arcana")
        
        assert "interpretation" in data
        print("✅ Tarot reading with arcana types working")


class TestWesternChartEndpoint:
    """Test Western chart endpoint"""
    
    def test_western_chart_returns_planets(self):
        """POST /api/western/birth-chart returns planetary positions"""
        response = requests.post(f"{BASE_URL}/api/western/birth-chart", json=TEST_BODY)
        assert response.status_code == 200
        data = response.json()
        
        assert "planets" in data
        assert len(data["planets"]) > 0
        
        # Verify Pluto is included (needed for Akashic analysis)
        planet_names = [p["name"] for p in data["planets"]]
        assert "Pluto" in planet_names, "Pluto should be in Western chart"
        
        pluto = next(p for p in data["planets"] if p["name"] == "Pluto")
        assert "sign" in pluto
        assert "degree_in_sign" in pluto
        print(f"✅ Pluto: {pluto['sign']} {pluto['degree_in_sign']:.2f}°")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
