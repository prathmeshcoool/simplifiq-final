const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const FALLBACK_AUDIT = {
  companySummary: "AI analysis could not be completed for this company.",
  painPoints: [],
  aiOpportunities: [],
  recommendations: [],
};

const generateAudit = async (companyData) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an AI business consultant. You ONLY respond with valid JSON. No markdown, no explanation, no preamble — pure JSON only.",
        },
        {
          role: "user",
          content: `Analyze this company website content and return a JSON object with exactly these keys:
{
  "companySummary": "2-3 sentence summary of the company",
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "aiOpportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Company Website Content:
${companyData}`,
        },
      ],
      temperature: 0.3,
    });

    let content = response.choices[0].message.content;

    // Strip markdown code fences if model ignored the system prompt
    content = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Extract JSON if there's any surrounding text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    const parsed = JSON.parse(content);

    // Validate shape — ensure all expected keys are arrays/strings
    const audit = {
      companySummary:
        typeof parsed.companySummary === "string"
          ? parsed.companySummary
          : FALLBACK_AUDIT.companySummary,
      painPoints: Array.isArray(parsed.painPoints)
        ? parsed.painPoints
        : [],
      aiOpportunities: Array.isArray(parsed.aiOpportunities)
        ? parsed.aiOpportunities
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
    };

    return audit;
  } catch (error) {
    console.error("Groq Error:", error.message);
    return FALLBACK_AUDIT;
  }
};

module.exports = generateAudit;
