import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Star, Moon, Sun, Zap, TrendingUp, 
  Users, ChevronRight, Globe, Hash, Mic,
  Gamepad2, Home as HomeIcon, LayoutDashboard, Swords, Activity,
  Volume2, Crown, Eye, Scroll, Heart, Download, X, Flame
} from "lucide-react";
import "@/App.css";
import Dashboard from "./components/Dashboard";
import VedicChart from "./components/VedicChart";
import WesternChart from "./components/WesternChart";
import ChineseAstrology from "./components/ChineseAstrology";
import NumerologyCalculator from "./components/NumerologyCalculator";
import TarotReader from "./components/TarotReader";
import PowerMeter from "./components/PowerMeter";
import AccuracyLab from "./components/AccuracyLab";
import MarketSiege from "./components/MarketSiege";
import OraclesTrial from "./components/OraclesTrial";
import VortexVelocity from "./components/VortexVelocity";
import AuraAlignment from "./components/AuraAlignment";
import SovereignDuel from "./components/SovereignDuel";
import SovereignSynthesis from "./components/SovereignSynthesis";
import GlobalSuccessMap from "./components/GlobalSuccessMap";
import BiometricVault from "./components/BiometricVault";
import NegotiationSimulator from "./components/NegotiationSimulator";
import PrecisionAlerts from "./components/PrecisionAlerts";
import VocalOracle from "./components/VocalOracle";
import CompatibilityChecker from "./components/CompatibilityChecker";
import OnboardingFlow from "./components/OnboardingFlow";
import DailyOracle from "./components/DailyOracle";
import AlphaBriefing from "./components/AlphaBriefing";
import { AdBanner } from "./components/AdComponents";
import AdManager from "./AdManager";
import { useUserProfile, useStreak, useReadingsCount, useRatingPrompt, useInstallPrompt } from "./hooks/useAppFeatures";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const App = () => {
  const { profile, saveProfile, isOnboarded, markOnboarded } = useUserProfile();
  const { streak, recordVisit } = useStreak();
  const { readingsCount, incrementReadings } = useReadingsCount();
  const { shouldShowRating, checkRating, dismissRating } = useRatingPrompt();
  const { canInstall, install, dismissInstall } = useInstallPrompt();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isOnboarded) {
      setShowOnboarding(true);
    }
    recordVisit();
  }, []);

  const handleOnboardComplete = (profileData) => {
    saveProfile(profileData);
    markOnboarded();
    setShowOnboarding(false);
  };

  return (
    <div className="App min-h-screen bg-[#020617]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Home 
              profile={profile}
              streak={streak}
              readingsCount={readingsCount}
              canInstall={canInstall}
              onInstall={install}
              onDismissInstall={dismissInstall}
            />
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
          <Route path="/power-meter" element={<PowerMeter />} />
          <Route path="/accuracy-lab" element={<AccuracyLab />} />
          <Route path="/market-siege" element={<MarketSiege />} />
          <Route path="/oracles-trial" element={<OraclesTrial />} />
          <Route path="/global-success-map" element={<GlobalSuccessMap />} />
          <Route path="/biometric-vault" element={<BiometricVault />} />
          <Route path="/negotiation-simulator" element={<NegotiationSimulator />} />
          <Route path="/precision-alerts" element={<PrecisionAlerts />} />
          <Route path="/vortex-velocity" element={<VortexVelocity />} />
          <Route path="/aura-alignment" element={<AuraAlignment />} />
          <Route path="/sovereign-duel" element={<SovereignDuel />} />
          <Route path="/synthesis" element={<SovereignSynthesis />} />
        </Routes>
        <GlobalFooter />
        <BottomNav />
        <VocalOracle />
      </BrowserRouter>

      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardComplete} />
      )}

      {shouldShowRating && <RatingPrompt onDismiss={dismissRating} />}

      <AdManager />
    </div>
  );
};

/* ───────── Global Footer ───────── */
const GlobalFooter = () => {
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <footer className="pb-20 pt-8 border-t border-white/5" data-testid="global-footer">
      <p className="text-center text-[#6B7280] text-xs tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
        &copy; 2026 Roy's Enterprise. All Rights Reserved.
      </p>
    </footer>
  );
};

/* ───────── Rating Prompt ───────── */
const RatingPrompt = ({ onDismiss }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4" data-testid="rating-prompt">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 max-w-sm w-full text-center">
      <span className="text-4xl block mb-4">&#x2B50;</span>
      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Enjoying Zenith Oracle?</h3>
      <p className="text-sm text-white/60 mb-6">Your support helps us bring cosmic wisdom to more seekers worldwide.</p>
      <div className="flex gap-3">
        <button onClick={() => { onDismiss(); }} className="flex-1 bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl text-xs uppercase tracking-widest" data-testid="rate-yes-btn">
          Rate 5 Stars
        </button>
        <button onClick={onDismiss} className="px-4 py-3 rounded-xl border border-white/10 text-white/30 text-xs" data-testid="rate-later-btn">
          Later
        </button>
      </div>
    </motion.div>
  </div>
);

/* ───────── HOME PAGE ───────── */
const Home = ({ profile, streak, readingsCount, canInstall, onInstall, onDismissInstall }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/6141905/pexels-photo-6141905.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')"
        }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <nav className="flex justify-between items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{fontFamily: 'Playfair Display, serif'}}>
                ZENITH <span className="text-[#D4AF37]">ORACLE</span>
              </h1>
            </motion.div>

            <div className="flex items-center space-x-3">
              {/* Streak Badge */}
              {streak.count > 0 && (
                <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg" data-testid="streak-badge">
                  <Flame className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs text-[#D4AF37] font-bold">{streak.count}</span>
                  <span className="text-[9px] text-white/30">day{streak.count !== 1 ? 's' : ''}</span>
                </div>
              )}
              {/* Readings Counter */}
              <div className="hidden sm:flex items-center gap-1 text-white/30 text-[10px]">
                <span className="text-[#D4AF37] font-bold">{readingsCount.toLocaleString()}</span> readings
              </div>
            </div>
          </nav>
        </header>

        {/* Install Banner */}
        {canInstall && (
          <InstallBanner onInstall={onInstall} onDismiss={onDismissInstall} />
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
        )}

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 sm:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 gold-glow" style={{fontFamily: 'Playfair Display, serif'}}>
                Scripture-Bound Deterministic Math
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-[#94A3B8] mb-6 font-light">
                100% Free. Ancient Wisdom. Swiss Ephemeris Precision.
              </p>
              <p className="text-base text-white/60 mb-10 leading-relaxed max-w-2xl mx-auto">
                Vedic D1-D60 charts. Western Topocentric. Chinese Lunisolar. AI insights. 
                Tarot Oracle. 5 Strategy Games. All powered by real astronomical calculations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/daily">
                  <button className="oracle-button text-white font-bold py-4 px-12 text-base uppercase tracking-widest" data-testid="daily-oracle-button">
                    Today's Oracle
                    <ChevronRight className="inline ml-2 w-6 h-6" />
                  </button>
                </a>
                <a href="/dashboard">
                  <button className="border border-[#D4AF37]/40 text-[#D4AF37] font-bold py-4 px-8 text-sm uppercase tracking-widest rounded-xl hover:bg-[#D4AF37]/10 transition-all" data-testid="enter-oracle-button">
                    Full Oracle Matrix
                  </button>
                </a>
                <a href="/compatibility">
                  <button className="border border-white/20 text-white/60 font-bold py-4 px-8 text-sm uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all" data-testid="compatibility-cta">
                    <Heart className="inline mr-2 w-4 h-4" />
                    Compatibility
                  </button>
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/30">
                <span><span className="text-[#D4AF37] font-bold">10,000+</span> readings performed</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span><span className="text-[#D4AF37] font-bold">4.9</span> App Rating</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span><span className="text-[#D4AF37] font-bold">100%</span> Free</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Oracle Feed Ticker */}
        <HomeOracleTicker />

        {/* Ad Banner */}
        <div className="container mx-auto px-6 py-4">
          <AdBanner slot="home-top" />
        </div>

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

        {/* Footer */}
        <footer className="border-t border-[#D4AF37]/20 py-8 mt-12">
          <div className="container mx-auto px-6 text-center">
            <p className="text-[#94A3B8] text-sm">
              Swiss Ephemeris-powered. Scripture-Bound Deterministic Math. 100% Free.
            </p>
            <p className="text-[#6B7280] text-xs mt-3 tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              &copy; 2026 Roy's Enterprise. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

/* ───────── Install Banner ───────── */
const InstallBanner = ({ onInstall, onDismiss }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-6 mb-4" data-testid="install-banner">
    <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-[#D4AF37]/40">
      <div className="flex items-center gap-3">
        <Download className="w-6 h-6 text-[#D4AF37]" />
        <div>
          <p className="text-sm text-white font-semibold">Install Zenith Oracle</p>
          <p className="text-[10px] text-white/30">Add to home screen for the full experience</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onInstall} className="bg-[#D4AF37] text-[#020617] font-bold py-2 px-5 rounded-lg text-xs uppercase tracking-widest" data-testid="install-btn">
          Install
        </button>
        <button onClick={onDismiss} className="text-white/20 hover:text-white/40 transition-colors" data-testid="dismiss-install-btn">
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

/* ───────── Feature Card ───────── */
const FeatureCard = ({ icon, title, description, link, isGame, isNew }) => (
  <motion.a
    href={link || '#'}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 block cursor-pointer ${
      isGame ? 'border-[#D4AF37]/80 bg-gradient-to-br from-[#D4AF37]/5 to-transparent hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
      : 'hover:border-[#D4AF37]/60'
    }`}
    data-testid={`feature-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="mb-3">{icon}</div>
    <h4 className="text-lg font-bold text-white mb-1.5 flex items-center">
      {title}
      {isNew && <span className="ml-2 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">New</span>}
      {isGame && <span className="ml-2 bg-[#D4AF37] text-[#020617] text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">Game</span>}
    </h4>
    <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
  </motion.a>
);

/* ───────── Game Card ───────── */
const GameCard = ({ icon, title, description, link, badge, index }) => (
  <motion.a
    href={link}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    className="glass-card rounded-2xl p-5 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] border-[#D4AF37]/40 hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 block cursor-pointer group"
    data-testid={`game-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center border border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/20 transition-all">
        {icon}
      </div>
      <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded uppercase tracking-widest font-bold">{badge}</span>
    </div>
    <h4 className="text-base font-bold text-white mb-1.5 flex items-center">
      {title}
      <span className="ml-2 bg-[#D4AF37] text-[#020617] text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">Game</span>
    </h4>
    <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
    <div className="mt-3 flex items-center text-[#D4AF37] text-xs font-semibold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
      Enter Arena <ChevronRight className="w-3.5 h-3.5 ml-1" />
    </div>
  </motion.a>
);

/* ───────── Bottom Nav ───────── */
const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  if (location.pathname === '/') return null;

  const navItems = [
    { icon: <Sun className="w-5 h-5" />, label: 'Daily', path: '/daily' },
    { icon: <Eye className="w-5 h-5" />, label: 'Oracle', path: '/dashboard' },
    { icon: <Heart className="w-5 h-5" />, label: 'Match', path: '/compatibility' },
    { icon: <Swords className="w-5 h-5" />, label: 'War Room', path: '/#war-room' },
  ];

  const handleNav = (path) => {
    if (path === '/#war-room') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('war-room');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-[#020617]/90 backdrop-blur-xl border-t border-[#D4AF37]/20" data-testid="bottom-nav">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-all ${
                isActive ? 'text-[#D4AF37]' : 'text-white/40 hover:text-white/70'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.icon}
              <span className="text-[9px] uppercase tracking-widest mt-0.5 font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/* ───────── Home Oracle Ticker ───────── */
const HomeOracleTicker = () => {
  const [transits, setTransits] = useState(null);

  useEffect(() => {
    fetch(`${API}/oracle-feed`)
      .then(r => r.json())
      .then(d => setTransits(d))
      .catch(() => {});
  }, []);

  if (!transits) return null;

  return (
    <section className="relative z-10 py-5 border-y border-[#D4AF37]/15" data-testid="home-oracle-ticker">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-4 mb-2">
          <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-semibold">Cosmic Intelligence — Live</span>
          <span className="text-[10px] text-white/30">{transits.psychic_update?.moon_phase} | Energy {transits.psychic_update?.collective_energy_rating}/100</span>
        </div>
        <div className="overflow-hidden">
          <div className="ticker-scroll flex space-x-8 text-xs text-white/60 whitespace-nowrap">
            {transits.current_transits && Object.entries(transits.current_transits).map(([name, data]) => (
              <span key={name} className="inline-flex items-center space-x-1.5">
                <span className="text-[#D4AF37] font-semibold">{name}</span>
                <span>{data.sign} {data.degree?.toFixed(1)}</span>
                <span className="text-white/30">|</span>
                <span className="text-white/40">{data.nakshatra} P{data.pada}</span>
                {data.retrograde && <span className="text-[#D4AF37]/60 text-[10px]">(R)</span>}
              </span>
            ))}
            {transits.current_transits && Object.entries(transits.current_transits).map(([name, data]) => (
              <span key={`dup-${name}`} className="inline-flex items-center space-x-1.5">
                <span className="text-[#D4AF37] font-semibold">{name}</span>
                <span>{data.sign} {data.degree?.toFixed(1)}</span>
                <span className="text-white/30">|</span>
                <span className="text-white/40">{data.nakshatra} P{data.pada}</span>
                {data.retrograde && <span className="text-[#D4AF37]/60 text-[10px]">(R)</span>}
              </span>
            ))}
          </div>
        </div>
        {transits.transit_alerts?.length > 0 && (
          <div className="mt-2 text-xs text-white/40">
            <span className="text-[#D4AF37] font-semibold">[LIVE]</span>
            <span className="mx-1.5">{transits.transit_alerts[0]?.title}:</span>
            <span className="italic">{transits.transit_alerts[0]?.message?.slice(0, 140)}...</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default App;
