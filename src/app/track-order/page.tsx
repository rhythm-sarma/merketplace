"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface OrderItem {
  name: string;
  quantity: number;
  size: string;
  price: number;
  image: string;
}

interface TrackedOrder {
  orderId: string;
  status: "Pending" | "Shipped" | "Delivered";
  paymentStatus: "Pending" | "Paid" | "Failed";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  customer: { firstName: string; city: string; state: string };
}

const statusSteps = ["Pending", "Shipped", "Delivered"];

function getStepIndex(status: string) {
  return statusSteps.indexOf(status);
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setOrder(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || "Order not found");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = order ? getStepIndex(order.status) : -1;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "120px auto 80px", padding: "0 20px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "8px" }}>Track Your Order</h1>
        <p style={{ color: "var(--gray)", marginBottom: "32px" }}>
          Enter your Order ID and the email you used at checkout.
        </p>

        <form onSubmit={handleTrack} style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}>
          <input
            type="text"
            placeholder="Order ID (e.g. #ORD-0001)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            style={{ flex: "1 1 200px", padding: "12px", border: "var(--border-thin)", outline: "none", fontFamily: "var(--font-sans)" }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ flex: "1 1 200px", padding: "12px", border: "var(--border-thin)", outline: "none", fontFamily: "var(--font-sans)" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 32px", background: "var(--black)", color: "var(--white)",
              border: "none", fontWeight: 700, cursor: "pointer",
              opacity: loading ? 0.6 : 1, fontFamily: "var(--font-sans)",
            }}
          >
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "14px 20px", border: "2px solid #b91c1c", marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {order && (
          <div style={{ border: "var(--border)", padding: "32px", background: "white", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{order.orderId}</h2>
                <p style={{ color: "var(--gray)", fontSize: "0.85rem", margin: "4px 0 0" }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <span style={{
                padding: "6px 16px", fontWeight: 700, fontSize: "0.85rem",
                background: order.paymentStatus === "Paid" ? "#d4edda" : "#fff3cd",
                color: order.paymentStatus === "Paid" ? "#155724" : "#856404",
              }}>
                {order.paymentStatus === "Paid" ? "Payment Confirmed" : order.paymentStatus}
              </span>
            </div>

            {/* Status Progress Bar */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "0" }}>
              {statusSteps.map((step, i) => (
                <div key={step} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {i > 0 && (
                      <div style={{
                        flex: 1, height: "3px",
                        background: i <= stepIdx ? "var(--yellow)" : "var(--lighter-gray)",
                      }} />
                    )}
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: i <= stepIdx ? "var(--yellow)" : "var(--lighter-gray)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "0.8rem", flexShrink: 0,
                      border: i <= stepIdx ? "2px solid var(--black)" : "2px solid var(--lighter-gray)",
                    }}>
                      {i <= stepIdx ? "✓" : i + 1}
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div style={{
                        flex: 1, height: "3px",
                        background: i < stepIdx ? "var(--yellow)" : "var(--lighter-gray)",
                      }} />
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", marginTop: "6px", fontWeight: i <= stepIdx ? 700 : 400, color: i <= stepIdx ? "var(--black)" : "var(--gray)" }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Items */}
            <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--gray)", marginBottom: "12px" }}>Items</h3>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--lighter-gray)" }}>
                <img src={item.image || "/images/placeholder.jpg"} alt={item.name} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>{item.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--gray)" }}>Qty: {item.quantity} · Size: {item.size}</p>
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "16px", borderTop: "2px solid var(--black)", fontWeight: 700, fontSize: "1.1rem" }}>
              <span>Total</span>
              <span>₹{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ marginTop: "16px", fontSize: "0.85rem", color: "var(--gray)" }}>
              Shipping to {order.customer.firstName} in {order.customer.city}, {order.customer.state}
            </div>
          </div>
        )}

        <p style={{ marginTop: "40px", textAlign: "center", fontSize: "0.85rem", color: "var(--gray)" }}>
          <Link href="/shop" style={{ textDecoration: "underline" }}>Continue Shopping</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}
