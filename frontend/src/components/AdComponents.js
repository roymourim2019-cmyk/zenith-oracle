import { useEffect, useRef } from 'react';

const ADMOB_BANNER_TEST = 'ca-app-pub-3940256099942544/6300978111';
const ADMOB_INTERSTITIAL_TEST = 'ca-app-pub-3940256099942544/1033173712';
const ADMOB_REWARDED_TEST = 'ca-app-pub-3940256099942544/5224354917';

export const AdBanner = ({ slot = 'bottom', className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.dataset.loaded) {
      adRef.current.dataset.loaded = 'true';
    }
  }, []);

  return (
    <div
      ref={adRef}
      className={`relative overflow-hidden rounded-xl border border-[#D4AF37]/10 bg-[#0a0f2e]/60 ${className}`}
      data-testid={`ad-banner-${slot}`}
      data-ad-unit={ADMOB_BANNER_TEST}
    >
      <div className="flex items-center justify-center py-3 px-4">
        <div className="flex items-center gap-3 w-full">
          <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[#D4AF37] text-lg">&#x2728;</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#D4AF37] font-semibold">Sponsored by the Cosmos</p>
            <p className="text-[10px] text-white/30 truncate">Discover your full potential — Zenith Oracle Premium Partners</p>
          </div>
          <span className="text-[8px] text-white/15 uppercase tracking-wider flex-shrink-0">Ad</span>
        </div>
      </div>
    </div>
  );
};

export const AdInterstitial = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center" data-testid="ad-interstitial" data-ad-unit={ADMOB_INTERSTITIAL_TEST}>
      <div className="glass-card rounded-2xl p-8 max-w-sm mx-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">&#x2728;</span>
        </div>
        <p className="text-sm text-[#D4AF37] font-semibold mb-2">The Oracle Prepares Your Next Reading</p>
        <p className="text-[10px] text-white/30 mb-4">Sponsored content — supporting free cosmic wisdom for all</p>
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-3 overflow-hidden">
          <div className="bg-[#D4AF37] h-full rounded-full animate-[adProgress_4s_linear]" style={{ animation: 'adProgress 4s linear forwards' }} />
        </div>
        <button onClick={onClose} className="text-[10px] text-white/30 hover:text-white/50 transition-colors" data-testid="ad-skip-btn">
          Skip in a moment...
        </button>
      </div>
    </div>
  );
};

export const AdRewarded = ({ show, onReward, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center" data-testid="ad-rewarded" data-ad-unit={ADMOB_REWARDED_TEST}>
      <div className="glass-card rounded-2xl p-8 max-w-sm mx-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">&#x1F3AC;</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Cosmic Reset</h3>
        <p className="text-sm text-white/60 mb-4">Watch a brief cosmic transmission to reset your attempt</p>
        <button
          onClick={() => {
            setTimeout(() => {
              if (onReward) onReward();
              if (onClose) onClose();
            }, 2000);
          }}
          className="w-full bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl hover:bg-[#F3E5AB] transition-all uppercase tracking-widest text-sm mb-3"
          data-testid="ad-watch-btn"
        >
          Watch & Reset
        </button>
        <button onClick={onClose} className="text-xs text-white/30 hover:text-white/50 transition-colors" data-testid="ad-decline-btn">
          No thanks
        </button>
      </div>
    </div>
  );
};
