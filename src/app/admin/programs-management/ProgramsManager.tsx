"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { addProgram, updateProgram, deleteProgram } from "@/actions/programs.server";

export default function ProgramsManager({ programs }) {
    const [programsState, setProgramsState] = useState(programs);
    const [search, setSearch] = useState("");
    const [mounted, setMounted] = useState(false);

    const [newProgram, setNewProgram] = useState({
        program_code: "",
        program_name: "",
        total_units: "",
        years_to_complete: "",
        status: "Active",
        created_at: "",
    });

    useEffect(() => setMounted(true), []);

    const filtered = programsState.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.program_name.toLowerCase().includes(q) ||
            p.program_code.toLowerCase().includes(q)
        );
    });

    // CREATE
    const handleCreate = async () => {
        if (
            !newProgram.program_code.trim() ||
            !newProgram.program_name.trim() ||
            !newProgram.total_units ||
            !newProgram.years_to_complete
        ) {
            return toast.error("All fields are required.");
        }

        try {
            const created = await addProgram({
                ...newProgram,
                total_units: Number(newProgram.total_units),
                years_to_complete: Number(newProgram.years_to_complete),
                created_at: new Date().toISOString(),
            });

            setProgramsState([...programsState, created]);
            setNewProgram({
                program_code: "",
                program_name: "",
                total_units: "",
                years_to_complete: "",
                status: "Active",
                created_at: "",
            });

            toast.success("Program added successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error creating program");
        }
    };

    // UPDATE
    const handleUpdate = async (id, updated) => {
        try {
            await updateProgram(id, updated);
            setProgramsState((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
            );
            toast.success("Program updated");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating program");
        }
    };

    // DELETE
    const handleDelete = async (id) => {
        if (!confirm("Delete this program?")) return;

        try {
            await deleteProgram(id);
            setProgramsState((prev) => prev.filter((p) => p.id !== id));
            toast.success("Program deleted");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error deleting program");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-xl font-bold">Programs Management</h1>

            {/* SEARCH */}
            <Input
                placeholder="Search programs..."
                className="max-w-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* CREATE FORM */}
            <div className="flex gap-2 flex-wrap items-center">
                <Input
                    placeholder="Program Code"
                    className="w-40"
                    value={newProgram.program_code}
                    onChange={(e) =>
                        setNewProgram({ ...newProgram, program_code: e.target.value })
                    }
                />
                <Input
                    placeholder="Program Name"
                    className="w-60"
                    value={newProgram.program_name}
                    onChange={(e) =>
                        setNewProgram({ ...newProgram, program_name: e.target.value })
                    }
                />
                <Input
                    placeholder="Total Units"
                    type="number"
                    className="w-28"
                    value={newProgram.total_units}
                    onChange={(e) =>
                        setNewProgram({ ...newProgram, total_units: e.target.value })
                    }
                />
                <Input
                    placeholder="Years"
                    type="number"
                    className="w-24"
                    value={newProgram.years_to_complete}
                    onChange={(e) =>
                        setNewProgram({
                            ...newProgram,
                            years_to_complete: e.target.value,
                        })
                    }
                />
                <Select
                    value={newProgram.status}
                    onValueChange={(v) => setNewProgram({ ...newProgram, status: v })}
                >
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Removed">Removed</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleCreate} className="bg-primary text-white hover:bg-primary/90">
                    Add
                </Button>
            </div>

            {/* PROGRAMS TABLE */}
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Years</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell>
                                <Input
                                    value={p.program_code}
                                    onChange={(e) =>
                                        setProgramsState((prev) =>
                                            prev.map((pr) =>
                                                pr.id === p.id ? { ...pr, program_code: e.target.value } : pr
                                            )
                                        )
                                    }
                                    onBlur={() =>
                                        handleUpdate(p.id, { program_code: p.program_code })
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Input
                                    value={p.program_name}
                                    onChange={(e) =>
                                        setProgramsState((prev) =>
                                            prev.map((pr) =>
                                                pr.id === p.id ? { ...pr, program_name: e.target.value } : pr
                                            )
                                        )
                                    }
                                    onBlur={() =>
                                        handleUpdate(p.id, { program_name: p.program_name })
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Input
                                    type="number"
                                    value={p.total_units}
                                    onChange={(e) =>
                                        setProgramsState((prev) =>
                                            prev.map((pr) =>
                                                pr.id === p.id
                                                    ? { ...pr, total_units: Number(e.target.value) }
                                                    : pr
                                            )
                                        )
                                    }
                                    onBlur={() =>
                                        handleUpdate(p.id, { total_units: Number(p.total_units) })
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Input
                                    type="number"
                                    value={p.years_to_complete}
                                    onChange={(e) =>
                                        setProgramsState((prev) =>
                                            prev.map((pr) =>
                                                pr.id === p.id
                                                    ? { ...pr, years_to_complete: Number(e.target.value) }
                                                    : pr
                                            )
                                        )
                                    }
                                    onBlur={() =>
                                        handleUpdate(p.id, {
                                            years_to_complete: Number(p.years_to_complete),
                                        })
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Select
                                    value={p.status || "Active"}
                                    onValueChange={(v) => handleUpdate(p.id, { status: v })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Removed">Removed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>

                            <TableCell>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(p.id)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
