import { execFile } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No video file received." },
        { status: 400 }
      );
    }
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

const tempVideoPath = path.join(
  os.tmpdir(),
  `studioclip-${Date.now()}-${file.name}`
);

await writeFile(tempVideoPath, buffer);

console.log("Saved temp video:", tempVideoPath);
const tempAudioPath = path.join(
  os.tmpdir(),
  `studioclip-${Date.now()}.mp3`
);

await execFileAsync(
  "C:\\Users\\ctwit\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.2-full_build\\bin\\ffmpeg.exe",
  [
  "-i",
  tempVideoPath,
  "-vn",
  "-ac",
  "1",
  "-ar",
  "16000",
  "-b:a",
  "64k",
  tempAudioPath,
]);

console.log("Created temp audio:", tempAudioPath);
const audioBuffer = await readFile(tempAudioPath);

console.log("Audio file size:", audioBuffer.length);
const transcriptionForm = new FormData();

transcriptionForm.append(
  "file",
  new Blob([audioBuffer], { type: "audio/mpeg" }),
  "audio.mp3"
);

transcriptionForm.append("model", "whisper-1");
transcriptionForm.append("response_format", "verbose_json");
transcriptionForm.append("timestamp_granularities[]", "segment");

const transcriptionResponse = await fetch(
  "https://api.openai.com/v1/audio/transcriptions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: transcriptionForm,
  }
);

const transcriptionData = await transcriptionResponse.json();
console.log("Full transcription data:", transcriptionData);
if (!transcriptionResponse.ok) {
  console.error("OpenAI transcription error:", transcriptionData);
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

const timestampedTranscript =
  transcriptionData.segments
    ?.map(
      (segment: { start: number; end: number; text: string }) =>
        `${formatTime(segment.start)} ${segment.text.trim()}`
    )
    .join("\n") ?? transcriptionData.text;
  return NextResponse.json(
    {
      error:
        transcriptionData.error?.message ||
        "Failed to transcribe audio.",
    },
    { status: transcriptionResponse.status }
  );
}
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

const timestampedTranscript =
  transcriptionData.segments
    ?.map(
      (segment: { start: number; end: number; text: string }) =>
        `${formatTime(segment.start)} ${segment.text.trim()}`
    )
    .join("\n") ?? transcriptionData.text;
console.log("Timestamped transcript:", timestampedTranscript);
    return NextResponse.json({
  message: "Video transcribed!",
  fileName: file.name,
  transcript: timestampedTranscript,
});
  } catch (error) {
    console.error("Transcribe upload error:", error);

    return NextResponse.json(
      { error: "Failed to receive video." },
      { status: 500 }
    );
  }
}