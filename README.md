# Memecoin Decision Intelligence Platform

A platform that collects real-time Solana memecoin data, scores coins by safety and momentum, and predicts pump/crash probability using AI.

## Structure

```
memecoin-platform/
├── frontend/          # Next.js dashboard
├── backend/           # Node.js API + cron jobs
│   ├── collectors/    # DexScreener, Pump.fun data fetchers
│   ├── scoring/       # Safety + momentum scoring engine
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   └── alerts/        # Telegram bot
├── ai-service/        # Python FastAPI ML service (Phase 4)
└── docs/              # Notes and API documentation
```

## Phases

- **Phase 1** - Data collection + DB + basic dashboard
- **Phase 2** - Safety + Momentum scoring engine
- **Phase 3** - Telegram alerts
- **Phase 4** - AI prediction model
- **Phase 5** - Multi-user SaaS features

## Stack

- Frontend: Next.js + Tailwind
- Backend: Node.js + Express + MongoDB
- AI: Python + FastAPI
- Hosting: Vercel (frontend) + Railway (backend)
