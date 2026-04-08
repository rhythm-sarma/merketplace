import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "FAQ — racksup",
  description: "Frequently asked questions about shopping and selling on Racksup.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "How do you verify the vendors?",
      a: "We verify our vendors by contacting them directly, getting to know them, and making sure we get their real shop address and IDs. We take buyer safety seriously and only approve sellers we trust."
    },
    {
      q: "How long does my shipping take?",
      a: "Shipping time depends entirely on the vendor, their location relative to yours, and how quickly they dispatch their orders. Once shipped, you will receive a tracking update via email."
    },
    {
      q: "Can I sell my clothes on Racksup?",
      a: "Yes! Anyone can apply to become a vendor. If we are successful in verifying your store and identity, you'll be able to list your clothes on our marketplace."
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "60px 20px", display: "flex", justifyContent: "center", background: "var(--light-bg)" }}>
        <div style={{
          width: "100%",
          maxWidth: "800px",
          background: "var(--white)",
          border: "4px solid var(--black)",
          boxShadow: "var(--shadow)",
          padding: "50px",
        }}>
          <h1 style={{ fontSize: "2.5rem", textTransform: "uppercase", margin: "0 0 40px", fontWeight: 900, textAlign: "center" }}>
            Frequently Asked Questions
          </h1>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ background: "var(--light-bg)", border: "3px solid var(--black)", padding: "24px" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 10px", lineHeight: "1.4" }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: "1.05rem", color: "#333", margin: "0", lineHeight: "1.6" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "50px", paddingTop: "30px", borderTop: "4px solid var(--black)" }}>
            <h2 style={{ fontSize: "1.5rem", textTransform: "uppercase", margin: "0 0 15px", fontWeight: 900 }}>Ready to sell?</h2>
            <Link href="/vendor" className="hero-btn" style={{ display: "inline-block", background: "var(--yellow)", textDecoration: "none" }}>
              Become a Vendor
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
