import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Star, Heart, Users } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ANIMAL_EMOJIS = {
  Rat: '\uD83D\uDC00', Ox: '\uD83D\uDC02', Tiger: '\uD83D\uDC05', Rabbit: '\uD83D\uDC07',
  Dragon: '\uD83D\uDC09', Snake: '\uD83D\uDC0D', Horse: '\uD83D\uDC0E', Goat: '\uD83D\uDC10',
  Monkey: '\uD83D\uDC12', Rooster: '\uD83D\uDC13', Dog: '\uD83D\uDC15', Pig: '\uD83D\uDC16',
};

const ELEMENT_STYLES = {
  Metal: { color: '#C0C0C0', bg: 'rgba(192,192,192,0.1)' },
  Water: { color: '#4FC3F7', bg: 'rgba(79,195,247,0.1)' },
  Wood: { color: '#66BB6A', bg: 'rgba(102,187,106,0.1)' },
  Fire: { color: '#FF7043', bg: 'rgba(255,112,67,0.1)' },
  Earth: { color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' },
};

const ChineseAstrology = () => {
  const [formData, setFormData] = useState({ name: 'User', birth_date: '', birth_time: '12:00:00', latitude: 28.6139, longitude: 77.209, timezone_offset: 5.5 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    if (!formData.birth_date) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chinese/calculate`, formData);
      setResult(res.data);
    } catch (err) {
      console.error('Chinese astrology error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-8 pb-28" data-testid="chinese-astrology">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-3xl mr-3">{'\uD83D\uDC09'}</span>
            Chinese <span className="text-[#D4AF37]">Oracle</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">Lunisolar Zodiac | Five Elements | Yin-Yang Balance</p>
          <p className="text-[10px] text-white/20 mt-1 italic">Zi Ping Ba Zi system (Song Dynasty, 960-1279 CE)</p>
        </motion.div>

        {!result ? (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={calculate} className="max-w-md mx-auto glass-card rounded-2xl p-6 sm:p-8 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2 block font-semibold">Birth Date</label>
              <input type="date" value={formData.birth_date} onChange={e => setFormData(p => ({ ...p, birth_date: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none" data-testid="chinese-date-input" />
              <p className="text-[10px] text-white/20 mt-1">The year determines your animal sign and element</p>
            </div>
            <button type="submit" disabled={loading || !formData.birth_date} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest disabled:opacity-40 text-sm" data-testid="chinese-calculate-btn">
              {loading ? 'Consulting the Oracle...' : 'Reveal Your Chinese Zodiac'}
            </button>
          </motion.form>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Main Animal Card */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 text-center" data-testid="chinese-result-card">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-7xl mb-4">
                {ANIMAL_EMOJIS[result.animal_sign] || '\u2728'}
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{result.animal_sign}</h2>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: ELEMENT_STYLES[result.element]?.bg, color: ELEMENT_STYLES[result.element]?.color }}>
                  {result.element}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 text-white/60">
                  {result.yin_yang}
                </span>
              </div>
              <p className="text-xs text-white/30">{result.birth_date}</p>
            </motion.div>

            {/* Traits Grid */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4 font-semibold flex items-center gap-2">
                <Star className="w-4 h-4" /> Personality Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.personality_traits?.map((trait, i) => (
                  <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }} className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-sm text-white/70 capitalize">
                    {trait}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Compatibility & Lucky Numbers */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3 font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" /> Compatible Signs
                </h3>
                <div className="space-y-2">
                  {result.compatible_signs?.map((sign, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-2.5">
                      <span className="text-2xl">{ANIMAL_EMOJIS[sign] || ''}</span>
                      <span className="text-sm text-white/70 font-semibold">{sign}</span>
                      <Heart className="w-3 h-3 text-[#D4AF37] ml-auto" />
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Lucky Numbers & Colors
                </h3>
                <div className="mb-4">
                  <p className="text-[10px] text-white/30 mb-1.5">Lucky Numbers</p>
                  <div className="flex gap-2">
                    {result.lucky_numbers?.map((num, i) => (
                      <span key={i} className="w-10 h-10 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{num}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 mb-1.5">Lucky Colors</p>
                  <div className="flex gap-2">
                    {result.lucky_colors?.map((color, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60">{color}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Scripture */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
              </div>
              <p className="text-[10px] text-white/30 mt-1">Chinese Lunisolar calendar computation (1900-2100). Animal sign = (Year - 1900) mod 12. Element = (Year - 1900) mod 10 / 2. Per Zi Ping Ba Zi system.</p>
            </div>

            <button onClick={() => setResult(null)} className="w-full bg-transparent border border-[#D4AF37] text-[#D4AF37] py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold text-sm" data-testid="chinese-new-calc">
              New Calculation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChineseAstrology;
