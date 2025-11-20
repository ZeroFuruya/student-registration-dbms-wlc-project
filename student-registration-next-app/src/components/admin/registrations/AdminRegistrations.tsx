"use client";

import { useState } from "react";
import { RegistrationToolbar } from "./RegistrationToolbar";
import { RegistrationsTable } from "./RegistrationTable";
import { RegistrationCard } from "./RegistrationCard";
import { Database } from "@/types/supabase";

interface Props {
    registrations: Database["public"]["Tables"]["registrations"]["Row"][];
}

export function AdminRegistrations({ registrations }: Props) {
    const [filtered, setFiltered] = useState(registrations);

    return (
        <div>
            <RegistrationToolbar registrations={registrations} onFiltered={setFiltered} />
            <RegistrationsTable registrations={filtered} isPending={false} />
            <RegistrationCard registrations={filtered} isPending={false} />
        </div>
    );
}
