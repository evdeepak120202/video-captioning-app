const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const path = require("path");
const fs = require("fs");

async function renderVideo() {
  const data = JSON.parse(process.argv[2]);
  const { videoUrl, captions, captionStyle, fps, duration } = data;

  try {
    const outDir = path.join(process.cwd(), "out");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const timestamp = Date.now();
    const outputPath = path.join(outDir, `captioned-video-${timestamp}.mp4`);

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
        captionStyle: captionStyle || "bottom-centered",
      },
    });

    const totalFrames = Math.ceil(duration * fps);
    console.log(`Rendering video (${duration.toFixed(1)}s, ${totalFrames} frames)...`);

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
        captionStyle: captionStyle || "bottom-centered",
      },
    });

    console.log(`Video rendered successfully: ${outputPath}`);
    console.log(`__RENDER_RESULT__${JSON.stringify({ success: true, path: outputPath })}__END__`);
    process.exit(0);
  } catch (error) {
    console.error("Render error:", error);
    console.log(`__RENDER_RESULT__${JSON.stringify({ success: false, error: error.message })}__END__`);
    process.exit(1);
  }
}

renderVideo();

