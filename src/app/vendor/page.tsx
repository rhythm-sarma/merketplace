"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function VendorLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  // Google Registration State
  const [googleUser, setGoogleUser] = useState<{ email: string; name: string; uid: string, photoURL: string } | null>(null);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      if (!auth || !googleProvider) {
        setError("Google sign-in is not available. Please use email/password to register.");
        setLoading(false);
        return;
      }
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists on our backend
      const res = await fetch("/api/vendors/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: user.displayName, uid: user.uid }),
      });

      const data = await res.json();

      if (res.ok) {
        // Logged in successfully
        window.location.href = "/vendor/dashboard";
      } else if (res.status === 404) {
        // Vendor doesn't exist, prompt for storeName
        setGoogleUser({
          email: user.email || "",
          name: user.displayName || "",
          uid: user.uid,
          photoURL: user.photoURL || "",
        });
      } else {
        setError(data.error || "Google login failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser || !storeName) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors/google-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name,
          uid: googleUser.uid,
          storeName,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
      } else {
        window.location.href = "/vendor/onboarding";
      }
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

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
        <img src="/images/logo.svg" alt="racksup" className="login-logo-img" />
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

        {googleUser ? (
          <form onSubmit={handleGoogleRegisterSubmit}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <p>Almost done, <strong>{googleUser.name}</strong>!</p>
              <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginTop: "4px" }}>Please enter a Store Name to create your vendor profile.</p>
            </div>
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
            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="form-submit-btn"
              style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Complete Registration"}
            </button>
            <button
              type="button"
              onClick={() => setGoogleUser(null)}
              style={{ width: "100%", marginTop: "12px", background: "none", border: "none", color: "var(--gray)", textDecoration: "underline", cursor: "pointer" }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
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
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--gray)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}
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

          <div style={{ margin: "24px 0", textAlign: "center", position: "relative" }}>
            <hr style={{ border: "none", borderTop: "1px solid var(--lighter-gray)" }} />
            <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "0 10px", fontSize: "0.85rem", color: "var(--gray)" }}>
              or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "white",
              border: "1px solid #ddd",
              color: "#333",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "var(--shadow-sm)",
              opacity: loading ? 0.6 : 1
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </>
        )}

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
