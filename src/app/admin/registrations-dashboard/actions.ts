'use server';
import { createClient } from '@/auth/server';

export async function approveRegistration(regId: number, adminId: number) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/registrations/approve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ regId, adminId }),
        });

        // Parse the response body (even if not OK)
        let data;
        try {
            data = await res.json();
        } catch (jsonErr) {
            data = null;
        }

        if (!res.ok) {
            console.error(
                `[ApproveRegistration] Failed — status: ${res.status}, statusText: ${res.statusText}, body:`,
                data
            );
            throw new Error(
                `Failed to approve registration (status ${res.status}). See console for details.`
            );
        }

        return data;
    } catch (err: any) {
        console.error("[ApproveRegistration] Unexpected error:", err);
        throw err;
    }
}


export async function rejectRegistration(regId: number, adminId: number) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/registrations/reject`, {
        method: "POST",
        body: JSON.stringify({ regId, adminId }),
    });

    if (!res.ok) throw new Error("Failed to reject");
    return await res.json();
}
