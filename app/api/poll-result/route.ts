// Create this as /api/poll-result/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("[POLL] Received polling request");
  
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    console.error("[POLL] Failed to parse JSON:", e);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { poll_url } = body;
  if (!poll_url) {
    console.log("[POLL] Missing poll_url");
    return NextResponse.json({ error: "poll_url is required" }, { status: 400 });
  }

  try {
    console.log("[POLL] Checking result at:", poll_url);
    const response = await fetch(poll_url, {
      method: "GET",
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.ok) {
      const result = await response.json();
      console.log("[POLL] Got result:", result);
      return NextResponse.json({
        status: "completed",
        ...result
      }, { status: 200 });
    } else if (response.status === 202) {
      // Still processing
      console.log("[POLL] Still processing...");
      return NextResponse.json({
        status: "processing",
        message: "Video is still being processed"
      }, { status: 202 });
    } else {
      const errorText = await response.text();
      console.error("[POLL] Error response:", errorText);
      return NextResponse.json({
        status: "error",
        message: `Polling failed: ${errorText}`
      }, { status: response.status });
    }

  } catch (err: any) {
    console.error("[POLL] Error:", err);
    
    // Check if it's a timeout error
    if (err.name === 'AbortError') {
      return NextResponse.json({
        status: "processing",
        message: "Processing is taking longer than expected"
      }, { status: 202 });
    }
    
    return NextResponse.json({
      status: "error",
      message: err.message || "Polling error"
    }, { status: 500 });
  }
}