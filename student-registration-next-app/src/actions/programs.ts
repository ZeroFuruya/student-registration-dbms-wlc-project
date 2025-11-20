"use server";

import { createClient } from "@/auth/server";

export async function addProgram(data) {
    const supabase = await createClient();
    const { error } = await supabase.from("programs").insert(data);
    if (error) throw error;
}

export async function updateProgram(id, data) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("programs")
        .update(data)
        .eq("id", id);
    if (error) throw error;
}

export const deleteProgram = async (id: number) => {
    const supabase = await createClient();

    // Check if program is referenced in other tables
    const { data: ref1 } = await supabase
        .from("students")
        .select("id")
        .eq("program_id", id)
        .limit(1);

    const { data: ref2 } = await supabase
        .from("registrations")
        .select("id")
        .eq("program_id", id)
        .limit(1);

    if (ref1?.length || ref2?.length) {
        throw new Error("Program is in use and cannot be deleted");
    }

    // Safe to delete
    const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);

    return true;
};