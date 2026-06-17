"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play, ShoppingCart, Video, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge, StepProgress } from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";
import type { Workflow } from "@/lib/types";

export default function WorkflowDetailPage() {
  const params = useParams();
  const workflowId = params.id as string;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  async function loadWorkflow() {
    const data = await apiFetch<{ workflow: Workflow }>(
      `/api/workflows/${workflowId}`
    );
    setWorkflow(data.workflow);
  }

  useEffect(() => {
    loadWorkflow()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workflowId]);

  async function handleRun() {
    setRunning(true);
    try {
      await apiFetch(`/api/workflows/${workflowId}/run`, { method: "POST" });
      await loadWorkflow();
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!workflow) {
    return (
      <DashboardLayout>
        <p className="text-center text-gray-400">ไม่พบ Workflow</p>
      </DashboardLayout>
    );
  }

  const latestVideo = workflow.videos?.[0];

  return (
    <DashboardLayout>
      <Link
        href="/workflows"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600"
      >
        <ArrowLeft className="h-4 w-4" /> กลับ
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
          <p className="text-sm text-gray-500">
            สร้างเมื่อ {new Date(workflow.createdAt).toLocaleString("th-TH")}
          </p>
        </div>
        <StatusBadge status={workflow.status} />
      </div>

      <div className="card mb-8">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">ขั้นตอน Workflow</h3>
        <StepProgress currentStep={workflow.currentStep} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ShoppingCart className="h-4 w-4 text-green-600" />
            สินค้าใน Workflow
          </h3>
          <div className="space-y-3">
            {workflow.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-gray-100 p-3"
              >
                {item.product.imageUrl && (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-green-600">
                    ฿{item.product.price.toLocaleString()}
                  </p>
                </div>
                {item.cartPinned && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    ปักตะกร้าแล้ว
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Video className="h-4 w-4 text-green-600" />
            วิดีโอรีวิว
          </h3>

          {!latestVideo ? (
            <p className="py-8 text-center text-sm text-gray-400">
              ยังไม่มีวิดีโอ — กดรัน Bot เพื่อสร้าง
            </p>
          ) : (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <StatusBadge status={latestVideo.status} />
                <span className="text-xs text-gray-500">
                  {new Date(latestVideo.createdAt).toLocaleString("th-TH")}
                </span>
              </div>

              {latestVideo.thumbnailUrl && (
                <Image
                  src={latestVideo.thumbnailUrl}
                  alt="Video thumbnail"
                  width={400}
                  height={225}
                  className="mb-3 w-full rounded-xl object-cover"
                />
              )}

              {latestVideo.script && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
                    <FileText className="h-3 w-3" /> สคริปต์รีวิว
                  </div>
                  <p className="whitespace-pre-line text-sm text-gray-700">
                    {latestVideo.script}
                  </p>
                </div>
              )}

              {latestVideo.videoUrl && latestVideo.status === "completed" && (
                <p className="mt-3 text-xs text-green-600">
                  วิดีโอพร้อมใช้งาน: {latestVideo.videoUrl}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {workflow.status !== "completed" && (
        <button onClick={handleRun} className="btn-primary" disabled={running}>
          <Play className="h-4 w-4" />
          {running ? "Bot กำลังทำงาน..." : "รัน Bot อัตโนมัติ (เจนวิดีโอ + ปักตะกร้า)"}
        </button>
      )}
    </DashboardLayout>
  );
}
