"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string | null;
  birthdate: string | null;
  address: string | null;
  bio: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  avatar_url: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "client")
        .order("created_at", { ascending: false });

      if (!error && data) setUsers(data);
      setLoading(false);
    }

    fetchUsers();
  }, []);

  function calculateAge(birthdate: string | null) {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="flex">
      <SidebarNav role="admin" />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Candidates list total: ({users.length})</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading list...</p>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground">No list found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-6 items-start">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border shrink-0">
                      {user.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl text-muted-foreground">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* User Details */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Full Name
                        </p>
                        <p className="text-sm font-medium">
                          {user.full_name || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm">{user.email || "—"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm">{user.phone || "—"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="text-sm capitalize">
                          {user.gender || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Birthdate
                        </p>
                        <p className="text-sm">
                          {user.birthdate
                            ? `${formatDate(user.birthdate)} (${calculateAge(user.birthdate)} yrs)`
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Height</p>
                        <p className="text-sm">
                          {user.height ? `${user.height} cm` : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="text-sm">
                          {user.weight ? `${user.weight} kg` : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Joined</p>
                        <p className="text-sm">{formatDate(user.created_at)}</p>
                      </div>

                      <div className="col-span-2 md:col-span-4">
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm">{user.address || "—"}</p>
                      </div>

                      {user.bio && (
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-xs text-muted-foreground">Bio</p>
                          <p className="text-sm">{user.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
