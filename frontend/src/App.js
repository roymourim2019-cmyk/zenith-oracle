import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Star, Moon, Sun, Zap, TrendingUp, 
  Users, ChevronRight, Globe, Hash, Mic,
  Gamepad2, Home as HomeIcon, LayoutDashboard, Swords, Activity,
  Volume2, Crown, Eye, Scroll, Heart, Download, X, Flame
} from "lucide-react";
import "@/App.css";

// Components
import Login from "./Login"; // ENSURE YOU CREATED Login.js
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

  // Enterprise Auth State - Persists for 30 days via LocalStorage
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('zenith_auth') === 'true');

  useEffect(() => {
    if (!isOnboarded) {
      setShowOnboarding(true);
    }
    recordVisit();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('zenith_auth');
    setIsLoggedIn(false);
    window.location.reload(); 
  };

  const handleOnboardComplete = (profileData) => {
    saveProfile(profileData);
    markOnboarded();
    setShowOnboarding(false);
  };

  return (
    <div className="App min-h-screen bg-[#020617]">
      <BrowserRouter>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={
            <Home 
              profile={profile}
              streak={streak}
              readingsCount={readingsCount}
              canInstall={canInstall}
              onInstall={install}
              onDismissInstall={dismissInstall}
              isLoggedIn={isLoggedIn}
              handleLogout={handleLogout}
            />
          } />

          {/* Critical Enterprise Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Oracle Matrix Routes */}
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
    </div>
  );
};

/* ───────── Global Footer ───────── */
const GlobalFooter = () => {
  const location = useLocation();
  // Hide footer on home page to keep the Enterprise look clean
  if (location.pathname === '/') return null;

  return (
    <footer className="pb-24 pt-8 border-t border-white/5 bg-[#020617]">
      <p className="text-center text-[#6B7280] text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
        &copy; 2026 Roy's Enterprise. All Rights Reserved.
      </p>
    </footer>
  );
};

/* ───────── HOME PAGE ───────── */
const Home = ({ profile, streak, readingsCount, canInstall, onInstall, onDismissInstall, isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617]">
      <Starfield />
      
      {/* Premium Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/6141905/pexels-photo-6141905.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"
        }}
      />
      
      <div className="relative z-10">
        {/* Enterprise Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex justify-between items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tighter" style={{fontFamily: 'Playfair Display, serif'}}>
                ZENITH <span className="text-[#D4AF37]">ORACLE</span>
              </h1>
            </motion.div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={isLoggedIn ? handleLogout : () => navigate('/login')}
                className="enterprise-auth-btn"
                style={{
                  background: isLoggedIn ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                  color: isLoggedIn ? '#ef4444' : '#D4AF37',
                  border: isLoggedIn ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(212, 175, 55, 0.3)',
                  padding: '8px 20px',
                  borderRadius: '14px',
                  fontSize: '10px',
                  fontWeight: '900',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {isLoggedIn ? 'LOGOUT SESSION' : 'ENTERPRISE LOGIN'}
              </button>

              {streak.count > 0 && (
                <div className="flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-2 rounded-xl">
                  <Flame className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                  <span className="text-xs text-[#D4AF37] font-black">{streak.count}</span>
                </div>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-12 pb-20">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <div className="inline-block px-4 py-1.5 mb-6 border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5">
                 <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase">Scripture-Bound Deterministic Math</p>
              </div>
              <h2 className="text-5xl sm:text-7xl font-bold text-white mb-8 gold-glow leading-[1.1]" style={{fontFamily: 'Playfair Display, serif'}}>
                Master Your <span className="text-[#D4AF37]">Cosmic Destiny</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                High-fidelity astrological intelligence. Powered by Swiss Ephemeris. Dedicated to Roy's Enterprise.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={() => navigate('/daily')} className="oracle-button w-full sm:w-auto text-white font-bold py-5 px-14 text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  Unlock Today
                  <ChevronRight className="inline ml-2 w-5 h-5" />
                </button>
                <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto border border-white/10 text-white/70 font-bold py-5 px-10 text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 hover:text-white transition-all">
                  Open Matrix
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <HomeOracleTicker />

        {/* Sovereign Matrix Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Sun className="w-10 h-10 text-[#D4AF37]" />} title="Daily Oracle" description="Free daily horoscope + Card of the Day." link="/daily" isNew />
            <FeatureCard icon={<Mic className="w-10 h-10 text-[#D4AF37]" />} title="Alpha Briefing" description="AI strategy audio based on real-time transits." link="/alpha-briefing" isNew />
            <FeatureCard icon={<Moon className="w-10 h-10 text-[#D4AF37]" />} title="Vedic Zenith" description="Advanced D1-D60 charts & Vimshottari Dasha." link="/vedic" />
            <FeatureCard icon={<Zap className="w-10 h-10 text-[#D4AF37]" />} title="Western Zenith" description="Tropical zodiac precision & aspect analysis." link="/western" />
            <FeatureCard icon={<Sparkles className="w-10 h-10 text-[#D4AF37]" />} title="Tarot Oracle" description="78 Major/Minor Arcana + 44 Mystic cards." link="/tarot" />
            <FeatureCard icon={<Hash className="w-10 h-10 text-[#D4AF37]" />} title="Numerology Vault" description="Chaldean & Pythagorean core frequency analysis." link="/numerology" />
          </div>
        </section>

        {/* The War Room (High-Stakes Arena) */}
        <section className="container mx-auto px-6 py-20 mb-20 bg-gradient-to-b from-transparent to-[#D4AF37]/5 rounded-[40px] border border-[#D4AF37]/10" id="war-room">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-[#D4AF37] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>THE WAR ROOM</h3>
            <p className="text-white/40 uppercase text-[10px] tracking-[0.4em]">Conflict Resolution & Market Dominance</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <GameCard icon={<TrendingUp className="w-10 h-10 text-[#D4AF37]" />} title="Market Siege" description="Use numerology to dominate commercial cycles." link="/market-siege" badge="Dominance" />
            <GameCard icon={<Crown className="w-10 h-10 text-[#D4AF37]" />} title="Sovereign Duel" description="Clash birth charts to find the superior path." link="/sovereign-duel" badge="Conflict" />
          </div>
        </section>

        {/* Enterprise Signature */}
        <footer className="py-20 border-t border-white/5">
          <div className="container mx-auto px-6 text-center">
             <div className="flex justify-center items-center space-x-2 mb-6">
                <div className="h-[1px] w-12 bg-[#D4AF37]/30" />
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <div className="h-[1px] w-12 bg-[#D4AF37]/30" />
             </div>
             <p className="text-white/80 font-bold text-xl mb-4 tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>ROY'S ENTERPRISE</p>
             <p className="text-[#6B7280] text-[9px] tracking-[0.5em] uppercase">Built for the Global Elite</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

/* ───────── SUB-COMPONENTS ───────── */

const FeatureCard = ({ icon, title, description, link, isNew }) => (
  <motion.a 
    href={link || '#'} 
    whileHover={{ y: -5 }}
    className="glass-card rounded-[32px] p-8 block border border-white/5 hover:border-[#D4AF37]/40 transition-all group"
  >
    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">{icon}</div>
    <h4 className="text-xl font-bold text-white mb-2 flex items-center group-hover:text-[#D4AF37] transition-colors">
      {title}
      {isNew && <span className="ml-3 bg-[#D4AF37] text-[#020617] text-[8px] px-2 py-0.5 rounded-full uppercase font-black">New</span>}
    </h4>
    <p className="text-white/40 text-sm leading-relaxed">{description}</p>
  </motion.a>
);

const GameCard = ({ icon, title, description, link, badge }) => (
  <motion.a 
    href={link} 
    whileHover={{ scale: 1.02 }}
    className="glass-card rounded-[32px] p-8 w-full sm:w-[400px] border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all block relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4">
      <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full uppercase font-black border border-[#D4AF37]/20">{badge}</span>
    </div>
    <div className="mb-6">{icon}</div>
    <h4 className="text-2xl font-bold text-white mb-2">{title}</h4>
    <p className="text-white/40 text-sm mb-8">{description}</p>
    <div className="flex items-center text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em]">
      Enter Arena <ChevronRight className="ml-1 w-4 h-4" />
    </div>
  </motion.a>
);

const Starfield = () => {
  useEffect(() => {
    const container = document.getElementById('starfield-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 150; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${Math.random() * 2}px`;
      star.style.height = star.style.width;
      star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
      container.appendChild(star);
    }
  }, []);
  return <div id="starfield-container" className="fixed inset-0 pointer-events-none" />;
};

const HomeOracleTicker = () => {
  const [transits, setTransits] = useState(null);
  useEffect(() => {
    fetch(`${API}/oracle-feed`).then(r => r.json()).then(d => setTransits(d)).catch(() => {});
  }, []);
  if (!transits) return null;
  return (
    <section className="py-6 border-y border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden">
      <div className="ticker-scroll flex space-x-12 text-[10px] font-bold tracking-widest text-white/40 uppercase">
        {transits.current_transits && Object.entries(transits.current_transits).map(([name, data]) => (
          <span key={name} className="whitespace-nowrap">
            <span className="text-[#D4AF37] mr-2">{name}</span> 
            {data.sign} <span className="text-white/20 ml-1">{data.degree?.toFixed(1)}°</span>
          </span>
        ))}
      </div>
    </section>
  );
};

// Bottom Navigation for Mobile
const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === '/' || location.pathname === '/login') return null;
  
  const navItems = [
    { icon: <Sun className="w-5 h-5" />, label: 'Daily', path: '/daily' },
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Matrix', path: '/dashboard' },
    { icon: <Heart className="w-5 h-5" />, label: 'Match', path: '/compatibility' },
    { icon: <Swords className="w-5 h-5" />, label: 'War Room', path: '/#war-room' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
      <div className="flex justify-around py-4">
        {navItems.map(item => (
          <button 
            key={item.label} 
            onClick={() => navigate(item.path)} 
            className={`flex flex-col items-center space-y-1 transition-all ${location.pathname === item.path ? 'text-[#D4AF37]' : 'text-white/40 hover:text-white'}`}
          >
            {item.icon}
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const RatingPrompt = ({ onDismiss }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-6">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-[40px] p-10 max-w-sm w-full text-center border border-[#D4AF37]/30">
      <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Star className="w-10 h-10 text-[#D4AF37] fill-[#D4AF37]" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Elite Experience?</h3>
      <p className="text-sm text-white/50 mb-8 leading-relaxed">Your feedback fuels the expansion of our scripture-bound intelligence.</p>
      <div className="flex flex-col gap-3">
        <button onClick={onDismiss} className="w-full bg-[#D4AF37] text-[#020617] font-black py-4 rounded-2xl text-xs uppercase tracking-widest">
          Rate 5 Stars
        </button>
        <button onClick={onDismiss} className="w-full py-4 text-white/30 text-[10px] uppercase font-bold tracking-widest">
          Dismiss
        </button>
      </div>
    </motion.div>
  </div>
);

export default App;
