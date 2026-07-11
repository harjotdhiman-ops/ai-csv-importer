const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${prompt}\n\n${JSON.stringify(records)}`,
  });

  const text = response.text.trim();

  // Remove markdown if Gemini returns it
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

module.exports = extractCRM;