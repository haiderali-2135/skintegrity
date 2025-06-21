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
  const [processingStage, setProcessingStage] = useState<string>("")
  const [pollAttempts, setPollAttempts] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Helper to check if we have a successful result
  const hasResult = classification !== null && confidence !== null

  const handleVideoChange = (file: File) => {
    if (file) {
      setVideo(file)
      setClassification(null)
      setConfidence(null)
      setError(null)
      setProcessingStage("")
      setPollAttempts(0)

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

  // Client-side polling function
  const pollForResult = async (pollUrl: string) => {
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    const pollInterval = 5000; // 5 seconds
    
    setProcessingStage("Processing video frames...")
    setPollAttempts(0)

    const poll = async () => {
      try {
        setPollAttempts(prev => prev + 1)
        
        if (pollAttempts >= maxAttempts) {
          setError("Processing is taking too long. Please try again with a shorter video.")
          setIsLoading(false)
          return
        }

        console.log(`[UI] Poll attempt ${pollAttempts + 1}/${maxAttempts}`)
        
        const response = await fetch("/api/poll-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poll_url: pollUrl }),
        })

        const result = await response.json()
        console.log("[UI] Poll result:", result)

        if (result.status === 'completed') {
          // Clear polling interval
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }

          if (result.prediction && result.confidence !== undefined) {
            setClassification(result.prediction)
            setConfidence(result.confidence)
            setProcessingStage("Analysis complete!")
          } else {
            setError("Invalid response format from server.")
          }
          setIsLoading(false)
        } else if (result.status === 'processing') {
          // Update processing stage based on attempts
          if (pollAttempts < 6) {
            setProcessingStage("Uploading and initializing...")
          } else if (pollAttempts < 12) {
            setProcessingStage("Extracting video frames...")
          } else if (pollAttempts < 30) {
            setProcessingStage("Analyzing frames with AI model...")
          } else {
            setProcessingStage("Finalizing analysis...")
          }
          // Continue polling
        } else {
          // Error case
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          setError(result.message || "Processing failed.")
          setIsLoading(false)
        }
      } catch (err) {
        console.error("[UI] Polling error:", err)
        if (pollAttempts >= 3) { // Allow a few retry attempts
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          setError("Connection error during processing. Please try again.")
          setIsLoading(false)
        }
      }
    }

    // Start polling
    pollIntervalRef.current = setInterval(poll, pollInterval)
    // Also call immediately
    await poll()
  }

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
    setProcessingStage("Uploading video...")
    setPollAttempts(0)

    try {
      const filePath = `skintegrityvideos/${video.name}`
      console.log("[UI] Uploading to Supabase:", filePath)

      const { error: uploadError } = await supabase
        .storage
        .from("videos")
        .upload(filePath, video, { cacheControl: "3600", upsert: true })

      if (uploadError) {
        console.error("[UI] Supabase upload error:", uploadError)
        setError("Failed to upload video to Supabase.")
        setIsLoading(false)
        return
      }

      const { data } = supabase.storage.from("videos").getPublicUrl(filePath)
      console.log("[UI] Supabase public URL:", data)

      if (!data?.publicUrl) {
        setError("Failed to retrieve video URL.")
        setIsLoading(false)
        return
      }

      setProcessingStage("Sending to AI processor...")
      console.log("[UI] Calling local API /api/process-video")
      
      const response = await fetch("/api/process-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: data.publicUrl }),
      })
      
      console.log("[UI] API responded with status", response.status)

      if (!response.ok) {
        const errText = await response.text()
        console.error("[UI] API error body:", errText)
        setError(`API error: ${errText}`)
        setIsLoading(false)
      } else {
        const result = await response.json()
        console.log("[UI] Initial response:", result)

        if (result.status === 'error') {
          console.log("------------- error detected -------------")
          console.error("[UI] Backend error:", result.message)
          setError(result.message || "An unexpected error occurred.")
          setIsLoading(false)
        } else if (result.status === 'success' || result.status === 'completed') {
          // Immediate success
          setClassification(result.prediction)
          setConfidence(result.confidence)
          setIsLoading(false)
        } else if (result.status === 'processing' && result.poll_url) {
          // Start client-side polling
          await pollForResult(result.poll_url)
        } else {
          setError("Unexpected response format from server.")
          setIsLoading(false)
        }
      }

    } catch (err) {
      console.error("[UI] Unexpected error:", err)
      setError("An unexpected error occurred.")
      setIsLoading(false)
    } finally {
      // Clean up polling if still active
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      
      // Clean up Supabase video
      if (video) {
        console.log("[UI] Deleting video from Supabase")
        const { error: delError } = await supabase
          .storage
          .from("videos")
          .remove([`skintegrityvideos/${video.name}`])

        if (delError) {
          console.error("[UI] Supabase delete error:", delError)
        } else {
          console.log("[UI] Video deleted successfully")
        }
      }
    }
  }

  const resetForm = () => {
    // Clear any active polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    
    setVideo(null)
    setVideoPreview(null)
    setClassification(null)
    setConfidence(null)
    setError(null)
    setProcessingStage("")
    setPollAttempts(0)
    setIsLoading(false)
    
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
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                  >
                    {videoPreview ? (
                      <div className="w-full">
                        <div className="relative aspect-video w-full max-w-lg mx-auto mb-4">
                          <video
                            ref={videoRef}
                            src={videoPreview}
                            className="w-full h-full rounded-lg object-cover"
                            controls
                          />
                          {!isLoading && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                resetForm()
                              }}
                              className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
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
                      disabled={isLoading}
                    />
                  </div>

                  {/* Processing Status */}
                  {isLoading && processingStage && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center">
                        <Loader2 className="animate-spin text-blue-600 mr-3" size={18} />
                        <div className="flex-1">
                          <p className="text-blue-600 dark:text-blue-400 font-medium">{processingStage}</p>
                          {pollAttempts > 0 && (
                            <p className="text-blue-500 dark:text-blue-300 text-sm mt-1">
                              Processing attempt {pollAttempts}/60 (this may take a few minutes)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

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
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    {videoPreview && (
                      <div className="aspect-video w-full mb-4">
                        <video src={videoPreview} className="w-full h-full rounded-lg object-cover" controls />
                      </div>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        <strong>Filename:</strong> {video?.name}
                      </p>
                      <p>
                        <strong>Size:</strong> {video?.size ? formatFileSize(video.size) : 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="md:w-1/2">
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
                            className={`h-4 rounded-full ${
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
                     confidence scores calculated by our predicer model
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