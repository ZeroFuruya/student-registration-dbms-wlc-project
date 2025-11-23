"use server"

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";

function generateSchedule(courseId: number) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Deterministic schedule generation
    const dayIndex = courseId % days.length;
    const baseHour = 8 + (courseId % 5); // 8AM–12PM
    const timeStart = `${baseHour}:00`;
    const timeEnd = `${baseHour + 1}:30`;
    const room = `Room ${100 + (courseId % 30)}`;

    return {
        day: days[dayIndex],
        time_start: timeStart,
        time_end: timeEnd,
        room
    };
}

export async function getStudentCourses() {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const { data: student } = await supabase
            .from("students")
            .select("id, year_level, program_id")
            .eq("auth_user_id", user.id)
            .single();

        if (!student) return { error: "Student record not found" };

        const { data: enrollment } = await supabase
            .from("enrollments")
            .select("*")
            .eq("student_id", student.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (!enrollment || enrollment.enrollment_status !== "Approved") {
            return { enrolled: false, courses: [] };
        }

        const { data: courses } = await supabase
            .from("courses")
            .select("*")
            .eq("year_id", student.year_level)
            .eq("semester", enrollment.semester);

        const coursesWithSchedule = (courses ?? []).map(c => ({
            ...c,
            schedule: generateSchedule(c.course_id)
        }));

        return {
            enrolled: true,
            courses: coursesWithSchedule
        };

    } catch (error) {
        return handleError(error);
    }
}
