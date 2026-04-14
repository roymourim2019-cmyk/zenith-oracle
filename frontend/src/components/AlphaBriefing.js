import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, Pause, SkipForward, Volume2, VolumeX, Shield, Sparkles, Clock, Sun, Zap } from 'lucide-react';
import axios from 'axios';
import { AdBanner, AdRewarded } from './AdComponents';
import { ShareButton } from './ShareCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AlphaBriefing = () => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const cached = localStorage.getItem(`alpha_briefing_${today}`);
    if (cached) {
      try { setBriefing(JSON.parse(cached)); setUnlocked(true); } catch (e) {}
    }
  }, []);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const profileStr = localStorage.getItem('zenith_user_profile');
      let payload = {};
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        payload = { birth_date: profile.birth_date, birth_time: profile.birth_time, latitude: profile.latitude, longitude: profile.longitude };
      }
      const res = await axios.post(`${API}/alpha-briefing`, null, { params: payload });
      setBriefing(res.data);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`alpha_briefing_${today}`, JSON.stringify(res.data));
      setUnlocked(true);
    } catch (err) {
      console.error('Alpha briefing error:', err);
    }
    setLoading(false);
  };

  const handleUnlock = () => {
    setShowRewardedAd(true);
  };

  const handleReward = () => {
    setShowRewardedAd(false);
    fetchBriefing();
  };

  const speakBriefing = () => {
    if (!briefing?.briefing) return;
    if (speaking && !paused) {
      speechSynthesis.pause();
      setPaused(true);
      return;
    }
    if (paused) {
      speechSynthesis.resume();
      setPaused(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(briefing.briefing);
    utter.rate = 0.95;
    utter.pitch = 0.9;
    utter.volume = 1;
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.name.includes('Male'));
    if (preferred) utter.voice = preferred;
    utter.onend = () => { setSpeaking(false); setPaused(false); };
    utter.onerror = () => { setSpeaking(false); setPaused(false); };
    utteranceRef.current = utter;
    speechSynthesis.speak(utter);
    setSpeaking(true);
    setPaused(false);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-8 pb-28" data-testid="alpha-briefing">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] inline mr-3" />
            Alpha <span className="text-[#D4AF37]">Briefing</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">60-Second Morning Strategy Audio | Swiss Ephemeris + Gemini AI</p>
          <p className="text-[10px] text-white/20 mt-1 italic">Your daily cosmic intelligence briefing</p>
        </motion.div>

        {!unlocked ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-5">
                <Mic className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Morning Strategy Awaits</h3>
              <p className="text-sm text-white/50 mb-6">A personalized 60-second audio briefing powered by real planetary transits and Gemini AI. Covers energy, strategy, danger zones, and your power mantra.</p>
              <div className="flex items-center justify-center gap-3 mb-6 text-xs text-white/30">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 60 sec</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Real transits</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI-powered</span>
              </div>
              <button onClick={handleUnlock} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 rounded-xl hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest text-sm" data-testid="unlock-briefing-btn">
                {loading ? 'Generating Briefing...' : 'Watch & Unlock Today\'s Briefing'}
              </button>
              <p className="text-[10px] text-white/20 mt-2">Brief cosmic transmission required</p>
            </div>
            <AdBanner slot="alpha-briefing-locked" className="mt-4" />
          </motion.div>
        ) : briefing ? (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Date + Transit Banner */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60 font-semibold">Alpha Briefing</p>
                  <p className="text-lg font-bold text-white">{briefing.day}, {briefing.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/30">Universal Day</p>
                  <p className="text-2xl text-[#D4AF37] font-bold">{briefing.day_number}</p>
                </div>
              </div>
              {briefing.transits?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {briefing.transits.map((t, i) => (
                    <span key={i} className="text-[10px] bg-white/5 text-white/40 px-2 py-1 rounded">{t}</span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Audio Player */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 text-center border-[#D4AF37]/40">
              <div className="flex items-center justify-center gap-4 mb-4">
                <button onClick={speakBriefing} className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center hover:bg-[#F3E5AB] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]" data-testid="play-briefing-btn">
                  {speaking && !paused ? <Pause className="w-7 h-7 text-[#020617]" /> : <Play className="w-7 h-7 text-[#020617] ml-1" />}
                </button>
                {speaking && (
                  <button onClick={stopSpeaking} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors" data-testid="stop-briefing-btn">
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-white/30">{speaking ? (paused ? 'Paused — tap play to resume' : 'Speaking your briefing...') : 'Tap play to hear your briefing'}</p>
              {speaking && !paused && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[...Array(12)].map((_, i) => (
                    <motion.div key={i} animate={{ height: [4, 16 + Math.random() * 16, 4] }} transition={{ repeat: Infinity, duration: 0.6 + Math.random() * 0.4, delay: i * 0.05 }} className="w-1 bg-[#D4AF37] rounded-full" />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Written Briefing */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6" data-testid="briefing-text">
              <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3 font-semibold">Written Briefing</h3>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{briefing.briefing}</p>
            </motion.div>

            {/* Scripture */}
            <div className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
              </div>
              <p className="text-[10px] text-white/30 mt-1">{briefing.scripture}</p>
            </div>

            {/* Share + Ad */}
            <ShareButton title="Alpha Briefing" text={`Today's Alpha Briefing: ${briefing.briefing?.slice(0, 100)}... Get yours on Zenith Oracle!`} />
            <AdBanner slot="alpha-briefing-bottom" className="mt-4" />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="constellation-loading">
              <span className="text-[#D4AF37] text-3xl mx-1">&#x2726;</span>
              <span className="text-[#D4AF37] text-2xl mx-1">&#x2727;</span>
              <span className="text-[#D4AF37] text-4xl mx-1">&#x2726;</span>
            </div>
            <p className="text-white/30 text-xs mt-4 uppercase tracking-widest">Channeling the Oracle...</p>
          </div>
        )}
      </div>
      <AdRewarded show={showRewardedAd} onReward={handleReward} onClose={() => setShowRewardedAd(false)} />
    </div>
  );
};

export default AlphaBriefing;
