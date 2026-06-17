"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { TikTokStatus } from "@/lib/types";

export function useTikTokStatus() {
  const [status, setStatus] = useState<TikTokStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    const data = await apiFetch<TikTokStatus>("/api/tiktok/status");
    setStatus(data);
    return data;
  }, []);

  const disconnect = useCallback(async () => {
    setDisconnecting(true);
    setError("");

    try {
      await apiFetch("/api/tiktok/disconnect", { method: "POST" });
      await loadStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : "ออกจาก TikTok ไม่สำเร็จ";
      setError(message);
      throw err;
    } finally {
      setDisconnecting(false);
    }
  }, [loadStatus]);

  useEffect(() => {
    loadStatus()
      .catch((err) => {
        setError(err instanceof Error ? err.message : "โหลดข้อมูล TikTok ไม่สำเร็จ");
      })
      .finally(() => setLoading(false));
  }, [loadStatus]);

  return {
    status,
    loading,
    error,
    disconnecting,
    setError,
    loadStatus,
    disconnect,
  };
}
