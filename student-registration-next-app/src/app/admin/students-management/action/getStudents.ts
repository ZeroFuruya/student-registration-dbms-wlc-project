"use server"

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";

export async function getApprovedStudents() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("students")
        .select(`
            id,
            student_number,
            first_name,
            last_name,
            email,
            program_id,
            year_level,
            status,
            created_at,
            enrollments(enrollment_status),
            programs(program_name)
        `).eq("enrollments.enrollment_status", "Approved")
        .order("created_at", { ascending: false });;

    if (error) {
        console.error("Fetch error:", error);
        return { error: "Failed to fetch students" };
    }

    return { students: data };
}
