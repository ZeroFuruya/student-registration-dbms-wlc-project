import React from "react";
import AdminDashboard from "./AdminDashboard";
import { getUser } from "@/auth/server";
import { requireAdmin } from "@/auth/adminAuth";

export default async function AdminDashPage() {
    const user = await getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Access Denied: You must log in.</div>;
    }

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : []; // Change to your real admin email(s)

    if (!adminEmails.includes(user.email)) {
        return <div className="p-8 text-red-500">Access Denied: You are not an admin.</div>;
    }
    return <AdminDashboard />;
}
