import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://incant.actvli.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/u/", "/pricing", "/privacy", "/terms"],
        disallow: ["/dashboard", "/cast", "/api/", "/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
