"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";
import {
  Pen,
  Save,
  Loader,
  ChartNoAxesGantt,
  User,
  MapPin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  phone: string | null;
  birthdate: string | null;
  address: string | null;
  bio: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  position: string | null;
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
  position: string;
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
  position: "",
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
      position: data.position || "",
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
      position: form.position,
      avatar_url: avatarUrl,
    };

    const POSITIONS = [
      "Barber",
      "Vehicle Spray Painter",
      "Landscape Gardener",
      "Mechanical Fitter",
    ];

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

      <main className="flex-1 p-5 md:p-10 bg-neutral-50">
        <h1 className="text-2xl font-semibold">Set up your Profile</h1>
        <p className="mb-10 text-sm text-muted-foreground">
          Keep your profile information up to date
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Profile Photo Card */}
          <div className="flex flex-col gap-5">
            <Card className="lg:col-span-1 relative rounded-2xl">
              <div className="bg-neutral-200 h-30 absolute w-full"></div>
              <CardContent className="flex flex-col items-center gap-4 mb-5">
                {/* Avatar */}
                <div className="relative w-32 h-32 mt-10 rounded-full overflow-hidden bg-muted border-5 border-white">
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
                    className="md:w-[50%] hover:bg-black/5"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleAvatarChange}
                  />
                )}

                {/* Basic Info */}
                <div className="text-center flex gap-2 flex-col">
                  <p className="font-semibold text-lg">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {profile?.role}:{" "}
                    <span className="text-xs border px-2 py-0.5 rounded-2xl font-medium text-green-600 bg-green-100">
                      {profile?.status}
                    </span>
                  </p>
                </div>
                
              </CardContent>
            </Card>
            <div className="bg-white border-neutral-300 rounded-2xl flex flex-col gap-5 border px-5 py-5">
              <Label>
                {" "}
                <ChartNoAxesGantt size={16} />
                About
              </Label>
              {editing ? (
                <textarea
                  placeholder="Tell us about yourself"
                  value={form.bio}
                  onChange={(e) => handleFormChange("bio", e.target.value)}
                  className="w-full text-sm min-h-25 bg-neutral-100"
                />
              ) : (
                <p className="rounded-lg min-h-25 text-sm">
                  {profile?.bio || "—"}
                </p>
              )}
            </div>
          </div>

          {/* Profile Details Card */}
          <Card className="lg:col-span-2 p-5 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="bg-neutral-100 p-1 rounded-md">
                  <User className="text-muted-foreground" />
                </div>
                Profile Details
              </CardTitle>
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pen />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {/* <Save />{saving ? "Saving..." : "Save Changes"} */}
                    {saving ? (
                      <>
                        <Loader /> Saving...
                      </>
                    ) : (
                      <>
                        <Save /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <Separator />

            <CardContent>
              {success && (
                <p className="text-green-500 text-sm mb-4">{success}</p>
              )}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">FULL NAME</Label>
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
                  <Label className="text-muted-foreground">EMAIL</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">PHONE NUMBER</Label>
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
                  <Label className="text-muted-foreground">GENDER</Label>
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
                  <Label className="text-muted-foreground">BIRTHDATE</Label>
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
                  <Label className="text-muted-foreground">HEIGHT (cm)</Label>
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
                  <Label className="text-muted-foreground">WEIGHT (kg)</Label>
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
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">POSITION</Label>
                  {editing ? (
                    <select
                      value={form.position}
                      onChange={(e) =>
                        handleFormChange("position", e.target.value)
                      }
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      
                      <option value="">Select Position</option>
                      <option value="Barber">Barber</option>
                      <option value="Vehicle Spray Painter">
                        Vehicle Spray Painter
                      </option>
                      <option value="Landscape Gardener">
                        Landscape Gardener
                      </option>
                      <option value="Mechanical Fitter">
                        Mechanical Fitter
                      </option>
                    </select>
                  ) : (
                    <p className="text-sm capitalize">
                      {profile?.position || "—"}
                    </p>
                  )}
                </div>

                <Separator className="flex flex-col md:col-span-2" />

                {/* Address */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label className="text-muted-foreground">ADDRESS</Label>
                  {editing ? (
                    <Input
                      placeholder="Enter address"
                      value={form.address}
                      onChange={(e) =>
                        handleFormChange("address", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm flex items-center gap-1">
                      <MapPin size={16} />
                      {profile?.address || "—"}
                    </p>
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
