# Plan: client-company objects as real background/scene elements (Zalaris)

## Context / what this is for

Zalaris's audience is HR/payroll professionals from ten named client companies (see `esitis-data.js:134`): Metsä Group, Stora Enso, Finnair, DNA, Gigantti, Ericsson, Siemens, Santander, Danske Bank, UPM. Jarno wants a small, subtle nod to each company's product hidden in the background artwork on genuinely positive/upbeat-toned stops — something an attentive audience member might notice and enjoy, not a sponsor banner.

## What was tried first, and why it didn't work

A first attempt added a `#piilotettuEsine` DOM element in `Zalaris/esitys-2d.html` — a `position:fixed` UI-layer icon (emoji, or one hand-drawn SVG for Siemens) that fades in over a stop's screen corner, driven by a `piilotettuEsine: { tyyppi, puoli }` field on the matching stop in `esitys-data.js`. It technically worked (verified live on all 10 stops, no collisions, no console errors) but **missed the actual intent**:

- Jarno's own words: *"my idea was that they would be part of backgrounds, scenes, not like small objects every now and there."* A `position:fixed` overlay is screen-anchored — it doesn't scroll or parallax with the world, so it reads as a HUD icon bolted onto the screen, not as something that belongs to the pixel-art scenery the way the existing Trump/White House illustration or the Tampella factory silhouette do.
- The Finnair plane used the ✈️ emoji glyph, animated via a CSS `translateX` keyframe **independent of the actual camera/world** — Jarno: *"plain did not look at all like flying plane."* A generic emoji at small size, moving in a straight line unrelated to the scene's own parallax, doesn't read as an aircraft in that sky.

**This existing implementation should be treated as superseded, not built on.** It's currently live in `Zalaris/esitys-2d.html` (`#piilotettuEsine` CSS block, its HTML `<div>`, `piilotettuEsineEl`/`PIILOTETUT_ESINEET`/`naytaPiilotettuEsine()` in the JS, two `naytaPiilotettuEsine(...)` call sites) and `Zalaris/esitys-data.js` (`piilotettuEsine:` field on 10 stops). Whoever builds the new version should remove all of that as step 1, to avoid two competing mechanisms.

## What "part of the scene" actually means here — the right mechanism

This codebase already has the correct pattern for this, used elsewhere in the same file: **world-anchored `HAHMOKERROKSET` entries** in `Zalaris/esitys-2d-hahmot.js`, the same mechanism behind the White House illustration and the Tampella factory silhouette. Concretely (existing real example, `esitys-2d-hahmot.js:415-416`):

```js
{ x: 7740, kuva: 'kuvat/trump.png', kiintea: true, puoli: 'keski', pysty: 'ala', korkeusProsentti: 0.5, syvyysSuhde: 0.45 },
{ x: 7740, kuva: 'kuvat/whouse.png', korkeusProsentti: 0.7, scrollFactor: 3.2, syvyysSuhde: 0.35, yProsentti: 0.2, ankkuri: { x: 0.6, y: -0.1 } },
```

The **second** line is the one that matters here: no `kiintea` — this is a *world-anchored* image. `scrollFactor` controls how fast it moves relative to camera pan (parallax depth), `syvyysSuhde` controls which background layer it sits in front of/behind, `yProsentti`/`ankkuri` control vertical placement. An image like this scrolls and sits *inside* the scene the way real scenery does — exactly the effect Jarno is asking for.

For the nine static company items, each becomes **one world-anchored `HAHMOKERROKSET` entry**, placed like a sign/poster/crate/prop that belongs to that scene's own city/forest/hill artwork — not a UI icon. Use `vainPysahdys: <x>` (same field already used for the Tampella silhouette) so it's only visible during its one assigned stop, not for the whole scene's duration.

For **Finnair**, the fix is two things at once:
1. A real airplane silhouette graphic (small side-view commercial-jet shape, flat single-color fill matching the pixel-art palette) — not the ✈️ emoji.
2. Positioned high in the sky with a **low `scrollFactor`** (distant/background parallax depth, similar to how far elements like a moon/cloud layer would be handled in this engine) so it drifts believably as the camera scrolls through the stop — driven by the scene's own parallax math, not a CSS animation running independent of the world.

## Asset requirement — must actually look like 2D pixel art (confirmed, not optional)

Jarno's direct feedback on the first attempt, twice now: the objects need to be part of the scene, and separately — *"items does not feel like 2d pixel art."* Emoji glyphs (✈️🧻📦📱📡📺💳🏦📄) and the one hand-drawn SVG (Siemens monitor) are smooth/flat vector-style renders — they read as UI iconography, not as hand-painted pixel-art props. That mismatch is a confirmed problem to fix, not an open question.

**Requirement: all ten new assets must be genuine pixel art** — visibly blocky/pixelated at a low native resolution (the existing Eder Muniz background packs in `Zalaris/Backrounds/` are the reference: limited/muted color palette, hard pixel edges, flat per-pixel shading, no smooth gradients or anti-aliasing) — the same visual language as every other prop already in these scenes (the trump.png/whouse.png illustrations, the Tampella factory silhouette, the castle/city backgrounds themselves). An icon-style or smooth-vector asset will look pasted-on no matter how well it's positioned/parallaxed — the *style* is the other half of "part of the scene," as important as the world-anchored positioning.

Nine props + one plane silhouette means **ten new small pixel-art image files** in `Zalaris/kuvat/`. Two ways to produce genuinely pixel-art assets (not just flat icons):

- **Generate them** with an image-generation tool, explicitly prompted for low-resolution pixel art in a palette sampled from the existing background packs, then checked at actual in-scene size (small — pixel art can turn to mush if generated then heavily downscaled; better to generate near final size, or generate larger and use nearest-neighbor/hard downscale, not smooth resampling).
- **Hand-drawn pixel grids** (the same literal per-pixel-cell technique already used elsewhere in this project for code-drawn pixel characters, e.g. `TAMAGOTCHI_OLENTO` in `esitys-2d.html` — a small NxN grid of explicit pixel colors) rendered to a `<canvas>`/PNG. More control over exact style-matching, more manual work for ten different shapes.

Whoever executes this (me or Opus) should pick one approach, verify it actually renders with visible pixelation (not just "simple/flat") at real in-scene size before wiring all ten, and stay consistent across all ten rather than mixing styles.

## Company → object → stop mapping (unchanged from the approved first pass — only the *mechanism* changed, not the creative choices)

| Company | Object | Stop (x) | Slide text |
|---|---|---|---|
| Finnair | small airplane silhouette, drifting in the sky (world-anchored, low scrollFactor) | 540 | "Jokainen meistä on jo osa uutta aikakautta" |
| Metsä Group | tissue/toilet-paper roll | 11490 | "Jos tekoäly vapauttaa tunnin paperitöistä..." |
| UPM | paper ream / label roll | 11415 | "Kone löytää poikkeaman, ihminen tietää tarinan" |
| DNA | phone | 10470 | "Tekoäly poistaa esteitä..." |
| Ericsson | signal tower | 11485 | "Tekoäly on ajattelun GPS-laite" |
| Gigantti | TV | 12990 | "...ehdimme olla ihmisiä" |
| Siemens | small heart-rate monitor screen with a pulsing EKG line (Siemens Healthineers, not industrial — Jarno: "gear is boring, maybe healthcare some monitor, heart") | 2940 | "Älykkyys on enemmän kuin laskentaa" |
| Santander | bank card | 13290 | "Viisas tekoälyttömyys on kykyä valita" |
| Stora Enso | cardboard box | 8940 | "Algoritmit luovat myös turvaa" (note: this stop already has a centered `kupla` bubble effect — place the box low/to a side, clear of it) |
| Danske Bank | bank building | 12390 | "...vain aito inhimillinen huomio ja läsnäolo vaikuttavat meihin syvällä" |

**Jarno: "do not add any to kiitos page"** — the closing slide (x:13890) stays clean, already respected in this mapping.

## Files to modify

- `Zalaris/esitys-2d.html` — **remove** the `#piilotettuEsine` CSS block, its `<div>`, the `piilotettuEsineEl` const, `PIILOTETUT_ESINEET`, `naytaPiilotettuEsine()`, and its two call sites (superseded mechanism from the first attempt).
- `Zalaris/esitys-data.js` — **remove** the `piilotettuEsine: {...}` field from the 10 stops (no longer needed — world-anchored `HAHMOKERROKSET` entries are keyed by `x`/`vainPysahdys`, not a stop-level field).
- `Zalaris/esitys-2d-hahmot.js` — **add** ten new world-anchored entries (the real change), one per company, each with `vainPysahdys: <x>` tied to its stop, and `scrollFactor`/`syvyysSuhde`/`yProsentti`/`ankkuri` values chosen by looking at what neighboring entries in that same scene already use (so the new prop's parallax depth matches its surroundings).
- `Zalaris/kuvat/` — ten new small image assets (see Asset question above).

Zalaris-only — not backported to SectoDesign/Taiteilijajarjestot (client list is Zalaris-specific).

## Verification (matters more this time — parallax has to actually look right)

Static screenshots aren't enough to judge this, since the whole point is how it moves with the scene:
1. Load `Zalaris/esitys-2d.html` via the local dev server, no console errors.
2. For each of the 10 stops, use `window.__esikatseluSiirry(x)` to jump there, **then scroll/advance through neighboring stops** (not just one static frame) to confirm the prop scrolls and sits at a believable depth relative to the actual background layers — it should look like it's *in* the scene, not floating on top of it.
3. Finnair specifically: confirm the shape reads as an airplane at the size/distance used, and that its drift comes from the world's own parallax (moves differently than screen-fixed elements do when the camera pans) rather than a fixed-speed CSS animation.
4. Re-confirm x:8940 (Stora Enso) doesn't collide with the `kupla` bubble effect already on that stop.
5. Confirm the old `#piilotettuEsine` mechanism is fully gone (no dead CSS/JS left behind) and nothing else on those 10 stops regressed.
