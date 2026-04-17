# Zenith Oracle - Product Requirements Document

## Original Problem Statement
100% Scientific Accuracy Astrology platform. Obsidian #020617 & Metallic Gold #D4AF37. **100% FREE** with aggressive ad monetization. Optimized for Play Store/App Store bulk downloads.

## Revenue Model
1. **AdManager Revenue Engine** ($10-50 CPM): Interstitial ads every 3-5 minutes with varied patterns (burst 3x5s, double 2x20s, single long 30s skippable, single medium 15s skippable, single short 10s skippable)
2. **Rewarded Video Ads** ($10-50 CPM): Unlock Daily Oracle extended reading, Unlock Alpha Briefing, War Room Cosmic Reset (all 5 games)
3. **Native Banner Ads** ($1-3 CPM): Gold-themed on every result page
4. **Viral Growth**: Compatibility Checker (invite friends), Share Reading buttons on ALL results
5. **Daily Engagement**: Daily Oracle + Alpha Briefing + Push Notifications = 3 daily return triggers

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Glassmorphism UI + Web Speech API + PWA
- **Backend**: Python FastAPI (modular routes) + PySwisseph (Swiss Ephemeris) + Gemini AI (emergentintegrations)
- **Database**: MongoDB (Motor async) + Redis (caching)
- **PWA**: manifest.json, custom app icons, standalone display, installable, push notifications

## Backend Route Structure (Refactored)
```
/app/backend/
├── server.py              # Slim entry point (~55 lines)
├── routes/
│   ├── vedic.py           # Birth chart, dasha, divisional, pancha-pakshi, nakshatra
│   ├── western.py         # Western tropical birth chart
│   ├── chinese.py         # Chinese lunisolar zodiac
│   ├── numerology.py      # Chaldean/Pythagorean/Vedic
│   ├── tarot.py           # 78+44 cards, 5 reading types
│   ├── oracle.py          # Daily oracle, oracle feed, daily tarot card
│   ├── synthesis.py       # Sovereign verdict, akashic echoes, data integrity
│   ├── ai.py              # Gemini AI insights, vocal oracle, alpha briefing
│   ├── system.py          # Health, root, engine status, power meter
│   └── notifications.py   # Push subscribe/unsubscribe/preferences/stats
├── core/                  # config, redis_client
├── models/                # Pydantic schemas
└── services/              # Business logic (vedic, western, chinese, numerology, tarot, gemini, cache)
```

## Modules (11 Total)
1. **Daily Oracle** — Daily horoscope + Card of the Day + extended (Career/Love/Health/Wealth)
2. **Alpha Briefing** — 60-second Gemini AI morning strategy audio
3. **Vedic Zenith** — D1-D60 charts, Vimshottari Dasha, Pancha-Pakshi Oracle
4. **Western Zenith** — Tropical zodiac, Placidus houses, planetary aspects
5. **Tarot Oracle** — 78+44 cards, 5 reading types, personalized deck weighting
6. **Numerology Vault** — Chaldean/Pythagorean/Vedic triple-system analysis
7. **Chinese Oracle** — Lunisolar zodiac, Five Elements, Yin-Yang
8. **Compatibility Checker** — Cross-system partner match
9. **Power Meter** — 0-100% dominance gauge from real-time transits
10. **Scriptural Synthesis** — Cross-system verdict with Akashic Echoes
11. **Accuracy Lab** — Engine status, Delta-T, Ayanamsha monitoring

## War Room (5 Strategy Games)
- Market Siege, Oracle's Trial, Vortex Velocity, Aura Alignment, Sovereign Duel

## Growth & Monetization Features
- 3-step Onboarding Flow (Name, DOB with AM/PM, Location)
- AdManager (5 ad patterns, 3-5 min intervals, burst/skippable)
- Daily Streak System with badges
- Push Notifications (Daily Oracle Digest opt-in)
- PWA Install Banner
- Rating Prompt after 5 readings
- Social Proof counters
- Share Reading buttons on ALL results

## Service Worker (pwabuilder-sw.js)
- **Cache-first**: Static assets (JS, CSS, images, fonts)
- **Stale-while-revalidate**: Daily oracle, oracle feed, daily tarot, engine status
- **Network-first**: All other API routes with offline JSON fallback
- **Push handler**: Notification display with actions (View Oracle / Later)
- **Background sync**: Pending readings queue

## Completed (All P0 + P1 + P2)
- [x] All 11 modules with full interactive UIs
- [x] Free + ad model (payments removed)
- [x] AdManager revenue engine (5 ad patterns, 3-5 min intervals)
- [x] Push notification system (subscribe/unsubscribe/stats + frontend opt-in)
- [x] Service worker upgraded (3 caching strategies + push + offline fallback)
- [x] server.py refactored from 852 lines to modular /routes/ (~55 line entry point)
- [x] Daily Oracle + Alpha Briefing
- [x] Redis installed and connected
- [x] Cosmic Reset rewarded video ads in all 5 War Room games
- [x] Ad banners on ALL result pages and game results
- [x] Share buttons on ALL results
- [x] Onboarding with AM/PM birth time selector
- [x] White-label (no Emergent badge, Roy's Enterprise copyright only)
- [x] 512x512 logo in public/assets/
- [x] manifest.json: "Zenith Oracle - Cosmic Intelligence"
- [x] PWA compliance (manifest, icons, screenshots, pwabuilder-sw.js)

## Remaining Backlog
- [ ] Real VAPID keys for production push notifications
- [ ] Real AdMob SDK when deploying via Capacitor/TWA
- [ ] Server-side push notification scheduler (daily cron)
