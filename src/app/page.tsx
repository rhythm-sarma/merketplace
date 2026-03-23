import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import "@/models/Vendor";

export default async function Home() {
  await dbConnect();
  // Fetch latest 4 products
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .limit(4)
    .populate("vendorId", "storeName slug")
    .lean();

  const featured = products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    image: p.images?.[0] || "/images/placeholder.jpg",
    condition: p.condition,
    // @ts-ignore
    vendorName: p.vendorId?.storeName,
    // @ts-ignore
    vendorSlug: p.vendorId?.slug,
  }));

  return (
    <>
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="hero" id="hero">
        <img
          className="hero-image"
          src="/images/clem-onojeghuo-HpEDSZukJqk-unsplash.jpg"
          alt="Marketplace building"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-tag">Preloved · Curated · New</p>
          <h1 className="hero-title">Your Preloved Marketplace</h1>
          <p className="hero-subtitle">
            Your one stop destination for all things thrifted
          </p>
          <Link href="/shop" className="hero-btn">
            Shop Now
          </Link>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="categories">
        <div className="section-header">
          <p className="section-tag">Browse</p>
          <h2 className="section-title">Shop By Category</h2>
        </div>
        <div className="categories-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <Link href="/shop?category=men" style={{ textDecoration: "none" }}>
            <div className="category-card">
              <img
                src="/images/prince-akachi-7j9jNQxXUCU-unsplash.jpg"
                alt="Mens fashion"
              />
              <div className="category-card-overlay">
                <span className="category-card-title">Mens</span>
              </div>
            </div>
          </Link>
          <Link href="/shop?category=women" style={{ textDecoration: "none" }}>
            <div className="category-card">
              <img
                src="/images/happy-face-emoji-mZ7ZsqrG4is-unsplash.jpg"
                alt="Womens fashion"
              />
              <div className="category-card-overlay">
                <span className="category-card-title">Womens</span>
              </div>
            </div>
          </Link>
          <Link href="/shop" style={{ textDecoration: "none" }}>
            <div className="category-card">
              <img
                src="/images/premium-featured.jpeg"
                alt="Featured items"
              />
              <div className="category-card-overlay">
                <span className="category-card-title">Featured</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <section className="marquee-section">
        <div className="marquee-track">
          {[...Array(3)].map((_, i) => (
            <span key={i}>
              <span className="marquee-item">
                Thrift <span className="marquee-dot">●</span>
              </span>
              <span className="marquee-item">
                Preloved <span className="marquee-dot">●</span>
              </span>
              <span className="marquee-item">
                Sustainable <span className="marquee-dot">●</span>
              </span>
              <span className="marquee-item">
                Curated <span className="marquee-dot">●</span>
              </span>
              <span className="marquee-item">
                Vintage <span className="marquee-dot">●</span>
              </span>
              <span className="marquee-item">
                Minimal <span className="marquee-dot">●</span>
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="featured">
        <div className="featured-inner">
          <div className="section-header">
            <p className="section-tag">Curated For You</p>
            <h2 className="section-title">Featured Pieces</h2>
          </div>
        <div className="products-grid">
            {featured.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#888", padding: "40px" }}>
                No products listed yet. Check back soon!
              </p>
            ) : (
              featured.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <p className="cta-tag">For Sellers</p>
          <h2 className="cta-title">Start Selling Your Preloved Fashion</h2>
          <p className="cta-text">
            Join our community of vendors. List your thrift and preloved
            clothing, reach thousands of buyers, and turn your closet into cash.
          </p>
          <Link href="/vendor" className="cta-btn">
            Become A Vendor
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
