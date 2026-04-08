# eBay Product Search

A Next.js 15 app that lets you search eBay for products with filtering and pagination. Results show title, price, condition, thumbnail, and a direct link to each listing. OAuth and API credentials stay on the server only.

## Features

✅ **Search & Browse** — Search by keyword or browse all 20 products on initial load  
✅ **Pagination** — View results in pages of 20 items  
✅ **Filters** — Filter by price range (min/max) and condition (New, Used, Refurbished, For Parts)  
✅ **Enter-Only Search** — Search only triggers when you press Enter, not while typing  
✅ **URL State** — Search filters and page numbers persist in URL for bookmarking/sharing  
✅ **Mock Mode** — Develop without eBay credentials using 20 realistic mock items  
✅ **Tests** — 43 unit/integration tests with 98.21% code coverage (Vitest)  
✅ **Type Safe** — Full TypeScript with strict mode  

## Quick Start

### 1. Clone and Install
```bash
git clone <repo>
cd ebaySearch
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required variables:
```env
EBAY_USE_MOCK=true              # Start with mock data (no credentials needed)
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_API_BASE=https://api.sandbox.ebay.com
EBAY_OAUTH_URL=https://api.sandbox.ebay.com/identity/v1/oauth2/token
```

### 3. Run the App
```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `EBAY_USE_MOCK` | Yes | Set `true` for mock data, `false` for real eBay API |
| `EBAY_CLIENT_ID` | If not mocking | eBay app Client ID from developer.ebay.com |
| `EBAY_CLIENT_SECRET` | If not mocking | eBay app Client Secret from developer.ebay.com |
| `EBAY_API_BASE` | No | eBay REST API base URL (default: sandbox) |
| `EBAY_OAUTH_URL` | No | eBay OAuth 2.0 token endpoint (default: sandbox) |

## Development

### Mock Mode (No eBay Account Needed)

Set `EBAY_USE_MOCK=true` in `.env.local` to use 20 hardcoded products. Works offline.

Search for these keywords to find results:
- **Tech**: iphone, macbook, airpods, playstation, samsung, nintendo, xbox, steam
- **Fashion**: nike, levi, adidas
- **Home**: coffee, dyson, lego
- **Sports**: yoga, dumbbell, tennis, baseball, watch, pokemon

### Real eBay API

1. Create a developer account at [developer.ebay.com](https://developer.ebay.com)
2. Create an application and copy Client ID + Client Secret
3. Set in `.env.local`:
   ```env
   EBAY_USE_MOCK=false
   EBAY_CLIENT_ID=your_id
   EBAY_CLIENT_SECRET=your_secret
   ```
4. Restart dev server

## Testing

Run tests with coverage:
```bash
npm test                 # Run all tests
npm run coverage         # Generate coverage report
```

Tests include:
- Mock data validation and filtering
- Pagination offset calculations
- Price/condition filter logic
- API route parameter parsing
- Error handling (timeout, invalid response)

## Architecture

```
app/page.tsx              → Main search page (client-side state)
├── components/SearchBar.tsx      → Search input (Enter-only trigger)
├── components/FilterPanel.tsx    → Price & condition filters
├── components/ProductCard.tsx    → Individual listing card
└── components/ProductGrid.tsx    → Grid layout

app/search/route.ts       → GET /search?q=&page=&minPrice=&maxPrice=&condition=
│                         → Returns {items, total, page, totalPages}
└── lib/ebay-client.ts    → eBay API client (mock or live)
    └── lib/mock-data.ts  → 20 hardcoded products with real images
```

## How It Works

1. **Initial Load** — Shows all 20 products (or from eBay if live)
2. **User Search** — Type query, press Enter → API call to `/search?q=...`
3. **Filtering** — Adjust price/condition → URL updates, filters applied server-side
4. **Pagination** — Click Previous/Next → `page` param changes
5. **URL State** — All filters persist: `/search?q=iphone&page=1&minPrice=50&maxPrice=200&condition=New`

## Tradeoffs & Decisions

### Why Mock Mode is Default
- **Decision**: Ship with mock data enabled to avoid credential setup friction
- **Tradeoff**: Requires switching `EBAY_USE_MOCK=false` to use real API
- **Benefit**: Zero blockers for demos, testing, and development

### Why Page-Based Pagination Instead of Infinite Scroll
- **Decision**: Implement paginated results (Previous/Next buttons)
- **Tradeoff**: Users must click to load more instead of scrolling
- **Benefit**: Simpler state management, faster page loads (20 items per page), shareable URLs with page numbers

### Why Enter-Only Search Instead of Debounced On-Type
- **Decision**: Search triggers only on Enter key, not while typing
- **Tradeoff**: No real-time search suggestions while typing
- **Benefit**: Drastically fewer API calls, better UX (no "loading" state jumping), matches desktop/native app expectations

### Why Server-Side Filtering Instead of Client-Side
- **Decision**: Apply price/condition filters on the backend
- **Tradeoff**: Filter changes require API roundtrip instead of instant client response
- **Benefit**: Accurate `total` count and pagination work correctly, supports 1000s of results, no client memory bloat

### Why In-Memory Token Cache
- **Decision**: Cache OAuth tokens in Node.js memory (no Redis/DB)
- **Tradeoff**: Token cache resets on server restart; fails in multi-instance setups
- **Benefit**: Zero infrastructure needed, development simplicity, fast token reuse (2-4 API calls/hour)

### Why No Rate Limiting
- **Decision**: No per-IP or per-user rate limiting on `/search`
- **Tradeoff**: Vulnerable to search request floods
- **Benefit**: Simpler API logic, sufficient for personal/demo use
- **Note**: Production deployments should add Vercel rate-limiting middleware or similar

### Why Mock Images from CDN
- **Decision**: Use Amazon S3 and Apple Store CDN for product images instead of storing locally
- **Tradeoff**: Depends on external CDNs; images may change/break
- **Benefit**: Realistic images without managing file storage, lightweight deployment

## Next Steps for Production

1. **Token Cache** — Replace in-memory cache with Redis for multi-instance deployments
2. **Rate Limiting** — Add per-IP request throttling to prevent abuse
3. **Live API** — Flip `EBAY_USE_MOCK=false` and set real credentials
4. **Error Boundaries** — Add React error boundary for graceful failure handling
5. **E2E Tests** — Add Playwright tests for full user flows
6. **Analytics** — Log search queries and filter usage to understand user behavior
7. **Deployment** — Deploy to Vercel (environment variables via dashboard)
