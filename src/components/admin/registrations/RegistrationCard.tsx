"use client";

import { approveRegistration, rejectRegistration } from "@/actions/registrations";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { toast } from "sonner";

interface Props {
    registrations: Database["public"]["Tables"]["registrations"]["Row"][];
    isPending: boolean;
}

export function RegistrationCard({ registrations }: Props) {
    const handleApprove = async (id: number) => {
        try {
            await approveRegistration(id, 1);
            toast.success("Registration approved!");
            location.reload();
        } catch {
            toast.error("Failed to approve registration.");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await rejectRegistration(id, 1);
            toast.success("Registration rejected!");
            location.reload();
        } catch {
            toast.error("Failed to reject registration.");
        }
    };

    return (
        <div className="md:hidden space-y-4">
            {registrations.map((reg) => (
                <div key={reg.id} className="border border-border rounded-lg p-4 bg-card shadow-sm">
                    <div className="text-lg font-semibold">{reg.first_name} {reg.last_name}</div>
                    <div className="text-sm text-foreground/70">{reg.email}</div>
                    <div className="mt-2 text-sm space-y-1">
                        <div><strong>Contact:</strong> {reg.contact_number ?? "—"}</div>
                        <div><strong>Program:</strong> {reg.program_id}</div>
                        <div><strong>Year:</strong> {reg.year_level}</div>
                        <div><strong>Returning:</strong> {reg.is_returning_student ? "Yes" : "No"}</div>
                        <div className="truncate"><strong>Address:</strong> {reg.address ?? "—"}</div>
                        <div><strong>Created:</strong> {reg.created_at ? new Date(reg.created_at).toLocaleString() : "—"}</div>
                        <div><strong>Status:</strong> {reg.status}</div>
                    </div>

                    {reg.status === "Pending" && (
                        <div className="mt-4 flex flex-col gap-2">
                            <Button size="sm" variant="outline" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleApprove(reg.id)}>
                                Approve
                            </Button>
                            <Button size="sm" variant="outline" className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleReject(reg.id)}>
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
