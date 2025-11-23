"use client";

import { useEffect, useState, useMemo } from "react";
import { getApprovedStudents } from "./action/getStudents";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsManagement() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState("");
    const [sortField, setSortField] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    // NEW FILTERS
    const [programFilter, setProgramFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        async function load() {
            const res = await getApprovedStudents();
            if (res?.students) setStudents(res.students);
            setLoading(false);
        }
        load();
    }, []);

    const filtered = useMemo(() => {
        const lower = filter.toLowerCase();

        let f = students.filter((s) =>
            `${s.first_name} ${s.last_name} ${s.student_number}`
                .toLowerCase()
                .includes(lower)
        );

        // Program filter
        if (programFilter !== "all") {
            f = f.filter((s) => s.programs?.program_name === programFilter);
        }

        // Year Level filter
        if (yearFilter !== "all") {
            f = f.filter((s) => String(s.year_level) === yearFilter);
        }

        // Status filter
        if (statusFilter !== "all") {
            f = f.filter((s) => s.status === statusFilter);
        }

        return f.sort((a, b) => {
            const A = a[sortField];
            const B = b[sortField];

            if (sortOrder === "asc") return A > B ? 1 : -1;
            return A < B ? 1 : -1;
        });
    }, [students, filter, sortField, sortOrder, programFilter, yearFilter, statusFilter]);

    const SortIcon = () => (sortOrder === "asc" ? "↑" : "↓");

    // Extract unique programs dynamically
    const programOptions = [...new Set(students.map(s => s.programs?.program_name).filter(Boolean))];

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-semibold">Students Management</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">

                {/* Search */}
                <div className="w-64">
                    <Input
                        placeholder="Search students..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                {/* Sort Field */}
                <Select value={sortField} onValueChange={(v) => setSortField(v)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_at">Newest</SelectItem>
                        <SelectItem value="student_number">Student Number</SelectItem>
                        <SelectItem value="last_name">Last Name</SelectItem>
                        <SelectItem value="year_level">Year Level</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Order */}
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v)}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>

                {/* Program Filter */}
                <Select value={programFilter} onValueChange={(v) => setProgramFilter(v)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Program" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programOptions.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Year Level Filter */}
                <Select value={yearFilter} onValueChange={(v) => setYearFilter(v)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Year Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Active</SelectItem>
                        <SelectItem value="pending">Dropped</SelectItem>
                        <SelectItem value="rejected">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                {loading ? (
                    <div className="space-y-3 p-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-background">
                            <TableRow>
                                <TableHead className="w-40">Student #</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-10 text-center">
                                    <SortIcon />
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center p-6 text-muted-foreground"
                                    >
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.student_number}</TableCell>
                                        <TableCell>
                                            {s.last_name}, {s.first_name}
                                        </TableCell>
                                        <TableCell>{s.programs?.program_name ?? "—"}</TableCell>
                                        <TableCell>{s.year_level}</TableCell>
                                        <TableCell>{s.status}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs text-center">
                                            {s[sortField]}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
