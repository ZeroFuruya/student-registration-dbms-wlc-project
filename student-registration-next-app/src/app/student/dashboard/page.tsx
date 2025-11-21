import StudentDashboard from "./StudentDashboard";
import { getStudentDashboardData } from "@/actions/student";
import { cookies } from "next/headers";

export default async function Page() {
    // ⚡ Await cookies() in server components
    const cookieStore = await cookies();

    // Get the Supabase auth token cookie
    const authCookie = cookieStore.get("sb-auth-token");

    if (!authCookie) throw new Error("User not logged in");

    const authUserId = authCookie.value;

    // Fetch student dashboard data
    const studentData = await getStudentDashboardData(authUserId);

    return <StudentDashboard initialData={studentData} />;
}
