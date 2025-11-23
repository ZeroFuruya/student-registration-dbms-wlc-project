"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

import { createPayment as serverCreatePayment } from "@/actions/payments"; // server action
import type { EnrollmentForPayment, PaymentRecord } from "@/actions/payments";

interface Props {
    studentId: number;
    initialEnrollments: EnrollmentForPayment[];
    initialPayments: PaymentRecord[];
}

export default function Payments({ studentId, initialEnrollments, initialPayments }: Props) {
    const [enrollments, setEnrollments] = useState<EnrollmentForPayment[]>(initialEnrollments || []);
    const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments || []);

    const [selectedEnrollment, setSelectedEnrollment] = useState<number | null>(
        enrollments.length > 0 ? enrollments[0].id : null
    );
    const [amount, setAmount] = useState<number>(0);
    const [method, setMethod] = useState<string>("Cash");
    const [reference, setReference] = useState<string>("");

    const [submitting, setSubmitting] = useState(false);

    const handleMakePayment = async () => {
        if (!selectedEnrollment) return alert("Pick an enrollment to apply payment.");
        if (!amount || amount <= 0) return alert("Enter a valid amount.");

        setSubmitting(true);
        try {
            // Call server action to create payment and update enrollment
            const payment = await serverCreatePayment(selectedEnrollment, amount, method, reference || null);

            // update payments list (show newly created)
            setPayments((p) => [payment, ...p]);

            // also update local enrollment amounts/status
            setEnrollments((prev) =>
                prev.map((en) =>
                    en.id === selectedEnrollment
                        ? {
                            ...en,
                            amount_paid: Number(en.amount_paid || 0) + Number(amount),
                            payment_status:
                                Number(en.amount_paid || 0) + Number(amount) >= Number(en.total_amount || 0) && Number(en.total_amount || 0) > 0
                                    ? "Paid"
                                    : (Number(en.amount_paid || 0) + Number(amount) > 0 ? "Partial" : "Unpaid"),
                        }
                        : en
                )
            );

            // reset fields
            setAmount(0);
            setReference("");
            alert("Payment recorded (simulation).");
        } catch (err: any) {
            console.error("Payment error:", err);
            alert(err?.message || "Failed to record payment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Payments (Simulation)</h1>

            <Card className="mb-6">
                <CardHeader>Make a Payment</CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {/* Enrollment selector */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Apply To Enrollment</label>
                        <Select
                            onValueChange={(val) => setSelectedEnrollment(Number(val))}
                            defaultValue={selectedEnrollment ? String(selectedEnrollment) : undefined}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select enrollment" />
                            </SelectTrigger>
                            <SelectContent>
                                {enrollments.length === 0 ? (
                                    <SelectItem value="">No enrollments</SelectItem>
                                ) : (
                                    enrollments.map((en) => (
                                        <SelectItem key={en.id} value={String(en.id)}>
                                            {en.academic_year} — Sem {en.semester} — Balance: {(Number(en.total_amount || 0) - Number(en.amount_paid || 0)).toFixed(2)}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Amount</label>
                        <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={amount === 0 ? "" : String(amount)}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="e.g., 1500.00"
                        />
                    </div>

                    {/* Method */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Payment Method</label>
                        <Select onValueChange={(val) => setMethod(val)} defaultValue="Cash">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="GCash">GCash</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reference */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Reference Number (optional)</label>
                        <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction reference or remarks" />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleMakePayment} disabled={submitting}>
                            {submitting ? "Recording..." : "Make Payment"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
                <CardHeader>Payment History</CardHeader>
                <CardContent>
                    {payments.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No payments recorded yet.</div>
                    ) : (
                        <ul className="space-y-3">
                            {payments.map((p) => (
                                <li key={p.id} className="border rounded-md p-3">
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="text-sm font-medium">Enrollment #{p.enrollment_id}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">₱{Number(p.amount).toFixed(2)}</div>
                                            <div className="text-xs text-muted-foreground">{p.payment_method}</div>
                                        </div>
                                    </div>
                                    {p.reference_number && <div className="mt-2 text-sm">Ref: {p.reference_number}</div>}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
