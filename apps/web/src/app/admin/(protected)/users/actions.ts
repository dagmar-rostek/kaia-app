"use server"

import { revalidatePath } from "next/cache"

const API = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

function adminHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
  }
}

export async function approveUser(userId: number): Promise<void> {
  await fetch(`${API}/v1/admin/users/${userId}/approve`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ approved_by: "admin" }),
  })
  revalidatePath("/admin/users")
}

export async function rejectUser(userId: number, reason: string): Promise<void> {
  await fetch(`${API}/v1/admin/users/${userId}/reject`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ reason }),
  })
  revalidatePath("/admin/users")
}

export async function deleteUser(userId: number): Promise<void> {
  await fetch(`${API}/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  })
  revalidatePath("/admin/users")
}

export async function sendStudyStartMails(): Promise<{ sent: number }> {
  const res = await fetch(`${API}/v1/admin/study-start-mail`, {
    method: "POST",
    headers: adminHeaders(),
  })
  if (!res.ok) return { sent: 0 }
  return res.json() as Promise<{ sent: number }>
}
