'use server';

import { createClient } from "@/auth/server";

export async function uploadDocumentAction(formData: FormData) {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Not authenticated", url: null };
    }

    const file = formData.get('file') as File;
    const enrollmentId = formData.get('enrollmentId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !enrollmentId) {
        return { error: "Missing file or enrollment ID", url: null };
    }

    if (!documentType) {
        return { error: "Missing document type", url: null };
    }

    // Optional: Verify the enrollment belongs to this user's student
    const { data: enrollment } = await supabase
        .from("enrollments")
        .select(`
            id,
            students!inner(auth_user_id)
        `)
        .eq("id", enrollmentId)
        .single();

    if (!enrollment || enrollment.students.auth_user_id !== user.id) {
        return { error: "Unauthorized: Enrollment not found or doesn't belong to you", url: null };
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `enrollment/${enrollmentId}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

    if (uploadError) {
        return { error: uploadError.message, url: null };
    }

    const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
}