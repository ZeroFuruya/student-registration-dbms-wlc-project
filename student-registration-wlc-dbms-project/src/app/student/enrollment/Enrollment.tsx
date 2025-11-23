"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createEnrollment, addEnrollmentDocument } from "@/actions/enrollment";
import { uploadDocumentAction } from "@/actions/upload";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface Props {
    studentId: number;
    initialEnrollments: any[];
}

export default function Enrollment({ studentId, initialEnrollments }: Props) {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState(initialEnrollments);
    const [newForm, setNewForm] = useState({ academic_year: "", semester: 1 });
    const [uploadingStates, setUploadingStates] = useState<Record<number, boolean>>({});

    // Auto-calculate academic year & semester based on current month + deadlines
    useEffect(() => {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const year = today.getFullYear();

        // Deadlines
        const firstSemDeadline = new Date(year, 8, 30); // Sept 30
        const secondSemDeadline = new Date(year + 1, 1, 18); // Feb 18 of next year

        let semester = 1;
        let academicYear = `${year}-${year + 1}`;

        if (month < 8) {
            // Before August: first semester
            semester = 1;
            if (today > firstSemDeadline) {
                semester = 2;
            }
        } else {
            // After August: second semester
            semester = 1; // still 1st semester of next academic year if passed first sem
            if (today > firstSemDeadline) {
                semester = 1; // first sem of next AY
                academicYear = `${year + 1}-${year + 2}`;
            }
        }

        // Adjust if today is after second sem deadline
        if (today > secondSemDeadline) {
            semester = 1;
            academicYear = `${year + 1}-${year + 2}`;
        }

        setNewForm({ academic_year: academicYear, semester });
    }, []);

    const handleAddEnrollment = async () => {
        if (!newForm.academic_year) return alert("Academic year is required.");
        if (![1, 2].includes(newForm.semester)) return alert("Semester must be 1 or 2.");

        try {
            const newEnrollment = await createEnrollment(studentId, newForm);
            setEnrollments([...enrollments, { ...newEnrollment, enrollment_documents: [] }]);
            // Reset form
            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            let academicYear = `${year}-${year + 1}`;
            let semester = 1;

            const firstSemDeadline = new Date(year, 8, 30); // Sept 30
            const secondSemDeadline = new Date(year + 1, 1, 18); // Feb 18

            if (today < firstSemDeadline) {
                semester = 1;
            } else if (today < secondSemDeadline) {
                semester = 2;
            } else {
                semester = 1;
                academicYear = `${year + 1}-${year + 2}`;
            }

            setNewForm({ academic_year: academicYear, semester });
        } catch (err: any) {
            alert(err.message || "Failed to create enrollment.");
        }
    };

    const handleAddDocument = async (enrollmentId: number, docType: string, fileUrl: string) => {
        if (!docType || !fileUrl) return alert("Provide document type and file URL");
        const newDoc = await addEnrollmentDocument(enrollmentId, docType, fileUrl);
        setEnrollments((prev) =>
            prev.map((e) =>
                e.id === enrollmentId
                    ? { ...e, enrollment_documents: [...(e.enrollment_documents || []), newDoc] }
                    : e
            )
        );
    };

    const handleUploadDocument = async (enrollmentId: number) => {
        const type = (document.getElementById(
            `doc-type-${enrollmentId}`
        ) as HTMLInputElement).value;

        const fileInput = document.getElementById(
            `doc-file-${enrollmentId}`
        ) as HTMLInputElement;

        if (!type) return alert("Please select a document type.");
        if (!fileInput.files?.[0]) return alert("Please select a file to upload.");

        const file = fileInput.files[0];

        // <-- SIZE CHECK HERE -->
        const MAX_SIZE_MB = 19;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return alert(`File is too large. Max allowed size is ${MAX_SIZE_MB} MB.`);
        }

        // Set uploading state
        setUploadingStates(prev => ({ ...prev, [enrollmentId]: true }));

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('enrollmentId', enrollmentId.toString());
            formData.append('documentType', type);

            const result = await uploadDocumentAction(formData);

            if (result.error) {
                alert(`Uploading failed: ${result.error}`);
                router.refresh();
                return;
            }

            if (!result.url) {
                alert('Upload failed: No URL returned');
                router.refresh();
                return;
            }

            await handleAddDocument(enrollmentId, type, result.url);

            fileInput.value = "";
            (document.getElementById(`doc-type-${enrollmentId}`) as HTMLInputElement).value = "";

            alert('Document uploaded successfully!');
        } catch (err) {
            console.error("Upload error:", err);
            router.refresh();
            alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setUploadingStates(prev => ({ ...prev, [enrollmentId]: false }));
            router.refresh();
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">My Enrollments</h1>

            {/* New Enrollment Form */}
            <Card className="mb-6">
                <CardHeader>New Enrollment</CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        {/* Academic Year */}
                        <div className="flex flex-col flex-1">
                            <label htmlFor="academic-year" className="text-sm font-medium mb-1">
                                Academic Year
                            </label>
                            <Input
                                id="academic-year"
                                value={newForm.academic_year}
                                readOnly
                            />
                        </div>

                        {/* Semester */}
                        <div className="flex flex-col w-32">
                            <label htmlFor="semester" className="text-sm font-medium mb-1">
                                Semester
                            </label>
                            <Input
                                id="semester"
                                type="number"
                                min={1}
                                max={2}
                                value={newForm.semester}
                                onChange={(e) =>
                                    setNewForm({ ...newForm, semester: Number(e.target.value) })
                                }
                            />
                        </div>
                    </div>

                    <Button className="self-start mt-2" onClick={handleAddEnrollment}>
                        Create Enrollment
                    </Button>
                </CardContent>
            </Card>

            {/* Existing Enrollments */}
            {enrollments.length === 0 && (
                <div className="p-6 border rounded-md text-gray-700">
                    No enrollments yet. Fill the form above to start.
                </div>
            )}

            {enrollments.map((e) => (
                <Card key={e.id} className="mb-4">
                    <CardHeader>
                        {e.academic_year} - Semester {e.semester} ({e.enrollment_status})
                    </CardHeader>
                    <CardContent>
                        <p>Payment Status: {e.payment_status}</p>
                        <p>Total Amount: {e.total_amount}</p>
                        <p>Amount Paid: {e.amount_paid}</p>

                        <h3 className="mt-2 font-bold">Documents</h3>
                        <ul className="list-disc ml-6">
                            {e.enrollment_documents && e.enrollment_documents.length > 0 ? (
                                e.enrollment_documents
                                    .filter((doc: any) => doc !== null)   // ⬅️ stops the crash
                                    .map((doc: any) => (
                                        <li key={doc.id}>
                                            {doc.document_type ?? "Unknown Type"} — {doc.status ?? "Unknown Status"}
                                        </li>
                                    ))
                            ) : (
                                "No documents yet."
                            )}

                        </ul>

                        {/* Upload Area */}
                        <div className="mt-4 flex flex-col gap-4 p-4 rounded-lg border bg-muted">
                            {/* Document Type Field */}
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor={`doc-type-${e.id}`}
                                    className="text-sm font-medium text-foreground"
                                >
                                    Document Type
                                </label>

                                <Select
                                    onValueChange={(value) => {
                                        const el = document.getElementById(`doc-type-${e.id}`) as HTMLInputElement;
                                        if (el) el.value = value;
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Document Type" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Report Card (Form 138)">
                                            Original Report Card (Form 138)
                                        </SelectItem>

                                        <SelectItem value="Good Moral">
                                            Original Good Moral Certificate
                                        </SelectItem>

                                        <SelectItem value="Long White Folder">
                                            Long White Folder
                                        </SelectItem>

                                        <SelectItem value="Student Information Sheet">
                                            Filled Student Information Sheet
                                        </SelectItem>

                                        <SelectItem value="2x2 Picture">
                                            2×2 Picture
                                        </SelectItem>

                                        <SelectItem value="Long Mailing Envelope">
                                            Long Mailing Envelope
                                        </SelectItem>

                                        <SelectItem value="Mailing Stamps">
                                            Mailing Stamps
                                        </SelectItem>

                                        <SelectItem value="PSA/NSO Birth Certificate">
                                            PSA/NSO Birth Certificate (Photocopy)
                                        </SelectItem>

                                        <SelectItem value="Marriage Certificate">
                                            Marriage Certificate (Photocopy)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Hidden input to keep your existing code working */}
                                <input type="hidden" id={`doc-type-${e.id}`} />
                            </div>

                            {/* File Upload Field */}
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor={`doc-file-${e.id}`}
                                    className="text-sm font-medium text-foreground"
                                >
                                    Upload File
                                </label>

                                {/* Styled file input wrapper */}
                                <div className="flex items-center gap-2">
                                    <Input
                                        id={`doc-file-${e.id}`}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="cursor-pointer"
                                        disabled={uploadingStates[e.id]}
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-fit"
                                onClick={() => handleUploadDocument(e.id)}
                                disabled={uploadingStates[e.id]}
                            >
                                {uploadingStates[e.id] ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// TODO: Fix Upload Docs Issue