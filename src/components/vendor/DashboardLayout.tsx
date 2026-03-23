"use client";

import { useState } from "react";
import Sidebar from "@/components/vendor/Sidebar";
import Header from "@/components/vendor/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="vd-layout">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="vd-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="vd-content">
          <div className="vd-content-inner">
            {children}
          </div>
        </main>
      </div>
      <div
        className={`vd-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
}
