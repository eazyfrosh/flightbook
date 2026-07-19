# Airline logos

Real airline logos are served live from [logo.dev](https://logo.dev)'s Logo
API, looked up by each carrier's official domain. The mapping lives in
`src/lib/data/airlines.ts` (`logoDevUrl()` + each airline's `logoSrc`); the
publishable key is `NEXT_PUBLIC_LOGO_DEV_TOKEN` in `.env.local`.

`AirlineLogo` (`src/components/ui/airline-logo.tsx`) loads whatever
`logoSrc` resolves to and falls back to a generated brand-color monogram
badge automatically if it's unset (no token configured) or fails to load
(`fallback=404` is passed to logo.dev so a real failure reaches our own
fallback instead of logo.dev's built-in monogram) — so the UI never shows a
broken image either way.

This directory is kept as a fallback path: if you'd rather self-host a
specific airline's logo instead of pulling it from logo.dev (e.g. one isn't
resolving well), drop a file here and point that airline's `logoSrc` in
`src/lib/data/airlines.ts` at `/airlines/<file>` instead of
`logoDevUrl(...)`.

## Asset guidelines (if self-hosting a file here)

- **Format:** SVG preferred (crisp at any size, tiny file size, prints
  cleanly in the PDF itinerary). PNG also works.
- **Background:** transparent — logos render inside a white rounded tile.
- **Crop:** trim to the mark's visible bounds; the component adds its own
  padding around every logo.
