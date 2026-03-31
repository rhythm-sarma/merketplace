import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  condition: string;
  stock?: number;
  vendorName?: string;
  vendorSlug?: string;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  condition,
  stock,
  vendorName,
  vendorSlug,
}: ProductCardProps) {
  const badgeLabel = condition || "—";
  const isSoldOut = stock !== undefined && stock <= 0;

  return (
    <div className="product-card">
      <Link href={`/shop/${id}`} style={{ textDecoration: "none" }}>
        <div className="product-card-image" style={{ position: "relative" }}>
          <img src={image} alt={name} style={isSoldOut ? { opacity: 0.4, filter: "grayscale(100%)" } : {}} />
          <span className="product-badge badge-thrift">{badgeLabel}</span>
          {isSoldOut && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                background: "var(--black)", color: "var(--white)",
                padding: "8px 20px", fontWeight: 800, fontSize: "0.9rem",
                letterSpacing: "2px", border: "2px solid var(--white)",
              }}>SOLD OUT</span>
            </div>
          )}
        </div>
      </Link>
      <div className="product-card-info">
        <Link href={`/shop/${id}`} style={{ textDecoration: "none" }}>
          <p className="product-card-name">{name}</p>
        </Link>
        <p className="product-card-price">
          ₹{price.toLocaleString()}
          {originalPrice && (
            <span className="product-card-original-price">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </p>
        {vendorName && vendorSlug && (
          <Link
            href={`/store/${vendorSlug}`}
            className="product-card-vendor"
            style={{
              display: "block",
              fontSize: "0.75rem",
              color: "#888",
              marginTop: "6px",
              textDecoration: "none",
            }}
          >
            by <span style={{ textDecoration: "underline", color: "#555" }}>{vendorName}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
