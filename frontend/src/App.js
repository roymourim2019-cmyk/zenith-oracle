import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Sun, Moon, Zap, Hash, Mic, 
  Crown, Eye, Heart, Swords, ChevronRight, Flame, Star, MapPin
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
        <div className="flex gap-2">
            <div className="bg-[#D4AF37]/10 px-4 py-2 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-xs font-black text-[#D4AF37]">{streak.count}</span>
            </div>
        </div>
      </header>

      <main className="px-8">
        <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/daily')} 
            className="mb-8 p-8 rounded-[40px] bg-gradient-to-br from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/30 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold leading-tight" style={{fontFamily: 'Playfair Display'}}>Today's Divine<br/>Manifesto</h2>
                <div className="p-3 bg-white/10 rounded-full"><ChevronRight className="w-5 h-5" /></div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">Based on your birth at {profile.dob}, the current planetary transits are focusing energy on your 10th house of career.</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <MenuCard icon={<Moon />} title="Vedic Mastery" path="/vedic" />
          <MenuCard icon={<Sun />} title="Western Path" path="/western" />
          <MenuCard icon={<Hash />} title="Numerology" path="/numerology" />
          <MenuCard icon={<Sparkles />} title="Tarot Truth" path="/tarot" />
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

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    if (location.pathname === '/') return null;

    return (
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[35px] h-20 flex items-center justify-around px-4 z-[500] shadow-2xl">
        <NavButton icon={<Sun />} onClick={() => navigate('/')} label="Home" active={location.pathname === '/'} />
        <NavButton icon={<Eye />} onClick={() => navigate('/dashboard')} label="Matrix" active={location.pathname === '/dashboard'} />
        <NavButton icon={<Heart />} onClick={() => navigate('/compatibility')} label="Synastry" active={location.pathname === '/compatibility'} />
        <NavButton icon={<Mic />} onClick={() => navigate('/alpha-briefing')} label="Vocal" active={location.pathname === '/alpha-briefing'} />
      </nav>
    );
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
