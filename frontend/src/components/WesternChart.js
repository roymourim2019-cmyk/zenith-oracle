import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Shield, Eye, Sparkles } from 'lucide-react';
import { AdBanner } from './AdComponents';
import { ShareButton } from './ShareCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SIGN_GLYPHS = {
  Aries: '\u2648', Taurus: '\u2649', Gemini: '\u264A', Cancer: '\u264B',
  Leo: '\u264C', Virgo: '\u264D', Libra: '\u264E', Scorpio: '\u264F',
  Sagittarius: '\u2650', Capricorn: '\u2651', Aquarius: '\u2652', Pisces: '\u2653',
};

const ELEMENT_COLORS = {
  Aries: '#FF4500', Taurus: '#228B22', Gemini: '#FFD700', Cancer: '#C0C0C0',
  Leo: '#FFA500', Virgo: '#8B7355', Libra: '#FF69B4', Scorpio: '#800020',
  Sagittarius: '#FF6347', Capricorn: '#696969', Aquarius: '#7FFFD4', Pisces: '#9370DB',
};

const SIGN_ELEMENTS = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const ASPECT_ANGLES = [
  { name: 'Conjunction', angle: 0, orb: 8, symbol: '\u260C' },
  { name: 'Sextile', angle: 60, orb: 6, symbol: '\u26B9' },
  { name: 'Square', angle: 90, orb: 8, symbol: '\u25A1' },
  { name: 'Trine', angle: 120, orb: 8, symbol: '\u25B3' },
  { name: 'Opposition', angle: 180, orb: 8, symbol: '\u260D' },
];

const WesternChart = ({ userTier }) => {
  const [formData, setFormData] = useState({ name: '', birth_date: '', birth_time: '', latitude: '28.6139', longitude: '77.2090', timezone_offset: 5.5 });
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('planets');
  const [showLogic, setShowLogic] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birth_date || !formData.birth_time) return;
    setLoading(true);
    try {
      const payload = { ...formData, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) };
      const res = await axios.post(`${API}/western/birth-chart`, payload);
      setChart(res.data);
    } catch (err) {
      console.error('Western chart error:', err);
    }
    setLoading(false);
  };

  const toDMS = (deg) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.round(((deg - d) * 60 - m) * 60);
    return `${d}\u00B0${m}'${s}"`;
  };

  const computeAspects = (planets) => {
    if (!planets) return [];
    const aspects = [];
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const diff = Math.abs(planets[i].longitude - planets[j].longitude);
        const angle = diff > 180 ? 360 - diff : diff;
        for (const asp of ASPECT_ANGLES) {
          if (Math.abs(angle - asp.angle) <= asp.orb) {
            aspects.push({ planet1: planets[i].name, planet2: planets[j].name, type: asp.name, symbol: asp.symbol, exactAngle: angle.toFixed(1) });
          }
        }
      }
    }
    return aspects;
  };

  const elementCount = (planets) => {
    const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    planets?.forEach(p => { const el = SIGN_ELEMENTS[p.sign]; if (el) counts[el]++; });
    return counts;
  };

  return (
    <div className="min-h-screen bg-[#020617] py-8 pb-28" data-testid="western-chart">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Sun className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] inline mr-3" />
            Western <span className="text-[#D4AF37]">Zenith</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">Tropical Zodiac | Placidus Houses | Swiss Ephemeris Precision</p>
          <p className="text-[10px] text-white/20 mt-1 italic">Claudius Ptolemy, Tetrabiblos (2nd century CE)</p>
        </motion.div>

        {!chart ? (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={calculate} className="max-w-xl mx-auto glass-card rounded-2xl p-6 sm:p-8 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-1 block font-semibold">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Enter your name" className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#D4AF37] focus:outline-none" data-testid="western-name-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Birth Date</label>
                <input type="date" value={formData.birth_date} onChange={e => setFormData(p => ({ ...p, birth_date: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="western-date-input" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Birth Time</label>
                <input type="time" step="1" value={formData.birth_time} onChange={e => setFormData(p => ({ ...p, birth_time: e.target.value ? (e.target.value.length === 5 ? e.target.value + ':00' : e.target.value) : '' }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="western-time-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Latitude</label>
                <input type="number" step="any" value={formData.latitude} onChange={e => setFormData(p => ({ ...p, latitude: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="western-lat-input" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Longitude</label>
                <input type="number" step="any" value={formData.longitude} onChange={e => setFormData(p => ({ ...p, longitude: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="western-lng-input" />
              </div>
            </div>
            <button type="submit" disabled={loading || !formData.name || !formData.birth_date || !formData.birth_time} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest disabled:opacity-40 text-sm" data-testid="western-calculate-btn">
              {loading ? 'Calculating Tropical Chart...' : 'Calculate Western Chart'}
            </button>
          </motion.form>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Summary */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60">Western Tropical Chart</p>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{formData.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#D4AF37]">{SIGN_GLYPHS[chart.ascendant_sign]} {chart.ascendant_sign} Rising</p>
                  <p className="text-[10px] text-white/30">ASC {toDMS(chart.ascendant)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#D4AF37]/10">
                <div><p className="text-[10px] text-white/30">Midheaven</p><p className="text-sm text-white/80 font-semibold">{SIGN_GLYPHS[chart.midheaven_sign]} {chart.midheaven_sign} ({toDMS(chart.midheaven)})</p></div>
                {Object.entries(elementCount(chart.planets)).map(([el, count]) => (
                  <div key={el}><p className="text-[10px] text-white/30">{el}</p><p className="text-sm text-white/70">{count} planet{count !== 1 ? 's' : ''}</p></div>
                ))}
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['planets', 'aspects', 'houses'].map(tab => (
                <button key={tab} onClick={() => setActiveView(tab)} className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold whitespace-nowrap transition-all ${activeView === tab ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-white/40 border border-white/10 hover:border-[#D4AF37]/30'}`} data-testid={`western-tab-${tab}`}>
                  {tab === 'planets' ? 'Planets' : tab === 'aspects' ? 'Aspects' : 'Houses'}
                </button>
              ))}
            </div>

            {/* Planets Table */}
            {activeView === 'planets' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="western-planets-table">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15">
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Planet</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Sign</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Degree</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Speed</th>
                        <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Retro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chart.planets?.map((p, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-[#D4AF37]/5 transition-colors">
                          <td className="px-4 py-3 font-semibold" style={{ color: ELEMENT_COLORS[p.sign] || '#D4AF37' }}>{p.name}</td>
                          <td className="px-4 py-3 text-white/70">{SIGN_GLYPHS[p.sign]} {p.sign}</td>
                          <td className="px-4 py-3 text-white/50 font-mono text-xs">{toDMS(p.degree_in_sign)}</td>
                          <td className="px-4 py-3 text-white/40 font-mono text-xs">{p.speed?.toFixed(4)}&deg;/day</td>
                          <td className="px-4 py-3 text-center">{p.retrograde ? <span className="text-[#FF4500] text-xs font-bold">R</span> : <span className="text-green-400 text-xs">D</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Aspects */}
            {activeView === 'aspects' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2" data-testid="western-aspects-panel">
                {computeAspects(chart.planets).map((a, i) => (
                  <div key={i} className="glass-card rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-[#D4AF37]">{a.symbol}</span>
                      <div>
                        <p className="text-sm text-white/80 font-semibold">{a.planet1} {a.type} {a.planet2}</p>
                        <p className="text-[10px] text-white/30">{a.exactAngle}&deg; orb</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${a.type === 'Trine' || a.type === 'Sextile' ? 'bg-green-900/30 text-green-400' : a.type === 'Square' || a.type === 'Opposition' ? 'bg-red-900/30 text-red-400' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>{a.type === 'Trine' || a.type === 'Sextile' ? 'Harmonious' : a.type === 'Square' || a.type === 'Opposition' ? 'Challenging' : 'Conjunction'}</span>
                  </div>
                ))}
                {computeAspects(chart.planets).length === 0 && <p className="text-white/30 text-sm text-center py-4">No major aspects detected within standard orb.</p>}
                <p className="text-[10px] text-white/20 italic mt-2">Aspect system per Ptolemy (Tetrabiblos, 2nd century CE). Standard orbs applied.</p>
              </motion.div>
            )}

            {/* Houses */}
            {activeView === 'houses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="western-houses-panel">
                {chart.houses?.map((cusp, i) => {
                  const sign = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][Math.floor(cusp / 30) % 12];
                  return (
                    <div key={i} className="glass-card rounded-xl p-3">
                      <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">House {i + 1}</p>
                      <p className="text-sm text-white/80 mt-1">{SIGN_GLYPHS[sign]} {sign}</p>
                      <p className="text-[10px] text-white/40 font-mono">{toDMS(cusp)}</p>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Logic */}
            <div className="glass-card rounded-xl p-4">
              <button onClick={() => setShowLogic(!showLogic)} className="flex items-center gap-1.5 text-[10px] text-[#D4AF37]/50 hover:text-[#D4AF37] transition-all" data-testid="western-view-logic">
                <Eye className="w-3 h-3" /><span>View Calculation Logic</span>
              </button>
              <AnimatePresence>
                {showLogic && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2 space-y-1.5">
                    <p className="text-[10px] text-white/40">Engine: Swiss Ephemeris v2.10 | Ephemeris: NASA JPL DE431 | Zodiac: Tropical</p>
                    <p className="text-[10px] text-white/30">Julian Day: {chart.julian_day} | House System: Placidus | ASC: {toDMS(chart.ascendant)} | MC: {toDMS(chart.midheaven)}</p>
                    <p className="text-[10px] text-white/30 italic">Western tradition per Claudius Ptolemy, Tetrabiblos (2nd century CE).</p>
                    <div className="flex items-center gap-1 pt-1 border-t border-[#D4AF37]/10">
                      <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                      <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AdBanner slot="western-result" className="mb-4" />
            <div className="flex gap-3">
              <ShareButton title="Western Chart" text={`My Western Chart: ${chart.ascendant_sign} Rising, Midheaven in ${chart.midheaven_sign}. Get yours on Zenith Oracle!`} />
              <button onClick={() => { setChart(null); setShowLogic(false); setActiveView('planets'); }} className="flex-1 bg-transparent border border-[#D4AF37] text-[#D4AF37] py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold text-sm" data-testid="western-new-calc">
                New Calculation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WesternChart;
