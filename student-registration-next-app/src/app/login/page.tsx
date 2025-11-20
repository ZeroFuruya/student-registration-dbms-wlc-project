"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import AuthForm from "@/components/AuthForm"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-background relative px-4">

      <Card className="w-full max-w-sm shadow-lg border border-border/60 backdrop-blur-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>

        <AuthForm />
      </Card>
    </div>
  )
}
