import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: Request): Promise<NextResponse> {
  try {
   
    if (
      !process.env.BLOB_READ_WRITE_TOKEN &&
      process.env.video_captioning_READ_WRITE_TOKEN
    ) {
      process.env.BLOB_READ_WRITE_TOKEN =
        process.env.video_captioning_READ_WRITE_TOKEN;
    }

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (_pathname, _request) => {

        return {
          allowedContentTypes: ["video/mp4"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob }) => {
       
        console.log("Blob upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Blob upload URL error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to prepare upload" },
      { status: 400 }
    );
  }
}


