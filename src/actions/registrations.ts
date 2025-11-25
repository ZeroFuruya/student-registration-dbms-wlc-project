"use server";

import { createClient } from "@/auth/server"; // regular server-side Supabase client
import { handleError } from "@/lib/utils";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // admin client with service_role
import { sendCredentialsEmail } from "@/lib/email";

// === Existing functions (non-admin) ===
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
        handleError(err);
        throw err;
    }
};

export const updateRegistration = async (id: number, updated: any) => {
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

// === Admin functions (use supabaseAdmin) ===
export const approveRegistration = async (regId: number, adminId: number) => {
    try {
        // 1. Fetch registration
        const { data: reg, error: regError } = await supabaseAdmin
            .from("registrations")
            .select("*")
            .eq("id", regId)
            .single();

        if (regError || !reg) throw new Error("Registration not found");
        if (reg.status !== "Pending") throw new Error("Already processed");

        // 2. Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-10);

        // 3. Create or fetch Supabase Auth user
        let authUserId: string;

        try {
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: reg.email,
                password: tempPassword,
                email_confirm: true,
            });

            if (!authError) {
                authUserId = authUser.user.id;
            } else if (authError.code === "email_exists") {
                // fetch existing user
                const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
                if (listErr) throw listErr;

                const existingUser = listData.users.find((u: any) => u.email === reg.email);
                if (!existingUser) throw new Error("Existing auth user not found");
                authUserId = existingUser.id;

                // reset password
                await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: tempPassword });
            } else {
                throw authError;
            }
        } catch (err: any) {
            console.error("AUTH CREATE/FETCH ERROR:", err);
            throw err;
        }

        // 4. Insert student if not exists
        const { data: existingStudent } = await supabaseAdmin
            .from("students")
            .select("*")
            .eq("email", reg.email)
            .single();

        if (!existingStudent) {
            await supabaseAdmin.from("students").insert({
                registration_id: reg.id,
                auth_user_id: authUserId,
                student_number: `STU-${Date.now()}`,
                first_name: reg.first_name,
                last_name: reg.last_name,
                middle_name: reg.middle_name,
                email: reg.email,
                contact_number: reg.contact_number,
                address: reg.address,
                program_id: reg.program_id,
                year_level: reg.year_level,
                is_returning_student: reg.is_returning_student ?? false,
                status: "Active",
            });
        }

        // 5. Update registration status
        await supabaseAdmin
            .from("registrations")
            .update({ status: "Approved", reviewed_by: adminId, reviewed_at: new Date() })
            .eq("id", reg.id);

        // 6. Send credentials email (don't fail approval if it fails)
        try {
            await sendCredentialsEmail(reg.email, tempPassword, `${reg.first_name} ${reg.last_name}`);
        } catch (e) {
            console.error("EMAIL SEND FAILED", e);
        }

        return { success: true };
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};

export const rejectRegistration = async (regId: number, adminId: number) => {
    try {
        const { error } = await supabaseAdmin
            .from("registrations")
            .update({ status: "Rejected", rejected_by: adminId })
            .eq("id", regId);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        handleError(err);
        throw err;
    }
};
