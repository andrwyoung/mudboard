import { allowedOrigins } from '@/types/upload-settings';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  const referer = req.headers.get("referer") || "";
  let origin = "";
  
  try {
    origin = new URL(referer).origin;
  } catch {
    // If referer is missing or malformed, treat it as invalid
    return new NextResponse("Missing or invalid referer", { status: 400 });
  }
  
  if (!allowedOrigins.includes(origin)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Fetch failed");

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new NextResponse("Proxy fetch failed", { status: 500 });
  }
}