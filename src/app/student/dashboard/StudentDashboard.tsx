"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, CalendarClock, BookOpen, GraduationCap, Menu, X } from "lucide-react";

interface StudentAnalytics {
    currentProgram: string;
    yearLevel: number;
    registeredCourses: number;
    completedUnits: number;
    pendingDocuments: number;
    upcomingPayments: number;
}

interface Props {
    initialData?: StudentAnalytics; // ⚡ Make optional to handle undefined
}

const navItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/enrollment", label: "My Enrollments", icon: CalendarClock },
    { href: "/student/payments", label: "Payments", icon: BookOpen },
    { href: "/student/courses", label: "Courses", icon: GraduationCap },
];

export default function StudentDashboard({ initialData }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ⚡ Provide fallback values if initialData is undefined
    const analytics: StudentAnalytics = initialData || {
        currentProgram: "N/A",
        yearLevel: 0,
        registeredCourses: 0,
        completedUnits: 0,
        pendingDocuments: 0,
        upcomingPayments: 0,
    };

    return (
        <div className="flex min-h-fit">
            {/* Mobile Menu */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50"
            >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-background border-r
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Student Panel</h2>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button key={item.href} variant="ghost" className="w-full justify-start gap-3" asChild>
                                <Link href={item.href}>
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>
            </aside>

            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>Program</CardHeader>
                        <CardContent className="text-xl font-bold">{analytics.currentProgram}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Year Level</CardHeader>
                        <CardContent className="text-xl font-bold">{analytics.yearLevel}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Registered Courses</CardHeader>
                        <CardContent className="text-xl font-bold">{analytics.registeredCourses}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Completed Units</CardHeader>
                        <CardContent className="text-xl font-bold">{analytics.completedUnits}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Pending Documents</CardHeader>
                        <CardContent className="text-xl font-bold">{analytics.pendingDocuments}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Upcoming Payments</CardHeader>
                        <CardContent className="text-xl font-bold">{analytics.upcomingPayments}</CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}