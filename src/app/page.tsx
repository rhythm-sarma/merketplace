import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import "@/models/Vendor";

export const dynamic = 'force-dynamic';
export default async function Home() {
  await dbConnect();
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .limit(8)
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
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="hero-badge">Preloved</span>
            <span className="hero-badge">Curated</span>
            <span className="hero-badge">Sustainable</span>
          </div>
          <h1 className="hero-title">
            Your <span className="hero-highlight">Preloved</span>{" "}
            Fashion <span className="hero-highlight">racksup</span>
          </h1>
          <p className="hero-subtitle">
            Discover curated thrift finds, preloved gems, and sustainable
            fashion — all in one place. Shop smart, look great, save the planet.
          </p>
          <div className="hero-buttons">
            <Link href="/shop" className="btn-primary">
              Shop Now →
            </Link>
            <Link href="/vendor" className="btn-secondary">
              Start Selling
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">500+</span>
              <span className="hero-stat-label">Curated Pieces</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">50+</span>
              <span className="hero-stat-label">Trusted Vendors</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">Sustainable</span>
            </div>
          </div>
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

      {/* ============ CATEGORIES ============ */}
      <section className="categories">
        <div className="section-header">
          <span className="section-tag">Browse</span>
          <h2 className="section-title">Shop By Category</h2>
        </div>
        <div className="categories-grid">
          <Link href="/shop?category=men" style={{ textDecoration: "none" }}>
            <div className="category-card">
              <img
                src="/images/mens_cartoon.png"
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
                src="/images/womens_cartoon.png"
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
                src="/images/featured_cartoon.png"
                alt="Featured items"
              />
              <div className="category-card-overlay">
                <span className="category-card-title">Featured</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="featured">
        <div className="featured-inner">
          <div className="section-header">
            <span className="section-tag">Curated For You</span>
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
          <span className="cta-tag">For Sellers</span>
          <h2 className="cta-title">Start Selling Your Preloved Fashion</h2>
          <p className="cta-text">
            Join our community of vendors. List your thrift and preloved
            clothing, reach thousands of buyers, and turn your closet into cash.
          </p>
          <Link href="/vendor" className="btn-primary btn-large">
            Become A Vendor →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
