"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import SkeletonProductDetail from "@/components/SkeletonProductDetail";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductDetail {
  _id: string;
  name: string;
  description: string;
  price: number;
  shippingPrice: number;
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addToCart } = useCart();

  // Swipe handling refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProduct = async (retries = 2) => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok && retries > 0) {
          // Retry on server errors (cold start / DB connection issues)
          await new Promise((r) => setTimeout(r, 500));
          return fetchProduct(retries - 1);
        }
        const data = await res.json();
        if (res.ok) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 500));
          return fetchProduct(retries - 1);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const totalImages = product?.images?.length || 0;

  const goToPrev = useCallback(() => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  }, [totalImages]);

  const goToNext = useCallback(() => {
    setSelectedImage((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  }, [totalImages]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNext(); // Swipe left → next image
      } else {
        goToPrev(); // Swipe right → prev image
      }
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      else if (e.key === "ArrowRight") goToNext();
      else if (e.key === "Escape") setLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToPrev, goToNext]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

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

  const isSoldOut = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = () => {
    if (!product || isSoldOut) return;
    
    // Provide a default size if product has no sizes or none selected
    const sizeToCart = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : "One Size");
    
    addToCart(
      {
        id: product._id,
        name: product.name,
        price: product.price,
        shippingPrice: product.shippingPrice || 0,
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
            {/* Main image with swipe support */}
            <div
              ref={imageContainerRef}
              className="product-image-swipe-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => setLightboxOpen(true)}
              style={{ cursor: "zoom-in" }}
            >
              <img
                src={product.images?.[selectedImage] || product.images?.[0] || "/images/placeholder.jpg"}
                alt={product.name}
                draggable={false}
              />

              {/* Image counter pill */}
              {totalImages > 1 && (
                <div className="image-counter-pill">
                  {selectedImage + 1} / {totalImages}
                </div>
              )}

              {/* Navigation arrows (desktop) */}
              {totalImages > 1 && (
                <>
                  <button
                    className="image-nav-btn image-nav-prev"
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} strokeWidth={3} />
                  </button>
                  <button
                    className="image-nav-btn image-nav-next"
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} strokeWidth={3} />
                  </button>
                </>
              )}
            </div>

            {/* Dot indicators for mobile */}
            {totalImages > 1 && (
              <div className="image-dots">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    className={`image-dot ${selectedImage === i ? "active" : ""}`}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail strip (desktop) */}
            {product.images && product.images.length > 1 && (
              <div className="product-thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`product-thumb ${selectedImage === i ? "active" : ""}`}
                  >
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
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

            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              style={isSoldOut ? { opacity: 0.5, cursor: "not-allowed", background: "#999" } : {}}
            >
              {isSoldOut ? "SOLD OUT" : added ? "✓ Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X size={24} strokeWidth={3} />
          </button>

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {totalImages > 1 && (
              <button
                className="lightbox-nav lightbox-nav-prev"
                onClick={goToPrev}
                aria-label="Previous image"
              >
                <ChevronLeft size={28} strokeWidth={3} />
              </button>
            )}

            <img
              src={product.images?.[selectedImage] || "/images/placeholder.jpg"}
              alt={product.name}
              className="lightbox-image"
              draggable={false}
            />

            {totalImages > 1 && (
              <button
                className="lightbox-nav lightbox-nav-next"
                onClick={goToNext}
                aria-label="Next image"
              >
                <ChevronRight size={28} strokeWidth={3} />
              </button>
            )}

            {/* Lightbox counter */}
            {totalImages > 1 && (
              <div className="lightbox-counter">
                {selectedImage + 1} / {totalImages}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
