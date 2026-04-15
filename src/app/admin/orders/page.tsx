"use client";

import { useEffect, useState } from "react";
import { getOrders } from "../actions";
import { Order } from "@prisma/client";

type OrderWithDetails = Order & {
  user: { email: string };
  _count: { items: number };
};

const NGN_RATE = 1600;

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
  CANCELLED: "bg-red-100 text-red-700 border border-red-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.user.email.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search);
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <p className="text-slate-500 text-sm mt-1">Track and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "PAID"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                statusFilter === s
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold text-left">Order ID</th>
                <th className="px-6 py-3 font-semibold text-left">Customer</th>
                <th className="px-6 py-3 font-semibold text-left">Items</th>
                <th className="px-6 py-3 font-semibold text-left">Amount (₦)</th>
                <th className="px-6 py-3 font-semibold text-left">Status</th>
                <th className="px-6 py-3 font-semibold text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500" title={order.id}>
                      #{order.id.split("-")[0].toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {order.user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-700 font-medium truncate max-w-[180px]">{order.user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{order._count.items} item{order._count.items !== 1 ? "s" : ""}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">₦{(order.total * NGN_RATE).toLocaleString("en-NG")}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-slate-100 text-slate-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-slate-400 mt-3">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </div>
  );
}
