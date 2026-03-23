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
          <h1 className="vd-page-title">Products</h1>
          <p className="vd-page-subtitle">Manage your store inventory.</p>
        </div>
        <Link href="/vendor/products/new" className="vd-add-btn">
          + Add Product
        </Link>
      </div>

      <div className="vd-table-card">
        <div className="vd-table-header">
          <h2 className="vd-table-title">All Products ({products.length})</h2>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
            <p>No products yet. Start by adding your first product!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="vd-table-wrap">
              <table className="vd-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Condition</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="td-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const status = getStatusLabel(product.stock);
                    return (
                      <tr key={product._id}>
                        <td className="td-bold">{product.name}</td>
                        <td className="td-bold">₹{product.price.toLocaleString()}</td>
                        <td>
                          <span className="vd-badge vd-badge-thrift">
                            {conditionLabel(product.condition)}
                          </span>
                        </td>
                        <td>{product.stock}</td>
                        <td>
                          <span className={`vd-badge ${getStatusClass(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="td-right">
                          <a
                            href={`/vendor/products/${product._id}/edit`}
                            className="vd-action-link"
                            style={{ marginRight: "12px" }}
                          >
                            Edit
                          </a>
                          <button
                            className="vd-action-link delete"
                            onClick={() => handleDelete(product._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="vd-mobile-cards">
              {products.map((product) => {
                const status = getStatusLabel(product.stock);
                return (
                  <div key={product._id} className="vd-mobile-card">
                    <div className="vd-mobile-card-top">
                      <span className="td-bold">{product.name}</span>
                      <span className={`vd-badge ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </div>
                    <div className="vd-mobile-card-info">
                      <p>
                        <span className="vd-mobile-price">₹{product.price.toLocaleString()}</span>
                        {" · "}
                        <span className="vd-badge vd-badge-thrift">
                          {conditionLabel(product.condition)}
                        </span>
                        {" · "}
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
