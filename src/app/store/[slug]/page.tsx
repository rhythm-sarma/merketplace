"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";

interface VendorInfo {
  storeName: string;
  slug: string;
}

interface ProductFromAPI {
  _id: string;
  name: string;
  price: number;
  images: string[];
  condition: string;
  category: string;
  vendor?: VendorInfo;
}

export default function VendorStorePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorProducts = async () => {
      try {
        const res = await fetch(`/api/products?vendor=${slug}`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products);
          if (data.products.length > 0 && data.products[0].vendor) {
            setVendorName(data.products[0].vendor.storeName);
          }
        }
      } catch (err) {
        console.error("Failed to fetch vendor products:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchVendorProducts();
  }, [slug]);

  return (
    <>
      <Navbar />
      <div className="shop-page">
        <div className="shop-hero">
          <p style={{ fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>
            Vendor Store
          </p>
          <h1>{loading ? "Loading..." : vendorName || slug}</h1>
          <p>{loading ? "" : `${products.length} product${products.length !== 1 ? "s" : ""} listed`}</p>
        </div>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px" }}>
          {!loading && products.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
              <p style={{ fontSize: "1.1rem", marginBottom: "16px" }}>This store has no products yet.</p>
              <Link href="/shop" style={{ textDecoration: "underline" }}>
                ← Back to Shop
              </Link>
            </div>
          )}
          <div className="shop-grid" style={{ maxWidth: "100%" }}>
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))
              : products.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    image={product.images?.[0] || "/images/placeholder.jpg"}
                    condition={product.condition}
                  />
                ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
