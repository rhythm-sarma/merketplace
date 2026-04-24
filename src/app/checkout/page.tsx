"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const shippingCost = items.reduce((acc, item) => acc + (item.product.shippingPrice || 0) * item.quantity, 0);
  const processingFee = (subtotal + shippingCost) * 0.002;
  const total = subtotal + shippingCost + processingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      if (phone && !/^\d{10}$/.test(phone)) {
        setError("Phone number must be exactly 10 digits");
        setIsProcessing(false);
        return;
      }

      const orderItems = items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        image: item.product.image,
        vendorId: item.product.vendorId || "",
      }));

      // 1. Create order on our backend to get Razorpay order ID
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName,
            lastName,
            email,
            phone,
            address,
            address2,
            city,
            state,
            postalCode,
          },
          items: orderItems,
          subtotal,
          shipping: shippingCost,
          processingFee,
          total,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to initialize payment");
      }

      const orderData = await res.json();

      // 2. Open Razorpay Checkout modal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "racksup",
        description: "Order Payment",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                mongoOrderId: orderData.order._id,
              }),
            });

            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.success) {
              clearCart();
              setPlacedOrderId(orderData.order.orderId);
              setOrderPlaced(true);
            } else {
              setError(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            setError("Payment verification failed.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#111111",
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return (
      <>
        <Navbar />
        <div className="cart-page" style={{ minHeight: "60vh" }}></div>
        <Footer />
      </>
    );
  }

  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <div className="cart-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{
              width: "80px", height: "80px", background: "#4caf50", color: "#fff",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "40px", margin: "0 auto 20px"
            }}>✓</div>
            <h1 style={{ marginBottom: "16px" }}>Payment Successful!</h1>
            <p style={{ color: "#666", marginBottom: "12px", maxWidth: "400px", margin: "0 auto 12px" }}>
              Thank you for shopping with us. Your order has been placed and is being processed.
            </p>
            {placedOrderId && (
              <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "24px" }}>
                Your Order ID: <span style={{ background: "var(--yellow)", padding: "4px 12px" }}>{placedOrderId}</span>
              </p>
            )}
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/shop" className="hero-btn" style={{ display: "inline-block" }}>
                Continue Shopping
              </Link>
              <Link href="/track-order" className="hero-btn" style={{ display: "inline-block", background: "white", color: "var(--black)", border: "var(--border)" }}>
                Track Your Order
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "16px" }}>Your cart is empty</h2>
            <Link href="/shop" className="hero-btn" style={{ display: "inline-block" }}>
              Go Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      <div className="cart-page">
        <div className="checkout-inner">
          <div className="cart-header" style={{ marginTop: "20px" }}>
            <h1>Checkout</h1>
          </div>

          {error && (
            <div style={{ background: "#fee", color: "#c00", padding: "12px 16px", borderRadius: "4px", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <div className="checkout-content">
            {/* Form Section */}
            <div>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Shipping Details</h2>
              <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="checkout-form-row">
                  <input required placeholder="First Name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="checkout-input" />
                  <input required placeholder="Last Name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="checkout-input" />
                </div>
                <input required placeholder="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="checkout-input" />
                <input required placeholder="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="checkout-input" />
                <input required placeholder="Address Line 1" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="checkout-input" />
                <input placeholder="Address Line 2 (Optional)" type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} className="checkout-input" />
                <div className="checkout-form-row">
                  <input required placeholder="City" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="checkout-input" />
                  <input required placeholder="State / Province" type="text" value={state} onChange={(e) => setState(e.target.value)} className="checkout-input" />
                  <input required placeholder="Postal Code" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="checkout-input" />
                </div>

                <h2 style={{ fontSize: "1.2rem", margin: "20px 0 10px" }}>Payment Details</h2>
                <div style={{ padding: "16px", border: "var(--border)", background: "var(--accent)", color: "var(--black)" }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>
                    Payments are processed securely via <strong>Razorpay</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isProcessing}
                  style={{
                    width: "100%", 
                    marginTop: "20px", 
                    padding: "20px",
                    fontSize: "1.2rem",
                    cursor: isProcessing ? "not-allowed" : "pointer", 
                    opacity: isProcessing ? 0.7 : 1 
                  }}
                >
                  {isProcessing ? "PROCESSING..." : `PAY ₹${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </button>
              </form>
            </div>

            {/* Summary Section */}
            <div className="cart-summary" style={{ position: "sticky", top: "100px", height: "fit-content" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Order Summary</h2>

              <div style={{ borderBottom: "1px solid #eee", paddingBottom: "20px", marginBottom: "20px" }}>
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <img src={item.product.image} alt={item.product.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 500 }}>{item.product.name}</p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>Qty: {item.quantity} · Size: {item.size}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500 }}>₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="cart-summary-row" style={{ fontSize: "0.9rem" }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="cart-summary-row" style={{ fontSize: "0.9rem" }}>
                <span>Shipping</span>
                <span>₹{shippingCost}</span>
              </div>
              <div className="cart-summary-row" style={{ fontSize: "0.9rem", color: "#666" }}>
                <span>Razorpay Processing Fee (0.2%)</span>
                <span>₹{processingFee.toFixed(2)}</span>
              </div>
              <div className="cart-summary-total" style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #111" }}>
                <span>Total</span>
                <span>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
