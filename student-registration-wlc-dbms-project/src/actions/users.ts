"use server"

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";

export const loginUserAction = async (email: string, password: string) => {
    try {
        const supabaseClient = await createClient()
        const { auth } = await createClient()
        const { error } = await auth.signInWithPassword({ email, password });

        let errorMessage

        if (error) throw error

        return { errorMessage: null };
    }
    catch (error) {
        return handleError(error);
    }
}

export const logoutUserAction = async () => {
    try {
        const { auth } = await createClient()
        const { error } = await auth.signOut();

        let errorMessage

        if (error) throw error

        return { errorMessage: null };
    }
    catch (error) {
        return handleError(error);
    }
}

export const signUpUserAction = async (email: string, password: string) => {
    try {
        const { auth } = await createClient()
        const { data, error } = await auth.signUp({ email, password });

        if (error) throw error

        const user = data.user?.id;
        if (!user) throw new Error("Error in signing up");

        return { error: null };
    }
    catch (error) {
        return handleError(error);
    }
}