# PumpRadar

AI-powered memecoin signal tracker for Solana. Detects buy/sell opportunities, sends Telegram alerts, and tracks your P&L in real time.

**Live:** https://pumparadar.vercel.app

## Features

- Scans trending Solana tokens every 5 minutes via DexScreener
- Scores each coin on safety + momentum
- Signals: Buy Now, Keep Watching, Too Late, Avoid, Likely Rug
- Telegram alerts for buy, sell, and take-profit opportunities
- SOL calculator with copy-to-clipboard for quick trading
- Holdings tracker with unrealized/realized P&L and trade history
- Google OAuth authentication with 30-day sessions

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS, NextAuth.js
- **Backend:** Node.js, Express, MongoDB
- **Scoring Engine:** Cron-based data collection + safety/momentum analysis
- **Alerts:** Telegram Bot API
- **Hosting:** Vercel (frontend), Render (backend)

## Project Structure

```
├── frontend/          # Next.js dashboard
├── backend/
│   ├── collectors/    # DexScreener data fetchers
│   ├── scoring/       # Safety + momentum scoring engine
│   ├── models/        # MongoDB schemas (Coin, Metric, Score, User)
│   ├── routes/        # API endpoints
│   └── alerts/        # Telegram bot
```

## How It Works

1. **Data Collection** — Fetches trending Solana memecoins from DexScreener every 5 minutes
2. **Scoring** — Each coin gets a safety score (liquidity, buy/sell ratio) and momentum score (price action, volume)
3. **Signals** — Composite score determines the signal: Buy Now, Keep Watching, Too Late, Avoid, or Likely Rug
4. **Alerts** — Telegram bot sends real-time buy/sell alerts when signals change
5. **Trading** — SOL calculator converts USD to SOL, one-click open on Photon to execute trades
6. **Tracking** — Track holdings, monitor P&L, and review trade history
