"use client";

import { useEffect, useState } from "react";
import { getOrders } from "../actions";
import { Order, OrderStatus } from "@prisma/client";

type OrderWithDetails = Order & {
  user: { email: string };
  _count: { items: number };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">User Email</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800 font-mono text-sm max-w-[120px] truncate" title={order.id}>
                    {order.id.split("-")[0]}...
                  </td>
                  <td className="p-4 text-gray-600">{order.user.email}</td>
                  <td className="p-4 text-gray-600">{order._count.items}</td>
                  <td className="p-4 font-medium text-gray-800">${order.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
