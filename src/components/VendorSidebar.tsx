"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/vendor/dashboard", icon: "◈" },
  { label: "Products", href: "/vendor/products", icon: "□" },
  { label: "Add Product", href: "/vendor/products/new", icon: "+" },
  { label: "Orders", href: "/vendor/orders", icon: "≡" },
];

export default function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="vendor-sidebar">
      <div className="vendor-sidebar-logo">
        <h2>Market Place</h2>
        <span>Vendor Portal</span>
      </div>
      <ul className="vendor-nav">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={pathname === item.href ? "active" : ""}
            >
              <span className="vendor-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
        <li style={{ marginTop: "40px" }}>
          <Link href="/">
            <span className="vendor-nav-icon">←</span>
            Back to Store
          </Link>
        </li>
      </ul>
    </aside>
  );
}
