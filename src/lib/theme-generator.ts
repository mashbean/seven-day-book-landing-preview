// Port of app-helpers.jsx — theme / palette / pattern generator.
// Pure TS, no React deps.

export type Theme = {
  step: number;
  L: number;
  C: number;
  H: number;
  bg: string;
  text: string;
  strokes: string[];
  paletteKey: string;
};

export type PaletteKey =
  | "blue" | "purple" | "pink" | "red" | "orange"
  | "yellow" | "green" | "teal" | "mono";

export const PALETTES: Record<PaletteKey, {
  label: string;
  baseHue: number;
  hueVariation: number;
  chromaMultiplier?: number;
}> = {
  blue:    { label: "Blue",       baseHue: 255, hueVariation: 18 },
  purple:  { label: "Purple",     baseHue: 300, hueVariation: 20 },
  pink:    { label: "Pink",       baseHue: 350, hueVariation: 15 },
  red:     { label: "Red",        baseHue:  25, hueVariation: 18 },
  orange:  { label: "Orange",     baseHue:  55, hueVariation: 20 },
  yellow:  { label: "Yellow",     baseHue:  90, hueVariation: 15 },
  green:   { label: "Green",      baseHue: 145, hueVariation: 25 },
  teal:    { label: "Teal",       baseHue: 195, hueVariation: 20 },
  mono:    { label: "Monochrome", baseHue:   0, hueVariation:  0, chromaMultiplier: 0.1 },
};

const LIGHTS  = [.62, .66, .70, .74, .77, .80, .83, .86, .88, .90, .92, .94];
const CHROMAS = [.14, .15, .16, .16, .15, .14, .13, .12, .10, .09, .07, .05];
const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];

export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry(seed: number): () => number {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function oklchStr(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

export function buildPalette(key: PaletteKey): Omit<Theme, "paletteKey">[] {
  const p = PALETTES[key];
  const HV = p.hueVariation, H0 = p.baseHue, cm = p.chromaMultiplier ?? 1;
  const offsets = [-HV, -HV*0.7, -HV*0.5, -HV*0.3, -HV*0.1, 0, HV*0.1, HV*0.3, HV*0.5, HV*0.7, HV*0.9, HV];
  return LIGHTS.map((L, i) => {
    const C = CHROMAS[i] * cm, H = H0 + offsets[i];
    const bg = oklchStr(L, C, H);
    const text = L > 0.65 ? "#0a0a0a" : "#fff";
    const strokes = L <= 0.62
      ? [oklchStr(.94, .04*cm, H), oklchStr(.88, .06*cm, H-8), oklchStr(.82, .08*cm, H-12), oklchStr(.96, .02*cm, H)]
      : [oklchStr(.30, .10*cm, H-6), oklchStr(.38, .12*cm, H-10), oklchStr(.22, .08*cm, H-8), oklchStr(.46, .14*cm, H-14)];
    return { step: i, L, C, H, bg, text, strokes };
  });
}

export function themeFor(id: string, forcePalette: PaletteKey | null = null): Theme {
  const r = mulberry(hashSeed(id));
  const key = (forcePalette && PALETTES[forcePalette])
    ? forcePalette
    : PALETTE_KEYS[Math.floor(r() * PALETTE_KEYS.length)];
  const ramp = buildPalette(key);
  const step = Math.floor(r() * 12);
  return { ...ramp[step], paletteKey: key };
}

export function themeForMono(id: string): Theme {
  return themeFor(id, "mono");
}

export const PATTERN_KEYS = [
  "arcs","phyllo","waves","grid","contours","rings",
  "orbits","field","constellation","burst","hatching","scribble"
] as const;
export type PatternKey = typeof PATTERN_KEYS[number];

export function patternFor(id: string): PatternKey {
  const r = mulberry(hashSeed(id + ":pattern"));
  return PATTERN_KEYS[Math.floor(r() * PATTERN_KEYS.length)];
}
