"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Link2, Unlink } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TikTokConnectButton } from "@/components/TikTokConnectButton";
import { apiFetch } from "@/lib/api";
import type { TikTokStatus } from "@/lib/types";

export default function ConnectTikTokPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          </div>
        }
      >
        <ConnectTikTokContent />
      </Suspense>
    </DashboardLayout>
  );
}

function ConnectTikTokContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<TikTokStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStatus() {
    const data = await apiFetch<TikTokStatus>("/api/tiktok/status");
    setStatus(data);
  }

  useEffect(() => {
    loadStatus()
      .catch((err) => setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const callbackError = searchParams.get("error");

    if (connected === "1") {
      setMessage("เชื่อมต่อ TikTok สำเร็จแล้ว");
      loadStatus().catch(console.error);
    }

    if (callbackError) {
      setError(callbackError);
    }
  }, [searchParams]);

  async function handleConnect() {
    setConnecting(true);
    setError("");
    setMessage("");

    try {
      const data = await apiFetch<{ url: string }>("/api/tiktok/auth-url");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "เปิดหน้า TikTok ไม่สำเร็จ");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("ต้องการยกเลิกการเชื่อมต่อ TikTok?")) return;

    setDisconnecting(true);
    setError("");
    setMessage("");

    try {
      await apiFetch("/api/tiktok/disconnect", { method: "POST" });
      setMessage("ยกเลิกการเชื่อมต่อแล้ว");
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ยกเลิกการเชื่อมต่อไม่สำเร็จ");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">เชื่อมต่อ TikTok</h1>
        <p className="text-sm text-gray-500">
          ล็อกอินด้วย TikTok เพื่อผูกบัญชีเข้ากับระบบของคุณ
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

      <div className="mx-auto max-w-lg">
        <div className="card text-center">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            </div>
          ) : status?.isConnected ? (
            <ConnectedView
              status={status}
              disconnecting={disconnecting}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <DisconnectedView
              status={status}
              connecting={connecting}
              onConnect={handleConnect}
            />
          )}
        </div>
      </div>
    </>
  );
}

function ConnectedView({
  status,
  disconnecting,
  onDisconnect,
}: {
  status: TikTokStatus;
  disconnecting: boolean;
  onDisconnect: () => void;
}) {
  return (
    <div>
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-green-50">
        {status.avatarUrl ? (
          <img
            src={status.avatarUrl}
            alt={status.displayName || "TikTok"}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-900">
        {status.displayName || "บัญชี TikTok"}
      </h2>

      {status.username && (
        <p className="mt-1 text-sm text-gray-500">@{status.username}</p>
      )}

      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        <Link2 className="h-3 w-3" />
        เชื่อมต่อแล้ว
      </span>

      <button
        onClick={onDisconnect}
        disabled={disconnecting}
        className="btn-secondary mx-auto mt-6 flex items-center gap-2"
      >
        <Unlink className="h-4 w-4" />
        {disconnecting ? "กำลังยกเลิก..." : "ยกเลิกการเชื่อมต่อ"}
      </button>
    </div>
  );
}

function DisconnectedView({
  status,
  connecting,
  onConnect,
}: {
  status: TikTokStatus | null;
  connecting: boolean;
  onConnect: () => void;
}) {
  return (
    <div>
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <svg viewBox="0 0 24 24" className="h-10 w-10 fill-gray-400" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      </div>

      <h2 className="text-lg font-bold text-gray-900">ยังไม่ได้เชื่อมต่อ TikTok</h2>
      <p className="mt-2 text-sm text-gray-500">
        กดปุ่มด้านล่างเพื่อล็อกอิน TikTok และผูกบัญชีเข้ากับ user นี้โดยอัตโนมัติ
      </p>

      {!status?.isConfigured && (
        <p className="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-xs text-yellow-700">
          แอดมินต้องตั้งค่า TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET และ
          TIKTOK_REDIRECT_URI บน API Server ก่อน
        </p>
      )}

      <div className="mt-6">
        <TikTokConnectButton loading={connecting} onClick={onConnect} />
      </div>
    </div>
  );
}
