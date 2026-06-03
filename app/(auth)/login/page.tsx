"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError("")
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // I-set ang cookie manually
    document.cookie = `sb-access-token=${data.session?.access_token}; path=/`

    // I-check ang role ng user
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

//       console.log("Profile:", profile)
//     console.log("Profile Error:", profileError)
// console.log("Role:", profile?.role)

    // I-redirect depende sa role
    if (profile?.role === "admin") {
      window.location.href = "/admin/dashboard"
    } else {
      window.location.href = "/client/dashboard"
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">

        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">

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

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

          </div>
        </CardContent>

      </Card>
    </main>
  )
}