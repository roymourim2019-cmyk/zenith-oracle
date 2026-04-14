import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Eye, Shield, Volume2, VolumeX, ChevronDown, Heart, Briefcase, Flame, Zap, Sun } from 'lucide-react';
import axios from 'axios';

import { AdBanner } from './AdComponents';
import { ShareButton } from './ShareCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const READING_TYPES = [
  { id: 'general', label: 'General Oracle', icon: Sparkles, desc: 'Past, Present & Future' },
  { id: 'career', label: 'Career & Ambition', icon: Briefcase, desc: 'Strategic career moves' },
  { id: 'aura', label: 'Aura & Energy', icon: Flame, desc: 'Chakra-Tarot alignment' },
  { id: 'energy', label: "Today's Forecast", icon: Sun, desc: 'Dawn to Night wisdom' },
  { id: 'love', label: 'Heart Reading', icon: Heart, desc: 'Relationship insight' },
];

const SPREAD_SIZES = [
  { num: 3, label: '3-Card Spread', desc: 'Quick insight' },
  { num: 5, label: '5-Card Spread', desc: 'Deep analysis' },
];

const SCRIPTURE_MAP = {
  Major: 'Arcana correspondences per the Hermetic Order of the Golden Dawn (1888). Planetary-arcana mappings per Book of Thoth (Aleister Crowley, 1944).',
  Minor: 'Minor Arcana suit-element correspondence per Golden Dawn tradition: Wands=Fire, Cups=Water, Swords=Air, Pentacles=Earth.',
  'Alpha Strategy': 'Alpha Strategy deck — proprietary enterprise-grade strategic overlay cards.',
};

const TOTAL_SPREAD_CARDS = 21;

const TarotReader = () => {
  const [phase, setPhase] = useState('setup');
  const [question, setQuestion] = useState('');
  const [readingType, setReadingType] = useState('general');
  const [numCards, setNumCards] = useState(3);
  const [birthData, setBirthData] = useState({ birth_date: '', birth_time: '', latitude: '', longitude: '' });
  const [showBirthForm, setShowBirthForm] = useState(false);

  const [spreadCards, setSpreadCards] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [shuffling, setShuffling] = useState(false);

  const [reading, setReading] = useState(null);
  const [revealedCards, setRevealedCards] = useState([]);
  const [showLogic, setShowLogic] = useState(null);
  const [loading, setLoading] = useState(false);

  const [toneActive, setToneActive] = useState(false);
  const oscRef = useRef(null);
  const ctxRef = useRef(null);

  const getAudioCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const toggleSolfeggio = () => {
    if (toneActive && oscRef.current) {
      oscRef.current.stop();
      oscRef.current = null;
      setToneActive(false);
      return;
    }
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 528;
      osc.type = 'sine';
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      setToneActive(true);
    } catch (e) { /* audio unsupported */ }
  };

  const playShuffleSound = () => {
    try {
      const ctx = getAudioCtx();
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 180 + Math.random() * 350;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.05);
      }
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 80, 40]);
  };

  const playSelectSound = () => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 660;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const playRevealSound = () => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(60);
  };

  const startSelection = () => {
    if (!question.trim()) return;
    playShuffleSound();
    setShuffling(true);
    const cards = Array.from({ length: TOTAL_SPREAD_CARDS }, (_, i) => i);
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    setSpreadCards(cards);
    setSelectedIndices([]);
    setTimeout(() => {
      setShuffling(false);
      setPhase('selecting');
    }, 1200);
  };

  const toggleCardSelect = (idx) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(prev => prev.filter(i => i !== idx));
      return;
    }
    if (selectedIndices.length >= numCards) return;
    playSelectSound();
    setSelectedIndices(prev => [...prev, idx]);
  };

  const submitSelection = async () => {
    if (selectedIndices.length < numCards) return;
    setLoading(true);
    setPhase('revealing');

    const payload = {
      question,
      num_cards: numCards,
      reading_type: readingType,
    };
    if (showBirthForm && birthData.birth_date && birthData.birth_time && birthData.latitude && birthData.longitude) {
      payload.birth_date = birthData.birth_date;
      payload.birth_time = birthData.birth_time;
      payload.latitude = parseFloat(birthData.latitude);
      payload.longitude = parseFloat(birthData.longitude);
    }

    try {
      const res = await axios.post(`${API}/tarot/reading`, payload);
      setReading(res.data);
      setRevealedCards([]);
      for (let i = 0; i < res.data.cards.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        playRevealSound();
        setRevealedCards(prev => [...prev, i]);
      }
    } catch (err) {
      console.error('Tarot reading error:', err);
    }
    setLoading(false);
  };

  const resetAll = () => {
    setPhase('setup');
    setQuestion('');
    setReading(null);
    setRevealedCards([]);
    setSelectedIndices([]);
    setSpreadCards([]);
    setShowLogic(null);
    if (oscRef.current) { oscRef.current.stop(); oscRef.current = null; setToneActive(false); }
  };

  return (
    <div className="min-h-screen bg-[#020617] py-8 pb-28" data-testid="tarot-reader">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] inline mr-3 liquid-gold-animation" />
              The Oracle's <span className="text-[#D4AF37]">Deck</span>
            </h1>
            <button onClick={toggleSolfeggio} className="flex items-center gap-1.5 text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-all px-3 py-1.5 border border-[#D4AF37]/20 rounded-lg" data-testid="tarot-solfeggio-toggle">
              {toneActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span>528Hz</span>
            </button>
          </div>
          <p className="text-[#94A3B8] text-sm">78 + 44 Alpha Strategy Cards | Mersenne Twister Precision</p>
          <p className="text-[10px] text-white/20 mt-1 italic">Correspondences per the Hermetic Order of the Golden Dawn (1888)</p>
        </motion.div>

        {/* Phase: Setup */}
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto space-y-6">
              {/* Question */}
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3 block font-semibold">Your Question</label>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="What strategic insight do you seek from the Oracle?"
                  rows="3"
                  className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-[#D4AF37] focus:outline-none resize-none text-sm"
                  data-testid="tarot-question-input"
                />
              </div>

              {/* Reading Type */}
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-semibold">Reading Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {READING_TYPES.map(rt => {
                    const Icon = rt.icon;
                    const active = readingType === rt.id;
                    return (
                      <button
                        key={rt.id}
                        onClick={() => setReadingType(rt.id)}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-white/10 hover:border-[#D4AF37]/40'}`}
                        data-testid={`reading-type-${rt.id}`}
                      >
                        <Icon className={`w-5 h-5 mb-1.5 ${active ? 'text-[#D4AF37]' : 'text-white/40'}`} />
                        <p className={`text-xs font-semibold ${active ? 'text-[#D4AF37]' : 'text-white/70'}`}>{rt.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{rt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spread Size */}
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-semibold">Spread Size</label>
                <div className="flex gap-4">
                  {SPREAD_SIZES.map(s => {
                    const active = numCards === s.num;
                    return (
                      <button
                        key={s.num}
                        onClick={() => setNumCards(s.num)}
                        className={`flex-1 p-4 rounded-xl border text-center transition-all duration-200 ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 hover:border-[#D4AF37]/40'}`}
                        data-testid={`spread-size-${s.num}`}
                      >
                        <p className={`text-2xl font-bold ${active ? 'text-[#D4AF37]' : 'text-white/50'}`}>{s.num}</p>
                        <p className={`text-xs mt-1 ${active ? 'text-[#D4AF37]/80' : 'text-white/30'}`}>{s.label}</p>
                        <p className="text-[10px] text-white/20 mt-0.5">{s.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Birth Data (Optional) */}
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <button onClick={() => setShowBirthForm(!showBirthForm)} className="w-full flex items-center justify-between" data-testid="toggle-birth-data">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">Personalize with Birth Data</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Moon sign deck weighting + Dasha Lord resonance</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[#D4AF37]/60 transition-transform ${showBirthForm ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showBirthForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div>
                          <label className="text-[10px] text-white/40 mb-1 block">Birth Date</label>
                          <input type="date" value={birthData.birth_date} onChange={e => setBirthData(p => ({ ...p, birth_date: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="birth-date-input" />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 mb-1 block">Birth Time</label>
                          <input type="time" step="1" value={birthData.birth_time} onChange={e => setBirthData(p => ({ ...p, birth_time: e.target.value ? e.target.value + (e.target.value.length === 5 ? ':00' : '') : '' }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="birth-time-input" />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 mb-1 block">Latitude</label>
                          <input type="number" step="any" placeholder="28.6139" value={birthData.latitude} onChange={e => setBirthData(p => ({ ...p, latitude: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="latitude-input" />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 mb-1 block">Longitude</label>
                          <input type="number" step="any" placeholder="77.2090" value={birthData.longitude} onChange={e => setBirthData(p => ({ ...p, longitude: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="longitude-input" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Start Button */}
              <button
                onClick={startSelection}
                disabled={!question.trim()}
                className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 rounded-xl hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all duration-300 uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                data-testid="shuffle-deck-button"
              >
                Shuffle & Spread the Deck
              </button>
            </motion.div>
          )}

          {/* Phase: Selecting */}
          {(phase === 'selecting' || shuffling) && (
            <motion.div key="selecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <p className="text-[#D4AF37] text-sm uppercase tracking-[0.2em] font-semibold">
                  {shuffling ? 'Shuffling the Oracle Deck...' : `Select ${numCards} cards from the spread`}
                </p>
                {!shuffling && (
                  <p className="text-white/30 text-xs mt-1">
                    {selectedIndices.length} / {numCards} selected — Trust your intuition
                  </p>
                )}
              </div>

              {/* Spread Grid */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6" data-testid="card-spread">
                {spreadCards.map((cardVal, idx) => {
                  const selected = selectedIndices.includes(idx);
                  const selOrder = selectedIndices.indexOf(idx);
                  const full = selectedIndices.length >= numCards && !selected;
                  return (
                    <motion.button
                      key={idx}
                      initial={shuffling ? { rotateY: 180, scale: 0.5, opacity: 0 } : { rotateY: 0, scale: 1, opacity: 1 }}
                      animate={{ rotateY: 0, scale: selected ? 1.08 : 1, opacity: full ? 0.35 : 1 }}
                      transition={{ delay: shuffling ? idx * 0.04 : 0, duration: 0.4 }}
                      onClick={() => !shuffling && toggleCardSelect(idx)}
                      disabled={shuffling || full}
                      className={`relative w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        selected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_0_16px_rgba(212,175,55,0.4)]'
                          : 'border-white/10 bg-[#0a0f2e] hover:border-[#D4AF37]/50 hover:bg-[#0a0f2e]/80'
                      } ${full ? 'cursor-not-allowed' : ''}`}
                      data-testid={`spread-card-${idx}`}
                    >
                      <div className="flex flex-col items-center">
                        <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${selected ? 'text-[#D4AF37]' : 'text-white/15'}`} />
                        {selected && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4AF37] rounded-full text-[#020617] text-[10px] font-bold flex items-center justify-center">
                            {selOrder + 1}
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Confirm button */}
              {!shuffling && (
                <div className="text-center">
                  <button
                    onClick={submitSelection}
                    disabled={selectedIndices.length < numCards || loading}
                    className="bg-[#D4AF37] text-[#020617] font-bold py-3 px-10 rounded-xl hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all duration-300 uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    data-testid="confirm-selection-button"
                  >
                    {loading ? 'Consulting the Oracle...' : 'Reveal Your Cards'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Phase: Revealing / Result */}
          {phase === 'revealing' && reading && (
            <motion.div key="revealing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
              {/* Reading header */}
              <div className="glass-card rounded-2xl p-5 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60">{reading.reading_name}</p>
                    <p className="text-white/80 text-sm mt-1"><strong className="text-[#D4AF37]">Q:</strong> {reading.question}</p>
                  </div>
                  {reading.personalization?.moon_sign && (
                    <div className="text-right">
                      <p className="text-[10px] text-white/30">Personalized</p>
                      <p className="text-xs text-[#D4AF37]">Moon: {reading.personalization.moon_sign} | Dasha: {reading.personalization.dasha_lord}</p>
                      <p className="text-[10px] text-white/20">Power: {reading.personalization.power_score}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div className={`grid gap-5 mb-8 ${reading.cards.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
                {reading.cards.map((card, i) => (
                  <div key={i}>
                    <AnimatePresence>
                      {revealedCards.includes(i) ? (
                        <motion.div
                          initial={{ rotateY: 90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="glass-card rounded-2xl overflow-hidden border-[#D4AF37]/40 hover:border-[#D4AF37]/80 transition-all"
                          data-testid={`revealed-card-${i}`}
                        >
                          {/* Position header */}
                          <div className="bg-[#D4AF37]/10 px-4 py-2 border-b border-[#D4AF37]/20">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[#D4AF37] font-semibold">{card.position || `Card ${i + 1}`}</p>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-[#D4AF37] liquid-gold-animation flex-shrink-0" />
                              <h4 className="text-base font-bold text-[#D4AF37] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{card.name}</h4>
                            </div>
                            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">
                              {card.arcana} Arcana{card.suit ? ` — ${card.suit}` : ''}{card.element ? ` — ${card.element}` : ''}
                            </p>
                            <p className="text-xs text-white/70 leading-relaxed">{card.upright_meaning}</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="rounded-2xl border-2 border-white/10 bg-[#0a0f2e] h-52 flex items-center justify-center"
                        >
                          <div className="text-center">
                            <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-2" />
                            <p className="text-[10px] text-white/20 uppercase tracking-widest">Revealing...</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* View Calculation Logic */}
                    {revealedCards.includes(i) && (
                      <>
                        <button
                          onClick={() => setShowLogic(showLogic === i ? null : i)}
                          className="w-full mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#D4AF37]/50 hover:text-[#D4AF37] py-1.5 border border-[#D4AF37]/10 rounded-lg transition-all"
                          data-testid={`view-logic-${i}`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Calculation Logic</span>
                        </button>
                        <AnimatePresence>
                          {showLogic === i && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="glass-card rounded-lg p-3 mt-2 border-[#D4AF37]/20 space-y-2" data-testid={`logic-overlay-${i}`}>
                                <div>
                                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">Raw Data</p>
                                  <p className="text-[10px] text-white/50">
                                    {card.name} — {card.arcana} Arcana{card.element ? ` — Element: ${card.element}` : ''}{card.planet ? ` — Planet: ${card.planet}` : ''} — Position: {card.position} — Draw Seed: Mersenne Twister (MT19937)
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">The Ancient Rule</p>
                                  <p className="text-[10px] text-white/40 italic">{SCRIPTURE_MAP[card.arcana] || SCRIPTURE_MAP.Major}</p>
                                </div>
                                {reading.personalization?.moon_sign && (
                                  <div>
                                    <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">Personalization</p>
                                    <p className="text-[10px] text-white/40">
                                      Deck weighted for {reading.personalization.element_affinity} element (Moon in {reading.personalization.moon_sign}). Dasha Lord {reading.personalization.dasha_lord} amplifies arcana {'{'}correlation per BPHS Vimsottari rules{'}'}.
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 pt-1 border-t border-[#D4AF37]/10">
                                  <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                                  <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Interpretation */}
              {revealedCards.length === reading.cards.length && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="glass-card rounded-2xl p-6 sm:p-8 mb-4" data-testid="reading-interpretation">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {reading.reading_name} — Interpretation
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">{reading.interpretation}</p>
                    <div className="mt-4 pt-3 border-t border-[#D4AF37]/10">
                      <p className="text-[10px] text-white/20 italic">{reading.scripture}</p>
                      <p className="text-[10px] text-white/15 mt-1">Interpretation framework per Hermetic Order of the Golden Dawn tradition. Card draw: Mersenne Twister (MT19937) PRNG.</p>
                    </div>
                  </div>

                  {/* New Reading */}
                  <div className="flex gap-3">
                    <ShareButton title="Tarot Reading" text={`My ${reading.reading_name}: "${reading.interpretation?.slice(0, 100)}..." Get yours on Zenith Oracle!`} />
                    <button
                      onClick={resetAll}
                      className="flex-1 bg-transparent border border-[#D4AF37] text-[#D4AF37] py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold text-sm"
                      data-testid="new-reading-button"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      New Reading
                    </button>
                  </div>
                  <AdBanner slot="tarot-result" className="mt-4" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TarotReader;
