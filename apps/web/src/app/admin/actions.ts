"use server"

import crypto from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

function computeToken(): string {
  return crypto.createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update("kaia-admin-v1").digest("hex")
}

export async function loginAction(_prev: string | null, formData: FormData): Promise<string | null> {
  const password = formData.get("password") as string
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return "Falsches Passwort."
  }
  const cookieStore = await cookies()
  cookieStore.set("kaia_admin", computeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  })
  redirect("/admin")
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("kaia_admin")
  redirect("/admin/login")
}
