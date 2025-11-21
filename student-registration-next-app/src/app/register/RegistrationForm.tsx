"use client";

import { useState, useMemo, useRef } from "react";
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

type Program = { id: number; program_name: string };
type Year = { year_id: number; program_id: number; year_level: number };

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
    const firstInvalidRef = useRef<HTMLInputElement | null>(null);

    const programYears = useMemo(
        () => (form.program_id ? years.filter((y) => y.program_id === form.program_id) : []),
        [form.program_id, years]
    );

    const validators = {
        first_name: (v: string) => v.trim().length > 0,
        last_name: (v: string) => v.trim().length > 0,
        email: (v: string) => /\S+@\S+\.\S+/.test(v.trim()),
        program_id: (v: number | null) => typeof v === "number" && !Number.isNaN(v),
        year_level: (v: number | null) => typeof v === "number" && !Number.isNaN(v),
    };

    const errors = {
        first_name: touched.first_name && !validators.first_name(form.first_name) ? "First name is required." : "",
        last_name: touched.last_name && !validators.last_name(form.last_name) ? "Last name is required." : "",
        email: touched.email && !validators.email(form.email) ? "Enter a valid email." : "",
        program_id: touched.program_id && !validators.program_id(form.program_id) ? "Select a program." : "",
        year_level: touched.year_level && !validators.year_level(form.year_level) ? "Select a year level." : "",
    };

    const isValid =
        validators.first_name(form.first_name) &&
        validators.last_name(form.last_name) &&
        validators.email(form.email) &&
        validators.program_id(form.program_id) &&
        validators.year_level(form.year_level);

    const onChange = (field: string, value: any) => setForm((s) => ({ ...s, [field]: value }));
    const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

    const handleSubmit = async () => {
        const requiredFields = ["first_name", "last_name", "email", "program_id", "year_level"];
        const newTouched = { ...touched };
        requiredFields.forEach((f) => (newTouched[f] = true));
        setTouched(newTouched);

        for (const field of requiredFields) {
            if (!validators[field as keyof typeof validators](form[field as keyof typeof form])) {
                firstInvalidRef.current = document.querySelector(`[name="${field}"]`) as HTMLInputElement;
                firstInvalidRef.current?.focus();
                return toast.error("Fix the errors before submitting.");
            }
        }

        if (!isValid) return;

        setSubmitting(true);

        try {
            await addRegistration({
                ...form,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                middle_name: form.middle_name.trim(),
                email: form.email.trim(),
                program_id: Number(form.program_id),
                year_level: Number(form.year_level),
                created_at: new Date().toISOString(),
            });

            toast.success("Registration submitted — Admin will review it.");

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

    // helper to style inputs dynamically
    const inputClass = (field: string) =>
        touched[field] ? (errors[field] ? "border-destructive" : "border-green-500") : "";

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
                        name="first_name"
                        placeholder="First Name"
                        className={inputClass("first_name")}
                        value={form.first_name}
                        onChange={(e) => onChange("first_name", e.target.value)}
                        onBlur={() => markTouched("first_name")}
                    />
                    {errors.first_name && <p className="text-xs text-destructive mt-1">{errors.first_name}</p>}
                </div>
                <div>
                    <label className="text-xs font-medium mb-1 block">Last name *</label>
                    <Input
                        name="last_name"
                        placeholder="Last Name"
                        className={inputClass("last_name")}
                        value={form.last_name}
                        onChange={(e) => onChange("last_name", e.target.value)}
                        onBlur={() => markTouched("last_name")}
                    />
                    {errors.last_name && <p className="text-xs text-destructive mt-1">{errors.last_name}</p>}
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
                        name="email"
                        placeholder="example@domain.com"
                        type="email"
                        className={inputClass("email")}
                        value={form.email}
                        onChange={(e) => onChange("email", e.target.value)}
                        onBlur={() => markTouched("email")}
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
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
                <div>
                    <label className="text-xs font-medium mb-1 block">Program *</label>
                    <Select
                        onValueChange={(v) => {
                            onChange("program_id", Number(v));
                            onChange("year_level", null);
                            markTouched("program_id");
                        }}
                    >
                        <SelectTrigger className={`w-full ${inputClass("program_id")}`}>
                            <SelectValue placeholder="Choose program" />
                        </SelectTrigger>
                        <SelectContent>
                            {programs.map((p: Program) => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.program_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.program_id && <p className="text-xs text-destructive mt-1">{errors.program_id}</p>}
                </div>
                <div>
                    <label className="text-xs font-medium mb-1 block">Year level *</label>
                    <Select
                        onValueChange={(v) => {
                            onChange("year_level", Number(v));
                            markTouched("year_level");
                        }}
                        disabled={!form.program_id || programYears.length === 0} // <--- updated
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose year" />
                        </SelectTrigger>
                        <SelectContent>
                            {programYears.length === 0 ? (
                                <SelectItem key="none" value="0">
                                    No years found
                                </SelectItem>
                            ) : (
                                programYears.map((y: Year) => (
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
                <Button onClick={handleSubmit} disabled={submitting || !isValid} className="w-full">
                    {submitting ? "Submitting..." : "Register"}
                </Button>
            </div>
        </div>
    );
}
