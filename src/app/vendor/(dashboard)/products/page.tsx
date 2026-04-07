"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

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

function SkeletonProductsTable() {
  return (
    <div>
      <div className="vd-page-header-row">
        <div>
          <div className="vd-skeleton-line h-20 w-40" style={{ marginBottom: '12px' }} />
          <div className="vd-skeleton-line h-10 w-60" />
        </div>
        <div className="vd-skeleton-line h-48" style={{ width: '180px', marginBottom: 0 }} />
      </div>
      <div className="vd-table-card">
        <div style={{ padding: '20px 32px' }}>
          <div className="vd-skeleton-line h-10 w-40" style={{ marginBottom: 0 }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 32px', borderTop: '2px solid #eee' }}>
            <div className="vd-skeleton-circle" />
            <div style={{ flex: 1 }}>
              <div className="vd-skeleton-line w-60" style={{ marginBottom: '8px' }} />
              <div className="vd-skeleton-line w-40 h-10" style={{ marginBottom: 0 }} />
            </div>
            <div className="vd-skeleton-line h-20" style={{ width: '80px', marginBottom: 0 }} />
            <div className="vd-skeleton-line h-20" style={{ width: '60px', marginBottom: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget._id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <SkeletonProductsTable />;

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
                          onClick={() => setDeleteTarget(product)}
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

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="vd-confirm-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="vd-confirm" onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              width: '64px', height: '64px', 
              background: '#ff4444', border: '4px solid #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Trash2 size={28} strokeWidth={3} color="#fff" />
            </div>
            <h2 className="vd-confirm-title">DELETE PRODUCT?</h2>
            <p className="vd-confirm-text">
              &ldquo;{deleteTarget.name}&rdquo; will be permanently removed. This action cannot be undone.
            </p>
            <div className="vd-confirm-actions">
              <button 
                className="vd-confirm-cancel" 
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                CANCEL
              </button>
              <button 
                className="vd-confirm-delete" 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "DELETING..." : "YES, DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
