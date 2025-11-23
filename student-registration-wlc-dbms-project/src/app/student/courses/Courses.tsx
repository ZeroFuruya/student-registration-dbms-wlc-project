"use client";

import { useEffect, useState } from "react";
import { getStudentCourses } from "./action/courses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Courses() {
    const [state, setState] = useState<{ loading: boolean; enrolled: boolean; courses: any[] }>({
        loading: true,
        enrolled: false,
        courses: []
    });

    useEffect(() => {
        async function load() {
            const result = await getStudentCourses();
            setState({
                loading: false,
                enrolled: result.enrolled ?? false,
                courses: result.courses ?? []
            });
        }
        load();
    }, []);

    if (state.loading) {
        return <p className="text-center py-10">Loading...</p>;
    }

    if (!state.enrolled) {
        return (
            <Card className="max-w-xl mx-auto mt-10">
                <CardHeader>
                    <CardTitle className="text-lg">Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        You are not enrolled yet.
                        Once an administrator approves your enrollment, your courses will appear here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-3xl mx-auto mt-10">
            <CardHeader>
                <CardTitle>Your Courses</CardTitle>
            </CardHeader>
            <CardContent>
                {state.courses.length === 0 ? (
                    <p>No courses found for this semester.</p>
                ) : (
                    <ul className="space-y-4">
                        {state.courses.map((course: any) => (
                            <li
                                key={course.course_id}
                                className="border p-4 rounded-lg"
                            >
                                <p className="font-semibold">{course.course_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {course.course_code} ・ {course.units} units
                                </p>

                                <div className="text-sm text-muted-foreground mt-2">
                                    <p>
                                        <strong>Schedule:</strong> {course.schedule.day} · {course.schedule.time_start}–{course.schedule.time_end}
                                    </p>
                                    <p><strong>Room:</strong> {course.schedule.room}</p>
                                </div>
                            </li>

                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
