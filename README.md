# eBay Product Search

A Next.js app that lets you search eBay for products by keyword. Results show title, price, condition, thumbnail, and a link to each listing. OAuth and API credentials stay on the server only.

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env.local` and fill in your eBay sandbox credentials
4. Get sandbox credentials at developer.ebay.com → create app → copy Client ID and Client Secret
5. Run `npm run dev`
6. Open http://localhost:3000

## Environment Variables

| Variable | Description | Example value |
| --- | --- | --- |
| `EBAY_CLIENT_ID` | eBay application Client ID (sandbox) | `your_client_id_here` |
| `EBAY_CLIENT_SECRET` | eBay application Client Secret (sandbox) | `your_client_secret_here` |
| `EBAY_API_BASE` | Base URL for eBay REST APIs | `https://api.sandbox.ebay.com` |
| `EBAY_OAUTH_URL` | OAuth 2.0 token endpoint | `https://api.sandbox.ebay.com/identity/v1/oauth2/token` |

## How It Works

- User types a query → debounced search fires to `/api/search?q=`
- Backend authenticates with eBay OAuth (token cached in memory)
- eBay Browse API returns listings → normalized and returned as JSON
- Frontend renders results in a responsive grid

## Tradeoffs

- In-memory token cache resets on server restart; production would use Redis or a persistent store
- No rate limiting on `/api/search`; production would add per-IP throttling
- Sandbox API used by default; swap `EBAY_API_BASE` and `EBAY_OAUTH_URL` for production

## What I'd Improve With More Time

- Pagination / infinite scroll using eBay `offset` param
- Price range and condition filters
- Redis-based token cache for multi-instance deployments
- End-to-end tests with Playwright
- Deploy to Vercel with environment variables set in dashboard
