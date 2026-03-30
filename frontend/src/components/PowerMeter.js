import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, TrendingUp, Shield, Zap, Star } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PowerMeter = ({ birthInfo }) => {
  const [powerData, setPowerData] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculatePower = async () => {
    if (!birthInfo) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/power-meter/${birthInfo.name}`, {
        params: {
          birth_date: birthInfo.birth_date,
          birth_time: birthInfo.birth_time,
          latitude: birthInfo.latitude,
          longitude: birthInfo.longitude
        }
      });
      setPowerData(response.data);
    } catch (error) {
      console.error('Power meter error:', error);
    }
    setLoading(false);
  };

  const score = powerData?.overall_score || 0;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card rounded-2xl p-8" data-testid="power-meter-component">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Zap className="w-6 h-6 text-[#D4AF37] mr-2" />
        Power Meter
      </h3>

      <div className="flex flex-col items-center">
        {/* Circular Gauge */}
        <div className="relative w-64 h-64 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r="90"
              stroke="rgba(212, 175, 55, 0.2)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="128"
              cy="128"
              r="90"
              stroke="#D4AF37"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="power-meter-glow"
              data-testid="power-meter-gauge"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold text-[#D4AF37] gold-glow">{Math.round(score)}</span>
            <span className="text-sm uppercase tracking-widest text-white/60">Dominance Level</span>
          </div>
        </div>

        {powerData && (
          <div className="w-full space-y-4">
            <div>
              <h4 className="text-sm uppercase tracking-widest text-[#D4AF37] mb-2">Strength Areas</h4>
              <div className="flex flex-wrap gap-2">
                {powerData.strength_areas.map((area, idx) => (
                  <span key={idx} className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 text-xs text-white">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-widest text-[#D4AF37] mb-2">Challenge Areas</h4>
              <div className="flex flex-wrap gap-2">
                {powerData.challenge_areas.map((area, idx) => (
                  <span key={idx} className="bg-white/10 border border-white/20 px-3 py-1 text-xs text-white/70">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4">
              <p className="text-sm text-white/80 leading-relaxed">
                <strong className="text-[#D4AF37]">Strategic Recommendation:</strong> {powerData.recommendation}
              </p>
            </div>
          </div>
        )}

        {!powerData && birthInfo && (
          <button
            onClick={calculatePower}
            disabled={loading}
            className="bg-[#D4AF37] text-[#020617] font-bold py-3 px-8 hover:bg-[#F3E5AB] transition-all duration-300 uppercase tracking-widest text-sm"
            data-testid="calculate-power-button"
          >
            {loading ? 'Calculating...' : 'Calculate Power'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PowerMeter;