import { NextResponse } from "next/server";

export async function POST(request) {
  const { locale } = await request.json();
  const value = locale === "uz" ? "uz" : "ru";
  const res = NextResponse.json({ ok: true, locale: value });
  res.cookies.set("locale", value, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
