import { createClient, getUser } from "@/auth/server";
import { AdminRegistrations } from "@/components/admin/registrations/AdminRegistrations";

export default async function AdminDashboardPage() {
    const user = await getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Access Denied: You must log in.</div>;
    }

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : []; // Change to your real admin email(s)

    if (!adminEmails.includes(user.email)) {
        return <div className="p-8 text-red-500">Access Denied: You are not an admin.</div>;
    }
    const supabase = await createClient();
    const { data: registrations } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            {/* Pass the server-fetched registrations to the client component */}
            <AdminRegistrations registrations={registrations || []} />
        </div>
    );
}
