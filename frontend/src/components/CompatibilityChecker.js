import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, Sparkles, Shield, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { AdBanner } from './AdComponents';
import { ShareButton } from './ShareCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompatibilityChecker = () => {
  const [person1, setPerson1] = useState({ name: '', birth_date: '', birth_time: '12:00:00', latitude: 28.6139, longitude: 77.209, timezone_offset: 5.5 });
  const [person2, setPerson2] = useState({ name: '', birth_date: '', birth_time: '12:00:00', latitude: 28.6139, longitude: 77.209, timezone_offset: 5.5 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    if (!person1.name || !person1.birth_date || !person2.name || !person2.birth_date) return;
    setLoading(true);
    try {
      const [vedic1, vedic2, num1, num2, chinese1, chinese2] = await Promise.all([
        axios.post(`${API}/vedic/birth-chart`, person1),
        axios.post(`${API}/vedic/birth-chart`, person2),
        axios.post(`${API}/numerology/calculate`, person1),
        axios.post(`${API}/numerology/calculate`, person2),
        axios.post(`${API}/chinese/calculate`, person1),
        axios.post(`${API}/chinese/calculate`, person2),
      ]);

      const v1 = vedic1.data;
      const v2 = vedic2.data;
      const moon1 = v1.planets?.find(p => p.name === 'Moon');
      const moon2 = v2.planets?.find(p => p.name === 'Moon');

      const moonCompat = moon1 && moon2 ? computeMoonCompat(moon1.sign, moon2.sign) : 50;
      const dashaCompat = computeDashaCompat(v1.dasha_lord, v2.dasha_lord);
      const numCompat = computeNumCompat(num1.data.chaldean_number, num2.data.chaldean_number);
      const chineseCompat = chinese1.data.compatible_signs?.includes(chinese2.data.animal_sign) ? 90 : 55;

      const overall = Math.round((moonCompat + dashaCompat + numCompat + chineseCompat) / 4);

      setResult({
        person1: { name: person1.name, sign: v1.ascendant_sign, moon: moon1?.sign, dasha: v1.dasha_lord, animal: chinese1.data.animal_sign, chaldean: num1.data.chaldean_number },
        person2: { name: person2.name, sign: v2.ascendant_sign, moon: moon2?.sign, dasha: v2.dasha_lord, animal: chinese2.data.animal_sign, chaldean: num2.data.chaldean_number },
        scores: { moon: moonCompat, dasha: dashaCompat, numerology: numCompat, chinese: chineseCompat, overall },
      });
    } catch (err) {
      console.error('Compatibility error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-8 pb-28" data-testid="compatibility-checker">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] inline mr-3" />
            Cosmic <span className="text-[#D4AF37]">Compatibility</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">Cross-system compatibility: Vedic Moon + Dasha + Numerology + Chinese</p>
        </motion.div>

        {!result ? (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={calculate} className="max-w-2xl mx-auto space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <PersonInput label="Person 1" data={person1} setData={setPerson1} testPrefix="p1" />
              <PersonInput label="Person 2" data={person2} setData={setPerson2} testPrefix="p2" />
            </div>
            <button type="submit" disabled={loading || !person1.name || !person1.birth_date || !person2.name || !person2.birth_date} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest disabled:opacity-40 text-sm" data-testid="compat-calculate-btn">
              {loading ? 'Analyzing Cosmic Bond...' : 'Check Compatibility'}
            </button>
          </motion.form>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Overall Score */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 text-center" data-testid="compat-result">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-lg font-bold text-white">{result.person1.name}</span>
                <Heart className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-lg font-bold text-white">{result.person2.name}</span>
              </div>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#D4AF37" strokeWidth="8" strokeDasharray={`${result.scores.overall * 2.64} 264`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#D4AF37]">{result.scores.overall}%</span>
                </div>
              </div>
              <p className="text-sm text-white/60">{result.scores.overall >= 80 ? 'Exceptional Cosmic Bond' : result.scores.overall >= 60 ? 'Strong Compatibility' : result.scores.overall >= 40 ? 'Moderate Alignment' : 'Challenging but Growth-Oriented'}</p>
            </motion.div>

            {/* Breakdown */}
            <div className="grid sm:grid-cols-2 gap-4">
              <ScoreCard label="Moon Sign Compatibility" score={result.scores.moon} detail={`${result.person1.moon} + ${result.person2.moon}`} source="Vedic Ashta Koota" />
              <ScoreCard label="Dasha Resonance" score={result.scores.dasha} detail={`${result.person1.dasha} + ${result.person2.dasha}`} source="Vimshottari Dasha" />
              <ScoreCard label="Name Vibration Match" score={result.scores.numerology} detail={`Chaldean ${result.person1.chaldean} + ${result.person2.chaldean}`} source="Chaldean System" />
              <ScoreCard label="Chinese Zodiac" score={result.scores.chinese} detail={`${result.person1.animal} + ${result.person2.animal}`} source="Zi Ping Ba Zi" />
            </div>

            <AdBanner slot="compat-result" />

            <div className="flex gap-3">
              <ShareButton title="Cosmic Compatibility" text={`${result.person1.name} & ${result.person2.name}: ${result.scores.overall}% compatible! Check yours on Zenith Oracle`} />
              <button onClick={() => setResult(null)} className="flex-1 bg-transparent border border-[#D4AF37] text-[#D4AF37] py-2 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold text-xs" data-testid="compat-new-check">
                New Check
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PersonInput = ({ label, data, setData, testPrefix }) => (
  <div className="glass-card rounded-2xl p-5 space-y-3">
    <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">{label}</p>
    <input type="text" value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} placeholder="Name" className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37] focus:outline-none" data-testid={`${testPrefix}-name`} />
    <input type="date" value={data.birth_date} onChange={e => setData(p => ({ ...p, birth_date: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid={`${testPrefix}-date`} />
  </div>
);

const ScoreCard = ({ label, score, detail, source }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-white/60 font-semibold">{label}</p>
      <span className={`text-sm font-bold ${score >= 70 ? 'text-green-400' : score >= 45 ? 'text-[#D4AF37]' : 'text-red-400'}`}>{score}%</span>
    </div>
    <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
      <div className={`h-full rounded-full transition-all ${score >= 70 ? 'bg-green-400' : score >= 45 ? 'bg-[#D4AF37]' : 'bg-red-400'}`} style={{ width: `${score}%` }} />
    </div>
    <p className="text-[10px] text-white/30">{detail} | {source}</p>
  </motion.div>
);

const FIRE = ['Aries', 'Leo', 'Sagittarius'];
const EARTH = ['Taurus', 'Virgo', 'Capricorn'];
const AIR = ['Gemini', 'Libra', 'Aquarius'];
const WATER = ['Cancer', 'Scorpio', 'Pisces'];
const getElement = (sign) => FIRE.includes(sign) ? 'Fire' : EARTH.includes(sign) ? 'Earth' : AIR.includes(sign) ? 'Air' : 'Water';
const COMPAT_MAP = { 'Fire-Fire': 80, 'Fire-Air': 85, 'Fire-Earth': 45, 'Fire-Water': 40, 'Earth-Earth': 75, 'Earth-Water': 80, 'Earth-Air': 50, 'Air-Air': 70, 'Air-Water': 45, 'Water-Water': 85 };

function computeMoonCompat(s1, s2) {
  if (s1 === s2) return 90;
  const e1 = getElement(s1), e2 = getElement(s2);
  const key = [e1, e2].sort().join('-');
  return COMPAT_MAP[key] || 55;
}

function computeDashaCompat(d1, d2) {
  if (d1 === d2) return 85;
  const friendly = { Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'], Mars: ['Sun', 'Moon', 'Jupiter'], Mercury: ['Sun', 'Venus'], Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'], Saturn: ['Mercury', 'Venus'], Rahu: ['Mercury', 'Venus', 'Saturn'], Ketu: ['Mars', 'Jupiter'] };
  if (friendly[d1]?.includes(d2) || friendly[d2]?.includes(d1)) return 75;
  return 45;
}

function computeNumCompat(n1, n2) {
  if (n1 === n2) return 90;
  const diff = Math.abs(n1 - n2);
  if (diff <= 1) return 80;
  if (diff <= 3) return 65;
  return 50;
}

export default CompatibilityChecker;
