"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  FlaskConical,
  Loader2,
  Play,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import type {
  FlowProgressStep,
  RunProgress,
  ScheduleRunLog,
  TestFlowStartResult,
  WorkflowSchedule,
} from "@/lib/types";

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

function StepIcon({ status }: { status: FlowProgressStep["status"] }) {
  if (status === "running") {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-green-600" />;
  }
  if (status === "success") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />;
  }
  if (status === "failed") {
    return <XCircle className="h-4 w-4 shrink-0 text-red-600" />;
  }
  if (status === "skipped") {
    return <span className="h-4 w-4 shrink-0 rounded-full bg-gray-300" />;
  }
  return <span className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-200" />;
}

function FlowProgressPanel({
  progress,
  title,
  onClose,
}: {
  progress: RunProgress;
  title: string;
  onClose: () => void;
}) {
  const isRunning = progress.status === "running";
  const isFailed = progress.status === "failed";
  const result = progress.result;

  return (
    <div
      className={`card mb-6 ${
        isFailed
          ? "border-red-200 bg-red-50/40"
          : isRunning
            ? "border-green-200 bg-green-50/20"
            : "border-green-200 bg-green-50/40"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isRunning && (
            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
          )}
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          ปิด
        </button>
      </div>

      {isRunning && (
        <p className="mb-4 text-sm text-green-700">
          กำลังดำเนินการ... อัปเดตสถานะอัตโนมัติ
        </p>
      )}

      {isFailed && progress.error && (
        <p className="mb-4 text-sm text-red-600">{progress.error}</p>
      )}

      {result?.message && progress.status === "success" && (
        <p className="mb-4 text-sm text-green-700">{result.message}</p>
      )}

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
          {isRunning ? "ขั้นตอนปัจจุบัน" : "ขั้นตอนที่ทำแล้ว"}
        </p>
        <div className="space-y-2">
          {progress.steps.map((step) => (
            <div
              key={step.key}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                step.status === "running"
                  ? "bg-green-100 ring-1 ring-green-300"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <StepIcon status={step.status} />
                <span className="font-medium text-gray-800">{step.label}</span>
                {step.status === "running" && (
                  <span className="text-xs text-green-600">กำลังทำ...</span>
                )}
              </div>
              <p className="mt-1 pl-6 text-xs text-gray-600">{step.message}</p>
            </div>
          ))}
        </div>
      </div>

      {result?.video?.videoUrl && (
        <div className="mb-4 rounded-lg bg-white p-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">วิดีโอที่สร้าง</p>
          <a
            href={result.video.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-green-700 underline"
          >
            เปิดดูวิดีโอ
          </a>
        </div>
      )}

      {result?.post?.postUrl && (
        <div className="mb-4 rounded-lg bg-white p-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">โพสต์ TikTok</p>
          <a
            href={result.post.postUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-green-700 underline"
          >
            เปิดดูโพสต์
          </a>
        </div>
      )}

      {result?.workflowId && progress.status === "success" && (
        <Link
          href={`/workflows/${result.workflowId}`}
          className="btn-primary inline-flex text-sm"
        >
          ดู Workflow ที่สร้าง
        </Link>
      )}
    </div>
  );
}

export default function AutomationPage() {
  const [schedules, setSchedules] = useState<WorkflowSchedule[]>([]);
  const [logs, setLogs] = useState<ScheduleRunLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [activeProgress, setActiveProgress] = useState<RunProgress | null>(null);
  const [progressTitle, setProgressTitle] = useState("");
  const [testError, setTestError] = useState("");
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

  useEffect(() => {
    if (!activeProgress || activeProgress.status !== "running") return;

    const intervalId = window.setInterval(async () => {
      try {
        const data = await apiFetch<{ progress: RunProgress }>(
          `/api/run-progress/${activeProgress.runId}`
        );
        setActiveProgress(data.progress);

        if (data.progress.status !== "running") {
          await loadData();
        }
      } catch (err) {
        setTestError(err instanceof Error ? err.message : "ดึงสถานะไม่สำเร็จ");
      }
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [activeProgress?.runId, activeProgress?.status]);

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

  async function startFlowRun(
    scheduleId: string,
    endpoint: "test-flow" | "run",
    title: string
  ) {
    const isTest = endpoint === "test-flow";

    if (isTest) {
      setTestingId(scheduleId);
    } else {
      setRunningId(scheduleId);
    }

    setActiveProgress(null);
    setTestError("");
    setProgressTitle(title);

    try {
      const startResult = await apiFetch<TestFlowStartResult>(
        `/api/schedules/${scheduleId}/${endpoint}`,
        { method: "POST" }
      );

      const initialProgress: RunProgress = {
        runId: startResult.runId,
        tenantId: "",
        scheduleId,
        isTestRun: startResult.isTestRun,
        status: "running",
        currentStepKey: "check",
        steps: [
          {
            key: "check",
            label: "ตรวจสอบระบบ",
            status: "success",
            message: startResult.prerequisites
              .map((item) => `${item.label}: ${item.message}`)
              .join(" | "),
          },
          {
            key: "select_product",
            label: "เลือกสินค้าจากตะกร้า",
            status: "pending",
            message: "รอดำเนินการ",
          },
          {
            key: "generate_script",
            label: "Gemini เขียนสคริปต์รีวิว",
            status: "pending",
            message: "รอดำเนินการ",
          },
          {
            key: "generate_video",
            label: "Gemini เจนวิดีโอ",
            status: "pending",
            message: "รอดำเนินการ",
          },
          {
            key: "pin_cart",
            label: "ปักตะกร้าสินค้า",
            status: "pending",
            message: "รอดำเนินการ",
          },
          {
            key: "post_video",
            label: "โพสต์วิดีโอลง TikTok",
            status: "pending",
            message: "รอดำเนินการ",
          },
        ],
        result: null,
        error: null,
        startedAt: new Date().toISOString(),
        completedAt: null,
      };

      setActiveProgress(initialProgress);

      const pollData = await apiFetch<{ progress: RunProgress }>(
        `/api/run-progress/${startResult.runId}`
      );
      setActiveProgress(pollData.progress);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "เริ่มรันไม่สำเร็จ");
    } finally {
      if (isTest) {
        setTestingId(null);
      } else {
        setRunningId(null);
      }
    }
  }

  async function handleTestFlow(scheduleId: string) {
    await startFlowRun(scheduleId, "test-flow", "ทดสอบ Flow ทั้งหมด");
  }

  async function handleRun(scheduleId: string) {
    await startFlowRun(scheduleId, "run", "รัน Workflow ออโต้");
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
            เลือกสินค้า → Gemini เขียนสคริปต์ → เจนวิดีโอ → ปักตะกร้า → โพสต์ TikTok ตามเวลาที่กำหนด
          </p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          สร้างตาราง
        </button>
      </div>

      {testError && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {testError}
        </div>
      )}

      {activeProgress && (
        <FlowProgressPanel
          progress={activeProgress}
          title={progressTitle}
          onClose={() => setActiveProgress(null)}
        />
      )}

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
                      onClick={() => handleTestFlow(schedule.id)}
                      disabled={
                        testingId === schedule.id ||
                        runningId === schedule.id ||
                        activeProgress?.status === "running"
                      }
                      className="btn-primary border-2 border-green-700 bg-green-700 py-2 text-xs"
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      {testingId === schedule.id
                        ? "กำลังเริ่มทดสอบ..."
                        : "ทดสอบ Flow ทั้งหมด"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRun(schedule.id)}
                      disabled={
                        runningId === schedule.id ||
                        testingId === schedule.id ||
                        activeProgress?.status === "running"
                      }
                      className="btn-secondary py-2 text-xs"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {runningId === schedule.id ? "กำลังเริ่มรัน..." : "รันทันที"}
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
