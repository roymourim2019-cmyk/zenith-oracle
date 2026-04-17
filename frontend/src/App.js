import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Star, Moon, Sun, Zap, TrendingUp, 
  Users, ChevronRight, Globe, Hash, Mic,
  Gamepad2, Home as HomeIcon, LayoutDashboard, Swords, Activity,
  Volume2, Crown, Eye, Scroll, Heart, Download, X, Flame, Bell, BellRing
} from "lucide-react";
import "@/App.css";

// Components
import AdManager from "./AdManager"; 
import Dashboard from "./components/Dashboard";
import VedicChart from "./components/VedicChart";
import WesternChart from "./components/WesternChart";
import ChineseAstrology from "./components/ChineseAstrology";
import NumerologyCalculator from "./components/NumerologyCalculator";
import TarotReader from "./components/TarotReader";
import CompatibilityChecker from "./components/CompatibilityChecker";
import DailyOracle from "./components/DailyOracle";
import AlphaBriefing from "./components/AlphaBriefing";
import { AdBanner } from "./components/AdComponents";
import AdManager from "./AdManager";
import ChartPDFUnlock from "./components/ChartPDFUnlock";
import { useUserProfile, useStreak, useReadingsCount, useRatingPrompt, useInstallPrompt } from "./hooks/useAppFeatures";
import { usePushNotifications } from "./hooks/usePushNotifications";

// Custom Hooks 
import { useUserProfile, useStreak, useRatingPrompt } from "./hooks/useAppFeatures";

const App = () => {
  const { profile, saveProfile } = useUserProfile();
  const { streak, recordVisit } = useStreak();
  const { shouldShowRating, dismissRating } = useRatingPrompt();

  useEffect(() => {
    recordVisit();
  }, []);

  return (
    <div className="App min-h-screen bg-[#020617] text-white">
      <BrowserRouter>
        <AdManager /> 
        
        <Routes>
          {/* Birth Data Login replaces the old Enterprise Keys */}
          <Route path="/" element={
            !profile ? <BirthDataLogin onSave={saveProfile} /> : <Home profile={profile} streak={streak} />
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daily" element={<DailyOracle />} />
          <Route path="/alpha-briefing" element={<AlphaBriefing />} />
          <Route path="/vedic" element={<VedicChart />} />
          <Route path="/western" element={<WesternChart />} />
          <Route path="/chinese" element={<ChineseAstrology />} />
          <Route path="/numerology" element={<NumerologyCalculator />} />
          <Route path="/tarot" element={<TarotReader />} />
          <Route path="/compatibility" element={<CompatibilityChecker />} />
        </Routes>
        
        <BottomNav />
      </BrowserRouter>

      {shouldShowRating && <RatingPrompt onDismiss={dismissRating} />}

      <AdManager />
    </div>
  );
};

/* ───────── THE BIRTH DATA LOGIN ───────── */
const BirthDataLogin = ({ onSave }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    dob: '', 
    tob: '', 
    pob: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.dob) {
      onSave(formData);
    }
  };

/* ───────── HOME PAGE ───────── */
const Home = ({ profile, streak, readingsCount, canInstall, onInstall, onDismissInstall }) => {
  const { isSupported: notifSupported, isSubscribed: notifSubscribed, subscribe: notifSubscribe } = usePushNotifications();
  const [notifDismissed, setNotifDismissed] = useState(() => !!localStorage.getItem('zenith_notif_dismissed'));

  const handleNotifSubscribe = async () => {
    await notifSubscribe(profile?.name);
    setNotifDismissed(true);
  };
  const dismissNotif = () => {
    localStorage.setItem('zenith_notif_dismissed', 'true');
    setNotifDismissed(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-card p-10 rounded-[40px] border border-[#D4AF37]/20 w-full max-w-md text-center relative z-10"
      >
        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20">
          <Sparkles className="w-10 h-10 text-[#D4AF37]" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2 tracking-tight" style={{ fontFamily: 'Playfair Display' }}>Initialize Oracle</h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mb-10">Aligning with the 2026 Transit Matrix</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input 
              type="text" placeholder="Full Name" required
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#D4AF37] outline-none transition-all placeholder:text-white/20 text-sm"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="text-left flex flex-col gap-2">
              <label className="text-[9px] text-[#D4AF37] ml-2 uppercase font-black tracking-widest">Date of Birth</label>
              <input 
                type="date" required
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#D4AF37] outline-none text-sm"
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
              />
            </div>
          </nav>
        </header>

        {/* Install Banner */}
        {canInstall && (
          <InstallBanner onInstall={onInstall} onDismiss={onDismissInstall} />
        )}

        {/* Push Notification Opt-In */}
        {notifSupported && !notifSubscribed && !notifDismissed && profile && (
          <NotificationBanner onSubscribe={handleNotifSubscribe} onDismiss={dismissNotif} />
        )}

        {/* Personalized Greeting */}
        {profile && (
          <div className="container mx-auto px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Welcome back, <span className="text-[#D4AF37] font-semibold">{profile.name}</span></p>
                <p className="text-[10px] text-white/30 mt-0.5">Born: {profile.birth_date} | The cosmos remembers you</p>
              </div>
              {streak.count >= 3 && (
                <div className="text-right">
                  <p className="text-xs text-[#D4AF37]">{streak.count >= 7 ? 'Cosmic Master' : streak.count >= 3 ? 'Rising Oracle' : ''}</p>
                  <p className="text-[10px] text-white/20">Best: {streak.best} days</p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="text-left flex flex-col gap-2">
                <label className="text-[9px] text-white/30 ml-2 uppercase font-black tracking-widest">Time (Optional)</label>
                <input 
                  type="time" 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#D4AF37] outline-none text-sm"
                  onChange={(e) => setFormData({...formData, tob: e.target.value})}
                />
             </div>
             <div className="text-left flex flex-col gap-2">
                <label className="text-[9px] text-white/30 ml-2 uppercase font-black tracking-widest">Birth Place</label>
                <input 
                  type="text" placeholder="City"
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#D4AF37] outline-none text-sm placeholder:text-white/20"
                  onChange={(e) => setFormData({...formData, pob: e.target.value})}
                />
             </div>
          </div>

          <button type="submit" className="w-full py-6 bg-[#D4AF37] text-black font-black rounded-3xl uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">
            Reveal My Destiny
          </button>
        </form>
      </motion.div>
    </div>
  );
};

/* ───────── HOME DASHBOARD ───────── */
const Home = ({ profile, streak }) => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen pb-32">
      <header className="p-8 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.3em] mb-1">Authenticated User</span>
          <h1 className="text-2xl font-bold tracking-tighter uppercase" style={{fontFamily: 'Playfair Display'}}>{profile.name}</h1>
        </div>

        {/* Birth Chart PDF — Rewarded Video Unlock */}
        {profile && (
          <div className="container mx-auto px-6 py-4">
            <ChartPDFUnlock profile={profile} />
          </div>
        )}

        {/* Sovereign 9 Matrix (now with Compatibility) */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
              The <span className="text-[#D4AF37]">Sovereign Matrix</span>
            </h3>
            <p className="text-sm text-white/40">Ten modules of cosmic intelligence — all free, forever</p>
          </div>
          <div className="sovereign-grid">
            <FeatureCard icon={<Sun className="w-10 h-10 text-[#D4AF37]" />} title="Daily Oracle" description="Free daily horoscope + Card of the Day. Unlock extended Career/Love/Health insights." link="/daily" isNew />
            <FeatureCard icon={<Mic className="w-10 h-10 text-[#D4AF37]" />} title="Alpha Briefing" description="60-second AI morning strategy audio. Real transits + Gemini intelligence." link="/alpha-briefing" isNew />
            <FeatureCard icon={<Moon className="w-10 h-10 text-[#D4AF37]" />} title="Vedic Zenith" description="D1-D60 divisional charts, Vimshottari Dasha, Pancha-Pakshi Oracle" link="/vedic" />
            <FeatureCard icon={<Sun className="w-10 h-10 text-[#D4AF37]" />} title="Western Zenith" description="Tropical zodiac, Placidus houses, planetary aspects analysis" link="/western" />
            <FeatureCard icon={<Sparkles className="w-10 h-10 text-[#D4AF37]" />} title="Tarot Oracle" description="78+44 cards, 5 reading types, personalized deck weighting" link="/tarot" />
            <FeatureCard icon={<Hash className="w-10 h-10 text-[#D4AF37]" />} title="Numerology Vault" description="Chaldean, Pythagorean & Vedic triple-system analysis" link="/numerology" />
            <FeatureCard icon={<Globe className="w-10 h-10 text-[#D4AF37]" />} title="Chinese Oracle" description="Lunisolar zodiac, Five Elements, Yin-Yang compatibility" link="/chinese" />
            <FeatureCard icon={<Heart className="w-10 h-10 text-[#D4AF37]" />} title="Compatibility" description="Cross-system partner match: Moon + Dasha + Numerology + Chinese" link="/compatibility" isNew />
            <FeatureCard icon={<Zap className="w-10 h-10 text-[#D4AF37]" />} title="Power Meter" description="0-100% dominance gauge from real-time planetary transits" link="/power-meter" />
            <FeatureCard icon={<Scroll className="w-10 h-10 text-[#D4AF37]" />} title="Scriptural Synthesis" description="Cross-system verdict: all five traditions converged" link="/synthesis" />
            <FeatureCard icon={<Eye className="w-10 h-10 text-[#D4AF37]" />} title="Accuracy Lab" description="Engine status, Delta-T, Ayanamsha live monitoring" link="/accuracy-lab" />
          </div>
        </section>

        {/* WAR ROOM */}
        <section className="container mx-auto px-6 py-16 relative" style={{ zIndex: 100, overflow: 'visible', height: 'auto' }} id="war-room" data-testid="war-room-section">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#D4AF37] mb-3 war-room-pulse" style={{ fontFamily: 'Playfair Display, serif' }} data-testid="war-room-header">
              THE WAR ROOM
            </h3>
            <p className="text-[#94A3B8] text-base max-w-2xl mx-auto">
              Five celestial battlegrounds forged from Swiss Ephemeris precision. Enter, compete, dominate.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-5" style={{ overflow: 'visible', minHeight: 'auto' }}>
            <GameCard icon={<TrendingUp className="w-9 h-9 text-[#D4AF37]" />} title="Market Siege" description="60-second numerology battle — crush opponents with your name vibration." link="/market-siege" badge="Numerology" index={0} />
            <GameCard icon={<Eye className="w-9 h-9 text-[#D4AF37]" />} title="Oracle's Trial" description="5-round tarot intuition challenge — identify true meanings." link="/oracles-trial" badge="Tarot" index={1} />
            <GameCard icon={<Activity className="w-9 h-9 text-[#D4AF37]" />} title="Vortex Velocity" description="Lock planetary degrees with arc-second precision." link="/vortex-velocity" badge="Transit" index={2} />
            <GameCard icon={<Volume2 className="w-9 h-9 text-[#D4AF37]" />} title="Aura Alignment" description="Match your frequency to the Moon's Solfeggio tone." link="/aura-alignment" badge="Solfeggio" index={3} />
            <GameCard icon={<Crown className="w-9 h-9 text-[#D4AF37]" />} title="Sovereign Duel" description="Chart vs. Chart — seven planets clash for supremacy." link="/sovereign-duel" badge="Vedic" index={4} />
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="container mx-auto px-6 py-4">
          <AdBanner slot="home-bottom" />
        </div>
      </main>

      {/* Play Store Revenue Slot */}
      <div className="fixed bottom-32 left-8 right-8 h-20 bg-white/5 rounded-3xl flex flex-col items-center justify-center border border-white/5 backdrop-blur-md">
          <span className="text-[8px] text-white/20 uppercase font-black tracking-[0.5em]">Sponsored Insight</span>
          <div className="w-12 h-1 bg-[#D4AF37]/20 mt-2 rounded-full" />
      </div>
    </div>
  );
};

const MenuCard = ({ icon, title, path }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(path)} className="bg-white/5 border border-white/10 p-8 rounded-[35px] flex flex-col items-start gap-4 hover:border-[#D4AF37]/40 transition-all cursor-pointer group active:scale-95">
      <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
    </div>
  );
};

/* ───────── Notification Banner ───────── */
const NotificationBanner = ({ onSubscribe, onDismiss }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-6 mb-4" data-testid="notification-banner">
    <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-[#D4AF37]/20">
      <div className="flex items-center gap-3">
        <BellRing className="w-6 h-6 text-[#D4AF37]" />
        <div>
          <p className="text-sm text-white font-semibold">Daily Oracle Digest</p>
          <p className="text-[10px] text-white/30">Get your cosmic energy update every morning</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onSubscribe} className="bg-[#D4AF37] text-[#020617] font-bold py-2 px-5 rounded-lg text-xs uppercase tracking-widest" data-testid="notif-subscribe-btn">
          Enable
        </button>
        <button onClick={onDismiss} className="text-white/20 hover:text-white/40 transition-colors" data-testid="dismiss-notif-btn">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

/* ───────── Starfield ───────── */
const Starfield = () => {
  useEffect(() => {
    const container = document.getElementById('starfield-container');
    if (!container) return;
    
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.opacity = Math.random() * 0.5 + 0.2;
      container.appendChild(star);
    }
    
    const handleOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = Math.min(Math.max(e.gamma, -30), 30) / 30;
        const y = Math.min(Math.max(e.beta - 45, -30), 30) / 30;
        container.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
      }
    };
    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      container.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
    };
    
    if (window.DeviceOrientationEvent) window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouse);
    container.classList.add('starfield-parallax');
    
    return () => {
      if (container) container.innerHTML = '';
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);
  
  return <div id="starfield-container" className="starfield" />;
};

const NavButton = ({ icon, onClick, label, active }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#D4AF37]' : 'text-white/20'}`}>
        {React.cloneElement(icon, { size: 20 })}
        <span className="text-[8px] font-black uppercase">{label}</span>
    </button>
);

const RatingPrompt = ({ onDismiss }) => (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-10 z-[1001] backdrop-blur-xl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] p-12 rounded-[50px] border border-[#D4AF37]/30 text-center max-w-sm shadow-3xl">
            <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                <Star className="w-10 h-10 text-black fill-black" />
            </div>
            <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>Enjoying Zenith?</h3>
            <p className="text-white/40 text-xs mb-10 leading-relaxed uppercase tracking-widest">Rate us 5 stars on the Play Store to unlock even deeper cosmic features.</p>
            <div className="flex flex-col gap-4">
                <button onClick={onDismiss} className="w-full py-5 bg-[#D4AF37] text-black font-black rounded-2xl text-[11px] uppercase tracking-widest">Support with 5 Stars</button>
                <button onClick={onDismiss} className="text-white/20 text-[10px] uppercase font-black tracking-widest py-2">Later</button>
            </div>
        </motion.div>
    </div>
);

export default App;
