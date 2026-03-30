import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Volume2, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VocalOracle = () => {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [briefing, setBriefing] = useState(null);
  const [form, setForm] = useState({ name: '', birth_date: '', birth_time: '' });
  const utteranceRef = useRef(null);

  const fetchBriefing = async () => {
    if (!form.name || !form.birth_date || !form.birth_time) return;
    setPhase('channeling');

    try {
      const res = await axios.post(`${API}/vocal-oracle`, {
        ...form,
        latitude: 28.6139,
        longitude: 77.209,
        timezone_offset: 5.5,
      });
      setBriefing(res.data);
      setPhase('speaking');
      speakBriefing(res.data.briefing);
    } catch (err) {
      console.error('Vocal Oracle error:', err);
      setPhase('idle');
    }
  };

  const speakBriefing = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.9;
      utt.pitch = 0.8;
      utt.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const deepVoice = voices.find(v =>
        v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male')
      );
      if (deepVoice) utt.voice = deepVoice;
      utt.onend = () => setPhase('done');
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    } else {
      setPhase('done');
    }
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setPhase('done');
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    setPhase('idle');
    setBriefing(null);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-[250] w-14 h-14 rounded-full bg-[#D4AF37] text-[#020617] flex items-center justify-center vocal-oracle-btn cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="vocal-oracle-button"
      >
        <Mic className="w-6 h-6" />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-[#020617]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { reset(); setOpen(false); }}}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md border-[#D4AF37]/40"
              data-testid="vocal-oracle-modal"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Vocal Oracle</h3>
                </div>
                <button onClick={() => { reset(); setOpen(false); }} className="text-white/40 hover:text-white" data-testid="vocal-oracle-close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {phase === 'idle' && (
                <div className="space-y-3">
                  <p className="text-xs text-white/50 mb-3">Enter your coordinates. The Oracle speaks.</p>
                  <input type="text" placeholder="Your Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                    data-testid="vocal-oracle-name" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})}
                      className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                      data-testid="vocal-oracle-date" />
                    <input type="time" step="1" value={form.birth_time} onChange={e => setForm({...form, birth_time: e.target.value})}
                      className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                      data-testid="vocal-oracle-time" />
                  </div>
                  <button onClick={fetchBriefing} disabled={!form.name || !form.birth_date || !form.birth_time}
                    className="w-full bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-lg hover:bg-[#F3E5AB] transition-all uppercase tracking-widest text-sm disabled:opacity-50 mt-2"
                    data-testid="vocal-oracle-invoke">
                    Invoke the Oracle
                  </button>
                </div>
              )}

              {phase === 'channeling' && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto mb-4 animate-spin" />
                  <p className="text-white/60 text-sm">Channeling the Celestial Intelligence...</p>
                </div>
              )}

              {(phase === 'speaking' || phase === 'done') && briefing && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-white/40">Dasha:</span>
                      <span className="text-xs text-[#D4AF37] font-semibold">{briefing.dasha_lord}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-white/40">Power:</span>
                      <span className="text-xs text-[#D4AF37] font-semibold">{briefing.power_score}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-white/40">{briefing.pakshi_bird}:</span>
                      <span className="text-xs text-white font-semibold">{briefing.pakshi_state}</span>
                    </div>
                  </div>

                  <div className="bg-[#020617]/60 border border-[#D4AF37]/20 rounded-xl p-4">
                    <p className="text-sm text-white/80 leading-relaxed italic" data-testid="vocal-oracle-briefing">
                      {briefing.briefing}
                    </p>
                  </div>

                  {phase === 'speaking' && (
                    <button onClick={stopSpeaking} className="w-full flex items-center justify-center space-x-2 bg-[#D4AF37]/20 text-[#D4AF37] py-2.5 rounded-lg border border-[#D4AF37]/30 text-sm font-semibold">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span>Speaking... Tap to Stop</span>
                    </button>
                  )}

                  {phase === 'done' && (
                    <div className="flex space-x-3">
                      <button onClick={() => speakBriefing(briefing.briefing)} className="flex-1 bg-[#D4AF37]/20 text-[#D4AF37] py-2.5 rounded-lg border border-[#D4AF37]/30 text-sm font-semibold">
                        Replay
                      </button>
                      <button onClick={reset} className="flex-1 bg-[#D4AF37] text-[#020617] py-2.5 rounded-lg text-sm font-bold">
                        New Briefing
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VocalOracle;
