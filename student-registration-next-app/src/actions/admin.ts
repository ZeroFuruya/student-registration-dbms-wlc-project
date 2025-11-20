"use server";

import { createClient } from "@/auth/server";

export async function getAnalyticsData() {
    const supabase = await createClient();

    // Total students
    const { count: totalStudents } = await supabase
        .from("students")
        .select("id", { count: "exact" });

    // Registrations
    const { data: pendingRegs } = await supabase
        .from("registrations")
        .select("*", { count: "exact" })
        .eq("status", "Pending");

    const { data: approvedRegs } = await supabase
        .from("registrations")
        .select("*", { count: "exact" })
        .eq("status", "Approved");

    // Programs count
    const { count: programsCount } = await supabase
        .from("programs")
        .select("id", { count: "exact" });

    // Courses count
    const { count: coursesCount } = await supabase
        .from("courses")
        .select("course_id", { count: "exact" });

    // Upcoming enrollments (Draft)
    const { data: upcomingEnrollments } = await supabase
        .from("enrollments")
        .select("*", { count: "exact" })
        .eq("enrollment_status", "Draft");

    return {
        totalStudents: totalStudents || 0,
        pendingRegistrations: pendingRegs?.length || 0,
        approvedRegistrations: approvedRegs?.length || 0,
        programsCount: programsCount || 0,
        coursesCount: coursesCount || 0,
        upcomingEnrollments: upcomingEnrollments?.length || 0,
    };
}
