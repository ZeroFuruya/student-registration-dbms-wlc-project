"use server";

import { createClient } from "@/auth/server";
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

export const updateEnrollmentStatus = async (enrollmentId: number, status: string) => {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("enrollments")
            .update({ enrollment_status: status })
            .eq("id", enrollmentId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};