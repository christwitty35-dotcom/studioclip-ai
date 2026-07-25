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
  "strengths": [
    "string"
  ],
  "improvements": [
    "string"
  ],
  "coachingInsight": "string",
  "thumbnailText": "string",
  "caption": "string",
  "editingNotes": [
    "string",
    "string",
    "string"
  ]
}
      `,
      input: `
Content type: ${contentType}
For "strengths":
- Return 3 to 5 short bullet-style strengths.
- Focus on qualities like emotion, hook, clarity, payoff, humor, surprise, or discussion potential.
- Do NOT claim the clip will go viral.

For "improvements":
- Return 1 to 3 constructive suggestions.
- Focus on trimming, pacing, framing, captions, or ending the clip at a stronger point.
- If the clip is already excellent, suggest only small refinements.

For "coachingInsight":
- Write 2 to 3 sentences.
- Explain what the creator can learn from this moment.
- Be encouraging, specific, and honest.
- Never promise views or virality.
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
console.log(result);
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