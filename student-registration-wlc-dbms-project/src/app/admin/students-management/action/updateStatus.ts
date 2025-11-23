"use server";

import { createClient } from "@/auth/server";

export async function updateStudentStatus(id: string, status: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("registrations")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error(error);
        return { success: false, error };
    }

    return { success: true };
}
