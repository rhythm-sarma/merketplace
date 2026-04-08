"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Bell, Search } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  orderId: string;
  message: string;
  status: string;
  date: string;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/vendors/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="vd-header">
      <div className="vd-header-left">
        <button
          onClick={onMenuClick}
          className="vd-mobile-menu-btn"
          aria-label="Open sidebar"
        >
          <Menu />
        </button>

        <div className="vd-search">
          <Search />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
          />
        </div>
      </div>

      <div className="vd-header-right">
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button 
            className="vd-notif-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell />
            {notifications.length > 0 && <span className="vd-notif-dot" />}
          </button>
          
          {showNotifications && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: "0",
              marginTop: "12px",
              width: "320px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              zIndex: 50,
              overflow: "hidden"
            }}>
              <div style={{ padding: "16px", borderBottom: "1px solid #eee", fontWeight: "bold", background: "#fafafa" }}>
                Notifications
              </div>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #eee",
                      fontSize: "0.9rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}>
                      <span style={{ color: "#333" }}>{notif.message}</span>
                      <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                        {new Date(notif.date).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <button className="vd-avatar-btn">
          <div className="vd-avatar">V</div>
          <span className="vd-avatar-name">Vendor</span>
        </button>
      </div>
    </header>
  );
}
