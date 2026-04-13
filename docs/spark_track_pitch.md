# MealPact — Spark Track Grant Pitch

> **Track**: Spark Track (Consumer Mini App)
> **Deadline**: Mid-May 2026
> **Team**: Solo founder — Shinya Yuda (@shinya_builds)

---

## One-Liner

**MealPact turns healthy eating into a commitment game: snap a photo, let AI count calories, stake WLD — get it back only if you log 5+ days a week.**

---

## Problem

Calorie tracking apps have a ~90% drop-off rate within 2 weeks. Why? There's no consequence for quitting. Willpower alone doesn't work.

---

## Solution

MealPact adds **skin in the game**:

1. **Snap** — photograph your meal; Gemini AI estimates calories in seconds
2. **Commit** — deposit a small amount of WLD at the start of each week
3. **Log 5+ days** — succeed and get your deposit back + a share of losers' pool
4. **Miss days** — your deposit is redistributed to winners

Zero platform fee. 100% peer-to-peer accountability.

---

## Why World App / World ID?

| Feature | Why It Matters |
|---|---|
| **1 wallet = 1 account** | Prevents multi-account farming of the challenge pool |
| **Orb verification** | Phase 2 bonus multiplier for verified humans — drives Orb adoption |
| **WLD micro-payments** | Native commitment mechanism with real stakes |
| **Mini App distribution** | Zero install friction — 26M+ World App users |

---

## Traction & Metrics (Target — 30 days post-launch)

| Metric | Target |
|---|---|
| DAU | 200+ |
| Weekly challenge participants | 50+ |
| Meal logs per DAU | 1.5+ |
| Orb-verified users | 40%+ |
| 7-day retention | 45%+ |

---

## Technical Architecture

- **Frontend**: Next.js 16 + Tailwind CSS 4 + Framer Motion
- **AI**: Google Gemini 2.0 Flash (food photo → calorie JSON)
- **Auth**: World App Wallet Auth (SIWE) — no password, no email
- **DB**: Supabase (Tokyo, ap-northeast-1) — `mp_` prefixed tables
- **Deployment**: Vercel Edge Network
- **Mini App**: World App MiniKit v2

---

## Roadmap

| Phase | Features |
|---|---|
| **Phase 1 (MVP — live)** | AI calorie logging, weekly challenge (DB-tracked), profile/streaks |
| **Phase 2** | MiniKit.pay() for real WLD transfers, Orb bonus multiplier (1.5x) |
| **Phase 3** | Social sharing, group challenges, 6-language expansion |

---

## Revenue & Sustainability

- **Developer Rewards**: DAU-based WLD distribution from World App program
- **Spark Track Grant**: Seed funding for Phase 2 development
- **Future**: Premium streak insurance, sponsored challenges

---

## Why Now?

- Health & wellness is the #1 app category globally
- Commitment devices (commitment contracts) are proven behavioral economics
- No existing food/health app on World App marketplace (242 apps scanned — zero direct competitors)
- Gemini AI makes photo-to-calorie analysis instant and cheap ($0.0003/photo)

---

## Contact

- **GitHub**: github.com/shinya-yuda/mealpact (private)
- **Live Demo**: https://mealpact.vercel.app
- **X**: @shinya_builds
- **World App**: Search "MealPact"
