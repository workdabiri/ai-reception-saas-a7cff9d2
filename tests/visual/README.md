# Visual regression — pills & badges

Two complementary guards. Both fail non-zero on drift; CI should run both.

## 1. Markup snapshot (`snapshot:pills`)

Dependency-free SSR snapshot of every variant rendered three times (mobile /
tablet / desktop wrappers). Enforces:

- **Universal Responsive Consistency** — markup byte-identical across BPs.
- **Golden Contrast Rule** — flags `bg-{c}/N` + `text-{c}` (must be `text-foreground`).
- **Snapshot drift** vs `__snapshots__/pills.snap.json`.

```bash
bun run snapshot:pills          # verify
bun run snapshot:pills:update   # accept
```

## 2. Pixel-diff (`snapshot:pixels`)

Real browser screenshots via Playwright + pixelmatch. Boots vite, navigates
to `/dev/pill-gallery` at 375 / 820 / 1280 viewports, captures each
`[data-pill-id]` anchor, and diffs against goldens in `__screenshots__/{bp}/`.

- Animations and transitions are forcibly disabled for determinism.
- Per-pixel tolerance `0.1`, slack `5px` per crop (anti-aliasing).
- Mismatches write `actual` + `diff` PNGs to `__diffs__/{bp}/` for review.
- Set `GALLERY_URL=...` to reuse an already-running dev server.
- Set `CHROMIUM_PATH=...` to override the chromium binary (defaults to `/bin/chromium`).

```bash
bun run snapshot:pixels          # verify, exits 1 on mismatch
bun run snapshot:pixels:update   # accept / seed goldens
```

## Adding samples

Edit `src/routes/dev.pill-gallery.tsx` (pixel) and `buildSamples()` in
`pills.snapshot.tsx` (markup). Run both `:update` commands, review the diff,
commit goldens.
