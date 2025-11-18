"use client";

import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function LogOutButton() {
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const router = useRouter();

    const handleLogOut = async () => {
        if (loading) return;
        setLoading(true);

        // Show pending toast (for async feedback)
        const toastId = toast.loading("Logging out...");

        try {
            // Simulate logout delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Example: replace this with actual logout logic
            const errorMessage = null;

            if (!errorMessage) {
                toast.success("Logged out successfully!", {
                    id: toastId,
                    description: "Redirecting to login page...",
                    duration: 2500,
                });
                setIsLoggedIn(false);
                setTimeout(() => router.push("/login"), 1000);
            } else {
                throw new Error(errorMessage);
            }
        } catch (err: any) {
            toast.error("Logout failed!", {
                id: toastId,
                description: err.message || "Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) return null;

    return (
        <Button
            className="w-28 font-medium flex items-center justify-center gap-2"
            variant="outline"
            onClick={handleLogOut}
            disabled={loading}
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin size-4" />
                    <span>Logging out</span>
                </>
            ) : (
                "Log Out"
            )}
        </Button>
    );
}

export default LogOutButton;
