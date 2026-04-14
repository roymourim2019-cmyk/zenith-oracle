import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Shield, Eye, Sparkles, Star } from 'lucide-react';
import { AdBanner } from './AdComponents';
import { ShareButton } from './ShareCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NUMBER_DEEP_MEANINGS = {
  1: { archetype: 'The Pioneer', ruling: 'Sun', mantra: 'I lead.', vibration: 'Independence, originality, self-reliance. The number of creation and primal force.' },
  2: { archetype: 'The Diplomat', ruling: 'Moon', mantra: 'I harmonize.', vibration: 'Cooperation, sensitivity, balance. The number of duality and partnership.' },
  3: { archetype: 'The Creator', ruling: 'Jupiter', mantra: 'I express.', vibration: 'Creativity, joy, self-expression. The number of the artist and communicator.' },
  4: { archetype: 'The Builder', ruling: 'Rahu/Uranus', mantra: 'I structure.', vibration: 'Stability, hard work, discipline. The number of the foundation and solid ground.' },
  5: { archetype: 'The Adventurer', ruling: 'Mercury', mantra: 'I explore.', vibration: 'Freedom, change, adaptability. The number of the senses and experience.' },
  6: { archetype: 'The Nurturer', ruling: 'Venus', mantra: 'I love.', vibration: 'Responsibility, harmony, beauty. The number of family and service.' },
  7: { archetype: 'The Seeker', ruling: 'Ketu/Neptune', mantra: 'I know.', vibration: 'Wisdom, spirituality, introspection. The number of the philosopher and mystic.' },
  8: { archetype: 'The Powerhouse', ruling: 'Saturn', mantra: 'I achieve.', vibration: 'Power, authority, material mastery. The number of karma and infinite potential.' },
  9: { archetype: 'The Humanitarian', ruling: 'Mars', mantra: 'I serve.', vibration: 'Compassion, completion, universal love. The number of wisdom and selflessness.' },
  11: { archetype: 'The Illuminator', ruling: 'Moon (Master)', mantra: 'I inspire.', vibration: 'Master Number. Intuition, spiritual insight, visionary. The number of the enlightened.' },
  22: { archetype: 'The Master Builder', ruling: 'Rahu (Master)', mantra: 'I manifest.', vibration: 'Master Number. Visionary achievement, large-scale creation. Building for the ages.' },
  33: { archetype: 'The Master Teacher', ruling: 'Jupiter (Master)', mantra: 'I elevate.', vibration: 'Master Number. Spiritual elevation, selfless service. The ultimate compassion frequency.' },
};

const NumerologyCalculator = () => {
  const [formData, setFormData] = useState({ name: '', birth_date: '', birth_time: '12:00:00', latitude: 28.6139, longitude: 77.209, timezone_offset: 5.5 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLogic, setShowLogic] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birth_date) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/numerology/calculate`, formData);
      setResult(res.data);
    } catch (err) {
      console.error('Numerology error:', err);
    }
    setLoading(false);
  };

  const getDeep = (num) => NUMBER_DEEP_MEANINGS[num] || NUMBER_DEEP_MEANINGS[num > 9 ? num : 1];

  const NumberCard = ({ label, number, system, delay }) => {
    const deep = getDeep(number);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card rounded-2xl p-5 hover:border-[#D4AF37]/60 transition-all">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60 mb-2 font-semibold">{label}</p>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
            <span className="text-3xl font-bold text-[#D4AF37]">{number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white">{deep?.archetype || 'The Seeker'}</p>
            <p className="text-xs text-white/40 mt-0.5">Ruling: {deep?.ruling || 'Universal'} | Mantra: {deep?.mantra || 'I am.'}</p>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">{deep?.vibration || 'Unique cosmic vibration.'}</p>
          </div>
        </div>
        <p className="text-[10px] text-white/20 mt-3 italic">System: {system}</p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] py-8 pb-28" data-testid="numerology-calculator">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Hash className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] inline mr-3" />
            Numerology <span className="text-[#D4AF37]">Vault</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">Chaldean | Pythagorean | Vedic — Triple System Analysis</p>
          <p className="text-[10px] text-white/20 mt-1 italic">Chaldean (Babylon, 4000 BCE) | Pythagorean (Greece, 530 BCE) | Vedic (India, 1500 BCE)</p>
        </motion.div>

        {!result ? (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={calculate} className="max-w-md mx-auto glass-card rounded-2xl p-6 sm:p-8 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2 block font-semibold">Full Legal Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your full name as given at birth" className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none" data-testid="numerology-name-input" />
              <p className="text-[10px] text-white/20 mt-1">Chaldean & Pythagorean systems derive your number from your name</p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2 block font-semibold">Birth Date</label>
              <input type="date" value={formData.birth_date} onChange={e => setFormData(p => ({ ...p, birth_date: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none" data-testid="numerology-date-input" />
              <p className="text-[10px] text-white/20 mt-1">Vedic system derives your number from the day of birth</p>
            </div>
            <button type="submit" disabled={loading || !formData.name || !formData.birth_date} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest disabled:opacity-40 text-sm" data-testid="numerology-calculate-btn">
              {loading ? 'Calculating Vibrations...' : 'Calculate Your Numbers'}
            </button>
          </motion.form>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Name Banner */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60">Numerology Profile for</p>
              <h2 className="text-2xl font-bold text-white mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>{result.name}</h2>
              <p className="text-xs text-white/30 mt-0.5">{result.birth_date}</p>
            </motion.div>

            {/* Three Number Cards */}
            <NumberCard label="Chaldean Number (Name Vibration)" number={result.chaldean_number} system="Chaldean system (Babylon, c. 4000 BCE). Oldest known numerology. Maps A-Z to 1-8." delay={0.2} />
            <NumberCard label="Pythagorean Number (Life Path)" number={result.pythagorean_number} system="Pythagorean system (Greece, 530 BCE). Maps A-Z to 1-9. Preserves Master Numbers 11, 22, 33." delay={0.3} />
            <NumberCard label="Vedic Number (Birth Day)" number={result.vedic_number} system="Vedic system (India, c. 1500 BCE). Derived from the day of birth. Connected to Grahas (planetary rulers)." delay={0.4} />

            {/* Lucky Section */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3 font-semibold flex items-center gap-2"><Star className="w-4 h-4" /> Lucky Numbers</p>
                  <div className="flex gap-2">
                    {result.lucky_numbers?.map((num, i) => (
                      <span key={i} className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-lg">{num}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3 font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Lucky Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {result.lucky_colors?.map((color, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60">{color}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Interpretation */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card rounded-2xl p-5" data-testid="numerology-interpretation">
              <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-2 font-semibold">Core Interpretation</h3>
              <p className="text-white/70 text-sm leading-relaxed">{result.interpretation}</p>
            </motion.div>

            {/* Logic */}
            <div className="glass-card rounded-xl p-4">
              <button onClick={() => setShowLogic(!showLogic)} className="flex items-center gap-1.5 text-[10px] text-[#D4AF37]/50 hover:text-[#D4AF37] transition-all" data-testid="numerology-view-logic">
                <Eye className="w-3 h-3" /><span>View Calculation Logic</span>
              </button>
              <AnimatePresence>
                {showLogic && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2 space-y-1.5">
                    <p className="text-[10px] text-white/40">Chaldean: Sum letter values (A=1...H=5...P=8) then reduce to single digit.</p>
                    <p className="text-[10px] text-white/40">Pythagorean: Sum letter values (A=1...I=9, J=1...) with Master Number preservation (11, 22, 33).</p>
                    <p className="text-[10px] text-white/40">Vedic: Day of birth reduced to single digit per Jyotish tradition.</p>
                    <div className="flex items-center gap-1 pt-1 border-t border-[#D4AF37]/10">
                      <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                      <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AdBanner slot="numerology-result" className="mb-4" />
            <div className="flex gap-3">
              <ShareButton title="Numerology Profile" text={`My numbers: Chaldean ${result.chaldean_number}, Pythagorean ${result.pythagorean_number}, Vedic ${result.vedic_number}. Discover yours on Zenith Oracle!`} />
              <button onClick={() => setResult(null)} className="flex-1 bg-transparent border border-[#D4AF37] text-[#D4AF37] py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold text-sm" data-testid="numerology-new-calc">
                New Calculation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NumerologyCalculator;
