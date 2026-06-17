type TikTokConnectButtonProps = {
  loading?: boolean;
  onClick: () => void;
  label?: string;
};

export function TikTokConnectButton({
  loading,
  onClick,
  label = "เชื่อมต่อด้วย TikTok",
}: TikTokConnectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:opacity-50"
    >
      <TikTokIcon />
      {loading ? "กำลังเปิด TikTok..." : label}
    </button>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}
