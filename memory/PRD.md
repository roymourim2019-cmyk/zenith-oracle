# Zenith Oracle - Product Requirements Document

## Original Problem Statement
A 100% Scientific Accuracy Astrology platform with a High-Ticket Aesthetic (Obsidian #020617 & Metallic Gold #D4AF37). 100% FREE with ad-supported revenue model. Optimized for Play Store/App Store downloads.
Modules: Vedic (Lahiri Ayanamsha), Western (Topocentric), Chinese Lunisolar, Numerology, Tarot, Compatibility Checker.
Features: PWA installable, Onboarding flow, Daily streak system, Share reading cards, Ad banners, "War Room" for 5 enterprise strategy games.

## Revenue Model
- **100% Free** — No payments, no premium tiers, no locked features
- **Ad Revenue**: AdMob banner ads on result pages, interstitial ads between sessions, rewarded video ads in War Room
- **Downloads**: PWA install prompt, App Store/Play Store optimized
- **Virality**: Share reading buttons, Compatibility Checker (invite friends)

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Glassmorphism UI
- **Backend**: Python FastAPI + PySwisseph (Swiss Ephemeris) for astronomical calculations
- **Database**: MongoDB (via Motor async driver)
- **Cache**: Redis (currently mocked/bypassed)
- **Styling**: Obsidian (#020617) background, Metallic Gold (#D4AF37) accents, Playfair Display headings

## What's Been Implemented

### Revenue & Growth Features
- **Ad Banners**: Gold-themed AdMob banners on all result pages (AdMob test IDs)
- **Onboarding Flow**: 3-step first-time experience (Name → Birth Date/Time → Location)
- **Daily Streak**: "1 day" streak counter with best record tracking
- **Social Proof**: "10,000+ readings | 4.9 Rating | 100% Free" on home
- **Share Reading**: One-click share buttons on all section results (Web Share API + clipboard fallback)
- **PWA**: manifest.json, app icons (192px/512px), apple-touch-icon, standalone display mode
- **Rating Prompt**: Shows after 5 readings completed
- **Install Banner**: "Add to Home Screen" prompt for PWA installation
- **Compatibility Checker**: Cross-system partner match (viral feature for friend invites)

### Core Astrology Engine (Backend)
- Vedic birth chart (D1-D60 divisional, Vimshottari Dasha, Pancha-Pakshi)
- Western chart (Tropical/Topocentric, Placidus houses)
- Chinese Lunisolar astrology
- Numerology (Chaldean, Pythagorean, Vedic)
- Tarot reading (78+44 cards, 5 personalized reading types)
- Oracle Feed (Transit Alerts, Psychic Updates)
- Scriptural Synthesis (Cross-system correlation)
- Akashic Echoes (Past life profiling)

### Frontend Pages (ALL INTERACTIVE)
- Home: Starfield, hero, Sovereign Matrix (9 modules), War Room (5 games), ad banners
- Vedic Chart: Planet table + Dasha timeline + Pancha-Pakshi (3 tabs)
- Western Chart: Planets + Aspects + Houses (3 tabs)
- Chinese Astrology: Animal sign card with element/yin-yang
- Numerology: Triple-system archetype analysis
- Tarot Reader: 3-phase interactive (setup → select → reveal)
- Compatibility Checker: 2-person form, 4 cross-system scores + overall
- Power Meter, Accuracy Lab, 5 War Room Games
- Vocal Oracle (Gemini), Scriptural Synthesis

### API Endpoints
- POST /api/vedic/birth-chart, dasha-periods, pancha-pakshi, divisional-chart
- POST /api/western/birth-chart
- POST /api/chinese/calculate
- POST /api/numerology/calculate
- POST /api/tarot/reading (5 types, personalized)
- GET /api/oracle-feed, /api/accuracy/engine-status, /api/power-meter/{name}
- POST /api/vocal-oracle, /api/synthesis/* 
- **REMOVED**: /api/payment/create-order, /api/payment/verify

## Prioritized Backlog

### P0 - Completed
- [x] Interactive Tarot Reader
- [x] Diversify all sections with full interactive UIs
- [x] Remove all payment modes, switch to free + ad model
- [x] Onboarding flow, streak, share, ads, PWA, compatibility checker

### P1
- [ ] Redis installation and proper caching for transit data
- [ ] AdMob Rewarded Videos in War Room (Cosmic Reset on game loss)
- [ ] Alpha Daily Briefing (60-sec morning audio)

### P2
- [ ] Refactor server.py into /routes/ directory
- [ ] Offline support (cache last readings via service worker)
- [ ] Push notifications for daily oracle digest
