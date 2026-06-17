"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Mail, Lock, User, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register({ email, password, name, tenantName });
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-white p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">TikTok Workflow</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight text-gray-900">
            ระบบจัดการสินค้า
            <br />
            <span className="text-green-600">TikTok Shop</span>
          </h2>
          <p className="mt-4 max-w-md text-gray-500">
            เลือกสินค้า เจนวิดีโอรีวิว และปักตะกร้าอัตโนมัติ
            ระบบเช่าใช้งานง่าย จัดการได้จากหน้าเว็บ
          </p>

          <div className="mt-8 space-y-4">
            {["เลือกสินค้าจาก TikTok", "เจนวิดีโอรีวิวอัตโนมัติ", "ปักตะกร้าสินค้า"].map(
              (feature, index) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              )
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400">© 2026 TikTok Product Workflow</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-gray-50/50 p-8">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900">
              {isRegister ? "สมัครใช้งาน" : "เข้าสู่ระบบ"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isRegister
                ? "สร้างบัญชีเช่าใช้งานใหม่"
                : "เข้าสู่ระบบเพื่อจัดการ Workflow"}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="label-text">ชื่อ-นามสกุล</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        className="input-field pl-10"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="ชื่อของคุณ"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-text">ชื่อร้าน / องค์กร</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        className="input-field pl-10"
                        value={tenantName}
                        onChange={(event) => setTenantName(event.target.value)}
                        placeholder="ชื่อร้านของคุณ"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="label-text">อีเมล</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    className="input-field pl-10"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-text">รหัสผ่าน</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    className="input-field pl-10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "กำลังดำเนินการ..." : isRegister ? "สมัครใช้งาน" : "เข้าสู่ระบบ"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {isRegister ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="font-semibold text-green-600 hover:text-green-700"
              >
                {isRegister ? "เข้าสู่ระบบ" : "สมัครใช้งาน"}
              </button>
            </p>

            {!isRegister && (
              <p className="mt-4 text-center text-xs text-gray-400">
                Demo: demo@example.com / admin1234
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
