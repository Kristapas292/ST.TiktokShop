"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TikTokConnectButton } from "@/components/TikTokConnectButton";
import { TikTokProfileCard } from "@/components/TikTokProfileCard";
import { apiFetch } from "@/lib/api";
import { useTikTokStatus } from "@/lib/use-tiktok-status";

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

function formatTikTokCallbackError(rawError: string) {
  const lowerError = rawError.toLowerCase();

  if (lowerError.includes("unsupported grant") || lowerError.includes("unsupported_grant")) {
    return "รหัสยืนยัน TikTok หมดอายุหรือถูกใช้ไปแล้ว — กดเชื่อมต่อใหม่อีกครั้ง (ห้ามรีเฟรชหน้า callback)";
  }

  if (lowerError.includes("redirect_uri")) {
    return "Redirect URI ไม่ตรงกับที่ตั้งใน TikTok Developer Portal — ตรวจสอบ TIKTOK_REDIRECT_URI บน VPS";
  }

  if (rawError.includes("Unexpected token")) {
    return "TikTok API ตอบกลับผิดรูปแบบ — ลองเชื่อมต่อใหม่ หรือตรวจสอบ Client Key/Secret และ Sandbox target user";
  }

  return rawError;
}

function ConnectTikTokContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    status,
    loading,
    error: statusError,
    disconnecting,
    setError,
    loadStatus,
    disconnect,
  } = useTikTokStatus();
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");
  const [callbackError, setCallbackError] = useState("");

  useEffect(() => {
    const connected = searchParams.get("connected");
    const errorFromCallback = searchParams.get("error");

    if (connected === "1") {
      setCallbackError("");
      setMessage("เชื่อมต่อ TikTok สำเร็จแล้ว");
      loadStatus()
        .catch(console.error)
        .finally(() => {
          router.replace("/connect-tiktok", { scroll: false });
        });
      return;
    }

    if (errorFromCallback) {
      setMessage("");
      setCallbackError(formatTikTokCallbackError(errorFromCallback));
      router.replace("/connect-tiktok", { scroll: false });
    }
  }, [searchParams, loadStatus, router]);

  async function handleConnect() {
    setConnecting(true);
    setCallbackError("");
    setError("");
    setMessage("");

    try {
      const data = await apiFetch<{ url: string }>("/api/tiktok/auth-url");
      window.location.href = data.url;
    } catch (err) {
      setCallbackError(err instanceof Error ? err.message : "เปิดหน้า TikTok ไม่สำเร็จ");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("ต้องการออกจาก TikTok (ยกเลิกการเชื่อมต่อ)?")) return;

    setMessage("");
    setCallbackError("");

    try {
      await disconnect();
      setMessage("ออกจาก TikTok แล้ว");
    } catch (err) {
      setCallbackError(err instanceof Error ? err.message : "ออกจาก TikTok ไม่สำเร็จ");
    }
  }

  const displayError = callbackError || statusError;

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

      {displayError && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {displayError}
        </div>
      )}

      <div className="mx-auto max-w-lg">
        <div className="card">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            </div>
          ) : status?.isConnected ? (
            <TikTokProfileCard
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

function DisconnectedView({
  status,
  connecting,
  onConnect,
}: {
  status: { isConfigured?: boolean } | null;
  connecting: boolean;
  onConnect: () => void;
}) {
  return (
    <div className="text-center">
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
