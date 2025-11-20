"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { addRegistration } from "@/actions/registrations";

type Program = {
    id: number;
    program_name: string;
};

type Year = {
    year_id: number;
    program_id: number;
    year_level: number;
};

export default function RegistrationForm({ programs = [], years = [] }: { programs?: Program[]; years?: Year[] }) {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        contact_number: "",
        address: "",
        program_id: null as number | null,
        year_level: null as number | null,
        is_returning_student: false,
    });

    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // compute years for chosen program
    const programYears = useMemo(
        () => (form.program_id ? years.filter((y) => y.program_id === form.program_id) : []),
        [form.program_id, years]
    );

    // simple validators
    const validators = {
        first_name: (v: string) => v.trim().length > 0,
        last_name: (v: string) => v.trim().length > 0,
        email: (v: string) => /\S+@\S+\.\S+/.test(v.trim()),
        program_id: (v: number | null) => typeof v === "number" && !Number.isNaN(v),
        year_level: (v: number | null) => typeof v === "number" && !Number.isNaN(v),
    };

    // live errors
    const errors = {
        first_name: !validators.first_name(form.first_name) && touched.first_name ? "First name is required." : "",
        last_name: !validators.last_name(form.last_name) && touched.last_name ? "Last name is required." : "",
        email:
            touched.email && !validators.email(form.email)
                ? "Enter a valid email (example@domain.com)."
                : "",
        program_id:
            touched.program_id && !validators.program_id(form.program_id) ? "Select a program." : "",
        year_level:
            touched.year_level && !validators.year_level(form.year_level) ? "Select a year level." : "",
    };

    // form validity
    const isValid =
        validators.first_name(form.first_name) &&
        validators.last_name(form.last_name) &&
        validators.email(form.email) &&
        validators.program_id(form.program_id) &&
        validators.year_level(form.year_level);

    const onChange = (field: string, value: any) => {
        setForm((s) => ({ ...s, [field]: value }));
    };

    const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

    const handleSubmit = async () => {
        // mark all fields touched so user sees errors if any
        setTouched({
            first_name: true,
            last_name: true,
            email: true,
            program_id: true,
            year_level: true,
        });

        if (!isValid) return toast.error("Fix the errors before submitting.");

        setSubmitting(true);

        try {
            await addRegistration({
                ...form,
                program_id: Number(form.program_id),
                year_level: Number(form.year_level),
                created_at: new Date().toISOString(),
            });

            toast.success("Registration submitted — Admin will review it.");

            // keep program/year context for bulk entries, reset other fields
            setForm((s) => ({
                first_name: "",
                last_name: "",
                middle_name: "",
                email: "",
                contact_number: "",
                address: "",
                program_id: s.program_id,
                year_level: s.year_level,
                is_returning_student: false,
            }));

            setTouched({});
        } catch (err: any) {
            toast.error(err?.message || "Failed to submit registration.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-lg w-full mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Student Registration</h1>
                <p className="text-sm text-muted-foreground">Complete required fields marked with *</p>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium mb-1 block">First name *</label>
                    <Input
                        placeholder="First Name"
                        value={form.first_name}
                        onChange={(e) => onChange("first_name", e.target.value)}
                        onBlur={() => markTouched("first_name")}
                        aria-invalid={!!errors.first_name}
                        aria-describedby={errors.first_name ? "err-first_name" : undefined}
                    />
                    {errors.first_name && <p id="err-first_name" className="text-xs text-destructive mt-1">{errors.first_name}</p>}
                </div>

                <div>
                    <label className="text-xs font-medium mb-1 block">Last name *</label>
                    <Input
                        placeholder="Last Name"
                        value={form.last_name}
                        onChange={(e) => onChange("last_name", e.target.value)}
                        onBlur={() => markTouched("last_name")}
                        aria-invalid={!!errors.last_name}
                        aria-describedby={errors.last_name ? "err-last_name" : undefined}
                    />
                    {errors.last_name && <p id="err-last_name" className="text-xs text-destructive mt-1">{errors.last_name}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Middle name</label>
                    <Input
                        placeholder="Middle Name (optional)"
                        value={form.middle_name}
                        onChange={(e) => onChange("middle_name", e.target.value)}
                    />
                </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium mb-1 block">Email *</label>
                    <Input
                        placeholder="example@domain.com"
                        type="email"
                        value={form.email}
                        onChange={(e) => onChange("email", e.target.value)}
                        onBlur={() => markTouched("email")}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "err-email" : undefined}
                    />
                    {errors.email && <p id="err-email" className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="text-xs font-medium mb-1 block">Contact number</label>
                    <Input
                        placeholder="Mobile or landline (optional)"
                        value={form.contact_number}
                        onChange={(e) => onChange("contact_number", e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Address</label>
                    <Input
                        placeholder="Address (optional)"
                        value={form.address}
                        onChange={(e) => onChange("address", e.target.value)}
                    />
                </div>
            </div>

            {/* Program & Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-w-0">
                    <label className="text-xs font-medium mb-1 block">Program *</label>
                    <Select
                        onValueChange={(v) => {
                            onChange("program_id", Number(v));
                            onChange("year_level", null);
                            markTouched("program_id");
                        }}
                    >
                        <SelectTrigger className="w-full truncate">
                            <SelectValue placeholder="Choose program" />
                        </SelectTrigger>
                        <SelectContent>
                            {programs.map((p: any) => (
                                <SelectItem key={p.id} value={String(p.id)} className="truncate">
                                    {p.program_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.program_id && <p className="text-xs text-destructive mt-1">{errors.program_id}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Choose the program the student will enroll to.</p>
                </div>

                <div className="min-w-0">
                    <label className="text-xs font-medium mb-1 block">Year level *</label>
                    <Select
                        onValueChange={(v) => {
                            onChange("year_level", Number(v));
                            markTouched("year_level");
                        }}
                        disabled={!form.program_id}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose year" />
                        </SelectTrigger>
                        <SelectContent>
                            {programYears.length === 0 ? (
                                <SelectItem key="none" value="0">No years found</SelectItem>
                            ) : (
                                programYears.map((y: any) => (
                                    <SelectItem key={y.year_id} value={String(y.year_level)}>
                                        Year {y.year_level}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {errors.year_level && <p className="text-xs text-destructive mt-1">{errors.year_level}</p>}
                </div>
            </div>

            {/* Returning Student */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    checked={form.is_returning_student}
                    onCheckedChange={(v) => onChange("is_returning_student", !!v)}
                />
                <span className="text-sm text-muted-foreground">Returning Student</span>
            </div>

            {/* Submit */}
            <div>
                <Button
                    onClick={handleSubmit}
                    disabled={submitting || !isValid}
                    className="w-full"
                >
                    {submitting ? "Submitting..." : "Register"}
                </Button>
                {!isValid && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Required: First name, Last name, valid Email, Program, Year level.
                    </p>
                )}
            </div>
        </div>
    );
}
