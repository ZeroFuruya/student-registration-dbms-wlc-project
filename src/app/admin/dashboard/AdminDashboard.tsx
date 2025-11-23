"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, Area, AreaChart
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
    X,
    Users,
    TrendingUp,
    DollarSign,
    ClipboardCheck
} from "lucide-react";

const COLORS = {
    primary: "#4E9F3D",
    warning: "#facc15",
    success: "#4ade80",
    danger: "#f87171",
    info: "#60a5fa",
    purple: "#a78bfa",
};

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/registrations-dashboard", label: "Registrations", icon: UserCheck },
    { href: "/admin/programs-management", label: "Programs", icon: GraduationCap },
    { href: "/admin/courses-management", label: "Courses", icon: BookOpen },
    { href: "/admin/enrollments-management", label: "Enrollments", icon: CalendarClock },
    { href: "/admin/students-management", label: "Students", icon: FileText },
];

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getAnalyticsData();
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // Transform data for charts
    const registrationStatusData = [
        { name: "Pending", value: analytics.pendingRegistrations, color: COLORS.warning },
        { name: "Approved", value: analytics.approvedRegistrations, color: COLORS.success },
        { name: "Rejected", value: analytics.rejectedRegistrations, color: COLORS.danger },
    ];

    const enrollmentStatusData = [
        { name: "Draft", value: analytics.draftEnrollments, color: "#94a3b8" },
        { name: "For Review", value: analytics.forReviewEnrollments, color: COLORS.warning },
        { name: "Approved", value: analytics.approvedEnrollments, color: COLORS.success },
        { name: "Rejected", value: analytics.rejectedEnrollments, color: COLORS.danger },
    ];

    const paymentStatusData = [
        { name: "Paid", value: analytics.paidEnrollments, color: COLORS.success },
        { name: "Partial", value: analytics.partialEnrollments, color: COLORS.warning },
        { name: "Unpaid", value: analytics.unpaidEnrollments, color: COLORS.danger },
    ];

    const programDistributionData = Object.entries(analytics.programDistribution || {}).map(([name, value]) => ({
        name,
        value,
    }));

    const yearLevelData = Object.entries(analytics.yearLevelDistribution || {}).map(([name, value]) => ({
        name,
        value,
    }));

    const monthlyRegistrationsData = Object.entries(analytics.monthlyRegistrations || {}).map(([month, count]) => ({
        month,
        registrations: count,
    }));

    const monthlyEnrollmentsData = Object.entries(analytics.monthlyEnrollments || {}).map(([month, count]) => ({
        month,
        enrollments: count,
    }));

    const revenueData = [
        { name: "Total Revenue", value: analytics.totalRevenue, color: COLORS.success },
        { name: "Pending", value: analytics.pendingRevenue, color: COLORS.warning },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Mobile Menu Button */}
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
            <main className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                {/* Key Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Total Students
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{analytics.totalStudents}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4" />
                                Pending Registrations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-yellow-600">{analytics.pendingRegistrations}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Active Enrollments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">{analytics.approvedEnrollments}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Total Revenue
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">₱{analytics.totalRevenue.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Expected: ₱{analytics.expectedRevenue.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Revenue Collection Status</CardTitle>
                            <CardDescription>
                                {((analytics.totalRevenue / analytics.expectedRevenue) * 100).toFixed(1)}% collected
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Status</CardTitle>
                            <CardDescription>Enrollment payment breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {paymentStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Registrations Trend</CardTitle>
                            <CardDescription>Last 6 months registration activity</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyRegistrationsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="registrations"
                                        stroke={COLORS.primary}
                                        fill={COLORS.primary}
                                        fillOpacity={0.6}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Enrollments Trend</CardTitle>
                            <CardDescription>Last 6 months enrollment activity</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyEnrollmentsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="enrollments"
                                        stroke={COLORS.info}
                                        strokeWidth={3}
                                        dot={{ fill: COLORS.info, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Breakdowns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registration Status</CardTitle>
                            <CardDescription>Current registration pipeline</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={registrationStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {registrationStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment Status</CardTitle>
                            <CardDescription>Current enrollment pipeline</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={enrollmentStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {enrollmentStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Distribution Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Students by Program</CardTitle>
                            <CardDescription>Program enrollment distribution</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={programDistributionData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill={COLORS.purple} radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Students by Year Level</CardTitle>
                            <CardDescription>Year level distribution</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={yearLevelData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {yearLevelData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                                            />
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