"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";

interface EmployerProfile {
  full_name: string;
  email: string;
  company_name: string | null;
  company_address: string | null;
  industry: string | null;
  verification_status: string | null;
}

export default function EmployerDashboard() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch employer profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Fetch total available candidates
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client")
        .eq("status", "available");

      setTotalCandidates(count || 0);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <SidebarNav role="employer" />
        <main className="flex-1 p-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <SidebarNav role="employer" />

      <main className="flex-1 p-8 bg-neutral-50">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome, {profile?.full_name}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile?.company_name} · {profile?.industry}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalCandidates}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Candidates ready for hire
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {profile?.company_name || "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {profile?.company_address || "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Industry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {profile?.industry || "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your business sector
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Contact Person</p>
                <p className="text-sm font-medium">
                  {profile?.full_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm">{profile?.email || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Company Name</p>
                <p className="text-sm">{profile?.company_name || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Industry</p>
                <p className="text-sm">{profile?.industry || "—"}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground">Company Address</p>
                <p className="text-sm">{profile?.company_address || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
