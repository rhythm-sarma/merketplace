import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React from "react";

export const metadata = {
  title: "Contact Us — racksup",
  description: "Get in touch with the Racksup team.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "60px 20px", display: "flex", justifyContent: "center", alignItems: "center", background: "var(--light-bg)" }}>
        <div style={{
          width: "100%",
          maxWidth: "700px",
          background: "var(--yellow)",
          border: "4px solid var(--black)",
          boxShadow: "var(--shadow)",
          padding: "40px 30px",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "2.2rem", textTransform: "uppercase", margin: "0 0 10px", fontWeight: 900 }}>Get In Touch</h1>
          <p style={{ fontSize: "1rem", marginBottom: "30px", fontWeight: 500 }}>
            Have a question or want to work with us? Reach out directly.
          </p>

          <div style={{ background: "var(--white)", border: "3px solid var(--black)", padding: "16px 12px", marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}>Phone</h3>
            <a href="tel:+917086758292" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--black)", textDecoration: "none" }}>+91 7086758292</a>
          </div>

          <div style={{ background: "var(--white)", border: "3px solid var(--black)", padding: "16px 12px", marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}>Support Email</h3>
            <a href="mailto:support@racksup.in" style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--black)", textDecoration: "none", wordBreak: "break-all" as const }}>support@racksup.in</a>
          </div>

          <div style={{ background: "var(--white)", border: "3px solid var(--black)", padding: "16px 12px" }}>
            <h3 style={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}>Founder Email</h3>
            <a href="mailto:rhythmsarma66@gmail.com" style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--black)", textDecoration: "none", wordBreak: "break-all" as const }}>rhythmsarma66@gmail.com</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
