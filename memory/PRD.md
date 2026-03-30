# Zenith Oracle - Product Requirements Document

## Original Problem Statement
A 100% Scientific Accuracy Astrology platform with a High-Ticket Aesthetic (Obsidian #020617 & Metallic Gold #D4AF37) and a Gamified Revenue Engine.
Modules: Vedic (Lahiri Ayanamsha), Western (Topocentric), Chinese Lunisolar, Numerology, and Tarot.
Features: Freemium model with AdMob + Premium subscriptions (Razorpay), "Power Meter" dashboard, "Accuracy Lab", Elite Personalization, "War Room" for 5 enterprise strategy games.

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Glassmorphism UI
- **Backend**: Python FastAPI + PySwisseph (Swiss Ephemeris) for astronomical calculations
- **Database**: MongoDB (via Motor async driver)
- **Cache**: Redis (currently mocked/bypassed - server not installed)
- **Styling**: Obsidian (#020617) background, Metallic Gold (#D4AF37) accents, Playfair Display headings, Outfit body font

## What's Been Implemented

### Core Astrology Engine (Backend)
- Vedic birth chart calculation (D1-D60 divisional charts, Vimshottari Dasha)
- Western chart calculation (Tropical/Topocentric)
- Chinese Lunisolar astrology
- Numerology (Chaldean, Pythagorean, Vedic)
- Tarot reading (78+44 card deck, Mersenne Twister)
- **Pancha-Pakshi Oracle** (5-Bird cycle based on Natal Moon Nakshatra + Day of Week)
- **Nakshatra Padas** (4 quarters for precision timing)
- **Oracle Feed** (Transit Alerts, Psychic Updates, Historical Parallels)
- Real-time planetary transit calculations

### Frontend Pages & Components
- Home page with Starfield, Pricing (Monthly/Yearly/Enterprise), Currency toggle
- Sovereign 8 Dashboard with Oracle Feed sidebar
- Vedic/Western Chart viewers
- Chinese Astrology, Numerology Calculator
- Tarot Reader (basic version)
- Power Meter gauge
- Accuracy Lab (Engine status, Delta-T, Ayanamsha)
- Market Siege game (Numerology battle)
- Oracle's Trial game (Tarot intuition quiz)
- Vortex Velocity game (Planetary degree lock)
- Aura Alignment game (Solfeggio frequency matching)
- Biometric Vault, Negotiation Simulator, Global Success Map, Precision Alerts
- **OracleFeed.js** - COSMIC INTELLIGENCE live ticker + Pancha-Pakshi card + 3 tab feed

### API Endpoints
- POST /api/vedic/birth-chart
- POST /api/vedic/dasha-periods
- POST /api/vedic/divisional-chart/{d_number}
- POST /api/vedic/pancha-pakshi (NEW)
- GET /api/vedic/nakshatra-padas (NEW)
- POST /api/western/birth-chart
- POST /api/chinese/calculate
- POST /api/numerology/calculate
- POST /api/tarot/reading
- GET /api/oracle-feed (NEW)
- GET /api/accuracy/engine-status
- GET /api/power-meter/{name}
- POST /api/payment/create-order
- POST /api/payment/verify

## Prioritized Backlog

### P0 - In Progress
- [ ] Advanced Tarot Reader (aura-linked, sound effects, manual card selection)

### P1
- [ ] AdMob Rewarded Videos in War Room (Cosmic Reset on loss, Premium bypass)
- [ ] Redis installation and proper caching
- [ ] Alpha Daily Briefing (60-second morning audio for Premium) — backend service exists

### P2
- [ ] Gemini Live voice assistant full conversation mode (multi-turn)

## Changelog

### 2026-03-30 - War Room & Oracle Feed Upgrade
- Implemented Pancha-Pakshi Oracle (5-Bird cycle from Swiss Ephemeris)
- Added Nakshatra Padas (4-quarter precision)
- Created Oracle Feed ("COSMIC INTELLIGENCE") with transit alerts, psychic updates, historical parallels
- Shifted tone to Strategic/Ancient voice
- Created THE WAR ROOM: ENTERPRISE STRATEGY section with 5 game carousel
- Created SovereignDuel.js (chart-vs-chart planet-by-planet dominance clash)
- Wired VortexVelocity, AuraAlignment, SovereignDuel into App.js routes
- Restored Tarot Deck to Sovereign 8 grid Tile #6
- Added z-index 100 on War Room section, pulse animation on header
- Added bottom navigation bar (Home/Command/Games/Tarot) on inner pages

### 2026-03-30 - Ancient Strategy & Sensory UI Upgrade
- Replaced "100% Scientific Accuracy" with "High-Resonance Alignment" / "Mathematical Precision"
- Added Oracle Feed live ticker on Home Screen ("COSMIC INTELLIGENCE — LIVE TRANSIT FEED")
- Liquid Glass: backdrop-filter blur(25px) saturate(1.4) + 1px liquid gold border on all glass-card elements
- Gyroscope Parallax: DeviceOrientation API (mobile) + mouse parallax (desktop) on Starfield
- 528Hz Solfeggio success tone (Web Audio API) + haptic vibration pattern on Aura Alignment achievement
- Created Vocal Oracle: floating Gemini-powered button (gemini-3-flash-preview) for strategic briefings with Web Speech API text-to-speech
- Updated bottom nav to [Oracle | Matrix | War Room | Profile]
