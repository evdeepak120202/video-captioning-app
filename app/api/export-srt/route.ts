import { NextRequest, NextResponse } from "next/server";

export interface Caption {
  text: string;
  start: number;
  end: number;
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

function generateSRT(captions: Caption[]): string {
  return captions
    .map((caption, index) => {
      const startTime = formatSRTTime(caption.start);
      const endTime = formatSRTTime(caption.end);
      const text = caption.text.replace(/\n/g, ' ').trim();
      
      return `${index + 1}\n${startTime} --> ${endTime}\n${text}\n`;
    })
    .join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const { captions } = await request.json();

    if (!captions || !Array.isArray(captions) || captions.length === 0) {
      return NextResponse.json(
        { error: "Captions are required" },
        { status: 400 }
      );
    }

    const srtContent = generateSRT(captions);

    return new NextResponse(srtContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/srt',
        'Content-Disposition': 'attachment; filename="captions.srt"',
      },
    });
  } catch (error: any) {
    console.error("SRT export error:", error);
    return NextResponse.json(
      {
        error: "Failed to export SRT",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

