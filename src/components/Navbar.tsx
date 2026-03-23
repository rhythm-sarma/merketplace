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

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            Market Place
          </Link>
          <ul className="navbar-links">
            <li>
              <Link href="/shop?category=men">Mens</Link>
            </li>
            <li>
              <Link href="/shop?category=women">Womens</Link>
            </li>
            <li>
              <Link href="/shop">Featured</Link>
            </li>
          </ul>
          <div className="navbar-actions">
            <Link href="/cart" style={{ position: "relative" }}>
              <svg
                className="navbar-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {mounted && totalItems > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "#111",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {totalItems}
                </span>
              )}
            </Link>
            <Link href="/vendor">
              <svg
                className="navbar-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <button
              className="mobile-menu-btn"
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
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <Link href="/shop?category=men" onClick={() => setMobileOpen(false)}>
          Mens
        </Link>
        <Link href="/shop?category=women" onClick={() => setMobileOpen(false)}>
          Womens
        </Link>
        <Link href="/shop" onClick={() => setMobileOpen(false)}>
          Featured
        </Link>
        <Link href="/cart" onClick={() => setMobileOpen(false)}>
          Cart
        </Link>
        <Link href="/vendor" onClick={() => setMobileOpen(false)}>
          Sell With Us
        </Link>
      </div>
    </>
  );
}
