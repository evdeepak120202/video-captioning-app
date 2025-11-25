import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "File must be a video" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use /tmp in Vercel (serverless), public/uploads locally
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
    const uploadsDir = isVercel 
      ? join("/tmp", "uploads")
      : join(process.cwd(), "public", "uploads");
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    // Return API route URL in Vercel, public path locally
    const videoUrl = isVercel 
      ? `/api/video/${filename}`
      : `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      videoUrl,
      filename,
      filepath, // Include filepath for server-side access
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

