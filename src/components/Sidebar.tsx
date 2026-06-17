"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Workflow,
  LogOut,
  ShoppingBag,
  Link2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTikTokStatus } from "@/lib/use-tiktok-status";
import { TikTokProfileCard } from "@/components/TikTokProfileCard";

const navItems = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/workflows", label: "Workflow", icon: Workflow },
  { href: "/connect-tiktok", label: "เชื่อมต่อ TikTok", icon: Link2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { tenant, user, logout } = useAuth();
  const { status, disconnecting, disconnect } = useTikTokStatus();

  async function handleTikTokLogout() {
    if (!confirm("ต้องการออกจาก TikTok (ยกเลิกการเชื่อมต่อ)?")) return;
    await disconnect();
  }

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-100 bg-white">
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">TikTok Workflow</h1>
            <p className="text-xs text-gray-500">{tenant?.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-green-600" : ""}`} />
              {item.label}
            </Link>
          );
        })}

        {status?.isConnected && (
          <div className="pt-4">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              TikTok Account
            </p>
            <TikTokProfileCard
              status={status}
              compact
              disconnecting={disconnecting}
              onDisconnect={handleTikTokLogout}
            />
          </div>
        )}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            {tenant?.plan}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
