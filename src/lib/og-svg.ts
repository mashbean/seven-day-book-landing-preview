// Shared helpers for /og/*.svg endpoints.
// Renders OG images in the same visual language as the home page:
// - mesh background (4 blurred colored blobs on off-white canvas)
// - optional themed "card" accent per post
// - title in serif + mono meta, echoing the home hero
//
// SVG-first because it's <10KB per image and fits static hosting.
// Scrapers that don't support SVG og:image can be served a PNG in
// follow-up work (satori + resvg).

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Rough "visual width" of a character in title units:
// 1 = CJK / fullwidth, 0.55 = Latin letter, 0.4 = punctuation.
export function visualWidth(ch: string): number {
  if (/[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]/.test(ch)) return 1;
  if (/[A-Za-z0-9]/.test(ch)) return 0.55;
  return 0.4;
}

export function titleUnits(s: string): number {
  let u = 0;
  for (const ch of s) u += visualWidth(ch);
  return u;
}

// Greedy line break. Each line may hold up to `maxUnits` visual units.
// Soft-break on CJK + space; otherwise break where the width exceeds.
export function wrapByWidth(text: string, maxUnits: number): string[] {
  const lines: string[] = [];
  let buf = "";
  let w = 0;
  let lastSpace = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const cw = visualWidth(ch);

    if (ch === " ") lastSpace = buf.length;

    if (w + cw > maxUnits && buf.length > 0) {
      // Prefer breaking at the most recent space (Latin words).
      if (lastSpace > 0 && buf.length - lastSpace < 10) {
        const kept = buf.slice(0, lastSpace);
        const carry = buf.slice(lastSpace + 1);
        lines.push(kept);
        buf = carry + ch;
        w = 0;
        for (const c of buf) w += visualWidth(c);
        lastSpace = -1;
      } else {
        lines.push(buf);
        buf = ch;
        w = cw;
        lastSpace = -1;
      }
    } else {
      buf += ch;
      w += cw;
    }
  }
  if (buf) lines.push(buf);
  return lines;
}

// Pick a (font-size, max-lines) that fits a title into `widthUnits` per line.
// The return values are in px: size is the actual font-size, leading is line
// height, widthPx is the content area we assumed.
export function sizeForTitle(title: string, contentPx = 708): {
  fontSize: number;
  leading: number;
  maxLines: number;
  unitsPerLine: number;
} {
  const units = titleUnits(title);
  // Ranges are picked so a title of `units` characters can fit in the
  // allotted number of lines at `fontSize` (≈ contentPx/fontSize chars/line).
  // Latin titles at 0.55 units/char like to wrap into more lines; give them
  // headroom.
  let fontSize: number;
  let maxLines: number;
  if (units <= 8) { fontSize = 120; maxLines = 1; }
  else if (units <= 16) { fontSize = 96; maxLines = 2; }
  else if (units <= 26) { fontSize = 76; maxLines = 4; }
  else if (units <= 40) { fontSize = 62; maxLines = 4; }
  else { fontSize = 52; maxLines = 5; }
  const unitsPerLine = Math.floor(contentPx / fontSize);
  const leading = Math.round(fontSize * 1.18);
  return { fontSize, leading, maxLines, unitsPerLine };
}

export function wrapTitle(title: string, contentPx = 708): {
  lines: string[];
  fontSize: number;
  leading: number;
} {
  const { fontSize, leading, maxLines, unitsPerLine } = sizeForTitle(title, contentPx);
  let lines = wrapByWidth(title, unitsPerLine);
  if (lines.length > maxLines) {
    // Truncate and ellipsize the last visible line.
    const kept = lines.slice(0, maxLines);
    const last = kept[maxLines - 1];
    // Drop a couple of chars to make room for the ellipsis.
    kept[maxLines - 1] = last.replace(/.{1,2}$/, "") + "…";
    lines = kept;
  }
  return { lines, fontSize, leading };
}

// Scatter dots across a bounding box, seeded by a string.
export function scatterDots(seed: string, opts: {
  count: number;
  x: number; y: number; w: number; h: number;
  minR?: number; maxR?: number;
}): string {
  const { count, x, y, w, h } = opts;
  const minR = opts.minR ?? 1;
  const maxR = opts.maxR ?? 3.5;
  // small deterministic PRNG
  let s = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    s = Math.imul(s ^ seed.charCodeAt(i), 3432918353);
    s = (s << 13) | (s >>> 19);
  }
  const rnd = () => {
    let t = (s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const cx = x + rnd() * w;
    const cy = y + rnd() * h;
    const r = minR + rnd() * (maxR - minR);
    out.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(2)}" />`);
  }
  return out.join("");
}

// The reusable mesh background: off-white canvas + 4 blurred colored blobs.
// Uses SVG filter gaussian blur (widely supported).
export function meshBg(): string {
  return `
  <defs>
    <filter id="meshBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="110"/>
    </filter>
    <radialGradient id="meshBase" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#fcfcfc"/>
      <stop offset="100%" stop-color="#f0f0f0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#meshBase)"/>
  <g filter="url(#meshBlur)" opacity="0.9">
    <circle cx="-40"   cy="-40"  r="460" fill="#e0eaff"/>
    <circle cx="1240"  cy="700"  r="420" fill="#ffe0ec"/>
    <circle cx="520"   cy="460"  r="340" fill="#e0fff4" opacity="0.85"/>
    <circle cx="-60"   cy="560"  r="290" fill="#fff8e0"/>
  </g>`;
}
