"use client";

import { useEffect, useState } from "react";
import { IOrder, IOrderItem } from "@/models/Order";

function getStatusClass(status: string) {
  switch (status) {
    case "Delivered": return "vd-badge-delivered";
    case "Pending": return "vd-badge-pending";
    case "Confirmed": return "vd-badge-pending"; // Same style as pending
    case "Shipped": return "vd-badge-shipped";
    case "Cancelled": return "vd-badge-cancelled";
    default: return "vd-badge-shipped";
  }
}

function SkeletonOrdersTable() {
  return (
    <div>
      <div className="vd-page-header-row">
        <div>
          <div className="vd-skeleton-line h-20 w-60" style={{ marginBottom: '12px' }} />
          <div className="vd-skeleton-line h-10 w-80" />
        </div>
      </div>
      <div className="vd-table-card">
        <div style={{ padding: '20px 32px' }}>
          <div className="vd-skeleton-line h-10 w-40" style={{ marginBottom: 0 }} />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 32px', borderTop: '2px solid #eee' }}>
            <div className="vd-skeleton-line h-20" style={{ width: '80px', marginBottom: 0 }} />
            <div className="vd-skeleton-line h-20 w-40" style={{ marginBottom: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="vd-skeleton-line w-80 h-10" style={{ marginBottom: 0 }} />
            </div>
            <div className="vd-skeleton-line h-20" style={{ width: '70px', marginBottom: 0 }} />
            <div className="vd-skeleton-line h-20" style={{ width: '60px', marginBottom: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this order? This will remove it for both you and the admin.")) return;
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) fetchOrders();
      else {
        const data = await res.json();
        alert(data.error || "Failed to delete order");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <SkeletonOrdersTable />;

  return (
    <div>
      <div className="vd-page-header-row">
        <div>
          <h1 className="vd-page-title">RECENT ORDERS</h1>
          <p className="vd-page-subtitle">Track and fulfill your incoming customer orders.</p>
        </div>
      </div>

      <div className="vd-table-card">
        <div className="vd-table-header">
          <h2 className="vd-table-title">All Orders ({orders.length})</h2>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 40px" }}>
            <p style={{ color: "#888", fontSize: "1.1rem" }}>NO ORDERS FOUND YET.</p>
          </div>
        ) : (
          <div className="vd-table-wrap">
            <table className="vd-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
                  const itemsString = order.items.map((i: IOrderItem) => `${i.name} (x${i.quantity})`).join(", ");
                  const isDeliveredOrCancelled = ["Delivered", "Cancelled"].includes(order.status);
                  
                  return (
                    <tr key={order._id as unknown as string}>
                      <td style={{ fontWeight: '800' }}>#{order.orderId}</td>
                      <td style={{ fontWeight: '600' }}>{order.customer.firstName.toUpperCase()} {order.customer.lastName.toUpperCase()}</td>
                      <td style={{ maxWidth: "240px", fontSize: '0.8rem' }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {itemsString}
                        </div>
                      </td>
                      <td style={{ fontWeight: '800' }}>₹{order.total.toLocaleString()}</td>
                      <td style={{ fontSize: '0.75rem', fontWeight: '700' }}>{orderDate}</td>
                      <td>
                        <span className={`vd-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <select 
                            className="vd-form-select" 
                            style={{ width: "auto", padding: "8px 32px 8px 12px", fontSize: "0.75rem", fontWeight: '700' }}
                            value={order.status}
                            disabled={updatingId === (order._id as unknown as string)}
                            onChange={(e) => handleStatusUpdate(order._id as unknown as string, e.target.value)}
                          >
                            <option value="Pending">PENDING</option>
                            <option value="Confirmed">CONFIRMED</option>
                            <option value="Shipped">SHIPPED</option>
                            <option value="Delivered">DELIVERED</option>
                            <option value="Cancelled">CANCELLED</option>
                          </select>
                          
                          {isDeliveredOrCancelled && (
                            <button 
                              onClick={() => handleDeleteOrder(order._id as unknown as string)}
                              title="Delete older order"
                              disabled={updatingId === (order._id as unknown as string)}
                              style={{ 
                                background: '#ff4d4d', 
                                border: '2px solid #000', 
                                color: '#fff', 
                                width: '32px', 
                                height: '32px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                boxShadow: '2px 2px 0 0 #000'
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .vd-badge-cancelled {
          background: #ff4d4d;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
