import Payments from "./Payments";
import { createClient } from "@/auth/server";
import { getStudentEnrollmentsForPayments, getStudentPayments } from "@/actions/payments";

export default async function Page() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error("User not logged in");

        // find student row
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (studentError) throw studentError;
        if (!student) throw new Error("Student record not found.");

        const studentId = student.id as number;

        // server actions to fetch enrollments/payments
        const enrollments = await getStudentEnrollmentsForPayments(studentId);
        const payments = await getStudentPayments(studentId);

        return <Payments studentId={studentId} initialEnrollments={enrollments} initialPayments={payments} />;
    } catch (err: any) {
        return <div className="p-6 text-red-600 font-bold">Error: {err.message}</div>;
    }
}
