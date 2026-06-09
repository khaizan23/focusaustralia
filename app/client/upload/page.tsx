"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";

const FILE_TYPES = {
  video: {
    label: "Video",
    accept: ".mp4,.mov,.avi,.mkv",
    icon: "🎥",
  },
  document: {
    label: "Document (CV, Resume)",
    accept: ".pdf,.doc,.docx",
    icon: "📄",
  },
  image: {
    label: "Image",
    accept: ".jpg,.jpeg,.png",
    icon: "🖼️",
  },
};

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<keyof typeof FILE_TYPES>("video");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload() {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!title) {
      setError("Please enter a title");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    const filePath = `${user.id}/${fileType}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("videos").insert({
      user_id: user.id,
      title,
      description,
      file_path: filePath,
      file_size: file.size,
      file_type: fileType,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setSuccess("File uploaded successfully!");
    setTitle("");
    setDescription("");
    setFile(null);
    setLoading(false);
  }

  return (
    <div className="flex">
      <SidebarNav role="client" />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Upload Files</h1>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Upload a File</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              {/* File Type Selector */}
              <div className="flex flex-col gap-2">
                <Label>File Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(FILE_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFileType(key as keyof typeof FILE_TYPES);
                        setFile(null);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-colors ${
                        fileType === key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted border-border"
                      }`}
                    >
                      <span className="text-2xl mb-1">{value.icon}</span>
                      <span>{value.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <Label>Title</Label>
                <Input
                  type="text"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <Label>Description</Label>
                <Input
                  type="text"
                  placeholder="Enter description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* File Input */}
              <div className="flex flex-col gap-2">
                <Label>
                  {FILE_TYPES[fileType].icon} Select{" "}
                  {FILE_TYPES[fileType].label}
                </Label>
                <Input
                  type="file"
                  accept={FILE_TYPES[fileType].accept}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name} (
                    {(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
