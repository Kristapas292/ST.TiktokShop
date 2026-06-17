const TOKEN_KEY = "tiktok_workflow_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const responseText = await response.text();

  let data: { error?: string } = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    const preview = responseText.trim().slice(0, 120);
    throw new Error(
      preview
        ? `API ตอบกลับไม่ถูกต้อง: ${preview}`
        : "เชื่อมต่อ API ไม่ได้ — ตรวจสอบ API_PROXY_TARGET และว่า API บน VPS รันอยู่"
    );
  }

  if (!response.ok) {
    throw new Error(data.error || "เกิดข้อผิดพลาด");
  }

  return data as T;
}
