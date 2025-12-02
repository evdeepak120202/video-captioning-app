"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Player } from "@remotion/player";
import { upload } from "@vercel/blob/client";
import { VideoWithCaptions, Caption } from "../remotion/VideoWithCaptions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Loader2,
  Download,
  Info,
  FileVideo,
  Subtitles,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [captionStyle, setCaptionStyle] = useState<"bottom-centered" | "top-bar" | "karaoke">("bottom-centered");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    setError("");
    setCaptions([]);
    setVideoUrl(""); // Clear previous video

    try {
      const options: any = {
        access: "public",
        handleUploadUrl: "/api/blob-upload-url",
        multipart: true,
        onUploadProgress: (event: any) => {
          if (typeof event.percentage === "number") {
            setUploadProgress(Math.round(event.percentage));
          } else if (event.total) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress(percentComplete);
          }
        },
      };

      const blob = await upload(file.name, file, options);

      setVideoUrl(blob.url);
      setUploadProgress(100);

      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadFileName("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to upload video");
      setUploadProgress(0);
      setUploadFileName("");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
    },
    maxFiles: 1,
  });

  const handleGenerateCaptions = async () => {
    if (!videoUrl) {
      setError("Please upload a video first");
      return;
    }

    setIsGenerating(true);
    setError("");

    console.log("Starting caption generation for:", videoUrl);

    try {
      const response = await fetch("/api/generate-captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate captions");
      }

      if (data.captions && data.captions.length > 0) {
        setCaptions(data.captions);
        console.log("Caption generation completed:", data.captions.length, "captions");
      } else {
        throw new Error("No captions generated. Please ensure the video has audio.");
      }
    } catch (err: any) {
      console.error("Caption generation error:", err);
      setError(err.message || "Failed to generate captions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCaptionsClientSide = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error(
        "Speech Recognition not supported. Please use Chrome, Edge, or Safari browser."
      );
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    
    let videoElement = document.querySelector(
      `video[src*="${videoUrl.split("/").pop()}"]`
    ) as HTMLVideoElement;

    if (!videoElement) {
      const videos = Array.from(document.querySelectorAll("video")) as HTMLVideoElement[];
      videoElement = videos.find(v => 
        v.src.includes(videoUrl) || 
        v.currentSrc.includes(videoUrl) ||
        v.getAttribute('src')?.includes(videoUrl.split("/").pop() || "")
      ) || videos[0];
    }

    if (!videoElement) {
      console.error("Video element not found. Available videos:", document.querySelectorAll("video"));
      throw new Error("Video element not found. Please refresh the page and try again.");
    }

    console.log("Found video element:", videoElement.src);

    return new Promise<void>((resolve, reject) => {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "hi-IN"; // Hindi-India (supports Hinglish)

      const captions: Caption[] = [];
      const startTime = Date.now();
      let currentSegment: { text: string; start: number } | null = null;
      let recognitionStarted = false;

      let audioContext: AudioContext | null = null;
      let mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;

      const setupAudioCapture = async () => {
        try {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(videoElement!);
          mediaStreamDestination = audioContext.createMediaStreamDestination();
          source.connect(mediaStreamDestination);
          source.connect(audioContext.destination);
        } catch (err) {
          console.warn("Could not set up audio capture:", err);
        }
      };

      recognition.onresult = (event: any) => {
        if (!recognitionStarted) {
          recognitionStarted = true;
          console.log("Speech recognition started, receiving results...");
        }

        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const isFinal = event.results[current].isFinal;
        
        const currentTime = videoElement?.currentTime 
          ? videoElement.currentTime 
          : (Date.now() - startTime) / 1000;

        if (isFinal) {
          if (currentSegment) {
            captions.push({
              text: (currentSegment.text + " " + transcript).trim(),
              start: currentSegment.start,
              end: currentTime,
            });
            currentSegment = null;
          } else {
            captions.push({
              text: transcript.trim(),
              start: Math.max(0, currentTime - 2),
              end: currentTime,
            });
          }
          setCaptions([...captions]);
          console.log("Caption added:", captions[captions.length - 1]);
        } else {
          if (!currentSegment) {
            currentSegment = {
              text: transcript,
              start: Math.max(0, currentTime - 1),
            };
          } else {
            currentSegment.text = transcript;
          }
        }
      };

      recognition.onstart = () => {
        console.log("Speech recognition started");
        recognitionStarted = true;
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        
        if (event.error === "no-speech") {
          recognition.stop();
          if (captions.length === 0) {
            reject(new Error("No speech detected. Please ensure: 1) The video has audio, 2) Your microphone is enabled, 3) The video is playing."));
          } else {
            resolve();
          }
          return;
        }
        
        if (event.error === "not-allowed") {
          reject(new Error("Microphone access denied. Please allow microphone access and try again."));
          return;
        }
        
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        if (currentSegment) {
          const endTime = videoElement?.currentTime 
            ? videoElement.currentTime 
            : (Date.now() - startTime) / 1000;
          captions.push({
            text: currentSegment.text.trim(),
            start: currentSegment.start,
            end: endTime,
          });
          setCaptions([...captions]);
        }
        
        if (audioContext) {
          audioContext.close();
        }
        
        resolve();
      };

      const startRecognition = () => {
        videoElement.play().then(() => {
          console.log("Video playing, starting speech recognition...");
          try {
            recognition.start();
            console.log("Speech recognition started successfully");
          } catch (startErr: any) {
            console.error("Error starting recognition:", startErr);
            reject(new Error(`Failed to start speech recognition: ${startErr.message}. Please ensure microphone access is allowed.`));
          }
        }).catch((err) => {
          console.error("Error playing video:", err);
          reject(new Error("Could not play video. Please ensure the video has audio and autoplay is allowed."));
        });

        videoElement.addEventListener("ended", () => {
          console.log("Video ended, stopping recognition...");
          recognition.stop();
        }, { once: true });
      };

      setupAudioCapture().then(() => {
        if (videoElement.readyState < 2) {
          videoElement.addEventListener("loadeddata", () => {
            startRecognition();
          }, { once: true });
          videoElement.load();
        } else {
          startRecognition();
        }
      }).catch((err) => {
        console.warn("Audio capture setup failed, continuing anyway:", err);
        if (videoElement.readyState < 2) {
          videoElement.addEventListener("loadeddata", () => {
            startRecognition();
          }, { once: true });
          videoElement.load();
        } else {
          startRecognition();
        }
      });

      const timeout = setTimeout(() => {
        console.log("Timeout reached, stopping recognition...");
        recognition.stop();
        if (videoElement) {
          videoElement.pause();
        }
        resolve();
      }, 300000);

      const originalOnEnd = recognition.onend;
      recognition.onend = () => {
        clearTimeout(timeout);
        originalOnEnd?.();
      };
    });
  };

  const handleExportSRT = async () => {
    if (captions.length === 0) {
      setError("Please generate captions first");
      return;
    }

    try {
      const response = await fetch("/api/export-srt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ captions }),
      });

      if (!response.ok) {
        throw new Error("Failed to export SRT");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "captions.srt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to export SRT");
    }
  };

  const handleRender = async () => {
    if (!videoUrl || captions.length === 0) {
      setError("Please upload a video and generate captions first");
      return;
    }

    setIsRendering(true);
    setError("");

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          captions,
          captionStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Failed to render video");
      }

      // Check if response is JSON (local render) or text (script download)
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        // Local rendering response
        const data = await response.json();
        
        // Always download the script (for backup or re-rendering)
        if (data.script) {
          const blob = new Blob([data.script], { type: "application/javascript" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "render-video.js";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        
        if (data.renderedLocally && data.videoPath) {
          setError(`✅ Video rendered successfully and saved to: ${data.videoPath}. Render script also downloaded.`);
        } else if (data.error) {
          setError(`⚠️ Local render failed: ${data.error}. Render script downloaded - you can run it manually.`);
        } else {
          setError("Render script downloaded! Run it manually to render the video.");
        }
      } else {
        // Script download (Vercel deployment)
        const scriptContent = await response.text();
        const blob = new Blob([scriptContent], { type: "application/javascript" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "render-video.js";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setError("Render script downloaded! Save it in your project root and run: node render-video.js (The video will be saved in the out folder)");
      }
    } catch (err: any) {
      setError(err.message || "Failed to render video");
    } finally {
      setIsRendering(false);
    }
  };

  const calculateDuration = () => {
    if (captions.length === 0) return 30;
    return Math.max(...captions.map((cap) => cap.end), 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
          <div className="flex-1">
            <Link href="/" className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 transition-colors group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              Video Captioning
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
              Add captions to your videos automatically
            </p>
          </div>
        </div>

        {error && (
          <div className={`mb-6 p-4 md:p-5 rounded-xl border-2 shadow-sm ${
            error.includes("downloaded") || error.includes("successfully")
              ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
              : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
          }`}>
            <p className={`text-sm md:text-base ${
              error.includes("downloaded") || error.includes("successfully")
                ? "text-green-800 dark:text-green-200"
                : "text-red-700 dark:text-red-300"
            }`}>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="pb-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileVideo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl">Upload & Transcribe</CardTitle>
                  <CardDescription className="mt-1">Drop your MP4 video here</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
                  isUploading
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 cursor-wait"
                    : isDragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-[1.01] shadow-lg cursor-pointer"
                    : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                }`}
              >
                <input {...getInputProps()} disabled={isUploading} />
                <div className="flex flex-col items-center">
                  {isUploading ? (
                    <>
                      <div className="p-4 md:p-5 rounded-2xl mb-5 bg-blue-100 dark:bg-blue-900/50">
                        <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-blue-600 dark:text-blue-400 animate-spin" />
                      </div>
                      <p className="text-blue-700 dark:text-blue-300 font-semibold text-base md:text-lg mb-1">
                        Uploading {uploadFileName}...
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        This may take a while depending on your video size and connection.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className={`p-4 md:p-5 rounded-2xl mb-5 transition-all ${
                        isDragActive 
                          ? "bg-blue-100 dark:bg-blue-900/50 scale-110" 
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}>
                        <Upload className={`h-10 w-10 md:h-12 md:w-12 transition-colors ${
                          isDragActive 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-slate-400 dark:text-slate-500"
                        }`} />
                      </div>
                      {isDragActive ? (
                        <p className="text-blue-700 dark:text-blue-300 font-semibold text-lg">
                          Drop it here!
                        </p>
                      ) : (
                        <div>
                          <p className="text-slate-700 dark:text-slate-300 mb-2 font-semibold text-base md:text-lg">
                            Drag & drop your video
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            or click to browse • MP4 format only
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {videoUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Video uploaded successfully</span>
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-700">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateCaptions}
                disabled={!videoUrl || isGenerating || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Processing audio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    <span>Generate Captions</span>
                  </>
                )}
              </Button>
              
              {!isGenerating && videoUrl && (
                <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl">
                  <p className="font-semibold mb-2 text-blue-900 dark:text-blue-200">Powered by AssemblyAI</p>
                  <p className="leading-relaxed">
                    Supports Hindi and English. Captions will be in <strong>Hindi (Devanagari script)</strong> when Hindi is detected, 
                    or <strong>English</strong> when English is detected. Note: Mixed code-switching (Hinglish) is not supported 
                    in the free tier - captions will be in one language only.
                  </p>
                </div>
              )}

              {captions.length > 0 && (
                <div className="mt-4 p-5 bg-green-50 dark:bg-green-950/30 rounded-xl border-2 border-green-300 dark:border-green-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm md:text-base font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      {captions.length} caption segments ready
                    </p>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2.5 text-sm">
                    {captions.slice(0, 3).map((cap, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
                          {cap.start.toFixed(1)}s - {cap.end.toFixed(1)}s
                        </span>
                        <p className="mt-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">{cap.text}</p>
                      </div>
                    ))}
                    {captions.length > 3 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2 font-medium">
                        + {captions.length - 3} more segments
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="pb-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Subtitles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl">Preview & Export</CardTitle>
                  <CardDescription className="mt-1">See how your captions look</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="caption-style" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Caption Style
                </Label>
                <Select
                  value={captionStyle}
                  onValueChange={(value: any) => setCaptionStyle(value)}
                >
                  <SelectTrigger id="caption-style" className="mt-2 h-11 border-2 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-centered">
                      Bottom-Centered
                    </SelectItem>
                    <SelectItem value="top-bar">Top Bar</SelectItem>
                    <SelectItem value="karaoke">Karaoke</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {videoUrl && captions.length > 0 ? (
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-300 dark:border-slate-700">
                  <Player
                    component={VideoWithCaptions}
                    durationInFrames={Math.ceil(calculateDuration() * 30)}
                    compositionWidth={1920}
                    compositionHeight={1080}
                    fps={30}
                    controls
                    inputProps={{
                      videoUrl,
                      captions,
                      captionStyle,
                    }}
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                    }}
                  />
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 p-8">
                  <Subtitles className="h-16 w-16 text-slate-400 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-center text-sm md:text-base max-w-sm">
                    Upload a video and generate captions to see the preview here
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleExportSRT}
                  disabled={captions.length === 0}
                  variant="outline"
                  className="w-full h-12 border-2 text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download SRT File
                </Button>

                <Button
                  onClick={handleRender}
                  disabled={!videoUrl || captions.length === 0 || isRendering}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {isRendering ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Generating script...</span>
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      <span>Get Render Script</span>
                    </>
                  )}
                </Button>
                {captions.length > 0 && (
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 text-center pt-1">
                    The script will render your video locally on your machine
                  </p>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

