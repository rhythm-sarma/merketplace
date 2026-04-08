"use client";

import { useState, useEffect } from "react";

/* ─── Types ─── */
interface VendorData {
  _id: string;
  storeName: string;
  email: string;
  phone: string;
  name: string;
  warehouseAddress1: string;
  warehouseAddress2: string;
  primaryAddress: string;
  bankName: string;
  ifscCode: string;
  panNumber: string;
  upiId: string;
  accountHolderName: string;
  instaId: string;
  isVerified: boolean;
  onboardingComplete: boolean;
  createdAt: string;
}

interface VendorSalesOrder {
  orderId: string;
  date: string;
  items: { name: string; price: number; quantity: number; size: string }[];
  total: number;
}

interface VendorSales {
  vendorId: string;
  storeName: string;
  email: string;
  phone: string;
  bankName: string;
  accountHolderName: string;
  ifscCode: string;
  upiId: string;
  panNumber: string;
  isVerified: boolean;
  onboardingComplete: boolean;
  instaId: string;
  productCount: number;
  totalSales: number;
  orderCount: number;
  commission: number;
  payout: number;
  orders: VendorSalesOrder[];
}

interface StatsData {
  revenue: { totalRevenue: number; totalCommission: number; totalPayout: number };
  orders: { total: number; paid: number; pending: number; shipped: number; delivered: number };
  vendors: { total: number; verified: number; pending: number; incomplete: number };
  products: { total: number; outOfStock: number };
}

interface OrderData {
  _id: string;
  orderId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
    vendorId: string;
  }[];
  subtotal: number;
  shipping: number;
  processingFee: number;
  total: number;
  status: string;
  paymentStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

type TabKey = "dashboard" | "vendors" | "orders" | "settlements";

const INR = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/* ─── Component ─── */
export default function AdminPanel() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [salesData, setSalesData] = useState<VendorSales[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vendorProducts, setVendorProducts] = useState<Record<string, any[]>>({});

  // Expand state
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [expandedSettlements, setExpandedSettlements] = useState<Set<string>>(new Set());

  // Filters
  const [vendorFilter, setVendorFilter] = useState<"all" | "verified" | "pending" | "incomplete">("all");
  const [orderFilter, setOrderFilter] = useState<"all" | "paid" | "pending">("all");

  // Auth
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const adminHeaders = {
    "Content-Type": "application/json",
    "x-admin-secret": adminSecret,
  };

  /* ─── Data Fetching ─── */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vendorRes, salesRes, statsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/vendors", { headers: { "x-admin-secret": adminSecret } }),
        fetch("/api/admin/sales", { headers: { "x-admin-secret": adminSecret } }),
        fetch("/api/admin/stats", { headers: { "x-admin-secret": adminSecret } }),
        fetch("/api/admin/orders", { headers: { "x-admin-secret": adminSecret } }),
      ]);

      if (vendorRes.ok) {
        const d = await vendorRes.json();
        setVendors(d.vendors);
      }
      if (salesRes.ok) {
        const d = await salesRes.json();
        setSalesData(d.vendorSales);
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setAllOrders(d.orders);
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/admin/vendors", {
        headers: { "x-admin-secret": adminSecret },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setError("");
        fetchAll();
      } else {
        setError("Invalid admin secret.");
      }
    } catch {
      setError("Connection failed.");
    }
  };

  const handleVerify = async (vendorId: string) => {
    try {
      const res = await fetch("/api/admin/vendors/verify", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ vendorId }),
      });
      if (res.ok) {
        setVendors(vendors.map((v) => (v._id === vendorId ? { ...v, isVerified: true } : v)));
      }
    } catch (err) {
      console.error("Error verifying vendor", err);
    }
  };

  const toggleExpand = async (id: string, set: Set<string>, setter: (s: Set<string>) => void, isVendor = false) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      if (isVendor && !vendorProducts[id]) {
        try {
          const res = await fetch(`/api/admin/vendors/${id}/products`, { headers: adminHeaders });
          if (res.ok) {
            const data = await res.json();
            setVendorProducts(prev => ({ ...prev, [id]: data.products }));
          }
        } catch (err) {
          console.error("Error fetching vendor products", err);
        }
      }
    }
    setter(next);
  };

  const handleDeleteProduct = async (vendorId: string, productId: string) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (res.ok) {
        setVendorProducts(prev => ({
          ...prev,
          [vendorId]: prev[vendorId].filter((p: any) => p._id !== productId)
        }));
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product.");
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!window.confirm("CAUTION: Are you sure you want to PERMANENTLY delete this vendor AND all of their products? This action cannot be reversed.")) return;
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (res.ok) {
        setVendors(prev => prev.filter(v => v._id !== vendorId));
        setExpandedVendors(prev => {
          const next = new Set(prev);
          next.delete(vendorId);
          return next;
        });
      } else {
        alert("Failed to delete vendor.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting vendor.");
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  /* ─── Login Screen ─── */
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-box">
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <img src="/images/logo.svg" alt="racksup" style={{ height: "32px", margin: "0 auto" }} />
          </div>
          <h2 className="admin-login-title">Admin Panel</h2>
          <p className="admin-login-subtitle">Enter your admin secret to continue</p>
          {error && (
            <p style={{ color: "#e74c3c", marginBottom: "16px", textAlign: "center", fontSize: "0.9rem", fontWeight: 600 }}>
              {error}
            </p>
          )}
          <input
            type="password"
            placeholder="Admin Secret"
            className="admin-login-input"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button onClick={handleLogin} className="admin-login-btn">
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
            <p style={{ color: "var(--gray)", fontWeight: 600 }}>Loading admin data...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Filtered Data ─── */
  const filteredVendors =
    vendorFilter === "all"
      ? vendors
      : vendorFilter === "verified"
        ? vendors.filter((v) => v.isVerified)
        : vendorFilter === "pending"
          ? vendors.filter((v) => v.onboardingComplete && !v.isVerified)
          : vendors.filter((v) => !v.onboardingComplete);

  const filteredOrders =
    orderFilter === "all"
      ? allOrders
      : orderFilter === "paid"
        ? allOrders.filter((o) => o.paymentStatus === "Paid")
        : allOrders.filter((o) => o.paymentStatus === "Pending");

  // Find sales data for a vendor
  const getVendorSales = (vendorId: string) => salesData.find((s) => s.vendorId === vendorId);

  /* ─── Render ─── */
  return (
    <div className="admin-wrap">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <img src="/images/logo.svg" alt="racksup" className="admin-header-logo" />
          <span className="admin-header-title">ADMIN</span>
        </div>
        <nav className="admin-tabs">
          {(["dashboard", "vendors", "orders", "settlements"] as TabKey[]).map((t) => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <div className="admin-body">
        {/* ════════════ DASHBOARD ════════════ */}
        {tab === "dashboard" && stats && (
          <>
            <h2 className="admin-section-title">Dashboard</h2>
            <p className="admin-section-subtitle">Overview of your marketplace performance</p>

            {/* Revenue Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-label">Total Revenue</div>
                <div className="admin-stat-value">{INR(stats.revenue.totalRevenue)}</div>
                <div className="admin-stat-sub">From {stats.orders.paid} paid orders</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Your Commission (5%)</div>
                <div className="admin-stat-value yellow">{INR(stats.revenue.totalCommission)}</div>
                <div className="admin-stat-sub">Platform earnings</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Total Payouts Due</div>
                <div className="admin-stat-value green">{INR(stats.revenue.totalPayout)}</div>
                <div className="admin-stat-sub">Owed to vendors (95%)</div>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="admin-mini-stats">
              <div className="admin-mini-stat">
                <div className="admin-mini-stat-icon">📦</div>
                <div>
                  <div className="admin-mini-stat-label">Total Orders</div>
                  <div className="admin-mini-stat-value">{stats.orders.paid}</div>
                </div>
              </div>
              <div className="admin-mini-stat">
                <div className="admin-mini-stat-icon">🏪</div>
                <div>
                  <div className="admin-mini-stat-label">Vendors</div>
                  <div className="admin-mini-stat-value">
                    {stats.vendors.total}
                    <span style={{ fontSize: "0.75rem", color: "var(--gray)", marginLeft: "6px" }}>
                      ({stats.vendors.verified} verified)
                    </span>
                  </div>
                </div>
              </div>
              <div className="admin-mini-stat">
                <div className="admin-mini-stat-icon">👕</div>
                <div>
                  <div className="admin-mini-stat-label">Products</div>
                  <div className="admin-mini-stat-value">
                    {stats.products.total}
                    {stats.products.outOfStock > 0 && (
                      <span style={{ fontSize: "0.75rem", color: "#e74c3c", marginLeft: "6px" }}>
                        ({stats.products.outOfStock} out of stock)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="admin-mini-stat">
                <div className="admin-mini-stat-icon">⏳</div>
                <div>
                  <div className="admin-mini-stat-label">Pending Verification</div>
                  <div className="admin-mini-stat-value">{stats.vendors.pending}</div>
                </div>
              </div>
            </div>

            {/* Top Vendors */}
            <h3 className="admin-section-title" style={{ fontSize: "1.2rem", marginTop: "20px" }}>
              Top Vendors by Sales
            </h3>
            <p className="admin-section-subtitle">Ranked by total sales volume</p>

            {salesData.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">📊</div>
                <p>No sales data yet. Orders will appear here once customers start buying.</p>
              </div>
            ) : (
              <div>
                {salesData.slice(0, 5).map((s, idx) => (
                  <div className="admin-card" key={s.vendorId}>
                    <div className="admin-card-header" style={{ cursor: "default" }}>
                      <div className="admin-card-left">
                        <span style={{
                          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem",
                          width: "36px", height: "36px", display: "flex", alignItems: "center",
                          justifyContent: "center", background: "var(--accent)", border: "var(--border-thin)",
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="admin-card-name">{s.storeName}</span>
                          <span className="admin-card-meta"> · {s.orderCount} orders</span>
                        </div>
                      </div>
                      <div className="admin-card-right">
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Sales</div>
                          <div className="admin-card-metric-value">{INR(s.totalSales)}</div>
                        </div>
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Your Cut</div>
                          <div className="admin-card-metric-value" style={{ color: "#d4a800" }}>{INR(s.commission)}</div>
                        </div>
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Vendor Payout</div>
                          <div className="admin-card-metric-value" style={{ color: "#27ae60" }}>{INR(s.payout)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════ VENDORS ════════════ */}
        {tab === "vendors" && (
          <>
            <h2 className="admin-section-title">Vendors</h2>
            <p className="admin-section-subtitle">Manage all registered vendors and their verification status</p>

            <div className="admin-filters">
              {(["all", "verified", "pending", "incomplete"] as const).map((f) => (
                <button
                  key={f}
                  className={`admin-filter-btn ${vendorFilter === f ? "active" : ""}`}
                  onClick={() => setVendorFilter(f)}
                >
                  {f === "all" ? `All (${vendors.length})` :
                    f === "verified" ? `Verified (${vendors.filter((v) => v.isVerified).length})` :
                      f === "pending" ? `Pending (${vendors.filter((v) => v.onboardingComplete && !v.isVerified).length})` :
                        `Incomplete (${vendors.filter((v) => !v.onboardingComplete).length})`}
                </button>
              ))}
            </div>

            {filteredVendors.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">🏪</div>
                <p>No vendors match this filter.</p>
              </div>
            ) : (
              filteredVendors.map((v) => {
                const isOpen = expandedVendors.has(v._id);
                const vSales = getVendorSales(v._id);
                return (
                  <div className="admin-card" key={v._id}>
                    <div
                      className="admin-card-header"
                      onClick={() => toggleExpand(v._id, expandedVendors, setExpandedVendors, true)}
                    >
                      <div className="admin-card-left">
                        <span className={`admin-card-arrow ${isOpen ? "open" : ""}`}>▶</span>
                        <div>
                          <span className="admin-card-name">{v.storeName}</span>
                          <span className="admin-card-meta">{v.email}</span>
                          <span style={{ marginLeft: "8px" }}>
                            <span
                              className={`admin-badge ${v.isVerified ? "verified" : v.onboardingComplete ? "pending" : "incomplete"}`}
                            >
                              {v.isVerified ? "VERIFIED" : v.onboardingComplete ? "PENDING" : "INCOMPLETE"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="admin-card-right">
                        {vSales && (
                          <>
                            <div className="admin-card-metric">
                              <div className="admin-card-metric-label">Sales</div>
                              <div className="admin-card-metric-value">{INR(vSales.totalSales)}</div>
                            </div>
                            <div className="admin-card-metric">
                              <div className="admin-card-metric-label">Orders</div>
                              <div className="admin-card-metric-value">{vSales.orderCount}</div>
                            </div>
                          </>
                        )}
                        {!v.isVerified && v.onboardingComplete && (
                          <button
                            className="admin-verify-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerify(v._id);
                            }}
                          >
                            ✓ Verify
                          </button>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="admin-card-body">
                        <div className="admin-info-grid">
                          <div>
                            <strong>Owner Name:</strong> {v.name || "N/A"}
                            <br />
                            <strong>Phone:</strong> {v.phone || "N/A"}
                            <br />
                            <strong>Instagram:</strong> {v.instaId || "N/A"}
                            <br />
                            <strong>Registered:</strong> {new Date(v.createdAt).toLocaleDateString("en-IN")}
                          </div>
                          <div>
                            <strong>Bank:</strong> {v.bankName || "N/A"}
                            <br />
                            <strong>Account Holder:</strong> {v.accountHolderName || "N/A"}
                            <br />
                            <strong>IFSC:</strong> {v.ifscCode || "N/A"}
                            <br />
                            <strong>PAN:</strong> {v.panNumber || "N/A"}
                            <br />
                            <strong>UPI:</strong> {v.upiId || "N/A"}
                          </div>
                          <div className="admin-info-full">
                            <strong>Warehouse 1:</strong> {v.warehouseAddress1 || "N/A"}
                            <br />
                            {v.warehouseAddress2 && (
                              <>
                                <strong>Warehouse 2:</strong> {v.warehouseAddress2}
                                <br />
                              </>
                            )}
                            <strong>Primary Address:</strong>{" "}
                            {v.primaryAddress === "address1" ? v.warehouseAddress1 : v.warehouseAddress2 || "N/A"}
                          </div>
                        </div>

                        {vSales && (
                          <div className="admin-payout-box">
                            <div>
                              <strong>Total Sales</strong>
                              <br />
                              <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>{INR(vSales.totalSales)}</span>
                            </div>
                            <div>
                              <strong>Commission (5%)</strong>
                              <br />
                              <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e74c3c" }}>
                                -{INR(vSales.commission)}
                              </span>
                            </div>
                            <div>
                              <strong>Net Payout</strong>
                              <br />
                              <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#155724" }}>
                                {INR(vSales.payout)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Product Management */}
                        <div style={{ marginTop: "30px", borderTop: "2px solid #ddd", paddingTop: "20px" }}>
                          <h4 style={{ fontSize: "1.1rem", textTransform: "uppercase", marginBottom: "16px" }}>Vendor Products</h4>
                          
                          {!vendorProducts[v._id] ? (
                            <p>Loading products...</p>
                          ) : vendorProducts[v._id].length === 0 ? (
                            <p>This vendor has no products.</p>
                          ) : (
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>Image</th>
                                  <th>Name</th>
                                  <th>Price</th>
                                  <th>Stock</th>
                                  <th style={{ textAlign: "right" }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vendorProducts[v._id].map((product: any) => (
                                  <tr key={product._id}>
                                    <td style={{ width: "60px" }}>
                                      <img src={product.image} alt={product.name} style={{ width: "40px", height: "40px", objectFit: "cover", border: "1px solid #ccc" }} />
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                                    <td>{INR(product.price)}</td>
                                    <td>{product.stock}</td>
                                    <td style={{ textAlign: "right" }}>
                                      <button 
                                        onClick={() => handleDeleteProduct(v._id, product._id)}
                                        style={{ background: "#e74c3c", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold" }}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Danger Zone */}
                        <div style={{ marginTop: "40px", background: "#fdf2f2", border: "2px solid #e74c3c", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <h4 style={{ color: "#e74c3c", margin: "0 0 5px", textTransform: "uppercase" }}>Danger Zone</h4>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>Permanently delete this vendor and all of their products.</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteVendor(v._id)}
                            style={{ background: "#e74c3c", color: "white", padding: "10px 20px", border: "none", fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px" }}
                          >
                            Delete Vendor
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ════════════ ORDERS ════════════ */}
        {tab === "orders" && (
          <>
            <h2 className="admin-section-title">Orders</h2>
            <p className="admin-section-subtitle">All customer orders across all vendors</p>

            <div className="admin-filters">
              {(["all", "paid", "pending"] as const).map((f) => (
                <button
                  key={f}
                  className={`admin-filter-btn ${orderFilter === f ? "active" : ""}`}
                  onClick={() => setOrderFilter(f)}
                >
                  {f === "all" ? `All (${allOrders.length})` :
                    f === "paid" ? `Paid (${allOrders.filter((o) => o.paymentStatus === "Paid").length})` :
                      `Pending (${allOrders.filter((o) => o.paymentStatus === "Pending").length})`}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">📦</div>
                <p>No orders match this filter.</p>
              </div>
            ) : (
              filteredOrders.map((o) => {
                const isOpen = expandedOrders.has(o._id);
                const itemSubtotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
                return (
                  <div className="admin-card" key={o._id}>
                    <div
                      className="admin-card-header"
                      onClick={() => toggleExpand(o._id, expandedOrders, setExpandedOrders)}
                    >
                      <div className="admin-card-left">
                        <span className={`admin-card-arrow ${isOpen ? "open" : ""}`}>▶</span>
                        <div>
                          <span className="admin-card-name">{o.orderId}</span>
                          <span className="admin-card-meta">
                            {" "}
                            · {o.customer.firstName} {o.customer.lastName}
                          </span>
                          <span style={{ marginLeft: "8px" }}>
                            <span className={`admin-badge ${o.paymentStatus.toLowerCase()}`}>
                              {o.paymentStatus}
                            </span>
                          </span>
                          {o.paymentStatus === "Paid" && (
                            <span style={{ marginLeft: "4px" }}>
                              <span className={`admin-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="admin-card-right">
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Date</div>
                          <div className="admin-card-metric-value" style={{ fontSize: "0.85rem" }}>
                            {new Date(o.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Items</div>
                          <div className="admin-card-metric-value">{o.items.length}</div>
                        </div>
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Total</div>
                          <div className="admin-card-metric-value">{INR(o.total)}</div>
                        </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="admin-card-body">
                        {/* Customer Info */}
                        <div className="admin-info-grid">
                          <div>
                            <strong>Customer:</strong> {o.customer.firstName} {o.customer.lastName}
                            <br />
                            <strong>Email:</strong> {o.customer.email}
                            <br />
                            <strong>Phone:</strong> {o.customer.phone}
                          </div>
                          <div>
                            <strong>Address:</strong> {o.customer.address}
                            {o.customer.address2 ? `, ${o.customer.address2}` : ""}
                            <br />
                            <strong>City:</strong> {o.customer.city}, {o.customer.state} — {o.customer.postalCode}
                            <br />
                            {o.razorpayPaymentId && (
                              <>
                                <strong>Razorpay ID:</strong> {o.razorpayPaymentId}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Items Table */}
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Size</th>
                              <th style={{ textAlign: "right" }}>Price</th>
                              <th style={{ textAlign: "right" }}>Qty</th>
                              <th style={{ textAlign: "right" }}>Subtotal</th>
                              <th style={{ textAlign: "right" }}>Commission (5%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items.map((item, idx) => {
                              const sub = item.price * item.quantity;
                              const comm = Math.round(sub * 0.05 * 100) / 100;
                              return (
                                <tr key={idx}>
                                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                                  <td>{item.size}</td>
                                  <td style={{ textAlign: "right" }}>{INR(item.price)}</td>
                                  <td style={{ textAlign: "right" }}>{item.quantity}</td>
                                  <td style={{ textAlign: "right" }}>{INR(sub)}</td>
                                  <td style={{ textAlign: "right", color: "#e74c3c" }}>-{INR(comm)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Order Totals */}
                        <div style={{
                          marginTop: "16px", padding: "12px 16px", background: "var(--off-white)",
                          border: "var(--border-thin)", display: "flex", justifyContent: "space-between",
                          flexWrap: "wrap", gap: "12px", fontSize: "0.9rem",
                        }}>
                          <div><strong>Subtotal:</strong> {INR(itemSubtotal)}</div>
                          <div><strong>Shipping:</strong> {INR(o.shipping)}</div>
                          <div><strong>Processing Fee:</strong> {INR(o.processingFee)}</div>
                          <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                            <strong>Total Charged:</strong> {INR(o.total)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ════════════ SETTLEMENTS ════════════ */}
        {tab === "settlements" && (
          <>
            <h2 className="admin-section-title">Settlements</h2>
            <p className="admin-section-subtitle">
              Vendor payouts after 5% commission deduction. Use the bank details below to settle payments.
            </p>

            {/* Totals */}
            {salesData.length > 0 && (
              <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Total Product Sales</div>
                  <div className="admin-stat-value">
                    {INR(salesData.reduce((s, v) => s + v.totalSales, 0))}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Total Commission Earned</div>
                  <div className="admin-stat-value yellow">
                    {INR(salesData.reduce((s, v) => s + v.commission, 0))}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Total Due to Vendors</div>
                  <div className="admin-stat-value green">
                    {INR(salesData.reduce((s, v) => s + v.payout, 0))}
                  </div>
                </div>
              </div>
            )}

            {salesData.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">💰</div>
                <p>No settlement data yet. Sales will appear here once orders are paid.</p>
              </div>
            ) : (
              salesData.map((s) => {
                const isOpen = expandedSettlements.has(s.vendorId);
                return (
                  <div className="admin-card" key={s.vendorId}>
                    <div
                      className="admin-card-header"
                      onClick={() => toggleExpand(s.vendorId, expandedSettlements, setExpandedSettlements)}
                    >
                      <div className="admin-card-left">
                        <span className={`admin-card-arrow ${isOpen ? "open" : ""}`}>▶</span>
                        <div>
                          <span className="admin-card-name">{s.storeName}</span>
                          <span className="admin-card-meta"> · {s.orderCount} orders · {s.productCount} products</span>
                          <span style={{ marginLeft: "8px" }}>
                            <span className={`admin-badge ${s.isVerified ? "verified" : "pending"}`}>
                              {s.isVerified ? "VERIFIED" : "UNVERIFIED"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="admin-card-right">
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Total Sales</div>
                          <div className="admin-card-metric-value" style={{ fontSize: "1.1rem" }}>{INR(s.totalSales)}</div>
                        </div>
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Your Cut (5%)</div>
                          <div className="admin-card-metric-value" style={{ color: "#d4a800" }}>{INR(s.commission)}</div>
                        </div>
                        <div className="admin-card-metric">
                          <div className="admin-card-metric-label">Pay Vendor</div>
                          <div className="admin-card-metric-value" style={{ color: "#27ae60", fontSize: "1.1rem" }}>
                            {INR(s.payout)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="admin-card-body">
                        {/* Bank Details for Settlement */}
                        <div className="admin-payout-box">
                          <div>
                            <strong>Account Holder:</strong>
                            <br />
                            {s.accountHolderName}
                          </div>
                          <div>
                            <strong>Bank:</strong> {s.bankName}
                            <br />
                            <strong>IFSC:</strong> {s.ifscCode}
                          </div>
                          <div>
                            <strong>UPI ID:</strong>
                            <br />
                            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#155724" }}>{s.upiId}</span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div style={{ marginTop: "12px", fontSize: "0.9rem", color: "var(--gray)" }}>
                          <strong style={{ color: "var(--black)" }}>Email:</strong> {s.email} &nbsp;|&nbsp;{" "}
                          <strong style={{ color: "var(--black)" }}>Phone:</strong> {s.phone} &nbsp;|&nbsp;{" "}
                          <strong style={{ color: "var(--black)" }}>PAN:</strong> {s.panNumber}
                        </div>

                        {/* Order Breakdown */}
                        <h4 style={{
                          marginTop: "20px", marginBottom: "4px", textTransform: "uppercase",
                          fontSize: "0.75rem", letterSpacing: "1.5px", color: "var(--gray)",
                        }}>
                          Order-wise Breakdown
                        </h4>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Date</th>
                              <th>Items</th>
                              <th style={{ textAlign: "right" }}>Amount</th>
                              <th style={{ textAlign: "right" }}>5% Cut</th>
                              <th style={{ textAlign: "right" }}>To Pay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.orders.map((o, i) => {
                              const cut = Math.round(o.total * 0.05 * 100) / 100;
                              const pay = Math.round((o.total - cut) * 100) / 100;
                              return (
                                <tr key={i}>
                                  <td style={{ fontWeight: 600 }}>{o.orderId}</td>
                                  <td>{new Date(o.date).toLocaleDateString("en-IN")}</td>
                                  <td>
                                    {o.items.map((item: any, j: number) => (
                                      <div key={j}>
                                        {item.name} × {item.quantity} ({item.size})
                                      </div>
                                    ))}
                                  </td>
                                  <td style={{ textAlign: "right" }}>{INR(o.total)}</td>
                                  <td style={{ textAlign: "right", color: "#e74c3c" }}>-{INR(cut)}</td>
                                  <td style={{ textAlign: "right", fontWeight: 700, color: "#27ae60" }}>{INR(pay)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
