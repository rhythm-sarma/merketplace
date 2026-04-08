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
          maxWidth: "600px",
          background: "var(--yellow)",
          border: "4px solid var(--black)",
          boxShadow: "var(--shadow)",
          padding: "50px",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "2.5rem", textTransform: "uppercase", margin: "0 0 10px", fontWeight: 900 }}>Get In Touch</h1>
          <p style={{ fontSize: "1.1rem", marginBottom: "40px", fontWeight: 500 }}>
            Have a question or want to work with us? Reach out directly!
          </p>
          
          <div style={{ background: "var(--white)", border: "3px solid var(--black)", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "1px" }}>Phone</h3>
            <a href="tel:+917086758292" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--black)", textDecoration: "none" }}>+91 7086758292</a>
          </div>

          <div style={{ background: "var(--white)", border: "3px solid var(--black)", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "1px" }}>Support Email</h3>
            <a href="mailto:support@racksup.in" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--black)", textDecoration: "none" }}>support@racksup.in</a>
          </div>

          <div style={{ background: "var(--white)", border: "3px solid var(--black)", padding: "20px" }}>
            <h3 style={{ margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "1px" }}>Founder Email</h3>
            <a href="mailto:rhythmsarma66@gmail.com" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--black)", textDecoration: "none" }}>rhythmsarma66@gmail.com</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
