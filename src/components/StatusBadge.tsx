const STEP_LABELS: Record<string, string> = {
  select_product: "เลือกสินค้า",
  generate_video: "เจนวิดีโอ",
  pin_cart: "ปักตะกร้า",
  post_video: "โพสต์ TikTok",
  completed: "เสร็จสิ้น",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-600";
  const label = STEP_LABELS[status] || status;

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

export function StepProgress({ currentStep }: { currentStep: string }) {
  const steps = ["select_product", "generate_video", "pin_cart", "post_video", "completed"];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "border-2 border-gray-200 text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <span className="mt-1 text-[10px] text-gray-500">
                {STEP_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mb-4 h-0.5 w-8 ${
                  index < currentIndex ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
