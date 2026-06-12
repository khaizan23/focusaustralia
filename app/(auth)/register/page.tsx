"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  

  async function handleRegister() {
    setError("")

    // Check kung magkapareho ang password
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    // if (error) {
    //   setError(error.message)
    //   setLoading(false)
    //   return
    // }

    if (error) {
        console.log("Full error:", JSON.stringify(error))
        setError(error.message)
        setLoading(false)
        return
      }

    // Mag-redirect sa login page
    window.location.href = "/login"
  }
  

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl pt-5">Sign Up</CardTitle>
          <CardDescription>
            Create a new account to get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              className="w-full py-2"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center justify-center text-sm text-muted-foreground">
          Already have an account?
          <Link href="/login" className="text-black px-1 hover:underline "> Sign in</Link>
        </CardFooter>
      </Card>
    </main>
  );
}