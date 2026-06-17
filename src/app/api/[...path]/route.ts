import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const apiTarget = process.env.API_PROXY_TARGET;

  if (!apiTarget) {
    return NextResponse.json(
      { error: "API_PROXY_TARGET ยังไม่ได้ตั้งค่าใน Environment Variables" },
      { status: 500 }
    );
  }

  const { path } = await context.params;
  const apiPath = path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${apiTarget.replace(/\/$/, "")}/api/${apiPath}${search}`;

  const headers = new Headers();
  const authHeader = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authHeader) headers.set("authorization", authHeader);
  if (contentType) headers.set("content-type", contentType);

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, {
      ...init,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return NextResponse.redirect(location, response.status);
      }
    }

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: `เชื่อมต่อ API ไม่ได้ (${apiTarget}) ตรวจสอบว่า API รันอยู่และเปิดพอร์ตแล้ว`,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
