"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/vendor/products", icon: Package },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
  { name: "Settings", href: "#", icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`vd-sidebar ${isOpen ? "open" : ""}`}>
      <div className="vd-sidebar-logo">
        <img src="/images/logo.svg" alt="racksup" className="sidebar-logo-img" />
      </div>

      <nav className="vd-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
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
        <Link href="/vendor" onClick={() => setIsOpen(false)}>
          <LogOut />
          Logout
        </Link>
      </div>
    </aside>
  );
}
