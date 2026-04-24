import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPublishedReports } from "../utils/reports";
import { SITE_TITLE, SITE_DESCRIPTION } from "../site.config";
import { withBase } from "../utils/paths";

export async function GET(context: APIContext) {
  const reports = await getPublishedReports();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!.href,
    items: reports.map((report) => ({
      title: report.data.title,
      pubDate: report.data.pubDate,
      description: report.data.description,
      link: withBase(`/reports/${report.id}/`),
    })),
  });
}
