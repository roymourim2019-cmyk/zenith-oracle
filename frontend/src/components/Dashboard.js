import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, Star, Shield, Eye, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';
import PowerMeter from './PowerMeter';
import OracleFeed from './OracleFeed';
import HapticSignature from '../utils/HapticSignature';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('vedic');
  const [birthInfo, setBirthInfo] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    birth_time: '',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone_offset: 5.5
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBirthInfo(formData);

    const haptic = new HapticSignature();

    try {
      let endpoint = '';
      if (activeModule === 'vedic') endpoint = `${API}/vedic/birth-chart`;
      else if (activeModule === 'western') endpoint = `${API}/western/birth-chart`;
      
      const response = await axios.post(endpoint, formData);
      setChartData(response.data);
      
      // Trigger haptic feedback for each planet
      if (response.data.planets) {
        response.data.planets.forEach((planet, index) => {
          setTimeout(() => {
            haptic.trigger(planet.name);
          }, index * 300);
        });
      }
      
      setShowForm(false);
    } catch (error) {
      console.error('Chart calculation error:', error);
      alert('Failed to calculate chart. Please check your inputs.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="dashboard">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center">
            <Sparkles className="w-12 h-12 text-[#D4AF37] mr-4" />
            Zenith <span className="text-[#D4AF37] ml-2">Command</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">The Celestial Alignment awaits your inquiry</p>
        </motion.div>

        {/* Module Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <ModuleTab
            icon={<Moon />}
            label="Vedic Zenith"
            active={activeModule === 'vedic'}
            onClick={() => setActiveModule('vedic')}
          />
          <ModuleTab
            icon={<Sun />}
            label="Western Zenith"
            active={activeModule === 'western'}
            onClick={() => setActiveModule('western')}
          />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {showForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Enter Birth Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                    data-testid="birth-name-input"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      required
                      className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                      data-testid="birth-date-input"
                    />
                    <input
                      type="time"
                      step="1"
                      value={formData.birth_time}
                      onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                      required
                      className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                      data-testid="birth-time-input"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      required
                      className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                      data-testid="latitude-input"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      required
                      className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                      data-testid="longitude-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 uppercase tracking-widest"
                    data-testid="generate-chart-button"
                  >
                    {loading ? 'Channeling the Cosmos...' : 'Invoke the Oracle'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <ChartDisplay chartData={chartData} activeModule={activeModule} userTier={userTier} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PowerMeter birthInfo={birthInfo} />
            
            {/* Oracle Feed */}
            <OracleFeed birthInfo={birthInfo} />
            
            {/* Accuracy Lab Link */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 text-[#D4AF37] mr-2" />
                Accuracy Lab
              </h3>
              <p className="text-sm text-white/70 mb-4">
                View the raw Ephemeris data and mathematical integrity verification
              </p>
              <a href="/accuracy-lab">
                <button className="w-full bg-transparent border border-[#D4AF37] text-[#D4AF37] py-3 hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest text-sm font-bold">
                  Open Lab
                </button>
              </a>
            </div>
            
            {userTier === 'free' && (
              <div className="glass-card rounded-2xl p-6 border-[#D4AF37]/40">
                <h3 className="text-xl font-bold text-white mb-4">Unlock Premium</h3>
                <ul className="space-y-2 mb-4 text-sm text-white/80">
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-[#D4AF37] mr-2 mt-0.5 flex-shrink-0" />
                    Ad-free experience
                  </li>
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-[#D4AF37] mr-2 mt-0.5 flex-shrink-0" />
                    All D1-D60 charts
                  </li>
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-[#D4AF37] mr-2 mt-0.5 flex-shrink-0" />
                    AI Daily Briefings
                  </li>
                </ul>
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-[#D4AF37] text-[#020617] font-bold py-3 hover:bg-[#F3E5AB] transition-all duration-300 uppercase tracking-widest text-sm"
                  data-testid="upgrade-sidebar-button"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleTab = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-3 font-semibold uppercase tracking-widest text-sm transition-all duration-300 ${
      active
        ? 'bg-[#D4AF37] text-[#020617]'
        : 'bg-transparent border border-[#D4AF37]/40 text-white hover:border-[#D4AF37]'
    }`}
    data-testid={`module-tab-${label.toLowerCase().replace(/\\s+/g, '-')}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ChartDisplay = ({ chartData, activeModule, userTier }) => {
  const [showLogic, setShowLogic] = useState(false);
  const [toneActive, setToneActive] = useState(false);
  const oscRef = useRef(null);
  const ctxRef = useRef(null);

  if (!chartData) return null;

  const SCRIPTURE_MAP = {
    'vedic': 'Based on Brihat Parashara Hora Shastra (BPHS). Lahiri Ayanamsha as standardized by Government of India (1956).',
    'western': 'Per Claudius Ptolemy, Tetrabiblos (2nd century CE). Tropical zodiac, Placidus house system.',
  };

  const toggleSolfeggio = () => {
    if (toneActive && oscRef.current) {
      oscRef.current.stop();
      oscRef.current = null;
      setToneActive(false);
      return;
    }
    try {
      const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 432;
      osc.type = 'sine';
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      setToneActive(true);
    } catch (e) { /* audio not supported */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8" data-testid="chart-display">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">
          {activeModule === 'vedic' ? 'Vedic' : 'Western'} Birth Chart
        </h2>
        <button onClick={toggleSolfeggio} className="flex items-center space-x-1.5 text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-all" data-testid="solfeggio-toggle">
          {toneActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">432Hz</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard label="Ascendant" value={chartData.ascendant_sign || 'N/A'} />
          {chartData.lunar_mansion && <InfoCard label="Lunar Mansion" value={chartData.lunar_mansion} />}
          {chartData.dasha_lord && <InfoCard label="Dasha Regent" value={`${chartData.dasha_lord} (${chartData.dasha_balance_years?.toFixed(1)}y)`} />}
          {chartData.power_score && <InfoCard label="Dominance Index" value={`${chartData.power_score}/100`} />}
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Planetary Positions</h3>
          <div className="space-y-2">
            {chartData.planets?.slice(0, 7).map((planet, idx) => {
              const deg = Math.floor(planet.degree_in_sign);
              const min = Math.floor((planet.degree_in_sign - deg) * 60);
              const sec = Math.floor(((planet.degree_in_sign - deg) * 60 - min) * 60);
              return (
                <div key={idx} className="flex justify-between items-center bg-[#020617]/40 border border-[#D4AF37]/20 rounded-lg p-3">
                  <span className="text-white font-semibold">{planet.name}</span>
                  <span className="text-[#D4AF37]">{planet.sign} {deg}&deg;{min}&prime;{sec}&Prime;</span>
                  <span className="text-white/30 text-[10px] font-mono">{planet.longitude?.toFixed(4)}</span>
                  {planet.retrograde && <span className="text-xs text-red-400/80 ml-2">(R)</span>}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowLogic(!showLogic)}
          className="w-full bg-transparent border border-[#D4AF37]/40 text-[#D4AF37] py-3 hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest text-sm font-bold flex items-center justify-center space-x-2"
          data-testid="view-calculation-logic"
        >
          <Eye className="w-4 h-4" />
          <span>View Calculation Logic</span>
        </button>

        <AnimatePresence>
          {showLogic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-xl p-5 border-[#D4AF37]/30 space-y-4" data-testid="calculation-logic-overlay">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 font-semibold">Raw Ephemeris Data</h4>
                  <div className="space-y-1.5">
                    {chartData.planets?.slice(0, 7).map((p, i) => {
                      const d = Math.floor(p.degree_in_sign);
                      const m = Math.floor((p.degree_in_sign - d) * 60);
                      const s = Math.floor(((p.degree_in_sign - d) * 60 - m) * 60);
                      return (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-white/60 w-16">{p.name}</span>
                          <span className="text-white font-mono">{d}&deg;{m}&prime;{s}&Prime; {p.sign}</span>
                          <span className="text-white/20 text-[10px]">Source: JPL DE431</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 font-semibold">The Ancient Rule</h4>
                  <p className="text-[10px] text-white/40 italic">{SCRIPTURE_MAP[activeModule]}</p>
                  {chartData.dasha_lord && (
                    <p className="text-[10px] text-white/40 italic mt-1">
                      Dasha Period: As per Vimshottari Dasha system, BPHS Ch. 46-50. Current lord: {chartData.dasha_lord}.
                    </p>
                  )}
                  {chartData.ayanamsha && (
                    <p className="text-[10px] text-white/30 mt-1">Ayanamsha (Lahiri): {chartData.ayanamsha.toFixed(6)}</p>
                  )}
                </div>
                <div className="pt-2 border-t border-[#D4AF37]/10 flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-[9px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="bg-[#020617]/40 border border-[#D4AF37]/20 rounded-lg p-4">
    <div className="text-xs uppercase tracking-widest text-white/60 mb-1">{label}</div>
    <div className="text-xl font-bold text-[#D4AF37]">{value}</div>
  </div>
);

export default Dashboard;