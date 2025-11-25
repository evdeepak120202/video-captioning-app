import { useVideoConfig, useCurrentFrame, spring, Video } from "remotion";
import { useMemo } from "react";
import { loadFont } from "@remotion/google-fonts/NotoSans";
import { loadFont as loadFontDevanagari } from "@remotion/google-fonts/NotoSansDevanagari";

const { fontFamily: notoSans } = loadFont();
const { fontFamily: notoSansDevanagari } = loadFontDevanagari();

export interface Caption {
  text: string;
  start: number;
  end: number;
}

interface VideoWithCaptionsProps {
  videoUrl: string;
  captions: Caption[];
  captionStyle: "bottom-centered" | "top-bar" | "karaoke";
}

export const VideoWithCaptions: React.FC<VideoWithCaptionsProps> = ({
  videoUrl,
  captions,
  captionStyle,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  const currentCaption = useMemo(() => {
    return captions.find(
      (cap) => currentTime >= cap.start && currentTime <= cap.end
    );
  }, [captions, currentTime]);

  const karaokeWord = useMemo(() => {
    if (captionStyle !== "karaoke" || !currentCaption) return null;
    const words = currentCaption.text.split(" ");
    const wordIndex = Math.floor(
      ((currentTime - currentCaption.start) /
        (currentCaption.end - currentCaption.start)) *
        words.length
    );
    return { words, activeIndex: Math.min(wordIndex, words.length - 1) };
  }, [currentCaption, currentTime, captionStyle]);

  const opacity = useMemo(() => {
    if (!currentCaption) return 0;
    const fadeIn = spring({
      frame: frame - currentCaption.start * fps,
      fps,
      config: { damping: 200, stiffness: 200 },
    });
    const fadeOut = spring({
      frame: frame - currentCaption.end * fps,
      fps,
      config: { damping: 200, stiffness: 200 },
    });
    return Math.max(0, Math.min(1, fadeIn * (1 - fadeOut)));
  }, [currentCaption, frame, fps]);

  const renderCaption = () => {
    if (!currentCaption) return null;

    const baseStyle: React.CSSProperties = {
      fontFamily: `${notoSansDevanagari}, ${notoSans}, sans-serif`,
      fontSize: "48px",
      fontWeight: 600,
      color: "#FFFFFF",
      textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
      opacity,
      transition: "opacity 0.2s",
      textRendering: "optimizeLegibility",
      fontFeatureSettings: '"liga" 1, "kern" 1',
    };

    switch (captionStyle) {
      case "bottom-centered":
        return (
          <div
            style={{
              ...baseStyle,
              position: "absolute",
              bottom: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              maxWidth: "90%",
              padding: "16px 32px",
              background: "rgba(0, 0, 0, 0.6)",
              borderRadius: "8px",
            }}
          >
            {currentCaption.text}
          </div>
        );

      case "top-bar":
        return (
          <div
            style={{
              ...baseStyle,
              position: "absolute",
              top: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              width: "100%",
              padding: "20px",
              background: "rgba(0, 0, 0, 0.8)",
              borderBottom: "4px solid #FFFFFF",
            }}
          >
            {currentCaption.text}
          </div>
        );

      case "karaoke":
        return (
          <div
            style={{
              ...baseStyle,
              position: "absolute",
              bottom: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              maxWidth: "90%",
              padding: "16px 32px",
              background: "rgba(0, 0, 0, 0.6)",
              borderRadius: "8px",
            }}
          >
            {karaokeWord ? (
              <span>
                {karaokeWord.words.map((word, index) => (
                  <span
                    key={index}
                    style={{
                      color:
                        index <= karaokeWord.activeIndex ? "#FFD700" : "#FFFFFF",
                      transition: "color 0.1s",
                    }}
                  >
                    {word}{" "}
                  </span>
                ))}
              </span>
            ) : (
              currentCaption.text
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getVideoSrc = () => {
    if (!videoUrl) return "";
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
      return videoUrl;
    }
    if (videoUrl.startsWith("/")) {
      if (typeof window !== "undefined") {
        return window.location.origin + videoUrl;
      }
      return videoUrl;
    }
    return videoUrl;
  };

  const videoSrc = getVideoSrc();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {videoSrc && (
        <Video
          src={videoSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          volume={1}
          startFrom={0}
          muted={false}
        />
      )}
      {renderCaption()}
    </div>
  );
};

