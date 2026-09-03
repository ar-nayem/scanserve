# ScanServe

QR code ordering and payment system for restaurants and food carts. Customers scan a QR
code at their table, browse the menu on their phone, order, and pay — no app download.
Owners manage the menu, watch orders come in, create discount vouchers, and generate/print
QR codes for their tables.

This is a **v1 demo build**: single restaurant, local JSON file storage, simulated
payments, and a single shared admin password. See the "Before this handles real money"
section below for what has to change first.

## Run it locally

```bash
npm install
npm run dev
```

Runs on port **4310** (pinned in `package.json`, not the default 3000) so it doesn't
collide with other local dev servers.

Open [http://localhost:4310](http://localhost:4310) — that's the customer menu (no table
number). To see the table-aware version, open `http://localhost:4310/?table=5`.

Owner dashboard: [http://localhost:4310/admin](http://localhost:4310/admin/login)
Default password: `changeme123`

## Changing the admin password

Copy `.env.local.example` to `.env.local` and set `ADMIN_PASSWORD`:

```bash
cp .env.local.example .env.local
```

```
ADMIN_PASSWORD=your-new-password
```

Restart `npm run dev` after changing it.

## Deploying to Vercel (so QR codes actually work)

QR codes encode a URL like `https://your-app.vercel.app/?table=5`. That only works once
the app is on a real public URL — `localhost` QR codes only work on the phone that's
running the dev server.

1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In the Vercel project's Environment Variables, set:
   - `ADMIN_PASSWORD` — your real dashboard password
   - `NEXT_PUBLIC_BASE_URL` — your Vercel URL, e.g. `https://scanserve-yourname.vercel.app`
     (set this *after* the first deploy once you know the URL, then redeploy)
4. Deploy. Generate QR codes from `/admin` → QR Codes tab — they'll now encode the real
   public URL and work when scanned from any phone.

**Storage note:** Vercel's filesystem is read-only/ephemeral in production, so the
`/data/*.json` files will reset on every deploy and won't persist writes reliably across
serverless invocations. This is fine for a live demo, but before real restaurant use you
need a real database — see below.

## Where to plug in real payments

`lib/payment.ts` currently simulates a successful payment after a short delay. The
checkout flow (`app/api/payment/create`, `app/api/payment/verify`, and the customer cart's
"Place Order & Pay" button) only ever calls `createPayment()` / `verifyPayment()` from that
file — swap their internals for a real gateway and nothing else needs to change.

Bangladesh restaurants typically use one of:

- **SSLCommerz** — https://developer.sslcommerz.com/ — bundles bKash, Nagad, Rocket, and
  cards behind one API. Credentials go in `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASSWORD`.
- **ShurjoPay** — https://shurjopay.com.bd/ — similar aggregator. Credentials go in
  `SHURJOPAY_USERNAME` / `SHURJOPAY_PASSWORD` / `SHURJOPAY_MERCHANT_ID`.

Both env var sets are already stubbed in `.env.local.example`. See the `TODO` comments at
the top of `lib/payment.ts` for the exact integration points.

## Before this handles real money / real restaurants

This build intentionally cuts corners to get a demo in front of restaurant owners fast.
Before onboarding a paying restaurant:

- **Auth**: `/admin/login` is a single shared password stored in an env var, checked
  against an httpOnly cookie (see `lib/auth.ts`). Replace with real auth (Supabase Auth or
  NextAuth) so each owner has their own account.
- **Payments**: wire up SSLCommerz/ShurjoPay as above instead of the simulated flow in
  `lib/payment.ts`.
- **Storage**: swap local JSON files for a real database. The app already isolates all
  data access behind the `DataRepository` interface in `lib/repository.ts` — write a new
  implementation (e.g. `lib/data/supabaseRepository.ts`) and change the one export in
  `lib/data/index.ts`. Nothing in `app/` or `components/` needs to change.
- **Multi-tenant**: this build serves ONE restaurant. To support many, add a
  `restaurantId` field to `MenuItem`, `Order`, and `Voucher` (see comments in
  `lib/types.ts`), scope every repository query by it, and encode QR codes as
  `?restaurant=X&table=N` instead of `?table=N` (see `app/api/qr/route.ts`).

## Project structure

```
app/
  page.tsx                      customer menu (?table=N)
  order-confirmation/[orderId]  order confirmation page
  admin/login                   owner login
  admin/page.tsx                owner dashboard (protected)
  api/menu, api/orders,
  api/vouchers, api/payment,
  api/qr, api/auth              API routes
components/
  customer/                     menu browser + cart drawer
  admin/                        dashboard tabs (menu/orders/vouchers/QR)
lib/
  types.ts                      MenuItem / Order / Voucher models
  repository.ts                 storage-agnostic data interfaces
  data/jsonRepository.ts        JSON-file implementation
  payment.ts                    payment stub (swap for SSLCommerz/ShurjoPay)
  auth.ts, apiAuth.ts            admin password gate
data/
  menu.json, orders.json, vouchers.json   seed data + live data
```
