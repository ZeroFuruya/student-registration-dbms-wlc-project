// actions/registrations.ts
// client-side wrapper functions for admin UI to call the server endpoints

export async function approveRegistrationApi(id: number, admin_id?: number) {
    const res = await fetch("/api/admin/registrations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, admin_id }),
    });
    const json = await res.json();
    if (!res.ok || json?.error) throw new Error(json?.error || "Unknown error");
    return json;
}

export async function rejectRegistrationApi(id: number, admin_id?: number, remarks?: string) {
    const res = await fetch("/api/admin/registrations/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, admin_id, remarks }),
    });
    const json = await res.json();
    if (!res.ok || json?.error) throw new Error(json?.error || "Unknown error");
    return json;
}
