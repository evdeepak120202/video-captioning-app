"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Video, Languages, Palette, Download, Zap, Mail, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
            Assignment Submission
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Video Captioning Platform
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Built for Simora.ai interview process
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm">evdeepak120202@gmail.com</span>
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="text-sm">
              Deepakkumar E
            </div>
          </div>
        </div>
        <Card className="mb-12 border-2 border-blue-200 dark:border-blue-900/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold">Hey there! 👋</CardTitle>
            <CardDescription className="text-base mt-2">
              A bit about what I built
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
            <p>
              So I got this assignment to build a video captioning platform, and honestly, it was pretty fun to work on. 
              The main challenge was getting everything to work together - video uploads, speech-to-text, and then rendering 
              captions on top using Remotion.
            </p>
            <p>
              I went with AssemblyAI for the transcription because their API is straightforward and they support Hindi, 
              which was one of the requirements. The tricky part was the Hinglish thing - more on that below.
            </p>
            <p>
              The app lets you upload an MP4, automatically generates captions from the audio, and then you can preview 
              them in real-time with different styles. Pretty neat, right?
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p>Drag & drop video upload (MP4 only)</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p>Auto caption generation with AssemblyAI</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p>Real-time preview using Remotion Player</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p>Three caption styles: bottom-centered, top-bar, and karaoke</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p>Export captions as SRT file</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p>Download render script for final video</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Code className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-2xl">Tech Stack</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                <p><strong>Next.js 16</strong> with App Router - for the web framework</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                <p><strong>Remotion</strong> - for video rendering and caption overlays</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                <p><strong>AssemblyAI</strong> - speech-to-text API</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                <p><strong>TypeScript</strong> - because type safety is important</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                <p><strong>Tailwind CSS</strong> + <strong>shadcn/ui</strong> - for styling</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                <p><strong>Vercel Blob</strong> - for video file storage</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                <p><strong>Vercel</strong> - deployed and hosted here</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <AlertCircle className="h-6 w-6 text-amber-700 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">About Language Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-slate-800 dark:text-slate-200 leading-relaxed space-y-4">
            <p className="text-lg">
              <strong>Important note about captions:</strong> All captions will be in <strong>Hindi (Devanagari script)</strong> 
              when Hindi is detected in the audio, or <strong>English</strong> when English is detected.
            </p>
            <p>
              I tried to get Hinglish (mixed Hindi-English code-switching) working, but AssemblyAI's free tier only supports 
              one language at a time. When you speak a mix of Hindi and English, it detects the primary language and transcribes 
              everything in that script. So if it detects Hindi, even English words get transcribed in Devanagari.
            </p>
            <p>
              There are other services that properly handle code-switching between languages, but they're all paid APIs and 
              would require a subscription. For this assignment, I'm using AssemblyAI's free tier, which means captions will 
              be in one language - either Hindi or English, depending on what the API detects.
            </p>
            <p className="pt-2 border-t border-amber-200 dark:border-amber-800 text-sm">
              The app automatically detects the language and uses the appropriate font (Noto Sans Devanagari for Hindi, 
              Noto Sans for English) to render the captions correctly.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mb-3">
                <Palette className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Caption Styles</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 space-y-2">
              <p className="mb-3">Three different styles you can choose from:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span><strong>Bottom-centered:</strong> Classic subtitle style at the bottom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span><strong>Top-bar:</strong> News-style captions at the top</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span><strong>Karaoke:</strong> Word-by-word highlighting as it's spoken</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 w-fit mb-3">
                <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <ol className="space-y-3 list-decimal list-inside">
                <li>Upload your MP4 video (drag & drop or click to browse)</li>
                <li>Click "Generate Captions" - AssemblyAI processes the audio</li>
                <li>Wait a bit (depends on video length)</li>
                <li>Preview captions in real-time with different styles</li>
                <li>Export as SRT or get a render script for the final video</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 w-fit mb-3">
                <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <p className="mb-3">You can export in two ways:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span><strong>SRT file:</strong> Download the caption file to use elsewhere</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span><strong>Render script:</strong> Get a Node.js script to render the final captioned video locally</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <ExternalLink className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Deployment & Rendering</h3>
                <p className="text-blue-100 leading-relaxed text-lg">
                  The app is deployed on Vercel. Since Vercel uses serverless functions with execution time limits, 
                  I couldn't do the full video rendering there. Instead, when you click "Get Render Script", it downloads 
                  a Node.js script that includes all your video data and captions. You run it locally and it generates 
                  the final captioned video. It's a bit of a workaround, but it works reliably and doesn't hit any timeout limits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Some Decisions I Made</CardTitle>
            <CardDescription>Why I built it this way</CardDescription>
          </CardHeader>
          <CardContent className="text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
            <div>
              <p className="font-semibold mb-2">Why AssemblyAI?</p>
              <p className="text-sm">
                I chose AssemblyAI because it has a good free tier, supports Hindi, and gives word-level timestamps 
                which are crucial for accurate caption timing. The API is also pretty straightforward to integrate.
              </p>
            </div>
           
          </CardContent>
        </Card>

        <div className="text-center space-y-6">
          <Link href="/editor">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all">
              Try the App
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Questions or feedback? Reach out at evdeepak120202@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
