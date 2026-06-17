"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Play, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import type { ScheduleRunLog, WorkflowSchedule } from "@/lib/types";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);

const DAY_OPTIONS = [
  { value: 1, label: "จ" },
  { value: 2, label: "อ" },
  { value: 3, label: "พ" },
  { value: 4, label: "พฤ" },
  { value: 5, label: "ศ" },
  { value: 6, label: "ส" },
  { value: 0, label: "อา" },
];

function parseHours(value: string) {
  try {
    return JSON.parse(value) as number[];
  } catch {
    return [9, 18];
  }
}

export default function AutomationPage() {
  const [schedules, setSchedules] = useState<WorkflowSchedule[]>([]);
  const [logs, setLogs] = useState<ScheduleRunLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "ตารางรีวิวออโต้",
    isActive: true,
    runHours: [9, 18] as number[],
    runDays: [1, 2, 3, 4, 5, 6, 0] as number[],
    productStrategy: "highest_commission",
    maxProductsPerRun: 1,
    videoStyle: "review_thai",
  });

  async function loadData() {
    const [scheduleData, logData] = await Promise.all([
      apiFetch<{ schedules: WorkflowSchedule[] }>("/api/schedules"),
      apiFetch<{ logs: ScheduleRunLog[] }>("/api/schedules/logs"),
    ]);
    setSchedules(scheduleData.schedules);
    setLogs(logData.logs);
  }

  useEffect(() => {
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  function toggleHour(hour: number) {
    setForm((prev) => ({
      ...prev,
      runHours: prev.runHours.includes(hour)
        ? prev.runHours.filter((item) => item !== hour)
        : [...prev.runHours, hour].sort((a, b) => a - b),
    }));
  }

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      runDays: prev.runDays.includes(day)
        ? prev.runDays.filter((item) => item !== day)
        : [...prev.runDays, day],
    }));
  }

  async function handleCreate() {
    if (!form.name.trim() || form.runHours.length === 0 || form.runDays.length === 0) {
      alert("กรุณากรอกชื่อ เวลา และวันให้ครบ");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiFetch("/api/schedules", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(schedule: WorkflowSchedule) {
    try {
      await apiFetch(`/api/schedules/${schedule.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !schedule.isActive }),
      });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ");
    }
  }

  async function handleRun(scheduleId: string) {
    setRunningId(scheduleId);
    try {
      await apiFetch(`/api/schedules/${scheduleId}/run`, { method: "POST" });
      await loadData();
      alert("รัน workflow ออโต้สำเร็จ");
    } catch (err) {
      alert(err instanceof Error ? err.message : "รันไม่สำเร็จ");
    } finally {
      setRunningId(null);
    }
  }

  async function handleDelete(scheduleId: string) {
    if (!confirm("ลบตารางเวลานี้?")) return;

    try {
      await apiFetch(`/api/schedules/${scheduleId}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตั้งเวลาออโต้</h1>
          <p className="text-sm text-gray-500">
            เลือกสินค้า → Gemini เขียนสคริปต์ → เจนวิดีโอ → ปักตะกร้า ตามเวลาที่กำหนด
          </p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          สร้างตาราง
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {showForm && (
        <div className="card mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">ตารางใหม่</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label-text">ชื่อตาราง</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>

            <div>
              <label className="label-text">กลยุทธ์เลือกสินค้า</label>
              <select
                className="input-field"
                value={form.productStrategy}
                onChange={(event) =>
                  setForm({ ...form, productStrategy: event.target.value })
                }
              >
                <option value="highest_commission">คอมมิชชั่นสูงสุด</option>
                <option value="random">สุ่ม</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <p className="label-text">เวลารัน (เวลาไทย)</p>
            <div className="flex flex-wrap gap-2">
              {HOUR_OPTIONS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => toggleHour(hour)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    form.runHours.includes(hour)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {hour.toString().padStart(2, "0")}:00
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="label-text">วัน</p>
            <div className="flex flex-wrap gap-2">
              {DAY_OPTIONS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    form.runDays.includes(day.value)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={handleCreate} disabled={saving} className="btn-primary">
              {saving ? "กำลังบันทึก..." : "บันทึกตาราง"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">ตารางทั้งหมด</h2>
            {schedules.length === 0 ? (
              <div className="card text-sm text-gray-500">ยังไม่มีตาราง — กดสร้างตารางด้านบน</div>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        เวลา: {parseHours(schedule.runHours).map((hour) => `${hour}:00`).join(", ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        กลยุทธ์: {schedule.productStrategy === "random" ? "สุ่ม" : "คอมมิชชั่นสูงสุด"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        schedule.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {schedule.isActive ? "เปิด" : "ปิด"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleRun(schedule.id)}
                      disabled={runningId === schedule.id}
                      className="btn-primary py-2 text-xs"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {runningId === schedule.id ? "กำลังรัน..." : "รันทันที"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(schedule)}
                      className="btn-secondary py-2 text-xs"
                    >
                      {schedule.isActive ? "ปิดตาราง" : "เปิดตาราง"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(schedule.id)}
                      className="btn-secondary py-2 text-xs text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      ลบ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <CalendarClock className="h-5 w-5 text-green-600" />
              ประวัติการรัน
            </h2>
            <div className="card max-h-[32rem] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-500">ยังไม่มีประวัติ</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {log.schedule?.name || "ตารางออโต้"}
                        </p>
                        <span
                          className={`text-xs font-medium ${
                            log.status === "success"
                              ? "text-green-600"
                              : log.status === "failed"
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(log.startedAt).toLocaleString("th-TH")}
                      </p>
                      {log.message && (
                        <p className="mt-2 text-xs text-gray-600">{log.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
