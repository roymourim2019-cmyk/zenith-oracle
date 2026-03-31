import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Eye, Shield, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TAROT_SCRIPTURE = {
  'Major': 'Arcana correspondences per the Hermetic Order of the Golden Dawn (1888). Planetary-arcana mappings per Book of Thoth (Aleister Crowley, 1944).',
  'Minor': 'Minor Arcana suit-element correspondence per Golden Dawn tradition: Wands=Fire, Cups=Water, Swords=Air, Pentacles=Earth.',
};

const TarotReader = () => {
  const [question, setQuestion] = useState('');
  const [numCards, setNumCards] = useState(3);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState([]);
  const [showLogic, setShowLogic] = useState(null);
  const [toneActive, setToneActive] = useState(false);
  const oscRef = useRef(null);
  const ctxRef = useRef(null);

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
      osc.frequency.value = 528;
      osc.type = 'sine';
      gain.gain.value = 0.06;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      setToneActive(true);
    } catch (e) { /* audio not supported */ }
  };

  const playShuffleSound = () => {
    try {
      const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 200 + Math.random() * 400;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.06);
      }
    } catch (e) { /* audio not supported */ }
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
  };

  const playFlipSound = () => {
    try {
      const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) { /* audio not supported */ }
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const getReading = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setFlipped([]);
    setShowLogic(null);
    playShuffleSound();
    try {
      const response = await axios.post(`${API}/tarot/reading`, null, {
        params: { question, num_cards: numCards }
      });
      setReading(response.data);
    } catch (error) {
      console.error('Tarot reading error:', error);
    }
    setLoading(false);
  };

  const toggleFlip = (index) => {
    if (!flipped.includes(index)) playFlipSound();
    setFlipped(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12 pb-24" data-testid="tarot-reader">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Sparkles className="w-10 h-10 text-[#D4AF37] mr-4" />
              The Oracle&apos;s <span className="text-[#D4AF37] ml-2">Deck</span>
            </h1>
            <button onClick={toggleSolfeggio} className="flex items-center space-x-1.5 text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-all px-3 py-1.5 border border-[#D4AF37]/20 rounded-lg" data-testid="tarot-solfeggio-toggle">
              {toneActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span>528Hz</span>
            </button>
          </div>
          <p className="text-[#94A3B8] text-base">78+44 Alpha Strategy Cards | Mersenne Twister Precision</p>
          <p className="text-[10px] text-white/20 mt-1 italic">Correspondences per the Hermetic Order of the Golden Dawn (1888)</p>
        </motion.div>

        {!reading ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Ask Your Question</h2>
            <div className="space-y-6">
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                placeholder="What strategic insight do you seek?" rows="4"
                className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none resize-none"
                data-testid="tarot-question-input" />
              <div>
                <label className="text-sm uppercase tracking-widest text-[#D4AF37] block mb-2">
                  Number of Cards: {numCards}
                </label>
                <input type="range" min="1" max="10" value={numCards}
                  onChange={(e) => setNumCards(parseInt(e.target.value))} className="w-full" data-testid="num-cards-slider" />
              </div>
              <button onClick={getReading} disabled={loading || !question.trim()}
                className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="draw-cards-button">
                {loading ? 'Shuffling the Deck...' : 'Draw Cards'}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-2xl p-6 mb-8">
              <p className="text-lg text-white/80">
                <strong className="text-[#D4AF37]">Your Question:</strong> {reading.question}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {reading.cards.map((card, index) => (
                <div key={index}>
                  <TarotCard card={card} index={index} flipped={flipped.includes(index)} onFlip={() => toggleFlip(index)} />
                  {flipped.includes(index) && (
                    <button
                      onClick={() => setShowLogic(showLogic === index ? null : index)}
                      className="w-full mt-2 flex items-center justify-center space-x-1.5 text-[10px] text-[#D4AF37]/60 hover:text-[#D4AF37] py-1.5 border border-[#D4AF37]/10 rounded-lg transition-all"
                      data-testid={`view-logic-${index}`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Calculation Logic</span>
                    </button>
                  )}
                  <AnimatePresence>
                    {showLogic === index && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="glass-card rounded-lg p-3 mt-2 border-[#D4AF37]/20 space-y-2" data-testid={`logic-overlay-${index}`}>
                          <div>
                            <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">Raw Data</p>
                            <p className="text-[10px] text-white/50">{card.name} — {card.arcana} Arcana — Position: {card.position || 'Upright'} — Draw Seed: Mersenne Twister (MT19937)</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">The Ancient Rule</p>
                            <p className="text-[10px] text-white/40 italic">{TAROT_SCRIPTURE[card.arcana] || TAROT_SCRIPTURE['Major']}</p>
                          </div>
                          <div className="flex items-center space-x-1 pt-1 border-t border-[#D4AF37]/10">
                            <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                            <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">Scripture-Bound Deterministic Math</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-white mb-4">Strategic Interpretation</h3>
              <p className="text-white/80 leading-relaxed">{reading.interpretation}</p>
              <p className="text-[10px] text-white/20 italic mt-3">Interpretation framework per Hermetic Order of the Golden Dawn tradition. Card draw: Mersenne Twister (MT19937) PRNG.</p>
            </div>

            <button onClick={() => { setReading(null); setQuestion(''); setFlipped([]); setShowLogic(null); if (oscRef.current) { oscRef.current.stop(); oscRef.current = null; setToneActive(false); } }}
              className="w-full bg-transparent border border-[#D4AF37] text-[#D4AF37] py-4 hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold"
              data-testid="new-reading-button">
              <RefreshCw className="w-5 h-5 inline mr-2" />
              New Reading
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TarotCard = ({ card, index, flipped, onFlip }) => (
  <motion.div
    initial={{ opacity: 0, rotateY: 90 }}
    animate={{ opacity: 1, rotateY: 0 }}
    transition={{ delay: index * 0.2, duration: 0.6 }}
    className="tarot-card cursor-pointer"
    onClick={onFlip}
    data-testid={`tarot-card-${index}`}
  >
    <div className="glass-card rounded-2xl p-6 h-80 flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all">
      {!flipped ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Sparkles className="w-16 h-16 text-[#D4AF37] mb-4 liquid-gold-animation" />
          <p className="text-sm uppercase tracking-widest text-white/60">Tap to Reveal</p>
        </div>
      ) : (
        <>
          <div>
            <h4 className="text-xl font-bold text-[#D4AF37] mb-2">{card.name}</h4>
            <p className="text-xs uppercase tracking-widest text-white/60 mb-4">
              {card.arcana} Arcana
            </p>
          </div>
          <div>
            <p className="text-sm text-white/80 leading-relaxed">{card.upright_meaning}</p>
          </div>
        </>
      )}
    </div>
  </motion.div>
);

export default TarotReader;
