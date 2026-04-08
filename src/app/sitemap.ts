import { MetadataRoute } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

const SITE_URL = "https://racksup.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Try mapping dynamic products. Handle DB connection gracefully.
  let products: MetadataRoute.Sitemap = [];
  try {
    await dbConnect();
    // Only fetch necessary fields for the sitemap
    const liveProducts = await Product.find({}, "_id updatedAt").lean();

    products = liveProducts.map((product: any) => ({
      url: `${SITE_URL}/shop/${product._id.toString()}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Sitemap dynamic route generation failed:", err);
  }

  // Define essential static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  return [...staticRoutes, ...products];
}
