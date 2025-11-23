"use server"; // ensures server-only

import { createClient } from "@/auth/server";

export async function addProgram(data: any) {
    const supabase = await createClient();
    const { error } = await supabase.from("programs").insert(data);
    if (error) throw error;
}

export async function updateProgram(id: number, data: any) {
    const supabase = await createClient();
    const { error } = await supabase.from("programs").update(data).eq("id", id);
    if (error) throw error;
}

export async function deleteProgram(id: number) {
    const supabase = await createClient();

    const { data: ref1 } = await supabase.from("students").select("id").eq("program_id", id).limit(1);
    const { data: ref2 } = await supabase.from("registrations").select("id").eq("program_id", id).limit(1);

    if (ref1?.length || ref2?.length) {
        throw new Error("Program is in use and cannot be deleted");
    }

    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) throw new Error(error.message);

    return true;
}

export async function getPrograms() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("programs").select("*").order("id", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function getYears() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("years")
        .select("*")
        .order("program_id", { ascending: true })
        .order("year_level", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
}
