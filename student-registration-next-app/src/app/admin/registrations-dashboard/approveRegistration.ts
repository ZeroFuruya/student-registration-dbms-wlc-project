"use server";

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const approveRegistration = async (registrationId: number, adminId: number) => {
    try {
        const supabase = await createClient();

        // 1. Get the registration record
        const { data: reg, error: regError } = await supabase
            .from("registrations")
            .select("*")
            .eq("id", registrationId)
            .single();

        if (regError) throw regError;
        if (!reg) throw new Error("Registration not found");

        // 2. Generate a strong default password
        const defaultPassword = crypto.randomBytes(8).toString("hex");

        // 3. Create Supabase Auth user
        const { data: authUser, error: authError } =
            await supabase.auth.admin.createUser({
                email: reg.email,
                password: defaultPassword,
                email_confirm: true
            });

        if (authError) throw authError;

        // 4. Create student record
        const studentNumber = `STU-${Date.now()}`;

        const { data: student, error: studError } = await supabase
            .from("students")
            .insert({
                registration_id: reg.id,
                auth_user_id: authUser.user.id,
                student_number: studentNumber,
                first_name: reg.first_name,
                last_name: reg.last_name,
                middle_name: reg.middle_name,
                email: reg.email,
                contact_number: reg.contact_number,
                address: reg.address,
                program_id: reg.program_id,
                year_level: reg.year_level,
                is_returning_student: reg.is_returning_student
            })
            .select()
            .single();

        if (studError) throw studError;

        // 5. Update registration status
        await supabase
            .from("registrations")
            .update({
                status: "Approved",
                reviewed_by: adminId,
                reviewed_at: new Date()
            })
            .eq("id", reg.id);

        // 6. Send credentials email to the user
        await sendCredentialsEmail(reg.email, defaultPassword);

        return student;

    } catch (err) {
        handleError(err);
        throw err;
    }
};
