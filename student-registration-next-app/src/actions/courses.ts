"use server";

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";

export const addCourse = async (course: {
    course_code: string;
    course_name: string;
    units: number;
    year_id: number;
    semester: number;
    status?: string;
    created_at?: string;
}) => {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("courses")
            .insert(course)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        handleError(err);
        throw err;
    }
};

export const updateCourse = async (course_id: number, updated: Partial<{
    course_code: string;
    course_name: string;
    units: number;
    semester: number;
    status: string;
}>) => {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("courses")
            .update(updated)
            .eq("course_id", course_id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        handleError(err);
        throw err;
    }
};

export const deleteCourse = async (course_id: number) => {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("courses")
            .delete()
            .eq("course_id", course_id);

        if (error) throw error;
        return true;
    } catch (err) {
        handleError(err);
        throw err;
    }
};
