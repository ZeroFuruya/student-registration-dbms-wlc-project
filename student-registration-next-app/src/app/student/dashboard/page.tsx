import StudentDashboard from "./StudentDashboard";
import { getStudentDashboardData } from "@/actions/student";
import { createClient } from "@/auth/server";

export default async function Page() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error("User not logged in");

        const initialData = await getStudentDashboardData(user.id);

        return <StudentDashboard initialData={initialData} />;

    } catch (err: any) {
        return (
            <div className="p-6 text-red-600 font-bold">
                Error: {err.message}
            </div>
        );
    }
}
