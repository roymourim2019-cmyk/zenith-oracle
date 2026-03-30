import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, TrendingUp, AlertTriangle, Check } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GlobalSuccessMap = ({ birthInfo }) => {
  const [locationData, setLocationData] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(false);

  const majorCities = [
    { name: 'New York', lat: 40.7128, lon: -74.0060, timezone: -5 },
    { name: 'London', lat: 51.5074, lon: -0.1278, timezone: 0 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, timezone: 9 },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708, timezone: 4 },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 8 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, timezone: 5.5 },
    { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, timezone: 8 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, timezone: 1 },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, timezone: -8 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, timezone: 10 }
  ];

  useEffect(() => {
    if (birthInfo) {
      calculateLocationStrengths();
    }
  }, [birthInfo]);

  const calculateLocationStrengths = async () => {
    setLoading(true);
    const results = [];

    for (const city of majorCities) {
      try {
        const response = await axios.post(`${API}/vedic/birth-chart`, {
          name: birthInfo.name,
          birth_date: birthInfo.birth_date,
          birth_time: birthInfo.birth_time,
          latitude: city.lat,
          longitude: city.lon,
          timezone_offset: city.timezone
        });

        const score = response.data.power_score;
        const ascendant = response.data.ascendant_sign;

        results.push({
          ...city,
          score,
          ascendant,
          strength: score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low'
        });
      } catch (error) {
        console.error(`Failed to calculate for ${city.name}:`, error);
      }
    }

    results.sort((a, b) => b.score - a.score);
    setLocationData(results);
    setLoading(false);
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'high': return '#00FF00';
      case 'medium': return '#D4AF37';
      case 'low': return '#FF6B6B';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="global-success-map">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Globe className="w-12 h-12 text-[#D4AF37] mr-4" />
            Global Success <span className="text-[#D4AF37] ml-2">Map</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">Swiss Ephemeris Locational Analysis | Find Your Power Zones</p>
        </motion.div>

        {loading && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/70">Calculating relocated charts for 10 major cities...</p>
          </div>
        )}

        {!loading && locationData && (
          <div className="space-y-6">
            {/* Top 3 Best Locations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-8 border-2 border-[#D4AF37]">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 text-[#D4AF37] mr-3" />
                Your Top 3 Power Cities
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {locationData.slice(0, 3).map((city, idx) => (
                  <TopCityCard key={idx} city={city} rank={idx + 1} />
                ))}
              </div>
            </motion.div>

            {/* All Locations Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {locationData.map((city, idx) => (
                <LocationCard
                  key={idx}
                  city={city}
                  onClick={() => setSelectedCity(city)}
                  selected={selectedCity?.name === city.name}
                  getStrengthColor={getStrengthColor}
                />
              ))}
            </div>

            {/* Selected City Details */}
            {selectedCity && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold text-white mb-4">{selectedCity.name} - Detailed Analysis</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <DetailBox label="Power Score" value={`${selectedCity.score}/100`} />
                  <DetailBox label="Relocated Ascendant" value={selectedCity.ascendant} />
                  <DetailBox label="Best For" value={selectedCity.strength === 'high' ? 'Career Growth' : 'Exploration'} />
                </div>
                <div className="mt-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4">
                  <p className="text-sm text-white/80">
                    <strong className="text-[#D4AF37]">Strategic Insight:</strong> This location shifts your chart's angular houses, 
                    creating {selectedCity.strength === 'high' ? 'powerful opportunities' : 'moderate potential'} for manifestation. 
                    The relocated ascendant in {selectedCity.ascendant} amplifies your natural strengths in this geography.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TopCityCard = ({ city, rank }) => (
  <div className="bg-[#020617]/60 border-2 border-[#D4AF37] rounded-xl p-6 text-center relative">
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
      <span className="text-[#020617] font-bold">{rank}</span>
    </div>
    <MapPin className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
    <h4 className="text-xl font-bold text-white mb-2">{city.name}</h4>
    <div className="text-4xl font-bold text-[#D4AF37] mb-2">{city.score}</div>
    <div className="text-xs uppercase tracking-widest text-white/60">Power Score</div>
  </div>
);

const LocationCard = ({ city, onClick, selected, getStrengthColor }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    className={`glass-card rounded-xl p-6 text-left transition-all ${
      selected ? 'border-2 border-[#D4AF37]' : 'border border-[#D4AF37]/20'
    }`}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="text-lg font-bold text-white mb-1">{city.name}</h4>
        <p className="text-xs text-white/60">Lat: {city.lat.toFixed(2)}, Lon: {city.lon.toFixed(2)}</p>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${getStrengthColor(city.strength)}20`, border: `2px solid ${getStrengthColor(city.strength)}` }}>
        <span className="text-2xl font-bold" style={{ color: getStrengthColor(city.strength) }}>{city.score}</span>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <div className="flex-1 bg-[#020617]/60 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all"
          style={{ width: `${city.score}%`, backgroundColor: getStrengthColor(city.strength) }}
        />
      </div>
      <span className="text-xs uppercase tracking-widest" style={{ color: getStrengthColor(city.strength) }}>
        {city.strength}
      </span>
    </div>
  </motion.button>
);

const DetailBox = ({ label, value }) => (
  <div className="bg-[#020617]/40 border border-[#D4AF37]/20 rounded-lg p-4">
    <div className="text-xs uppercase tracking-widest text-white/60 mb-2">{label}</div>
    <div className="text-xl font-bold text-[#D4AF37]">{value}</div>
  </div>
);

export default GlobalSuccessMap;