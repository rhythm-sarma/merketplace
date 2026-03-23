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
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: "1.1rem", color: "#888", marginBottom: "20px" }}>
                Your cart is empty
              </p>
              <Link href="/shop" className="hero-btn" style={{ display: "inline-block" }}>
                Continue Shopping
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
