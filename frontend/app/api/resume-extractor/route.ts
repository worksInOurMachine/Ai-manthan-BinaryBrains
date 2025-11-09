export async function POST(req: Request) {
  try {
    const { messages=[] } = await req.json();

    const model = "mistral";
const systemPrompt =  `
You are a highly accurate resume parsing model. You receive a resume image and must extract key data fields needed to configure an AI interview.

Your output must be a **strict JSON object** matching the structure below — no extra text, markdown, or explanations.

{
  "candidateName": "Full name of the candidate",
  "skills": "Comma-separated list of main skills or technologies (e.g., React,Node.js,MongoDB) and also in camelCases without spaces",
  "topic": "Job role or specialization (e.g., Frontend Developer, Data Analyst)",
  "difficulty": "easy | medium | hard (estimate based on experience or skill level, use 'medium' if unclear)",
  "mode": "Technical | HR (guess based on resume focus, default to Technical)",
  "experience": "Number of years or 'Fresher' if no experience mentioned",
  "education": "Highest qualification or degree (e.g., BCA, B.Tech, MCA)",
  "projects": [
    {
      "title": "Project name",
      "description": "Short 1–2 line project summary"
    }
  ]
}

### Rules
1. Output **only valid JSON**, no extra characters or text dont give '''json just start with { and end with }.
2. Include all keys, even if null or empty.
3. Use concise values — no long paragraphs.
4. For 'skills', join them as a comma-separated string for easier use in forms.
5. For 'topic', prefer the job title, specialization, or last relevant role.
6. If unsure, set 'difficulty' to "medium" and 'mode' to "Technical".
7. Do **not** guess unrelated information.

Goal: Return structured data that can prefill the interview setup UI (candidate name, skills, topic, difficulty, mode, etc.) directly.
`;

    const API_URI = "https://text.pollinations.ai/openai";
    const response = await fetch(API_URI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_API_TOKEN_POLLINATIONS}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
      }),
    });

    const data = await response.json();

  let content = data?.choices?.[0]?.message?.content?.trim() || "";

  // console.log("Generated Resume Extraction:", content);

    return new Response(content, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Data Extraction error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to Extract Data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
