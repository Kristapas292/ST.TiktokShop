import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiTarget = process.env.API_PROXY_TARGET;

  if (!apiTarget) {
    return NextResponse.json(
      { error: "API_PROXY_TARGET ยังไม่ได้ตั้งค่า" },
      { status: 500 }
    );
  }

  const search = request.nextUrl.search;
  const targetUrl = `${apiTarget.replace(/\/$/, "")}/api/tiktok/callback${search}`;

  const response = await fetch(targetUrl, { redirect: "manual" });
  const location = response.headers.get("location");

  if (location) {
    return NextResponse.redirect(location, response.status);
  }

  const responseText = await response.text();

  return new NextResponse(responseText || "OAuth callback failed", {
    status: response.status || 500,
    headers: {
      "content-type": response.headers.get("content-type") || "text/plain",
    },
  });
}
