"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  condition: string;
  stock: number;
  images: string[];
}

function getStatusLabel(stock: number) {
  if (stock === 0) return "Out of Stock";
  if (stock <= 2) return "Low Stock";
  return "Active";
}

function getStatusClass(status: string) {
  switch (status) {
    case "Active": return "vd-badge-active";
    case "Low Stock": return "vd-badge-lowstock";
    case "Out of Stock": return "vd-badge-outofstock";
    default: return "vd-badge-active";
  }
}

function conditionLabel(c: string) {
  return c || "—";
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?mine=true");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="vd-page-header">
          <h1 className="vd-page-title">Products</h1>
          <p className="vd-page-subtitle">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="vd-page-header-row">
        <div>
          <h1 className="vd-page-title">Inventory</h1>
          <p className="vd-page-subtitle">Manage your product listings and stock levels.</p>
        </div>
        <Link href="/vendor/products/new" className="vd-add-btn">
          LIST NEW PRODUCT
        </Link>
      </div>

      <div className="vd-table-card">
        <div className="vd-table-header">
          <h2 className="vd-table-title">All Items ({products.length})</h2>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: "80px 40px", textAlign: "center" }}>
            <p style={{ color: "#888", fontSize: "1.1rem", marginBottom: "24px" }}>
              Your inventory is currently empty.
            </p>
            <Link href="/vendor/products/new" className="vd-add-btn">
              ADD YOUR FIRST ITEM
            </Link>
          </div>
        ) : (
          <div className="vd-table-wrap">
            <table className="vd-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = getStatusLabel(product.stock);
                  return (
                    <tr key={product._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            border: '2px solid #000',
                            background: '#eee',
                            flexShrink: 0,
                            overflow: 'hidden'
                          }}>
                            {product.images?.[0] && (
                              <img 
                                src={product.images[0]} 
                                alt="" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                          <span style={{ fontWeight: '700' }}>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: '800' }}>₹{product.price.toLocaleString()}</td>
                      <td>
                        <span className={`vd-badge ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700' }}>{product.stock}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          href={`/vendor/products/${product._id}/edit`}
                          className="vd-action-link"
                          style={{ marginRight: '16px' }}
                        >
                          EDIT
                        </Link>
                        <button
                          className="vd-action-link delete"
                          onClick={() => handleDelete(product._id)}
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
