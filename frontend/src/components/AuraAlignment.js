import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuraAlignment = () => {
  const [gameState, setGameState] = useState('intro');
  const [moonSign, setMoonSign] = useState('');
  const [targetFrequency, setTargetFrequency] = useState(528);
  const [userFrequency, setUserFrequency] = useState(400);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [result, setResult] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [oscillator, setOscillator] = useState(null);
  const [score, setScore] = useState(0);

  const solfeggioMap = {
    'Aries': 396, 'Taurus': 417, 'Gemini': 528,
    'Cancer': 639, 'Leo': 741, 'Virgo': 852,
    'Libra': 528, 'Scorpio': 639, 'Sagittarius': 741,
    'Capricorn': 396, 'Aquarius': 852, 'Pisces': 963
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const difference = Math.abs(userFrequency - targetFrequency);
      const newGlow = Math.max(0, 100 - (difference / 2));
      setGlowIntensity(newGlow);
    }
  }, [userFrequency, targetFrequency]);

  const fetchMoonSign = async () => {
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

      const moon = response.data.planets.find(p => p.name === 'Moon');
      if (moon) {
        setMoonSign(moon.sign);
        setTargetFrequency(solfeggioMap[moon.sign] || 528);
      }
    } catch (error) {
      console.error('Failed to fetch moon sign:', error);
    }
  };

  const startGame = async () => {
    await fetchMoonSign();
    setGameState('playing');
    setUserFrequency(400);
    setResult(null);
    
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);
  };

  const playTone = () => {
    if (audioContext) {
      if (oscillator) {
        oscillator.stop();
      }
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.frequency.value = userFrequency;
      gainNode.gain.value = 0.3;
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start();
      setOscillator(osc);
      
      setTimeout(() => osc.stop(), 1000);
    }
  };

  const lockFrequency = () => {
    const difference = Math.abs(userFrequency - targetFrequency);
    const precision = difference < 5 ? 'Perfect' : difference < 20 ? 'Excellent' : difference < 50 ? 'Good' : 'Miss';
    
    if (precision === 'Perfect' || precision === 'Excellent') {
      const points = precision === 'Perfect' ? 1000 : 500;
      setScore(score + points);
      setResult({ success: true, precision, difference: difference.toFixed(2), points });
    } else {
      setResult({ success: false, precision, difference: difference.toFixed(2) });
    }
    
    if (oscillator) oscillator.stop();
    setGameState('result');
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Volume2 className="w-12 h-12 text-[#D4AF37] mr-4" />
            Aura <span className="text-[#D4AF37] ml-2">Alignment</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">Match Your Frequency to the Moon's Solfeggio Tone</p>
        </motion.div>

        {gameState === 'intro' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-[#D4AF37]/20 rounded-full flex items-center justify-center border-4 border-[#D4AF37]">
                <Volume2 className="w-16 h-16 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Frequency Mastery</h2>
              <p className="text-white/70">Align your aura by matching the current Moon's Solfeggio frequency</p>
              {score > 0 && (
                <div className="mt-4 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-lg px-6 py-3 inline-block">
                  <p className="text-[#D4AF37] font-bold text-xl">Total Score: {score}</p>
                </div>
              )}
            </div>

            <button onClick={startGame} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest gold-pulse">
              Begin Alignment
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Moon in {moonSign}</h3>
              <p className="text-white/60 text-sm">Find the resonant frequency</p>
            </div>

            <div className="mb-8">
              <div 
                className="w-64 h-64 mx-auto rounded-full transition-all duration-300"
                style={{
                  backgroundColor: `rgba(212, 175, 55, ${glowIntensity / 200})`,
                  boxShadow: `0 0 ${glowIntensity}px rgba(212, 175, 55, ${glowIntensity / 100})`,
                  border: `${Math.max(2, glowIntensity / 20)}px solid rgba(212, 175, 55, ${glowIntensity / 100})`
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white mb-2">{userFrequency}</div>
                    <div className="text-sm text-white/60">Hz</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Aura Clarity: {glowIntensity.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="200"
                max="1200"
                step="1"
                value={userFrequency}
                onChange={(e) => setUserFrequency(parseInt(e.target.value))}
                className="w-full mb-4"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={playTone} className="bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-bold py-3 hover:bg-[#D4AF37]/30 transition-all uppercase tracking-widest text-sm">
                  <Volume2 className="w-4 h-4 inline mr-2" />
                  Play Tone
                </button>
                <button onClick={lockFrequency} className="bg-[#D4AF37] text-[#020617] font-bold py-3 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest text-sm">
                  Lock Frequency
                </button>
              </div>
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
                  <Activity className="w-24 h-24 text-red-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-bold text-red-400 mb-2">Out of Tune</h2>
                </>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#020617]/60 border border-[#D4AF37]/40 rounded-lg p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Your Frequency</div>
                <div className="text-3xl font-bold text-white">{userFrequency} Hz</div>
              </div>
              <div className="bg-[#020617]/60 border border-[#D4AF37]/40 rounded-lg p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Target ({moonSign})</div>
                <div className="text-3xl font-bold text-[#D4AF37]">{targetFrequency} Hz</div>
              </div>
              <div className="bg-[#020617]/60 border border-[#D4AF37]/40 rounded-lg p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Difference</div>
                <div className="text-3xl font-bold text-white">{result.difference} Hz</div>
              </div>
            </div>

            <button onClick={startGame} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest">
              Align Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuraAlignment;