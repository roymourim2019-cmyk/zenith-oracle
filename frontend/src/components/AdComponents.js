import { useEffect, useRef, useState } from 'react';

/*
 * Google AdSense Integration for PWABuilder/TWA
 * 
 * HOW TO ACTIVATE REAL ADS:
 * 1. Sign up at https://adsense.google.com
 * 2. Get approved (takes 1-3 days)
 * 3. Create ad units in your AdSense dashboard:
 *    - 1 Display Ad (for banners)
 *    - 1 In-article Ad (for between-content ads)
 * 4. Replace ADSENSE_CLIENT and ADSENSE_SLOT values below
 * 5. The AdSense script is already loaded in index.html
 * 
 * Revenue (US/UK/AU):
 * - Display Banner: $2-5 CPM
 * - In-feed/In-article: $3-8 CPM
 * - Auto Ads (full page): $8-15 CPM
 */

// Replace these with your real AdSense values after approval
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; // Your AdSense Publisher ID
const ADSENSE_SLOT_BANNER = '1234567890';          // Your Banner Ad Unit ID
const ADSENSE_SLOT_INFEED = '0987654321';           // Your In-feed Ad Unit ID
const ADSENSE_READY = ADSENSE_CLIENT !== 'ca-pub-XXXXXXXXXXXXXXXX';

export const AdBanner = ({ slot = 'bottom', className = '' }) => {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (ADSENSE_READY && adRef.current && !adRef.current.dataset.loaded) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current.dataset.loaded = 'true';
        setAdLoaded(true);
      } catch (e) {}
    }
  }, []);

  // When AdSense is configured, render real ad
  if (ADSENSE_READY) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`} data-testid={`ad-banner-${slot}`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '60px' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={ADSENSE_SLOT_BANNER}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        {!adLoaded && <PlaceholderBanner />}
      </div>
    );
  }

  // Placeholder until AdSense is configured
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#D4AF37]/10 bg-[#0a0f2e]/60 ${className}`}
      data-testid={`ad-banner-${slot}`}
    >
      <PlaceholderBanner />
    </div>
  );
};

const PlaceholderBanner = () => (
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
);

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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center" data-testid="ad-interstitial">
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center" data-testid="ad-rewarded">
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
