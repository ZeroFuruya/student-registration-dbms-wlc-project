"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/types/supabase";

interface Props {
    registrations: Database["public"]["Tables"]["registrations"]["Row"][];
    onFiltered: (filtered: Database["public"]["Tables"]["registrations"]["Row"][]) => void;
}

export function RegistrationToolbar({ registrations, onFiltered }: Props) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
    const [sortField, setSortField] = useState<"created_at" | "first_name" | "program_id">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const handleFilter = () => {
        let filtered = [...registrations];

        // Search
        if (search.trim() !== "") {
            const s = search.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.first_name.toLowerCase().includes(s) ||
                    r.last_name.toLowerCase().includes(s) ||
                    r.email.toLowerCase().includes(s)
            );
        }

        // Status filter
        if (statusFilter !== "All") {
            filtered = filtered.filter((r) => r.status === statusFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (!aVal || !bVal) return 0;

            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
            }
            if (aVal instanceof Date && bVal instanceof Date) {
                return sortOrder === "asc" ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
            }
            return 0;
        });

        return filtered;
    };

    // Automatically update parent whenever dependencies change
    useEffect(() => {
        onFiltered(handleFilter());
    }, [search, statusFilter, sortField, sortOrder, registrations]);

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
            />

            <div className="flex gap-2 flex-wrap">
                <Select onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                <Select onValueChange={(v) => setSortField(v as any)}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort Field" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_at">Created At</SelectItem>
                        <SelectItem value="first_name">Name</SelectItem>
                        <SelectItem value="program_id">Program</SelectItem>
                    </SelectContent>
                </Select>

                <Select onValueChange={(v) => setSortOrder(v as any)}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    onClick={() => onFiltered(handleFilter())}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    Apply
                </Button>
            </div>
        </div>
    );
}
