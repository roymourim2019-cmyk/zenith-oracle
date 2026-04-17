# Zenith Oracle - Product Requirements Document

## Original Problem Statement
100% Scientific Accuracy Astrology platform. Obsidian #020617 & Metallic Gold #D4AF37. **100% FREE** with aggressive ad monetization. Optimized for Play Store/App Store bulk downloads.

## Revenue Model
1. **Rewarded Video Ads** ($10-50 CPM): Unlock Daily Oracle extended reading, Unlock Alpha Briefing, War Room Cosmic Reset (all 5 games)
2. **Native Banner Ads** ($1-3 CPM): Gold-themed on every result page (Vedic/Western/Tarot/Chinese/Numerology/Compatibility/Daily/Briefing + all game results)
3. **Viral Growth**: Compatibility Checker (invite friends), Share Reading buttons on ALL results, Social proof counters
4. **Daily Engagement**: Daily Oracle + Alpha Briefing = 2 daily return triggers = consistent ad impressions

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Glassmorphism UI + Web Speech API
- **Backend**: Python FastAPI + PySwisseph (Swiss Ephemeris) + Gemini AI (emergentintegrations)
- **Database**: MongoDB (Motor async) + **Redis (installed & connected)**
- **PWA**: manifest.json, custom app icons, standalone display, installable

## Modules (11 Total)
1. **Daily Oracle** — Daily horoscope + Card of the Day + rewarded video-gated extended reading (Career/Love/Health/Wealth)
2. **Alpha Briefing** — 60-second Gemini AI morning strategy audio with real Swiss Ephemeris transit data
3. **Vedic Zenith** — D1-D60 charts, Vimshottari Dasha, Pancha-Pakshi Oracle
4. **Western Zenith** — Tropical zodiac, Placidus houses, planetary aspects
5. **Tarot Oracle** — 78+44 cards, 5 reading types, personalized deck weighting
6. **Numerology Vault** — Chaldean/Pythagorean/Vedic triple-system analysis
7. **Chinese Oracle** — Lunisolar zodiac, Five Elements, Yin-Yang
8. **Compatibility Checker** — Cross-system partner match (Moon+Dasha+Numerology+Chinese)
9. **Power Meter** — 0-100% dominance gauge from real-time transits
10. **Scriptural Synthesis** — Cross-system verdict with Akashic Echoes
11. **Accuracy Lab** — Engine status, Delta-T, Ayanamsha monitoring

## War Room (5 Strategy Games) — All with Cosmic Reset + AdBanner + ShareButton
- Market Siege, Oracle's Trial, Vortex Velocity, Aura Alignment, Sovereign Duel

## Growth Features
- 3-step Onboarding Flow (Name → DOB → Location)
- Daily Streak System with badges
- Social Proof counters (10,000+ readings, 4.9 rating, 100% Free)
- Share Reading buttons on ALL result pages and game results
- PWA Install Banner + manifest.json + custom app icons
- Rating Prompt after 5 readings
- Vocal Oracle (Gemini-powered strategic briefings)

## API Endpoints
- GET /api/health (redis: connected, mongodb: connected)
- GET /api/daily-oracle, GET /api/daily-tarot-card
- POST /api/alpha-briefing (with optional birth data personalization)
- POST /api/vedic/birth-chart, dasha-periods, pancha-pakshi, divisional-chart
- POST /api/western/birth-chart
- POST /api/chinese/calculate
- POST /api/numerology/calculate
- POST /api/tarot/reading (5 types, personalized)
- GET /api/oracle-feed, /api/accuracy/engine-status, /api/power-meter/{name}
- POST /api/vocal-oracle, /api/synthesis/*

## Completed (All P0 + P1)
- [x] All 11 modules with full interactive UIs
- [x] Free + ad model (payments removed)
- [x] Daily Oracle with rewarded video ad gate
- [x] Alpha Daily Briefing (Gemini AI + real transits + Web Speech API)
- [x] Redis installed and connected
- [x] Cosmic Reset rewarded video ads in all 5 War Room games
- [x] Ad banners on ALL result pages and game results
- [x] Share buttons on ALL results
- [x] Onboarding, streak, PWA, compatibility, rating prompt
- [x] White-label: "Made with Emergent" badge completely removed (Feb 2026)
- [x] AM/PM birth time selector in OnboardingFlow (Feb 2026)
- [x] AdManager.js revenue engine — interstitial ads every 3-5 min with varied patterns (Feb 2026)
- [x] Footer shows only "© 2026 Roy's Enterprise. All Rights Reserved." (Feb 2026)

## Remaining Backlog (P2)
- [ ] Refactor server.py into /routes/ directory
- [ ] Service worker for offline support
- [ ] Push notifications for daily oracle digest
