import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles, Lock, Eye, Shield, Star, Flame, Heart, Briefcase, Activity, Zap, Share2, Check } from 'lucide-react';
import axios from 'axios';
import { AdBanner, AdRewarded } from './AdComponents';
import { ShareButton } from './ShareCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = { Fire: Flame, Water: Moon, Air: Zap, Earth: Star };

const DailyOracle = () => {
  const [oracle, setOracle] = useState(null);
  const [dailyCard, setDailyCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extendedUnlocked, setExtendedUnlocked] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const unlocked = localStorage.getItem(`daily_extended_${today}`);
    if (unlocked) setExtendedUnlocked(true);

    const fetchData = async () => {
      try {
        const [oracleRes, cardRes] = await Promise.all([
          axios.get(`${API}/daily-oracle`),
          axios.get(`${API}/daily-tarot-card`),
        ]);
        setOracle(oracleRes.data);
        setDailyCard(cardRes.data);
      } catch (err) {
        console.error('Daily oracle fetch error:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleUnlockExtended = () => {
    setShowRewardedAd(true);
  };

  const handleReward = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`daily_extended_${today}`, 'true');
    setExtendedUnlocked(true);
    setShowRewardedAd(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center" data-testid="daily-oracle-loading">
        <div className="text-center constellation-loading">
          <span className="text-[#D4AF37] text-3xl mx-1">&#x2726;</span>
          <span className="text-[#D4AF37] text-2xl mx-1">&#x2727;</span>
          <span className="text-[#D4AF37] text-4xl mx-1">&#x2726;</span>
          <span className="text-[#D4AF37] text-2xl mx-1">&#x2727;</span>
          <span className="text-[#D4AF37] text-3xl mx-1">&#x2726;</span>
          <p className="text-white/30 text-xs mt-4 uppercase tracking-widest">Reading the stars...</p>
        </div>
      </div>
    );
  }

  if (!oracle) return null;

  const ElemIcon = ELEMENT_ICONS[oracle.moon_element] || Star;

  return (
    <div className="min-h-screen bg-[#020617] py-8 pb-28" data-testid="daily-oracle">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Sun className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] inline mr-3" />
            Daily <span className="text-[#D4AF37]">Oracle</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">{oracle.date} | Moon in {oracle.moon_sign} | Sun in {oracle.sun_sign}</p>
        </motion.div>

        {/* Energy Meter */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 mb-5 text-center" data-testid="daily-energy-meter">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ElemIcon className="w-6 h-6 text-[#D4AF37]" />
            <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">{oracle.theme.mood} Energy</p>
          </div>
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#D4AF37" strokeWidth="6" strokeDasharray={`${oracle.energy_level * 2.64} 264`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#D4AF37]">{oracle.energy_level}%</span>
            </div>
          </div>
          <p className="text-base text-white/80 font-semibold">{oracle.teaser.headline}</p>
          <p className="text-sm text-white/50 mt-1.5 leading-relaxed max-w-lg mx-auto">{oracle.teaser.summary}</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="bg-[#D4AF37]/10 rounded-lg px-3 py-1.5">
              <p className="text-[10px] text-white/30">Lucky Number</p>
              <p className="text-lg text-[#D4AF37] font-bold">{oracle.teaser.lucky_number}</p>
            </div>
            <div className="bg-[#D4AF37]/10 rounded-lg px-3 py-1.5">
              <p className="text-[10px] text-white/30">Lucky Color</p>
              <p className="text-sm text-[#D4AF37] font-semibold">{oracle.teaser.lucky_color}</p>
            </div>
            <div className="bg-[#D4AF37]/10 rounded-lg px-3 py-1.5">
              <p className="text-[10px] text-white/30">Focus</p>
              <p className="text-sm text-[#D4AF37] font-semibold">{oracle.theme.focus?.split('&')[0]?.trim()}</p>
            </div>
          </div>
        </motion.div>

        {/* Card of the Day */}
        {dailyCard && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5 mb-5" data-testid="daily-tarot-card">
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#D4AF37] liquid-gold-animation" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60 font-semibold">Card of the Day</p>
                <h3 className="text-lg font-bold text-[#D4AF37] mt-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>{dailyCard.name}</h3>
                <p className="text-[10px] text-white/30 mt-0.5">{dailyCard.arcana} Arcana | {dailyCard.element} | {dailyCard.upright ? 'Upright' : 'Reversed'}</p>
                <p className="text-sm text-white/60 mt-2 leading-relaxed">{dailyCard.meaning}</p>
                <p className="text-xs text-white/40 mt-1 italic">{dailyCard.daily_guidance}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ad Banner */}
        <AdBanner slot="daily-oracle-mid" className="mb-5" />

        {/* Extended Reading — Locked / Unlocked */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">Extended Daily Reading</h3>
            {!extendedUnlocked && (
              <button onClick={handleUnlockExtended} className="flex items-center gap-1.5 bg-[#D4AF37] text-[#020617] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider" data-testid="unlock-extended-btn">
                <Lock className="w-3 h-3" /> Watch to Unlock
              </button>
            )}
          </div>

          {extendedUnlocked ? (
            <div className="space-y-3" data-testid="extended-reading-unlocked">
              <ExtendedSection icon={Briefcase} label="Career & Strategy" text={oracle.extended.career} />
              <ExtendedSection icon={Heart} label="Love & Relationships" text={oracle.extended.love} />
              <ExtendedSection icon={Activity} label="Health & Vitality" text={oracle.extended.health} />
              <ExtendedSection icon={Zap} label="Wealth & Prosperity" text={oracle.extended.wealth} />
              <div className="glass-card rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] text-white/30">Best Hours</p><p className="text-xs text-[#D4AF37] font-semibold">{oracle.extended.best_hours}</p></div>
                  <div><p className="text-[10px] text-white/30">Avoid</p><p className="text-xs text-red-400/70 font-semibold">{oracle.extended.avoid_hours}</p></div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#D4AF37]/10">
                  <p className="text-[10px] text-white/30">Today's Mantra</p>
                  <p className="text-sm text-[#D4AF37] italic mt-1">"{oracle.extended.mantra}"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden" data-testid="extended-reading-locked">
              <div className="absolute inset-0 backdrop-blur-md bg-[#020617]/70 flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-sm text-white/60">Watch a brief cosmic transmission</p>
                  <p className="text-[10px] text-white/30">to unlock Career, Love, Health & Wealth insights</p>
                  <button onClick={handleUnlockExtended} className="mt-3 bg-[#D4AF37] text-[#020617] px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider" data-testid="unlock-extended-overlay-btn">
                    Unlock Now
                  </button>
                </div>
              </div>
              <div className="opacity-20 space-y-3">
                <div className="h-16 bg-white/5 rounded-xl" />
                <div className="h-16 bg-white/5 rounded-xl" />
                <div className="h-16 bg-white/5 rounded-xl" />
                <div className="h-16 bg-white/5 rounded-xl" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Transit Data */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-5 mb-5" data-testid="daily-transits">
          <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-3">Today's Planetary Transits</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {oracle.transits && Object.entries(oracle.transits).map(([name, data]) => (
              <div key={name} className="bg-white/5 rounded-lg p-2.5">
                <p className="text-[10px] text-[#D4AF37] font-semibold">{name}</p>
                <p className="text-xs text-white/60">{data.sign} {data.degree?.toFixed(1)}&deg;</p>
                <p className="text-[10px] text-white/30">{data.speed?.toFixed(4)}&deg;/day</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scripture */}
        <div className="glass-card rounded-xl p-3 mb-5">
          <div className="flex items-center gap-1">
            <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
            <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
          </div>
          <p className="text-[10px] text-white/30 mt-1">{oracle.scripture}</p>
        </div>

        {/* Share + Ad */}
        <ShareButton title="Daily Oracle" text={`Today's cosmic energy: ${oracle.energy_level}% | Moon in ${oracle.moon_sign} | Card: ${dailyCard?.name}. Get your daily oracle on Zenith Oracle!`} />
        <AdBanner slot="daily-oracle-bottom" className="mt-4" />
      </div>

      {/* Rewarded Ad Modal */}
      <AdRewarded show={showRewardedAd} onReward={handleReward} onClose={() => setShowRewardedAd(false)} />
    </div>
  );
};

const ExtendedSection = ({ icon: Icon, label, text }) => (
  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-xl p-4 flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-[#D4AF37]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-[0.15em] text-[#D4AF37] font-semibold">{label}</p>
      <p className="text-sm text-white/60 mt-1 leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

export default DailyOracle;
