"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import type { TenantSettings } from "@/lib/types";

const TEXT_MODELS = [
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite (แนะนำ Free tier)" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (ต้องเปิด Billing)" },
];

const VIDEO_MODELS = [
  { value: "veo-2.0-generate-001", label: "Veo 2.0" },
  { value: "veo-3.0-generate-preview", label: "Veo 3.0 Preview" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash-lite");
  const [geminiVideoModel, setGeminiVideoModel] = useState("veo-2.0-generate-001");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings() {
    const data = await apiFetch<TenantSettings>("/api/settings");
    setSettings(data);
    setGeminiModel(data.geminiModel);
    setGeminiVideoModel(data.geminiVideoModel);
  }

  useEffect(() => {
    loadSettings()
      .catch((err) => setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload: Record<string, string> = {
        geminiModel,
        geminiVideoModel,
      };

      if (geminiApiKey.trim()) {
        payload.geminiApiKey = geminiApiKey.trim();
      }

      const data = await apiFetch<TenantSettings>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSettings(data);
      setGeminiApiKey("");
      setMessage("บันทึกการตั้งค่าแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setError("");
    setMessage("");

    try {
      const result = await apiFetch<{
        success: boolean;
        reply: string;
        modelUsed?: string;
      }>("/api/settings/test-gemini", {
        method: "POST",
        body: JSON.stringify({
          geminiApiKey: geminiApiKey.trim() || undefined,
          geminiModel,
        }),
      });
      const modelNote = result.modelUsed
        ? ` (ใช้โมเดล: ${result.modelUsed})`
        : "";
      setMessage(`ทดสอบ Gemini สำเร็จ: ${result.reply}${modelNote}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ทดสอบไม่สำเร็จ");
    } finally {
      setTesting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่า AI</h1>
        <p className="text-sm text-gray-500">
          กรอก Gemini API Key สำหรับเขียนสคริปต์และเจนวิดีโออัตโนมัติ
        </p>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <div className="card">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {(geminiModel === "gemini-2.0-flash" ||
                error.toLowerCase().includes("quota")) && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">
                      Quota หมดสำหรับ {geminiModel}
                    </p>
                    <p className="mt-1 text-red-700">
                      เลือก <strong>Flash Lite</strong> แล้วกด{" "}
                      <strong>บันทึกการตั้งค่า</strong> ก่อนกดทดสอบ
                    </p>
                    <button
                      type="button"
                      className="btn-primary mt-3 py-2 text-xs"
                      onClick={() => setGeminiModel("gemini-2.0-flash-lite")}
                    >
                      เปลี่ยนเป็น Flash Lite
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">ถ้าเจอ error Quota exceeded</p>
                  <p className="mt-1 text-yellow-700">
                    Free tier มี limit ต่อวัน — เปลี่ยนเป็น{" "}
                    <strong>gemini-2.0-flash-lite</strong> หรือเปิด Billing ที่{" "}
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 text-green-600" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Gemini API Key</p>
                  <p className="mt-1 text-green-700">
                    รับ API Key ได้ที่{" "}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Google AI Studio
                    </a>
                    {settings?.geminiApiKeySet && settings.geminiApiKeyMasked && (
                      <span className="mt-2 block">
                        คีย์ปัจจุบัน: {settings.geminiApiKeyMasked}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="label-text" htmlFor="geminiApiKey">
                  <KeyRound className="mr-1 inline h-4 w-4" />
                  Gemini API Key
                </label>
                <input
                  id="geminiApiKey"
                  type="password"
                  className="input-field"
                  placeholder={
                    settings?.geminiApiKeySet
                      ? "กรอกใหม่เพื่อเปลี่ยนคีย์"
                      : "AIza..."
                  }
                  value={geminiApiKey}
                  onChange={(event) => setGeminiApiKey(event.target.value)}
                />
              </div>

              <div>
                <label className="label-text" htmlFor="geminiModel">
                  โมเดลเขียนสคริปต์
                </label>
                <select
                  id="geminiModel"
                  className="input-field"
                  value={geminiModel}
                  onChange={(event) => setGeminiModel(event.target.value)}
                >
                  {TEXT_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text" htmlFor="geminiVideoModel">
                  โมเดลเจนวิดีโอ (Veo)
                </label>
                <select
                  id="geminiVideoModel"
                  className="input-field"
                  value={geminiVideoModel}
                  onChange={(event) => setGeminiVideoModel(event.target.value)}
                >
                  {VIDEO_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  ต้องเปิดสิทธิ์ Veo ใน Google AI Studio — ถ้าเจนวิดีโอไม่ได้
                  ลองเปลี่ยนโมเดลหรือตรวจสอบ quota
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                </button>
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="btn-secondary"
                >
                  {testing ? "กำลังทดสอบ..." : "ทดสอบ Gemini"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
