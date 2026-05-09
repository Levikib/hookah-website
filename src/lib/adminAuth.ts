import { cookies } from "next/headers";

export async function validateAdminCookie(): Promise<boolean> {
  const store = await cookies();
  const session = store.get("admin_session")?.value;
  return session === process.env.ADMIN_SECRET;
}
