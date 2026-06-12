"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import SidebarNav from "@/components/ui/sidebar-nav"

interface ClientFile {
  id: string
  title: string
  description: string | null
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

interface DeleteModal {
  show: boolean
  type: "file" | "link" | null
  id: string
  filePath?: string
  title: string
}

export default function UploadPage() {
  // Documents state
  const [files, setFiles] = useState<ClientFile[]>([])
  const [fileTitle, setFileTitle] = useState("")
  const [fileDescription, setFileDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileError, setFileError] = useState("")
  const [fileSuccess, setFileSuccess] = useState("")

  // Video links state
  const [links, setLinks] = useState<VideoLink[]>([])
  const [linkTitle, setLinkTitle] = useState("")
  const [linkDescription, setLinkDescription] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [savingLink, setSavingLink] = useState(false)
  const [linkError, setLinkError] = useState("")
  const [linkSuccess, setLinkSuccess] = useState("")

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    show: false,
    type: null,
    id: "",
    title: ""
  })
  const [deleting, setDeleting] = useState(false)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: filesData } = await supabase
        .from("clientfile")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (filesData) setFiles(filesData)

      const { data: linksData } = await supabase
        .from("video_links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (linksData) setLinks(linksData)

      setLoading(false)
    }

    fetchData()
  }, [])

  // Upload document
  const handleFileUpload = useCallback(async () => {
    setFileError("")
    setFileSuccess("")

    if (!selectedFile) {
      setFileError("Please select a file")
      return
    }
    if (!fileTitle) {
      setFileError("Please enter a title")
      return
    }

    setUploadingFile(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const filePath = `${user.id}/documents/${Date.now()}-${selectedFile.name}`

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, selectedFile)

    if (uploadError) {
      setFileError(uploadError.message)
      setUploadingFile(false)
      return
    }

    const { data, error: dbError } = await supabase
      .from("clientfile")
      .insert({
        user_id: user.id,
        title: fileTitle,
        description: fileDescription || null,
        file_path: filePath,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
      })
      .select()
      .single()

    if (dbError) {
      setFileError(dbError.message)
    } else {
      setFiles(prev => [data, ...prev])
      setFileTitle("")
      setFileDescription("")
      setSelectedFile(null)
      setFileSuccess("File uploaded successfully!")
    }

    setUploadingFile(false)
  }, [selectedFile, fileTitle, fileDescription])

  // Add video link
  const handleAddLink = useCallback(async () => {
    setLinkError("")
    setLinkSuccess("")

    if (!linkTitle) {
      setLinkError("Please enter a title")
      return
    }
    if (!linkUrl) {
      setLinkError("Please enter a URL")
      return
    }

    setSavingLink(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("video_links")
      .insert({
        user_id: user.id,
        title: linkTitle,
        description: linkDescription || null,
        url: linkUrl,
      })
      .select()
      .single()

    if (error) {
      setLinkError(error.message)
    } else {
      setLinks(prev => [data, ...prev])
      setLinkTitle("")
      setLinkDescription("")
      setLinkUrl("")
      setLinkSuccess("Link added successfully!")
    }

    setSavingLink(false)
  }, [linkTitle, linkDescription, linkUrl])

  // Show delete confirmation
  const handleShowDeleteFile = useCallback((
    id: string,
    filePath: string,
    title: string
  ) => {
    setDeleteModal({ show: true, type: "file", id, filePath, title })
  }, [])

  const handleShowDeleteLink = useCallback((id: string, title: string) => {
    setDeleteModal({ show: true, type: "link", id, title })
  }, [])

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    setDeleting(true)

    if (deleteModal.type === "file") {
      await supabase.storage.from("videos").remove([deleteModal.filePath!])
      const { error } = await supabase
        .from("clientfile")
        .delete()
        .eq("id", deleteModal.id)
      if (!error) setFiles(prev => prev.filter(f => f.id !== deleteModal.id))
    }

    if (deleteModal.type === "link") {
      const { error } = await supabase
        .from("video_links")
        .delete()
        .eq("id", deleteModal.id)
      if (!error) setLinks(prev => prev.filter(l => l.id !== deleteModal.id))
    }

    setDeleting(false)
    setDeleteModal({ show: false, type: null, id: "", title: "" })
  }, [deleteModal])

  const handleCancelDelete = useCallback(() => {
    setDeleteModal({ show: false, type: null, id: "", title: "" })
  }, [])

  // Download document
  const handleFileDownload = useCallback(async (
    filePath: string,
    title: string
  ) => {
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

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex">
      <SidebarNav role="client" />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">My Files & Links</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — Documents Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">📄 Documents</h2>

            {/* Upload Form */}
            <Card>
              <CardContent className="pt-4 flex flex-col gap-4">

                <div className="flex flex-col gap-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Ex. My CV"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Optional description"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>File (PDF, DOC, DOCX)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                {fileError && (
                  <p className="text-red-500 text-sm">{fileError}</p>
                )}
                {fileSuccess && (
                  <p className="text-green-500 text-sm">{fileSuccess}</p>
                )}

                <Button
                  className="w-full"
                  onClick={handleFileUpload}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : "Upload Document"}
                </Button>

              </CardContent>
            </Card>

            {/* Documents List */}
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : files.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No documents uploaded yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {files.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-2">

                        <div className="flex flex-col gap-1 flex-1">
                          <p className="font-medium text-sm">📄 {file.title}</p>
                          {file.description && (
                            <p className="text-xs text-muted-foreground">
                              {file.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)} · {formatDate(file.created_at)}
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            onClick={() => handleFileDownload(
                              file.file_path,
                              file.title
                            )}
                          >
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleShowDeleteFile(
                              file.id,
                              file.file_path,
                              file.title
                            )}
                          >
                            Delete
                          </Button>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Video Links Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">🎥 Video Links</h2>

            {/* Add Link Form */}
            <Card>
              <CardContent className="pt-4 flex flex-col gap-4">

                <div className="flex flex-col gap-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Ex. My Introduction Video"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Optional description"
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Video URL *</Label>
                  <Input
                    placeholder="Ex. https://drive.google.com/..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>

                {linkError && (
                  <p className="text-red-500 text-sm">{linkError}</p>
                )}
                {linkSuccess && (
                  <p className="text-green-500 text-sm">{linkSuccess}</p>
                )}

                <Button
                  className="w-full"
                  onClick={handleAddLink}
                  disabled={savingLink}
                >
                  {savingLink ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : "Add Video Link"}
                </Button>

              </CardContent>
            </Card>

            {/* Links List */}
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : links.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No video links added yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-2">

                        <div className="flex flex-col gap-1 flex-1">
                          <p className="font-medium text-sm">🎥 {link.title}</p>
                          {link.description && (
                            <p className="text-xs text-muted-foreground">
                              {link.description}
                            </p>
                          )}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate max-w-xs"
                          >
                            {link.url}
                          </a>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(link.created_at)}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          className="shrink-0"
                          onClick={() => handleShowDeleteLink(link.id, link.title)}
                        >
                          Delete
                        </Button>

                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">

              <h2 className="text-lg font-semibold">Delete Confirmation</h2>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  "{deleteModal.title}"
                </span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelDelete}
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
                  ) : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}