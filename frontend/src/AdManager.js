import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Sparkles, Eye, Clock, Gift } from 'lucide-react';

/*
 * AdManager — Zenith Oracle Revenue Engine v2
 * 
 * REVENUE TARGET: ₹50,000/month from 1,000 downloads (Western markets)
 * 
 * Math: 1,000 downloads × 30% DAU = 300 daily active users
 * Per user/month: ~$2 needed ($600 total ≈ ₹50,000)
 * 
 * Strategy: RETENTION-FIRST (users must love the app to keep coming back)
 * 
 * Ad Schedule:
 * - First ad: after 5 minutes (let user engage first)
 * - Subsequent ads: every 6-8 minutes (randomized)
 * - All interstitials skippable after 5 seconds
 * - Max 4 interstitials per session (hard cap)
 * - Session = 1 app open
 * 
 * Revenue Sources (in order of CPM):
 * 1. Rewarded Video ($20-40 CPM): User-initiated, highest value, zero churn
 *    - Already integrated: Daily Oracle extended, Alpha Briefing, Cosmic Reset ×5
 * 2. Interstitial ($8-15 CPM): Between page transitions, always skippable
 *    - This AdManager handles these
 * 3. Banner ($2-5 CPM): Static, non-intrusive, on all pages
 *    - Already integrated: AdBanner component on all result pages
 * 
 * Projection at US/UK/AU CPMs:
 * - Rewarded: 1.5/day × 30 = 45 views × $30 CPM = $1.35
 * - Interstitial: 3/day × 30 = 90 views × $10 CPM = $0.90
 * - Banner: 8/day × 30 = 240 views × $3 CPM = $0.72
 * - Total: ~$2.97/user/month × 300 DAU = $891 ≈ ₹74,000
 */

const AD_CREATIVES = [
  { headline: 'Cosmic Alignment Detected', body: 'A rare planetary window opens — explore deeper insights', icon: 'star' },
  { headline: 'The Stars Have Spoken', body: 'Your cosmic DNA holds secrets waiting to be unlocked', icon: 'sparkle' },
  { headline: 'Celestial Update', body: 'Premium partners aligned with your zodiac energy', icon: 'eye' },
  { headline: 'Oracle Transmission', body: 'The universe channels wisdom through this moment', icon: 'clock' },
  { headline: 'Stellar Opportunity', body: 'Discover what the planetary transits have prepared for you', icon: 'gift' },
];

const FIRST_AD_DELAY = 5 * 60 * 1000;
const MIN_INTERVAL = 6 * 60 * 1000;
const MAX_INTERVAL = 8 * 60 * 1000;
const AD_DURATION = 15;
const SKIP_AFTER = 5;
const MAX_ADS_PER_SESSION = 4;

const getRandomInterval = () =>
  Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) + MIN_INTERVAL;

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getIcon = (name) => {
  const cls = "w-8 h-8 text-[#D4AF37]";
  switch (name) {
    case 'star': return <Star className={cls} />;
    case 'sparkle': return <Sparkles className={cls} />;
    case 'eye': return <Eye className={cls} />;
    case 'clock': return <Clock className={cls} />;
    case 'gift': return <Gift className={cls} />;
    default: return <Sparkles className={cls} />;
  }
};

const AdManager = () => {
  const [showAd, setShowAd] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [creative, setCreative] = useState(null);
  const sessionAdCount = useRef(0);
  const scheduleTimer = useRef(null);
  const countdownTimer = useRef(null);
  const skipTimer = useRef(null);
  const isFirstAd = useRef(true);

  const triggerAd = useCallback(() => {
    if (sessionAdCount.current >= MAX_ADS_PER_SESSION) return;
    if (document.hidden) {
      scheduleNext();
      return;
    }
    setCreative(pickRandom(AD_CREATIVES));
    setTimeLeft(AD_DURATION);
    setCanSkip(false);
    setShowAd(true);
    sessionAdCount.current += 1;
  }, []);

  const scheduleNext = useCallback(() => {
    if (sessionAdCount.current >= MAX_ADS_PER_SESSION) return;
    const delay = isFirstAd.current ? FIRST_AD_DELAY : getRandomInterval();
    isFirstAd.current = false;
    scheduleTimer.current = setTimeout(triggerAd, delay);
  }, [triggerAd]);

  const closeAd = useCallback(() => {
    setShowAd(false);
    setCanSkip(false);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (skipTimer.current) clearTimeout(skipTimer.current);
    scheduleNext();
  }, [scheduleNext]);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (scheduleTimer.current) clearTimeout(scheduleTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      if (skipTimer.current) clearTimeout(skipTimer.current);
    };
  }, [scheduleNext]);

  useEffect(() => {
    if (!showAd) return;

    skipTimer.current = setTimeout(() => setCanSkip(true), SKIP_AFTER * 1000);

    countdownTimer.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          closeAd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      if (skipTimer.current) clearTimeout(skipTimer.current);
    };
  }, [showAd, closeAd]);

  if (!showAd || !creative) return null;

  const progress = ((AD_DURATION - timeLeft) / AD_DURATION) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[500] flex items-center justify-center"
        data-testid="ad-manager-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-md mx-4"
        >
          {/* Skip button - top right, always visible once available */}
          {canSkip && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={closeAd}
              className="absolute -top-12 right-0 flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
              data-testid="ad-skip-btn"
            >
              Skip <X className="w-4 h-4" />
            </motion.button>
          )}

          <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#0a0f2e] to-[#020617] overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.08)]">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center mx-auto mb-5">
                {getIcon(creative.icon)}
              </div>

              <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/40 mb-3">Sponsored</p>

              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {creative.headline}
              </h3>
              <p className="text-sm text-white/45 leading-relaxed mb-6">
                {creative.body}
              </p>

              {/* Ad placement visual */}
              <div className="rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/15 animate-pulse" />
                  <div className="flex-1 space-y-2 text-left">
                    <div className="h-2.5 bg-[#D4AF37]/10 rounded w-3/4 animate-pulse" />
                    <div className="h-2 bg-white/5 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
                <div className="h-20 rounded-lg bg-gradient-to-br from-[#D4AF37]/5 to-[#0a0f2e] flex items-center justify-center">
                  <span className="text-xs text-white/15">Ad Content</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-1 bg-white/8 rounded-full overflow-hidden mb-3" data-testid="ad-progress-bar">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-[#D4AF37]/60 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/20 tabular-nums" data-testid="ad-timer">
                  {timeLeft}s
                </span>
                {!canSkip && (
                  <span className="text-[10px] text-white/20" data-testid="ad-skip-countdown">
                    Skip in {Math.max(0, SKIP_AFTER - (AD_DURATION - timeLeft))}s
                  </span>
                )}
              </div>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
            <div className="px-6 py-2 text-center">
              <span className="text-[8px] text-white/8 uppercase tracking-widest">
                Supporting free cosmic wisdom for all
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdManager;
