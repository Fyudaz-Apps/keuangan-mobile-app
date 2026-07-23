const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface ParsedTransaction {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

const DEFAULT_CATEGORIES = [
  'Food',
  'Transport',
  'Entertainment',
  'Utilities',
  'Health',
  'Education',
  'Shopping',
  'Salary',
  'Other',
];

/**
 * Parse a natural language text input into a structured transaction
 * using Google Gemini API (direct HTTP fetch).
 */
export async function parseTransactionWithAI(
  input: string,
): Promise<ParsedTransaction> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'Gemini API key is not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.',
    );
  }

  const prompt = `You are a financial transaction parser for an Indonesian personal finance app.
Parse the following text into a structured transaction.

Available categories: ${DEFAULT_CATEGORIES.join(', ')}

Rules:
- "amount" must be a positive number in IDR (Indonesian Rupiah).
- Common abbreviations: "rb" or "ribu" = thousands, "jt" or "juta" = millions.
- "type" is "expense" by default, unless the text clearly indicates income (e.g., "gaji", "salary", "terima", "dapat", "bonus").
- "category" must be one of the available categories listed above. Pick the closest match.
- "description" should be a concise summary of the transaction.

Text: "${input}"

Respond ONLY with a valid JSON object (no markdown, no explanation):
{"amount": <number>, "description": "<string>", "category": "<string>", "type": "<income|expense>"}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 256,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API error:', errorBody);
    throw new Error(`Gemini API request failed: ${response.status}`);
  }

  const data = await response.json();

  const textContent =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Extract JSON from the response (handle possible markdown wrapping)
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response into a transaction.');
  }

  const parsed: ParsedTransaction = JSON.parse(jsonMatch[0]);

  // Validate parsed result
  if (
    typeof parsed.amount !== 'number' ||
    parsed.amount <= 0 ||
    !parsed.description ||
    !parsed.category ||
    !['income', 'expense'].includes(parsed.type)
  ) {
    throw new Error('AI returned an invalid transaction format.');
  }

  return parsed;
}

/**
 * Check if the Gemini API key is configured
 */
export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}
