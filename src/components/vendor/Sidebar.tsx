"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Store
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: "Home", href: "/", icon: Store },
  { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/vendor/products", icon: Package },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/vendors/me", { method: "DELETE" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setIsOpen(false);
    router.push("/vendor");
  };

  return (
    <aside className={`vd-sidebar ${isOpen ? "open" : ""}`}>
      <div className="vd-sidebar-logo">
        <Link href="/vendor/dashboard">
          <h2>RACKSUP</h2>
        </Link>
      </div>

      <nav className="vd-nav">
        {navItems.map((item) => {
          // Use exact match for Home ("/") to prevent it from matching every route
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={isActive ? "active" : ""}
            >
              <item.icon />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="vd-sidebar-bottom">
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: "12px 24px", width: "100%", textAlign: "left" }}>
          <LogOut />
          Logout
        </button>
      </div>
    </aside>
  );
}
