@AGENTS.md

# Project rules

- Do not add a "Co-Authored-By: Claude" (or similar) trailer to commits in this repo.
- Do not write comments in code. No exceptions.
- Whenever you edit something, write documentation for it into this file instead (see Documentation below). Keep it current — update the relevant entry when the thing it describes changes, don't just append forever.

# Documentation

## Structure

- `content/site.ts` — every piece of copy on the page (name, availability, headline, subhead, button labels, section titles, "Working with" label, share-panel text). Edit text here, not in components. Exception: the footer year (see Footer below).
- `lib/links.ts` — functional endpoints: real URLs and the usernames used for API calls. Kept separate from `content/site.ts` so editing display copy can never accidentally break a link or an API call.
- `lib/data.ts` — server-side data fetching only (Modrinth, CurseForge, GitHub contributions, GitHub languages). Runs in Server Components, so none of it is subject to browser CORS. Each fetch revalidates hourly (`REVALIDATE_SECONDS`).
- `lib/format.ts` — `groupDigits(n)` splits a number into groups of 3 from the right (e.g. `1234567 -> ["1", "234", "567"]`) so the UI can render each group as its own span with a gap between them, instead of a plain comma-formatted string.
- `components/` — one `.tsx` + matching `.module.css` per section. Only `Hero.tsx` and `SharePanel.tsx` are client components (`"use client"`) — the avatar crossfade and the expandable-QR modal both need `useState`. Everything else is a plain server component.

## `lib/data.ts` — `getActivity`

The `github-contributions-api.jogruber.de` endpoint does **not** return one continuous ascending timeline. It returns whole calendar-year blocks ordered newest-year-first (all of 2026, then all of 2025, ... down to 2021), each block internally ascending. A naive `.slice(-days)` grabs the tail of the *oldest* block instead of the most recent days — this was a real bug (see git history), not just a display issue. `getActivity` sorts all entries by date, drops future-dated placeholder days, then takes the real last `days` entries.

## `content/site.ts` — `now.knownStack`

GitHub's public repos API can only ever see public, language-tagged repos. Private repos and non-GitHub work (e.g. Minecraft mod source published to Modrinth/CurseForge rather than GitHub) are structurally invisible to it — there's no way around that without exposing a personal access token client-side, which this app deliberately does not do. `now.knownStack` is where we declare facts that are true but that GitHub can't see; `lib/data.ts`'s `getStack()` merges this list with whatever real languages the live API call finds, de-duplicated.

## Avatar interaction

The avatar was originally a 3D `rotateY` flip card (photo front, QR back), matching the old static site. That looked wrong once a hard offset shadow was added under it (the shadow doesn't rotate with a 3D-transformed element, so it visually detached from the card mid-flip). Replaced with a crossfade + slight scale between the two faces — same click/keyboard-toggle interaction, no 3D transform, so the static shadow always sits correctly under it.

## Favicon

`app/icon.tsx` fetches `site.avatarUrl` (revalidate 3600s, matching `REVALIDATE_SECONDS`), resizes it with `sharp` to a real 32x32 PNG, and serves that as the site icon — so the browser tab favicon always matches the Hero avatar automatically, no separate icon file to keep in sync. Declared metadata (`size`, `contentType`) must match the actual bytes returned: an earlier version proxied the raw fetched image untouched (source is a 640x640 JPEG) while still declaring `size: 32x32`/default PNG type, and browsers silently reject icons whose declared metadata doesn't match reality — no error, they just fall back to requesting `/favicon.ico` directly. `app/favicon.ico` still exists as the static legacy fallback; the two don't conflict, `icon.tsx` wins in browsers that support the `icon` file convention.

## Footer

`Footer.tsx` renders `{site.name} · {year}` where `year` is `new Date().getFullYear()` — not stored in `content/site.ts`, so it never goes stale. There used to be a hardcoded `site.footer` string; removed in favor of this.

## Heatmap tooltips

Each activity-heatmap cell has a native `title` attribute with the real date and contribution count (e.g. "Jul 28, 2026: 3 contributions"), backed by `ActivityDay[]` from `getActivity` (date + count, not just count). Plain native tooltip, no custom JS — kept simple since a browser tooltip was enough to satisfy the ask.
