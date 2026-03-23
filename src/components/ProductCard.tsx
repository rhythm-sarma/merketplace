import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  condition: string;
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
  vendorName,
  vendorSlug,
}: ProductCardProps) {
  const badgeLabel = condition || "—";

  return (
    <div className="product-card">
      <Link href={`/shop/${id}`} style={{ textDecoration: "none" }}>
        <div className="product-card-image">
          <img src={image} alt={name} />
          <span className="product-badge badge-thrift">{badgeLabel}</span>
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
