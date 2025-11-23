// app/actions/upload.ts
'use server';

import { createClient } from "@/auth/server";

export async function uploadDocumentAction(formData: FormData) {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Not authenticated" };
    }

    const file = formData.get('file') as File;
    const enrollmentId = formData.get('enrollmentId') as string;

    if (!file || !enrollmentId) {
        return { error: "Missing file or enrollment ID" };
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `enrollment/${enrollmentId}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

    if (uploadError) {
        return { error: uploadError.message };
    }

    const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

    return { url: data.publicUrl };
}