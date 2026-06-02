import crypto from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

function computeToken(): string {
  return crypto
    .createHmac("sha256", process.env.ADMIN_PASSWORD ?? "")
    .update("kaia-admin-v1")
    .digest("hex")
}

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("kaia_admin")?.value
  if (!token || token !== computeToken()) {
    redirect("/admin/login")
  }
  return <>{children}</>
}
