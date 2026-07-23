"use client";

import { useState } from "react";

type ClipResult = {
  title: string;
  startTime: string;
  endTime: string;
  score: number;
  hook: string;
  whyItWorks: string;
  thumbnailText: string;
  caption: string;
  editingNotes: string[];
};

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [contentType, setContentType] = useState("Reaction");
  const [result, setResult] = useState<ClipResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function analyzeTranscript() {
    if (transcript.trim().length < 50) {
      setErrorMessage("Please paste a longer transcript first.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setResult(null);

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

      setResult(data.result);
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
            Paste a transcript and StudioClip will identify strong moments,
            hooks, captions, thumbnail text, and editing ideas.
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
            {isLoading ? "Analyzing..." : "Analyze Transcript"}
          </button>

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-red-950 p-4 text-red-200">
              {errorMessage}
            </p>
          )}
        </section>

        {result && (
          <section className="mt-10">
            <h2 className="mb-5 text-3xl font-bold">StudioClip Results</h2>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-violet-400">
                    {contentType} · Clip 1
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
                  title="Why it works"
                  text={result.whyItWorks}
                />

                <ResultItem
                  title="Thumbnail text"
                  text={result.thumbnailText}
                />

                <ResultItem title="Caption" text={result.caption} />

                <div>
                  <h4 className="font-semibold text-white">Editing notes</h4>

                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {result.editingNotes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}

function ResultItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div>
      <h4 className="font-semibold text-white">{title}</h4>
      <p className="mt-1">{text}</p>
    </div>
  );
}