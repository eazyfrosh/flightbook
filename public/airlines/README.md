# Airline logo assets

This folder is the single place official airline logo files live. The
mapping in `src/lib/data/airlines.ts` (`logoSrc` field) points each airline
at a file here; `AirlineLogo` (`src/components/ui/airline-logo.tsx`) loads
it and falls back to a generated monogram badge automatically if the file
is missing or fails to load, so the UI never breaks while assets are added
incrementally.

Drop a file at each path below to make that airline's real logo appear
everywhere in the app (homepage, search results, flight cards, booking
confirmation, boarding pass, PDF itinerary, verification page, My Trips,
Manage Booking, admin) with no code changes required.

| Airline             | Expected file                  |
| -------------------- | ------------------------------- |
| American Airlines    | `american-airlines.svg`         |
| British Airways      | `british-airways.svg`           |
| Delta Air Lines       | `delta.svg`                     |
| United Airlines      | `united.svg`                    |
| Emirates             | `emirates.svg`                  |
| Qatar Airways        | `qatar-airways.svg`             |
| Lufthansa            | `lufthansa.svg`                 |
| Air France           | `air-france.svg`                 |
| KLM                  | `klm.svg`                       |
| Turkish Airlines     | `turkish-airlines.svg`          |
| Virgin Atlantic      | `virgin-atlantic.svg`           |
| Singapore Airlines   | `singapore-airlines.svg`        |
| Etihad Airways       | `etihad.svg`                    |
| Cathay Pacific       | `cathay-pacific.svg`            |
| Japan Airlines       | `japan-airlines.svg`            |

## Asset guidelines

- **Format:** SVG preferred (crisp at any size, tiny file size, prints
  cleanly in the PDF itinerary). PNG is also supported — just update the
  matching `logoSrc` extension in `src/lib/data/airlines.ts` if you use it.
- **Background:** transparent. Logos render inside a white rounded tile,
  so a transparent background keeps edges clean in both light and dark
  theme.
- **Crop:** trim to the mark's visible bounds (no extra padding) — the
  component adds its own consistent padding around every logo.
- **Size:** any resolution works since logos are displayed at small sizes
  (24–40px) and scaled with `object-fit: contain`, but keep raster (PNG)
  exports reasonably sized (under ~50KB) for performance.

To add or change a logo path, edit only `src/lib/data/airlines.ts` —
nothing else needs to change.
