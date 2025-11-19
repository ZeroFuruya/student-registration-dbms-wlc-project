"use client";

import { logoutUserAction } from "@/actions/users";
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
            const result = await logoutUserAction();
            const errorMessage = "errorMessage" in result ? result.errorMessage : result.error;

            if (!errorMessage) {
                toast.success("Logged out successfully!", {
                    id: toastId,
                    description: "Redirecting to home page...",
                    duration: 2500,
                });
                setIsLoggedIn(false);
                setTimeout(() => router.replace("/"), 1000);
            } else {
                throw new Error(String(errorMessage));
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
