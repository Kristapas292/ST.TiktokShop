import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="text-sm text-green-600 hover:underline">
          ← กลับ
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">นโยบายความเป็นส่วนตัว</h1>
        <p className="mt-2 text-sm text-gray-500">ST DEV Workflow — อัปเดตล่าสุด: 2026</p>

        <div className="mt-8 space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            ST DEV Workflow เก็บข้อมูลที่จำเป็นสำหรับการให้บริการ เช่น อีเมล
            ชื่อผู้ใช้ และข้อมูลบัญชี TikTok ที่คุณเชื่อมต่อโดยสมัครใจ
          </p>
          <p>
            ข้อมูล TikTok ได้จาก Login Kit เพื่อแสดงโปรไฟล์และใช้งาน Workflow
            เราไม่ขายข้อมูลให้บุคคลที่สาม
          </p>
          <p>
            คุณสามารถยกเลิกการเชื่อมต่อ TikTok ได้จากหน้าเชื่อมต่อ TikTok
            ในระบบ
          </p>
          <p>ติดต่อ: Kristapas292@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
