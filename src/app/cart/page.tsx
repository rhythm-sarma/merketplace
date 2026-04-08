"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  const handleUpdateQty = (productId: string, size: string, currentQty: number, delta: number) => {
    if (currentQty + delta <= 0) {
      removeFromCart(productId, size);
    } else {
      updateQuantity(productId, size, delta);
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

  return (
    <>
      <Navbar />
      <div className="cart-page">
        <div className="cart-inner">
          <div className="cart-header">
            <h1>Your Cart</h1>
          </div>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--yellow)", border: "4px solid var(--black)", boxShadow: "var(--shadow)", margin: "40px auto", maxWidth: "600px" }}>
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>🛒</div>
              <h2 style={{ fontSize: "2rem", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 10px", fontWeight: 900 }}>
                YOUR CART IS EMPTY
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#333", marginBottom: "30px", fontWeight: 500 }}>
                Looks like you haven't added any thrift finds yet.
              </p>
              <Link href="/shop" className="hero-btn" style={{ display: "inline-block", background: "var(--white)" }}>
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items">
                {items.map((item) => (
                  <div className="cart-item" key={`${item.product.id}-${item.size}`}>
                    <div className="cart-item-image">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                      />
                    </div>
                    <div className="cart-item-info">
                      <h3>{item.product.name}</h3>
                      <p>
                        Size: {item.size} &nbsp;·&nbsp;{" "}
                        {item.product.condition === "thrift"
                          ? "Thrift"
                          : "New"}
                      </p>
                      <p className="cart-item-price">
                        ₹{item.product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="cart-qty">
                      <button onClick={() => handleUpdateQty(item.product.id, item.size, item.quantity, -1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.product.id, item.size, item.quantity, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <h2>Order Summary</h2>
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>₹{shipping}</span>
                </div>
                <div className="cart-summary-total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <Link href="/checkout" className="checkout-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
