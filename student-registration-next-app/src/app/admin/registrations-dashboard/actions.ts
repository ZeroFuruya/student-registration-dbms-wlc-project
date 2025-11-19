'use server';
import { createClient } from '@/auth/server';

export async function approveRegistration(registrationId: number, adminId: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('registrations')
        .update({ status: 'Approved', reviewed_by: adminId, reviewed_at: new Date().toISOString() })
        .eq('id', registrationId);

    if (error) throw error;
    return true;
}

export async function rejectRegistration(registrationId: number, adminId: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('registrations')
        .update({ status: 'Rejected', reviewed_by: adminId, reviewed_at: new Date().toISOString() })
        .eq('id', registrationId);

    if (error) throw error;
    return true;
}
