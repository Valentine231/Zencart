import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Live Dashboard</span>
          </div>
          <div className="ml-auto text-xs text-slate-400">
            {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
