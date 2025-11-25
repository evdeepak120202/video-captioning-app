import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 });
    }

    // Check /tmp in Vercel, public/uploads locally
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
    const filepath = isVercel
      ? join("/tmp", "uploads", filename)
      : join(process.cwd(), "public", "uploads", filename);

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filepath);
    
    // Determine content type based on file extension
    const contentType = filename.endsWith(".mp4")
      ? "video/mp4"
      : filename.endsWith(".webm")
      ? "video/webm"
      : filename.endsWith(".mov")
      ? "video/quicktime"
      : "video/mp4";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Video serve error:", error);
    return NextResponse.json(
      { error: "Failed to serve video" },
      { status: 500 }
    );
  }
}

