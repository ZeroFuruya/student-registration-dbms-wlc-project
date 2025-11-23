import { createClient, getUser } from "@/auth/server";
import EnrollmentManagement from "./EnrollmentsManagement";

export default async function EnrollmentManagementPage() {
    const user = await getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Access Denied: You must log in.</div>;
    }

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : [];

    if (!adminEmails.includes(user.email)) {
        return <div className="p-8 text-red-500">Access Denied: You are not an admin.</div>;
    }

    const supabase = await createClient();

    // Debug: Check what data exists
    const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select("*")
        .limit(5);

    const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .limit(5);

    // Try to get students for the specific enrollment student_ids
    const studentIds = enrollments?.map(e => e.student_id) || [];
    const { data: specificStudents, error: specificError } = await supabase
        .from("students")
        .select("*")
        .in("id", studentIds);

    console.log("Debug - Enrollments:", enrollments);
    console.log("Debug - Enrollments Error:", enrollError);
    console.log("Debug - All Students:", students);
    console.log("Debug - Students Error:", studentsError);
    console.log("Debug - Student IDs from enrollments:", studentIds);
    console.log("Debug - Specific Students:", specificStudents);
    console.log("Debug - Specific Students Error:", specificError);

    // Show debug info
    if (!students || students.length === 0) {
        return (
            <div className="p-6 space-y-4">
                <h1 className="text-xl font-bold text-red-600">⚠️ Students Table Issue Detected</h1>
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                    <p className="font-bold mb-2">Problem:</p>
                    <p><strong>Enrollments found:</strong> {enrollments?.length || 0}</p>
                    <p><strong>Students found:</strong> {students?.length || 0}</p>
                    <p className="text-red-600 mt-2">
                        The students table is empty or RLS policies are blocking access!
                    </p>
                    {studentsError && (
                        <p className="text-red-600 mt-2">
                            <strong>Error:</strong> {studentsError.message}
                        </p>
                    )}
                    {specificError && (
                        <p className="text-red-600 mt-2">
                            <strong>Join Error:</strong> {specificError.message}
                        </p>
                    )}

                    <div className="mt-4 p-4 bg-white rounded">
                        <p className="font-bold mb-2">Solutions:</p>
                        <ol className="list-decimal ml-6 space-y-2">
                            <li>
                                <strong>Check if students exist:</strong>
                                <pre className="bg-gray-100 p-2 mt-1 text-xs rounded overflow-x-auto">
                                    SELECT * FROM students WHERE id IN ({studentIds.join(', ') || 'N/A'});
                                </pre>
                            </li>
                            <li>
                                <strong>Check RLS policies on students table:</strong>
                                <pre className="bg-gray-100 p-2 mt-1 text-xs rounded overflow-x-auto">
                                    SELECT * FROM pg_policies WHERE tablename = 'students';
                                </pre>
                            </li>
                            <li>
                                <strong>Temporarily disable RLS (for testing):</strong>
                                <pre className="bg-gray-100 p-2 mt-1 text-xs rounded overflow-x-auto">
                                    ALTER TABLE students DISABLE ROW LEVEL SECURITY;
                                </pre>
                            </li>
                            <li>
                                <strong>Or add policy for admins:</strong>
                                <pre className="bg-gray-100 p-2 mt-1 text-xs rounded overflow-x-auto">
                                    {`CREATE POLICY "Admins can view students"
ON students FOR SELECT
USING (true);`}
                                </pre>
                            </li>
                        </ol>
                    </div>
                </div>
                <EnrollmentManagement />
            </div>
        );
    }

    return (
        <div className="p-6">
            <EnrollmentManagement />
        </div>
    );
}