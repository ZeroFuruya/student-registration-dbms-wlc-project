"use server";

import { createClient } from "@/auth/server"; // your server-side Supabase client
import { handleError } from "@/lib/utils"; // optional: centralized error handling

export const addRegistration = async (data: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    email: string;
    contact_number?: string;
    address?: string;
    program_id: number;
    year_level: number;
    is_returning_student: boolean;
    created_at: string;
}) => {
    try {
        const supabase = await createClient();
        const { data: result, error } = await supabase
            .from("registrations")
            .insert([data]);

        if (error) throw error;
        return result;
    } catch (err: any) {
        handleError(err); // optional: logs, sentry, etc.
        throw err;
    }
};

export const updateRegistration = async (id: number, updated: Partial<typeof data>) => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("registrations")
        .update(updated)
        .eq("id", id);

    if (error) throw error;
    return data;
};

export const deleteRegistration = async (id: number) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) throw error;
    return data;
};
