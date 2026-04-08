import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "The Racksup Story — Thrift Culture & Originality",
  description: "Read about how Asif, Rizwan, and Wasif founded Racksup and why thrift is the future of fashion.",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--light-bg)", minHeight: "100vh", padding: "60px 20px" }}>
        <article style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "var(--white)",
          border: "4px solid var(--black)",
          boxShadow: "var(--shadow)",
          padding: "50px",
        }}>

          <header style={{ marginBottom: "40px", borderBottom: "4px solid var(--black)", paddingBottom: "20px" }}>
            <div style={{ display: "inline-block", background: "var(--yellow)", padding: "4px 12px", border: "2px solid var(--black)", fontWeight: 900, textTransform: "uppercase", fontSize: "0.9rem", marginBottom: "16px" }}>
              Founder's Story
            </div>
            <h1 style={{ fontSize: "3rem", margin: "0 0 10px", lineHeight: "1.2", textTransform: "uppercase" }}>
              The Thrifting Revolution:<br /> Why Racksup Exists
            </h1>
            <p style={{ color: "#666", fontWeight: 600, fontSize: "1.1rem" }}>
              By Asif, Rizwan & Wasif • April 2026
            </p>
          </header>

          <div style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#222" }}>

            <h2 style={{ fontSize: "1.8rem", textTransform: "uppercase", marginTop: "40px", marginBottom: "16px" }}>
              Part 1: What Even is Thrift?
            </h2>
            <p style={{ marginBottom: "20px" }}>
              Thrifting isn’t just buying used clothes. It’s an art form. It’s about breathing new life into preloved, curated garments that have outlasted fast-fashion trends. From vintage Y2K cargos to faded retro graphic tees, thrift is sustainable fashion that actually has a soul. Quality over quantity. Character over conformity.
            </p>

            <h2 style={{ fontSize: "1.8rem", textTransform: "uppercase", marginTop: "40px", marginBottom: "16px" }}>
              Part 2: The Core of Originality
            </h2>
            <p style={{ marginBottom: "20px" }}>
              In a world where everyone shops at the same three fast-fashion mall brands, originality is dead. Walking down the street and seeing three people in the exact same Zara shirt isn't exactly groundbreaking.
            </p>
            <p style={{ marginBottom: "20px" }}>
              Thrift changes the game entirely. When you shop thrift, you are hunting for 1-of-1 pieces. You aren't dressing like a mannequin; you are building a wardrobe that is completely, unapologetically <em>you</em>. It’s an expression of your deepest self, collected slowly piece by piece.
            </p>

            <div style={{ margin: "40px 0", padding: "30px", background: "var(--yellow)", border: "4px solid var(--black)", fontSize: "1.4rem", fontWeight: 700, fontStyle: "italic", textAlign: "center" }}>
              "Thrifting isn't just about saving money. It's about preserving originality in a mass-produced world."
            </div>

            <h2 style={{ fontSize: "1.8rem", textTransform: "uppercase", marginTop: "40px", marginBottom: "16px" }}>
              Part 3: The Gap in the Market (Our Story)
            </h2>
            <p style={{ marginBottom: "20px" }}>
              Racksup didn’t start in a boardroom. It started out of sheer frustration. We, <strong>Rhythm Sarma,Asif, Rizwan, and Wasif</strong>, were trying to build our own thrift wardrobes here in India, but the experience was exhausting.
            </p>
            <p style={{ marginBottom: "20px" }}>
              Buying thrift meant endlessly scrolling through disorganized Instagram pages, waiting days for a seller to reply to your DM, praying you wouldn't get scammed after paying upfront, and dealing with wild, inconsistent pricing.
            </p>
            <p style={{ marginBottom: "20px" }}>
              There was a massive gap in the market — no centralized, trusted platform existed for the Indian thrift community. I knew there had to be a better way for sellers to reach buyers, and for buyers to shop securely.
            </p>
            <p style={{ marginBottom: "30px" }}>
              So we decided to fix it. We built Racksup to unite verified vendors and passionate buyers in one safe, fast, and aggressively aesthetic destination. Lowest prices. Verified sellers. Zero friction. Let's make thrift the standard.
            </p>

            <Link href="/shop" className="hero-btn" style={{ display: "inline-block", marginTop: "20px", textDecoration: "none" }}>
              START THRIFTING NOW
            </Link>
          </div>

        </article>
      </main>
      <Footer />
    </>
  );
}
