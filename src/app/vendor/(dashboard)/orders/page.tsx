"use client";

import { useEffect, useState } from "react";
import { IOrder, IOrderItem } from "@/models/Order";

function getStatusClass(status: string) {
  switch (status) {
    case "Delivered": return "vd-badge-delivered";
    case "Pending": return "vd-badge-pending";
    case "Shipped": return "vd-badge-shipped";
    default: return "vd-badge-shipped";
  }
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

  return (
    <div>
      <div className="vd-page-header">
        <h1 className="vd-page-title">Orders</h1>
        <p className="vd-page-subtitle">Manage and track your recent orders.</p>
      </div>

      <div className="vd-table-card">
        <div className="vd-table-header">
          <h2 className="vd-table-title">All Orders ({orders.length})</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#888" }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#888" }}>You haven't received any orders yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
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
                    <th className="td-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const itemsString = order.items.map((i: IOrderItem) => `${i.name} (x${i.quantity})`).join(", ");
                    return (
                      <tr key={order._id as unknown as string}>
                        <td className="td-bold">{order.orderId}</td>
                        <td>{order.customer.firstName} {order.customer.lastName}</td>
                        <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{itemsString}</td>
                        <td className="td-bold">₹{order.total.toLocaleString()}</td>
                        <td>{orderDate}</td>
                        <td>
                          <span className={`vd-badge ${getStatusClass(order.status)}`}>
                            <span className="vd-badge-dot" />
                            {order.status}
                          </span>
                        </td>
                        <td className="td-right">
                          <select 
                            className="vd-input" 
                            style={{ width: "auto", padding: "6px 10px", fontSize: "0.85rem", display: "inline-block" }}
                            value={order.status}
                            disabled={updatingId === (order._id as unknown as string)}
                            onChange={(e) => handleStatusUpdate(order._id as unknown as string, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="vd-mobile-cards">
              {orders.map((order) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString();
                const itemsString = order.items.map((i: IOrderItem) => `${i.name} (x${i.quantity})`).join(", ");
                return (
                  <div key={order._id as unknown as string} className="vd-mobile-card">
                    <div className="vd-mobile-card-top">
                      <span className="td-bold">{order.orderId}</span>
                      <span className={`vd-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="vd-mobile-card-info">
                      <h3 style={{ fontSize: "0.95rem", marginBottom: "4px" }}>{itemsString}</h3>
                      <p>{order.customer.firstName} · {orderDate}</p>
                      <p className="vd-mobile-price">₹{order.total.toLocaleString()}</p>
                    </div>
                    <div style={{ marginTop: "12px", borderTop: "1px solid #eee", paddingTop: "12px", textAlign: "right" }}>
                      <select 
                          className="vd-input" 
                          style={{ width: "100%", padding: "8px 12px", fontSize: "0.9rem" }}
                          value={order.status}
                          disabled={updatingId === (order._id as unknown as string)}
                          onChange={(e) => handleStatusUpdate(order._id as unknown as string, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
