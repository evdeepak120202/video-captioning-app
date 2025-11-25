import { Composition, registerRoot } from "remotion";
import { VideoWithCaptions, Caption } from "./VideoWithCaptions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoWithCaptions"
        component={VideoWithCaptions as React.ComponentType<any>}
        durationInFrames={3000}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoUrl: "",
          captions: [] as Caption[],
          captionStyle: "bottom-centered" as const,
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);

