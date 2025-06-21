import { NextResponse } from "next/server";

// ADD THIS LINE
export const maxDuration = 60;

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

      // UPDATED POLLING FUNCTION - This is the key fix
      const poll = async (url: string, interval = 3000, maxTime = 50000) => {
        const startTime = Date.now();
        let attempt = 0;
        
        while (Date.now() - startTime < maxTime) {
          attempt++;
          console.log(`[API] Poll attempt ${attempt}, elapsed: ${Date.now() - startTime}ms`);
          
          try {
            const r = await fetch(url);
            if (r.ok) return r.json();
          } catch (error) {
            console.error(`[API] Poll attempt ${attempt} failed:`, error);
          }
          
          // Check if we're close to timeout
          if (Date.now() - startTime > maxTime - 5000) {
            throw new Error("Approaching serverless function timeout limit");
          }
          
          await new Promise((res) => setTimeout(res, interval));
        }
        
        throw new Error("Polling timed out within serverless limits");
      };

      const result = await poll(resultUrl);
      console.log("[API] Poll result:", result);
      return NextResponse.json(result, { status: 200 });
    }

    const data = await modalResponse.json();
    console.log("[API] Immediate result:", data);
    return NextResponse.json(data, { status: modalResponse.status });
  } catch (err: any) {
    console.error("[API] Error:", err);
    
    // Better error message for timeout
    if (err.message.includes('timeout')) {
      return NextResponse.json({ 
        error: "Video processing is taking too long. Please try with a shorter video." 
      }, { status: 408 });
    }
    
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}