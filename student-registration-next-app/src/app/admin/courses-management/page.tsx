import { createClient, getUser } from "@/auth/server";
import CoursesManager from "./CoursesManager";
import { Database } from "@/types/supabase";

export default async function CoursesManagementPage() {
    const user = await getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Access Denied: You must log in.</div>;
    }
    const supabase = await createClient();

    // Fetch courses with their year and program info
    const { data: courses } = await supabase
        .from<Database["public"]["Tables"]["courses"]["Row"]>("courses")
        .select("*")
        .order("created_at", { ascending: false });

    // Fetch years to get program/year mapping
    const { data: years } = await supabase
        .from<Database["public"]["Tables"]["years"]["Row"]>("years")
        .select("*")
        .order("year_level", { ascending: true });

    // Fetch programs
    const { data: programs } = await supabase
        .from<Database["public"]["Tables"]["programs"]["Row"]>("programs")
        .select("*")
        .order("program_name", { ascending: true });

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
