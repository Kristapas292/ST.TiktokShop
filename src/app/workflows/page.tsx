"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Play, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge, StepProgress } from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";
import type { Workflow, Product } from "@/lib/types";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  async function loadData() {
    const [workflowData, productData] = await Promise.all([
      apiFetch<{ workflows: Workflow[] }>("/api/workflows"),
      apiFetch<{ products: Product[] }>("/api/products"),
    ]);
    setWorkflows(workflowData.workflows);
    setProducts(productData.products);
  }

  useEffect(() => {
    loadData()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function toggleProduct(productId: string) {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  async function handleCreate() {
    if (!workflowName.trim() || selectedProducts.length === 0) {
      alert("กรุณากรอกชื่อและเลือกสินค้า");
      return;
    }

    setCreating(true);
    try {
      await apiFetch("/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          name: workflowName,
          productIds: selectedProducts,
        }),
      });
      setShowCreate(false);
      setWorkflowName("");
      setSelectedProducts([]);
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setCreating(false);
    }
  }

  async function handleRun(workflowId: string) {
    setRunningId(workflowId);
    try {
      await apiFetch(`/api/workflows/${workflowId}/run`, { method: "POST" });
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setRunningId(null);
    }
  }

  async function handleDelete(workflowId: string) {
    if (!confirm("ต้องการลบ Workflow นี้?")) return;

    try {
      await apiFetch(`/api/workflows/${workflowId}`, { method: "DELETE" });
      setWorkflows((prev) => prev.filter((workflow) => workflow.id !== workflowId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow</h1>
          <p className="text-sm text-gray-500">
            เลือกสินค้า → เจนวิดีโอ → ปักตะกร้า
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          สร้าง Workflow
        </button>
      </div>

      {showCreate && (
        <div className="card mb-8">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">สร้าง Workflow ใหม่</h3>

          <div className="mb-4">
            <label className="label-text">ชื่อ Workflow</label>
            <input
              className="input-field"
              placeholder="เช่น รีวิวหูฟัง Pro"
              value={workflowName}
              onChange={(event) => setWorkflowName(event.target.value)}
            />
          </div>

          <label className="label-text">เลือกสินค้า</label>
          {products.length === 0 ? (
            <p className="text-sm text-gray-400">
              ยังไม่มีสินค้า —{" "}
              <Link href="/products" className="text-green-600 hover:underline">
                นำเข้าสินค้าก่อน
              </Link>
            </p>
          ) : (
            <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {products.map((product) => (
                <label
                  key={product.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    selectedProducts.includes(product.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="h-4 w-4 rounded accent-green-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-green-600">
                      ฿{product.price.toLocaleString()}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleCreate} className="btn-primary" disabled={creating}>
              {creating ? "กำลังสร้าง..." : "สร้าง"}
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-gray-400">ยังไม่มี Workflow</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-4">
            <Plus className="h-4 w-4" />
            สร้าง Workflow แรก
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="card">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Link
                    href={`/workflows/${workflow.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-green-600"
                  >
                    {workflow.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {workflow.items.length} สินค้า ·{" "}
                    {new Date(workflow.updatedAt).toLocaleString("th-TH")}
                  </p>
                </div>
                <StatusBadge status={workflow.status} />
              </div>

              <div className="mb-4">
                <StepProgress currentStep={workflow.currentStep} />
              </div>

              <div className="flex items-center gap-3">
                {workflow.status !== "completed" && (
                  <button
                    onClick={() => handleRun(workflow.id)}
                    className="btn-primary !py-2"
                    disabled={runningId === workflow.id}
                  >
                    <Play className="h-4 w-4" />
                    {runningId === workflow.id ? "กำลังทำงาน..." : "รัน Bot อัตโนมัติ"}
                  </button>
                )}
                <Link href={`/workflows/${workflow.id}`} className="btn-secondary !py-2">
                  ดูรายละเอียด
                </Link>
                <button
                  onClick={() => handleDelete(workflow.id)}
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
