"use server";

import { createClient } from "@/auth/server";

export async function getStudentDashboardData(studentAuthId: string) {
    const supabase = await createClient();

    // 1️⃣ Get student info by auth_user_id
    const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id,first_name,last_name,program_id,year_level")
        .eq("auth_user_id", studentAuthId)
        .maybeSingle();

    if (studentError || !student) throw new Error(studentError?.message || "Student not found");

    // 1b️⃣ Get program name
    const { data: programData, error: programError } = await supabase
        .from("programs")
        .select("program_name")
        .eq("id", student.program_id)
        .maybeSingle();

    if (programError || !programData) throw new Error(programError?.message || "Program not found");

    // 2️⃣ Get all enrollments of student
    const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("id,enrollment_status,total_amount,amount_paid")
        .eq("student_id", student.id);

    if (enrollmentsError) throw new Error(enrollmentsError.message);

    const registeredCourses = enrollments?.length || 0;

    // 3️⃣ Pending documents
    let pendingDocuments = 0;
    if (enrollments?.length) {
        const enrollmentIds = enrollments.map(e => e.id);
        const { data: documentsData, error: documentsError } = await supabase
            .from("enrollment_documents")
            .select("id")
            .in("enrollment_id", enrollmentIds)
            .eq("status", "Pending");

        if (documentsError) throw new Error(documentsError.message);
        pendingDocuments = documentsData?.length || 0;
    }

    // 4️⃣ Upcoming payments
    const upcomingPayments = enrollments?.filter(e => e.total_amount > (e.amount_paid || 0)).length || 0;

    // 5️⃣ Completed units
    let completedUnits = 0;
    const { data: yearsData } = await supabase
        .from("years")
        .select("year_id")
        .eq("program_id", student.program_id);

    if (yearsData?.length) {
        const yearIds = yearsData.map(y => y.year_id);
        const { data: coursesData } = await supabase
            .from("courses")
            .select("units")
            .in("year_id", yearIds);

        completedUnits = coursesData?.reduce((sum, c) => sum + (c.units || 0), 0) || 0;
    }

    return {
        currentProgram: programData.program_name,
        yearLevel: student.year_level,
        registeredCourses,
        completedUnits,
        pendingDocuments,
        upcomingPayments,
    };
}
