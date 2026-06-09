"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  description: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

export default function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [playingTitle, setPlayingTitle] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [playerLoading, setPlayerLoading] = useState(false);

  function getVideoThumbnail(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = url;
      video.currentTime = 1;

      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg"));
        video.remove();
      };

      video.onerror = () => resolve(null);
    });
  }

  async function generateThumbnails(videos: Video[]) {
    const thumbs: Record<string, string> = {};

    for (const video of videos) {
      const { data } = await supabase.storage
        .from("videos")
        .createSignedUrl(video.file_path, 3600);

      if (data?.signedUrl) {
        const thumbnail = await getVideoThumbnail(data.signedUrl);
        if (thumbnail) thumbs[video.id] = thumbnail;
      }
    }

    setThumbnails(thumbs);
  }

  useEffect(() => {
    async function fetchVideos() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVideos(data);
        generateThumbnails(data);
      }
      setLoading(false);
    }

    fetchVideos();
  });

  async function handlePlay(filePath: string, title: string) {
    setPlayerLoading(true);
    setPlayingUrl(null);
    setPlayingTitle(title);

    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error("Error getting video URL:", error);
      setPlayerLoading(false);
      return;
    }

    setPlayingUrl(data.signedUrl);
    setPlayerLoading(false);
  }

  async function handleDownload(filePath: string, title: string) {
    const { data, error } = await supabase.storage
      .from("videos")
      .download(filePath);

    if (error) {
      console.error("Download error:", error);
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = title;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="flex">
      <SidebarNav role="client" />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">My Videos</h1>

        {/* Video Player Modal */}
        {(playingUrl || playerLoading) && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-4xl">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">{playingTitle}</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPlayingUrl(null);
                    setPlayingTitle("");
                    setPlayerLoading(false);
                  }}
                >
                  Close
                </Button>
              </div>

              {/* Video Player — fixed 16:9 ratio */}
              <div className="relative w-full aspect-video bg-black rounded-b-xl overflow-hidden">
                {playerLoading ? (
                  // Loading indicator
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-white text-sm">Loading video...</p>
                  </div>
                ) : (
                  <video
                    src={playingUrl!}
                    controls
                    className="w-full h-full"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground">No videos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden max-w-xs">
                {/* Thumbnail */}
                <div
                  className="relative w-full aspect-video bg-muted cursor-pointer group"
                  onClick={() => handlePlay(video.file_path, video.title)}
                >
                  {thumbnails[video.id] ? (
                    <Image
                      src={thumbnails[video.id]}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Loading thumbnail...
                      </p>
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-3">
                      <svg
                        className="w-6 h-6 text-black"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <CardContent className="pt-4">
                  <div className="flex flex-col gap-2">
                    <h2 className="font-semibold text-base">{video.title}</h2>

                    {video.description && (
                      <p className="text-sm text-muted-foreground">
                        {video.description}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Size: {formatFileSize(video.file_size)}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Uploaded: {formatDate(video.created_at)}
                    </p>

                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() =>
                        handleDownload(video.file_path, video.title)
                      }
                    >
                      Download
                    </Button>
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
