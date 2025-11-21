import React from "react";
import AdminDashboard from "./AdminDashboard";
import { getUser } from "@/auth/server";

export default async function AdminDashPage() {
    const user = await getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Access Denied: You must log in.</div>;
    }
    return <AdminDashboard />;
}
