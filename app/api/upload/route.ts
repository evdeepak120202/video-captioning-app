import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

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

    const token = process.env.video_captioning_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Blob token not configured" },
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;

    const blob = await put(filename, file, {
      access: "public",
      token,
    });

    return NextResponse.json({
      success: true,
      videoUrl: blob.url,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
