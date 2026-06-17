"use client";

import { LogOut, Link2 } from "lucide-react";
import type { TikTokStatus } from "@/lib/types";

type TikTokProfileCardProps = {
  status: TikTokStatus;
  compact?: boolean;
  disconnecting?: boolean;
  onDisconnect?: () => void;
};

export function TikTokProfileCard({
  status,
  compact = false,
  disconnecting = false,
  onDisconnect,
}: TikTokProfileCardProps) {
  const displayLabel = status.displayName || status.username || "บัญชี TikTok";

  if (compact) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50/60 px-3 py-3">
        <div className="flex items-center gap-3">
          <TikTokAvatar status={status} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{displayLabel}</p>
            {status.username && (
              <p className="truncate text-xs text-gray-500">@{status.username}</p>
            )}
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-green-700">
              <Link2 className="h-3 w-3" />
              เชื่อมต่อแล้ว
            </span>
          </div>
        </div>

        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            disabled={disconnecting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut className="h-3.5 w-3.5" />
            {disconnecting ? "กำลังออก..." : "Logout TikTok"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <TikTokAvatar status={status} size="lg" />

      <h2 className="mt-4 text-xl font-bold text-gray-900">{displayLabel}</h2>

      {status.username && (
        <p className="mt-1 text-sm text-gray-500">@{status.username}</p>
      )}

      {status.tiktokOpenId && (
        <p className="mt-2 text-xs text-gray-400">Open ID: {status.tiktokOpenId}</p>
      )}

      <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        <Link2 className="h-3 w-3" />
        เชื่อมต่อ TikTok แล้ว
      </span>

      {onDisconnect && (
        <button
          type="button"
          onClick={onDisconnect}
          disabled={disconnecting}
          className="btn-secondary mx-auto mt-6 flex items-center gap-2 text-red-600 hover:border-red-100 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          {disconnecting ? "กำลังออก..." : "Logout TikTok"}
        </button>
      )}
    </div>
  );
}

function TikTokAvatar({
  status,
  size,
}: {
  status: TikTokStatus;
  size: "sm" | "lg";
}) {
  const sizeClass = size === "sm" ? "h-10 w-10" : "h-24 w-24";
  const iconSize = size === "sm" ? "h-5 w-5" : "h-12 w-12";

  return (
    <div
      className={`mx-auto flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-900 ring-2 ring-green-500 ring-offset-2`}
    >
      {status.avatarUrl ? (
        <img
          src={status.avatarUrl}
          alt={status.displayName || "TikTok profile"}
          className={`${sizeClass} object-cover`}
        />
      ) : (
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      )}
    </div>
  );
}
