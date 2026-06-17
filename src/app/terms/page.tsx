import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="text-sm text-green-600 hover:underline">
          ← กลับ
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">ข้อกำหนดการใช้งาน</h1>
        <p className="mt-2 text-sm text-gray-500">ST DEV Workflow — อัปเดตล่าสุด: 2026</p>

        <div className="mt-8 space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            ยินดีต้อนรับสู่ ST DEV Workflow ระบบจัดการสินค้า TikTok Shop
            สำหรับเช่าใช้งาน เลือกสินค้า เจนวิดีโอรีวิว และปักตะกร้าสินค้า
          </p>
          <p>
            การใช้งานระบบถือว่าคุณยอมรับข้อกำหนดนี้ ผู้ใช้ต้องรับผิดชอบต่อบัญชี
            และการใช้งานของตนเอง
          </p>
          <p>
            เราอาจปรับปรุงข้อกำหนดได้ตามความเหมาะสม การใช้งานต่อหลังมีการเปลี่ยนแปลง
            ถือว่ายอมรับข้อกำหนดใหม่
          </p>
          <p>ติดต่อ: Kristapas292@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
