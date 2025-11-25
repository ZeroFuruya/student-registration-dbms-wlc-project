"use client";

import { approveRegistration, rejectRegistration } from "@/actions/registrations";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { toast } from "sonner";

interface Props {
    registrations: Database["public"]["Tables"]["registrations"]["Row"][];
    isPending: boolean;
}

export function RegistrationsTable({ registrations }: Props) {
    const handleApprove = async (id: number) => {
        try {
            await approveRegistration(id, 1); // admin id
            toast.success("Registration approved!");
            location.reload(); // refresh after action
        } catch (err) {
            console.error(err);
            toast.error("Failed to approve registration.");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await rejectRegistration(id, 1);
            toast.success("Registration rejected!");
            location.reload();
        } catch (err) {
            console.error(err);
            toast.error("Failed to reject registration.");
        }
    };

    return (
        <div className="hidden md:block w-full rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-muted/50 text-foreground/80">
                    <tr>
                        <th className="p-3 border-b border-border text-left">Name</th>
                        <th className="p-3 border-b border-border text-left">Email</th>
                        <th className="p-3 border-b border-border text-left">Contact</th>
                        <th className="p-3 border-b border-border text-left">Program</th>
                        <th className="p-3 border-b border-border text-left">Year</th>
                        <th className="p-3 border-b border-border text-left">Returning</th>
                        <th className="p-3 border-b border-border text-left">Address</th>
                        <th className="p-3 border-b border-border text-left">Created</th>
                        <th className="p-3 border-b border-border text-left">Status</th>
                        <th className="p-3 border-b border-border text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                            <td className="p-3">{reg.first_name} {reg.last_name}</td>
                            <td className="p-3">{reg.email}</td>
                            <td className="p-3">{reg.contact_number ?? "—"}</td>
                            <td className="p-3">{reg.program_id}</td>
                            <td className="p-3">{reg.year_level}</td>
                            <td className="p-3">{reg.is_returning_student ? "Yes" : "No"}</td>
                            <td className="p-3 max-w-[200px] truncate">{reg.address ?? "—"}</td>
                            <td className="p-3">{reg.created_at ? new Date(reg.created_at).toLocaleString() : "—"}</td>
                            <td className="p-3 font-medium">{reg.status}</td>
                            <td className="p-3 text-center space-x-2">
                                {reg.status === "Pending" && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-green-600 text-white hover:bg-green-700"
                                            onClick={() => handleApprove(reg.id)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-red-600 text-white hover:bg-red-700"
                                            onClick={() => handleReject(reg.id)}
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}