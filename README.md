# Video Captioning Platform

A web application that allows users to upload MP4 videos, automatically generate captions, and render them onto videos using Remotion.

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```env
ASSEMBLY_AI_API=your_assemblyai_api_key_here
```

Get your API key from [AssemblyAI](https://www.assemblyai.com/).

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload an MP4 video file
2. Click "Generate Captions" to transcribe the audio
3. Select a caption style (bottom-centered, top-bar, or karaoke)
4. Preview the video with captions
5. Export the captioned video

When running locally, clicking "Get Render Script" will automatically render the video and save it to the `out` folder.
