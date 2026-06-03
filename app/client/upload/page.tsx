"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import SidebarNav from "@/components/ui/sidebar-nav"

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleUpload() {
    setError("")
    setSuccess("")

    if (!file) {
      setError("Please select a video file")
      return
    }

    if (!title) {
      setError("Please enter a title")
      return
    }

    setLoading(true)

    // Kunin ang current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("Not logged in")
      setLoading(false)
      return
    }

    // I-upload ang video sa Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`
    
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    // I-save ang video metadata sa database
    const { error: dbError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        title,
        description,
        file_path: filePath,
        file_size: file.size,
      })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    setSuccess("Video uploaded successfully!")
    setTitle("")
    setDescription("")
    setFile(null)
    setLoading(false)
  }

  return (
    <div className="flex">
      <SidebarNav role="client" />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Upload Video</h1>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Upload a Video</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">

              <div className="flex flex-col gap-2">
                <Label>Title</Label>
                <Input
                  type="text"
                  placeholder="Enter video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Description</Label>
                <Input
                  type="text"
                  placeholder="Enter video description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Video File</Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              {success && (
                <p className="text-green-500 text-sm">{success}</p>
              )}

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Video"}
              </Button>

            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}