"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Workflow,
  Video,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DashboardData>("/api/dashboard")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-sm text-gray-500">ภาพรวมการทำงานของระบบ</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="สินค้าทั้งหมด" value={stats?.products ?? 0} icon={Package} />
        <StatCard title="Workflow" value={stats?.workflows ?? 0} icon={Workflow} />
        <StatCard title="เสร็จสิ้น" value={stats?.completed ?? 0} icon={CheckCircle} />
        <StatCard title="วิดีโอ" value={stats?.videos ?? 0} icon={Video} />
        <StatCard title="ปักตะกร้า" value={stats?.pinned ?? 0} icon={ShoppingCart} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            กิจกรรมรายสัปดาห์ (Workflow)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.weeklyActivity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="workflows" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            วิดีโอที่สร้างรายสัปดาห์
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.weeklyActivity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="videos"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: "#16a34a", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Workflow ล่าสุด</h3>
          <Link
            href="/workflows"
            className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
          >
            ดูทั้งหมด <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {data?.recentWorkflows.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              ยังไม่มี Workflow — เริ่มสร้างได้ที่หน้า Workflow
            </p>
          )}

          {data?.recentWorkflows.map((workflow) => (
            <Link
              key={workflow.id}
              href={`/workflows/${workflow.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:border-green-200 hover:bg-green-50/30"
            >
              <div>
                <p className="font-medium text-gray-900">{workflow.name}</p>
                <p className="text-xs text-gray-500">
                  {workflow.items.length} สินค้า ·{" "}
                  {new Date(workflow.updatedAt).toLocaleDateString("th-TH")}
                </p>
              </div>
              <StatusBadge status={workflow.status} />
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
