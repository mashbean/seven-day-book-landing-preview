// Render OG images to PNG via satori + resvg.
// satori renders a React-like element tree to SVG (flex-based layout, no
// CSS fallback on the scraper) and resvg rasterizes to PNG. Fonts are
// fetched from Google Fonts' GitHub mirror on first use, so builds stay
// deterministic and CJK + Latin titles both render reliably on Facebook,
// LINE, WhatsApp, etc.

import React from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { SITE_SHORT, SITE_SUBTITLE } from "../site.config";

// ---------- Fonts ----------
const FONT_URLS = {
  plexSerifBold: "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexserif/IBMPlexSerif-Bold.ttf",
  plexMono: "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf",
  // Static OTF (subsetted to Traditional Chinese) — ~8MB. The variable TTF
  // tripped satori's opentype.js parser on the fvar axis table; the static
  // OTF avoids that path entirely.
  notoSerifTCBold: "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/SubsetOTF/TC/NotoSerifTC-Bold.otf",
  notoSerifTCRegular: "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/SubsetOTF/TC/NotoSerifTC-Regular.otf",
};

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

let cached: OgFont[] | null = null;

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OG font fetch failed (${res.status}): ${url}`);
  return res.arrayBuffer();
}

export async function loadOgFonts(): Promise<OgFont[]> {
  if (cached) return cached;
  const [plexSerifBold, plexMono, notoTCBold, notoTCRegular] = await Promise.all([
    fetchFont(FONT_URLS.plexSerifBold),
    fetchFont(FONT_URLS.plexMono),
    fetchFont(FONT_URLS.notoSerifTCBold),
    fetchFont(FONT_URLS.notoSerifTCRegular),
  ]);
  cached = [
    // Latin goes through Plex first, CJK falls through to Noto Serif TC.
    { name: "IBM Plex Serif", data: plexSerifBold, weight: 700, style: "normal" },
    { name: "IBM Plex Mono", data: plexMono, weight: 400, style: "normal" },
    { name: "Noto Serif TC", data: notoTCBold, weight: 700, style: "normal" },
    { name: "Noto Serif TC", data: notoTCRegular, weight: 400, style: "normal" },
  ];
  return cached;
}

// ---------- Typography helper ----------
// Rough "visual width" per character (1 = CJK, 0.55 = latin, 0.4 = punctuation).
function visualWidth(ch: string): number {
  if (/[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]/.test(ch)) return 1;
  if (/[A-Za-z0-9]/.test(ch)) return 0.55;
  return 0.4;
}
function titleUnits(s: string): number {
  let u = 0;
  for (const ch of s) u += visualWidth(ch);
  return u;
}
export function fontSizeForTitle(title: string): number {
  const u = titleUnits(title);
  if (u <= 8) return 128;
  if (u <= 16) return 100;
  if (u <= 26) return 80;
  if (u <= 40) return 66;
  return 54;
}

// ---------- Reusable visual primitives ----------

// Mesh-gradient canvas backdrop that echoes the homepage .mesh component.
// Stacked radial gradients are pure CSS — no filters — so satori renders
// them safely. Colors match src/styles/ds-app.css.
const meshBackground = {
  background:
    "radial-gradient(ellipse 40% 55% at 8% 8%, #e0eaff 0%, rgba(224,234,255,0) 70%)," +
    "radial-gradient(ellipse 45% 55% at 95% 92%, #ffe0ec 0%, rgba(255,224,236,0) 70%)," +
    "radial-gradient(ellipse 45% 40% at 45% 55%, #e0fff4 0%, rgba(224,255,244,0) 70%)," +
    "radial-gradient(ellipse 35% 45% at 3% 72%, #fff8e0 0%, rgba(255,248,224,0) 70%)," +
    "radial-gradient(circle at 50% 50%, #fcfcfc, #f0f0f0)",
};

const monoStyle = {
  fontFamily: "IBM Plex Mono",
  letterSpacing: "0.04em",
};

// ---------- Render API ----------

export async function renderPng(element: React.ReactElement, w = 1200, h = 630): Promise<Buffer> {
  const fonts = await loadOgFonts();
  const svg = await satori(element, { width: w, height: h, fonts });
  return new Resvg(svg, { background: "#fcfcfc" }).render().asPng();
}

// ---------- Scenes ----------

export function postScene({
  title,
  kicker,
  author,
  date,
}: {
  title: string;
  kicker: string;
  author: string;
  date: string;
}): React.ReactElement {
  const fontSize = fontSizeForTitle(title);
  const sideMargin = 72;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        padding: `${sideMargin}px`,
        color: "#0e0e0e",
        fontFamily: "IBM Plex Serif, Noto Serif TC",
        ...meshBackground,
      }}
    >
      {/* Top chrome */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          color: "rgba(10,10,10,0.62)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ ...monoStyle, fontSize: "22px" }}>{kicker.toUpperCase()}</span>
          <span style={{ ...monoStyle, fontSize: "14px", opacity: 0.75 }}>
            pro.mashbean.net / reports
          </span>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          paddingTop: "24px",
          paddingBottom: "24px",
        }}
      >
        <div
          style={{
            display: "block",
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
            color: "#0e0e0e",
            maxWidth: "1056px",
          }}
        >
          {title}
        </div>
      </div>

      {/* Bottom meta */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderTop: "1px solid rgba(10,10,10,0.22)",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            color: "rgba(10,10,10,0.7)",
            ...monoStyle,
            fontSize: "22px",
          }}
        >
          <span>
            <span style={{ color: "#0e0e0e", fontWeight: 500 }}>{author}</span>  ·  {date}
          </span>
          <span>
            {SITE_SHORT}｜{SITE_SUBTITLE}
          </span>
        </div>
      </div>
    </div>
  );
}

export function homeScene({
  tagline,
}: {
  tagline: string;
}): React.ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        padding: "72px",
        color: "#0e0e0e",
        fontFamily: "IBM Plex Serif, Noto Serif TC",
        ...meshBackground,
      }}
    >
      {/* Top chrome */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          color: "rgba(10,10,10,0.62)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ ...monoStyle, fontSize: "22px" }}>
            ESSAYS · NOTES · FIELD REPORTS
          </span>
          <span style={{ ...monoStyle, fontSize: "14px", opacity: 0.75 }}>
            pro.mashbean.net
          </span>
        </div>
      </div>

      {/* Big headline */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: "24px",
          paddingBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "240px",
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: "#0e0e0e",
            marginBottom: "18px",
          }}
        >
          {SITE_SHORT}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "40px",
            fontWeight: 700,
            lineHeight: 1.28,
            color: "#1a1a1a",
            maxWidth: "960px",
          }}
        >
          {tagline}
        </div>
      </div>

      {/* Bottom meta */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          color: "rgba(10,10,10,0.7)",
          borderTop: "1px solid rgba(10,10,10,0.22)",
          paddingTop: "20px",
          ...monoStyle,
          fontSize: "22px",
        }}
      >
        <span>
          <span style={{ color: "#0e0e0e", fontWeight: 500 }}>{SITE_SHORT}</span>｜{SITE_SUBTITLE}
        </span>
        <span>AI-powered research</span>
      </div>
    </div>
  );
}
