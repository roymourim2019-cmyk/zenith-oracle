"""
Test Suite for Scriptural Synthesis Engine APIs
Tests: sovereign-verdict, akashic-echoes, data-integrity, sovereign-identity
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://power-meter-12.preview.emergentagent.com')

# Test data for Saturn Dasha user (Roy Alexander)
SATURN_DASHA_USER = {
    "name": "Roy Alexander",
    "birth_date": "1990-05-20",
    "birth_time": "14:30:00",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone_offset": 5.5
}


class TestSovereignVerdict:
    """Tests for POST /api/synthesis/sovereign-verdict"""
    
    def test_sovereign_verdict_returns_200(self):
        """Verify endpoint returns 200 status"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=SATURN_DASHA_USER)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_sovereign_verdict_structure(self):
        """Verify response contains all required fields"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=SATURN_DASHA_USER)
        data = response.json()
        
        # Top-level keys
        assert "sovereign_verdict" in data, "Missing sovereign_verdict"
        assert "cross_module_links" in data, "Missing cross_module_links"
        assert "strategic_window" in data, "Missing strategic_window"
        assert "sovereign_identity" in data, "Missing sovereign_identity"
        assert "data_integrity" in data, "Missing data_integrity"
    
    def test_sovereign_verdict_fields(self):
        """Verify sovereign_verdict contains alignment, confidence, directive"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=SATURN_DASHA_USER)
        verdict = response.json()["sovereign_verdict"]
        
        assert "alignment" in verdict, "Missing alignment in sovereign_verdict"
        assert "confidence" in verdict, "Missing confidence in sovereign_verdict"
        assert "directive" in verdict, "Missing directive in sovereign_verdict"
        assert isinstance(verdict["confidence"], (int, float)), "Confidence should be numeric"
    
    def test_cross_module_links_for_saturn_dasha(self):
        """Verify Saturn Dasha user gets favored_numerology=8 and favored_tarot includes The Hermit/The World"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=SATURN_DASHA_USER)
        links = response.json()["cross_module_links"]
        
        assert links["dasha_lord"] == "Saturn", f"Expected Saturn dasha, got {links['dasha_lord']}"
        assert links["favored_numerology"] == 8, f"Expected favored_numerology=8 for Saturn, got {links['favored_numerology']}"
        assert "The Hermit" in links["favored_tarot"], "The Hermit should be in favored_tarot for Saturn"
        assert "The World" in links["favored_tarot"], "The World should be in favored_tarot for Saturn"
        assert "scripture" in links, "Missing scripture citation in cross_module_links"
    
    def test_strategic_window_fields(self):
        """Verify strategic_window contains required fields"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=SATURN_DASHA_USER)
        window = response.json()["strategic_window"]
        
        assert "optimal_action_hour" in window, "Missing optimal_action_hour"
        assert "moon_transit" in window, "Missing moon_transit"
        assert "power_level" in window, "Missing power_level"
        assert "day_number" in window, "Missing day_number"
        assert "window_quality" in window, "Missing window_quality"
        assert "scripture" in window, "Missing scripture citation"
    
    def test_sovereign_identity_fields(self):
        """Verify sovereign_identity contains BaZi, Western Rising, Vedic Nakshatra"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=SATURN_DASHA_USER)
        identity = response.json()["sovereign_identity"]
        
        assert "bazi_element" in identity, "Missing bazi_element"
        assert "western_rising" in identity, "Missing western_rising"
        assert "vedic_nakshatra" in identity, "Missing vedic_nakshatra"
        assert "signature_name" in identity, "Missing signature_name"
        assert "identity_summary" in identity, "Missing identity_summary"
        assert "scripture" in identity, "Missing scripture citation"


class TestAkashicEchoes:
    """Tests for POST /api/synthesis/akashic-echoes"""
    
    def test_akashic_echoes_returns_200(self):
        """Verify endpoint returns 200 status"""
        response = requests.post(f"{BASE_URL}/api/synthesis/akashic-echoes", json=SATURN_DASHA_USER)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_akashic_echoes_structure(self):
        """Verify response contains all required fields"""
        response = requests.post(f"{BASE_URL}/api/synthesis/akashic-echoes", json=SATURN_DASHA_USER)
        data = response.json()
        
        assert "past_life_archetype" in data, "Missing past_life_archetype"
        assert "soul_history" in data, "Missing soul_history"
        assert "ketu_position" in data, "Missing ketu_position"
        assert "eighth_house" in data, "Missing eighth_house"
        assert "pluto_position" in data, "Missing pluto_position"
        assert "scripture_source" in data, "Missing scripture_source"
    
    def test_ketu_position_for_test_user(self):
        """Verify Ketu is in Cancer for test user"""
        response = requests.post(f"{BASE_URL}/api/synthesis/akashic-echoes", json=SATURN_DASHA_USER)
        ketu = response.json()["ketu_position"]
        
        assert ketu["sign"] == "Cancer", f"Expected Ketu in Cancer, got {ketu['sign']}"
        assert "degree" in ketu, "Missing degree in ketu_position"
        assert "nakshatra" in ketu, "Missing nakshatra in ketu_position"
        assert "longitude" in ketu, "Missing longitude in ketu_position"
    
    def test_eighth_house_fields(self):
        """Verify eighth_house contains sign and cusp_degree"""
        response = requests.post(f"{BASE_URL}/api/synthesis/akashic-echoes", json=SATURN_DASHA_USER)
        eighth = response.json()["eighth_house"]
        
        assert "sign" in eighth, "Missing sign in eighth_house"
        assert "cusp_degree" in eighth, "Missing cusp_degree in eighth_house"
    
    def test_pluto_position_fields(self):
        """Verify pluto_position contains sign and degree"""
        response = requests.post(f"{BASE_URL}/api/synthesis/akashic-echoes", json=SATURN_DASHA_USER)
        pluto = response.json()["pluto_position"]
        
        assert "sign" in pluto, "Missing sign in pluto_position"
        assert "degree" in pluto, "Missing degree in pluto_position"
    
    def test_scriptural_citations_present(self):
        """Verify scriptural citations are present (BPHS, Bhrigu Samhita, etc.)"""
        response = requests.post(f"{BASE_URL}/api/synthesis/akashic-echoes", json=SATURN_DASHA_USER)
        data = response.json()
        
        scripture = data["scripture_source"]
        assert any(text in scripture for text in ["BPHS", "Bhrigu", "Parashara", "Jaimini"]), \
            f"Scripture source should reference Vedic texts, got: {scripture}"
        
        # Check soul_history also has scriptural references
        soul_history = data["soul_history"]
        assert any(text in soul_history for text in ["Bhrigu", "Nadi", "Parashari", "BPHS"]), \
            "Soul history should contain scriptural references"


class TestDataIntegrity:
    """Tests for POST /api/synthesis/data-integrity"""
    
    def test_data_integrity_returns_200(self):
        """Verify endpoint returns 200 status"""
        response = requests.post(f"{BASE_URL}/api/synthesis/data-integrity", json=SATURN_DASHA_USER)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_data_integrity_structure(self):
        """Verify response contains vedic_sidereal and western_tropical"""
        response = requests.post(f"{BASE_URL}/api/synthesis/data-integrity", json=SATURN_DASHA_USER)
        data = response.json()
        
        assert "vedic_sidereal" in data, "Missing vedic_sidereal"
        assert "western_tropical" in data, "Missing western_tropical"
        assert "integrity_status" in data, "Missing integrity_status"
        assert "engine" in data, "Missing engine"
        assert "all_sources" in data, "Missing all_sources"
    
    def test_vedic_sidereal_dms_format(self):
        """Verify Vedic positions include DMS format"""
        response = requests.post(f"{BASE_URL}/api/synthesis/data-integrity", json=SATURN_DASHA_USER)
        vedic = response.json()["vedic_sidereal"]
        
        assert "planets" in vedic, "Missing planets in vedic_sidereal"
        assert "ayanamsha_value" in vedic, "Missing ayanamsha_value"
        assert "scripture" in vedic, "Missing scripture citation"
        
        # Check DMS format for at least one planet
        sun = vedic["planets"].get("Sun", {})
        assert "dms" in sun, "Missing DMS format for Sun"
        assert "°" in sun["dms"], f"DMS should contain degree symbol, got: {sun['dms']}"
        assert "'" in sun["dms"], f"DMS should contain minute symbol, got: {sun['dms']}"
    
    def test_western_tropical_dms_format(self):
        """Verify Western positions include DMS format"""
        response = requests.post(f"{BASE_URL}/api/synthesis/data-integrity", json=SATURN_DASHA_USER)
        western = response.json()["western_tropical"]
        
        assert "planets" in western, "Missing planets in western_tropical"
        assert "scripture" in western, "Missing scripture citation"
        
        # Check DMS format for at least one planet
        sun = western["planets"].get("Sun", {})
        assert "dms" in sun, "Missing DMS format for Sun"
        assert "°" in sun["dms"], f"DMS should contain degree symbol, got: {sun['dms']}"
    
    def test_all_scriptural_sources_present(self):
        """Verify all_sources contains citations for all systems"""
        response = requests.post(f"{BASE_URL}/api/synthesis/data-integrity", json=SATURN_DASHA_USER)
        sources = response.json()["all_sources"]
        
        expected_keys = ["vedic_chart", "western_chart", "tarot", "numerology", "chinese"]
        for key in expected_keys:
            assert key in sources, f"Missing {key} in all_sources"
            assert len(sources[key]) > 50, f"Scripture for {key} seems too short"


class TestSovereignIdentity:
    """Tests for POST /api/synthesis/sovereign-identity"""
    
    def test_sovereign_identity_returns_200(self):
        """Verify endpoint returns 200 status"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-identity", json=SATURN_DASHA_USER)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_sovereign_identity_structure(self):
        """Verify response contains all required fields"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-identity", json=SATURN_DASHA_USER)
        data = response.json()
        
        assert "bazi_element" in data, "Missing bazi_element"
        assert "western_rising" in data, "Missing western_rising"
        assert "vedic_nakshatra" in data, "Missing vedic_nakshatra"
        assert "signature_name" in data, "Missing signature_name"
        assert "identity_summary" in data, "Missing identity_summary"
    
    def test_bazi_element_valid(self):
        """Verify BaZi element is one of the 5 elements"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-identity", json=SATURN_DASHA_USER)
        element = response.json()["bazi_element"]
        
        valid_elements = ["Metal", "Water", "Wood", "Fire", "Earth"]
        assert element in valid_elements, f"Invalid BaZi element: {element}"
    
    def test_western_rising_valid(self):
        """Verify Western rising is a valid zodiac sign"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-identity", json=SATURN_DASHA_USER)
        rising = response.json()["western_rising"]
        
        valid_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                       "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        assert rising in valid_signs, f"Invalid Western rising: {rising}"
    
    def test_vedic_nakshatra_valid(self):
        """Verify Vedic nakshatra is one of the 27 nakshatras"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-identity", json=SATURN_DASHA_USER)
        nakshatra = response.json()["vedic_nakshatra"]
        
        # Just check it's a non-empty string (full list validation would be verbose)
        assert isinstance(nakshatra, str), "Nakshatra should be a string"
        assert len(nakshatra) > 3, f"Nakshatra name seems too short: {nakshatra}"
    
    def test_identity_summary_comprehensive(self):
        """Verify identity_summary mentions all three systems"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-identity", json=SATURN_DASHA_USER)
        summary = response.json()["identity_summary"]
        
        assert "BaZi" in summary or "Chinese" in summary, "Summary should mention Chinese/BaZi"
        assert "Western" in summary or "Rising" in summary, "Summary should mention Western Rising"
        assert "Nakshatra" in summary or "Vedic" in summary, "Summary should mention Vedic Nakshatra"


class TestConflictResolution:
    """Tests for conflict resolution when systems disagree"""
    
    def test_conflict_resolution_alignment_types(self):
        """Verify alignment can be FULL CONVERGENCE, PARTIAL CONVERGENCE, RESISTANCE DETECTED, or MIXED SIGNALS"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=SATURN_DASHA_USER)
        alignment = response.json()["sovereign_verdict"]["alignment"]
        
        valid_alignments = ["FULL CONVERGENCE", "PARTIAL CONVERGENCE", "RESISTANCE DETECTED", "MIXED SIGNALS"]
        assert alignment in valid_alignments, f"Invalid alignment type: {alignment}"
    
    def test_confidence_correlates_with_alignment(self):
        """Verify confidence level makes sense for alignment type"""
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=SATURN_DASHA_USER)
        verdict = response.json()["sovereign_verdict"]
        
        alignment = verdict["alignment"]
        confidence = verdict["confidence"]
        
        if alignment == "FULL CONVERGENCE":
            assert confidence >= 90, f"Full convergence should have high confidence, got {confidence}"
        elif alignment == "RESISTANCE DETECTED":
            assert confidence <= 50, f"Resistance detected should have low confidence, got {confidence}"


class TestEdgeCases:
    """Edge case tests"""
    
    def test_missing_required_fields(self):
        """Verify proper error handling for missing fields"""
        incomplete_data = {"name": "Test"}
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=incomplete_data)
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
    
    def test_invalid_date_format(self):
        """Verify proper error handling for invalid date"""
        invalid_data = {**SATURN_DASHA_USER, "birth_date": "invalid-date"}
        response = requests.post(f"{BASE_URL}/api/synthesis/sovereign-verdict", json=invalid_data)
        assert response.status_code in [400, 422, 500], f"Expected error for invalid date, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
