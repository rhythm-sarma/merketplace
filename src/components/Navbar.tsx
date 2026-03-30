"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <img src="/images/logo.svg" alt="racksup" className="navbar-logo-img" />
          </Link>
          <ul className="navbar-links">
            <li>
              <Link href="/shop?category=men">Mens</Link>
            </li>
            <li>
              <Link href="/shop?category=women">Womens</Link>
            </li>
            <li>
              <Link href="/shop">All Products</Link>
            </li>
          </ul>
          <div className="navbar-actions">
            <Link href="/cart" className="navbar-cart-link">
              Cart
              {mounted && totalItems > 0 && (
                <span className="cart-count">{totalItems}</span>
              )}
            </Link>
            <Link href="/vendor" className="navbar-cta">
              Sell With Us
            </Link>
            <button
              className={`mobile-menu-btn ${mobileOpen ? "active" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <Link href="/shop?category=men" onClick={() => setMobileOpen(false)}>
          Mens
        </Link>
        <Link href="/shop?category=women" onClick={() => setMobileOpen(false)}>
          Womens
        </Link>
        <Link href="/shop" onClick={() => setMobileOpen(false)}>
          All Products
        </Link>
        <Link href="/cart" onClick={() => setMobileOpen(false)}>
          Cart{mounted && totalItems > 0 && ` (${totalItems})`}
        </Link>
        <div className="mobile-menu-divider" />
        <Link
          href="/vendor"
          className="mobile-menu-cta"
          onClick={() => setMobileOpen(false)}
        >
          Start Selling →
        </Link>
      </div>
    </>
  );
}
