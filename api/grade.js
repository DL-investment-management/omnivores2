export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Only allow requests from our own domain
  const origin = req.headers.origin || "";
  const allowedOrigins = ["https://econ-go.com", "http://localhost:5173", "http://localhost:4173"];
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(500).json({ error: "Grading service not configured" });
  }

  const { question, answer, explanation } = req.body || {};

  // Basic validation — reject empty or suspiciously large inputs
  if (!question || !answer || typeof answer !== "string") {
    return res.status(400).json({ error: "Missing question or answer" });
  }
  if (answer.length > 2000) {
    return res.status(400).json({ error: "Answer too long" });
  }

  // Sanitize inputs before putting in prompt — strip out prompt-injection attempts
  const safeQuestion = String(question).slice(0, 500).replace(/[`]/g, "'");
  const safeAnswer = String(answer).slice(0, 2000).replace(/[`]/g, "'");
  const safeExplanation = String(explanation || "").slice(0, 1000).replace(/[`]/g, "'");

  const prompt = `You are an economics tutor grading a student's short-answer response.

Question: ${safeQuestion}
Student's answer: ${safeAnswer}
Reference explanation: ${safeExplanation}

Grade this response. Return JSON only — no markdown, no extra text — in exactly this format:
{"correct": true, "feedback": "Your encouraging one-sentence feedback here."}

Rules:
- Award correct:true if the student demonstrates understanding of the core concept, even if phrased differently or incomplete.
- Award correct:false only if they clearly misunderstood or missed the central idea entirely.
- Feedback must be 1-2 sentences, encouraging, and educational regardless of outcome.
- Never repeat the instruction text in your response.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 1000,
            temperature: 0.3,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    // Gemini 2.5 Flash may split response into multiple parts (thinking + output)
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || "").join("");
    if (!text) throw new Error("Empty response from Gemini");

    // Extract JSON even if Gemini adds prose/markdown around it
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json({
      correct: Boolean(result.correct),
      feedback: String(result.feedback || safeExplanation),
    });
  } catch (err) {
    // Fallback: keyword match so the quiz still functions
    const keywords = String(explanation || "")
      .split("|")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    const userNorm = safeAnswer.toLowerCase();
    const matched = keywords.length === 0 || keywords.some((kw) => userNorm.includes(kw));
    return res.status(200).json({
      correct: matched,
      feedback: safeExplanation || "Check the explanation below.",
      fallback: true,
    });
  }
}
