import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Play, X, CheckCircle, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChartPDFUnlock = ({ profile }) => {
  const [stage, setStage] = useState('locked');
  const [adProgress, setAdProgress] = useState(0);

  const watchAd = () => {
    setStage('watching');
    setAdProgress(0);
    const duration = 20;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      setAdProgress(Math.min((elapsed / duration) * 100, 100));
      if (elapsed >= duration) {
        clearInterval(interval);
        setStage('unlocked');
      }
    }, 1000);
  };

  const downloadPDF = async () => {
    if (!profile) return;
    setStage('generating');
    try {
      const res = await fetch(`${API}/chart-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          birth_date: profile.birth_date,
          birth_time: profile.birth_time || '12:00:00',
          latitude: profile.latitude || 28.6139,
          longitude: profile.longitude || 77.209,
          timezone_offset: profile.timezone_offset || 5.5,
        }),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenith_oracle_${profile.name.replace(/\s+/g, '_')}_${profile.birth_date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setStage('downloaded');
    } catch (e) {
      setStage('unlocked');
    }
  };

  if (!profile) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all" data-testid="chart-pdf-unlock">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center flex-shrink-0">
          <FileDown className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your Cosmic Blueprint PDF
          </h4>
          <p className="text-xs text-white/40 leading-relaxed mb-3">
            Full birth chart report — Vedic, Western, Chinese & Numerology in one beautiful document.
          </p>

          <AnimatePresence mode="wait">
            {stage === 'locked' && (
              <motion.button
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={watchAd}
                className="flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold py-2.5 px-5 rounded-xl text-xs uppercase tracking-widest hover:bg-[#D4AF37]/20 transition-all"
                data-testid="pdf-watch-ad-btn"
              >
                <Play className="w-4 h-4" />
                Watch & Unlock PDF
              </motion.button>
            )}

            {stage === 'watching' && (
              <motion.div key="watching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-[#0a0f2e]/80 border border-[#D4AF37]/15 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/50">Cosmic Transmission</span>
                    <span className="text-[10px] text-white/20 tabular-nums" data-testid="pdf-ad-timer">
                      {Math.max(0, Math.ceil(20 - (adProgress / 100) * 20))}s
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-[#D4AF37] rounded-full"
                      style={{ width: `${adProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="h-16 rounded-lg bg-gradient-to-br from-[#D4AF37]/5 to-[#0a0f2e] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]/30 animate-pulse" />
                    <span className="text-xs text-white/15 ml-2">Rewarded Ad</span>
                  </div>
                </div>
              </motion.div>
            )}

            {stage === 'unlocked' && (
              <motion.button
                key="unlocked"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-[#D4AF37] text-[#020617] font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-widest hover:bg-[#F3E5AB] transition-all"
                data-testid="pdf-download-btn"
              >
                <FileDown className="w-4 h-4" />
                Download Your Blueprint
              </motion.button>
            )}

            {stage === 'generating' && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[#D4AF37] text-xs">
                <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                Generating your cosmic blueprint...
              </motion.div>
            )}

            {stage === 'downloaded' && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                <CheckCircle className="w-4 h-4" />
                PDF downloaded successfully
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChartPDFUnlock;
