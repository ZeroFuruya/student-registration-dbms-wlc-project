"use server";

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";

export interface EnrollmentData {
    enrollmentId?: number;
    academic_year: string;
    semester: number;
    enrollment_status: string;
    documents_submitted: boolean;
    payment_status: string;
    total_amount: number;
    amount_paid: number;
    documents: { id: number; document_type: string; status: string; file_url?: string }[];
}

// Fetch enrollments (can be empty)
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

        // If no enrollments, return empty array
        return enrollments || [];
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};

// Create a new enrollment
export const createEnrollment = async (
    studentId: number,
    data: {
        academic_year: string;
        semester: number;
    }
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