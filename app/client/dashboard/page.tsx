"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
}

interface FormState {
  full_name: string;
  phone: string;
  birthdate: string;
  address: string;
  bio: string;
  gender: string;
  height: string;
  weight: string;
}

const INITIAL_FORM: FormState = {
  full_name: "",
  phone: "",
  birthdate: "",
  address: "",
  bio: "",
  gender: "",
  height: "",
  weight: "",
};

export default function ClientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // I-populate ang form mula sa profile
  const populateForm = useCallback((data: Profile) => {
    setForm({
      full_name: data.full_name || "",
      phone: data.phone || "",
      birthdate: data.birthdate || "",
      address: data.address || "",
      bio: data.bio || "",
      gender: data.gender || "",
      height: data.height?.toString() || "",
      weight: data.weight?.toString() || "",
    });
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        populateForm(data);
      }

      setLoading(false);
    }

    fetchProfile();
  }, [populateForm]);

  // Single handler para sa lahat ng form inputs
  const handleFormChange = useCallback(
    (field: keyof FormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
    // I-reset ang form sa current profile data
    if (profile) populateForm(profile);
  }, [profile, populateForm]);

  const handleSave = useCallback(async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let avatarUrl = profile?.avatar_url || "";

    // I-upload ang avatar kung may bagong photo
    if (avatarFile) {
      const filePath = `${user.id}/avatar-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
      }
    }

    const updates = {
      full_name: form.full_name,
      phone: form.phone,
      birthdate: form.birthdate || null,
      address: form.address,
      bio: form.bio,
      gender: form.gender,
      height: form.height ? parseFloat(form.height) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      avatar_url: avatarUrl,
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      // I-update ang local state — hindi na kailangan mag-fetch ulit
      const updatedProfile = { ...profile!, ...updates, avatar_url: avatarUrl };
      setProfile(updatedProfile);
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    }

    setSaving(false);
  }, [form, avatarFile, profile]);

  function calculateAge(birthdate: string) {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  if (loading) {
    return (
      <div className="flex">
        <SidebarNav role="client" />
        <main className="flex-1 p-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <SidebarNav role="client" />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo Card */}
          <Card className="lg:col-span-1 py-4">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border">
                {avatarPreview || profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview || profile?.avatar_url || ""}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground">
                      {profile?.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {editing && (
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleAvatarChange}
                />
              )}

              {/* Basic Info */}
              <div className="text-center">
                <p className="font-semibold text-lg">{profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.email}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {profile?.role}
                </p>
              </div>
              {/* Bio */}
              <div className="flex w-full flex-col gap-2 md:col-span-2">
                <Label>About</Label>
                {editing ? (
                  <textarea
                    placeholder="Tell us about yourself"
                    value={form.bio}
                    onChange={(e) => handleFormChange("bio", e.target.value)}
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm min-h-25"
                  />
                ) : (
                  <p className="border rounded-lg min-h-25 text-sm px-2.5 py-2">
                    {profile?.bio || "—"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="lg:col-span-2 py-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Details</CardTitle>
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent>
              {success && (
                <p className="text-green-500 text-sm mb-4">{success}</p>
              )}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <Label>Full Name:</Label>
                  {editing ? (
                    <Input
                      value={form.full_name}
                      onChange={(e) =>
                        handleFormChange("full_name", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm">{profile?.full_name || "—"}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label>Email:</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <Label>Phone Number:</Label>
                  {editing ? (
                    <Input
                      placeholder="Enter phone number"
                      value={form.phone}
                      onChange={(e) =>
                        handleFormChange("phone", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm">{profile?.phone || "—"}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-2">
                  <Label>Gender:</Label>
                  {editing ? (
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        handleFormChange("gender", e.target.value)
                      }
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm capitalize">
                      {profile?.gender || "—"}
                    </p>
                  )}
                </div>

                {/* Birthdate */}
                <div className="flex flex-col gap-2">
                  <Label>Birthdate:</Label>
                  {editing ? (
                    <Input
                      type="date"
                      value={form.birthdate}
                      onChange={(e) =>
                        handleFormChange("birthdate", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {profile?.birthdate
                        ? `${new Date(profile.birthdate).toLocaleDateString(
                            "en-AU",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )} (Age: ${calculateAge(profile.birthdate)})`
                        : "—"}
                    </p>
                  )}
                </div>

                {/* Height */}
                <div className="flex flex-col gap-2">
                  <Label>Height (cm):</Label>
                  {editing ? (
                    <Input
                      type="number"
                      placeholder="Enter height in cm"
                      value={form.height}
                      onChange={(e) =>
                        handleFormChange("height", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {profile?.height ? `${profile.height} cm` : "—"}
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div className="flex flex-col gap-2">
                  <Label>Weight (kg):</Label>
                  {editing ? (
                    <Input
                      type="number"
                      placeholder="Enter weight in kg"
                      value={form.weight}
                      onChange={(e) =>
                        handleFormChange("weight", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {profile?.weight ? `${profile.weight} kg` : "—"}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label>Address:</Label>
                  {editing ? (
                    <Input
                      placeholder="Enter address"
                      value={form.address}
                      onChange={(e) =>
                        handleFormChange("address", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm">{profile?.address || "—"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
