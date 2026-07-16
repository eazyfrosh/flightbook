# SkyBook — Premium Flight Booking (Demo)

SkyBook is a portfolio/demo flight-booking platform built to look and feel like a
production travel site (Expedia/Google Flights-style). **It is not connected to any
real airline or GDS, and it has no payment system of any kind.** Booking a flight
is completely free — all flights, prices, and availability are simulated with
deterministic mock data.

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
mode backed by `localStorage`: sign up, log in, save passengers, and book flights
all work without any Firebase project.

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

## Booking flow

There is no payment step anywhere in the app. Booking a flight is:

**Search Flights → Select Flight → Passenger Information → Extras → Booking Confirmation**

A user must be signed in to complete the final "Confirm booking" step (so the
booking can be attached to their account and shown on their dashboard), but no
payment method is ever collected. The Booking Confirmation page shows:

- Booking reference
- Passenger details
- Flight details (airline, departure & arrival, seat number)
- Extras selected
- Ticket price (taken directly from the flight record) and total
- A QR code
- A downloadable PDF itinerary (via the browser's print dialog)

## Feature overview

- **Homepage** — hero search widget (one-way / round-trip / multi-city, cabin
  classes), popular destinations, recent searches, promotions, featured airlines.
- **Search results** — mock flight generator, filters (stops, airline, price,
  departure/arrival window, refundable), sorting, per-leg selection for
  round-trip/multi-city.
- **Booking flow** — passenger info (React Hook Form + Zod), extras (seat map,
  meal, baggage, insurance, priority boarding), instant free confirmation with
  QR code, boarding pass page, downloadable PDF itinerary.
- **Dashboard** — upcoming/past/cancelled trips, booking detail, PDF download
  (browser print), cancellation, profile editing, saved passengers.
- **Admin panel** (`/admin`, admin role required) — analytics (Recharts),
  flight CRUD with an editable ticket price field, airline detail overrides,
  booking management, user role management, promotions and discount codes.
- **Extras** — dark/light mode, mock flight status lookup, favorite
  destinations, recently searched routes, toast notifications, loading
  skeletons.

## Project structure

```
src/
  app/            Next.js App Router routes
  components/     UI components grouped by feature area
  context/        Auth context (Firebase/local-demo)
  lib/data/       Mock airports, airlines, flight generator, extras pricing
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
