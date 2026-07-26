"use client";

import { useState } from "react";

type ClipResult = {
  title: string;
  startTime: string;
  endTime: string;
  score: number;
  hook: string;

  strengths: string[];
  improvements: string[];
  coachingInsight: string;

  thumbnailText: string;
  caption: string;
  editingNotes: string[];
};

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [contentType, setContentType] = useState("Reaction");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [results, setResults] = useState<ClipResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
async function handleTranscribeVideo() {
  if (!videoFile) {
    return;
  }

  const formData = new FormData();
  formData.append("file", videoFile);

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

console.log("Transcribe response:", data);

if (data.transcript) {
  setTranscript(data.transcript);
}
}
  async function analyzeTranscript() {
    if (transcript.trim().length < 50) {
      setErrorMessage("Please paste a longer transcript first.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setResults([]);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          contentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      if (Array.isArray(data.result)) {
  setResults(data.result);
} else if (data.result && typeof data.result === "object") {
  setResults([data.result]);
} else {
  throw new Error("StudioClip did not return a valid clip.");
}
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-violet-400">
            StudioClip AI
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">
            Find the best Shorts inside your long videos.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            Paste a transcript and receive up to five strong clip ideas,
            complete with hooks, captions, thumbnail text, and editing notes.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <label className="mb-2 block font-semibold">Content type</label>

          <select
            value={contentType}
            onChange={(event) => setContentType(event.target.value)}
            className="mb-6 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3"
          >
            <option>Reaction</option>
            <option>Podcast</option>
            <option>Gaming</option>
            <option>Commentary</option>
          </select>

          <label className="mb-2 block font-semibold">
            Timestamped transcript
          </label>
<input
  type="file"
  accept="video/mp4,video/quicktime,video/webm"
  onChange={(event) => {
    const file = event.target.files?.[0] ?? null;
    setVideoFile(file);
  }}
/>

<div className="mt-2 text-sm text-zinc-400">
  {videoFile ? (
    <>
      <p>
        Selected:{" "}
        <span className="font-semibold text-white">
          {videoFile.name}
        </span>
      </p>

      <p className="mt-1">
        File size: {(videoFile.size / 1024 / 1024).toFixed(2)} MB
      </p>
      <p className="mt-1 font-semibold text-emerald-400">
  ✓ Ready to transcribe
</p>
<button
  type="button"
  onClick={handleTranscribeVideo}
  className="mt-3 rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-500"
>
  Transcribe Video
</button>

    </>
  ) : (
    <p>No video selected yet</p>
  )}
</div>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder={`00:00 Welcome back to the channel...\n00:22 I cannot believe that just happened...`}
            className="min-h-72 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4"
          />

          <button
            onClick={analyzeTranscript}
            disabled={isLoading}
            className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-bold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Finding your best clips..." : "Analyze Transcript"}
          </button>

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-red-950 p-4 text-red-200">
              {errorMessage}
            </p>
          )}
        </section>

        {results.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
                  Analysis complete
                </p>

                <h2 className="mt-1 text-3xl font-bold">
                  StudioClip Results
                </h2>
              </div>

              <p className="text-zinc-400">
                {results.length} clip{results.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="space-y-6">
              {results.map((result, index) => (
                <ClipCard
                  key={`${result.title}-${index}`}
                  result={result}
                  index={index}
                  contentType={contentType}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ClipCard({
  result,
  index,
  contentType,
}: {
  result: ClipResult;
  index: number;
  contentType: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-violet-400">
            {contentType} · Clip {index + 1}
          </p>

          <h3 className="mt-1 text-2xl font-bold">{result.title}</h3>

          <p className="mt-1 text-zinc-400">
            {result.startTime}–{result.endTime}
          </p>
        </div>

        <span className="rounded-full bg-violet-950 px-4 py-2 font-bold text-violet-200">
          {result.score}/100
        </span>
      </div>

      <div className="mt-6 space-y-5 text-zinc-300">
        <ResultItem title="Hook" text={result.hook} />

<ResultItem
  title="Strengths"
  text={result.strengths.join("\n\n")}
  tone="strength"
/>

<ResultItem
  title="Improvements"
  text={result.improvements.join("\n\n")}
  tone="improvement"
/>

<ResultItem
  title="Coaching insight"
  text={result.coachingInsight}
  tone="coaching"
/>

        <ResultItem
          title="Thumbnail text"
          text={result.thumbnailText}
        />

        <ResultItem title="Caption" text={result.caption} />

        <ResultItem
  title="Editing notes"
  text={result.editingNotes.join("\n\n")}
/>
      </div>
    </article>
  );
}

function ResultItem({
  title,
  text,
  tone = "default",
}: {
  title: string;
  text: string;
  tone?: "default" | "strength" | "improvement" | "coaching";
}) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
  await navigator.clipboard.writeText(text);
  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 1500);
};

  const toneStyles = {
    default: "border-zinc-800",
    strength: "border-emerald-800 bg-emerald-950/20",
    improvement: "border-amber-800 bg-amber-950/20",
    coaching: "border-violet-800 bg-violet-950/20",
  };

  const toneIcons = {
    default: "",
    strength: "✓ ",
    improvement: "↗ ",
    coaching: "🧠 ",
  };

  

  return (
    <div className={`rounded-xl border p-4 ${toneStyles[tone]}`}>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-white">
  {toneIcons[tone]}
  {title}
</h4>

        <button
          onClick={copyText}
          className="rounded-lg bg-violet-600 px-3 py-1 text-sm font-semibold hover:bg-violet-500"
        >
          {copied ? "✅ Copied!" : "📋 Copy"}
        </button>
      </div>

      <p className="whitespace-pre-line text-zinc-300">
  {text}
</p>
    </div>
  );
}
 