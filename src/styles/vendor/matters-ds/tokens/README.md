# Matters Design System tokens (vendored)

Source: https://github.com/thematters/design-system  
Pinned commit: `7abc254` (2026-04-25)  
Path in source: `tokens/dist/tokens.css`

This file is consumed by the landing page via `BaseLayout.astro` (loaded
before any component CSS so `--color-*`, `--space-*`, `--shadow-*`,
`--font-family-*` and `.ds-text-*` utility classes are globally available).

## Update procedure

```bash
gh api repos/thematters/design-system/contents/tokens/dist/tokens.css \
  --jq '.content' | base64 -d \
  > public/vendor/matters-ds/tokens/tokens.css
```

Update the pinned-commit line above when you do.
