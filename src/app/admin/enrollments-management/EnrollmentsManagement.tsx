"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getAllStudentsWithEnrollmentsSeparate, updateEnrollmentStatus, createEnrollment } from "@/actions/enrollment";

export default function EnrollmentManagement() {
    const [students, setStudents] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
    const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newEnrollment, setNewEnrollment] = useState({
        student_id: "",
        academic_year: "",
        semester: "1",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAllStudentsWithEnrollmentsSeparate();
            console.log("Fetched data:", data);
            setStudents(data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to fetch enrollments: " + (err?.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (id: number) => {
        setExpandedStudentId(expandedStudentId === id ? null : id);
    };

    const handleStatusChange = async (enrollmentId: number, status: string) => {
        setLoadingStates(prev => ({ ...prev, [enrollmentId]: true }));

        try {
            await updateEnrollmentStatus(enrollmentId, status);
            setStudents(prev =>
                prev.map(student => ({
                    ...student,
                    enrollments: student.enrollments.map((e: any) =>
                        e.id === enrollmentId ? { ...e, enrollment_status: status } : e
                    )
                }))
            );
            toast.success("Status updated");
        } catch (err: any) {
            toast.error(err.message || "Failed to update status");
        } finally {
            setLoadingStates(prev => ({ ...prev, [enrollmentId]: false }));
        }
    };

    const handleCreateEnrollment = async () => {
        if (!newEnrollment.student_id || !newEnrollment.academic_year) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            await createEnrollment(
                parseInt(newEnrollment.student_id),
                {
                    academic_year: newEnrollment.academic_year,
                    semester: parseInt(newEnrollment.semester)
                }
            );
            toast.success("Enrollment created");
            setNewEnrollment({ student_id: "", academic_year: "", semester: "1" });
            setShowAddForm(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Failed to create enrollment");
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold mb-4">Enrollment Management</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Enrollment Management</h1>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? "Cancel" : "Add New Enrollment"}
                </Button>
            </div>

            {/* Add Enrollment Form */}
            {showAddForm && (
                <Card>
                    <CardHeader>Create New Enrollment</CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 flex-wrap">
                            <Input
                                placeholder="Student ID"
                                value={newEnrollment.student_id}
                                onChange={(e) =>
                                    setNewEnrollment({ ...newEnrollment, student_id: e.target.value })
                                }
                                className="w-48"
                            />
                            <Input
                                placeholder="Academic Year (e.g., 2024-2025)"
                                value={newEnrollment.academic_year}
                                onChange={(e) =>
                                    setNewEnrollment({ ...newEnrollment, academic_year: e.target.value })
                                }
                                className="w-64"
                            />
                            <Select
                                value={newEnrollment.semester}
                                onValueChange={(v) =>
                                    setNewEnrollment({ ...newEnrollment, semester: v })
                                }
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1st Sem</SelectItem>
                                    <SelectItem value="2">2nd Sem</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleCreateEnrollment}>Create</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Students List */}
            {students.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No enrollments found.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Make sure you have:
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                            <li>Created students in the students table</li>
                            <li>Created enrollments for those students</li>
                        </ul>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {students.map(student => (
                        <Card key={student.id}>
                            <CardHeader
                                onClick={() => toggleStudent(student.id)}
                                className="cursor-pointer hover:bg-muted/50"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">
                                            {student.first_name} {student.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {student.email} • Student #: {student.student_number}
                                        </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {student.enrollments.length} enrollment(s)
                                    </div>
                                </div>
                            </CardHeader>

                            {expandedStudentId === student.id && (
                                <CardContent className="space-y-4 pt-4">
                                    {student.enrollments.length === 0 ? (
                                        <p className="text-muted-foreground">No enrollments yet.</p>
                                    ) : (
                                        student.enrollments.map((e: any) => (
                                            <Card key={e.id} className="border-2">
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">
                                                                {e.academic_year} - Semester {e.semester}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Enrollment ID: {e.id}
                                                            </p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${e.enrollment_status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                e.enrollment_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                    e.enrollment_status === 'For Review' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {e.enrollment_status}
                                                        </span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* Payment Info */}
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-muted-foreground">Payment Status</p>
                                                            <p className="font-medium">{e.payment_status}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Documents</p>
                                                            <p className="font-medium">
                                                                {e.documents_submitted ? "✓ Submitted" : "Not Submitted"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Total Amount</p>
                                                            <p className="font-medium">₱{Number(e.total_amount).toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Amount Paid</p>
                                                            <p className="font-medium">₱{Number(e.amount_paid).toFixed(2)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Status Update Buttons */}
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Update Status:</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {["Draft", "For Review", "Approved", "Rejected"].map(status => (
                                                                <Button
                                                                    key={status}
                                                                    size="sm"
                                                                    variant={e.enrollment_status === status ? "default" : "outline"}
                                                                    onClick={() => handleStatusChange(e.id, status)}
                                                                    disabled={loadingStates[e.id]}
                                                                >
                                                                    {loadingStates[e.id] && e.enrollment_status !== status
                                                                        ? "..."
                                                                        : status}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Documents */}
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Documents:</p>
                                                        {e.enrollment_documents?.length > 0 ? (
                                                            <ul className="space-y-1">
                                                                {e.enrollment_documents.map((doc: any) => (
                                                                    <li key={doc.id} className="flex items-center justify-between text-sm border p-2 rounded">
                                                                        <span>
                                                                            {doc.document_type}
                                                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${doc.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                                                                    doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                                        'bg-yellow-100 text-yellow-800'
                                                                                }`}>
                                                                                {doc.status}
                                                                            </span>
                                                                        </span>
                                                                        {doc.file_url ? (
                                                                            <a
                                                                                href={doc.file_url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-600 hover:underline"
                                                                                onClick={(e) => {
                                                                                    // Optional: Add error handling
                                                                                    fetch(doc.file_url, { method: 'HEAD' })
                                                                                        .catch(() => {
                                                                                            toast.error("File not found or bucket not accessible");
                                                                                        });
                                                                                }}
                                                                            >
                                                                                View
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-gray-400 text-xs">No file</span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}