"use client";

import { Menu, Bell, Search } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
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
        <button className="vd-notif-btn">
          <Bell />
          <span className="vd-notif-dot" />
        </button>
        
        <button className="vd-avatar-btn">
          <div className="vd-avatar">V</div>
          <span className="vd-avatar-name">Vendor</span>
        </button>
      </div>
    </header>
  );
}
