"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";
import { UserCheck, Users, Building2, ShieldCheck, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Stats {
  totalClients: number;
  totalVerifiedEmployer: number;
  totalAdmins: number;
  totalAvailableClients: number;
}

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  position: string;
  role: string;
  status: string | null;
  avatar_url: string | null;
  verification_status: string | null;
  created_at: string;
}

interface PendingVerification {
  id: string;
  full_name: string;
  company_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalVerifiedEmployer: 0,
    totalAdmins: 0,
    totalAvailableClients: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<
    PendingVerification[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Total Clients
      const { count: totalClients } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client");

      // Total Verified Employers
      const { count: totalVerifiedEmployer } = await supabase
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
        .eq("status", "Available");

      setStats({
        totalClients: totalClients || 0,
        totalVerifiedEmployer: totalVerifiedEmployer || 0,
        totalAdmins: totalAdmins || 0,
        totalAvailableClients: totalAvailableClients || 0,
      });

      // Recent Users — 5 latest
      const { data: recentUsersData } = await supabase
        .from("profiles")
        .select("*")
        .neq("role", "admin")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentUsersData) setRecentUsers(recentUsersData);

      // Pending Verifications — 3 latest
      const { data: pendingData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "employer")
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false })
        .limit(3);

      if (pendingData) setPendingVerifications(pendingData);

      setLoading(false);
    }

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Available Clients",
      value: stats.totalAvailableClients,
      icon: <UserCheck size={20} className="text-green-600" />,
      description: "Clients ready for hire",
      color: "bg-green-50",
      valueColor: "text-green-500",
    },
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: <Users size={20} className="text-blue-600" />,
      description: "Registered client accounts",
      color: "bg-blue-50",
      valueColor: "text-blue-500",
    },
    {
      title: "Verified Employers",
      value: stats.totalVerifiedEmployer,
      icon: <Building2 size={20} className="text-purple-600" />,
      description: "Verified employer accounts",
      color: "bg-purple-50",
      valueColor: "text-purple-500",
    },
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: <ShieldCheck size={20} className="text-orange-600" />,
      description: "Administrator accounts",
      color: "bg-orange-50",
      valueColor: "text-orange-500",
    },
  ];

  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  function getStatusColor(user: RecentUser) {
    if (user.role === "employer") {
      if (user.verification_status === "verified") return "text-blue-400";
      if (user.verification_status === "pending") return "text-yellow-400";
      return "text-red-600";
    }
    if (user.status === "Available") return "text-green-400";
    if (user.status === "Not Available") return "text-red-400";
    return "text-muted-foreground";
  }

  function getStatusLabel(user: RecentUser) {
    if (user.role === "employer") {
      return user.verification_status || "Pending";
    }
    return user.status || "TBA";
  }

  return (
    <div className="flex">
      <SidebarNav role="admin" />

      <main className="flex-1 p-8 bg-neutral-50">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mb-10 text-sm text-muted-foreground">
          Overview of platform activity
        </p>
        {/* Stats Cards */}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {statCards.map((stat) => (
                <Card key={stat.title} className={`p-5 border-0 ring-0 ${stat.color}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between gap-2">
                      <span>{stat.title}</span>
                      <span className="bg-neutral-200 p-1 rounded-lg">
                        {stat.icon}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-5xl font-bold mb-3 ${stat.valueColor}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Users + Pending Verifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Recent Users — 2/3 width */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between px-10 py-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="bg-neutral-100 p-2 rounded-md">
                      <Users size={18} />
                    </div>
                    Recent Users
                  </CardTitle>
                  <Link href="/admin/users">
                    <span className="text-sm text-red-500 hover:underline cursor-pointer">
                      View all
                    </span>
                  </Link>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  {recentUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground flex justify-center min-h-20">
                      No users yet.
                    </p>
                  ) : (
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-neutral-200">
                        <tr className="text-xs text-muted-foreground border-b">
                          <th className="text-left py-4 font-medium pl-15">
                            USER
                          </th>
                          <th className="text-left py-4 font-medium">POSITION</th>
                          <th className="text-left py-4 font-medium">ROLE</th>
                          <th className="text-left py-4 font-medium">STATUS</th>
                          <th className="text-left py-4 font-medium">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((user) => (
                          <tr key={user.id} className="border-b last:border-0">
                            {/* Avatar + Name */}
                            <td className="py-3 pl-10">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border shrink-0">
                                  {user.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={user.avatar_url}
                                      alt={user.full_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {user.full_name
                                          ?.charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium">
                                  {user.full_name}
                                </span>
                              </div>
                            </td>

                            {/* position */}
                            <td className="py-3 text-muted-foreground capitalize">
                              {user.position}
                            </td>

                            {/* Role */}
                            <td className="py-3 text-muted-foreground capitalize">
                              {user.role}
                            </td>

                            {/* Status */}
                            <td className="py-3">
                              <span
                                className={`font-medium capitalize ${getStatusColor(user)}`}
                              >
                                {getStatusLabel(user)}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="py-3">
                              <Link href="/admin/users">
                                <span className="text-red-500 hover:underline cursor-pointer text-sm">
                                  View
                                </span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Pending Verifications — 1/3 width */}
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pt-6 px-6">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="bg-neutral-100 p-2 rounded-md">
                      <Clock size={18} />
                    </div>
                    Pending Verifications
                  </CardTitle>
                  <Link href="/admin/pending-verifications">
                    <span className="text-orange-500 font-semibold text-lg hover:underline cursor-pointer">
                      {pendingVerifications.length}
                    </span>
                  </Link>
                </CardHeader>
                <Separator />
                <CardContent className="h-full">
                  {pendingVerifications.length === 0 ? (
                    <div className="h-full flex items-center justify-center bg-neutral-100 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        No pending verifications.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {pendingVerifications.map((employer) => (
                        <div key={employer.id} className="flex flex-col">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            {/* Avatar + Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-muted border shrink-0">
                                {employer.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={employer.avatar_url}
                                    alt={employer.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {employer.full_name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {employer.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {employer.company_name ||
                                    "Employer Verification"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {timeAgo(employer.created_at)}
                                </p>
                              </div>
                            </div>

                            {/* Review Button */}
                            <Link href="/admin/pending-verifications">
                              <Button
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                Review
                              </Button>
                            </Link>
                          </div>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
