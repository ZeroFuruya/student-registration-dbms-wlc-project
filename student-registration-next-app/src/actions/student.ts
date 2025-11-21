"use server";

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";

export interface StudentAnalytics {
    currentProgram: string;
    yearLevel: number;
    registeredCourses: number;
    completedUnits: number;
    pendingDocuments: number;
    upcomingPayments: number;
}

// Fetch dashboard data for a student by auth_user_id
export const getStudentDashboardData = async (authUserId: string) => {
    try {
        const supabase = await createClient();

        // 1️⃣ Get student info
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select(`
                id,
                first_name,
                last_name,
                program_id,
                year_level
            `)
            .eq("auth_user_id", authUserId)
            .maybeSingle();

        if (studentError) throw studentError;
        if (!student) throw new Error("Student not found");

        // 2️⃣ Get program info
        const { data: programData, error: programError } = await supabase
            .from("programs")
            .select("program_name, total_units")
            .eq("id", student.program_id)
            .maybeSingle();

        if (programError) throw programError;
        if (!programData) throw new Error("Program not found");

        // 3️⃣ Get all enrollments for this student
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from("enrollments")
            .select("id, total_amount, amount_paid, payment_status")
            .eq("student_id", student.id);

        if (enrollmentsError) throw enrollmentsError;

        const registeredCourses = enrollments?.length || 0;

        // 4️⃣ Pending documents
        const enrollmentIds = enrollments?.map((e) => e.id) || [];
        const { data: pendingDocsData, error: pendingDocsError } = await supabase
            .from("enrollment_documents")
            .select("id")
            .in("enrollment_id", enrollmentIds)
            .eq("status", "Pending");

        if (pendingDocsError) throw pendingDocsError;
        const pendingDocuments = pendingDocsData?.length || 0;

        // 5️⃣ Upcoming payments
        const upcomingPayments = enrollments?.filter(
            (e) => e.payment_status !== "Paid"
        ).length || 0;

        // 6️⃣ Completed units
        // Assuming each enrollment is linked to a course via enrollments -> courses
        const { data: courseUnitsData, error: courseUnitsError } = await supabase
            .from("courses")
            .select("units")
            .in(
                "year_id",
                [student.program_id] // ⚡ You might need to join via years table if year_id differs
            );

        const completedUnits = courseUnitsData?.reduce((sum, c: any) => sum + (c.units || 0), 0) || 0;

        return {
            currentProgram: programData.program_name,
            yearLevel: student.year_level,
            registeredCourses,
            completedUnits,
            pendingDocuments,
            upcomingPayments,
        } as StudentAnalytics;

    } catch (err: any) {
        handleError(err);
        throw err;
    }
};
