import { getDashboardStats, getOrders } from "./actions";

export default async function AdminOverviewPage() {
  const stats = await getDashboardStats();
  const recentOrders = (await getOrders()).slice(0, 5);

  const NGN_RATE = 1600;

  const cards = [
    {
      title: "Total Revenue",
      value: `₦${(stats.totalRevenue * NGN_RATE).toLocaleString("en-NG")}`,
      sub: `$${stats.totalRevenue.toFixed(2)} USD`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-teal-600",
      lightGradient: "from-emerald-50 to-teal-50",
      textColor: "text-emerald-700",
      border: "border-emerald-100",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      sub: "Since launch",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: "from-blue-500 to-indigo-600",
      lightGradient: "from-blue-50 to-indigo-50",
      textColor: "text-blue-700",
      border: "border-blue-100",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      sub: "In catalog",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: "from-purple-500 to-violet-600",
      lightGradient: "from-purple-50 to-violet-50",
      textColor: "text-purple-700",
      border: "border-purple-100",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      sub: "Registered accounts",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-orange-500 to-amber-600",
      lightGradient: "from-orange-50 to-amber-50",
      textColor: "text-orange-700",
      border: "border-orange-100",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.lightGradient} rounded-2xl border ${card.border} p-6 relative overflow-hidden`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}>
                {card.icon}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
            <p className={`text-2xl font-bold ${card.textColor} mb-0.5`}>{card.value}</p>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Orders</h2>
          <a href="/admin/orders" className="text-xs text-emerald-600 font-medium hover:underline">View all →</a>
        </div>
        <div className="divide-y divide-slate-50">
          {recentOrders.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-sm">No orders yet.</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {order.user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{order.user.email}</p>
                  <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString("en-NG")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">₦{(order.total * NGN_RATE).toLocaleString("en-NG")}</p>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${
                    order.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
