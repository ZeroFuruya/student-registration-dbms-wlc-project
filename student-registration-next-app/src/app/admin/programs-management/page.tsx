import { createClient, getUser } from "@/auth/server";
import ProgramsManager from "./ProgramsManager";

export default async function Page() {
    const user = await getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Access Denied: You must log in.</div>;
    }

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : []; // Change to your real admin email(s)

    if (!adminEmails.includes(user.email)) {
        return <div className="p-8 text-red-500">Access Denied: You are not an admin.</div>;
    }
    const supabase = await createClient();

    const { data: programs } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

    return <ProgramsManager programs={programs || []} />;
}
