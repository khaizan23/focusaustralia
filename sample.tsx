"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";

interface Stats {
  totalClients: number;
  totalVerifiedEmployers: number;
  totalAdmins: number;
  totalAvailableClients: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalVerifiedEmployers: 0,
    totalAdmins: 0,
    totalAvailableClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Total Clients
      const { count: totalClients } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client");

      // Total Verified Employers
      const { count: totalVerifiedEmployers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "employer")
        .eq("verification_status", "verified");

      // Total Admins
      const { count: totalAdmins } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      // Total Available Clients
      const { count: totalAvailableClients } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client")
        .eq("status", "available");

      setStats({
        totalClients: totalClients || 0,
        totalVerifiedEmployers: totalVerifiedEmployers || 0,
        totalAdmins: totalAdmins || 0,
        totalAvailableClients: totalAvailableClients || 0,
      });

      setLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: "👤",
      description: "Registered client accounts",
    },
    {
      title: "Verified Employers",
      value: stats.totalVerifiedEmployers,
      icon: "🏢",
      description: "Verified employer accounts",
    },
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: "🛡️",
      description: "Administrator accounts",
    },
    {
      title: "Available Clients",
      value: stats.totalAvailableClients,
      icon: "✅",
      description: "Clients ready for hire",
    },
  ];

  return (
    <div className="flex">
      <SidebarNav role="admin" />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span>{stat.icon}</span>
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
