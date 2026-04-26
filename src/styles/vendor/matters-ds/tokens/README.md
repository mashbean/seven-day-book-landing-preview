# Matters Design System tokens (vendored)

Source: https://github.com/thematters/design-system  
Pinned commit: `df8331a` (2026-04-25, phase 5)  
Path in source: `packages/tokens/dist/tokens.css` + `packages/tokens/dist/freewrite.css`

## Files

- `tokens.css` — canonical brand tokens (purple/lime + greyscale + spacing/shadow/typography). **Always loaded.**
- `freewrite.css` — opt-in `--color-freewrite-*` palette (cool blue). Phase 3 isolated these into a
  separate stylesheet because the rule is "freewrite tokens are 七日書-only". The 七日書 landing is
  the canonical (and currently only) consumer.

Both are loaded by `BaseLayout.astro`, canonical first then freewrite, so freewrite cannot be
overridden by tokens.css and the page-level cool-blue palette stays intact.

## Update procedure

```bash
cp ../../../design-system/packages/tokens/dist/tokens.css \
   src/styles/vendor/matters-ds/tokens/tokens.css
cp ../../../design-system/packages/tokens/dist/freewrite.css \
   src/styles/vendor/matters-ds/tokens/freewrite.css
```

Update the pinned-commit line above when you do.
