import { getGeminiKey } from './keyService';

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

export interface GeminiImage {
  mimeType: string;
  base64: string;
}

function buildPrompt(input: string): string {
  return `You are a financial transaction parser for an Indonesian personal finance app.
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
}

function buildReceiptPrompt(): string {
  return `You are a financial transaction parser for an Indonesian personal finance app.
Read the receipt image and extract the transaction.

Available categories: ${DEFAULT_CATEGORIES.join(', ')}

Rules:
- "amount" must be a positive number in IDR (Indonesian Rupiah). Use the total amount if present.
- "type" is "expense" (receipts are expenses).
- "category" must be one of the available categories listed above. Pick the closest match.
- "description" should be a concise summary of the store or items.

Respond ONLY with a valid JSON object (no markdown, no explanation):
{"amount": <number>, "description": "<string>", "category": "<string>", "type": "<income|expense>"}`;
}

async function callGemini(prompt: string, image?: GeminiImage): Promise<ParsedTransaction> {
  const apiKey = await getGeminiKey();
  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Add one in Settings or via EXPO_PUBLIC_GEMINI_API_KEY in your .env file.'
    );
  }

  const parts: any[] = [];
  if (image) {
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.base64 } });
  }
  parts.push({ text: prompt });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API error:', errorBody);
    throw new Error(`Gemini API request failed: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response into a transaction.');
  }

  const parsed: ParsedTransaction = JSON.parse(jsonMatch[0]);

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
 * Parse a natural language text input into a structured transaction
 * using Google Gemini API (direct HTTP fetch).
 */
export async function parseTransactionWithAI(input: string): Promise<ParsedTransaction> {
  return callGemini(buildPrompt(input));
}

/**
 * Parse a receipt image into a structured transaction using Gemini vision.
 */
export async function parseReceiptWithAI(image: GeminiImage): Promise<ParsedTransaction> {
  return callGemini(buildReceiptPrompt(), image);
}

/**
 * Check if the Gemini API key is configured
 */
export async function isGeminiConfigured(): Promise<boolean> {
  return !!(await getGeminiKey());
}
