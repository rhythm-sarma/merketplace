"use client";

import { useState } from "react";
import Link from "next/link";

export default function VendorLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/vendors/login" : "/api/vendors/register";
      const body = isLogin
        ? { email, password }
        : { storeName, email, password, phone };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Redirect to vendor dashboard on success
      window.location.href = "/vendor/dashboard";
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="vendor-login">
      <div className="vendor-login-card">
        <h1>20RACKS</h1>
        <p>Vendor Portal · {isLogin ? "Sign in to your account" : "Create your vendor account"}</p>

        <div className="login-toggle">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => { setIsLogin(true); setError(""); }}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => { setIsLogin(false); setError(""); }}
          >
            Register
          </button>
        </div>

        {error && (
          <p style={{
            color: "#e74c3c",
            fontSize: "0.8rem",
            textAlign: "center",
            marginBottom: "16px",
            padding: "10px",
            background: "#fdf0ef",
            border: "1px solid #fce4e4",
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Store Name</label>
              <input
                type="text"
                placeholder="Enter your store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}
          <button
            type="submit"
            className="form-submit-btn"
            style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "0.8rem",
            color: "#888",
          }}
        >
          <Link href="/" style={{ textDecoration: "underline" }}>
            Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
