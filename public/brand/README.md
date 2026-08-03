# Postr brand assets

## Files

| File | Use |
| --- | --- |
| `postr-wordmark.svg` | Primary lockup on light backgrounds |
| `postr-wordmark-white.svg` | Primary lockup on dark backgrounds |
| `postr-mark.svg` | Icon alone (purple) — favicons, tight spaces |
| `postr-mark-white.svg` | Icon alone (white) — on dark or coloured fills |
| `postr-avatar.svg` / `-1024.png` | Square social profile picture |
| `postr-wordmark-2400.png` / `-white-2400.png` | Raster wordmark for anywhere SVG isn't accepted |
| `postr-mark-512.png` / `-white-512.png` | Raster icon |

The wordmark SVGs have the type **converted to outlines**, so they render
identically everywhere with no font installed.

App icons for the installed PWA live separately in `public/icons/`.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| Primary | `#534AB7` | The mark, buttons, accents |
| Primary hover | `#6157CF` | Hover state |
| Onyx | `#050505` | Page background |
| Surface | `#141414` | Cards |
| Text | `#FFFFFF` / `rgba(255,255,255,0.55)` | Primary / muted |

Success `#22C55E` · Warning `#F59E0B` · Danger `#EF4444`

## Type

- **Instrument Serif** — headings and the wordmark
- **Inter** — UI labels, buttons, body

## Rules

- Keep clear space around the lockup equal to the height of the mark.
- Minimum width for the wordmark is 96px; below that use the mark alone.
- Don't recolour the mark outside the palette, stretch it, add effects, or
  set the wordmark in a different typeface.
- On photography, use the white lockup over a dark overlay.

## Note on the mark

The feather is Lucide's `feather` icon (ISC licence — free for commercial
use, no attribution required). It is not exclusive to Postr, so it can't be
trademarked as-is. A custom-drawn mark is worth commissioning before any
serious brand investment.
