import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Star, Shield, Eye, Sparkles, ChevronDown, Activity } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SIGN_GLYPHS = {
  Aries: '\u2648', Taurus: '\u2649', Gemini: '\u264A', Cancer: '\u264B',
  Leo: '\u264C', Virgo: '\u264D', Libra: '\u264E', Scorpio: '\u264F',
  Sagittarius: '\u2650', Capricorn: '\u2651', Aquarius: '\u2652', Pisces: '\u2653',
};

const PLANET_COLORS = {
  Sun: '#FFD700', Moon: '#C0C0C0', Mercury: '#7FFFD4', Venus: '#FF69B4',
  Mars: '#FF4500', Jupiter: '#FFA500', Saturn: '#8B8682', Rahu: '#4B0082', Ketu: '#800020',
};

const VedicChart = ({ userTier }) => {
  const [formData, setFormData] = useState({ name: '', birth_date: '', birth_time: '', latitude: '28.6139', longitude: '77.2090', timezone_offset: 5.5 });
  const [chart, setChart] = useState(null);
  const [dasha, setDasha] = useState(null);
  const [pakshi, setPakshi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chart');
  const [showLogic, setShowLogic] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birth_date || !formData.birth_time) return;
    setLoading(true);
    const payload = { ...formData, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) };
    try {
      const [chartRes, dashaRes, pakshiRes] = await Promise.all([
        axios.post(`${API}/vedic/birth-chart`, payload),
        axios.post(`${API}/vedic/dasha-periods`, payload),
        axios.post(`${API}/vedic/pancha-pakshi`, payload),
      ]);
      setChart(chartRes.data);
      setDasha(dashaRes.data);
      setPakshi(pakshiRes.data);
    } catch (err) {
      console.error('Vedic calculation error:', err);
    }
    setLoading(false);
  };

  const toDMS = (deg) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.round(((deg - d) * 60 - m) * 60);
    return `${d}\u00B0${m}'${s}"`;
  };

  return (
    <div className="min-h-screen bg-[#020617] py-8 pb-28" data-testid="vedic-chart">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] inline mr-3" />
            Vedic <span className="text-[#D4AF37]">Zenith</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">Sidereal D1 Chart | Lahiri Ayanamsha | Vimshottari Dasha | Pancha-Pakshi Oracle</p>
          <p className="text-[10px] text-white/20 mt-1 italic">Swiss Ephemeris (NASA JPL DE431) | BPHS Vimsottari Rules</p>
        </motion.div>

        {!chart ? (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={calculate} className="max-w-xl mx-auto glass-card rounded-2xl p-6 sm:p-8 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-1 block font-semibold">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Enter your name" className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#D4AF37] focus:outline-none" data-testid="vedic-name-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Birth Date</label>
                <input type="date" value={formData.birth_date} onChange={e => setFormData(p => ({ ...p, birth_date: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="vedic-date-input" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Birth Time</label>
                <input type="time" step="1" value={formData.birth_time} onChange={e => setFormData(p => ({ ...p, birth_time: e.target.value ? (e.target.value.length === 5 ? e.target.value + ':00' : e.target.value) : '' }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="vedic-time-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Latitude</label>
                <input type="number" step="any" value={formData.latitude} onChange={e => setFormData(p => ({ ...p, latitude: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="vedic-lat-input" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Longitude</label>
                <input type="number" step="any" value={formData.longitude} onChange={e => setFormData(p => ({ ...p, longitude: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="vedic-lng-input" />
              </div>
            </div>
            <button type="submit" disabled={loading || !formData.name || !formData.birth_date || !formData.birth_time} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest disabled:opacity-40 text-sm" data-testid="vedic-calculate-btn">
              {loading ? 'Calculating via Swiss Ephemeris...' : 'Calculate Vedic Chart'}
            </button>
          </motion.form>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Summary Banner */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60">Birth Chart for</p>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{chart.person_name}</h2>
                  <p className="text-xs text-white/40 mt-0.5">{chart.birth_datetime}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#D4AF37]">{chart.power_score}<span className="text-sm text-white/30">/100</span></p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Power Score</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#D4AF37]/10">
                <div><p className="text-[10px] text-white/30">Ascendant</p><p className="text-sm text-[#D4AF37] font-semibold">{SIGN_GLYPHS[chart.ascendant_sign]} {chart.ascendant_sign} ({toDMS(chart.ascendant)})</p></div>
                <div><p className="text-[10px] text-white/30">Lunar Mansion</p><p className="text-sm text-white/80 font-semibold">{chart.lunar_mansion}</p></div>
                <div><p className="text-[10px] text-white/30">Dasha Lord</p><p className="text-sm text-white/80 font-semibold">{chart.dasha_lord} ({chart.dasha_balance_years?.toFixed(1)}y remaining)</p></div>
                <div><p className="text-[10px] text-white/30">Ayanamsha</p><p className="text-sm text-white/80 font-semibold">Lahiri {chart.ayanamsha?.toFixed(4)}</p></div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['chart', 'dasha', 'pakshi'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-white/40 border border-white/10 hover:border-[#D4AF37]/30'}`} data-testid={`vedic-tab-${tab}`}>
                  {tab === 'chart' ? 'Planetary Positions' : tab === 'dasha' ? 'Vimshottari Dasha' : 'Pancha-Pakshi'}
                </button>
              ))}
            </div>

            {/* Planetary Positions */}
            {activeTab === 'chart' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="vedic-planets-table">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15">
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Planet</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Sign</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Longitude</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Degree</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Speed</th>
                        <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chart.planets?.map((p, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-[#D4AF37]/5 transition-colors">
                          <td className="px-4 py-3 font-semibold" style={{ color: PLANET_COLORS[p.name] || '#D4AF37' }}>{p.name}</td>
                          <td className="px-4 py-3 text-white/70">{SIGN_GLYPHS[p.sign] || ''} {p.sign}</td>
                          <td className="px-4 py-3 text-white/50 font-mono text-xs">{toDMS(p.longitude)}</td>
                          <td className="px-4 py-3 text-white/50 font-mono text-xs">{toDMS(p.degree_in_sign)}</td>
                          <td className="px-4 py-3 text-white/40 font-mono text-xs">{p.speed?.toFixed(4)}&deg;/day</td>
                          <td className="px-4 py-3 text-center">{p.retrograde ? <span className="text-[#FF4500] text-xs font-bold">R</span> : <span className="text-green-400 text-xs">D</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* View Calculation Logic */}
                <div className="p-4 border-t border-[#D4AF37]/10">
                  <button onClick={() => setShowLogic(!showLogic)} className="flex items-center gap-1.5 text-[10px] text-[#D4AF37]/50 hover:text-[#D4AF37] transition-all" data-testid="vedic-view-logic">
                    <Eye className="w-3 h-3" /><span>View Calculation Logic</span>
                  </button>
                  <AnimatePresence>
                    {showLogic && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2 space-y-1.5">
                        <p className="text-[10px] text-white/40">Engine: Swiss Ephemeris v2.10 | Ephemeris: NASA JPL DE431 | Ayanamsha: Lahiri (Chitrapaksha) = {chart.ayanamsha?.toFixed(6)}&deg;</p>
                        <p className="text-[10px] text-white/30">Julian Day: {chart.julian_day} | House System: Placidus | Zodiac: Sidereal</p>
                        <p className="text-[10px] text-white/30 italic">Dasha computation per Brihat Parashara Hora Shastra (BPHS) Vimsottari system.</p>
                        <div className="flex items-center gap-1 pt-1 border-t border-[#D4AF37]/10">
                          <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                          <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Dasha Periods */}
            {activeTab === 'dasha' && dasha && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3" data-testid="vedic-dasha-panel">
                <p className="text-xs text-white/30 italic">Vimshottari Dasha — 120-year cycle per Brihat Parashara Hora Shastra</p>
                {dasha.periods?.map((p, i) => (
                  <div key={i} className={`glass-card rounded-xl p-4 transition-all ${p.is_current ? 'border-[#D4AF37]/60 shadow-[0_0_12px_rgba(212,175,55,0.2)]' : ''}`} data-testid={`dasha-period-${i}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${p.is_current ? 'bg-[#D4AF37] text-[#020617]' : 'bg-white/5 text-white/50'}`} style={{ color: p.is_current ? '#020617' : PLANET_COLORS[p.lord] }}>
                          {p.lord?.slice(0, 2)}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${p.is_current ? 'text-[#D4AF37]' : 'text-white/70'}`}>{p.lord} Mahadasha {p.is_current ? '(ACTIVE)' : ''}</p>
                          <p className="text-[10px] text-white/30">{p.start_date} to {p.end_date} | {p.duration_years?.toFixed(1)} years</p>
                        </div>
                      </div>
                      {p.is_current && <Activity className="w-4 h-4 text-[#D4AF37] animate-pulse" />}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Pancha-Pakshi */}
            {activeTab === 'pakshi' && pakshi && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6" data-testid="vedic-pakshi-panel">
                <div className="text-center mb-6">
                  <p className="text-4xl mb-2">{pakshi.pancha_pakshi?.birth_bird === 'Vulture' ? '\uD83E\uDD85' : pakshi.pancha_pakshi?.birth_bird === 'Owl' ? '\uD83E\uDD89' : pakshi.pancha_pakshi?.birth_bird === 'Crow' ? '\u2B1B' : pakshi.pancha_pakshi?.birth_bird === 'Cock' ? '\uD83D\uDC13' : '\uD83E\uDD9A'}</p>
                  <h3 className="text-xl font-bold text-[#D4AF37]" style={{ fontFamily: 'Playfair Display, serif' }}>{pakshi.pancha_pakshi?.birth_bird}</h3>
                  <p className="text-xs text-white/40">{pakshi.pancha_pakshi?.birth_bird_sanskrit} | Moon in {pakshi.moon_sign}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3"><p className="text-[10px] text-white/30">Current State</p><p className="text-sm text-[#D4AF37] font-semibold">{pakshi.pancha_pakshi?.current_state}</p></div>
                  <div className="bg-white/5 rounded-lg p-3"><p className="text-[10px] text-white/30">Power Level</p><p className="text-sm text-white/80 font-semibold">{pakshi.pancha_pakshi?.power_level}%</p></div>
                  <div className="bg-white/5 rounded-lg p-3"><p className="text-[10px] text-white/30">Period</p><p className="text-sm text-white/80 font-semibold">{pakshi.pancha_pakshi?.period_label}</p></div>
                  <div className="bg-white/5 rounded-lg p-3 col-span-2 sm:col-span-3"><p className="text-[10px] text-white/30">Strategic Guidance</p><p className="text-sm text-white/70">{pakshi.pancha_pakshi?.strategic_guidance}</p></div>
                </div>
                <p className="text-[10px] text-white/20 mt-4 italic">Pancha-Pakshi Oracle per Tamil Siddha tradition. Bird cycle derived from Natal Moon Nakshatra.</p>
              </motion.div>
            )}

            {/* New Calculation */}
            <button onClick={() => { setChart(null); setDasha(null); setPakshi(null); setActiveTab('chart'); setShowLogic(false); }} className="w-full bg-transparent border border-[#D4AF37] text-[#D4AF37] py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold text-sm" data-testid="vedic-new-calc">
              New Calculation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VedicChart;
