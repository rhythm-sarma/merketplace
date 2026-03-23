import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
}

export default function StatCard({ title, value, trend, trendUp, icon: Icon }: StatCardProps) {
  return (
    <div className="vd-stat-card">
      <div className="vd-stat-top">
        <div>
          <p className="vd-stat-label">{title}</p>
          <h3 className="vd-stat-value">{value}</h3>
        </div>
        <div className="vd-stat-icon">
          <Icon />
        </div>
      </div>
      
      <div className="vd-stat-trend">
        <span className={`vd-trend-badge ${trendUp ? "up" : "down"}`}>
          {trendUp ? "↑" : "↓"} {trend}
        </span>
        <span className="vd-trend-text">vs last month</span>
      </div>
    </div>
  );
}
