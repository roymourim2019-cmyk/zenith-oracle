import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NegotiationSimulator = ({ birthInfo }) => {
  const [currentTransits, setCurrentTransits] = useState(null);
  const [targetEvent, setTargetEvent] = useState('negotiation');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const eventTypes = {
    negotiation: { icon: '🤝', name: 'Business Negotiation', favorablePlanets: ['Mercury', 'Jupiter', 'Venus'] },
    aggression: { icon: '⚔️', name: 'Aggressive Action', favorablePlanets: ['Mars', 'Sun'] },
    diplomacy: { icon: '🕊️', name: 'Diplomatic Relations', favorablePlanets: ['Venus', 'Moon', 'Jupiter'] },
    litigation: { icon: '⚖️', name: 'Legal Battle', favorablePlanets: ['Saturn', 'Sun'] },
    investment: { icon: '💰', name: 'Major Investment', favorablePlanets: ['Jupiter', 'Venus', 'Mercury'] },
    partnership: { icon: '🤝', name: 'Strategic Partnership', favorablePlanets: ['Venus', 'Jupiter'] }
  };

  useEffect(() => {
    if (birthInfo) {
      calculateCurrentWindow();
    }
  }, [birthInfo, targetEvent]);

  const calculateCurrentWindow = async () => {
    setLoading(true);
    try {
      // Get current transits
      const today = new Date();
      const response = await axios.post(`${API}/vedic/birth-chart`, {
        name: 'Transit',
        birth_date: today.toISOString().split('T')[0],
        birth_time: today.toTimeString().split(' ')[0],
        latitude: birthInfo.latitude || 0,
        longitude: birthInfo.longitude || 0,
        timezone_offset: 0
      });

      setCurrentTransits(response.data);
      analyzeWindow(response.data);
    } catch (error) {
      console.error('Failed to get transits:', error);
    }
    setLoading(false);
  };

  const analyzeWindow = (transits) => {
    const event = eventTypes[targetEvent];
    const favorablePlanets = event.favorablePlanets;
    
    let favorabilityScore = 50;
    const details = [];

    transits.planets.forEach(planet => {
      if (favorablePlanets.includes(planet.name)) {
        if (!planet.retrograde && planet.speed > 0) {
          favorabilityScore += 10;
          details.push({
            planet: planet.name,
            impact: 'positive',
            reason: `${planet.name} is direct and strong in ${planet.sign}`
          });
        } else if (planet.retrograde) {
          favorabilityScore -= 5;
          details.push({
            planet: planet.name,
            impact: 'negative',
            reason: `${planet.name} is retrograde, causing delays`
          });
        }
      }
    });

    favorabilityScore = Math.max(0, Math.min(100, favorabilityScore));

    let recommendation = '';
    if (favorabilityScore >= 70) {
      recommendation = 'EXECUTE NOW - Optimal window for decisive action';
    } else if (favorabilityScore >= 50) {
      recommendation = 'PROCEED WITH CAUTION - Moderate conditions';
    } else {
      recommendation = 'DELAY - Wait for better planetary alignments';
    }

    setAnalysisResult({
      score: favorabilityScore,
      details,
      recommendation,
      bestTime: favorabilityScore >= 70 ? 'Now' : 'Within 7-14 days'
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Target className="w-12 h-12 text-[#D4AF37] mr-4" />
            Negotiation <span className="text-[#D4AF37] ml-2">Simulator</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">Find the optimal window for aggression or diplomacy</p>
        </motion.div>

        {/* Event Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Select Target Event</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(eventTypes).map(([key, event]) => (
              <button
                key={key}
                onClick={() => setTargetEvent(key)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  targetEvent === key
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20'
                    : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                }`}
                data-testid={`event-${key}`}
              >
                <div className="text-3xl mb-2">{event.icon}</div>
                <div className="text-white font-bold text-sm">{event.name}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Analysis Result */}
        {loading && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/70">Analyzing current planetary transits...</p>
          </div>
        )}

        {!loading && analysisResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Favorability Score */}
            <div className={`glass-card rounded-2xl p-8 border-2 ${
              analysisResult.score >= 70 ? 'border-green-500' :
              analysisResult.score >= 50 ? 'border-[#D4AF37]' :
              'border-red-500'
            }`}>
              <div className="text-center mb-6">
                <div className="text-7xl font-bold mb-2" style={{
                  color: analysisResult.score >= 70 ? '#00FF00' :
                         analysisResult.score >= 50 ? '#D4AF37' : '#FF6B6B'
                }}>
                  {analysisResult.score}
                </div>
                <div className="text-sm uppercase tracking-widest text-white/60">Favorability Score</div>
              </div>

              <div className="bg-[#020617]/60 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Recommendation</h3>
                <p className="text-lg text-white/90 leading-relaxed">{analysisResult.recommendation}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-white/70">Best Timing:</span>
                  <span className="text-[#D4AF37] font-bold">{analysisResult.bestTime}</span>
                </div>
                {analysisResult.score >= 70 && (
                  <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500 rounded-lg px-4 py-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-bold uppercase text-xs">Optimal Window</span>
                  </div>
                )}
              </div>
            </div>

            {/* Planetary Influences */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Planetary Influences</h3>
              <div className="space-y-4">
                {analysisResult.details.map((detail, idx) => (
                  <InfluenceCard key={idx} detail={detail} />
                ))}
              </div>
            </div>

            {/* Timeline Forecast */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">7-Day Forecast</h3>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(7)].map((_, idx) => {
                  const score = analysisResult.score + Math.random() * 20 - 10;
                  return (
                    <DayCard key={idx} day={idx + 1} score={Math.round(score)} />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const InfluenceCard = ({ detail }) => {
  const Icon = detail.impact === 'positive' ? TrendingUp : 
               detail.impact === 'negative' ? TrendingDown : Minus;
  const color = detail.impact === 'positive' ? '#00FF00' : 
                detail.impact === 'negative' ? '#FF6B6B' : '#D4AF37';

  return (
    <div className="bg-[#020617]/40 border border-[#D4AF37]/20 rounded-lg p-4 flex items-start space-x-4">
      <div className="mt-1">
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-bold mb-1">{detail.planet}</h4>
        <p className="text-white/70 text-sm">{detail.reason}</p>
      </div>
    </div>
  );
};

const DayCard = ({ day, score }) => {
  const color = score >= 70 ? '#00FF00' : score >= 50 ? '#D4AF37' : '#FF6B6B';
  
  return (
    <div className="bg-[#020617]/60 border rounded-lg p-3 text-center" style={{ borderColor: `${color}40` }}>
      <div className="text-xs text-white/60 mb-2">Day {day}</div>
      <div className="text-2xl font-bold" style={{ color }}>{score}</div>
    </div>
  );
};

export default NegotiationSimulator;