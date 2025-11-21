import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
    try {
        const { regId, adminId } = await req.json();

        const { error } = await supabaseAdmin
            .from("registrations")
            .update({ status: "Rejected", rejected_by: adminId })
            .eq("id", regId);

        if (error) throw error;

        return Response.json({ success: true });
    } catch (e) {
        console.error(e);
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}
