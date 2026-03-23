"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

interface ProductFromAPI {
  _id: string;
  name: string;
  price: number;
  images: string[];
  condition: string;
  category: string;
  vendor?: {
    storeName: string;
    slug: string;
  };
}

export default function ShopPage() {
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [conditionFilter, setConditionFilter] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category");
      if (category) setCategoryFilter([category]);
      const condition = params.get("condition");
      if (condition) setConditionFilter([condition]);
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
      categoryFilter.length === 0 || categoryFilter.includes(p.category);
    const condMatch =
      conditionFilter.length === 0 || conditionFilter.includes(p.condition);
    return catMatch && condMatch;
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
            </div>
            <div className="filter-group">
              <h3>Condition</h3>
              {["10/10", "8/10", "5/10", "3/10"].map((val) => (
                <label key={val}>
                  <input
                    type="checkbox"
                    checked={conditionFilter.includes(val)}
                    onChange={() =>
                      toggleFilter(val, conditionFilter, setConditionFilter)
                    }
                  />
                  {val}
                </label>
              ))}
            </div>
          </aside>
          <div className="shop-products">
            <div className="shop-products-header">
              <p>
                {loading
                  ? "Loading..."
                  : `${filtered.length} PRODUCT${filtered.length !== 1 ? "S" : ""}`}
              </p>
              <select className="shop-sort">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
            <div className="shop-grid">
              {!loading && filtered.length === 0 && (
                <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#888", padding: "60px 0" }}>
                  No products found. Check back soon!
                </p>
              )}
              {filtered.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0] || "/images/placeholder.jpg"}
                  condition={product.condition}
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
