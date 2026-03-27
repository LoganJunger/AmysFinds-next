import OpenAI from "openai";

export interface AnalysisResult {
  title: string;
  description: string;
  price_range: string;
  refinishing_tips: string;
  posting_details: string;
  condition_notes: string;
  key_features: string[];
}

const SYSTEM_PROMPT = `You are an expert antique furniture appraiser. Analyze this item and provide a detailed report including style, period, materials, condition, and market value. Format the response as JSON with the following fields: title, description, price_range, refinishing_tips, posting_details, condition_notes, key_features (array).

Rules:
- title: concise item name, max 200 chars
- price_range: market value range like "$150 - $300"
- description: detailed 2-4 sentence description
- refinishing_tips: practical restoration/care advice
- posting_details: marketplace listing tips
- condition_notes: current condition assessment
- key_features: array of 3-6 notable features as short strings

Return ONLY valid JSON, no markdown fences.`;

export async function analyzeImage(imageUrl: string): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this antique item and provide detailed information.",
          },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  // Extract JSON from response
  const startIdx = content.indexOf("{");
  const endIdx = content.lastIndexOf("}");

  if (startIdx < 0 || endIdx <= startIdx) {
    throw new Error("Invalid AI response format");
  }

  const result = JSON.parse(content.slice(startIdx, endIdx + 1));

  // Ensure all fields exist with defaults
  const defaults: AnalysisResult = {
    title: "Antique Item",
    description: "",
    price_range: "Contact for pricing",
    refinishing_tips: "",
    posting_details: "",
    condition_notes: "",
    key_features: [],
  };

  const analysis: AnalysisResult = { ...defaults, ...result };

  // Truncate to DB limits
  if (analysis.title.length > 200)
    analysis.title = analysis.title.slice(0, 197) + "...";
  if (analysis.price_range.length > 100)
    analysis.price_range = analysis.price_range.slice(0, 97) + "...";

  // Ensure key_features is an array
  if (!Array.isArray(analysis.key_features)) {
    analysis.key_features = analysis.key_features
      ? [String(analysis.key_features)]
      : [];
  }

  return analysis;
}
