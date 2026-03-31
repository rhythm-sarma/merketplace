"use client";

import { useState, useEffect } from "react";

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
  totalSales: number;
  orderCount: number;
  commission: number;
  payout: number;
  orders: VendorSalesOrder[];
}

export default function AdminPanel() {
  const [tab, setTab] = useState<"verification" | "sales">("verification");
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [salesData, setSalesData] = useState<VendorSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      setError("Admin panel is only available in local development.");
      setLoading(false);
      return;
    }
    fetchVendors();
    fetchSales();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/admin/vendors");
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors);
      }
    } catch (err) {
      console.error("Fetch vendors error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/admin/sales");
      if (res.ok) {
        const data = await res.json();
        setSalesData(data.vendorSales);
      }
    } catch (err) {
      console.error("Fetch sales error", err);
    }
  };

  const handleVerify = async (vendorId: string) => {
    try {
      const res = await fetch("/api/admin/vendors/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });
      if (res.ok) {
        setVendors(vendors.map(v => v._id === vendorId ? { ...v, isVerified: true } : v));
      }
    } catch (err) {
      console.error("Error verifying vendor", err);
    }
  };

  const toggleExpand = (id: string, set: Set<string>, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  if (error) {
    return (
      <div style={{ padding: "100px 40px", textAlign: "center", color: "red" }}>
        <h2>{error}</h2>
      </div>
    );
  }

  if (loading) return <div style={{ padding: "100px 40px", textAlign: "center" }}>Loading admin...</div>;

  const pendingVendors = vendors.filter(v => v.onboardingComplete && !v.isVerified);
  const verifiedVendors = vendors.filter(v => v.isVerified);
  const incompleteVendors = vendors.filter(v => !v.onboardingComplete);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8" }}>
      {/* Admin Header */}
      <header style={{
        background: "var(--black)", color: "var(--white)", padding: "20px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img src="/images/logo.svg" alt="racksup" style={{ height: "36px", filter: "invert(1)" }} />
          <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "1px" }}>ADMIN PANEL</span>
        </div>
        <nav style={{ display: "flex", gap: "0" }}>
          <button
            onClick={() => setTab("verification")}
            style={{
              padding: "10px 28px", fontWeight: 700, fontSize: "0.9rem",
              border: "2px solid var(--yellow)", cursor: "pointer",
              background: tab === "verification" ? "var(--yellow)" : "transparent",
              color: tab === "verification" ? "var(--black)" : "var(--yellow)",
              letterSpacing: "1px",
            }}
          >
            VERIFICATION
          </button>
          <button
            onClick={() => setTab("sales")}
            style={{
              padding: "10px 28px", fontWeight: 700, fontSize: "0.9rem",
              border: "2px solid var(--yellow)", borderLeft: "none", cursor: "pointer",
              background: tab === "sales" ? "var(--yellow)" : "transparent",
              color: tab === "sales" ? "var(--black)" : "var(--yellow)",
              letterSpacing: "1px",
            }}
          >
            SALES
          </button>
        </nav>
      </header>

      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 40px" }}>

        {/* ─── VERIFICATION TAB ─── */}
        {tab === "verification" && (
          <>
            {/* Pending */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", marginBottom: "24px" }}>
              Pending Verification ({pendingVendors.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "60px" }}>
              {pendingVendors.length === 0 && <p style={{ color: "var(--gray)" }}>No pending vendors.</p>}
              {pendingVendors.map((v) => {
                const isOpen = expandedVendors.has(v._id);
                return (
                  <div key={v._id} style={{ border: "var(--border)", background: "white", boxShadow: "var(--shadow-sm)" }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "16px 24px", cursor: "pointer",
                      }}
                      onClick={() => toggleExpand(v._id, expandedVendors, setExpandedVendors)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "1.2rem" }}>▶</span>
                        <div>
                          <strong style={{ fontSize: "1.05rem" }}>{v.storeName}</strong>
                          <span style={{ color: "var(--gray)", marginLeft: "12px", fontSize: "0.9rem" }}>{v.email}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleVerify(v._id); }}
                        style={{
                          padding: "8px 24px", background: "var(--yellow)", border: "var(--border)",
                          fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        ✓ Verify
                      </button>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--lighter-gray)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px", fontSize: "0.95rem" }}>
                          <div>
                            <strong>Name:</strong> {v.name || "N/A"}<br/>
                            <strong>Phone:</strong> {v.phone || "N/A"}<br/>
                            <strong>Instagram:</strong> {v.instaId || "N/A"}<br/>
                            <strong>Registered:</strong> {new Date(v.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Bank:</strong> {v.bankName || "N/A"}<br/>
                            <strong>Account Holder:</strong> {v.accountHolderName || "N/A"}<br/>
                            <strong>IFSC:</strong> {v.ifscCode || "N/A"}<br/>
                            <strong>PAN:</strong> {v.panNumber || "N/A"}<br/>
                            <strong>UPI:</strong> {v.upiId || "N/A"}
                          </div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            <strong>Warehouse 1:</strong> {v.warehouseAddress1 || "N/A"}<br/>
                            {v.warehouseAddress2 && <><strong>Warehouse 2:</strong> {v.warehouseAddress2}<br/></>}
                            <strong>Primary Delivery Address:</strong> {v.primaryAddress === "address1" ? v.warehouseAddress1 : v.warehouseAddress2 || "N/A"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Verified */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", marginBottom: "24px" }}>
              Verified Vendors ({verifiedVendors.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "60px" }}>
              {verifiedVendors.length === 0 && <p style={{ color: "var(--gray)" }}>No verified vendors yet.</p>}
              {verifiedVendors.map((v) => {
                const isOpen = expandedVendors.has(v._id);
                return (
                  <div key={v._id} style={{ border: "1px solid var(--lighter-gray)", background: "white" }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "16px 24px", cursor: "pointer",
                      }}
                      onClick={() => toggleExpand(v._id, expandedVendors, setExpandedVendors)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "1.2rem" }}>▶</span>
                        <div>
                          <strong style={{ fontSize: "1.05rem" }}>{v.storeName}</strong>
                          <span style={{ color: "var(--gray)", marginLeft: "12px", fontSize: "0.9rem" }}>{v.email}</span>
                          <span style={{ marginLeft: "12px", background: "#d4edda", color: "#155724", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700, borderRadius: "2px" }}>VERIFIED</span>
                        </div>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--lighter-gray)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px", fontSize: "0.95rem" }}>
                          <div>
                            <strong>Name:</strong> {v.name || "N/A"}<br/>
                            <strong>Phone:</strong> {v.phone || "N/A"}<br/>
                            <strong>Instagram:</strong> {v.instaId || "N/A"}<br/>
                            <strong>Registered:</strong> {new Date(v.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Bank:</strong> {v.bankName || "N/A"}<br/>
                            <strong>Account Holder:</strong> {v.accountHolderName || "N/A"}<br/>
                            <strong>IFSC:</strong> {v.ifscCode || "N/A"}<br/>
                            <strong>PAN:</strong> {v.panNumber || "N/A"}<br/>
                            <strong>UPI:</strong> {v.upiId || "N/A"}
                          </div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            <strong>Warehouse 1:</strong> {v.warehouseAddress1 || "N/A"}<br/>
                            {v.warehouseAddress2 && <><strong>Warehouse 2:</strong> {v.warehouseAddress2}<br/></>}
                            <strong>Primary Delivery Address:</strong> {v.primaryAddress === "address1" ? v.warehouseAddress1 : v.warehouseAddress2 || "N/A"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Incomplete */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", marginBottom: "12px" }}>
              Incomplete Onboarding ({incompleteVendors.length})
            </h2>
            <p style={{ color: "var(--gray)", marginBottom: "24px", fontSize: "0.9rem" }}>Registered but haven't submitted their business details yet.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {incompleteVendors.length === 0 && <p style={{ color: "var(--gray)" }}>None.</p>}
              {incompleteVendors.map((v) => {
                const isOpen = expandedVendors.has(v._id);
                return (
                  <div key={v._id} style={{ border: "1px solid var(--lighter-gray)", background: "white" }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "16px 24px", cursor: "pointer",
                      }}
                      onClick={() => toggleExpand(v._id, expandedVendors, setExpandedVendors)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "1.2rem" }}>▶</span>
                        <div>
                          <strong style={{ fontSize: "1.05rem" }}>{v.storeName}</strong>
                          <span style={{ color: "var(--gray)", marginLeft: "12px", fontSize: "0.9rem" }}>{v.email}</span>
                          <span style={{ marginLeft: "12px", background: "#fff3cd", color: "#856404", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700, borderRadius: "2px" }}>INCOMPLETE</span>
                        </div>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--lighter-gray)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px", fontSize: "0.95rem", color: "var(--gray)" }}>
                          <div>
                            <strong style={{ color: "var(--black)" }}>Name:</strong> {v.name || "Not provided"}<br/>
                            <strong style={{ color: "var(--black)" }}>Phone:</strong> {v.phone || "Not provided"}<br/>
                            <strong style={{ color: "var(--black)" }}>Registered:</strong> {new Date(v.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <strong style={{ color: "var(--black)" }}>Bank:</strong> {v.bankName || "Not provided"}<br/>
                            <strong style={{ color: "var(--black)" }}>UPI:</strong> {v.upiId || "Not provided"}<br/>
                            <strong style={{ color: "var(--black)" }}>Address:</strong> {v.warehouseAddress1 || "Not provided"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ─── SALES TAB ─── */}
        {tab === "sales" && (
          <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", marginBottom: "24px" }}>
              Vendor Sales & Payouts
            </h2>

            {salesData.length === 0 && <p style={{ color: "var(--gray)" }}>No sales data yet.</p>}

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {salesData.map((s) => {
                const isOpen = expandedSales.has(s.vendorId);
                return (
                  <div key={s.vendorId} style={{ border: "var(--border)", background: "white", boxShadow: "var(--shadow-sm)" }}>
                    {/* Summary Row */}
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "20px 24px", cursor: "pointer", flexWrap: "wrap", gap: "12px",
                      }}
                      onClick={() => toggleExpand(s.vendorId, expandedSales, setExpandedSales)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "1.2rem" }}>▶</span>
                        <div>
                          <strong style={{ fontSize: "1.1rem" }}>{s.storeName}</strong>
                          <span style={{ color: "var(--gray)", marginLeft: "12px", fontSize: "0.85rem" }}>{s.orderCount} orders</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "32px", alignItems: "center", fontSize: "0.95rem" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "var(--gray)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total Sales</div>
                          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>₹{s.totalSales.toLocaleString("en-IN")}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "var(--gray)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Our Cut (5%)</div>
                          <div style={{ fontWeight: 700, color: "#e74c3c" }}>₹{s.commission.toLocaleString("en-IN")}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "var(--gray)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Pay Vendor</div>
                          <div style={{ fontWeight: 700, color: "#27ae60", fontSize: "1.1rem" }}>₹{s.payout.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isOpen && (
                      <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--lighter-gray)" }}>
                        {/* Payment Details */}
                        <div style={{
                          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px",
                          marginTop: "16px", padding: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0",
                          fontSize: "0.9rem",
                        }}>
                          <div>
                            <strong>Account Holder:</strong><br/>{s.accountHolderName}
                          </div>
                          <div>
                            <strong>Bank:</strong> {s.bankName}<br/>
                            <strong>IFSC:</strong> {s.ifscCode}
                          </div>
                          <div>
                            <strong>UPI ID:</strong><br/>
                            <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#155724" }}>{s.upiId}</span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div style={{ marginTop: "12px", fontSize: "0.9rem", color: "var(--gray)" }}>
                          <strong style={{ color: "var(--black)" }}>Email:</strong> {s.email} &nbsp;|&nbsp; <strong style={{ color: "var(--black)" }}>Phone:</strong> {s.phone}
                        </div>

                        {/* Order Breakdown */}
                        <h4 style={{ marginTop: "20px", marginBottom: "12px", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px", color: "var(--gray)" }}>Order History</h4>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid var(--black)", textAlign: "left" }}>
                              <th style={{ padding: "8px 12px" }}>Order ID</th>
                              <th style={{ padding: "8px 12px" }}>Date</th>
                              <th style={{ padding: "8px 12px" }}>Items</th>
                              <th style={{ padding: "8px 12px", textAlign: "right" }}>Amount</th>
                              <th style={{ padding: "8px 12px", textAlign: "right" }}>5% Cut</th>
                              <th style={{ padding: "8px 12px", textAlign: "right" }}>To Pay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.orders.map((o, i) => {
                              const cut = Math.round(o.total * 0.05 * 100) / 100;
                              const pay = Math.round((o.total - cut) * 100) / 100;
                              return (
                                <tr key={i} style={{ borderBottom: "1px solid var(--lighter-gray)" }}>
                                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{o.orderId}</td>
                                  <td style={{ padding: "8px 12px" }}>{new Date(o.date).toLocaleDateString("en-IN")}</td>
                                  <td style={{ padding: "8px 12px" }}>
                                    {o.items.map((item: any, j: number) => (
                                      <div key={j}>{item.name} × {item.quantity} ({item.size})</div>
                                    ))}
                                  </td>
                                  <td style={{ padding: "8px 12px", textAlign: "right" }}>₹{o.total.toLocaleString("en-IN")}</td>
                                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#e74c3c" }}>-₹{cut.toLocaleString("en-IN")}</td>
                                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#27ae60" }}>₹{pay.toLocaleString("en-IN")}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
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
