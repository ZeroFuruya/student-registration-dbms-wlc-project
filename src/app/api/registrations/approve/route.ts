// src/app/api/registrations/approve/route.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendCredentialsEmail } from "@/lib/email";
import { NextResponse } from "next/server";

// Fee configuration - adjust these values as needed
const FEE_CONFIG = {
    pricePerUnit: 1000, // Base price per unit in pesos (900-1200 range)
    miscellaneousFees: 2500, // Registration, library, lab fees, etc.
    programSpecificFees: {
        // Add program_id specific fees if needed
        // Example: 1: 1500, // Program ID 1 has additional 1500 pesos
    } as Record<number, number>
};

/**
 * Calculate total enrollment fees based on program and courses
 */
async function calculateEnrollmentFees(
    programId: number,
    yearLevel: number,
    semester: number
): Promise<{ totalAmount: number; courses: any[] }> {
    try {
        // 1. Get the year_id for this program and year level
        const { data: yearData, error: yearError } = await supabaseAdmin
            .from("years")
            .select("year_id")
            .eq("program_id", programId)
            .eq("year_level", yearLevel)
            .single();

        if (yearError || !yearData) {
            console.warn(`No year found for program ${programId}, year ${yearLevel}`);
            return {
                totalAmount: FEE_CONFIG.miscellaneousFees,
                courses: []
            };
        }

        // 2. Get all courses for this year and semester
        const { data: courses, error: coursesError } = await supabaseAdmin
            .from("courses")
            .select("course_id, course_code, course_name, units")
            .eq("year_id", yearData.year_id)
            .eq("semester", semester)
            .eq("status", "Active"); // Only count active courses

        if (coursesError) {
            console.error("Error fetching courses:", coursesError);
            return {
                totalAmount: FEE_CONFIG.miscellaneousFees,
                courses: []
            };
        }

        // 3. Calculate total units
        const totalUnits = courses?.reduce((sum, course) => sum + (course.units || 0), 0) || 0;

        // 4. Calculate tuition based on units
        const tuitionFee = totalUnits * FEE_CONFIG.pricePerUnit;

        // 5. Add program-specific fees if configured
        const programFee = FEE_CONFIG.programSpecificFees[programId] || 0;

        // 6. Calculate total
        const totalAmount = tuitionFee + FEE_CONFIG.miscellaneousFees + programFee;

        console.log(`[BalanceCalculation] Program: ${programId}, Year: ${yearLevel}, Semester: ${semester}`);
        console.log(`[BalanceCalculation] Total Units: ${totalUnits}, Tuition: ${tuitionFee}, Misc: ${FEE_CONFIG.miscellaneousFees}, Program Fee: ${programFee}`);
        console.log(`[BalanceCalculation] Total Amount: ${totalAmount} pesos`);

        return { totalAmount, courses: courses || [] };
    } catch (error) {
        console.error("Error calculating enrollment fees:", error);
        return {
            totalAmount: FEE_CONFIG.miscellaneousFees,
            courses: []
        };
    }
}

/**
 * Determine current academic year and semester
 */
function getCurrentAcademicPeriod(): { academicYear: string; semester: number } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    // Academic calendar logic:
    // June-December = Semester 1 (e.g., 2024-2025)
    // January-May = Semester 2 (e.g., 2024-2025)
    let semester: number;
    let academicYear: string;

    if (month >= 6) {
        // June onwards = Start of new academic year, Semester 1
        semester = 1;
        academicYear = `${year}-${year + 1}`;
    } else {
        // January-May = Semester 2 of previous academic year
        semester = 2;
        academicYear = `${year - 1}-${year}`;
    }

    return { academicYear, semester };
}

/**
 * Create initial enrollment record for newly approved student
 */
async function createInitialEnrollment(
    studentId: number,
    programId: number,
    yearLevel: number
): Promise<void> {
    try {
        const { academicYear, semester } = getCurrentAcademicPeriod();

        // Check if enrollment already exists
        const { data: existingEnrollment } = await supabaseAdmin
            .from("enrollments")
            .select("id")
            .eq("student_id", studentId)
            .eq("academic_year", academicYear)
            .eq("semester", semester)
            .single();

        if (existingEnrollment) {
            console.log(`[InitialEnrollment] Enrollment already exists for student ${studentId}`);
            return;
        }

        // Calculate fees and get courses
        const { totalAmount, courses } = await calculateEnrollmentFees(programId, yearLevel, semester);

        // Create enrollment record
        const { data: newEnrollment, error: enrollmentError } = await supabaseAdmin
            .from("enrollments")
            .insert({
                student_id: studentId,
                academic_year: academicYear,
                semester: semester,
                enrollment_status: "Draft",
                documents_submitted: false,
                payment_status: "Unpaid",
                total_amount: totalAmount,
                amount_paid: 0,
            })
            .select()
            .single();

        if (enrollmentError) {
            console.error("Error creating initial enrollment:", enrollmentError);
            throw enrollmentError;
        }

        console.log(`[InitialEnrollment] Created enrollment ID ${newEnrollment.id} for student ${studentId}`);
        console.log(`[InitialEnrollment] Total Amount: ${totalAmount} pesos (${courses.length} courses)`);

        // Optional: Create enrollment_courses records if you have that table
        // This tracks which specific courses are enrolled
        if (courses.length > 0) {
            try {
                const enrollmentCourses = courses.map(course => ({
                    enrollment_id: newEnrollment.id,
                    course_id: course.course_id,
                    status: 'Enrolled'
                }));

                const { error: coursesError } = await supabaseAdmin
                    .from("enrollment_courses")
                    .insert(enrollmentCourses);

                if (coursesError && coursesError.code !== '42P01') { // Ignore if table doesn't exist
                    console.error("Error creating enrollment_courses:", coursesError);
                }
            } catch (err) {
                console.log("[InitialEnrollment] enrollment_courses table may not exist, skipping...");
            }
        }

    } catch (error) {
        console.error("Failed to create initial enrollment:", error);
        // Don't throw - we don't want to fail the entire approval process
    }
}

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

                const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();

                if (listErr) {
                    console.error("[ApproveRegistration] listUsers error:", listErr);
                    throw listErr;
                }

                const users = listData.users;
                const existingUser = users.find((u: any) => u.email === reg.email);

                if (!existingUser) {
                    console.warn(`[ApproveRegistration] No existing auth user found for email: ${reg.email}`);
                    throw new Error("Existing auth user not found");
                }

                authUserId = existingUser.id;

                console.log(`[ApproveRegistration] Resetting password for user ID: ${authUserId}`);
                await supabaseAdmin.auth.admin.updateUserById(authUserId, {
                    password: tempPassword,
                });
                console.log(`[ApproveRegistration] Password reset completed`);

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
        let studentId: number;
        const { data: existingStudent } = await supabaseAdmin
            .from("students")
            .select("id, email")
            .eq("email", reg.email)
            .single();

        if (!existingStudent) {
            const { data: newStudent, error: insertErr } = await supabaseAdmin
                .from("students")
                .insert({
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
                })
                .select()
                .single();

            if (insertErr) {
                console.error("STUDENT INSERT ERROR:", insertErr);
                return NextResponse.json({ error: insertErr.message }, { status: 500 });
            }

            studentId = newStudent.id;
            console.log(`[ApproveRegistration] Created new student with ID: ${studentId}`);

            // Create initial enrollment with calculated fees
            await createInitialEnrollment(studentId, reg.program_id, reg.year_level);
        } else {
            console.log("[ApproveRegistration] Student already exists, skipping insert.");
            studentId = existingStudent.id;
        }

        // 5. Update registration status
        const { error: updateErr } = await supabaseAdmin
            .from("registrations")
            .update({
                status: "Approved",
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString()
            })
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

        return NextResponse.json({
            success: true,
            message: "Registration approved and initial enrollment created"
        });
    } catch (err: any) {
        console.error("API ROUTE ERROR:", err);
        return NextResponse.json(
            { error: err?.message || err?.error_description || "Server error" },
            { status: 500 }
        );
    }
}