import { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://incant.actvli.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/cast`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const service = createServiceClient();
    const { data: spells } = await service
      .from("spells")
      .select("slug, updated_at, profiles!inner(username)")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(1000);

    const spellRoutes: MetadataRoute.Sitemap = (spells || []).map((spell) => ({
      url: `${base}/u/${(spell.profiles as unknown as { username: string }).username}/${spell.slug}`,
      lastModified: new Date(spell.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...spellRoutes];
  } catch {
    return staticRoutes;
  }
}
