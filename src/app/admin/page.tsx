import { getDashboardStats } from "./actions";
import { People, Inventory, ShoppingCart, AttachMoney } from "@mui/icons-material";

export default async function AdminOverviewPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: AttachMoney,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Inventory,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: People,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
              <div className={`p-4 rounded-full ${card.bg} ${card.color}`}>
                 <Icon fontSize="large" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Optional: We can add a recent orders table here later if needed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to Zenchart Admin</h2>
        <p className="text-gray-600">
          Use the sidebar to manage products, view user information, and track incoming orders.
        </p>
      </div>
    </div>
  );
}
