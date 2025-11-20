'use client';

import type { Database } from '@/types/supabase';
import { useTransition } from 'react';
import { approveRegistration, rejectRegistration } from './actions';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
    registrations: Database['public']['Tables']['registrations']['Row'][];
}

export default function RegistrationsTable({ registrations }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = (id: number) => {
        startTransition(async () => {
            try {
                await approveRegistration(id, 1);
                location.reload();
            } catch (err) {
                console.error(err);
            }
        });
    };

    const handleReject = (id: number) => {
        startTransition(async () => {
            try {
                await rejectRegistration(id, 1);
                location.reload();
            } catch (err) {
                console.error(err);
            }
        });
    };

    return (
        <div className="w-full mt-6">
            <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-muted/50 text-foreground/80">
                            <th className="p-3 border-b text-left">Name</th>
                            <th className="p-3 border-b text-left">Email</th>
                            <th className="p-3 border-b text-left">Contact</th>
                            <th className="p-3 border-b text-left">Program</th>
                            <th className="p-3 border-b text-left">Year</th>
                            <th className="p-3 border-b text-left">Returning</th>
                            <th className="p-3 border-b text-left">Address</th>
                            <th className="p-3 border-b text-left whitespace-nowrap">Created At</th>
                            <th className="p-3 border-b text-left">Status</th>
                            <th className="p-3 border-b text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {registrations.map((reg) => (
                            <tr
                                key={reg.id}
                                className="hover:bg-muted/30 transition-colors border-b border-border/40"
                            >
                                <td className="p-3 font-medium">
                                    {reg.first_name} {reg.last_name}
                                </td>

                                <td className="p-3">{reg.email}</td>
                                <td className="p-3">{reg.contact_number ?? "—"}</td>
                                <td className="p-3">{reg.program_id}</td>
                                <td className="p-3">{reg.year_level}</td>

                                <td className="p-3">
                                    {reg.is_returning_student ? (
                                        <Badge variant="secondary">Yes</Badge>
                                    ) : (
                                        <Badge variant="outline">No</Badge>
                                    )}
                                </td>

                                <td className="p-3 max-w-[220px] truncate">{reg.address ?? "—"}</td>

                                <td className="p-3 text-foreground/70">
                                    {reg.created_at
                                        ? new Date(reg.created_at).toLocaleString()
                                        : "—"}
                                </td>

                                <td className="p-3">
                                    {reg.status === "Pending" && (
                                        <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
                                            Pending
                                        </Badge>
                                    )}

                                    {reg.status === "Approved" && (
                                        <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">
                                            Approved
                                        </Badge>
                                    )}

                                    {reg.status === "Rejected" && (
                                        <Badge className="bg-red-500/20 text-red-700 dark:text-red-300">
                                            Rejected
                                        </Badge>
                                    )}
                                </td>

                                <td className="p-3 text-center">
                                    {reg.status === "Pending" && (
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleApprove(reg.id)}
                                                disabled={isPending}
                                            >
                                                Approve
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleReject(reg.id)}
                                                disabled={isPending}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
