import Enrollment from "./Enrollment";
import { getStudentEnrollments } from "@/actions/enrollment";
import { createClient } from "@/auth/server";

export default async function Page() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("User not logged in");

        const authUserId = user.id;

        // Get the student row
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select("id")
            .eq("auth_user_id", authUserId)
            .maybeSingle();

        if (studentError || !student) throw new Error("Student not found");

        const enrollments = await getStudentEnrollments(student.id);

        return <Enrollment studentId={student.id} initialEnrollments={enrollments} />;
    } catch (err: any) {
        return <div className="p-6 text-red-600 font-bold">Error: {err.message}</div>;
    }
}
