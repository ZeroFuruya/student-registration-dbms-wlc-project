"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { loginUserAction, signUpUserAction } from "@/actions/users"

type Props = {
    type: "login" | "signup"
}

export default function AuthForm({ type }: Props) {
    const isLogin = type === "login"
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const email = formData.get("email") as string
            const password = formData.get("password") as string

            let errorMessage
            let title
            let description

            if (!email || !password) {
                toast.error("Please fill in all required fields.")
                return
            }

            if (isLogin) {
                errorMessage = (await loginUserAction(email, password)).errorMessage
                title = "Login Successful"
                description = "You have successfully logged in."
            } else {
                // Before calling signupAction, add this validation:
                if (!isLogin) {
                    const confirmPassword = formData.get("confirmPassword") as string

                    if (password !== confirmPassword) {
                        toast.error("Passwords do not match")
                        return
                    }

                    if (password.length < 8) {
                        toast.error("Password must be at least 8 characters")
                        return
                    }
                }
                errorMessage = (await signUpUserAction(email, password)).errorMessage
                title = "Signup Successful"
                description = "You have successfully signed up. Check your email for confirmation."
            }

            if (!errorMessage) {
                toast.success(title, {
                    description,
                    duration: 2500,
                })
                isLogin ? router.replace("/student-dashboard") : router.replace("/login")
            } else {
                toast.error(isLogin ? "Login Failed" : "Signup Failed", {
                    description: errorMessage,
                })
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

                    {!isLogin && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                disabled={isPending}
                                required
                            />
                        </div>
                    )}

                    <Button type="submit" className="w-full">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isLogin ? "Log In" : "Sign Up"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-muted-foreground space-x-1">
                {isLogin ? (
                    <>
                        Don’t have an account?{" "}
                        <Link href="/sign-up" className="px-1 text-primary">
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{" "}
                        <Link href="/login" className="px-1 text-primary">
                            Log in
                        </Link>
                    </>
                )}
            </CardFooter>

        </>
    )
}

