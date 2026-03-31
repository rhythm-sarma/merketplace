"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import SkeletonProductDetail from "@/components/SkeletonProductDetail";

interface ProductDetail {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: string;
  sizes: string[];
  images: string[];
  stock: number;
  vendor?: {
    storeName: string;
    slug: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <SkeletonProductDetail />
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="product-detail">
          <div
            className="product-detail-inner"
            style={{ textAlign: "center", padding: "200px 40px" }}
          >
            <h1>Product not found</h1>
            <Link href="/shop" style={{ marginTop: "20px", display: "inline-block" }}>
              ← Back to Shop
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;
    
    // Provide a default size if product has no sizes or none selected
    const sizeToCart = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : "One Size");
    
    addToCart(
      {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "/images/placeholder.jpg",
        condition: product.condition || "thrift",
        vendorId: product.vendor?.slug, // storing slug or id
      },
      1,
      sizeToCart
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const conditionLabel = product.condition || "—";

  return (
    <>
      <Navbar />
      <div className="product-detail">
        <div className="product-detail-inner">
          <div className="product-detail-image">
            <img
              src={product.images?.[selectedImage] || product.images?.[0] || "/images/placeholder.jpg"}
              alt={product.name}
            />
            {/* Thumbnail strip */}
            {product.images && product.images.length > 1 && (
              <div style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
              }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: "60px",
                      height: "60px",
                      border: selectedImage === i ? "2px solid #000" : "1px solid #e8e8e8",
                      padding: 0,
                      cursor: "pointer",
                      overflow: "hidden",
                      background: "none",
                    }}
                  >
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="product-detail-info">
            <p className="product-detail-breadcrumb">
              <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> /{" "}
              {product.name}
            </p>
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-price">
              ₹{product.price.toLocaleString()}
              {product.originalPrice && (
                <span
                  className="product-card-original-price"
                  style={{ fontSize: "1rem" }}
                >
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </p>
            <span
              className="product-badge badge-thrift"
              style={{ display: "inline-block", marginBottom: "24px" }}
            >
              {conditionLabel}
            </span>

            {/* Vendor Link */}
            {product.vendor && (
              <p style={{ marginBottom: "20px", fontSize: "0.85rem", color: "#888" }}>
                Sold by{" "}
                <Link
                  href={`/store/${product.vendor.slug}`}
                  style={{
                    color: "#111",
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  {product.vendor.storeName}
                </Link>
              </p>
            )}

            <p className="product-detail-desc">{product.description}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="size-selector">
                <h4>Size</h4>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
