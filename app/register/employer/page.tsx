"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function EmployerRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    if (!fullName) {
      setError("Fullname name is required");
      return;
    }
    if (!email) {
      setError("Email name is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!companyName) {
      setError("Company name is required");
      return;
    }

    if (!companyAddress) {
      setError("Company address is required");
      return;
    }

    if (!industry) {
      setError("Industry is required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "employer",
          company_name: companyName,
          company_address: companyAddress,
          industry,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md pt-3">
        <CardHeader>
          <CardTitle className="text-2xl">Employer Registration</CardTitle>
          <CardDescription>
            Create your employer account to find candidates
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Personal Info */}
            <p className="text-sm font-medium text-muted-foreground">
              Personal Information
            </p>

            <div className="flex flex-col gap-2">
              <Label>Full Name *</Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Password *</Label>
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

            {/* Company Info */}
            <p className="text-sm font-medium text-muted-foreground mt-2">
              Company Information
            </p>

            <div className="flex flex-col gap-2">
              <Label>Company Name *</Label>
              <Input
                type="text"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Company Address *</Label>
              <Input
                type="text"
                placeholder="Enter your company address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Industry *</Label>
              <Input
                type="text"
                placeholder="Ex. Construction, Healthcare, Retail"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              className="w-full"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Create Employer Account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/register" className="text-primary hover:underline">
                ← Back to account types
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
