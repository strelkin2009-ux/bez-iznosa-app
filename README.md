# Без износа — трекер практик

PWA-приложение для 6-недельной программы «Без износа».

## Stack
- Next.js 14 (App Router)
- Neon PostgreSQL
- Vercel (hosting)

## Setup
1. Clone repo
2. Copy `.env.example` to `.env.local` and fill in
3. `npm install`
4. `npm run db:setup` — creates tables
5. `npm run dev` — start locally

## Deploy
Push to GitHub → Vercel auto-deploys.
Add `DATABASE_URL` and `SESSION_SECRET` to Vercel Environment Variables.
