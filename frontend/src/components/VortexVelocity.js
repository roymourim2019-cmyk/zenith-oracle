import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import axios from 'axios';
import HapticSignature from '../utils/HapticSignature';
import { AdBanner, AdRewarded } from './AdComponents';
import { ShareButton } from './ShareCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VortexVelocity = () => {
  const [gameState, setGameState] = useState('intro');
  const [selectedPlanet, setSelectedPlanet] = useState('Mars');
  const [currentDegree, setCurrentDegree] = useState(0);
  const [targetDegree, setTargetDegree] = useState(0);
  const [userGuess, setUserGuess] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [result, setResult] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [score, setScore] = useState(0);

  const haptic = new HapticSignature();
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

  useEffect(() => {
    if (gameState === 'playing') {
      fetchCurrentDegree();
    }
  }, [gameState, selectedPlanet]);

  useEffect(() => {
    if (gameState === 'playing') {
      const difference = Math.abs(userGuess - targetDegree);
      const newIntensity = Math.max(0, 100 - difference);
      setIntensity(newIntensity);
      
      if (newIntensity > 80 && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }, [userGuess, targetDegree]);

  const fetchCurrentDegree = async () => {
    try {
      const today = new Date();
      const response = await axios.post(`${API}/vedic/birth-chart`, {
        name: 'Transit',
        birth_date: today.toISOString().split('T')[0],
        birth_time: today.toTimeString().split(' ')[0],
        latitude: 0,
        longitude: 0,
        timezone_offset: 0
      });

      const planet = response.data.planets.find(p => p.name === selectedPlanet);
      if (planet) {
        setTargetDegree(planet.longitude);
        setCurrentDegree(planet.longitude);
      }
    } catch (error) {
      console.error('Failed to fetch planet degree:', error);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setUserGuess(0);
    setResult(null);
  };

  const lockDegree = () => {
    const difference = Math.abs(userGuess - targetDegree);
    const precision = difference < 1 ? 'Perfect' : difference < 5 ? 'Excellent' : difference < 10 ? 'Good' : 'Miss';
    
    if (precision === 'Perfect' || precision === 'Excellent') {
      const points = precision === 'Perfect' ? 1000 : 500;
      setScore(score + points);
      setResult({ success: true, precision, difference: difference.toFixed(4), points });
      haptic.trigger(selectedPlanet);
    } else {
      setResult({ success: false, precision, difference: difference.toFixed(4) });
      setShowAd(true);
      setTimeout(() => setShowAd(false), 3000);
    }
    
    setGameState('result');
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="vortex-velocity">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Activity className="w-12 h-12 text-[#D4AF37] mr-4" />
            Vortex <span className="text-[#D4AF37] ml-2">Velocity</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">Lock Planetary Degrees with Arc-Second Precision</p>
        </motion.div>

        {gameState === 'intro' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <Zap className="w-20 h-20 text-[#D4AF37] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Race Against the Cosmos</h2>
              <p className="text-white/70">Use real-time Swiss Ephemeris data to lock planets at their exact degree</p>
              {score > 0 && (
                <div className="mt-4 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-lg px-6 py-3 inline-block">
                  <p className="text-[#D4AF37] font-bold text-xl">Total Score: {score}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-sm uppercase tracking-widest text-[#D4AF37] block mb-2">Select Planet</label>
              <div className="grid grid-cols-4 gap-3">
                {planets.map(planet => (
                  <button
                    key={planet}
                    onClick={() => setSelectedPlanet(planet)}
                    className={`py-3 rounded-lg font-bold uppercase text-sm transition-all ${
                      selectedPlanet === planet
                        ? 'bg-[#D4AF37] text-[#020617]'
                        : 'bg-[#D4AF37]/20 text-white border border-[#D4AF37]/40 hover:border-[#D4AF37]'
                    }`}
                  >
                    {planet}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startGame} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest gold-pulse">
              Start Race
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Lock {selectedPlanet} Degree</h3>
              <div className="bg-[#020617]/60 border border-[#D4AF37]/40 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold text-[#D4AF37] mb-2">{userGuess.toFixed(4)}°</div>
                  <div className="text-sm text-white/60">Your Guess</div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/60 mb-2">
                    <span>Intensity: {intensity}%</span>
                    <span>Target: Hidden</span>
                  </div>
                  <div className="w-full h-4 bg-[#020617]/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${intensity}%`,
                        backgroundColor: intensity > 90 ? '#00FF00' : intensity > 70 ? '#D4AF37' : '#FF6B6B'
                      }}
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="360"
                  step="0.0001"
                  value={userGuess}
                  onChange={(e) => setUserGuess(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <button onClick={lockDegree} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest">
                Lock Degree
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'result' && result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              {result.success ? (
                <>
                  <TrendingUp className="w-24 h-24 text-[#00FF00] mx-auto mb-4" />
                  <h2 className="text-4xl font-bold text-[#00FF00] mb-2">{result.precision}!</h2>
                  <p className="text-[#D4AF37] text-2xl mb-4">+{result.points} Points</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-24 h-24 text-red-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-bold text-red-400 mb-2">Missed</h2>
                </>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#020617]/60 border border-[#D4AF37]/40 rounded-lg p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Your Guess</div>
                <div className="text-3xl font-bold text-white">{userGuess.toFixed(4)}°</div>
              </div>
              <div className="bg-[#020617]/60 border border-[#D4AF37]/40 rounded-lg p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Actual Degree</div>
                <div className="text-3xl font-bold text-[#D4AF37]">{targetDegree.toFixed(4)}°</div>
              </div>
            </div>

            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4 mb-6 text-center">
              <p className="text-white/80">Difference: <span className="text-[#D4AF37] font-bold">{result.difference}°</span></p>
            </div>

            <AdBanner slot="vortex-result" className="mb-4" />
            <div className="space-y-3">
              {!result.success && (
                <button onClick={() => setShowAd(true)} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#020617] font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest text-sm" data-testid="cosmic-reset-btn">Cosmic Reset — Watch & Retry</button>
              )}
              <div className="flex gap-3">
                <ShareButton title="Vortex Velocity" text={`I locked a planetary degree within ${result.difference}° in Vortex Velocity on Zenith Oracle!`} />
                <button onClick={startGame} className="flex-1 bg-transparent border border-[#D4AF37] text-[#D4AF37] font-bold py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest text-sm">Race Again</button>
              </div>
            </div>
          </motion.div>
        )}

        <AdRewarded show={showAd} onReward={() => { setShowAd(false); startGame(); }} onClose={() => setShowAd(false)} />
      </div>
    </div>
  );
};

export default VortexVelocity;