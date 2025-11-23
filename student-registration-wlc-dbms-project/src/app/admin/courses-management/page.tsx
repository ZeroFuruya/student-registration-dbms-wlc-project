import { createClient, getUser } from "@/auth/server";
import CoursesManager from "./CoursesManager";
import { Database } from "@/types/supabase";

export default async function CoursesManagementPage() {
    const user = await getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Access Denied: You must log in.</div>;
    }

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : [];

    if (!user.email || !adminEmails.includes(user.email)) {
        return <div className="p-8 text-red-500">Access Denied: You are not an admin.</div>;
    }

    const supabase = await createClient();

    // Fetch courses with their year and program info
    const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<Database["public"]["Tables"]["courses"]["Row"][]>();

    // Fetch years to get program/year mapping
    const { data: years } = await supabase
        .from("years")
        .select("*")
        .order("year_level", { ascending: true })
        .returns<Database["public"]["Tables"]["years"]["Row"][]>();

    // Fetch programs
    const { data: programs } = await supabase
        .from("programs")
        .select("*")
        .order("program_name", { ascending: true })
        .returns<Database["public"]["Tables"]["programs"]["Row"][]>();

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-xl font-bold">Courses Management</h1>

            {/* Pass fetched data to the client component */}
            <CoursesManager
                courses={courses || []}
                years={years || []}
                programs={programs || []}
            />
        </div>
    );
}