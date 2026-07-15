# SkyBook — Premium Flight Booking (Demo)

SkyBook is a portfolio/demo flight-booking platform built to look and feel like a
production travel site (Expedia/Google Flights-style). **It is not connected to any
real airline, GDS, or payment processor.** All flights, prices, availability, and
payments are simulated with deterministic mock data.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Firebase Authentication + Firestore (optional — see below)
- Framer Motion, React Hook Form + Zod, Zustand, Recharts, `qrcode`, `sonner`

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Demo mode vs. real Firebase

The app works out of the box with **zero configuration** using a local-demo auth
mode backed by `localStorage`: sign up, log in, save passengers/payment methods,
and book flights all work without any Firebase project.

A seeded demo admin account is created automatically in this mode:

- **Email:** `admin@skybook.demo`
- **Password:** `admin123`

To use a real Firebase project instead (Authentication + Firestore), create a
`.env.local` with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Once all of these are present, the app automatically switches to real Firebase
Auth + Firestore (see `src/lib/firebase/client.ts`). Data reads/writes go through
`src/lib/services/store.ts`, a thin layer that picks Firestore or `localStorage`
depending on whether Firebase is configured, so the rest of the app doesn't need
to know which backend is active. In real-Firebase mode, the first admin user
must have their `role` field set to `"admin"` directly in the `users` Firestore
collection (there's no self-serve admin signup).

## Feature overview

- **Homepage** — hero search widget (one-way / round-trip / multi-city, cabin
  classes), popular destinations, recent searches, promotions, featured airlines.
- **Search results** — mock flight generator, filters (stops, airline, price,
  departure/arrival window, refundable), sorting, per-leg selection for
  round-trip/multi-city.
- **Booking flow** — passenger info (React Hook Form + Zod), extras (seat map,
  meal, baggage, insurance, priority boarding), mock payment (card / PayPal /
  Apple Pay / Google Pay), confirmation with QR code, boarding pass page.
- **Dashboard** — upcoming/past/cancelled trips, booking detail, PDF download
  (browser print), cancellation, profile editing, saved passengers and mock
  saved payment methods.
- **Admin panel** (`/admin`, admin role required) — analytics (Recharts),
  flight CRUD, airline detail overrides, booking management, user role
  management, promotions and discount codes.
- **Extras** — dark/light mode, mock flight status lookup, favorite
  destinations, recently searched routes, toast notifications, loading
  skeletons.

## Project structure

```
src/
  app/            Next.js App Router routes
  components/     UI components grouped by feature area
  context/        Auth context (Firebase/local-demo)
  lib/data/       Mock airports, airlines, flight generator
  lib/services/   Firestore/localStorage data access
  lib/store/      Zustand stores (booking draft, search history)
  lib/validation/ Zod schemas
  types/          Shared TypeScript types
```

## Build

```bash
npm run build
npm run lint
```

Deploys cleanly to Vercel with no required environment variables (demo mode is
the default), and picks up real Firebase config automatically if provided.
