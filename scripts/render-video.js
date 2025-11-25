/**
 * Helper script to render videos with captions
 * Usage: node scripts/render-video.js <videoUrl> <captionsJson> <style> <outputPath>
 * 
 * Example:
 * node scripts/render-video.js /uploads/video.mp4 '[{"text":"Hello","start":0,"end":2}]' bottom-centered out/video.mp4
 */

const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const path = require("path");

async function renderVideo() {
  const [videoUrl, captionsJson, captionStyle = "bottom-centered", outputPath = "out/video.mp4"] = process.argv.slice(2);

  if (!videoUrl || !captionsJson) {
    console.error("Usage: node scripts/render-video.js <videoUrl> <captionsJson> <style> <outputPath>");
    process.exit(1);
  }

  try {
    const captions = JSON.parse(captionsJson);
    
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

    const duration = Math.max(...captions.map((cap) => cap.end), 10);
    const fps = 30;

    console.log(`Rendering video (${duration}s, ${Math.ceil(duration * fps)} frames)...`);
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames: Math.ceil(duration * fps),
        fps,
      },
      serveUrl: bundled,
      codec: "h264",
      outputLocation: path.join(process.cwd(), outputPath),
      inputProps: {
        videoUrl,
        captions,
        captionStyle,
      },
    });

    console.log(`✅ Video rendered successfully: ${outputPath}`);
  } catch (error) {
    console.error("❌ Render error:", error);
    process.exit(1);
  }
}

renderVideo();

