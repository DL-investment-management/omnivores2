import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function analyzeFridge(base64Image) {
  const result = await model.generateContent([
    {
      inlineData: { mimeType: 'image/jpeg', data: base64Image },
    },
    `Analyze this fridge photo. Identify every visible food item and assess each one.
Return ONLY a JSON object with this exact shape, no markdown, no explanation:
{
  "items": [
    {
      "name": "string",
      "condition": "fresh" | "good" | "aging" | "spoiled",
      "daysLeft": number,
      "notes": "string"
    }
  ]
}
Estimate daysLeft conservatively based on visual condition. If spoiled, set daysLeft to 0.`,
  ]);

  const text = result.response.text().trim();
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Gemini returned unparseable JSON');
  }
}

export async function getRecipes(items) {
  const sorted = [...items].sort((a, b) => a.daysLeft - b.daysLeft);
  const itemList = sorted.map(i => `${i.name} (${i.daysLeft} days left, ${i.condition})`).join('\n');

  const result = await model.generateContent(
    `These are the items in my fridge, sorted by urgency:\n${itemList}\n\nGenerate 3 recipes that use the items expiring soonest. Return ONLY a JSON object, no markdown:
{
  "recipes": [
    {
      "name": "string",
      "usesBefore": ["item names expiring soon used in this recipe"],
      "ingredients": ["ingredient with quantity"],
      "steps": ["step string"],
      "timeMinutes": number
    }
  ]
}`
  );

  const text = result.response.text().trim();
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Gemini returned unparseable JSON');
  }
}
