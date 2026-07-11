const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function extractCRM(records) {
  const prompt = `
You are an AI CRM Data Extraction Assistant.

Convert each CSV row into this JSON format:

[
  {
    "created_at":"",
    "name":"",
    "email":"",
    "country_code":"",
    "mobile_without_country_code":"",
    "company":"",
    "city":"",
    "state":"",
    "country":"",
    "lead_owner":"",
    "crm_status":"",
    "crm_note":"",
    "data_source":"",
    "possession_time":"",
    "description":""
  }
]

Rules:
- Detect columns intelligently.
- If a field doesn't exist, return an empty string.
- Return ONLY a valid JSON array.
- No markdown.
- No explanation.
`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: JSON.stringify(records),
      },
    ],
  });

  const text = response.choices[0].message.content.trim();

  // Remove markdown if Gemini returns it
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

module.exports = extractCRM;