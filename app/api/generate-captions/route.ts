import { NextRequest, NextResponse } from "next/server";
import { access } from "fs/promises";
import { join } from "path";
import { constants } from "fs";
import { AssemblyAI } from "assemblyai";

export interface Caption {
  text: string;
  start: number;
  end: number;
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ASSEMBLY_AI_API || 
                   process.env.assembly_ai_api || 
                   process.env.ASSEMBLYAI_API_KEY ||
                   process.env.ASSEMBLYAI_API;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AssemblyAI API key not configured. Please set ASSEMBLY_AI_API (or assembly_ai_api) environment variable." },
        { status: 500 }
      );
    }

    const videoPath = join(process.cwd(), "public", videoUrl);
    try {
      await access(videoPath, constants.F_OK);
    } catch {
      return NextResponse.json(
        { error: "Video file not found" },
        { status: 404 }
      );
    }

    const client = new AssemblyAI({
      apiKey: apiKey,
    });

    console.log("Starting transcription with AssemblyAI for:", videoPath);

    const transcript = await client.transcripts.transcribe({
      audio: videoPath,
      speech_model: "best",
      language_codes: ["en", "hi"],
      word_boost: ["guys", "movie", "phone", "ok", "bye", "hello"],
      boost_param: "low"
    } as any);

    console.log("Transcription status:", transcript.status);

    let finalTranscript = transcript;
    while (finalTranscript.status === "processing" || finalTranscript.status === "queued") {
      await new Promise(resolve => setTimeout(resolve, 3000));
      finalTranscript = await client.transcripts.get(finalTranscript.id);
      console.log("Transcription status:", finalTranscript.status);
    }

    if (finalTranscript.status === "error") {
      throw new Error(finalTranscript.error || "Transcription failed");
    }

    const captions: Caption[] = [];
    
    if (finalTranscript.words && finalTranscript.words.length > 0) {
      let currentCaption: { text: string; start: number; end: number } | null = null;
      const captionDuration = 5;

      for (const word of finalTranscript.words) {
        const wordText = word.text;

        if (!currentCaption) {
          currentCaption = {
            text: wordText,
            start: word.start / 1000,
            end: word.end / 1000,
          };
        } else {
          if (word.start / 1000 - currentCaption.start < captionDuration) {
            currentCaption.text += " " + wordText;
            currentCaption.end = word.end / 1000;
          } else {
            captions.push(currentCaption);
            currentCaption = {
              text: wordText,
              start: word.start / 1000,
              end: word.end / 1000,
            };
          }
        }
      }

      if (currentCaption) {
        captions.push(currentCaption);
      }
    } else if (finalTranscript.text) {
      captions.push({
        text: finalTranscript.text,
        start: 0,
        end: finalTranscript.audio_duration ? finalTranscript.audio_duration / 1000 : 10,
      });
    }

    console.log("\n=== GENERATED CAPTIONS ===");
    console.log(`Total captions: ${captions.length}`);
    console.log("Full text:", finalTranscript.text);
    console.log("\nCaption details:");
    captions.forEach((caption, index) => {
      console.log(`[${index + 1}] [${caption.start.toFixed(2)}s - ${caption.end.toFixed(2)}s]: "${caption.text}"`);
    });
    console.log("========================\n");

    return NextResponse.json({
      success: true,
      captions,
      fullText: finalTranscript.text,
    });
  } catch (error: any) {
    console.error("Caption generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate captions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

