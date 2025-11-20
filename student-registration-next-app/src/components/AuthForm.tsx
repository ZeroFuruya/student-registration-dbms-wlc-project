"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { loginUserAction } from "@/actions/users";

export default function AuthForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    // Admin emails must be exposed to the client
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
        ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(",")
        : [];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // prevent default page reload
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string)?.trim();
        const password = (formData.get("password") as string)?.trim();

        if (!email || !password) {
            toast.error("Please fill in all required fields.");
            setIsPending(false);
            return;
        }

        try {
            const result = await loginUserAction(email, password);

            const errorMessage =
                "errorMessage" in result
                    ? result.errorMessage
                    : "error" in result
                        ? result.error
                        : null;

            if (errorMessage) {
                toast.error("Login Failed", { description: errorMessage });
                setIsPending(false);
                return;
            }

            toast.success("Login Successful", {
                description: "You have successfully logged in.",
                duration: 2500,
            });

            if (adminEmails.includes(email)) {
                router.replace("/admin/dashboard");
            } else {
                router.replace("/student-dashboard");
            }
        } catch (err: any) {
            toast.error("Login Failed", { description: err.message || "Unexpected error" });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            disabled={isPending}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            disabled={isPending}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <span>
                    Don’t have access? Contact the{" "}
                    <span className="font-[1000]">gwapong</span> admin, si{" "}
                    <span className="font-bold">Prince Roben Gloria</span>, to create your account.
                </span>
            </CardFooter>
        </>
    );
}
