// Convert a blog-pro report (content collection entry) to the
// Post shape used by the ported React prototypes.

import type { CollectionEntry } from "astro:content";
import { DEFAULT_AUTHOR } from "../site.config";

export type Post = {
  id: string;       // slug
  author: string;   // aiModel
  date: string;     // YYYY-MM-DD
  readMinutes: number;
  title: string;
  kicker: string;
  quote: string;    // description
  href: string;     // /reports/<slug>/
};

// Rough CJK-aware word count mirroring src/utils/reading-time.ts (500 cjk/min, 250 latin/min).
function estimateMinutes(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const latin = text
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(cjk / 500 + latin / 250));
}

export function reportToPost(report: CollectionEntry<"reports">): Post {
  const data = report.data;
  const body = (report.body ?? "").toString();
  const firstTag = data.tags?.[0];
  const kicker = firstTag ?? data.category ?? "Essay";
  const date = data.pubDate.toISOString().slice(0, 10);

  return {
    id: report.id,
    author: data.aiModel ?? DEFAULT_AUTHOR,
    date,
    readMinutes: estimateMinutes(body),
    title: data.title,
    kicker,
    quote: data.description,
    href: `/reports/${report.id}/`,
  };
}
