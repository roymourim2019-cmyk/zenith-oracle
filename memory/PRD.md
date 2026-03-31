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
- Tarot reading (78+44 card deck, Mersenne Twister, 5 personalized reading types)
- **Pancha-Pakshi Oracle** (5-Bird cycle based on Natal Moon Nakshatra + Day of Week)
- **Nakshatra Padas** (4 quarters for precision timing)
- **Oracle Feed** (Transit Alerts, Psychic Updates, Historical Parallels)
- Real-time planetary transit calculations

### Frontend Pages & Components (ALL INTERACTIVE)
- Home page with Starfield, Pricing (Monthly/Yearly/Enterprise), Currency toggle
- Sovereign 8 Dashboard with Oracle Feed sidebar
- **Vedic Chart** - Full interactive: planetary positions table, Vimshottari Dasha periods panel, Pancha-Pakshi Oracle panel with 3 tabs + View Calculation Logic
- **Western Chart** - Full interactive: planets table, aspects panel (client-computed), 12-house cusps panel with 3 tabs + View Calculation Logic
- **Chinese Astrology** - Full interactive: animal sign card with emoji, element/yin-yang, personality traits, compatible signs, lucky numbers/colors
- **Numerology Calculator** - Full interactive: triple system analysis (Chaldean/Pythagorean/Vedic), archetype cards with ruling planet/mantra/vibration, lucky numbers/colors
- **Tarot Reader** - Full interactive 3-phase experience: setup (question + reading type + spread size + optional birth data) -> card selection (21 face-down cards, pick 3-5) -> animated reveal with per-card logic overlay. 5 reading types: General/Career/Aura/Energy/Love with personalized deck weighting
- Power Meter gauge
- Accuracy Lab (Engine status, Delta-T, Ayanamsha)
- Market Siege game (Numerology battle)
- Oracle's Trial game (Tarot intuition quiz)
- Vortex Velocity game (Planetary degree lock)
- Aura Alignment game (Solfeggio frequency matching)
- Sovereign Duel game (Chart vs Chart)
- **OracleFeed.js** - COSMIC INTELLIGENCE live ticker
- **SovereignSynthesis** - Cross-system synthesis with Akashic Echoes
- **VocalOracle** - Gemini-powered strategic briefings

### API Endpoints
- POST /api/vedic/birth-chart
- POST /api/vedic/dasha-periods
- POST /api/vedic/divisional-chart/{d_number}
- POST /api/vedic/pancha-pakshi
- GET /api/vedic/nakshatra-padas
- POST /api/western/birth-chart
- POST /api/chinese/calculate
- POST /api/numerology/calculate
- POST /api/tarot/reading (JSON body: question, num_cards 3-5, reading_type, optional birth data)
- GET /api/oracle-feed
- GET /api/accuracy/engine-status
- GET /api/power-meter/{name}
- POST /api/payment/create-order
- POST /api/payment/verify
- POST /api/vocal-oracle
- POST /api/synthesis/sovereign-verdict
- POST /api/synthesis/akashic-echoes
- POST /api/synthesis/data-integrity
- POST /api/synthesis/sovereign-identity

## Prioritized Backlog

### P0 - Completed
- [x] Interactive Tarot Reader (5 reading types, 3-5 card manual selection, birth data personalization)
- [x] Diversify all sections (Vedic, Western, Chinese, Numerology) with full interactive UIs

### P1
- [ ] AdMob Rewarded Videos in War Room (Cosmic Reset on loss, Premium bypass)
- [ ] Redis installation and proper caching
- [ ] Alpha Daily Briefing (60-second morning audio for Premium)

### P2
- [ ] Refactor server.py into /routes/ directory
- [ ] Gemini Live voice assistant full conversation mode (multi-turn)

## Changelog

### 2026-03-30 - War Room & Oracle Feed Upgrade
- Implemented Pancha-Pakshi Oracle (5-Bird cycle from Swiss Ephemeris)
- Added Nakshatra Padas (4-quarter precision)
- Created Oracle Feed ("COSMIC INTELLIGENCE") with transit alerts, psychic updates, historical parallels
- Created THE WAR ROOM: ENTERPRISE STRATEGY section with 5 game carousel
- Created SovereignDuel.js (chart-vs-chart planet-by-planet dominance clash)
- Wired VortexVelocity, AuraAlignment, SovereignDuel into App.js routes

### 2026-03-31 - Scriptural Synthesis & Akashic Engine
- Created SynthesisEngine service with full cross-system correlation
- Akashic Echoes: Past Life analysis via Ketu + 8th House
- Sovereign Identity: Unified BaZi Element + Western Rising + Vedic Nakshatra
- Daily Strategic Window: Combines Dasha + Transits + Universal Day Number

### 2026-03-31 - Authenticity Engine & Sensory Readings
- "View Calculation Logic" overlays with raw ephemeris data + scripture citations
- Solfeggio ambient tones: 432Hz on Dashboard, 528Hz on Tarot Reader
- Liquid Glass: backdrop-filter blur(25px) saturate(1.4)
- Gyroscope Parallax Starfield
- Created Vocal Oracle: Gemini-powered strategic briefings

### 2026-04-01 - Interactive Tarot Module & Section Diversification
- **Tarot Module Overhaul**: Rebuilt as 3-phase interactive experience (setup -> card selection -> animated reveal). 5 reading types (General/Career/Aura/Energy/Love) with personalized deck weighting via Moon sign + Dasha Lord resonance. Per-card "View Calculation Logic" overlays. Updated Pydantic models and backend endpoint to support JSON body with optional birth data.
- **Vedic Chart Page**: Full interactive page with form, 3-tab results (Planetary Positions table with DMS/speed/retro, Vimshottari Dasha timeline, Pancha-Pakshi Oracle panel), View Calculation Logic. All data from Swiss Ephemeris.
- **Western Chart Page**: Full interactive page with form, 3-tab results (Planets table, Aspects panel with harmony/challenge labels, 12-House cusps), View Calculation Logic. Client-computed aspects from real longitudes.
- **Chinese Astrology Page**: Full interactive page with animal sign card (emoji, element badge, yin-yang), personality traits, compatible signs, lucky numbers/colors. Per Zi Ping Ba Zi system.
- **Numerology Calculator Page**: Full interactive page with triple-system analysis (Chaldean/Pythagorean/Vedic), archetype cards (ruling planet, mantra, vibration), lucky numbers/colors, interpretation. Per ancient tradition (Babylon 4000 BCE, Greece 530 BCE, India 1500 BCE).
- All pages maintain Obsidian + Metallic Gold theme with Liquid Glass glass-card styling and "Scripture-Bound Deterministic Math" badges.
- **Testing**: iteration_7 (Tarot 100%), iteration_8 (All 4 sections 100%, Tarot regression passed)
