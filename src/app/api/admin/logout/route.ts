import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  store.delete("admin_session");
  return NextResponse.redirect(new URL("/admin-login", process.env.NEXT_PUBLIC_APP_URL ?? "https://hookah-website-two.vercel.app"));
}
