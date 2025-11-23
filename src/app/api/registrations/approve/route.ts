// src/app/api/registrations/approve/route.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendCredentialsEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { regId, adminId } = await req.json();

        // 1. Fetch registration
        const { data: reg, error: regErr } = await supabaseAdmin
            .from("registrations")
            .select("*")
            .eq("id", regId)
            .single();

        if (regErr || !reg) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }

        if (reg.status !== "Pending") {
            return NextResponse.json({ error: "Already processed" }, { status: 400 });
        }

        // 2. Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-10);

        // 3. Create or fetch Supabase Auth user
        let authUserId: string;

        try {
            // Try creating a new user
            const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
                email: reg.email,
                password: tempPassword,
                email_confirm: true,
            });

            if (!createErr) {
                authUserId = newUser.user.id;
            } else if (createErr.code === 'email_exists') {
                console.log("[ApproveRegistration] Auth user exists, fetching by listUsers...");

                // Supabase Admin API: list all users and filter by email
                const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();

                if (listErr) {
                    console.error("[ApproveRegistration] listUsers error:", listErr);
                    throw listErr;
                }

                // Log the raw returned object to understand structure
                console.log("[ApproveRegistration] listUsers returned:", listData);

                // Extract the users array
                const users = listData.users;

                // Log summary info about the users array
                console.log(`[ApproveRegistration] Total users fetched: ${users.length}`);

                // Try to find the existing user
                const existingUser = users.find((u: any) => u.email === reg.email);

                if (!existingUser) {
                    console.warn(`[ApproveRegistration] No existing auth user found for email: ${reg.email}`);
                    throw new Error("Existing auth user not found");
                }

                // Log important details of the existing user
                console.log("[ApproveRegistration] Existing user found:", {
                    id: existingUser.id,
                    email: existingUser.email,
                    created_at: existingUser.created_at,
                    last_sign_in_at: existingUser.last_sign_in_at,
                });

                // Assign the auth user ID
                authUserId = existingUser.id;

                // Reset password for existing user (log before and after for debugging)
                console.log(`[ApproveRegistration] Resetting password for user ID: ${authUserId}`);
                await supabaseAdmin.auth.admin.updateUserById(authUserId, {
                    password: tempPassword,
                });
                console.log(`[ApproveRegistration] Password reset completed for user ID: ${authUserId}`);

            } else {
                throw createErr;
            }
        } catch (err: any) {
            console.error("AUTH CREATE/FETCH ERROR:", err);
            return NextResponse.json(
                { error: "Failed to create or fetch auth user" },
                { status: 500 }
            );
        }



        // 4. Insert student if not exists
        const { data: existingStudent } = await supabaseAdmin
            .from("students")
            .select("*")
            .eq("email", reg.email)
            .single();

        if (!existingStudent) {
            const { error: insertErr } = await supabaseAdmin.from("students").insert({
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

            if (insertErr) {
                console.error("STUDENT INSERT ERROR:", insertErr);
                return NextResponse.json({ error: insertErr.message }, { status: 500 });
            }
        } else {
            console.log("[ApproveRegistration] Student already exists, skipping insert.");
        }

        // 5. Update registration status
        const { error: updateErr } = await supabaseAdmin
            .from("registrations")
            .update({ status: "Approved", reviewed_by: adminId, reviewed_at: new Date() })
            .eq("id", reg.id);

        if (updateErr) {
            console.error("REGISTRATION UPDATE ERROR:", updateErr);
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }

        // 6. Send credentials email (do not fail approval if it fails)
        try {
            await sendCredentialsEmail(
                reg.email,
                tempPassword,
                `${reg.first_name} ${reg.last_name}`
            );
        } catch (emailErr) {
            console.error("EMAIL SEND ERROR:", emailErr);
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("API ROUTE ERROR:", err);
        return NextResponse.json(
            { error: err?.message || err?.error_description || "Server error" },
            { status: 500 }
        );
    }
}
