import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Star, Sparkles, Eye, Clock } from 'lucide-react';

/*
 * AdManager — Zenith Oracle Revenue Engine
 * 
 * Ad Scheduling Logic:
 * - Triggers every 3–5 minutes (randomized)
 * - Ad patterns rotate randomly:
 *   (A) Burst: 3 consecutive 5-second ads
 *   (B) Double: 2 consecutive 20-second ads
 *   (C) Single Long: 1 ad of 15–30 seconds, skippable after 5–10s
 *   (D) Single Short: 1 ad of 10–15 seconds, skippable after 5s
 * - Minimum 2 skippable ad experiences per session
 * - Non-intrusive placement with cosmic branding
 */

const AD_PATTERNS = [
  { id: 'burst_short', label: 'Cosmic Burst', ads: [5, 5, 5], skippable: false },
  { id: 'double_medium', label: 'Celestial Pair', ads: [20, 20], skippable: false },
  { id: 'single_long', label: 'Astral Vision', ads: [30], skippable: true, skipAfter: 10 },
  { id: 'single_medium', label: 'Stellar Flash', ads: [15], skippable: true, skipAfter: 5 },
  { id: 'single_short', label: 'Cosmic Glimpse', ads: [10], skippable: true, skipAfter: 5 },
];

const AD_CREATIVES = [
  { headline: 'Unlock Your Cosmic Potential', body: 'Premium partners aligned with your stars', icon: 'star' },
  { headline: 'The Universe Speaks', body: 'Discover what the planets have planned for you', icon: 'sparkle' },
  { headline: 'Celestial Insights Await', body: 'Your destiny is written in the stars — explore now', icon: 'eye' },
  { headline: 'Stellar Alignment Detected', body: 'A rare cosmic window has opened for seekers like you', icon: 'volume' },
  { headline: 'Your Oracle Transmission', body: 'The cosmos channels a message through this moment', icon: 'clock' },
];

const getRandomInterval = () => {
  const min = 3 * 60 * 1000;
  const max = 5 * 60 * 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'star': return <Star className="w-8 h-8 text-[#D4AF37]" />;
    case 'sparkle': return <Sparkles className="w-8 h-8 text-[#D4AF37]" />;
    case 'eye': return <Eye className="w-8 h-8 text-[#D4AF37]" />;
    case 'volume': return <Volume2 className="w-8 h-8 text-[#D4AF37]" />;
    case 'clock': return <Clock className="w-8 h-8 text-[#D4AF37]" />;
    default: return <Sparkles className="w-8 h-8 text-[#D4AF37]" />;
  }
};

const AdManager = () => {
  const [activeAd, setActiveAd] = useState(null);
  const [adQueue, setAdQueue] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [creative, setCreative] = useState(null);
  const [sessionAdCount, setSessionAdCount] = useState(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const skipTimerRef = useRef(null);
  const skippableCountRef = useRef(0);

  const startAdSequence = useCallback(() => {
    let pattern;
    if (skippableCountRef.current < 2) {
      const skippablePatterns = AD_PATTERNS.filter(p => p.skippable);
      pattern = pickRandom(skippablePatterns);
      skippableCountRef.current += 1;
    } else {
      pattern = pickRandom(AD_PATTERNS);
      if (pattern.skippable) skippableCountRef.current += 1;
    }

    const queue = pattern.ads.map((duration, i) => ({
      duration,
      skippable: pattern.skippable,
      skipAfter: pattern.skipAfter || 5,
      creative: pickRandom(AD_CREATIVES),
      index: i,
      total: pattern.ads.length,
      patternLabel: pattern.label,
    }));

    setAdQueue(queue);
    setCurrentAdIndex(0);
    setActiveAd(queue[0]);
    setCreative(queue[0].creative);
    setTimeLeft(queue[0].duration);
    setCanSkip(false);
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = getRandomInterval();
      timerRef.current = setTimeout(() => {
        startAdSequence();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startAdSequence]);

  useEffect(() => {
    if (!activeAd) return;

    if (activeAd.skippable && activeAd.skipAfter > 0) {
      skipTimerRef.current = setTimeout(() => {
        setCanSkip(true);
      }, activeAd.skipAfter * 1000);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          advanceOrClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    };
  }, [activeAd]);

  const advanceOrClose = () => {
    const nextIndex = currentAdIndex + 1;
    if (nextIndex < adQueue.length) {
      const nextAd = adQueue[nextIndex];
      setCurrentAdIndex(nextIndex);
      setActiveAd(nextAd);
      setCreative(nextAd.creative);
      setTimeLeft(nextAd.duration);
      setCanSkip(false);
    } else {
      closeAd();
    }
  };

  const closeAd = () => {
    setActiveAd(null);
    setAdQueue([]);
    setCurrentAdIndex(0);
    setCanSkip(false);
    setSessionAdCount(prev => prev + 1);
  };

  const handleSkip = () => {
    if (canSkip) {
      advanceOrClose();
    }
  };

  if (!activeAd || !creative) return null;

  const progressPercent = ((activeAd.duration - timeLeft) / activeAd.duration) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/92 backdrop-blur-md z-[500] flex items-center justify-center"
        data-testid="ad-manager-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4"
        >
          {/* Ad Counter (for burst patterns) */}
          {activeAd.total > 1 && (
            <div className="text-center mb-3" data-testid="ad-sequence-counter">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                {activeAd.patternLabel} — {activeAd.index + 1} of {activeAd.total}
              </span>
            </div>
          )}

          {/* Ad Card */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#0a0f2e] to-[#020617] overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.12)]">
            {/* Shimmering top border */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

            {/* Ad Content */}
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-5">
                {getIconComponent(creative.icon)}
              </div>

              <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/50 mb-3">Sponsored Cosmic Transmission</p>

              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {creative.headline}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                {creative.body}
              </p>

              {/* Simulated ad visual */}
              <div className="rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/15 p-6 mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 animate-pulse" />
                  <div className="flex-1 space-y-2 text-left">
                    <div className="h-2.5 bg-[#D4AF37]/15 rounded w-3/4 animate-pulse" />
                    <div className="h-2 bg-white/5 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
                <div className="h-24 rounded-lg bg-gradient-to-br from-[#D4AF37]/8 to-[#0a0f2e] flex items-center justify-center">
                  <span className="text-xs text-white/20">Ad Placement</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3" data-testid="ad-progress-bar">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-[#D4AF37] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3, ease: 'linear' }}
                />
              </div>

              {/* Timer + Controls */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25 tabular-nums" data-testid="ad-timer">
                  {timeLeft}s remaining
                </span>

                {activeAd.skippable ? (
                  canSkip ? (
                    <button
                      onClick={handleSkip}
                      className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-all"
                      data-testid="ad-skip-btn"
                    >
                      Skip <X className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-white/20" data-testid="ad-skip-countdown">
                      Skip in {Math.max(0, activeAd.skipAfter - (activeAd.duration - timeLeft))}s
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-white/15 italic">Non-skippable</span>
                )}
              </div>
            </div>

            {/* Bottom border */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
            <div className="px-6 py-2 text-center">
              <span className="text-[8px] text-white/10 uppercase tracking-widest">Supporting free cosmic wisdom for all seekers</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdManager;
