import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Dashboard, ShoppingCart, People, Inventory } from "@mui/icons-material";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminAuth")?.value;

  if (!token || token !== "authenticated") {
    redirect("/admin-login");
  }

  const navigation = [
    { name: "Overview", href: "/admin", icon: Dashboard },
    { name: "Products", href: "/admin/products", icon: Inventory },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: People },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 border-r border-gray-200">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-6">
          <Link href="/" className="text-xl font-bold text-slate-800 tracking-tight">
            Zenchart <span className="text-blue-600">Admin</span>
          </Link>
        </div>
        <div className="px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                  >
                    <Icon fontSize="small" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
