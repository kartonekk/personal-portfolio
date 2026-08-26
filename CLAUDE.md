@AGENTS.md

# Project rules

- Do not add a "Co-Authored-By: Claude" (or similar) trailer to commits in this repo.
- Do not write comments in code. No exceptions.
- Whenever you edit something, write documentation for it into this file instead (see Documentation below). Keep it current — update the relevant entry when the thing it describes changes, don't just append forever.

# Documentation

## Structure

- `content/site.ts` — every piece of copy on the page (name, availability, headline, subhead, button labels, section titles, "Working with" label, share-panel text). Edit text here, not in components. Exception: the footer year (see Footer below).
- `lib/links.ts` — functional endpoints: real URLs and the usernames used for API calls, plus `siteUrl` (canonical origin of this site) and `profiles` (the list fed to the structured-data `sameAs`). Kept separate from `content/site.ts` so editing display copy can never accidentally break a link or an API call.
- `lib/schema.ts` — builds the JSON-LD (`Person` + `WebSite`) from `content/site.ts` and `lib/links.ts`. No literals of its own.
- `lib/data.ts` — server-side data fetching only (Modrinth, CurseForge, GitHub contributions, GitHub languages). Runs in Server Components, so none of it is subject to browser CORS. Each fetch revalidates hourly (`REVALIDATE_SECONDS`).
- `lib/format.ts` — `groupDigits(n)` splits a number into groups of 3 from the right (e.g. `1234567 -> ["1", "234", "567"]`) so the UI can render each group as its own span with a gap between them, instead of a plain comma-formatted string.
- `components/` — one `.tsx` + matching `.module.css` per section. Only `Hero.tsx`, `SharePanel.tsx`, and `FallingPlayer.tsx` are client components (`"use client"`) — the avatar crossfade and the expandable-QR modal both need `useState`. Everything else is a plain server component.

## `lib/data.ts` — `getActivity`

The `github-contributions-api.jogruber.de` endpoint does **not** return one continuous ascending timeline. It returns whole calendar-year blocks ordered newest-year-first (all of 2026, then all of 2025, ... down to 2021), each block internally ascending. A naive `.slice(-days)` grabs the tail of the *oldest* block instead of the most recent days — this was a real bug (see git history), not just a display issue. `getActivity` sorts all entries by date, drops future-dated placeholder days, then takes the real last `days` entries.

## `lib/data.ts` — `getCurseForgeDownloads`

CurseForge has no public API without a key, and its own `/api/v1/*` endpoints are Cloudflare-blocked (403) for server-side fetches. So the member page is read through `r.jina.ai`, which renders it to markdown.

The profile header total is **abbreviated** by CurseForge itself — it renders `1.0K Downloads`, not `1,038 Downloads`. The original regex was `/([\d,]+)\s*Downloads/i`, which cannot match across the `K`, so it returned `null` and the whole CurseForge stat silently vanished. Two things fixed that:

- Primary path sums the **per-project** counts, which the member page prints unabbreviated (`605`, `369`, `64`). In the jina markdown each project block is `By[user](…/members/…)` followed by a bullet list whose first item is that project's download count — `CURSEFORGE_PROJECT_COUNT_RE` anchors on that pair. Exact, one HTTP request.
- Fallback is the header total, now via `CURSEFORGE_TOTAL_RE`, which accepts a `K`/`M` suffix and a decimal point. Used only if the per-project regex matches nothing (i.e. jina's markdown shape changed).

Both go through `parseAbbreviatedCount`, which strips commas and multiplies by the `K`/`M` factor.

Rejected alternative: `api.cfwidget.com` returns exact per-project totals, but it indexes projects lazily and 404s indefinitely on recently-created ones (`/minecraft/mc-mods/tiny-players` still 404s), so it can't cover a full project list. Its author endpoints (`/author/kartonekk`, `/author/search/kartonekk`) don't work at all.

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

## `content/site.ts` — `headline`

`headline` is a single field, `lead`. It used to be a three-part line (`lead` + colored `accent` word + `tail`, e.g. "Full-stack developer, / **modder** after hours."); the copy was collapsed to just the name, but `Hero.tsx` still read `headline.accent` and `headline.tail`, which no longer existed — so the `<h1>` rendered the name followed by a stray `<br />` and an empty accent span. `Hero.tsx` now renders `headline.lead` alone, wrapped in `.accentWord` so the display face keeps the accent color. Adding a second line back means adding both the field here and the markup there.

## Structured data / SEO

Search engines get three things, all generated from the existing content files — nothing is hardcoded twice:

- `components/JsonLd.tsx` renders one `<script type="application/ld+json">` (rendered from `app/page.tsx`, per the Next 16 JSON-LD guide in `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`). It emits an array of two nodes: a `Person` (`@id` `{siteUrl}/#person`) and a `WebSite` whose `publisher` points back at that `@id`, so the two are linked rather than floating separately. `serializeJsonLd` escapes `<` as `<` — required, since the payload goes through `dangerouslySetInnerHTML`.
- `app/layout.tsx` sets `metadataBase`, `alternates.canonical: "/"`, and OpenGraph/Twitter cards.
- `app/robots.ts` and `app/sitemap.ts` are the Next file conventions; both read `siteUrl`.

To change what the schema claims:

- **Which profiles are "the same person"** — `profiles` in `lib/links.ts`. Only list pages you control that link back to `siteUrl`; a one-way `sameAs` is ignored, and listing someone else's profile is worse than listing none. Discord and Signal are deliberately absent — neither is a crawlable profile page.
- **Names** — `site.name` is canonical; `site.seo.alternateNames` declares the other spellings (e.g. `Kartonekk`) as the same entity. `getPersonSchema` drops any entry equal to `site.name`, and emits a bare string instead of an array when only one survives.
- **Job title** — `site.seo.jobTitle`, also reused in the page `<title>` and OG title.
- **Canonical URL** — `siteUrl` in `lib/links.ts`. It must be the real address this page is served from; it feeds the schema `url`/`@id`, the canonical link, `sitemap.xml`, and `robots.txt`.

`knowsAbout` reuses `site.now.knownStack`, and `description` reuses `site.subhead`, so schema text can't drift from visible page text — which matters, since structured data that doesn't match visible content gets discounted.

## Falling player animation

`components/FallingPlayer.tsx` — a 3D Minecraft player (WebGL) drops from above the viewport on the right, takes fall damage, looks around, then sprint-jumps off the right edge. Desktop only (hidden under 860px) and hidden under `prefers-reduced-motion`, same as the other components' motion.

**Head and turn easing.** Head movement is not an exponential lerp toward a target — that shape is either sluggish or snappy, never both, and it never truly arrives. Each look move instead interpolates from the yaw/pitch it started at to the target over `LOOK_MOVE_TICKS` with a smoothstep, so it accelerates out and decelerates in, lands exactly on the target, then holds. The look phase does not end on a tick count. It ends when the *last* target has been reached and held (`LOOK_TICKS` is only a fallback ceiling), because cutting away mid-sweep leaves the head moving at speed and the run's smoothstep restarts it from zero — a velocity discontinuity that reads as a stutter even though the angle itself is continuous. The final look target also points roughly where he is about to run (`yaw 1.25` against a run heading of `PI/2`), so the turn is anticipated rather than sprung. Leaving for the run reuses the same curve: `TURN_TICKS` of smoothstep drives the body yaw to profile, eases the head back to centre from wherever it was looking, while sprint speed ramps on its own, shorter curve (`ACCEL_TICKS`, 4 ticks) — so the turn, the head recentre, and the first step ramp together instead of the pose snapping into the walk cycle. `fromYaw`/`fromPitch` exist to capture the pose at each transition; without them an interrupted turn would jump.

**Trigger.** It does not run on load. The effect binds `mouseenter` — enter only, never `mouseover`, `mousemove`, or `mouseleave` — to every `[data-mc-trigger]` element — currently the whole Side Projects card (description, both store links, and the download counts) — and hovering one starts the sequence. Marking another element is an attribute, not a code change. Re-hovering mid-run does nothing; the sim returns to `idle` (hidden) once the player leaves the screen, and only then can it fire again.

**Rendering.** `skinview3d` (which pulls `three`) builds the textured player model from `public/skin.png` — it handles skin UV mapping, the overlay/hat layer, slim vs classic arms, and legacy 64x32 skins, which is the entire reason it's worth a dependency. It is imported with a dynamic `await import("skinview3d")` inside the effect, so `three` lands in a lazy chunk instead of the initial bundle.

**The animation is the game's own math, not hand-authored keyframes.** An earlier version invented poses (arms flailing on the way down, a landing crouch, floating damage hearts) and read as fake, because none of that is what vanilla actually does. What's here now mirrors `HumanoidModel.setupAnim` and `LivingEntity`:

- A fixed 20 tps simulation (`TICK_MS`), advanced in a `while` loop against real elapsed time so the sim is framerate-independent — a 144Hz screen and a 60Hz screen run identical animation. Rendering is **not** locked to that: the loop keeps a `prev` snapshot and renders `interpolate(prev, sim, carry / TICK_MS)`, which is Minecraft's own partial-tick rendering. Without it everything visibly moves at 20fps no matter the display, because a tick-quantised pose is all the renderer ever sees — that, not GPU load, is what made an earlier version look choppy.
- Gravity is Minecraft's integration, in blocks per tick, **in the game's order**: move first (`y += vy`), *then* apply `vy = (vy - 0.08) * 0.98`. The order is not cosmetic — applying gravity first throws away a tick of full velocity and caps a jump at 0.83 blocks; the correct order gives the vanilla 1.25-block jump apex, which is the number every Minecraft player has internalised.
- `limbSwing` / `limbSwingAmount` are the game's own: the amount eases toward `min(horizontalSpeed * 4, 1)` by `0.4` per tick, the position accumulates the amount. Limb rotations are then `cos(limbSwing * 0.6662) * amount` (arms) and `* 1.4 * amount` (legs), with the two sides a half-cycle apart. Because the amount decays to zero when not moving horizontally, **the falling player is not flailing** — vanilla has no falling pose, and that stillness is the thing that reads as authentic.
- The constant idle arm sway (`cos(age * 0.09) * 0.05 + 0.05` on z, `sin(age * 0.067) * 0.05` on x) is Minecraft's, and is most of why a standing model looks alive rather than frozen.
- Fall damage tints every material red and fades it out over `HURT_TICKS` (7), plays both the fall sound and the player hurt sound, and kicks `vy` up by `HURT_HOP` so the damage bumps him off the ground — gravity then brings him down, and the `hurt` stage does not end until he is grounded again. No crouch, no squash, no hearts: vanilla does none of those. Hearts only ever appear for breeding.
- Footsteps fire off `moveDist`, the same accumulator the game uses (`moveDist += distance * 0.6`, step when it passes the next integer), not a fixed interval.
- He **sprints** off, not walks: `SPRINT_SPEED` is `0.2806` blocks/tick (5.612 b/s — vanilla walk 4.317 x 1.3), which pushes `limbSwingAmount` past its `1.0` cap, so the limbs run at full swing.
- He **bhops** the whole way out: from `JUMP_AT_TICK` onward he jumps again `JUMP_GAP_TICKS` after every landing, each with the real `0.42` jump velocity plus the sprint-jump forward impulse (`SPRINT_JUMP_BOOST`, decayed per tick) — so he covers ground faster than flat sprinting, exactly like the 1.8 movement everyone actually used. Footstep sound and dust fire on the landing, and `moveDist` only accumulates while grounded, so no phantom mid-air steps.
- **Head yaw is absolute (world), not local.** `sim.headYaw` is where he is looking in world space; the renderer subtracts `bodyYaw` and clamps the remainder to `HEAD_YAW_CLAMP`, which is exactly the game's `netHeadYaw`. Storing it as a local angle is what caused a visible unnatural snap: the head sat inside the already-rotated player group, so a body-follow rotation *added* to the head's turn instead of absorbing it, and the two compounded. Body-follow now eases `bodyYaw` toward `headYaw -/+ clamp` rather than accumulating an offset per tick, and the run phase turns the head toward `bodyYaw` (aligned with travel) rather than toward zero.
- The fall is a **tumble**: the body sweeps `+/-FALL_SPIN_SWEEP` (~66 degrees) around its start yaw on a sine, rather than rotating a full 360. A continuous spin was tried and looks wrong for this camera — half of every revolution shows his back, and because head yaw is clamped to 75 degrees off the body he physically cannot keep facing the viewer through it. The head instead holds an absolute yaw near zero (facing the camera) with a slow sweep, so the body tumbles under a head that stays looking at whoever's reading the page. The arms stay in the idle sway throughout: a vanilla attack-swing loop was built here and removed on request, so `pose()` deliberately has no attack animation and no `punch` state.
- Impact **squash**: landing sets `squash` to 1 (0.55 for the lighter sprint-jump landing) and it decays by `SQUASH_DECAY` each tick, driving `scale.y` down by `SQUASH_Y` and `scale.x/z` up by `SQUASH_XZ`. Not a vanilla effect — the game has no squash — but it sells the impact. The scale is applied about the model's origin, which is *not* its feet (they are at `FEET_UNITS`), so `position.y` is offset by `FEET_UNITS * (1 - scaleY)` in the same frame; without that compensation the squash lifts him off the ground instead of flattening him against it.
- On landing, `bodyYaw` is wrapped back into -PI..PI (carrying `headYaw` with it) so an accumulated tumble angle doesn't make the run phase unwind most of a turn.
- The head has **two axes only** — `rotation.set(pitch, yaw, 0)`. Minecraft heads have `xRot` and `yRot` and no roll, so any z-tilt instantly reads as fake to a player; an early version had a small `rotation.z` wobble and that was exactly why. Pitch is clamped to +/-90 degrees (`HEAD_PITCH_CLAMP`) like the game's, and looking past 75 degrees of yaw (`HEAD_YAW_CLAMP`) drags the body around with the head rather than letting the neck exceed it. One look target deliberately overshoots the yaw clamp so the body-follow is visible.
- Dust particles: 3px pixel squares in stone greys, plain DOM spans on the stage animated by one CSS keyframe and removed on `animationend` — no per-frame JS, nothing to leak. Two kinds: `trail` (behind the heel, a shallow backward cone, 1 every other tick while sprinting plus 2 per footstep) and `land` (spread sideways along the ground, 10 on the damage landing, 6 on the jump landing). Neither fountains upward — vertical drift is within a few px of zero, because block particles in-game skitter along the floor rather than spraying up.

  **Where the feet actually are** is not guessable and was got wrong twice. The model is not centred in the canvas: in `skinview3d`'s local space the head pivot is at `y = 0` and the legs bottom out at `y = -18` (`FEET_UNITS`), so the model straddles the origin asymmetrically and ~62px of the 340px canvas is empty below the feet. Both the particle spawn point and the rig's `bottom` offset come from projecting the point `(0, FEET_UNITS, 0)` through `viewer.camera` — the same projection the renderer uses, so it stays correct if `zoom`, `fov`, or the canvas size change. The CSS `bottom: -3.9rem` is only a pre-JS approximation of that; the effect overwrites it with the exact value once the viewer exists. Getting this wrong doesn't misplace the dust alone — it also decides whether he lands *on* the bottom edge of the viewport or floats above it. They are plain DOM spans on the stage animated by one CSS keyframe and removed on `animationend`, so no per-frame JS and nothing to leak.

Screen-space movement is applied as a `translate3d` on the `.rig` wrapper from the sim's block coordinates; body movement (limbs, head, turn) is 3D rotation on `viewer.playerObject`. `blockPx` converts between the two and is derived from the camera at runtime (`visibleUnits` from fov and camera distance, 16 units per block), so changing `zoom` or `fov` cannot silently desync the fall distance from what's on screen.

`SkinViewer` runs with `renderPaused: true`, driven from our own `requestAnimationFrame` loop.

**Audio.** Playback goes through one `AudioContext` (`createSfx`), not `new Audio()` per sound. The three files are fetched and `decodeAudioData`-ed once at mount, then each hit plays a fresh `BufferSource` through a gain node — no per-play decode hitch, and overlapping sounds work (fall + hurt fire on the same tick).

**The whole soundtrack is scheduled up front, not played from the animation.** On trigger, `scheduleAudio` runs a throwaway copy of the sim (`ghost`, fed a no-op `Events`) forward to the end and calls `sfx.play(sound, delay)` for every event it finds, where `delay` is `tick * TICK_MS / 1000`. Those become `source.start(currentTime + delay)` on the audio clock. The reason is alt-tab: `requestAnimationFrame` stops in a hidden tab, so an animation-driven sound would simply never fire, but the audio clock keeps running and pre-scheduled sources play on time regardless — the same reason a backgrounded video keeps its audio. `events.onLand`/`onStep` are therefore empty; only dust is driven from the live sim (particles in a hidden tab would be pointless anyway).

This is only sound because the sim is **deterministic** — no input, no randomness outside the dust jitter — so the ghost run and the visible run produce identical timings. Anything that makes the animation depend on live state (cursor position, viewport resize mid-run, a random jump interval) breaks that equivalence and the audio would drift out of sync. A typical run schedules 5 events over ~5.7s. `PLAN_TICK_LIMIT` caps the ghost loop so a bug can never spin it forever.

`stageOf()` exists for a TypeScript reason: after `ghost.stage = "fall"`, TS narrows the property to that literal and keeps the narrowing across the `stepSim` call, so `ghost.stage === "hurt"` is rejected as a non-overlapping comparison. Reading it through a function typed to return `Stage` restores the full union.

Browsers still refuse to start an audio context until the user has interacted with the page, and **hover is not an interaction** for that policy. The context is resumed from `pointerdown`, `keydown`, and the first `pointermove` anywhere on the page, and every `play()` calls `resume()` first, so a still-locked context recovers at the next gesture rather than staying dead. A visitor who hovers with no prior interaction gets the animation silently; a missing or undecodable file degrades the same way. A browser with no `AudioContext` falls back to `Audio` elements with `setTimeout` for the delay.

**Assets.**

- `public/skin.png` — the Minecraft skin texture. Currently a **generated placeholder** (a Steve-ish stand-in built with `sharp`), meant to be overwritten with a real skin export. Same filename, no code change.
- `public/sounds/fall.ogg`, `hurt.ogg`, `step.ogg` — fall sound, player hurt sound, footstep. `fall.ogg` and `hurt.ogg` fire together on landing, which is what vanilla does: `causeFallDamage` plays the fall sound, and the damage it deals separately triggers the player hurt sound. Volumes are `0.85 / 1.0 / 0.5` — `fallbig.ogg` is a quiet recording and was inaudible at the original 0.45.

The sounds are Minecraft's real ones — `damage/fallbig.ogg`, `damage/hit1.ogg`, `step/stone1.ogg`, sha1s in `public/sounds/CREDITS.md`. They came from the **local game install**, not the web: `%APPDATA%/.minecraft/assets/indexes/<n>.json` maps every asset path to a sha1, and the file itself sits at `assets/objects/<first-2-hex>/<sha1>` with no extension. `minecraft.wiki/images/*.ogg` was tried first and is a dead end for scripted fetches — Cloudflare returns a 403 "Please wait" JS challenge regardless of browser headers (same wall as CurseForge, above). The asset store needs no network and no challenge-solving, so prefer it for any further game asset. Mojang's copyright, used as fan content.

A harmless `THREE.WebGLProgram ... Sample Bias value is limited to the range` warning appears in the console on some GPUs; it comes from three's texture LOD bias, not from this code.
