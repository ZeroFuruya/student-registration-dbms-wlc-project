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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { createPayment as serverCreatePayment } from "@/actions/payments";
import type { EnrollmentForPayment, PaymentRecord } from "@/actions/payments";

interface Props {
    studentId: number;
    initialEnrollments: EnrollmentForPayment[];
    initialPayments: PaymentRecord[];
}

interface ChangeDetails {
    totalAmount: number;
    amountPaid: number;
    paymentAmount: number;
    balance: number;
    change: number;
    academicYear: string;
    semester: number;
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

    // Change dialog state
    const [showChangeDialog, setShowChangeDialog] = useState(false);
    const [changeDetails, setChangeDetails] = useState<ChangeDetails | null>(null);

    const handleMakePayment = async () => {
        if (!selectedEnrollment) return alert("Pick an enrollment to apply payment.");
        if (!amount || amount <= 0) return alert("Enter a valid amount.");

        // Find the selected enrollment
        const enrollment = enrollments.find(en => en.id === selectedEnrollment);
        if (!enrollment) return alert("Enrollment not found.");

        // Calculate current balance
        const currentBalance = Number(enrollment.total_amount || 0) - Number(enrollment.amount_paid || 0);

        // Check if payment exceeds balance
        if (amount > currentBalance && currentBalance > 0) {
            const change = amount - currentBalance;

            // Show change dialog
            setChangeDetails({
                totalAmount: Number(enrollment.total_amount || 0),
                amountPaid: Number(enrollment.amount_paid || 0),
                paymentAmount: amount,
                balance: currentBalance,
                change: change,
                academicYear: enrollment.academic_year,
                semester: enrollment.semester,
            });
            setShowChangeDialog(true);
            return;
        }

        // If no overpayment, proceed with payment
        await processPayment(selectedEnrollment, amount);
    };

    const processPayment = async (enrollmentId: number, paymentAmount: number) => {
        setSubmitting(true);
        try {
            // Call server action to create payment and update enrollment
            const payment = await serverCreatePayment(enrollmentId, paymentAmount, method, reference || null);

            // update payments list (show newly created)
            setPayments((p) => [payment, ...p]);

            // also update local enrollment amounts/status
            setEnrollments((prev) =>
                prev.map((en) =>
                    en.id === enrollmentId
                        ? {
                            ...en,
                            amount_paid: Number(en.amount_paid || 0) + Number(paymentAmount),
                            payment_status:
                                Number(en.amount_paid || 0) + Number(paymentAmount) >= Number(en.total_amount || 0) && Number(en.total_amount || 0) > 0
                                    ? "Paid"
                                    : (Number(en.amount_paid || 0) + Number(paymentAmount) > 0 ? "Partial" : "Unpaid"),
                        }
                        : en
                )
            );

            // reset fields
            setAmount(0);
            setReference("");

            alert("Payment recorded successfully!");
        } catch (err: any) {
            console.error("Payment error:", err);
            alert(err?.message || "Failed to record payment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmWithChange = async () => {
        if (!changeDetails || !selectedEnrollment) return;

        setShowChangeDialog(false);

        // Process payment with the exact balance amount (not the overpayment)
        await processPayment(selectedEnrollment, changeDetails.balance);

        // Show final change alert
        alert(
            `PAYMENT COMPLETE!\n\n` +
            `Payment Amount: ₱${changeDetails.paymentAmount.toFixed(2)}\n` +
            `Balance Due: ₱${changeDetails.balance.toFixed(2)}\n` +
            `CHANGE: ₱${changeDetails.change.toFixed(2)}\n\n` +
            `Please collect your change from the cashier.`
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Payments</h1>

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
                                            {en.academic_year} — Sem {en.semester} — Balance: ₱{(Number(en.total_amount || 0) - Number(en.amount_paid || 0)).toFixed(2)}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Show current balance info */}
                    {selectedEnrollment && enrollments.find(en => en.id === selectedEnrollment) && (
                        <div className="p-3 bg-muted rounded-md">
                            <div className="text-sm font-medium mb-1">Balance Details</div>
                            <div className="text-xs space-y-1">
                                <div>Total Amount: ₱{Number(enrollments.find(en => en.id === selectedEnrollment)?.total_amount || 0).toFixed(2)}</div>
                                <div>Amount Paid: ₱{Number(enrollments.find(en => en.id === selectedEnrollment)?.amount_paid || 0).toFixed(2)}</div>
                                <div className="font-semibold text-base pt-1">
                                    Remaining Balance: ₱{(
                                        Number(enrollments.find(en => en.id === selectedEnrollment)?.total_amount || 0) -
                                        Number(enrollments.find(en => en.id === selectedEnrollment)?.amount_paid || 0)
                                    ).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}

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

            {/* Change Dialog */}
            <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>⚠️ Overpayment Detected</DialogTitle>
                        <DialogDescription>
                            The payment amount exceeds the remaining balance. Change will be given.
                        </DialogDescription>
                    </DialogHeader>

                    {changeDetails && (
                        <div className="space-y-3 py-4">
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                                <div className="text-sm font-medium">Enrollment Details</div>
                                <div className="text-xs text-muted-foreground">
                                    {changeDetails.academicYear} — Semester {changeDetails.semester}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Amount:</span>
                                    <span className="font-medium">₱{changeDetails.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Previously Paid:</span>
                                    <span className="font-medium">₱{changeDetails.amountPaid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-muted-foreground">Remaining Balance:</span>
                                    <span className="font-semibold">₱{changeDetails.balance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Given:</span>
                                    <span className="font-semibold">₱{changeDetails.paymentAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                                    <span className="font-bold text-green-700 dark:text-green-300">CHANGE:</span>
                                    <span className="font-bold text-lg text-green-700 dark:text-green-300">
                                        ₱{changeDetails.change.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                                ℹ️ Only ₱{changeDetails.balance.toFixed(2)} will be applied to your enrollment. Please collect your change of ₱{changeDetails.change.toFixed(2)} from the cashier.
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowChangeDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmWithChange}>
                            Confirm & Process Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}