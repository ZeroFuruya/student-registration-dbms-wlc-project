'use client';

import type { Database } from '@/types/supabase';
import { useTransition } from 'react';
import { approveRegistration, rejectRegistration } from './actions';

interface Props {
    registrations: Database['public']['Tables']['registrations']['Row'][];
}

export default function RegistrationsTable({ registrations }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = (id: number) => {
        startTransition(async () => {
            try {
                await approveRegistration(id, 1); // Replace 1 with admin ID
                alert('Registration approved!');
                location.reload(); // simple refresh
            } catch (err) {
                console.error(err);
                alert('Error approving registration');
            }
        });
    };

    const handleReject = (id: number) => {
        startTransition(async () => {
            try {
                await rejectRegistration(id, 1);
                alert('Registration rejected!');
                location.reload();
            } catch (err) {
                console.error(err);
                alert('Error rejecting registration');
            }
        });
    };

    return (
        <div className="w-full">
            <div className="hidden md:block w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-muted/50 text-foreground/80">
                            <th className="p-3 border-b border-border text-left">Name</th>
                            <th className="p-3 border-b border-border text-left">Email</th>
                            <th className="p-3 border-b border-border text-left">Contact</th>
                            <th className="p-3 border-b border-border text-left">Program</th>
                            <th className="p-3 border-b border-border text-left">Year</th>
                            <th className="p-3 border-b border-border text-left">Returning</th>
                            <th className="p-3 border-b border-border text-left">Address</th>
                            <th className="p-3 border-b border-border text-left whitespace-nowrap">Created At</th>
                            <th className="p-3 border-b border-border text-left">Status</th>
                            <th className="p-3 border-b border-border text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {registrations.map((reg) => (
                            <tr
                                key={reg.id}
                                className="hover:bg-muted/30 transition-colors border-b border-border/50"
                            >
                                <td className="p-3">{reg.first_name} {reg.last_name}</td>
                                <td className="p-3">{reg.email}</td>
                                <td className="p-3">{reg.contact_number ?? "—"}</td>
                                <td className="p-3">{reg.program_id}</td>
                                <td className="p-3">{reg.year_level}</td>
                                <td className="p-3">
                                    {reg.is_returning_student ? (
                                        <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">Yes</span>
                                    ) : (
                                        <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">No</span>
                                    )}
                                </td>
                                <td className="p-3 max-w-[200px] truncate">{reg.address ?? "—"}</td>
                                <td className="p-3">
                                    {reg.created_at ? new Date(reg.created_at).toLocaleString() : "—"}
                                </td>
                                <td className="p-3 font-medium">
                                    {reg.status === "Pending" && (
                                        <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                                    )}
                                    {reg.status === "Approved" && (
                                        <span className="text-green-600 dark:text-green-400">Approved</span>
                                    )}
                                    {reg.status === "Rejected" && (
                                        <span className="text-red-600 dark:text-red-400">Rejected</span>
                                    )}
                                </td>

                                <td className="p-3 text-center space-x-2">
                                    {reg.status === "Pending" && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(reg.id)}
                                                disabled={isPending}
                                                className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(reg.id)}
                                                disabled={isPending}
                                                className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="hidden md:block w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-muted/50 text-foreground/80">
                            <th className="p-3 border-b border-border text-left">Name</th>
                            <th className="p-3 border-b border-border text-left">Email</th>
                            <th className="p-3 border-b border-border text-left">Contact</th>
                            <th className="p-3 border-b border-border text-left">Program</th>
                            <th className="p-3 border-b border-border text-left">Year</th>
                            <th className="p-3 border-b border-border text-left">Returning</th>
                            <th className="p-3 border-b border-border text-left">Address</th>
                            <th className="p-3 border-b border-border text-left whitespace-nowrap">Created At</th>
                            <th className="p-3 border-b border-border text-left">Status</th>
                            <th className="p-3 border-b border-border text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {registrations.map((reg) => (
                            <tr
                                key={reg.id}
                                className="hover:bg-muted/30 transition-colors border-b border-border/50"
                            >
                                <td className="p-3">{reg.first_name} {reg.last_name}</td>
                                <td className="p-3">{reg.email}</td>
                                <td className="p-3">{reg.contact_number ?? "—"}</td>
                                <td className="p-3">{reg.program_id}</td>
                                <td className="p-3">{reg.year_level}</td>
                                <td className="p-3">
                                    {reg.is_returning_student ? (
                                        <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">Yes</span>
                                    ) : (
                                        <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">No</span>
                                    )}
                                </td>
                                <td className="p-3 max-w-[200px] truncate">{reg.address ?? "—"}</td>
                                <td className="p-3">
                                    {reg.created_at ? new Date(reg.created_at).toLocaleString() : "—"}
                                </td>
                                <td className="p-3 font-medium">
                                    {reg.status === "Pending" && (
                                        <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                                    )}
                                    {reg.status === "Approved" && (
                                        <span className="text-green-600 dark:text-green-400">Approved</span>
                                    )}
                                    {reg.status === "Rejected" && (
                                        <span className="text-red-600 dark:text-red-400">Rejected</span>
                                    )}
                                </td>

                                <td className="p-3 text-center space-x-2">
                                    {reg.status === "Pending" && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(reg.id)}
                                                disabled={isPending}
                                                className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(reg.id)}
                                                disabled={isPending}
                                                className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition"
                                            >
                                                Reject
                                            </button>
                                        </>
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
