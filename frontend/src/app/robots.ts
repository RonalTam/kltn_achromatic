import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/products/", "/collections", "/search"],
      disallow: [
        "/admin",
        "/account",
        "/cart",
        "/checkout",
        "/forbidden",
        "/*?*sortBy=",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
