"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import SidebarNav from "@/components/ui/sidebar-nav"
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,  
  TrashIcon,
  Download,
} from "lucide-react";

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  birthdate: string | null
  gender: string | null
  height: number | null
  weight: number | null
  address: string | null
  bio: string | null
  avatar_url: string | null
  status: string | null
  position: string | null
  role: string
  created_at: string
}

interface ClientFile {
  id: string
  title: string
  file_path: string
  file_size: number
  file_type: string | null
  created_at: string
}

interface VideoLink {
  id: string
  title: string
  description: string | null
  url: string
  created_at: string
}

interface Experience {
  id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  employment_type: string | null;
  job_description: string | null;
  is_current: boolean;
  start_month: string | null;
  start_year: string | null;
  end_month: string | null;
  end_year: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [userExperiences, setUserExperiences] = useState<Experience[]>([]);

  // View Profile Modal
  const [viewModal, setViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [userFiles, setUserFiles] = useState<ClientFile[]>([])
  const [userLinks, setUserLinks] = useState<VideoLink[]>([])
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "client")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setUsers(data)
        setFilteredUsers(data)
      }

      setLoading(false)
    }

    fetchUsers()
  }, [])

  // Search handler
  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    if (!value.trim()) {
      setFilteredUsers(users)
      return
    }
    const filtered = users.filter((user) =>
      user.full_name?.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users])

  // View Profile
  const handleViewProfile = useCallback(async (user: Profile) => {
    setSelectedUser(user);
    setViewModal(true);
    setLoadingProfile(true);

    // Fetch files
    const { data: filesData } = await supabase
      .from("clientfile")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filesData) setUserFiles(filesData);

    // Fetch links
    const { data: linksData } = await supabase
      .from("video_links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (linksData) setUserLinks(linksData);

    // Fetch experiences
    const { data: expData } = await supabase
      .from("experiences")
      .select("*")
      .eq("user_id", user.id)
      .order("start_year", { ascending: false });

    if (expData) setUserExperiences(expData);

    setLoadingProfile(false);
  }, [])

  // Download file
  const handleDownload = useCallback(async (filePath: string, title: string) => {
    const { data, error } = await supabase.storage
      .from("videos")
      .download(filePath)

    if (error) return

    const url = URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = title
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // Show delete confirmation
  const handleShowDelete = useCallback((user: Profile) => {
    setUserToDelete(user)
    setDeleteModal(true)
  }, [])

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    setDeleting(true);

    // Get current admin info
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();
    if (!adminUser) return;

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", adminUser.id)
      .single();

    // Delete user files from storage
    const { data: files } = await supabase
      .from("clientfile")
      .select("file_path")
      .eq("user_id", userToDelete.id);

    if (files && files.length > 0) {
      const filePaths = files.map((f) => f.file_path);
      await supabase.storage.from("videos").remove(filePaths);
    }

    // Delete from tables
    await supabase.from("clientfile").delete().eq("user_id", userToDelete.id);
    await supabase.from("video_links").delete().eq("user_id", userToDelete.id);
    await supabase.from("experiences").delete().eq("user_id", userToDelete.id);
    await supabase.from("profiles").delete().eq("id", userToDelete.id);

    // I-delete sa auth.users gamit ang API route
    await fetch("/api/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userToDelete.id }),
    });

    // Log the deletion
    await supabase.from("audit_logs").insert({
      action: "DELETE_USER",
      target_id: userToDelete.id,
      target_name: userToDelete.full_name,
      performed_by: adminUser.id,
      performed_by_name: adminProfile?.full_name,
    });

    // Log the deletion
    // const { error: logError } = await supabase.from("audit_logs").insert({
    //   action: "DELETE_USER",
    //   target_id: userToDelete.id,
    //   target_name: userToDelete.full_name,
    //   performed_by: adminUser.id,
    //   performed_by_name: adminProfile?.full_name,
    // });

    // console.log("Audit log error:", logError);
    // console.log("Audit log inserted for:", userToDelete.full_name);

    // Update UI
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setFilteredUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setDeleting(false);
    setDeleteModal(false);
    setUserToDelete(null);
  }, [userToDelete]);

  function calculateAge(birthdate: string | null) {
    if (!birthdate) return null
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="flex">
      <SidebarNav role="admin" />

      <main className="flex-1 p-8 bg-neutral-50">
        {/* Table */}
        <div className="rounded-xl border">
          <div className="flex justify-between px-5 py-3 bg-red-900 rounded-t-xl">
            <div className="text-md text-white">
              <span className="font-light text-sm">👥 Total Candidates:</span>{" "}
              {filteredUsers.length} candidates
            </div>
            <div className="w-64">
              <Input
                placeholder="Search by name..."
                className="rounded bg-white"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex w-full max-w-xs flex-col gap-7 my-5 mx-10">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ) : // <p className="text-muted-foreground">Loading users...</p>
          filteredUsers.length === 0 ? (
            <div className="flex justify-center items-center p-10 bg-black/5 min-h-80">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              {/* Table Header */}
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Position</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 font-medium">Birthdate</th>
                  <th className="text-left px-4 py-3 font-medium">Gender</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={
                      index % 2 === 0 ? "bg-background" : "bg-muted/40"
                    }
                  >
                    {/* Name with Avatar */}
                    <td className="px-4 py-3">
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
                                {user.full_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{user.full_name}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full border text-xs font-medium bg-green-100 text-green-700">
                        {user.status || "TBA"}
                      </span>
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.position || "TBA"}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.birthdate
                        ? `${formatDate(user.birthdate)} (${calculateAge(user.birthdate)} yrs)`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {user.gender || "—"}
                    </td>

                    {/* Actions — 3 dots */}
                    <td className="px-4 py-3">
                      <ActionMenu
                        onView={() => handleViewProfile(user)}
                        onDelete={() => handleShowDelete(user)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* View Profile Modal */}
        {viewModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 z-10 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center py-3 px-5 border-b sticky top-0 bg-card">
                <h2 className="text-lg font-semibold">Client Details</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewModal(false);
                    setSelectedUser(null);
                    setUserFiles([]);
                    setUserLinks([]);
                    setUserExperiences([]);
                  }}
                >
                  Close
                </Button>
              </div>

              {loadingProfile ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="p-6 flex flex-col gap-6">
                  {/* Profile Photo */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border">
                      {selectedUser.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedUser.avatar_url}
                          alt={selectedUser.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl text-muted-foreground">
                            {selectedUser.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg">
                        {selectedUser.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm border rounded-sm p-1">
                        {selectedUser.phone || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="text-sm capitalize border rounded-sm p-1">
                        {selectedUser.gender || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Birthdate</p>
                      <p className="text-sm border rounded-sm p-1">
                        {selectedUser.birthdate
                          ? `${formatDate(selectedUser.birthdate)} (${calculateAge(selectedUser.birthdate)} yrs)`
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Height / Weight
                      </p>
                      <p className="text-sm border rounded-sm p-1">
                        {selectedUser.height
                          ? `${selectedUser.height} cm`
                          : "—"}{" "}
                        /
                        {selectedUser.weight
                          ? ` ${selectedUser.weight} kg`
                          : " —"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm border rounded-sm p-1">
                        {selectedUser.address || "—"}
                      </p>
                    </div>

                    {selectedUser.bio && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Bio</p>
                        <p className="text-sm border rounded-sm p-1 min-h-20 overflow-clip">
                          {selectedUser.bio}
                        </p>
                      </div>
                    )}
                  </div>
                  <Separator />
                  {/* Experience */}
                  <div>
                    <h3 className="font-semibold mb-3">👷 Experience</h3>
                    {userExperiences.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No experience added.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {userExperiences.map((exp) => (
                          <div
                            key={exp.id}
                            className="p-3 rounded-lg border flex flex-col gap-1"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">
                                  {exp.job_title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {exp.company_name}
                                  {exp.location ? ` · ${exp.location}` : ""}
                                  {exp.employment_type
                                    ? ` · ${exp.employment_type}`
                                    : ""}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {exp.start_month} {exp.start_year} —{" "}
                                  {exp.is_current
                                    ? "Present"
                                    : `${exp.end_month} ${exp.end_year}`}
                                </p>
                              </div>
                              {exp.is_current && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            {exp.job_description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {exp.job_description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Separator />
                  {/* Documents */}
                  <div>
                    <h3 className="font-semibold mb-3">📑 Documents</h3>
                    {userFiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No documents uploaded.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {userFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex justify-between items-center p-3 rounded-lg border"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                📄 {file.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.file_size)} ·{" "}
                                {formatDate(file.created_at)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleDownload(file.file_path, file.title)
                              }
                            >
                              <Download />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Links */}
                  <div>
                    <h3 className="font-semibold mb-3">🎬 Video Links</h3>
                    {userLinks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No video links added.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {userLinks.map((link) => (
                          <div
                            key={link.id}
                            className="flex justify-between items-center p-3 rounded-lg border"
                          >
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium">
                                🎥 {link.title}
                              </p>
                              {link.description && (
                                <p className="text-xs text-muted-foreground">
                                  {link.description}
                                </p>
                              )}
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                {link.url}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Delete User</h2>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  "{userToDelete.full_name}"
                </span>
                ? This will also delete all their files, links, and experiences.
                This action cannot be undone.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete User"
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

// 3 dots Action Menu Component
function ActionMenu({
  onView,
  onDelete,
}: {
  onView: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex justify-center">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-1 bg-black/20"
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-10 px-1 top-8 z-50 bg-card border rounded-lg shadow-lg w-48 py-1">
            <button
              onClick={() => {
                onView();
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors rounded-lg flex items-center gap-1"
            >
              {/* 👁  */}
              <Eye size={16}/>
              View Profile
            </button>
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm  hover:bg-red-100 transition-colors rounded-lg flex items-center text-red-500 gap-1"
            >
              {/* 🗑  */}
              <TrashIcon size={16} />
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
}