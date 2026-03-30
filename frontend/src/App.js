import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Star, Moon, Sun, Zap, TrendingUp, 
  Users, Gift, DollarSign, Lock, ChevronRight, Globe 
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
        </Routes>
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
                100% Scientific Accuracy
              </h2>
              <p className="text-xl md:text-2xl text-[#94A3B8] mb-8 font-light">
                High-Ticket Aesthetic | Gamified Revenue Engine
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

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="sovereign-grid">
            <FeatureCard
              icon={<Moon className="w-12 h-12 text-[#D4AF37]" />}
              title="Vedic Zenith"
              description="D1-D60 divisional charts with Vimshottari Dasha and Ashtakavarga precision"
            />
            <FeatureCard
              icon={<Sun className="w-12 h-12 text-[#D4AF37]" />}
              title="Western Zenith"
              description="Tropical/Topocentric positioning with Placidus house system accuracy"
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-[#D4AF37]" />}
              title="Power Meter"
              description="0-100% dominance gauge calculated from real-time transits"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-[#D4AF37]" />}
              title="Alpha Strategy"
              description="78+44 Tarot deck with Mersenne Twister randomization"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-[#D4AF37]" />}
              title="Synastry War-Room"
              description="Professional compatibility analysis for strategic partnerships"
            />
            <FeatureCard
              icon={<Sparkles className="w-12 h-12 text-[#D4AF37]" />}
              title="Gemini Live AI"
              description="Voice assistant for strategic cosmic insights"
            />
            <FeatureCard
              icon={<DollarSign className="w-12 h-12 text-[#D4AF37]" />}
              title="Numerology Vault"
              description="Chaldean, Pythagorean, and Vedic calculations"
            />
            <FeatureCard
              icon={<Lock className="w-12 h-12 text-[#D4AF37]" />}
              title="Biometric Vault"
              description="FaceID/Fingerprint locked profile storage"
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
              Swiss Ephemeris-powered. 100% Scientific Accuracy.
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
    
    // Generate random stars
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.opacity = Math.random() * 0.5 + 0.2;
      container.appendChild(star);
    }
    
    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);
  
  return <div id="starfield-container" className="starfield" />;
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="glass-card rounded-2xl p-6 hover:-translate-y-1 hover:border-[#D4AF37]/60 transition-all duration-300"
    data-testid={`feature-card-${title.toLowerCase().replace(/\\s+/g, '-')}`}
  >
    <div className="mb-4">{icon}</div>
    <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
    <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
  </motion.div>
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

export default App;
