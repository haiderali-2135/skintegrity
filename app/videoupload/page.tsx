"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { ArrowLeft, Upload, AlertCircle, CheckCircle, Loader2, X } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function VideoUpload() {
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [classification, setClassification] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const hasResult = classification !== null && confidence !== null

  const handleVideoChange = (file: File) => {
    if (file) {
      setVideo(file)
      setClassification(null)
      setConfidence(null)
      setError(null)

      // Create video preview URL
      const videoUrl = URL.createObjectURL(file)
      setVideoPreview(videoUrl)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoChange(e.target.files[0])
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoChange(e.dataTransfer.files[0])
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[UI] handleSubmit start")

    if (!video) {
      setError("Please select a video to upload.")
      return
    }

    setIsLoading(true)
    setClassification(null)
    setConfidence(null)
    setError(null)
    let dataUrl: string | null = null;
    try {
     // 1. Upload to Supabase
const filePath = `skintegrityvideos/${video.name}`;
console.log("[UI] Uploading to Supabase:", filePath);

const { error: uploadError } = await supabase
  .storage
  .from("videos")
  .upload(filePath, video, { cacheControl: "3600", upsert: true });

if (uploadError) {
  console.error("[UI] Supabase upload error:", uploadError);
  setError("Failed to upload video to Supabase.");
  return;
}

// 2. Get public URL
const { data } = supabase.storage.from("videos").getPublicUrl(filePath);
dataUrl = data?.publicUrl ?? null;

console.log("[UI] Supabase public URL:", dataUrl);

if (!dataUrl) {
  setError("Failed to retrieve video URL.");
  return;
}

// 3. Insert row into video_results
console.log("[UI] Inserting row into video_results");
const insertRes = await supabase
  .from("video_results")
  .insert([{ video_url: data.publicUrl }]);

if (insertRes.error) {
  console.error("[UI] Supabase insert error:", insertRes.error);
  setError("Failed to create video result entry.");
  return;
}

// 4. Call backend API to trigger Modal
console.log("[UI] Calling backend API /api/process-video");
const response = await fetch("/api/process-video", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ video_url: data.publicUrl }),
});

if (!response.ok) {
  const errText = await response.text();
  console.error("[UI] API error body:", errText);
  setError(`API error: ${errText}`);
  return;
}


// 5. Start polling Supabase table by video_url
let pollAttempts = 0;
const maxAttempts = 120;
const pollInterval = 7000;
      
const sizeMB = video.size / (1024 * 1024); // Convert bytes to MB

// 🧠 Dynamic wait: starts at 30s + 30s/MB, capped at 3 minutes
const waitTime = Math.min(20000 + sizeMB * 20000, 240000); 

console.log(`[UI] Video size: ${sizeMB.toFixed(2)} MB — waiting ${Math.round(waitTime / 1000)}s before polling...`);

await new Promise((res) => setTimeout(res, waitTime));

while (pollAttempts < maxAttempts) {
  pollAttempts++;
  console.log("poll Attempt: ",pollAttempts);
  
  const { data: row, error: pollError } = await supabase
    .from("video_results")
    .select("status, prediction, confidence")
    .eq("video_url", data.publicUrl)
    .maybeSingle();

  if (pollError) {
    console.error("[UI] Supabase poll error:", pollError);
    setError("Error while polling result.");
    break;
  }

  if (row?.status === "completed") {
    console.log("[UI] Video processed:", row);
    setClassification(row.prediction);
    setConfidence(row.confidence);

    await supabase.storage.from("videos").remove([`skintegrityvideos/${video.name}`]);
    await supabase.from("video_results").delete().eq("video_url", data.publicUrl);
    break;
  }

  if (row?.status === "failed") {
  console.error("[UI] Video processing failed.");
  setError("Video processing failed. Please try another video.");
  break;
}

  await new Promise((res) => setTimeout(res, pollInterval));
}

if (pollAttempts >= maxAttempts) {
  setError("Processing took too long. Try again later.");
}


      if (!response.ok) {
        const errText = await response.text()
        console.error("[UI] API error body:", errText)
        setError(`API error: ${errText}`)
      } else {
        const result = await response.json()

        if (result.status === 'error') {
          console.log("------------- error detected -------------")
          console.error("[UI] Backend error:", result.message)
          setError("An unexpected error occurred.")
        } else if (result.status === 'success') {
          setClassification(result.prediction)
          setConfidence(result.confidence)
        } else {
          setError("Video processing failed. Please try another video.")
        }
      }

    } catch (err) {
      console.error("[UI] Unexpected error:", err)
      setError("An unexpected error occurred.")
    } finally {
       setIsLoading(false);
  console.log("[UI] Cleaning up Supabase storage and table entry");

  const videoPath = `skintegrityvideos/${video.name}`;

  // 🔴 DELETE video file
  const { error: delError } = await supabase.storage.from("videos").remove([videoPath]);
  if (delError) {
    console.error("[UI] Supabase delete video error:", delError);
    if (!error) setError("Failed to delete video file.");
  } else {
    console.log("[UI] Video file deleted successfully.");
  }

  // 🔴 DELETE DB entry
  const { error: dbDeleteError } = await supabase
    .from("video_results")
    .delete()
    .eq("video_url", dataUrl);;

  if (dbDeleteError) {
    console.error("[UI] Supabase delete DB row error:", dbDeleteError);
    if (!error) setError("Failed to delete result record.");
  } else {
    console.log("[UI] Supabase table row deleted successfully.");
  }
    }
  }

  const resetForm = () => {
    setVideo(null)
    setVideoPreview(null)
    setClassification(null)
    setConfidence(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Clean up video preview URL to prevent memory leaks
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
  }

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }


  const VideoContainer = ({ src, controls = false, showCloseButton = false, onClose }: {
    src: string
    controls?: boolean
    showCloseButton?: boolean
    onClose?: () => void
  }) => (
    <div className="relative w-full flex justify-center">
      <div className="relative max-w-full max-h-96 bg-black rounded-lg overflow-hidden">
        <video
          ref={controls ? videoRef : undefined}
          src={src}
          className="w-full h-full max-w-none"
          controls={controls}
          style={{ 
            maxHeight: '24rem', // max-h-96 equivalent
            width: 'auto',
            height: 'auto'
          }}
        />
        {showCloseButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
            className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black/90 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Circuit pattern background */}
      <div className="circuit-pattern fixed inset-0 z-0"></div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 mb-8">
          <ArrowLeft className="mr-2" size={16} />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-red-600 dark:text-red-400">Skintegrity Scanner</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Upload a video to analyze for potential deepfake manipulation
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            {!hasResult ? (
              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                  <div
                    className={`upload-zone ${isDragging ? "active" : ""} ${videoPreview ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {videoPreview ? (
                      <div className="w-full space-y-4">
                        <VideoContainer 
                          src={videoPreview} 
                          controls={true}
                          showCloseButton={true}
                          onClose={resetForm}
                        />
                        <p className="text-green-600 dark:text-green-400 text-center font-medium">{video?.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium mb-2">Drag and drop your video here</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">or click to browse files</p>
                        <p className="text-xs text-gray-400">Supports MP4, MOV, AVI up to 100MB</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                      <AlertCircle className="text-red-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-center">
                    <button
                      type="submit"
                      className="btn-primary flex items-center justify-center min-w-[200px]"
                      disabled={isLoading || !video}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={18} />
                          Analyzing Video...
                        </>
                      ) : (
                        "Analyze Video"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/2">
                    {videoPreview && (
                      <div className="mb-4">
                        <VideoContainer src={videoPreview} controls={true} />
                      </div>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <p>
                        <strong>Filename:</strong> {video?.name}
                      </p>
                      <p>
                        <strong>Size:</strong> {video?.size ? formatFileSize(video.size) : 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="lg:w-1/2">
                    <div
                      className={`p-6 rounded-lg border ${
                        classification === "REAL"
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        {classification === "REAL" ? (
                          <CheckCircle className="text-green-600 mr-3" size={24} />
                        ) : (
                          <AlertCircle className="text-red-600 mr-3" size={24} />
                        )}
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                          {classification === "REAL" ? "Authentic Video" : "Deepfake Detected"}
                        </h2>
                      </div>

                      <div className="mb-6">
                        <p className="text-gray-700 dark:text-gray-300 mb-2">Confidence Score:</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full transition-all duration-300 ${
                              classification === "REAL" ? "bg-green-600" : "bg-red-600"
                            }`}
                            style={{ width: `${confidence ? (confidence * 100).toFixed(1) : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-right text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {confidence ? (confidence * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={resetForm} 
                        className="btn-outline text-gray-700 dark:text-gray-300 flex-1 flex items-center justify-center"
                      >
                        Analyze Another Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="text-red-600 font-bold">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Video Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our AI scans each frame for inconsistencies in facial features and movement.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="text-red-600 font-bold">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Pattern Recognition</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Advanced algorithms detect unnatural patterns in facial blood flow and texture.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="text-red-600 font-bold">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Result Generation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confidence scores calculated by our predictor model
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}