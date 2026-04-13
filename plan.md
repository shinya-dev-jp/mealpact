# MealPact — plan.md

> Claude Code は毎セッション開始時にこのファイルを読むこと。
> 仕様変更・バグ修正・未実装タスクは随時このファイルに反映すること。

最終更新: 2026-04-13

---

## コンセプト

食事写真を撮るだけでカロリー計算 + WLD コミットメントチャレンジ。
「食べたものを記録する」習慣をゲーム化し、健康目標を継続させる。

- **ターゲット**: World App ユーザー（健康意識のある層）
- **差別化**: World ID Sybil 耐性 + WLD プール（0.1 WLD 預入 → 達成で返還 + ボーナス）
- **競合**: 食事/栄養カテゴリは World App で 0 アプリ（ブルーオーシャン）
- **補完**: Squadletics と補完関係（運動 + 食事 = 健康の 2 本柱）

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フロントエンド | Next.js 16 (App Router) + React 19 |
| スタイリング | Tailwind CSS v4 + framer-motion |
| UI ライブラリ | shadcn/ui（導入予定） |
| 認証 | World ID / MiniKit (Wallet Auth + IDKit orb) |
| AI 食事解析 | Gemini Flash (`@google/generative-ai`) |
| DB | Supabase (world-apps プロジェクト: `wgszbxgsxekwdmssnvvd`) |
| デプロイ | Vercel: https://mealpact.vercel.app |
| World App ID | — |

---

## 画面構成

| タブ | コンポーネント | 機能 |
|------|--------------|------|
| log | `LogScreen` | 食事写真撮影 → Gemini 解析 → カロリー表示 + 記録 |
| challenge | `ChallengeScreen` | 週間チャレンジ参加 + WLD 預入（MiniKit.pay） |
| profile | `ProfileScreen` | ユーザー統計・ストリーク・目標カロリー設定 |

### 認証フロー

1. World App 外 → `NotInWorldAppScreen`（ダウンロード誘導）
2. World App 内 → `WalletAuthScreen`（Wallet Auth ボタン）
3. 認証済み → メインアプリ（3タブ）

---

## API 一覧

| エンドポイント | メソッド | 機能 |
|--------------|---------|------|
| `/api/auth/nonce` | GET | Wallet Auth 用 nonce 生成 |
| `/api/auth/wallet` | POST | Wallet Auth 検証 + JWT 発行 |
| `/api/meal/analyze` | POST | 食事写真 → Gemini 解析 → 栄養情報返却 |
| `/api/meal/log` | POST | 食事記録を DB に保存 |
| `/api/meal/today` | GET | 今日の食事記録取得 |
| `/api/stats` | GET | ユーザー統計（ストリーク・チャレンジ実績） |
| `/api/challenge/current` | GET | 現在の週間チャレンジ取得 |
| `/api/challenge/join` | POST | チャレンジ参加 + WLD 預入記録 |
| `/api/events` | GET | SSE イベントストリーム |
| `/api/cron/resolve-challenge` | POST | 週次チャレンジ精算（Cron） |

---

## DB スキーマ（Supabase: world-apps）

### `mp_users`
| カラム | 型 | 説明 |
|--------|---|------|
| address | text PK | ウォレットアドレス |
| verification_level | text | orb / device / none |
| target_calories | int | 目標カロリー |
| language | text | 表示言語 |
| streak | int | 現在ストリーク日数 |
| best_streak | int | 最長ストリーク |
| total_challenges | int | チャレンジ参加数 |
| total_wins | int | チャレンジ成功数 |
| created_at | timestamptz | |

### `meal_logs`
| カラム | 型 | 説明 |
|--------|---|------|
| id | uuid PK | |
| user_address | text FK | |
| meal_type | text | breakfast/lunch/dinner/snack |
| foods_json | jsonb | FoodItem[] |
| total_calories | int | |
| total_protein | float | |
| total_carbs | float | |
| total_fat | float | |
| logged_at | timestamptz | |

### `challenges`
| カラム | 型 | 説明 |
|--------|---|------|
| id | uuid PK | |
| week_start | date | |
| week_end | date | |
| status | text | active / resolved |
| total_pool | float | WLD 総プール |
| participant_count | int | |
| success_count | int | |

### `challenge_entries`
| カラム | 型 | 説明 |
|--------|---|------|
| id | uuid PK | |
| challenge_id | uuid FK | |
| user_address | text FK | |
| wld_deposited | float | 0.1 WLD |
| days_logged | int | 今週の記録日数 |
| is_success | bool | 5/7日以上達成で true |
| wld_returned | float | 返還額 |
| payment_reference | text | MiniKit.pay reference |
| created_at | timestamptz | |

---

## 実装フェーズ

### Phase 1 — MVP ✅ 完了
- [x] World ID Wallet Auth
- [x] 食事写真 → Gemini Flash 解析 → 栄養情報表示
- [x] 食事記録 API + DB 保存
- [x] 週間チャレンジ参加 API
- [x] プロフィール画面（統計表示）
- [x] 多言語対応（ja/en）
- [x] Vercel デプロイ

### Phase 2 — WLD 預入・決済（進行中）
- [x] `MiniKit.pay()` 実装（ChallengeScreen.tsx）
- [x] `payment_reference` カラム追加
- [x] テストモード実装（`?test=1` / `NEXT_PUBLIC_TEST_MODE=true`）
- [ ] **デプロイ本番化**（ブロッカー: `.env.local` に `NEXT_PUBLIC_CHALLENGE_RECEIVER=0x...` 設定が必要）
  - Shinya のアクション: ウォレットアドレスを `.env.local` に追記 → `vercel deploy`
  - Supabase マイグレーション: `supabase/migrations/20260413_challenge_payment_ref.sql`

### Phase 3 — UI 改善（未着手）
- [ ] shadcn/ui 導入 → 新規コンポーネントから順次採用
- [ ] ファビコン・apple-touch-icon の最終確認
- [ ] World Developer Portal 審査提出

### Phase 4 — 機能拡張（未着手）
- [ ] World ID Orb 認証オプション（追加ボーナス付与）
- [ ] チャレンジ精算 Cron の本番確認
- [ ] カロリー目標達成通知

---

## 既知のバグ・注意事項

- WLD 預入は本番未デプロイ（Shinya のウォレットアドレス設定待ち）
- `api/cron/resolve-challenge` の Cron スケジュール: 要 Vercel で設定確認
- ミールタイプ「snack」の日本語表記確認

---

## 環境変数（Vercel 設定済み）

```
NEXT_PUBLIC_WLD_APP_ID=<app_id>
NEXT_PUBLIC_SUPABASE_URL=https://wgszbxgsxekwdmssnvvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sb_publishable_...>
SUPABASE_SERVICE_ROLE_KEY=<sb_secret_...>
GEMINI_API_KEY=<key>
NEXT_PUBLIC_CHALLENGE_RECEIVER=<要設定: Shinya のウォレットアドレス>
```
