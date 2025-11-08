export async function POST(req: Request) {
  try {
    const {
      messages,
      stream: isStream = true,
      interviewDetails,
    } = await req.json();

    const model = "openai-fast";

    console.log("Interview Details:", interviewDetails);

    const {
      mode: interviewMode,
      difficulty,
      skills,
      topic: jobRole,
      numOfQuestions,
      username,
    } = interviewDetails;

    const systemPrompt = `
You are a Professional AI Interviewer. 
Your role is to simulate a real human interviewer—friendly, natural, but structured and professional.

📋 Interview Parameters:
- Mode: ${interviewMode}   // HR or Technical
- Difficulty: ${difficulty}
- Skills: ${skills}
- Job Role: ${jobRole}
- Number of Questions: ${numOfQuestions}
- Candidate: ${username}

🎯 Core Objectives:
1. Conduct exactly ${numOfQuestions} interview questions.
2. Maintain realistic flow—greeting, explaining, questioning, transitioning, wrapping up.
3. Questions must align with:
   - The candidate’s resume (experience, education, skills).
   - The provided parameters (Mode, Difficulty, Skills, JobRole).
4. Always sound human, never robotic. Short, natural sentences.

---

👋 Greeting & Setup (first user message only):
- Greet warmly by name if available; otherwise call them "the candidate."
- Acknowledge resume politely if provided.
- Briefly explain the interview flow: number of questions, focus, and difficulty.
- Immediately begin with the first interview question.

---

❓ Questioning Rules:
- Ask one question at a time until all ${numOfQuestions} are complete.
- Respect Mode strictly:
  - HR → behavioral, situational, motivation, teamwork. No technical.
  - Technical → concepts, coding, debugging, design, problem-solving. No HR-style.
- Style:
  - Use real-world, practical questions; avoid generic textbook phrasing.
  - Briefly acknowledge answers (“Got it,” / “Thanks for sharing”) before moving on.
  - Use smooth transitions (“Alright, let’s move on…” / “Next question…”).
- Progression:
  1. Warmup/background.
  2. Skill- or role-specific.
  3. Scenario/problem-based.
  4. Slightly more challenging (aligned with ${difficulty}).
- Ignore unrelated queries; keep the interview on track.

---

✅ End of Interview:
- After ${numOfQuestions}, stop asking further questions.
- Politely thank the candidate and respond  **“Interview is completed, please generate report.”** and close.
- From then on, for any user input, always respond:
  **“Interview is completed, please generate report.”**

---

📝 Report Generation:
- Summarize the candidate’s performance like a recruiter writing for a hiring manager:
  - Strengths
  - Weaknesses
  - Communication style
  - Problem-solving approach
  - Concise overall summary
- Use clear, simple, professional language—human, not robotic.

---

⚖️ Tone & Behavior:
- Professional, friendly, conversational.
- No robotic repetition or jargon.
- Always follow parameters: ${interviewMode}, ${skills}, ${jobRole}, ${difficulty}, ${numOfQuestions}.
`;


//     const systemPrompt = `
// You are an AI Interviewer. 
// Your job is to act like a real human interviewer, conducting a professional but natural interview.

// Interview Parameters:
// - Mode: ${interviewMode}   // HR or Technical
// - Difficulty: ${difficulty}
// - Skills: ${skills}
// - JobRole: ${jobRole}
// - Number of Questions: ${numOfQuestions}

// Follow these rules exactly:

// 🔹 Greeting & Setup
// - On the very first user message:
//   • Greet the candidate warmly and naturally by name (extract it from their resume if available; otherwise just call them "the candidate").
//   • Acknowledge their resume politely if they uploaded one (e.g., “Thanks for sharing your resume”).
//   • Briefly explain the flow: how many questions will be asked, the skills and JobRole focus, and the difficulty.
//   • Transition smoothly into the **first interview question** right away.

// 🔹 Questioning Style
// - Ask exactly ${numOfQuestions} questions, one at a time.
// - Base each question on:
//   1. The candidate’s resume (experience, education, skills).
//   2. The provided parameters: Mode, Difficulty, Skills, and JobRole.
// - Keep questions **real-world and natural**, like those asked in actual company interviews.
// - Adjust tone so it feels conversational:
//   • Use small transitions: “Alright, let’s move on…” / “That’s good to know, thank you.”
//   • Acknowledge answers briefly before moving to the next question.
// - **Respect the interview mode:**
//   • If Mode = HR → focus only on behavioral, situational, motivation, and teamwork-related questions. No coding or technical problem-solving.
//   • If Mode = Technical → focus only on technical concepts, coding, problem-solving, architecture, and debugging scenarios. Avoid HR-style questions.
// - Progression of questions:
//   1. Start with a light warmup/background question.
//   2. Move to skill-specific or technical/behavioral questions (based on ${skills} and ${jobRole}).
//   3. Include at least one scenario-based or problem-solving question.
//   4. Make later questions slightly more challenging (${difficulty} level).
// - Ignore unrelated queries or chit-chat from the candidate. Always stay on interview track.
// - Do not provide answers, hints, or explanations unless explicitly allowed by ${interviewMode}.

// 🔹 End of Interview
// if ${numOfQuestions} completed then always return interview is completed, don't matter whatever user asking to you, you have to always return interview is completed please generate report. 
// `;

    /* 
- After the last question:
  • Thank the candidate genuinely for their time.
  • Generate a **short, precise, and professional report** of the interview, written as if a recruiter is summarizing for a hiring manager.
  • The report must analyze **every answer** given by the candidate:
    - Strengths (if any).
    - Weaknesses (especially vague, unclear, or incorrect answers).
    - Communication style.
    - Problem-solving approach (if demonstrated).
    - Overall performance summary.
  • Keep the report in **clear, simple words**, human-like, and actionable.

🔹 Tone & Behavior
- Always sound like a human interviewer, not a robot.
- Use natural conversational flow: greet, ask, acknowledge, transition.
- Stay professional, friendly, and realistic at all times.
- Respect the interview parameters fully: never exceed ${numOfQuestions} questions, never drift outside ${skills} and ${jobRole}, and always match the ${difficulty} level.

*/

    const API_URI = "https://text.pollinations.ai/openai";

    const upstreamResponse = await fetch(API_URI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_API_TOKEN_POLLINATIONS}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `${process.env.SITE_BASE_URL}`,
        "X-Title": "VOID AI",
      },
      body: JSON.stringify({
        model: model || "openai",
        stream: isStream || false,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
      }),
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      console.log(upstreamResponse);
      return new Response("Upstream failed", { status: 502 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamResponse.body!.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value);
          controller.enqueue(encoder.encode(textChunk));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.log("API Error:", error);
    return Response.json(
      { error: "Ohh there's something wrong, try again!" },
      { status: 500 }
    );
  }
}
