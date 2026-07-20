# SkyBook — Premium Flight Booking

SkyBook is a flight-booking platform built to look and feel like a production
travel site (Expedia/Google Flights-style). **It is not connected to any real
airline or GDS, and it has no payment system of any kind.** Booking a flight
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

- **Email:** `admin@skybook.com`
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

### Why real Firebase matters for QR verification

The QR-code booking verification feature (scan a boarding pass/itinerary QR
with a phone to open `/verify/{reference}`) needs a backend that's reachable
from *any* device, not just the browser that created the booking. In demo
mode, bookings live only in that one browser's `localStorage`, so a QR
scanned from a phone will always show "Booking not found" — there's nothing
wrong with the booking, the phone's browser simply has no data at all. Real
Firebase mode fixes this: bookings live in Firestore, shared across devices.

### Firestore security rules

Deploy `firestore.rules` (Firebase Console → Firestore Database → Rules, or
`firebase deploy --only firestore:rules` with the CLI) before using real
Firebase mode. It keeps the `bookings` collection owner/admin-only, and
exposes two narrow public mirrors instead of ever allowing an anonymous
client to list or read the full bookings collection:

- `bookingLookup/{reference}` — backs the sign-in-free `/manage-booking`
  page (reference + last name), gettable by exact reference only.
- `bookingVerification/{reference}_{token}` — backs the QR verification
  page, gettable only by the exact `reference_token` compound key, so a
  reference alone (e.g. read off a boarding pass) can never resolve a
  document.

Neither collection is ever listable, so there is no way to enumerate other
bookings through either public flow.

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
  round-trip/multi-city. Airport autocomplete shows country flags.
- **Booking flow** — passenger info (React Hook Form + Zod), extras (interactive
  seat map with available/unavailable/extra-legroom seats, meal, baggage,
  insurance, priority boarding), instant free confirmation with QR code,
  boarding pass page, downloadable PDF itinerary, and an email-style preview
  of what the confirmation email would look like.
- **My Trips** (`/dashboard`) — upcoming/past/cancelled trips, booking detail,
  PDF download (browser print), cancellation, rebooking, profile editing,
  saved passengers.
- **Manage Booking** (`/manage-booking`) — public, no-sign-in lookup by
  booking reference + passenger last name (like a real airline's "manage my
  booking"), with the same view/cancel/rebook actions as the dashboard.
- **Rebooking (demo)** — from My Trips, the booking detail page, or Manage
  Booking, "Rebook flight" lets you pick a new flight for an upcoming
  booking; the existing booking is updated in place (same reference) rather
  than creating a new one, and is marked "Rebooked".
- **Flight status** (`/flight-status`) — mock live status lookup by flight
  number and date (scheduled/boarding/departed/landed/delayed/cancelled).
- **Admin panel** (`/admin`, admin role required) — analytics (Recharts),
  flight CRUD with an editable ticket price field, airline detail overrides,
  booking management, user role management, promotions and discount codes.
- **Extras** — dark/light mode, favorite destinations, recently searched
  routes, toast notifications, loading skeletons.

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
