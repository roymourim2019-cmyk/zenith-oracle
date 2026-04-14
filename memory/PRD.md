# Zenith Oracle - Product Requirements Document

## Original Problem Statement
A 100% Scientific Accuracy Astrology platform with High-Ticket Aesthetic (Obsidian #020617 & Metallic Gold #D4AF37). **100% FREE** with aggressive ad-supported revenue model optimized for Play Store/App Store downloads.

## Revenue Model (Ad-First Strategy)
1. **Rewarded Video Ads** (Highest CPM $10-50): Unlock extended Daily Oracle reading (Career/Love/Health/Wealth). War Room Cosmic Reset.
2. **Interstitial Ads** (High CPM $5-15): Between reading sessions.
3. **Native Banner Ads** (Consistent CPM $1-3): Gold-themed "Sponsored by the Cosmos" on every result page.
4. **Viral Growth Loop**: Compatibility Checker (invite friends) + Share Reading buttons on all results.
5. **Daily Engagement**: Daily Oracle page brings users back every day = daily ad impressions.

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Glassmorphism UI
- **Backend**: Python FastAPI + PySwisseph (Swiss Ephemeris) + MongoDB
- **PWA**: manifest.json, app icons, standalone display, installable

## Modules (10 Total)
1. **Daily Oracle** - Daily horoscope + Card of the Day + ad-gated extended reading (Career/Love/Health/Wealth)
2. **Vedic Zenith** - D1-D60 charts, Vimshottari Dasha, Pancha-Pakshi Oracle
3. **Western Zenith** - Tropical zodiac, Placidus houses, planetary aspects
4. **Tarot Oracle** - 78+44 cards, 5 reading types, personalized deck weighting
5. **Numerology Vault** - Chaldean/Pythagorean/Vedic triple-system analysis
6. **Chinese Oracle** - Lunisolar zodiac, Five Elements, Yin-Yang
7. **Compatibility Checker** - Cross-system partner match (Moon+Dasha+Numerology+Chinese)
8. **Power Meter** - 0-100% dominance gauge from real-time transits
9. **Scriptural Synthesis** - Cross-system verdict with Akashic Echoes
10. **Accuracy Lab** - Engine status, Delta-T, Ayanamsha monitoring

## War Room (5 Strategy Games)
- Market Siege, Oracle's Trial, Vortex Velocity, Aura Alignment, Sovereign Duel

## Growth Features
- Onboarding Flow (3-step: Name → DOB → Location)
- Daily Streak System with badges
- Social Proof counters
- Share Reading buttons on all section results
- PWA Install Banner
- Rating Prompt after 5 readings

## API Endpoints
- GET /api/daily-oracle, GET /api/daily-tarot-card
- POST /api/vedic/birth-chart, dasha-periods, pancha-pakshi, divisional-chart
- POST /api/western/birth-chart
- POST /api/chinese/calculate
- POST /api/numerology/calculate
- POST /api/tarot/reading (5 types, personalized)
- GET /api/oracle-feed, /api/accuracy/engine-status, /api/power-meter/{name}
- POST /api/vocal-oracle, /api/synthesis/*
- **REMOVED**: /api/payment/*

## Prioritized Backlog
### P0 - Completed
- [x] All 10 modules with full interactive UIs
- [x] Free + ad model (no payments)
- [x] Daily Oracle with rewarded video ad gate
- [x] Onboarding, streak, share, PWA, compatibility
- [x] Ad banners on all result pages

### P1
- [ ] Redis installation for transit caching
- [ ] War Room Cosmic Reset rewarded video ads
- [ ] Alpha Daily Briefing (60-sec morning audio)

### P2
- [ ] Refactor server.py into /routes/
- [ ] Service worker for offline support
- [ ] Push notifications for daily digest
