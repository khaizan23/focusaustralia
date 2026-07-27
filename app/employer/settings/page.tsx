"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";
import { Building2, AlertTriangle, Eye, EyeOff, Shield } from "lucide-react";

interface EmployerProfile {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  company_address: string | null;
  industry: string | null;
  avatar_url: string | null;
}

interface CompanyForm {
  full_name: string;
  company_name: string;
  company_address: string;
  industry: string;
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_COMPANY_FORM: CompanyForm = {
  full_name: "",
  company_name: "",
  company_address: "",
  industry: "",
};

const INITIAL_PASSWORD_FORM: PasswordForm = {
  newPassword: "",
  confirmPassword: "",
};

export default function EmployerSettingsPage() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyForm, setCompanyForm] =
    useState<CompanyForm>(INITIAL_COMPANY_FORM);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(
    INITIAL_PASSWORD_FORM,
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Show/hide password
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Confirmation modals
  const [companyConfirmModal, setCompanyConfirmModal] = useState(false);
  const [passwordConfirmModal, setPasswordConfirmModal] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState(false);

  // Loading states
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [deleteLogoModal, setDeleteLogoModal] = useState(false);

  // Success/Error states
  const [companySuccess, setCompanySuccess] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Logo Upload State 
  const [logoSelected, setLogoSelected] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);

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
        setCompanyForm({
          full_name: data.full_name || "",
          company_name: data.company_name || "",
          company_address: data.company_address || "",
          industry: data.industry || "",
        });
      }

      setLoading(false);
    }

    fetchProfile();
  }, []);

  const handleCompanyFormChange = useCallback(
    (field: keyof CompanyForm, value: string) => {
      setCompanyForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handlePasswordFormChange = useCallback(
    (field: keyof PasswordForm, value: string) => {
      setPasswordForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setLogoSelected(true)
    },
    [],
  );

  const handleDeleteLogo = useCallback(async () => {
    setDeletingLogo(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (profile?.avatar_url) {
      const url = new URL(profile.avatar_url)
      const pathParts = url.pathname.split("/logos/")

      if (pathParts[1]) {
        const filePath = pathParts[1]

       await supabase.storage
        .from("logos")
        .remove([filePath])
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : null));
      setLogoFile(null);
      setLogoPreview(null);
    }

    setDeletingLogo(false);
  }, [profile]);

  const handleOpenCompanyConfirm = useCallback(() => {
    setCompanyError("");
    setCompanySuccess("");
    if (!companyForm.company_name) {
      setCompanyError("Company name is required");
      return;
    }
    setCompanyConfirmModal(true);
  }, [companyForm]);

  const handleOpenPasswordConfirm = useCallback(() => {
    setPasswordError("");
    setPasswordSuccess("");
    if (!passwordForm.newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordConfirmModal(true);
  }, [passwordForm]);
  
  const handleSaveLogo = useCallback(async () => {
    if (!logoFile) return;
    setSavingLogo(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const filePath = `${user.id}/logo-${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, logoFile, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
      setLogoFile(null);
      setLogoPreview(null);
      setLogoSelected(false);
    }

    setSavingLogo(false);
  }, [logoFile]);

  const handleCancelLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoSelected(false);
  }, []);

  const handleSaveCompany = useCallback(async () => {
    setSavingCompany(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: companyForm.full_name,
        company_name: companyForm.company_name,
        company_address: companyForm.company_address,
        industry: companyForm.industry,
        
      })
      .eq("id", user.id);

    if (error) {
      setCompanyError(error.message);
    } else {
      setProfile((prev) => (prev ? { ...prev, ...companyForm } : null));
      setCompanySuccess("Company profile updated successfully!");
    }

    setSavingCompany(false);
  }, [companyForm]);

  const handleChangePassword = useCallback(async () => {
    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm(INITIAL_PASSWORD_FORM);
    }

    setSavingPassword(false);
  }, [passwordForm]);

  const handleDeactivate = useCallback(async () => {
    setDeactivating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: "deactivated" })
      .eq("id", user.id);

    if (!error) {
      await supabase.auth.signOut();
      document.cookie =
        "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    }

    setDeactivating(false);
    setDeactivateModal(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <SidebarNav role="employer" />
        <main className="flex-1 p-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-neutral-50">
      <SidebarNav role="employer" />

      <main className="flex-1 p-5 md:p-10 mt-10 md:mt-0 max-w-5xl overflow-hidden">
        {/* Page Header */}
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Manage your company profile and account settings
        </p>

        {/* Section 1 — Company Logo */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-base font-semibold">Company Logo</h2>
            <p className="text-sm text-muted-foreground">PNG, JPEG under 5MB</p>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Logo Preview */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border shrink-0">
                {logoPreview || profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview || profile?.avatar_url || ""}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={24} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {profile?.company_name || "Company Logo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, JPEG, PNG accepted
                </p>
              </div>
            </div>

            {/* Buttons — depende sa state */}
            <div className="flex gap-2 shrink-0">
              {!logoSelected ? (
                // Default — Upload + Delete
                <div className="flex flex-col md:flex-row gap-2 shrink-0">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <span className="inline-flex items-center px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      Upload new picture
                    </span>
                  </label>
                  <Button
                    className="text-red-600 my-1"
                    variant="outline"
                    onClick={() => setDeleteLogoModal(true)}
                    disabled={
                      deletingLogo || (!profile?.avatar_url && !logoPreview)
                    }
                  >
                    {deletingLogo ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              ) : (
                // May selected na file — Save + Cancel
                <div className="flex flex-col md:flex-row gap-2 shrink-0">
                  <Button onClick={handleSaveLogo} disabled={savingLogo}>
                    {savingLogo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    className="text-red-600 hover:text-red-500"
                    variant="outline"
                    onClick={handleCancelLogo}
                    disabled={savingLogo}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Section 2 — Company Profile */}
          <div>
            <h2 className="text-base font-semibold">Company Profile</h2>
            <p className="text-sm text-muted-foreground">
              Update your company information visible to candidates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">
                Contact Person
              </Label>
              <Input
                className="bg-white"
                placeholder="Enter full name"
                value={companyForm.full_name}
                onChange={(e) =>
                  handleCompanyFormChange("full_name", e.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="flex items-center h-8 px-2.5 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
                {profile?.email}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">
                Company Name *
              </Label>
              <Input
                className="bg-white"
                placeholder="Enter company name"
                value={companyForm.company_name}
                onChange={(e) =>
                  handleCompanyFormChange("company_name", e.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Industry</Label>
              <Input
                className="bg-white"
                placeholder="Enter industry"
                value={companyForm.industry}
                onChange={(e) =>
                  handleCompanyFormChange("industry", e.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label className="text-sm text-muted-foreground">
                Company Address
              </Label>
              <Input
                className="bg-white"
                placeholder="Enter company address"
                value={companyForm.company_address}
                onChange={(e) =>
                  handleCompanyFormChange("company_address", e.target.value)
                }
              />
            </div>
          </div>

          {companyError && (
            <p className="text-red-500 text-sm">{companyError}</p>
          )}
          {companySuccess && (
            <p className="text-green-500 text-sm">{companySuccess}</p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleOpenCompanyConfirm} disabled={savingCompany}>
              Save Changes
            </Button>
          </div>

          <Separator />

          {/* Section 3 — Change Password */}
          <div>
            <h2 className="text-base font-semibold">Password</h2>
            <p className="text-sm text-muted-foreground">
              Modify your current password
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordFormChange("newPassword", e.target.value)
                  }
                  className="pr-10 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordFormChange("confirmPassword", e.target.value)
                  }
                  className="pr-10 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-green-500 text-sm">{passwordSuccess}</p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleOpenPasswordConfirm}
              disabled={savingPassword}
            >
              Change Password
            </Button>
          </div>
          <div className="bg-neutral-200/70 rounded-2xl flex p-4">
            <div className="px-3">
              <Shield size={16} />
            </div>
            <div>
              <Label className="font-medium">Password Requirements</Label>
              <ul className="list-inside list-disc text-xs space-y-1 text-neutral-400 mt-1">
                <li>At least 8 characters long</li>
                <li>Include uppercase and lowercase letters</li>
                <li>At least one number or special character</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Section 4 — Danger Zone */}
          <div>
            <h2 className="text-base font-semibold text-red-600">
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground">
              Irreversible actions for your account
            </p>
          </div>

          <div className="flex justify-between items-center p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <p className="text-sm font-medium">Deactivate Account</p>
              <p className="text-xs text-muted-foreground mr-2">
                Temporarily deactivate your account. If you want to reactivate
                it later, please contact the administrator.
              </p>
            </div>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white shrink-0"
              onClick={() => setDeactivateModal(true)}
            >
              Deactivate
            </Button>
          </div>
        </div>

        {/* Delete Logo Confirmation Modal */}
        {deleteLogoModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Delete Company Logo</h2>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete your company logo? This action
                cannot be undone.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteLogoModal(false)}
                  disabled={deletingLogo}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={async () => {
                    setDeleteLogoModal(false);
                    await handleDeleteLogo();
                  }}
                  disabled={deletingLogo}
                >
                  {deletingLogo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete Logo"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Company Profile Confirmation Modal */}
        {companyConfirmModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Save Company Profile</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to save changes to your company profile?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCompanyConfirmModal(false)}
                  disabled={savingCompany}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    setCompanyConfirmModal(false);
                    await handleSaveCompany();
                  }}
                  disabled={savingCompany}
                >
                  {savingCompany ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Confirmation Modal */}
        {passwordConfirmModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to change your password? You will need to
                use your new password next time you log in.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPasswordConfirmModal(false)}
                  disabled={savingPassword}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    setPasswordConfirmModal(false);
                    await handleChangePassword();
                  }}
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Changing...
                    </div>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Confirmation Modal */}
        {deactivateModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} />
                <h2 className="text-lg font-semibold">Deactivate Account</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to deactivate your account? You will be
                logged out and will not be able to access the platform until an
                admin reactivates your account.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeactivateModal(false)}
                  disabled={deactivating}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleDeactivate}
                  disabled={deactivating}
                >
                  {deactivating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deactivating...
                    </div>
                  ) : (
                    "Deactivate Account"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
