# MealPact — Developer Rewards Maximization Checklist

> World App Developer Rewards are distributed based on DAU, engagement, and verified user ratio.
> This checklist tracks implementation status of all reward-boosting features.

---

## ✅ Core Eligibility

- [x] Mini App deployed and live on Vercel
- [x] World App Wallet Auth (SIWE) — proper authentication
- [x] Valid `worldapp.yaml` / Mini App submission
- [x] Privacy Policy page (`/privacy`)
- [x] Terms of Service page (`/terms`)
- [x] No ToS violations (no gambling framing, AI disclaimer added)

---

## ✅ DAU Drivers (Daily Active Users)

- [x] **Daily meal logging loop** — `LogScreen` with AI photo analysis
- [x] **Streak counter** — shown in header and profile (loss aversion)
- [x] **Weekly challenge** — 7-day engagement window
- [x] **Loss-aversion banner** — shows when at risk of losing deposit (≤3 days left, <5 logged)
- [x] **Meal type auto-detection** — reduces friction at log time
- [ ] **Push notifications** — "Don't break your streak!" (Phase 2, requires MiniKit notification API)
- [ ] **Daily cron reminder** — automated check-in prompt (Phase 2)

---

## ✅ Orb Verification Rate (Boosts reward multiplier)

- [x] **Orb bonus banner** in ChallengeScreen for device-verified users
- [x] **Verified Humans Only badge** on auth screen
- [x] **Orb verification level stored** in `mp_users.verification_level`
- [ ] **Phase 2 bonus multiplier** — 1.5x WLD return for Orb-verified users
- [ ] **Orb-exclusive challenge tier** — higher stakes pool for Orb users

---

## ✅ Retention & Engagement

- [x] **7-day progress dots** in ChallengeScreen
- [x] **Calorie progress bar** with color feedback (green/yellow/red)
- [x] **Expandable meal cards** with macro breakdown
- [x] **Editable calorie values** — trust-building override
- [x] **Challenge success/failure states** with animations
- [x] **Cross-promotion** → Daily Predict in ProfileScreen
- [x] **Share/invite button** — Web Share API + clipboard fallback
- [ ] **Confetti animation** on challenge success (Phase 2)
- [ ] **Weekly summary push** — "You logged X meals this week!" (Phase 2)

---

## ✅ Viral / K-Factor

- [x] **Share button** in ProfileScreen (`navigator.share`)
- [x] **OGP image** — dynamic 1200x630 via `opengraph-image.tsx`
- [x] **Twitter card** `summary_large_image`
- [ ] **Referral tracking** — invite link with UTM (Phase 2)
- [ ] **Leaderboard** — public weekly rankings (Phase 2)

---

## ✅ Technical Quality (affects review score)

- [x] **TypeScript strict** — zero build errors
- [x] **API-only Supabase access** — no client-side DB calls
- [x] **Service role key** server-side only
- [x] **Error boundaries** and loading states throughout
- [x] **Offline banner** — graceful degradation
- [x] **Safe area insets** — World App compatible
- [x] **Theme color** `#059669` (emerald) in viewport meta
- [x] **Background color unified** `#052e16` across all screens

---

## 📊 Reward Estimation (rough)

| Scenario | DAU | Est. Monthly WLD |
|---|---|---|
| Launch (week 1) | 50 | ~5 WLD |
| Growth (month 1) | 200 | ~20 WLD |
| Scale (month 3) | 1,000 | ~100 WLD |
| Target (month 6) | 5,000 | ~500 WLD |

*Estimates based on World App Developer Rewards program documentation.*

---

## 🗓 Next Actions

1. [ ] Submit Mini App to World App marketplace
2. [ ] Announce on @shinya_builds (X auto-post)
3. [ ] Apply for Spark Track Grant (deadline: mid-May 2026)
4. [ ] Implement Phase 2: MiniKit.pay() real WLD transfers
5. [ ] Implement Phase 2: Orb bonus multiplier
6. [ ] Track DAU in Vercel Analytics / Supabase dashboard
