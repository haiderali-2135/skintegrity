import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("[API] Received POST /api/process-video");
  let body: any;
  
  try {
    body = await req.json();
  } catch (e) {
    console.error("[API] Failed to parse JSON:", e);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const video_url = body.video_url;
  if (!video_url) {
    console.log("[API] Missing video_url");
    return NextResponse.json({ error: "video_url is required" }, { status: 400 });
  }

  try {
    console.log("[API] Calling Modal endpoint...");
    const modalResponse = await fetch(
      "https://haiderali-2135--video-processing-app-run-process-video.modal.run/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url }),
        redirect: "manual",
      }
    );
    
    console.log("[API] Modal status:", modalResponse.status);

    if (modalResponse.status === 303) {
      const resultUrl = modalResponse.headers.get("Location");
      console.log("[API] Poll URL:", resultUrl);
      
      if (!resultUrl) {
        return NextResponse.json({ error: "No Location header on redirect" }, { status: 500 });
      }

      // Return the poll URL to the client instead of polling server-side
      return NextResponse.json({ 
        status: "processing", 
        poll_url: resultUrl,
        message: "Video processing started. Use the poll_url to check status."
      }, { status: 202 });
    }

    // Handle immediate response
    if (!modalResponse.ok) {
      const errorText = await modalResponse.text();
      console.error("[API] Modal error:", errorText);
      return NextResponse.json({ 
        error: `Modal service error: ${errorText}` 
      }, { status: modalResponse.status });
    }

    const data = await modalResponse.json();
    console.log("[API] Immediate result:", data);
    return NextResponse.json(data, { status: 200 });

  } catch (err: any) {
    console.error("[API] Error:", err);
    return NextResponse.json({ 
      error: err.message || "Server error" 
    }, { status: 500 });
  }
}