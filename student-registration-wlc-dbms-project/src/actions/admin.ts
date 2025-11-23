"use server";

import { createClient } from "@/auth/server";

export async function getAnalyticsData() {
    const supabase = await createClient();

    // Total students
    const { count: totalStudents } = await supabase
        .from("students")
        .select("id", { count: "exact" });

    // Registrations by status
    const { data: allRegistrations } = await supabase
        .from("registrations")
        .select("status, created_at");

    const pendingRegistrations = allRegistrations?.filter(r => r.status === "Pending").length || 0;
    const approvedRegistrations = allRegistrations?.filter(r => r.status === "Approved").length || 0;
    const rejectedRegistrations = allRegistrations?.filter(r => r.status === "Rejected").length || 0;

    // Programs and Courses count
    const { count: programsCount } = await supabase
        .from("programs")
        .select("id", { count: "exact" });

    const { count: coursesCount } = await supabase
        .from("courses")
        .select("course_id", { count: "exact" });

    // Enrollments by status
    const { data: enrollments } = await supabase
        .from("enrollments")
        .select("enrollment_status, payment_status, total_amount, amount_paid, created_at");

    const draftEnrollments = enrollments?.filter(e => e.enrollment_status === "Draft").length || 0;
    const forReviewEnrollments = enrollments?.filter(e => e.enrollment_status === "For Review").length || 0;
    const approvedEnrollments = enrollments?.filter(e => e.enrollment_status === "Approved").length || 0;
    const rejectedEnrollments = enrollments?.filter(e => e.enrollment_status === "Rejected").length || 0;

    // Payment statistics
    const totalRevenue = enrollments?.reduce((sum, e) => sum + Number(e.amount_paid || 0), 0) || 0;
    const expectedRevenue = enrollments?.reduce((sum, e) => sum + Number(e.total_amount || 0), 0) || 0;
    const pendingRevenue = expectedRevenue - totalRevenue;

    const paidEnrollments = enrollments?.filter(e => e.payment_status === "Paid").length || 0;
    const partialEnrollments = enrollments?.filter(e => e.payment_status === "Partial").length || 0;
    const unpaidEnrollments = enrollments?.filter(e => e.payment_status === "Unpaid").length || 0;

    // Students by program
    const { data: studentsByProgram } = await supabase
        .from("students")
        .select(`
            program_id,
            programs (program_name)
        `);

    const programDistribution = studentsByProgram?.reduce((acc: any, student: any) => {
        const programName = student.programs?.program_name || "Unknown";
        acc[programName] = (acc[programName] || 0) + 1;
        return acc;
    }, {}) || {};

    // Students by year level
    const { data: studentsByYear } = await supabase
        .from("students")
        .select("year_level");

    const yearLevelDistribution = studentsByYear?.reduce((acc: any, student: any) => {
        const year = `Year ${student.year_level}`;
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {}) || {};

    // Monthly registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentRegistrations = allRegistrations?.filter(
        r => new Date(r.created_at) >= sixMonthsAgo
    ) || [];

    const monthlyRegistrations = recentRegistrations.reduce((acc: any, reg: any) => {
        const month = new Date(reg.created_at).toLocaleString("default", {
            month: "short",
            year: "numeric"
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    // Monthly enrollment trends (last 6 months)
    const recentEnrollments = enrollments?.filter(
        e => new Date(e.created_at) >= sixMonthsAgo
    ) || [];

    const monthlyEnrollments = recentEnrollments.reduce((acc: any, enr: any) => {
        const month = new Date(enr.created_at).toLocaleString("default", {
            month: "short",
            year: "numeric"
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    return {
        // Original metrics
        totalStudents: totalStudents || 0,
        pendingRegistrations,
        approvedRegistrations,
        rejectedRegistrations,
        programsCount: programsCount || 0,
        coursesCount: coursesCount || 0,
        upcomingEnrollments: draftEnrollments, // keeping for backward compatibility

        // New enrollment metrics
        draftEnrollments,
        forReviewEnrollments,
        approvedEnrollments,
        rejectedEnrollments,

        // Payment metrics
        paidEnrollments,
        partialEnrollments,
        unpaidEnrollments,
        totalRevenue,
        expectedRevenue,
        pendingRevenue,

        // Distribution data
        programDistribution,
        yearLevelDistribution,

        // Trend data
        monthlyRegistrations,
        monthlyEnrollments,
    };
}