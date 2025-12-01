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

    const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select(`
        id,
        students:students!inner(auth_user_id)
    `)
        .eq("id", enrollmentId)
        .single();

    if (enrollmentError || !enrollment) {
        return { error: "Enrollment not found", url: null };
    }

    let student = enrollment.students;

    // Normalize: If it's an array, take first. If it's an object, keep it.
    if (Array.isArray(student)) {
        student = student[0];
    }

    if (!student || student.auth_user_id !== user.id) {
        return { error: "Unauthorized: Enrollment doesn't belong to you", url: null };
    }


    const fileExt = file.name.split(".").pop();
    const filePath = `enrollment/${enrollmentId}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: uploadError.message, url: null };
    }

    const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
}