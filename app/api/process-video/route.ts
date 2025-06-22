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
    return NextResponse.json({ error: "video_url is required" }, { status: 400 });
  }

  try {
    const modalResponse = await fetch(
      "https://haiderali-2135--video-processing-app-run-process-video.modal.run/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url }),
        redirect: "manual",
      }
    );

    if (modalResponse.status === 303) {
      const resultUrl = modalResponse.headers.get("Location");
      if (!resultUrl) {
        return NextResponse.json({ error: "Missing Location header from Modal" }, { status: 500 });
      }
      // Just return the URL to the client for polling
      return NextResponse.json({ poll_url: resultUrl }, { status: 200 });
    }

    const data = await modalResponse.json();
    return NextResponse.json(data, { status: modalResponse.status });

  } catch (err: any) {
    console.error("[API] Error calling Modal:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
