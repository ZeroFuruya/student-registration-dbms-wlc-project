"use server";

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";

/**
 * Types
 */
export interface EnrollmentForPayment {
    id: number;
    academic_year: string;
    semester: number;
    total_amount: number;
    amount_paid: number;
    payment_status: string;
}

export interface PaymentRecord {
    id: number;
    enrollment_id: number;
    amount: number;
    payment_method: string;
    reference_number?: string | null;
    payment_date: string;
    created_at: string;
}

/**
 * Get enrollments for a student (used to choose where to pay)
 */
export const getStudentEnrollmentsForPayments = async (studentId: number) => {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("enrollments")
            .select("id, academic_year, semester, total_amount, amount_paid, payment_status")
            .eq("student_id", studentId);

        if (error) throw error;

        return (data || []) as EnrollmentForPayment[];
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};

/**
 * Get payments for a student's enrollments (history)
 */
export const getStudentPayments = async (studentId: number) => {
    try {
        const supabase = await createClient();

        // Fetch payments joined to enrollments for that student
        const { data, error } = await supabase
            .from("payments")
            .select(`
        id,
        enrollment_id,
        amount,
        payment_method,
        reference_number,
        payment_date,
        created_at,
        enrollments!inner (student_id)
      `)
            .eq("enrollments.student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Remove the inner enrollments wrapper from results if present
        const payments = (data || []).map((p: any) => {
            // ensure shape matches PaymentRecord
            return {
                id: p.id,
                enrollment_id: p.enrollment_id,
                amount: Number(p.amount),
                payment_method: p.payment_method,
                reference_number: p.reference_number,
                payment_date: p.payment_date,
                created_at: p.created_at,
            } as PaymentRecord;
        });

        return payments;
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};

/**
 * Create a simulated payment for an enrollment.
 * Inserts into payments, then updates enrollments.amount_paid and payment_status.
 */
export const createPayment = async (
    enrollmentId: number,
    amount: number,
    paymentMethod: string,
    referenceNumber?: string | null
) => {
    try {
        if (!enrollmentId) throw new Error("Missing enrollmentId");
        if (!amount || amount <= 0) throw new Error("Amount must be greater than 0");

        const supabase = await createClient();

        // 1) insert payment
        const { data: paymentInsert, error: paymentError } = await supabase
            .from("payments")
            .insert([
                {
                    enrollment_id: enrollmentId,
                    amount,
                    payment_method: paymentMethod,
                    reference_number: referenceNumber || null,
                    payment_date: new Date().toISOString(),
                },
            ])
            .select()
            .maybeSingle();

        if (paymentError) throw paymentError;
        if (!paymentInsert) throw new Error("Failed to create payment");

        // 2) Recalculate enrollment's amount_paid and payment_status
        // Get current enrollment totals
        const { data: enrollmentData, error: enrollmentError } = await supabase
            .from("enrollments")
            .select("id, total_amount, amount_paid")
            .eq("id", enrollmentId)
            .maybeSingle();

        if (enrollmentError) throw enrollmentError;
        if (!enrollmentData) throw new Error("Enrollment not found");

        const prevPaid = Number(enrollmentData.amount_paid || 0);
        const totalAmount = Number(enrollmentData.total_amount || 0);
        const newPaid = prevPaid + Number(amount);

        // Determine new payment_status
        let newStatus = "Unpaid";
        if (newPaid >= totalAmount && totalAmount > 0) {
            newStatus = "Paid";
        } else if (newPaid > 0) {
            newStatus = "Partial";
        } else {
            newStatus = "Unpaid";
        }

        // Update enrollment
        const { error: updateError } = await supabase
            .from("enrollments")
            .update({ amount_paid: newPaid, payment_status: newStatus })
            .eq("id", enrollmentId);

        if (updateError) throw updateError;

        // return payment record (normalized)
        const record: PaymentRecord = {
            id: paymentInsert.id,
            enrollment_id: paymentInsert.enrollment_id,
            amount: Number(paymentInsert.amount),
            payment_method: paymentInsert.payment_method,
            reference_number: paymentInsert.reference_number,
            payment_date: paymentInsert.payment_date,
            created_at: paymentInsert.created_at,
        };

        return record;
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};
