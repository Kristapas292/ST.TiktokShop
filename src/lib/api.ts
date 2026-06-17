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
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

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
    throw new Error(
      "เชื่อมต่อ API ไม่ได้ — ตรวจสอบ API_PROXY_TARGET และว่า API บน VPS รันอยู่"
    );
  }

  if (!response.ok) {
    throw new Error(data.error || "เกิดข้อผิดพลาด");
  }

  return data as T;
}
