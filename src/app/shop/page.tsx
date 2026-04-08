"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";

interface ProductFromAPI {
  _id: string;
  name: string;
  price: number;
  images: string[];
  condition: string;
  category: string;
  stock?: number;
  vendor?: {
    storeName: string;
    slug: string;
  };
}

export default function ShopPage() {
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("featured");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category");
      if (category) setCategoryFilter([category]);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (
    value: string,
    current: string[],
    setter: (v: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const filtered = products.filter((p) => {
    const catMatch =
      categoryFilter.length === 0 ||
      categoryFilter.includes(p.category) ||
      (p.category === "unisex" && (categoryFilter.includes("men") || categoryFilter.includes("women")));
    return catMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return b._id.localeCompare(a._id);
      default:
        return 0;
    }
  });

  return (
    <>
      <Navbar />
      <div className="shop-page">
        <div className="shop-hero">
          <h1>Shop All</h1>
          <p>Curated thrift and new fashion pieces</p>
        </div>
        <div className="shop-container">
          <aside className="shop-sidebar">
            <div className="filter-group">
              <h3>Category</h3>
              <label>
                <input
                  type="checkbox"
                  checked={categoryFilter.includes("men")}
                  onChange={() =>
                    toggleFilter("men", categoryFilter, setCategoryFilter)
                  }
                />
                Mens
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={categoryFilter.includes("women")}
                  onChange={() =>
                    toggleFilter("women", categoryFilter, setCategoryFilter)
                  }
                />
                Womens
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={categoryFilter.includes("unisex")}
                  onChange={() =>
                    toggleFilter("unisex", categoryFilter, setCategoryFilter)
                  }
                />
                Unisex
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={categoryFilter.includes("accessories")}
                  onChange={() =>
                    toggleFilter("accessories", categoryFilter, setCategoryFilter)
                  }
                />
                Accessories
              </label>
            </div>
          </aside>
          <div className="shop-products">
            <div className="shop-products-header">
              <p>
                {loading
                  ? "Loading..."
                  : `${sorted.length} PRODUCT${sorted.length !== 1 ? "S" : ""}`}
              </p>
              <select
                className="shop-sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <div className="shop-grid">
              {!loading && sorted.length === 0 && (
                <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#888", padding: "60px 0" }}>
                  No products found. Check back soon!
                </p>
              )}
              {loading
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <SkeletonCard key={idx} />
                  ))
                : sorted.map((product) => (
                    <ProductCard
                      key={product._id}
                      id={product._id}
                      name={product.name}
                      price={product.price}
                      image={product.images?.[0] || "/images/placeholder.jpg"}
                      condition={product.condition}
                      stock={product.stock}
                      vendorName={product.vendor?.storeName}
                      vendorSlug={product.vendor?.slug}
                    />
                  ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
