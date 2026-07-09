---
name: LeonBlox site status
description: Current build state and pending work for the LeonBlox website project
---

# LeonBlox Site — Session State

## What's built and working
- Static landing page at `/` (React + Vite, artifact: `artifacts/leonblox`)
- Dark cyberpunk aesthetic, Framer Motion animations, Rajdhani/Inter fonts
- Live YouTube stats (subscribers + views) from `/api/youtube-stats` — 1-min cache
- Live latest videos grid (6 cards) from `/api/youtube-videos` — 1-min cache, real thumbnails, view counts, time-ago labels, links to YouTube
- API server at `artifacts/api-server`, routes in `src/routes/`

## Pending: YouTube Analytics OAuth (views count fix)

**Why:** YouTube Data API `viewCount` excludes Shorts views. User has 3.1M total but API returns 2.5M. YouTube Analytics API gives the real total but requires OAuth.

**What's already built:**
- `artifacts/api-server/src/routes/youtube-auth.ts` — OAuth endpoints:
  - `GET /api/auth/youtube` — starts OAuth flow (redirects to Google)
  - `GET /api/auth/youtube/callback` — exchanges code for tokens, displays refresh token
- `artifacts/api-server/src/routes/youtube.ts` — updated to use Analytics API when `YOUTUBE_REFRESH_TOKEN` is set; falls back to Data API if not

**What the user still needs to do (3 steps):**

1. **Google Cloud Console** — in the same project as their API key:
   - Enable "YouTube Analytics API"
   - Create OAuth 2.0 Client ID (Web application type)
   - Add redirect URI: `https://d16002e4-2c78-4fe3-b6f7-e37919a13249-00-8a502gnddeig.riker.replit.dev/api/auth/youtube/callback`
   - Copy the Client ID and Client Secret

2. **Add two Replit secrets:**
   - `YOUTUBE_OAUTH_CLIENT_ID`
   - `YOUTUBE_OAUTH_CLIENT_SECRET`

3. **Authorize:**
   - Visit: `https://d16002e4-2c78-4fe3-b6f7-e37919a13249-00-8a502gnddeig.riker.replit.dev/api/auth/youtube`
   - Sign in with their YouTube/Google account
   - Copy the refresh token shown on screen
   - Add as Replit secret: `YOUTUBE_REFRESH_TOKEN`

**After all 3 steps:** the `/api/youtube-stats` endpoint will automatically use the Analytics API and return the real 3.1M total. No code changes needed.

## Existing secrets (already configured)
- `SESSION_SECRET`
- `YOUTUBE_API_KEY`
- `YOUTUBE_CHANNEL_HANDLE`

## Key files
- `artifacts/leonblox/src/App.tsx` — entire frontend (single file)
- `artifacts/api-server/src/routes/youtube.ts` — stats endpoint
- `artifacts/api-server/src/routes/youtube-videos.ts` — videos endpoint
- `artifacts/api-server/src/routes/youtube-auth.ts` — OAuth endpoints
- `artifacts/api-server/src/routes/index.ts` — route registry

**Why:** YouTube API `viewCount` known limitation — no code fix possible, requires OAuth to access Analytics API which has the real total.
