/* ============================================================
   Palette generator — 9 palettes × 12 steps, OKLCH-based.
   Each step returns { bg, text, strokes[] }.
   ============================================================ */

export const PALETTES = {
  blue:    { label: 'Blue',       baseHue: 255, hueVariation: 18 },
  purple:  { label: 'Purple',     baseHue: 300, hueVariation: 20 },
  pink:    { label: 'Pink',       baseHue: 350, hueVariation: 15 },
  red:     { label: 'Red',        baseHue:  25, hueVariation: 18 },
  orange:  { label: 'Orange',     baseHue:  55, hueVariation: 20 },
  yellow:  { label: 'Yellow',     baseHue:  90, hueVariation: 15 },
  green:   { label: 'Green',      baseHue: 145, hueVariation: 25 },
  teal:    { label: 'Teal',       baseHue: 195, hueVariation: 20 },
  mono:    { label: 'Monochrome', baseHue:   0, hueVariation:  0, chromaMultiplier: 0.1 },
};

const LIGHTS  = [.20, .28, .35, .42, .48, .54, .60, .66, .72, .78, .84, .90];
const CHROMAS = [.08, .12, .16, .18, .19, .18, .16, .14, .12, .10, .08, .06];

const oklchStr = (l, c, h) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;

export function buildPalette(key) {
  const p = PALETTES[key];
  const H0 = p.baseHue;
  const HV = p.hueVariation;
  const cm = p.chromaMultiplier ?? 1;
  const offsets = [-HV, -HV*0.7, -HV*0.5, -HV*0.3, -HV*0.1, 0, HV*0.1, HV*0.3, HV*0.5, HV*0.7, HV*0.9, HV];

  return LIGHTS.map((L, i) => {
    const C = CHROMAS[i] * cm;
    const H = H0 + offsets[i];
    const bg = oklchStr(L, C, H);
    const text = L > 0.58 ? '#0a0a0a' : '#fff';
    const strokes = L <= 0.55
      ? [ oklchStr(.92, .04*cm, H),
          oklchStr(.86, .06*cm, H - 8),
          oklchStr(.80, .08*cm, H - 12),
          oklchStr(.96, .02*cm, H) ]
      : [ oklchStr(.20, .08*cm, H - 6),
          oklchStr(.28, .10*cm, H - 10),
          oklchStr(.14, .06*cm, H - 8),
          oklchStr(.34, .12*cm, H - 14) ];
    return { step: i, L, C, H, bg, text, strokes };
  });
}

/* Deterministic: pick one of 108 themes from a string key. */
function hashSeed(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=(h<<13)|(h>>>19);}return h>>>0;}
function mulberry(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

const PALETTE_KEYS = Object.keys(PALETTES);
export function themeFor(str, forcePalette = null){
  const r = mulberry(hashSeed(str));
  const key = forcePalette ?? PALETTE_KEYS[Math.floor(r() * PALETTE_KEYS.length)];
  const ramp = buildPalette(key);
  const step = Math.floor(r() * 12);
  return { ...ramp[step], paletteKey: key };
}
