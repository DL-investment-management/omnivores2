import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

function parseJSON(text) {
  const t = text.trim();
  try { return JSON.parse(t); } catch {
    const match = t.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Unparseable JSON from Gemini');
  }
}

export async function analyzeFridge(base64Image, profile = {}) {
  const dietNote = profile.dietary?.length ? `User is: ${profile.dietary.join(', ')}.` : '';
  const allergenNote = profile.allergens?.length ? `Allergens to flag: ${profile.allergens.join(', ')}.` : '';

  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    `Analyze this fridge photo. Identify every visible food item.
${dietNote} ${allergenNote}
Return ONLY JSON, no markdown:
{
  "items": [{
    "name": "string",
    "condition": "fresh"|"good"|"aging"|"spoiled",
    "daysLeft": number,
    "notes": "string",
    "allergenAlert": boolean,
    "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number }
  }]
}
Estimate nutrition per typical serving. Set allergenAlert true if item matches user allergens.`,
  ]);
  return parseJSON(result.response.text());
}

export async function getRecipes(items, profile = {}) {
  const sorted = [...items].sort((a, b) => a.daysLeft - b.daysLeft);
  const list = sorted.map(i => `${i.name} (${i.daysLeft}d, ${i.condition})`).join('\n');
  const dietNote = profile.dietary?.length ? `User dietary needs: ${profile.dietary.join(', ')}.` : '';

  const result = await model.generateContent(
    `Fridge items by urgency:\n${list}\n${dietNote}\nGenerate 3 recipes using soonest-expiring items. Return ONLY JSON:
{
  "recipes": [{
    "name": "string",
    "usesBefore": ["item names"],
    "ingredients": ["qty + ingredient"],
    "steps": ["step"],
    "timeMinutes": number,
    "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number }
  }]
}`
  );
  return parseJSON(result.response.text());
}

export async function getGroceryList(items) {
  const list = items.map(i => `${i.name} (${i.daysLeft}d left, ${i.condition})`).join('\n');
  const result = await model.generateContent(
    `Based on these fridge items:\n${list}\nGenerate a grocery list to restock expiring/missing essentials. Return ONLY JSON:
{
  "groceries": [{
    "name": "string",
    "category": "produce"|"dairy"|"meat"|"pantry"|"frozen"|"other",
    "priority": "urgent"|"soon"|"when-needed",
    "reason": "string"
  }]
}`
  );
  return parseJSON(result.response.text());
}

export async function getMealPlan(items) {
  const list = items.map(i => `${i.name} (${i.daysLeft}d left)`).join('\n');
  const result = await model.generateContent(
    `Fridge contents:\n${list}\nCreate a 7-day meal plan using these ingredients before they expire. Return ONLY JSON:
{
  "plan": [{
    "day": "Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"|"Sunday",
    "breakfast": "string",
    "lunch": "string",
    "dinner": "string",
    "usesBefore": ["item names used today"]
  }]
}`
  );
  return parseJSON(result.response.text());
}

export async function lookupBarcode(barcode) {
  const result = await model.generateContent(
    `Barcode: ${barcode}. If you recognize this product, return its food details. Otherwise make a best guess for a common grocery item with this barcode format. Return ONLY JSON:
{
  "name": "string",
  "condition": "fresh",
  "daysLeft": number,
  "notes": "string",
  "allergenAlert": false,
  "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number }
}`
  );
  return parseJSON(result.response.text());
}
