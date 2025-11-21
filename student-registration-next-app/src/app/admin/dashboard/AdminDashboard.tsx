"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { getAnalyticsData } from "@/actions/admin";
import {
    LayoutDashboard,
    UserCheck,
    GraduationCap,
    BookOpen,
    CalendarClock,
    FileText,
    Menu,
    X
} from "lucide-react";

interface Analytics {
    totalStudents: number;
    pendingRegistrations: number;
    approvedRegistrations: number;
    programsCount: number;
    coursesCount: number;
    upcomingEnrollments: number;
}

const COLORS = ["#facc15", "#4ade80", "#f87171"]; // Pending, Approved, Upcoming

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/registrations-dashboard", label: "Registrations", icon: UserCheck },
    { href: "/admin/programs-management", label: "Programs", icon: GraduationCap },
    { href: "/admin/courses-management", label: "Courses", icon: BookOpen },
    { href: "/admin/upcoming-enrollments", label: "Enrollments", icon: CalendarClock },
    { href: "/admin/enrollment-documents", label: "Documents", icon: FileText },
];

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const data = await getAnalyticsData();
            setAnalytics(data);
        }
        fetchData();
    }, []);

    const registrationStatusData = analytics ? [
        { name: "Pending", value: analytics.pendingRegistrations },
        { name: "Approved", value: analytics.approvedRegistrations },
        { name: "Upcoming", value: analytics.upcomingEnrollments },
    ] : [];

    const monthlyData = [
        { month: "Jan", registrations: 40 },
        { month: "Feb", registrations: 55 },
        { month: "Mar", registrations: 30 },
        { month: "Apr", registrations: 75 },
        { month: "May", registrations: 60 },
    ];

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
                    <h2 className="text-xl font-bold">Admin Panel</h2>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.href}
                                variant="ghost"
                                className="w-full justify-start gap-3"
                                asChild
                            >
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
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                {/* Stats */}
                {analytics && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader>Total Students</CardHeader>
                            <CardContent className="text-3xl font-extrabold">{analytics.totalStudents}</CardContent>
                        </Card>

                        <Card>
                            <CardHeader>Pending Registrations</CardHeader>
                            <CardContent className="text-3xl font-extrabold">{analytics.pendingRegistrations}</CardContent>
                        </Card>

                        <Card>
                            <CardHeader>Upcoming Enrollments</CardHeader>
                            <CardContent className="text-3xl font-extrabold">{analytics.upcomingEnrollments}</CardContent>
                        </Card>

                        <Card>
                            <CardHeader>Programs</CardHeader>
                            <CardContent className="text-3xl font-extrabold">{analytics.programsCount}</CardContent>
                        </Card>
                    </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                    <Card>
                        <CardHeader>Monthly Registrations</CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="registrations" fill="#4E9F3D" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Registration Status</CardHeader>
                        <CardContent className="h-72 flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={registrationStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        label
                                    >
                                        {registrationStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
