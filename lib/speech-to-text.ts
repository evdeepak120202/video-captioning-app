/**
 * Free Speech-to-Text using Browser Web Speech API
 * Completely free, no API keys required
 * Works in browser only
 */

export interface Caption {
  text: string;
  start: number;
  end: number;
}

export class SpeechToText {
  private recognition: any;
  private isSupported: boolean;
  private captions: Caption[] = [];
  private startTime: number = 0;
  private currentSegment: { text: string; start: number } | null = null;

  constructor() {
    // Check for browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    
    this.isSupported = !!SpeechRecognition;

    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "hi-IN"; // Hindi-India (supports Hinglish)
    }
  }

  /**
   * Transcribe audio from video element
   */
  async transcribeVideo(videoElement: HTMLVideoElement): Promise<Caption[]> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(
          new Error(
            "Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari."
          )
        );
        return;
      }

      this.captions = [];
      this.startTime = Date.now();

      // Set up recognition handlers
      this.recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const isFinal = event.results[current].isFinal;

        const currentTime = (Date.now() - this.startTime) / 1000;

        if (isFinal) {
          if (this.currentSegment) {
            // Finalize current segment
            this.captions.push({
              text: this.currentSegment.text + transcript,
              start: this.currentSegment.start,
              end: currentTime,
            });
            this.currentSegment = null;
          } else {
            // New segment
            this.captions.push({
              text: transcript,
              start: currentTime - 2, // Approximate start
              end: currentTime,
            });
          }
        } else {
          // Interim result
          if (!this.currentSegment) {
            this.currentSegment = {
              text: transcript,
              start: currentTime,
            };
          } else {
            this.currentSegment.text = transcript;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // Finalize any pending segment
        if (this.currentSegment) {
          const currentTime = (Date.now() - this.startTime) / 1000;
          this.captions.push({
            text: this.currentSegment.text,
            start: this.currentSegment.start,
            end: currentTime,
          });
        }
        resolve(this.captions);
      };

      // Start recognition
      this.recognition.start();

      // Stop recognition when video ends
      const onVideoEnd = () => {
        this.recognition.stop();
        videoElement.removeEventListener("ended", onVideoEnd);
      };
      videoElement.addEventListener("ended", onVideoEnd);
    });
  }

  /**
   * Stop recognition
   */
  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Check if speech recognition is supported
   */
  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }
}

