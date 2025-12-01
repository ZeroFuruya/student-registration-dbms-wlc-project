"use server";

import { createClient } from "@/auth/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { handleError } from "@/lib/utils";

export interface EnrollmentData {
    enrollmentId?: number;
    student_id?: number;
    academic_year: string;
    semester: number;
    enrollment_status: string;
    documents_submitted: boolean;
    payment_status: string;
    total_amount: number;
    amount_paid: number;
    enrollment_documents: { id: number; document_type: string; status: string; file_url?: string }[];
}

export const getStudentEnrollments = async (studentId: number) => {
    try {
        const supabase = await createClient();

        const { data: enrollments, error: enrollError } = await supabase
            .from("enrollments")
            .select(`
                id,
                academic_year,
                semester,
                enrollment_status,
                documents_submitted,
                payment_status,
                total_amount,
                amount_paid,
                enrollment_documents (
                    id,
                    document_type,
                    status,
                    file_url
                )
            `)
            .eq("student_id", studentId);

        if (enrollError) throw enrollError;

        return enrollments || [];
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};

export const createEnrollment = async (
    studentId: number,
    data: { academic_year: string; semester: number }
) => {
    try {
        const supabase = await createClient();
        const { data: newEnrollment, error } = await supabase
            .from("enrollments")
            .insert([{ student_id: studentId, ...data }])
            .select()
            .maybeSingle();

        if (error) throw error;
        return newEnrollment;
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};

export const addEnrollmentDocument = async (
    enrollmentId: number,
    documentType: string,
    fileUrl: string
) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("enrollment_documents")
            .insert([{ enrollment_id: enrollmentId, document_type: documentType, file_url: fileUrl }])
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};

export const getAllEnrollments = async () => {
    try {
        const supabase = await createClient();

        const { data: enrollments, error } = await supabase
            .from("enrollments")
            .select(`
                id,
                student_id,
                academic_year,
                semester,
                enrollment_status,
                documents_submitted,
                payment_status,
                total_amount,
                amount_paid,
                enrollment_documents (
                    id,
                    document_type,
                    status,
                    file_url
                )
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return enrollments || [];
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};

export const getAllStudentsWithEnrollmentsSeparate = async () => {
    try {
        const supabase = await createClient();

        // Fetch all enrollments
        const { data: enrollments, error: enrollError } = await supabase
            .from("enrollments")
            .select(`
                id,
                academic_year,
                semester,
                enrollment_status,
                documents_submitted,
                payment_status,
                total_amount,
                amount_paid,
                student_id,
                created_at
            `)
            .order("created_at", { ascending: false });

        if (enrollError) {
            // console.error("Enrollment query error:", enrollError);
            throw enrollError;
        }

        if (!enrollments || enrollments.length === 0) {
            // console.warn("No enrollments found");
            return [];
        }

        // Get unique student IDs
        const studentIds = [...new Set(enrollments.map(e => e.student_id))];

        // console.log("Student IDs to fetch:", studentIds);

        // Fetch students separately
        const { data: students, error: studentsError } = await supabase
            .from("students")
            .select("id, student_number, first_name, last_name, email, program_id, year_level")
            .in("id", studentIds);

        if (studentsError) {
            // console.error("Students query error:", studentsError);
            throw studentsError;
        }

        // console.log("Students fetched:", students);

        // Fetch enrollment documents
        const { data: documents, error: docsError } = await supabase
            .from("enrollment_documents")
            .select("*")
            .in("enrollment_id", enrollments.map(e => e.id));

        // if (docsError) {
        //     console.error("Documents query error:", docsError);
        // }

        // Create a map for quick lookup
        const studentMap = new Map(students?.map(s => [s.id, s]) || []);
        const docsMap = new Map<number, any[]>();

        documents?.forEach(doc => {
            if (!docsMap.has(doc.enrollment_id)) {
                docsMap.set(doc.enrollment_id, []);
            }
            docsMap.get(doc.enrollment_id)?.push(doc);
        });

        // Group enrollments by student
        const grouped: Record<number, any> = {};

        enrollments.forEach((enroll: any) => {
            const student = studentMap.get(enroll.student_id);

            if (!student) {
                // console.warn(`Student ${enroll.student_id} not found for enrollment ${enroll.id}`);
                return;
            }

            const studentId = student.id;

            if (!grouped[studentId]) {
                grouped[studentId] = {
                    ...student,
                    enrollments: []
                };
            }

            grouped[studentId].enrollments.push({
                ...enroll,
                enrollment_documents: docsMap.get(enroll.id) || []
            });
        });

        const result = Object.values(grouped);
        // console.log("Final grouped result:", result.length, "students");

        return result;
    } catch (err: any) {
        // console.error("getAllStudentsWithEnrollmentsSeparate error:", err);
        handleError(err);
        throw err;
    }
};
// Fee configuration - adjust these values as needed
const FEE_CONFIG = {
    pricePerUnit: 1000, // Base price per unit in pesos (900-1200 range)
    miscellaneousFees: 2500, // Registration, library, lab fees, etc.
    programSpecificFees: {
        // Add program_id specific fees if needed
        // Example: 1: 1500, // Program ID 1 has additional 1500 pesos
    } as Record<number, number>
};

export async function updateEnrollmentStatus(enrollmentId: number, status: string) {
    // 1. Update enrollment status
    const { data: enrollment, error: updateError } = await supabaseAdmin
        .from("enrollments")
        .update({ enrollment_status: status })
        .eq("id", enrollmentId)
        .select("id, student_id, academic_year, semester, total_amount, amount_paid")
        .single();

    if (updateError) throw updateError;

    // 2. If not approved, stop here (no balance creation)
    if (status !== "Approved") return enrollment;

    // 3. Fetch student to get program/year info
    const { data: student, error: studentErr } = await supabaseAdmin
        .from("students")
        .select("id, program_id, year_level")
        .eq("id", enrollment.student_id)
        .single();

    if (studentErr || !student) throw studentErr || new Error("Student not found");

    // 4. Get year_id from years table
    const { data: yearData, error: yearErr } = await supabaseAdmin
        .from("years")
        .select("year_id")
        .eq("program_id", student.program_id)
        .eq("year_level", student.year_level)
        .maybeSingle();

    if (yearErr || !yearData) {
        console.warn(`[UpdateEnrollment] No year found for program ${student.program_id}, year ${student.year_level}`);
        // Fallback to miscellaneous fees only
        const { error: fallbackErr } = await supabaseAdmin
            .from("enrollments")
            .update({
                total_amount: FEE_CONFIG.miscellaneousFees,
                amount_paid: 0,
                payment_status: "Unpaid"
            })
            .eq("id", enrollmentId);

        if (fallbackErr) throw fallbackErr;
        return enrollment;
    }

    // 5. Fetch courses for this year and semester
    const { data: courses, error: coursesErr } = await supabaseAdmin
        .from("courses")
        .select("course_id, course_code, course_name, units")
        .eq("year_id", yearData.year_id)
        .eq("semester", enrollment.semester)
        .eq("status", "Active"); // Only include active courses

    if (coursesErr) throw coursesErr;

    // 6. Calculate total units
    const totalUnits = courses?.reduce((sum, c) => sum + Number(c.units), 0) || 0;

    // 7. Calculate tuition fee based on units
    const tuitionFee = totalUnits * FEE_CONFIG.pricePerUnit;

    // 8. Add program-specific fees if configured
    const programFee = FEE_CONFIG.programSpecificFees[student.program_id] || 0;

    // 9. Calculate total amount (tuition + misc + program fees)
    const totalAmount = tuitionFee + FEE_CONFIG.miscellaneousFees + programFee;

    console.log(`[UpdateEnrollment] Enrollment ID: ${enrollmentId}`);
    console.log(`[UpdateEnrollment] Program: ${student.program_id}, Year: ${student.year_level}, Semester: ${enrollment.semester}`);
    console.log(`[UpdateEnrollment] Total Units: ${totalUnits}`);
    console.log(`[UpdateEnrollment] Tuition Fee: ${tuitionFee} pesos (${totalUnits} units × ${FEE_CONFIG.pricePerUnit})`);
    console.log(`[UpdateEnrollment] Miscellaneous Fees: ${FEE_CONFIG.miscellaneousFees} pesos`);
    console.log(`[UpdateEnrollment] Program Fee: ${programFee} pesos`);
    console.log(`[UpdateEnrollment] Total Amount: ${totalAmount} pesos`);

    // 10. Update enrollments with total_amount and reset amount_paid
    const { error: enrollUpdateErr } = await supabaseAdmin
        .from("enrollments")
        .update({
            total_amount: totalAmount,
            amount_paid: 0,
            payment_status: "Unpaid"
        })
        .eq("id", enrollmentId);

    if (enrollUpdateErr) throw enrollUpdateErr;

    // 11. Optional: Create enrollment_courses records if table exists
    if (courses && courses.length > 0) {
        try {
            // Check if enrollment_courses records already exist
            const { data: existingCourses } = await supabaseAdmin
                .from("enrollment_courses")
                .select("id")
                .eq("enrollment_id", enrollmentId)
                .limit(1);

            // Only insert if no records exist
            if (!existingCourses || existingCourses.length === 0) {
                const enrollmentCourses = courses.map(course => ({
                    enrollment_id: enrollmentId,
                    course_id: course.course_id,
                    status: 'Enrolled'
                }));

                const { error: coursesInsertErr } = await supabaseAdmin
                    .from("enrollment_courses")
                    .insert(enrollmentCourses);

                if (coursesInsertErr && coursesInsertErr.code !== '42P01') {
                    console.error("[UpdateEnrollment] Error creating enrollment_courses:", coursesInsertErr);
                }
            }
        } catch (err) {
            console.log("[UpdateEnrollment] enrollment_courses table may not exist, skipping...");
        }
    }

    // 12. Check if a payment record already exists
    const { data: existingPayment, error: paymentCheckError } = await supabaseAdmin
        .from("payments")
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .maybeSingle();

    if (paymentCheckError) throw paymentCheckError;

    if (existingPayment) {
        console.log(`[UpdateEnrollment] Payment record already exists for enrollment ${enrollmentId}`);
        return enrollment;
    }

    // 13. Create payment record with the calculated total amount
    const { error: payError } = await supabaseAdmin
        .from("payments")
        .insert({
            enrollment_id: enrollmentId,
            amount: totalAmount,
            payment_method: "Pending",
            payment_date: new Date().toISOString()
        });

    if (payError) throw payError;

    console.log(`[UpdateEnrollment] Created payment record for ${totalAmount} pesos`);

    return enrollment;
}