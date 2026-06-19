"use client";

import { useState, useCallback } from "react";
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
import SidebarNav from "@/components/ui/sidebar-nav";

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFormChange = useCallback(
    (field: keyof FormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleCreateAdmin = useCallback(async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!form.fullName) {
      setError("Full name is required");
      return;
    }
    if (!form.email) {
      setError("Email is required");
      return;
    }
    if (!form.password) {
      setError("Password is required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    // Get current admin info para sa audit log
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();
    if (!adminUser) return;

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", adminUser.id)
      .single();

    // Gumawa ng bagong admin account gamit ang API route
    const response = await fetch("/api/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Failed to create admin account");
      setLoading(false);
      return;
    }

    // Log the action
    await supabase.from("audit_logs").insert({
      action: "CREATE_ADMIN",
      target_id: result.userId,
      target_name: form.fullName,
      performed_by: adminUser.id,
      performed_by_name: adminProfile?.full_name,
    });

    setSuccess(`Admin account created successfully for ${form.fullName}!`);
    setForm(INITIAL_FORM);
    setLoading(false);
  }, [form]);

  return (
    <div className="flex">
      <SidebarNav role="admin" />

      <main className="flex-1 p-8 bg-neutral-50">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="max-w-lg">
          <Card className="py-4">
            <CardHeader>
              <CardTitle>Create Admin Account</CardTitle>
              <CardDescription>
                Create a new administrator account. Only admins can create other
                admin accounts.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter full name"
                    value={form.fullName}
                    onChange={(e) =>
                      handleFormChange("fullName", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      handleFormChange("confirmPassword", e.target.value)
                    }
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <Button
                  className="w-full"
                  onClick={handleCreateAdmin}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
