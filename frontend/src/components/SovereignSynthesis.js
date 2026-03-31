import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Shield, Crown, Scroll, ChevronDown,
  ChevronUp, Zap, Globe, Moon, Activity, Lock
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SovereignSynthesis = () => {
  const [form, setForm] = useState({ name: '', birth_date: '', birth_time: '', latitude: 28.6139, longitude: 77.209, timezone_offset: 5.5 });
  const [synthesis, setSynthesis] = useState(null);
  const [akashic, setAkashic] = useState(null);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [showIntegrity, setShowIntegrity] = useState(false);

  const invokeAll = async () => {
    if (!form.name || !form.birth_date || !form.birth_time) return;
    setLoading(true);
    try {
      const [synRes, akRes, intRes] = await Promise.all([
        axios.post(`${API}/synthesis/sovereign-verdict`, form),
        axios.post(`${API}/synthesis/akashic-echoes`, form),
        axios.post(`${API}/synthesis/data-integrity`, form),
      ]);
      setSynthesis(synRes.data);
      setAkashic(akRes.data);
      setIntegrity(intRes.data);
      setActiveSection('verdict');
    } catch (err) {
      console.error('Synthesis error:', err);
    }
    setLoading(false);
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12 pb-24" data-testid="sovereign-synthesis">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Scroll className="w-10 h-10 text-[#D4AF37] mr-4 flex-shrink-0" />
            Scriptural <span className="text-[#D4AF37] ml-2">Synthesis</span>
          </h1>
          <p className="text-[#94A3B8] text-base">Cross-system intelligence. One unified sovereign directive.</p>
        </motion.div>

        {!synthesis ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <Crown className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Enter Your Coordinates</h2>
              <p className="text-white/50 text-sm">All 13 modules converge into one Sovereign Verdict.</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none" data-testid="synthesis-name" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })}
                  className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" data-testid="synthesis-date" />
                <input type="time" step="1" value={form.birth_time} onChange={e => setForm({ ...form, birth_time: e.target.value })}
                  className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" data-testid="synthesis-time" />
              </div>
              <button onClick={invokeAll} disabled={loading || !form.name || !form.birth_date || !form.birth_time}
                className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest disabled:opacity-50"
                data-testid="synthesis-invoke">
                {loading ? 'Channeling All Systems...' : 'Invoke Sovereign Synthesis'}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Sovereign Verdict */}
            <AccordionSection
              id="verdict"
              icon={<Crown className="w-5 h-5 text-[#D4AF37]" />}
              title="Sovereign Verdict"
              subtitle={synthesis.sovereign_verdict.alignment}
              active={activeSection === 'verdict'}
              onToggle={() => toggleSection('verdict')}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest ${
                    synthesis.sovereign_verdict.confidence >= 70 ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                    synthesis.sovereign_verdict.confidence >= 50 ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'
                  }`} data-testid="verdict-confidence">
                    Confidence: {synthesis.sovereign_verdict.confidence}%
                  </div>
                  <span className="text-xs text-white/40">{synthesis.sovereign_verdict.alignment}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed" data-testid="verdict-directive">
                  {synthesis.sovereign_verdict.directive}
                </p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <MiniCard label="Dasha Lord" value={synthesis.cross_module_links.dasha_lord} />
                  <MiniCard label="Favored #" value={synthesis.cross_module_links.favored_numerology} />
                  <MiniCard label="Day Number" value={synthesis.cross_module_links.universal_day_number} />
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Favored Tarot</p>
                  <p className="text-xs text-[#D4AF37]">{synthesis.cross_module_links.favored_tarot.join(', ')}</p>
                </div>
                <p className="text-[10px] text-white/20 italic mt-2">{synthesis.cross_module_links.scripture}</p>
              </div>
            </AccordionSection>

            {/* Strategic Window */}
            <AccordionSection
              id="window"
              icon={<Zap className="w-5 h-5 text-[#D4AF37]" />}
              title="Daily Strategic Window"
              subtitle={synthesis.strategic_window.window_quality}
              active={activeSection === 'window'}
              onToggle={() => toggleSection('window')}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#020617]/60 border border-[#D4AF37]/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#D4AF37]">{synthesis.strategic_window.optimal_action_hour}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Optimal Action Hour</div>
                  </div>
                  <div className="bg-[#020617]/60 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{synthesis.strategic_window.power_level}%</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Power Level</div>
                  </div>
                </div>
                <p className="text-xs text-white/50">{synthesis.strategic_window.moon_transit}</p>
                <p className="text-[10px] text-white/20 italic">{synthesis.strategic_window.scripture}</p>
              </div>
            </AccordionSection>

            {/* Sovereign Identity */}
            <AccordionSection
              id="identity"
              icon={<Globe className="w-5 h-5 text-[#D4AF37]" />}
              title="Sovereign Identity"
              subtitle={synthesis.sovereign_identity.signature_name}
              active={activeSection === 'identity'}
              onToggle={() => toggleSection('identity')}
            >
              <div className="space-y-4">
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4 mb-3">
                  <h4 className="text-lg font-bold text-[#D4AF37] mb-1" data-testid="identity-signature">
                    {synthesis.sovereign_identity.signature_name}
                  </h4>
                  <p className="text-xs text-white/60">{synthesis.sovereign_identity.signature_description}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniCard label="BaZi Element" value={synthesis.sovereign_identity.bazi_element} />
                  <MiniCard label="Rising Sign" value={synthesis.sovereign_identity.western_rising} />
                  <MiniCard label="Nakshatra" value={synthesis.sovereign_identity.vedic_nakshatra} />
                  <MiniCard label="Moon Sign" value={synthesis.sovereign_identity.vedic_moon_sign} />
                </div>
                <p className="text-xs text-white/70 leading-relaxed mt-3" data-testid="identity-summary">
                  {synthesis.sovereign_identity.identity_summary}
                </p>
                <p className="text-[10px] text-white/20 italic">{synthesis.sovereign_identity.scripture}</p>
              </div>
            </AccordionSection>

            {/* Akashic Echoes */}
            {akashic && (
              <AccordionSection
                id="akashic"
                icon={<Eye className="w-5 h-5 text-[#D4AF37]" />}
                title="Akashic Echoes"
                subtitle={akashic.past_life_archetype}
                active={activeSection === 'akashic'}
                onToggle={() => toggleSection('akashic')}
              >
                <div className="space-y-4">
                  <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Moon className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider" data-testid="akashic-archetype">
                        {akashic.past_life_archetype}
                      </h4>
                    </div>
                    <p className="text-xs text-white/50 mb-1">
                      Previous incarnation environment: <span className="text-white/70">{akashic.past_life_environment}</span>
                    </p>
                    <div className="flex items-center space-x-4 text-[10px] text-white/30">
                      <span>Ketu: {akashic.ketu_position.sign} {akashic.ketu_position.degree.toFixed(1)}</span>
                      <span>8th House: {akashic.eighth_house.sign}</span>
                      <span>Pluto: {akashic.pluto_position.sign} {akashic.pluto_position.degree.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs uppercase tracking-widest text-[#D4AF37]/70 font-semibold">Soul History</h5>
                    <p className="text-sm text-white/70 leading-relaxed" data-testid="akashic-soul-history">
                      {akashic.soul_history}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs uppercase tracking-widest text-[#D4AF37]/70 font-semibold">8th House Karmic Overlay</h5>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {akashic.eighth_house_overlay}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs uppercase tracking-widest text-[#D4AF37]/70 font-semibold">Pluto Depth Analysis</h5>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {akashic.pluto_depth_analysis}
                    </p>
                  </div>

                  <p className="text-[10px] text-white/20 italic">
                    {akashic.scripture_source} | Method: {akashic.method}
                  </p>
                </div>
              </AccordionSection>
            )}

            {/* Data Integrity */}
            <div className="glass-card rounded-2xl overflow-hidden border-[#D4AF37]/20" data-testid="data-integrity-section">
              <button
                onClick={() => setShowIntegrity(!showIntegrity)}
                className="w-full flex items-center justify-between p-5 text-left"
                data-testid="data-integrity-toggle"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">View Data Integrity</h3>
                    <p className="text-[10px] text-white/30">Raw longitudes, DMS, scriptural citations</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-[#D4AF37]/50" />
              </button>

              <AnimatePresence>
                {showIntegrity && integrity && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4">
                      <div className="bg-[#020617]/60 rounded-lg p-4">
                        <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">Vedic Sidereal Positions</h4>
                        <div className="space-y-1.5">
                          {integrity.vedic_sidereal.planets && Object.entries(integrity.vedic_sidereal.planets).map(([name, data]) => (
                            <div key={name} className="flex items-center justify-between text-xs">
                              <span className="text-white/60 w-16">{name}</span>
                              <span className="text-white font-mono">{data.dms}</span>
                              <span className="text-[#D4AF37]">{data.sign}</span>
                              <span className="text-white/30 font-mono text-[10px]">{data.longitude_decimal.toFixed(4)}</span>
                              {data.retrograde && <span className="text-white/40 text-[9px]">(R)</span>}
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-white/15 italic mt-2">Ayanamsha: {integrity.vedic_sidereal.ayanamsha_value.toFixed(6)}</p>
                      </div>

                      <div className="bg-[#020617]/60 rounded-lg p-4">
                        <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">Western Tropical Positions</h4>
                        <div className="space-y-1.5">
                          {integrity.western_tropical.planets && Object.entries(integrity.western_tropical.planets).map(([name, data]) => (
                            <div key={name} className="flex items-center justify-between text-xs">
                              <span className="text-white/60 w-16">{name}</span>
                              <span className="text-white font-mono">{data.dms}</span>
                              <span className="text-[#D4AF37]">{data.sign}</span>
                              <span className="text-white/30 font-mono text-[10px]">{data.longitude_decimal.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#020617]/60 rounded-lg p-4">
                        <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">Scriptural Sources</h4>
                        <div className="space-y-2">
                          {integrity.all_sources && Object.entries(integrity.all_sources).map(([key, source]) => (
                            <div key={key} className="text-[10px]">
                              <span className="text-[#D4AF37] uppercase font-semibold">{key}: </span>
                              <span className="text-white/40 italic">{source}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px]">
                        <Activity className="w-3 h-3 text-[#D4AF37]" />
                        <span className="text-[#D4AF37] font-bold">STATUS: {integrity.integrity_status}</span>
                        <span className="text-white/30">| Engine: {integrity.engine}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AccordionSection = ({ id, icon, title, subtitle, active, onToggle, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card rounded-2xl overflow-hidden ${active ? 'border-[#D4AF37]/40' : 'border-[#D4AF37]/15'}`}
    data-testid={`section-${id}`}
  >
    <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-[10px] text-[#D4AF37]/60">{subtitle}</p>}
        </div>
      </div>
      {active ? <ChevronUp className="w-4 h-4 text-[#D4AF37]" /> : <ChevronDown className="w-4 h-4 text-[#D4AF37]/50" />}
    </button>
    <AnimatePresence>
      {active && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="px-5 pb-5">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const MiniCard = ({ label, value }) => (
  <div className="bg-[#020617]/60 border border-[#D4AF37]/15 rounded-lg p-2.5 text-center">
    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{label}</div>
    <div className="text-xs text-white font-semibold">{String(value)}</div>
  </div>
);

export default SovereignSynthesis;
