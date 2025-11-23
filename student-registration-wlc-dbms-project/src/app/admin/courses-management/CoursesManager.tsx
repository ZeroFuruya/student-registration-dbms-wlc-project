"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { addCourse, updateCourse, deleteCourse } from "@/actions/courses";

export default function CoursesManager({ programs, years, courses }) {
    const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [list, setList] = useState(courses);
    const [search, setSearch] = useState("");
    const [mounted, setMounted] = useState(false);

    const [newCourse, setNewCourse] = useState({
        course_code: "",
        course_name: "",
        units: "",
        semester: "",
        status: "Active",
    });

    useEffect(() => setMounted(true), []);

    const programYears = selectedProgram
        ? years.filter((y) => y.program_id === selectedProgram)
        : [];

    const filtered = list.filter((c) => {
        if (!selectedYear) return false;
        const q = search.toLowerCase();
        return (
            c.year_id === selectedYear &&
            (c.course_name.toLowerCase().includes(q) ||
                c.course_code.toLowerCase().includes(q))
        );
    });

    // CREATE
    const handleCreate = async () => {
        if (
            !newCourse.course_code.trim() ||
            !newCourse.course_name.trim() ||
            !newCourse.units ||
            !newCourse.semester ||
            !selectedYear
        ) {
            return toast.error("All fields are required.");
        }

        try {
            const created = await addCourse({
                ...newCourse,
                units: Number(newCourse.units),
                semester: Number(newCourse.semester),
                year_id: selectedYear,
                created_at: new Date().toISOString(),
            });

            setList((prev) => [...prev, created]);

            setNewCourse({
                course_code: "",
                course_name: "",
                units: "",
                semester: "",
                status: "Active",
            });

            toast.success("Course added");
        } catch (err) {
            toast.error(err.message || "Error creating course");
        }
    };

    // UPDATE
    const handleUpdate = async (id: number, updated: any) => {
        try {
            const updatedCourse = await updateCourse(id, updated);
            setList((prev) => prev.map((c) => (c.course_id === id ? updatedCourse : c)));
            toast.success("Updated");
        } catch (err) {
            toast.error(err.message || "Error updating");
        }
    };

    // DELETE
    const handleDelete = async (id: number) => {
        if (!confirm("Delete this course?")) return;

        try {
            await deleteCourse(id);
            setList((prev) => prev.filter((c) => c.course_id !== id));
            toast.success("Deleted");
        } catch (err) {
            toast.error(err.message || "Error deleting");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-xl font-bold">Courses Management</h1>

            {/* Program + Year Select + Search */}
            <div className="flex gap-2 flex-wrap items-center">
                <Select onValueChange={(v) => setSelectedProgram(Number(v))}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Program" />
                    </SelectTrigger>
                    <SelectContent>
                        {programs.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.program_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    onValueChange={(v) => setSelectedYear(Number(v))}
                    disabled={!selectedProgram}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {programYears.map((y) => (
                            <SelectItem key={y.year_id} value={y.year_id}>
                                Year {y.year_level}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Input
                    placeholder="Search courses..."
                    className="max-w-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* CREATE FORM */}
            {selectedYear && (
                <div className="flex gap-2 flex-wrap items-center mt-2">
                    <Input
                        placeholder="Course Code"
                        className="w-32"
                        value={newCourse.course_code}
                        onChange={(e) =>
                            setNewCourse({ ...newCourse, course_code: e.target.value })
                        }
                    />
                    <Input
                        placeholder="Course Name"
                        className="w-64"
                        value={newCourse.course_name}
                        onChange={(e) =>
                            setNewCourse({ ...newCourse, course_name: e.target.value })
                        }
                    />
                    <Input
                        placeholder="Units"
                        type="number"
                        className="w-24"
                        value={newCourse.units}
                        onChange={(e) =>
                            setNewCourse({ ...newCourse, units: e.target.value })
                        }
                    />
                    <Input
                        placeholder="Semester"
                        type="number"
                        className="w-24"
                        value={newCourse.semester}
                        onChange={(e) =>
                            setNewCourse({ ...newCourse, semester: e.target.value })
                        }
                    />
                    <Select
                        value={newCourse.status}
                        onValueChange={(v) => setNewCourse({ ...newCourse, status: v })}
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

                    <Button onClick={handleCreate} disabled={!selectedProgram || !selectedYear}>
                        Add
                    </Button>
                </div>
            )}

            {/* COURSES TABLE */}
            <table className="w-full border mt-4">
                <thead>
                    <tr className="border-b bg-muted">
                        <th className="p-2">Code</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Units</th>
                        <th className="p-2">Semester</th>
                        <th className="p-2">Status</th>
                        <th className="p-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((c) => (
                        <tr key={c.course_id} className="border-b">
                            <td className="p-2">
                                <Input
                                    value={c.course_code}
                                    onChange={(e) =>
                                        setList((prev) =>
                                            prev.map((cr) =>
                                                cr.course_id === c.course_id
                                                    ? { ...cr, course_code: e.target.value }
                                                    : cr
                                            )
                                        )
                                    }
                                    onBlur={() =>
                                        handleUpdate(c.course_id, { course_code: c.course_code })
                                    }
                                />
                            </td>
                            <td className="p-2">
                                <Input
                                    value={c.course_name}
                                    onChange={(e) =>
                                        setList((prev) =>
                                            prev.map((cr) =>
                                                cr.course_id === c.course_id
                                                    ? { ...cr, course_name: e.target.value }
                                                    : cr
                                            )
                                        )
                                    }
                                    onBlur={() =>
                                        handleUpdate(c.course_id, { course_name: c.course_name })
                                    }
                                />
                            </td>
                            <td className="p-2">
                                <Input
                                    type="number"
                                    value={c.units}
                                    onChange={(e) =>
                                        setList((prev) =>
                                            prev.map((cr) =>
                                                cr.course_id === c.course_id
                                                    ? { ...cr, units: Number(e.target.value) }
                                                    : cr
                                            )
                                        )
                                    }
                                    onBlur={() =>
                                        handleUpdate(c.course_id, { units: Number(c.units) })
                                    }
                                />
                            </td>
                            <td className="p-2">
                                <Input
                                    type="number"
                                    value={c.semester}
                                    onChange={(e) =>
                                        setList((prev) =>
                                            prev.map((cr) =>
                                                cr.course_id === c.course_id
                                                    ? { ...cr, semester: Number(e.target.value) }
                                                    : cr
                                            )
                                        )
                                    }
                                    onBlur={() =>
                                        handleUpdate(c.course_id, { semester: Number(c.semester) })
                                    }
                                />
                            </td>
                            <td className="p-2">
                                <Select
                                    value={c.status || "Active"}
                                    onValueChange={(v) =>
                                        handleUpdate(c.course_id, { status: v })
                                    }
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
                            </td>
                            <td className="p-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(c.course_id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
