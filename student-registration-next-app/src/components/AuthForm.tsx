"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTransition } from "react"
import { Bold, Loader2 } from "lucide-react"
import { loginUserAction } from "@/actions/users"

export default function AuthForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const email = formData.get("email") as string
            const password = formData.get("password") as string

            if (!email || !password) {
                toast.error("Please fill in all required fields.")
                return
            }

            const result = await loginUserAction(email, password)
            const errorMessage =
                "errorMessage" in result ?
                    result.errorMessage
                    :
                    "error" in result ?
                        result.error
                        :
                        null

            if (!errorMessage) {
                toast.success("Login Successful", {
                    description: "You have successfully logged in.",
                    duration: 2500,
                })
                router.replace("/student-dashboard")
            } else {
                toast.error("Login Failed", { description: errorMessage })
            }
        })
    }

    return (
        <>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
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

                    <Button type="submit" className="w-full">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <span>Don’t have access? Contact the <span className="font-[1000]">gwapong</span> admin, si <span className="font-bold">Prince Roben Gloria</span>, to create your account.</span>
            </CardFooter>
        </>
    )
}