# Zenith Oracle — Play Store / Microsoft Store Listing Guide

## App Name (30 chars max)
`Zenith Oracle - Cosmic Intelligence`

## Short Description (80 chars - CRITICAL for ASO)
`Free astrology app. Vedic birth chart, Tarot, Numerology & daily horoscope.`

## Full Description (4000 chars - keyword-rich for US/UK/AU/EU)

```
Zenith Oracle is the world's most scientifically accurate free astrology app, powered by Swiss Ephemeris — the same astronomical engine used by NASA and professional astronomers.

WHAT MAKES US DIFFERENT:
Unlike other horoscope apps that use generic predictions, Zenith Oracle calculates your exact planetary positions using real astronomical data from NASA's JPL DE431 ephemeris. Every prediction is backed by mathematics, not guesswork.

FIVE COMPLETE ASTROLOGY SYSTEMS — ALL FREE:

★ VEDIC ASTROLOGY (Jyotish)
Complete sidereal birth chart with D1-D60 divisional charts, Vimshottari Dasha periods, Pancha-Pakshi Oracle, and Nakshatra analysis. Lahiri Ayanamsha with arc-second precision.

★ WESTERN ASTROLOGY
Tropical zodiac birth chart with Placidus house system, planetary aspects, rising sign, and detailed house placements.

★ CHINESE ASTROLOGY
Lunisolar zodiac with Five Elements (Wu Xing), Yin-Yang analysis, and compatibility with all 12 animal signs.

★ TAROT ORACLE
122 cards (78 Rider-Waite + 44 bonus), 5 reading types (General, Career, Love, Energy, Aura), personalized by your birth chart.

★ NUMEROLOGY VAULT
Triple-system analysis: Chaldean, Pythagorean, and Vedic numerology calculated from your name and birth date.

DAILY FEATURES:
• Daily Oracle — Personalized horoscope based on real-time planetary transits
• Alpha Briefing — 60-second AI-powered morning strategy audio
• Card of the Day — Daily tarot card with guidance
• Push Notifications — Cosmic digest delivered every morning

UNIQUE FEATURES:
• Compatibility Checker — Cross-system partner match using Moon sign, Dasha, Numerology & Chinese zodiac
• Birth Chart PDF — Download your complete multi-system birth chart as a beautiful PDF report
• Power Meter — Real-time cosmic energy gauge from current planetary transits
• Scriptural Synthesis — All five astrological traditions converged into one verdict
• Accuracy Lab — Live engine status showing Delta-T, Ayanamsha, and calculation precision

5 STRATEGY GAMES:
• Market Siege — Numerology-powered trading battle
• Oracle's Trial — Tarot intuition challenge
• Vortex Velocity — Planetary degree precision game
• Aura Alignment — Solfeggio frequency matching
• Sovereign Duel — Chart vs. Chart cosmic clash

100% FREE. NO PREMIUM TIER. NO PAYWALLS.
Every feature is completely free. We believe cosmic wisdom should be accessible to all.

SCIENTIFIC ACCURACY:
• Swiss Ephemeris (NASA JPL DE431 basis)
• Lahiri Ayanamsha (Chitrapaksha)
• Arc-second precision calculations
• Real-time planetary transit data
• Verified against professional astronomical software

PRIVACY:
Your birth data stays on your device. We don't sell personal information.

From Roy's Enterprise — building tools that empower seekers worldwide.
```

## ASO Keywords (Target: US, UK, Australia, Europe)

### Primary Keywords (High Volume, High Intent)
- astrology app
- horoscope app
- free horoscope
- birth chart calculator
- daily horoscope
- tarot reading app
- numerology app
- zodiac signs
- compatibility checker

### Secondary Keywords (Medium Volume, Lower Competition)
- vedic astrology
- natal chart
- chinese zodiac
- planetary transits
- kundli calculator
- moon sign calculator
- rising sign
- swiss ephemeris
- astrology forecast
- cosmic energy

### Long-tail Keywords (Low Competition, High Conversion)
- free vedic birth chart app
- accurate horoscope app
- scientific astrology calculator
- tarot and astrology app
- numerology and astrology
- daily cosmic forecast
- birth chart pdf download
- zodiac compatibility test free

## Category
Primary: **Lifestyle**
Secondary: **Entertainment**

## Content Rating
**Everyone** (no mature content)

## Target Countries (Priority Order)
1. United States (highest ad CPM: $15-40)
2. United Kingdom ($12-30)
3. Australia ($10-25)
4. Canada ($10-25)
5. Germany ($8-20)
6. France ($7-18)
7. Netherlands ($8-20)
8. Sweden ($8-22)
9. Norway ($10-25)
10. Ireland ($10-22)

## AdSense Setup Instructions

1. Go to https://adsense.google.com
2. Sign up with your Google account
3. Add your website URL (your deployed domain)
4. Wait for approval (1-3 business days)
5. Once approved, create these ad units:
   - Display Ad (responsive) → for banner placements
   - In-article Ad → for between-content placements
6. Copy your Publisher ID (ca-pub-XXXX) and Ad Slot IDs
7. In `/app/frontend/src/components/AdComponents.js`:
   - Replace `ca-pub-XXXXXXXXXXXXXXXX` with your Publisher ID
   - Replace `1234567890` with your Banner Ad Slot ID
   - Replace `0987654321` with your In-feed Ad Slot ID
8. In `/app/frontend/public/index.html`:
   - Uncomment the AdSense script tag
   - Replace `YOUR_ADSENSE_ID` with your Publisher ID
9. Redeploy

## Revenue Projection (Western Markets)

| Metric | Value |
|--------|-------|
| Downloads | 1,000 |
| DAU (30%) | 300 |
| Sessions/day/user | 1.5 |
| Rewarded views/session | 1.5 |
| Interstitials/session | 2 |
| Banner impressions/session | 6 |
| **Monthly Revenue** | **≈ $891 (₹74,000)** |

## Microsoft Store
PWABuilder also supports packaging for Microsoft Store.
Use the same manifest.json — PWABuilder handles the conversion.
