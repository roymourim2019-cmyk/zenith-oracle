import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Star, Moon, Sun, Zap, TrendingUp, 
  Users, Gift, DollarSign, Lock, ChevronRight, Globe,
  Gamepad2, Home as HomeIcon, LayoutDashboard, Swords, Activity,
  Volume2, Crown, Eye
} from "lucide-react";
import "@/App.css";
import Dashboard from "./components/Dashboard";
import VedicChart from "./components/VedicChart";
import WesternChart from "./components/WesternChart";
import ChineseAstrology from "./components/ChineseAstrology";
import NumerologyCalculator from "./components/NumerologyCalculator";
import TarotReader from "./components/TarotReader";
import PowerMeter from "./components/PowerMeter";
import PaymentModal from "./components/PaymentModal";
import AccuracyLab from "./components/AccuracyLab";
import MarketSiege from "./components/MarketSiege";
import OraclesTrial from "./components/OraclesTrial";
import VortexVelocity from "./components/VortexVelocity";
import AuraAlignment from "./components/AuraAlignment";
import SovereignDuel from "./components/SovereignDuel";
import GlobalSuccessMap from "./components/GlobalSuccessMap";
import BiometricVault from "./components/BiometricVault";
import NegotiationSimulator from "./components/NegotiationSimulator";
import PrecisionAlerts from "./components/PrecisionAlerts";
import VocalOracle from "./components/VocalOracle";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const App = () => {
  const [userTier, setUserTier] = useState("free");
  const [showPayment, setShowPayment] = useState(false);
  const [currency, setCurrency] = useState("INR");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const tier = localStorage.getItem("userTier") || "free";
    setUserTier(tier);
    
    // Detect user location for currency
    const userLang = navigator.language || navigator.userLanguage;
    if (!userLang.startsWith('en-IN') && !userLang.startsWith('hi')) {
      setCurrency("USD");
    }
  }, []);

  return (
    <div className="App min-h-screen bg-[#020617]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Home 
              userTier={userTier} 
              setUserTier={setUserTier}
              setShowPayment={setShowPayment}
              currency={currency}
              setCurrency={setCurrency}
            />
          } />
          <Route path="/dashboard" element={
            <Dashboard 
              userTier={userTier} 
              setShowPayment={setShowPayment}
            />
          } />
          <Route path="/vedic" element={<VedicChart userTier={userTier} />} />
          <Route path="/western" element={<WesternChart userTier={userTier} />} />
          <Route path="/chinese" element={<ChineseAstrology />} />
          <Route path="/numerology" element={<NumerologyCalculator />} />
          <Route path="/tarot" element={<TarotReader />} />
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
        </Routes>
        <BottomNav />
        <VocalOracle />
      </BrowserRouter>

      {showPayment && (
        <PaymentModal 
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setUserTier("premium");
            localStorage.setItem("userTier", "premium");
            setShowPayment(false);
          }}
          currency={currency}
        />
      )}
    </div>
  );
};

const Home = ({ userTier, setUserTier, setShowPayment, currency, setCurrency }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Starfield Background */}
      <Starfield />
      
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/6141905/pexels-photo-6141905.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Sparkles className="w-10 h-10 text-[#D4AF37]" />
              <h1 className="text-3xl font-bold text-white tracking-tight" style={{fontFamily: 'Playfair Display, serif'}}>
                ZENITH <span className="text-[#D4AF37]">ORACLE</span>
              </h1>
            </motion.div>

            <div className="flex items-center space-x-4">
              {/* Currency Toggle */}
              <button
                onClick={() => setCurrency(currency === "INR" ? "USD" : "INR")}
                className="flex items-center space-x-2 text-white/60 hover:text-[#D4AF37] transition-colors text-sm"
                data-testid="currency-toggle"
              >
                <Globe className="w-4 h-4" />
                <span>{currency === "INR" ? "₹ INR" : "$ USD"}</span>
              </button>
              
              {userTier === "free" && (
                <button
                  onClick={() => setShowPayment(true)}
                  className="bg-[#D4AF37] text-[#020617] font-bold py-2 px-6 hover:bg-[#F3E5AB] transition-all duration-300 uppercase tracking-widest text-sm premium-glow"
                  data-testid="upgrade-premium-button"
                >
                  <Gift className="w-4 h-4 inline mr-2" />
                  Go Premium
                </button>
              )}
              {userTier === "premium" && (
                <div className="bg-[#D4AF37]/20 border border-[#D4AF37] px-4 py-2 flex items-center space-x-2">
                  <Star className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-sm uppercase tracking-widest">
                    Premium
                  </span>
                </div>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 gold-glow" style={{fontFamily: 'Playfair Display, serif'}}>
                High-Resonance Alignment
              </h2>
              <p className="text-xl md:text-2xl text-[#94A3B8] mb-8 font-light">
                Mathematical Precision | Gamified Revenue Engine
              </p>
              <p className="text-lg text-white/80 mb-12 leading-relaxed">
                Swiss Ephemeris precision. Vedic D1-D60 charts. Western Topocentric. 
                Chinese Lunisolar. AI-powered insights. Your cosmic dominance awaits.
              </p>

              <a href="/dashboard">
                <button 
                  className="oracle-button text-white font-bold py-4 px-12 text-lg uppercase tracking-widest"
                  data-testid="enter-oracle-button"
                >
                  Enter the Oracle
                  <ChevronRight className="inline ml-2 w-6 h-6" />
                </button>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Oracle Feed Ticker - Home */}
        <HomeOracleTicker />

        {/* Sovereign 8 Matrix */}
        <section className="container mx-auto px-6 py-20">
          <div className="sovereign-grid">
            <FeatureCard
              icon={<Moon className="w-12 h-12 text-[#D4AF37]" />}
              title="Vedic Zenith"
              description="D1-D60 divisional charts with Vimshottari Dasha and Ashtakavarga precision"
              link="/vedic"
            />
            <FeatureCard
              icon={<Sun className="w-12 h-12 text-[#D4AF37]" />}
              title="Western Zenith"
              description="Tropical/Topocentric positioning with Placidus house system accuracy"
              link="/western"
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-[#D4AF37]" />}
              title="Power Meter"
              description="0-100% dominance gauge calculated from real-time transits"
              link="/dashboard"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-[#D4AF37]" />}
              title="Market Siege"
              description="60-second numerology battle - test your name vibrations for glory"
              link="/market-siege"
              isGame={true}
            />
            <FeatureCard
              icon={<Eye className="w-12 h-12 text-[#D4AF37]" />}
              title="Oracle's Trial"
              description="High-stakes tarot intuition quiz - earn Gold Dust rewards"
              link="/oracles-trial"
              isGame={true}
            />
            <FeatureCard
              icon={<Sparkles className="w-12 h-12 text-[#D4AF37]" />}
              title="Tarot Deck"
              description="78+44 Alpha Strategy Cards drawn by Mersenne Twister precision"
              link="/tarot"
            />
            <FeatureCard
              icon={<DollarSign className="w-12 h-12 text-[#D4AF37]" />}
              title="Numerology Vault"
              description="Chaldean, Pythagorean, and Vedic calculations"
              link="/numerology"
            />
            <FeatureCard
              icon={<Lock className="w-12 h-12 text-[#D4AF37]" />}
              title="Biometric Vault"
              description="FaceID/Fingerprint locked profile storage"
              link="/biometric-vault"
            />
          </div>
        </section>

        {/* WAR ROOM: ENTERPRISE STRATEGY */}
        <section className="container mx-auto px-6 py-20 relative" style={{ zIndex: 100, overflow: 'visible', height: 'auto' }} id="war-room" data-testid="war-room-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h3
              className="text-4xl md:text-5xl font-bold text-[#D4AF37] mb-4 war-room-pulse"
              style={{ fontFamily: 'Playfair Display, serif' }}
              data-testid="war-room-header"
            >
              THE WAR ROOM: ENTERPRISE STRATEGY
            </h3>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              Five celestial battlegrounds forged from Swiss Ephemeris precision. Enter, compete, dominate.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6" style={{ overflow: 'visible', minHeight: 'auto' }}>
            <GameCard
              icon={<TrendingUp className="w-10 h-10 text-[#D4AF37]" />}
              title="Market Siege"
              description="60-second Numerology battle. Crush legendary opponents with your name's cosmic vibration."
              link="/market-siege"
              badge="Numerology"
              index={0}
            />
            <GameCard
              icon={<Eye className="w-10 h-10 text-[#D4AF37]" />}
              title="Oracle's Trial"
              description="5-round Tarot intuition challenge. Identify true card meanings, earn Gold Dust."
              link="/oracles-trial"
              badge="Tarot"
              index={1}
            />
            <GameCard
              icon={<Activity className="w-10 h-10 text-[#D4AF37]" />}
              title="Vortex Velocity"
              description="Lock planetary degrees with arc-second precision. Race the real-time Ephemeris."
              link="/vortex-velocity"
              badge="Transit"
              index={2}
            />
            <GameCard
              icon={<Volume2 className="w-10 h-10 text-[#D4AF37]" />}
              title="Aura Alignment"
              description="Match your frequency to the Moon's Solfeggio tone. Audio-visual cosmic tuning."
              link="/aura-alignment"
              badge="Solfeggio"
              index={3}
            />
            <GameCard
              icon={<Crown className="w-10 h-10 text-[#D4AF37]" />}
              title="Sovereign Duel"
              description="Chart vs. Chart. Seven planets clash for supremacy against mythic legends."
              link="/sovereign-duel"
              badge="Vedic"
              index={4}
            />
          </div>
        </section>

        {/* Pricing Section */}
        {userTier === "free" && (
          <section className="container mx-auto px-6 py-20">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-4xl font-bold text-center text-white mb-12" style={{fontFamily: 'Playfair Display, serif'}}>
                Choose Your <span className="text-[#D4AF37]">Dominance Level</span>
              </h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                <PricingCard
                  tier="Monthly Alpha"
                  price={currency === "INR" ? "₹499" : "$9.99"}
                  period="/month"
                  features={[
                    "100% Ad-Free Experience",
                    "All D1-D60 divisional charts",
                    "Unlimited Synastry analysis",
                    "PDF Export capability",
                    "AI Daily Briefings",
                    "'View Logic' transparency",
                    "Cancel anytime"
                  ]}
                  buttonText="Upgrade Now"
                  onClick={() => setShowPayment(true)}
                  premium={true}
                />
                
                <PricingCard
                  tier="Yearly Alpha"
                  price={currency === "INR" ? "₹3,999" : "$79.99"}
                  period="/year"
                  badge="Save 33%"
                  features={[
                    "Everything in Monthly",
                    "2 months free",
                    "Priority AI insights",
                    "Early access to features",
                    "Unlimited Profile Vault",
                    "Advanced Dasha reports",
                    "Best value"
                  ]}
                  buttonText="Upgrade Now"
                  onClick={() => setShowPayment(true)}
                  premium={true}
                  highlighted={true}
                />
                
                <PricingCard
                  tier="Enterprise Lifetime"
                  price={currency === "INR" ? "₹24,999" : "$499"}
                  period="one-time"
                  badge="Top 1%"
                  features={[
                    "Everything in Yearly",
                    "Lifetime access",
                    "Exclusive Alpha cards",
                    "Personal AI advisor",
                    "Priority support",
                    "Private consultations",
                    "Legacy pricing lock"
                  ]}
                  buttonText="Join Elite"
                  onClick={() => setShowPayment(true)}
                  premium={true}
                  enterprise={true}
                />
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-[#D4AF37]/20 py-8 mt-20">
          <div className="container mx-auto px-6 text-center">
            <p className="text-[#94A3B8] text-sm">
              Swiss Ephemeris-powered. Mathematical Precision.
            </p>
            <p className="text-[#D4AF37] text-xs mt-2" style={{fontSize: '10px'}}>
              © 2026 Zenith Oracle Enterprise
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

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
    
    // Gyroscope parallax (mobile) or mouse parallax (desktop)
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
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
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

const FeatureCard = ({ icon, title, description, link, isGame }) => (
  <motion.a
    href={link || '#'}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 block cursor-pointer ${
      isGame 
        ? 'border-[#D4AF37]/80 bg-gradient-to-br from-[#D4AF37]/5 to-transparent hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
        : 'hover:border-[#D4AF37]/60'
    }`}
    data-testid={`feature-card-${title.toLowerCase().replace(/\\s+/g, '-')}`}
  >
    <div className="mb-4">{icon}</div>
    <h4 className="text-xl font-bold text-white mb-2 flex items-center">
      {title}
      {isGame && (
        <span className="ml-2 bg-[#D4AF37] text-[#020617] text-xs px-2 py-0.5 rounded uppercase font-bold">
          Game
        </span>
      )}
    </h4>
    <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
  </motion.a>
);

const PricingCard = ({ tier, price, period, badge, features, buttonText, onClick, buttonDisabled, premium, highlighted, enterprise }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className={`glass-card rounded-2xl p-8 relative ${highlighted ? 'border-[#D4AF37] scale-105' : premium ? 'border-[#D4AF37]/80' : ''} ${highlighted ? 'gold-border-glow' : ''}`}
    data-testid={`pricing-card-${tier.toLowerCase().replace(/\\s+/g, '-')}`}
  >
    {badge && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-[#D4AF37] text-[#020617] px-4 py-1 text-xs font-bold uppercase tracking-widest">
          {badge}
        </span>
      </div>
    )}
    
    <h4 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Playfair Display, serif'}}>{tier}</h4>
    <div className="mb-6">
      <span className="text-5xl font-bold text-[#D4AF37]">{price}</span>
      {period && <span className="text-[#94A3B8]">{period}</span>}
    </div>
    
    <ul className="space-y-3 mb-8">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start space-x-2 text-white/80">
          <Star className="w-4 h-4 text-[#D4AF37] mt-1 flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    
    <button
      onClick={onClick}
      disabled={buttonDisabled}
      className={`w-full py-3 font-bold uppercase tracking-widest text-sm transition-all duration-300 ${
        buttonDisabled
          ? 'bg-[#1E293B] text-[#94A3B8] cursor-not-allowed'
          : enterprise
          ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#020617] hover:shadow-[0_0_30px_rgba(212,175,55,0.8)] gold-pulse'
          : 'bg-[#D4AF37] text-[#020617] hover:bg-[#F3E5AB] gold-pulse'
      }`}
      data-testid={`pricing-button-${tier.toLowerCase().replace(/\\s+/g, '-')}`}
    >
      {buttonText}
    </button>
  </motion.div>
);

const GameCard = ({ icon, title, description, link, badge, index }) => (
  <motion.a
    href={link}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    className="glass-card rounded-2xl p-6 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] border-[#D4AF37]/40 hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 block cursor-pointer group"
    data-testid={`game-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center border border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/20 transition-all">
        {icon}
      </div>
      <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-1 rounded uppercase tracking-widest font-bold">
        {badge}
      </span>
    </div>
    <h4 className="text-lg font-bold text-white mb-2 flex items-center">
      {title}
      <span className="ml-2 bg-[#D4AF37] text-[#020617] text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
        Game
      </span>
    </h4>
    <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
    <div className="mt-4 flex items-center text-[#D4AF37] text-xs font-semibold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
      Enter Arena <ChevronRight className="w-3.5 h-3.5 ml-1" />
    </div>
  </motion.a>
);

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  if (location.pathname === '/') return null;

  const navItems = [
    { icon: <Eye className="w-5 h-5" />, label: 'Oracle', path: '/dashboard' },
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Matrix', path: '/' },
    { icon: <Swords className="w-5 h-5" />, label: 'War Room', path: '/#war-room' },
    { icon: <Globe className="w-5 h-5" />, label: 'Profile', path: '/biometric-vault' },
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

const HomeOracleTicker = () => {
  const [transits, setTransits] = useState(null);

  useEffect(() => {
    const BACKEND = process.env.REACT_APP_BACKEND_URL;
    fetch(`${BACKEND}/api/oracle-feed`)
      .then(r => r.json())
      .then(d => setTransits(d))
      .catch(() => {});
  }, []);

  if (!transits) return null;

  return (
    <section className="relative z-10 py-6 border-y border-[#D4AF37]/15" data-testid="home-oracle-ticker">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-4 mb-3">
          <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-semibold">Cosmic Intelligence — Live Transit Feed</span>
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
          <div className="mt-3 text-xs text-white/40">
            <span className="text-[#D4AF37] font-semibold">{transits.transit_alerts[0]?.title}</span>
            <span className="mx-2 text-white/20">—</span>
            <span className="italic">{transits.transit_alerts[0]?.message?.slice(0, 120)}...</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default App;
