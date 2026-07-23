import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transcript =
      typeof body.transcript === "string" ? body.transcript.trim() : "";

    const contentType =
      typeof body.contentType === "string"
        ? body.contentType
        : "Reaction";

    if (transcript.length < 50) {
      return Response.json(
        { error: "Please provide a longer transcript." },
        { status: 400 },
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions: `
You are StudioClip AI, an expert short-form content strategist.

Analyze the transcript and identify the strongest moment for a
YouTube Short, TikTok, or Instagram Reel.

Look for:
- Strong opinions
- Emotional reactions
- Funny or surprising moments
- Debate-worthy statements
- Clear standalone ideas
- Strong opening hooks
- Moments with an emotional payoff

Return only valid JSON using this exact structure:

{
  "title": "string",
  "startTime": "string",
  "endTime": "string",
  "score": 90,
  "hook": "string",
  "whyItWorks": "string",
  "thumbnailText": "string",
  "caption": "string",
  "editingNotes": ["string", "string", "string"]
}
      `,
      input: `
Content type: ${contentType}

Transcript:

${transcript}
      `,
    });

    const cleanedText = response.output_text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    const result = JSON.parse(cleanedText);

    return Response.json({ result });
  } catch (error) {
    console.error("StudioClip analysis error:", error);

    return Response.json(
      {
        error: "StudioClip could not analyze this transcript.",
      },
      { status: 500 },
    );
  }
}