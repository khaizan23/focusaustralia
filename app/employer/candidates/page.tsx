"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import SidebarNav from "@/components/ui/sidebar-nav"

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
  created_at: string
}

interface ClientFile {
  id: string
  title: string
  file_path: string
  file_size: number
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
  id: string
  job_title: string
  company_name: string
  location: string | null
  employment_type: string | null
  job_description: string | null
  is_current: boolean
  start_month: string | null
  start_year: string | null
  end_month: string | null
  end_year: string | null
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Profile[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // View Profile Modal
  const [viewModal, setViewModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Profile | null>(null)
  const [candidateFiles, setCandidateFiles] = useState<ClientFile[]>([])
  const [candidateLinks, setCandidateLinks] = useState<VideoLink[]>([])
  const [candidateExperiences, setCandidateExperiences] = useState<Experience[]>([])
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    async function fetchCandidates() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "client")
        .eq("status", "Available")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setCandidates(data)
        setFilteredCandidates(data)
      }

      setLoading(false)
    }

    fetchCandidates()
  }, [])

  // Search handler
  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    if (!value.trim()) {
      setFilteredCandidates(candidates)
      return
    }
    const filtered = candidates.filter((c) =>
      c.full_name?.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredCandidates(filtered)
  }, [candidates])

  // View Profile
  const handleViewProfile = useCallback(async (candidate: Profile) => {
    setSelectedCandidate(candidate)
    setViewModal(true)
    setLoadingProfile(true)

    // Fetch files
    const { data: filesData } = await supabase
      .from("clientfile")
      .select("*")
      .eq("user_id", candidate.id)
      .order("created_at", { ascending: false })

    if (filesData) setCandidateFiles(filesData)

    // Fetch links
    const { data: linksData } = await supabase
      .from("video_links")
      .select("*")
      .eq("user_id", candidate.id)
      .order("created_at", { ascending: false })

    if (linksData) setCandidateLinks(linksData)

    // Fetch experiences
    const { data: expData } = await supabase
      .from("experiences")
      .select("*")
      .eq("user_id", candidate.id)
      .order("start_year", { ascending: false })

    if (expData) setCandidateExperiences(expData)

    setLoadingProfile(false)
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
      <SidebarNav role="employer" />

      <main className="flex-1 p-8">

        {/* Table */}
        <div className="rounded-xl border">
          <div className="flex justify-between px-5 py-3">
            <div className="text-sm">
              <span className="font-light">👥 Available Candidates:</span>{" "}
              {filteredCandidates.length} candidates
            </div>
            <div className="w-64">
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground p-4">Loading candidates...</p>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex justify-center items-center p-10 bg-muted/30 min-h-80">
              <p className="text-muted-foreground">No available candidates found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 font-medium">Birthdate</th>
                  <th className="text-left px-4 py-3 font-medium">Gender</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCandidates.map((candidate, index) => (
                  <tr
                    key={candidate.id}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/40"}
                  >
                    {/* Name with Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border shrink-0">
                          {candidate.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={candidate.avatar_url}
                              alt={candidate.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-muted-foreground font-medium">
                                {candidate.full_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{candidate.full_name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">{candidate.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{candidate.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {candidate.birthdate
                        ? `${formatDate(candidate.birthdate)} (${calculateAge(candidate.birthdate)} yrs)`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {candidate.gender || "—"}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {candidate.status || "Available"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="outline"
                        onClick={() => handleViewProfile(candidate)}
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* View Profile Modal */}
        {viewModal && selectedCandidate && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

              {/* Modal Header */}
              <div className="flex justify-between items-center py-3 px-5 border-b sticky top-0 bg-card">
                <h2 className="text-lg font-semibold">Candidate Profile</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewModal(false)
                    setSelectedCandidate(null)
                    setCandidateFiles([])
                    setCandidateLinks([])
                    setCandidateExperiences([])
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
                      {selectedCandidate.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedCandidate.avatar_url}
                          alt={selectedCandidate.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl text-muted-foreground">
                            {selectedCandidate.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg">{selectedCandidate.full_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedCandidate.email}</p>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm border rounded-sm p-1">{selectedCandidate.phone || "—"}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="text-sm capitalize border rounded-sm p-1">{selectedCandidate.gender || "—"}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Birthdate</p>
                      <p className="text-sm border rounded-sm p-1">
                        {selectedCandidate.birthdate
                          ? `${formatDate(selectedCandidate.birthdate)} (${calculateAge(selectedCandidate.birthdate)} yrs)`
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Height / Weight</p>
                      <p className="text-sm border rounded-sm p-1">
                        {selectedCandidate.height ? `${selectedCandidate.height} cm` : "—"} /
                        {selectedCandidate.weight ? ` ${selectedCandidate.weight} kg` : " —"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm border rounded-sm p-1">{selectedCandidate.address || "—"}</p>
                    </div>

                    {selectedCandidate.bio && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Bio</p>
                        <p className="text-sm border rounded-sm p-1 min-h-20">{selectedCandidate.bio}</p>
                      </div>
                    )}

                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="font-semibold mb-3">👷 Experience</h3>
                    {candidateExperiences.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No experience added.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {candidateExperiences.map((exp) => (
                          <div key={exp.id} className="p-3 rounded-lg border flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{exp.job_title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {exp.company_name}
                                  {exp.location ? ` · ${exp.location}` : ""}
                                  {exp.employment_type ? ` · ${exp.employment_type}` : ""}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {exp.start_month} {exp.start_year} —{" "}
                                  {exp.is_current ? "Present" : `${exp.end_month} ${exp.end_year}`}
                                </p>
                              </div>
                              {exp.is_current && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            {exp.job_description && (
                              <p className="text-xs text-muted-foreground mt-1">{exp.job_description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <div>
                    <h3 className="font-semibold mb-3">📑 Documents</h3>
                    {candidateFiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {candidateFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex justify-between items-center p-3 rounded-lg border"
                          >
                            <div>
                              <p className="text-sm font-medium">📄 {file.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.file_size)} · {formatDate(file.created_at)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => handleDownload(file.file_path, file.title)}
                            >
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
                    {candidateLinks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No video links added.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {candidateLinks.map((link) => (
                          <div
                            key={link.id}
                            className="flex justify-between items-center p-3 rounded-lg border"
                          >
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium">🎥 {link.title}</p>
                              {link.description && (
                                <p className="text-xs text-muted-foreground">{link.description}</p>
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

      </main>
    </div>
  )
}