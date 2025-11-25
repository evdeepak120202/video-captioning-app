import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { spawn } from "child_process";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, captions, captionStyle, fps = 30 } = await request.json();

    if (!videoUrl || !captions) {
      return NextResponse.json(
        { error: "Video URL and captions are required" },
        { status: 400 }
      );
    }

    const duration = Math.max(
      ...captions.map((cap: any) => cap.end),
      10
    );

    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || request.headers.get("x-forwarded-host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    let fullVideoUrl = videoUrl;
    if (videoUrl.startsWith("/")) {
      fullVideoUrl = `${baseUrl}${videoUrl}`;
    }

    const isLocal = !process.env.VERCEL && !process.env.VERCEL_ENV;
    
    let renderedVideoPath: string | null = null;
    let renderError: string | null = null;

    if (isLocal) {
      try {
        console.log("Running locally - rendering video...");
        
        const outDir = path.join(process.cwd(), "out");
        if (!existsSync(outDir)) {
          mkdirSync(outDir, { recursive: true });
        }

        const renderData = {
          videoUrl: fullVideoUrl,
          captions,
          captionStyle: captionStyle || "bottom-centered",
          fps,
          duration,
        };

        const scriptPath = path.join(process.cwd(), "scripts", "render-video-api.js");
        const childProcess = spawn("node", [scriptPath, JSON.stringify(renderData)], {
          cwd: process.cwd(),
          stdio: ["ignore", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        childProcess.stdout.on("data", (data) => {
          const output = data.toString();
          stdout += output;
          if (!output.includes("__RENDER_RESULT__")) {
            console.log(output.trim());
          }
        });

        childProcess.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        await new Promise<void>((resolve, reject) => {
          childProcess.on("close", (code) => {
            const resultMatch = stdout.match(/__RENDER_RESULT__(.+?)__END__/);
            if (resultMatch) {
              try {
                const result = JSON.parse(resultMatch[1]);
                if (result.success && result.path) {
                  renderedVideoPath = result.path;
                  console.log(`Video rendered successfully: ${result.path}`);
                  resolve();
                } else {
                  renderError = result.error || "Unknown error";
                  reject(new Error(renderError || "Unknown error"));
                }
              } catch (parseError) {
                renderError = "Could not parse render result";
                reject(new Error(renderError || "Could not parse render result"));
              }
            } else if (code === 0) {
              const pathMatch = stdout.match(/Video rendered successfully: (.+)/);
              if (pathMatch) {
                renderedVideoPath = pathMatch[1].trim();
                console.log(`Video rendered successfully: ${renderedVideoPath}`);
                resolve();
              } else {
                renderError = "Render completed but could not find output path";
                reject(new Error(renderError));
              }
            } else {
              renderError = stderr || `Process exited with code ${code}`;
              reject(new Error(renderError || "Unknown error"));
            }
          });

          childProcess.on("error", (error) => {
            renderError = error.message;
            reject(error);
          });
        });
      } catch (error: any) {
        console.error("Local render error:", error);
        renderError = error.message || "Failed to render video";
      }
    }

    const renderScript = `#!/usr/bin/env node

const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const path = require("path");
const fs = require("fs");

async function render() {
  const videoUrl = ${JSON.stringify(fullVideoUrl)};
  const captions = ${JSON.stringify(captions)};
  const captionStyle = ${JSON.stringify(captionStyle || "bottom-centered")};
  const fps = ${fps};
  const duration = ${duration};
  
  const outDir = path.join(process.cwd(), "out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const timestamp = Date.now();
  const outputPath = path.join(outDir, \`captioned-video-\${timestamp}.mp4\`);

  console.log("Bundling Remotion...");
  const bundled = await bundle({
    entryPoint: path.join(process.cwd(), "app", "remotion", "root.tsx"),
    webpackOverride: (config) => config,
  });

  console.log("Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "VideoWithCaptions",
    inputProps: {
      videoUrl,
      captions,
      captionStyle,
    },
  });

  const totalFrames = Math.ceil(duration * fps);
  console.log(\`Rendering video (\${duration.toFixed(1)}s, \${totalFrames} frames)...\`);

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: totalFrames,
      fps,
    },
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: {
      videoUrl,
      captions,
      captionStyle,
    },
  });

  console.log(\`Video rendered successfully: \${outputPath}\`);
}

render().catch((error) => {
  console.error("Render error:", error);
  process.exit(1);
});
`;

    if (isLocal) {
      const responseData = {
        script: renderScript,
        renderedLocally: true,
        videoPath: renderedVideoPath ? path.relative(process.cwd(), renderedVideoPath) : null,
        error: renderError,
      };
      
      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new NextResponse(renderScript, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Content-Disposition": 'attachment; filename="render-video.js"',
      },
    });
  } catch (error: any) {
    console.error("Render error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate render script",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
