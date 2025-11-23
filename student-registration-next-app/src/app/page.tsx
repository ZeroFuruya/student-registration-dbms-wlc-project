// app/page.tsx (Server Component - NO "use client")
import { redirect } from "next/navigation";
import { getUser } from "@/auth/server";
import HomePage from "./HomePage";

export default async function Page() {
  // Server-side auth check
  const user = await getUser();

  if (user) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    const isAdmin = adminEmails.includes(user.email || "");

    // Redirect authenticated users
    if (isAdmin) {
      redirect("/admin/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  // Only renders if no user is logged in
  return <HomePage />;
}