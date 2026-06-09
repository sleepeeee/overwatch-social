import { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aftermidnight-gg.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/actions/", "/developer/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
