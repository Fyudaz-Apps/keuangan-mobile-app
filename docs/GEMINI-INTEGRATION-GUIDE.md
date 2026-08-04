# Gemini AI Integration Guide
## Keuangan Mobile App - AI Transaction Parsing

**Version**: 2.0  
**Date**: 2026-08-05  
**Scope**: Natural-language transaction parsing (text input only). Receipt OCR / voice input are NOT implemented.

---

## What the code actually does

`src/services/geminiService.ts` exports one function:

```typescript
parseTransactionWithAI(input: string): Promise<ParsedTransaction>
```

It parses a free-text description (e.g. `"beli makan siang 25rb"`) into a structured transaction:

```typescript
interface ParsedTransaction {
  amount: number;                        // positive number, IDR
  description: string;
  category: string;                      // from DEFAULT_CATEGORIES
  type: 'income' | 'expense';
}
```

**Provider selection** (evaluated once at module load):

| Condition | Provider |
|-----------|----------|
| `EXPO_PUBLIC_9ROUTER_URL` AND `EXPO_PUBLIC_9ROUTER_API_KEY` set | **9router** (OpenAI-compatible `/chat/completions`) |
| otherwise | **Gemini** (direct HTTP to `generativelanguage.googleapis.com`) |

Both use plain `fetch` — no SDK (`@google/generative-ai` is NOT installed). There is no image or audio parsing, no `retryWithBackoff`, no `validateApiKey`, no hooks/components for receipts or voice.

---

## Setup

1. Get a Gemini API key: https://aistudio.google.com/apikey (keys always start with `AIza`)
2. Add to `.env` (gitignored; use `.env.example` as template):

```
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
```

Optional — 9router local proxy (used instead of Gemini when both are set):

```
EXPO_PUBLIC_9ROUTER_URL=http://localhost:20128/v1
EXPO_PUBLIC_9ROUTER_API_KEY=sk-...
EXPO_PUBLIC_9ROUTER_MODEL=gpt-4o-mini
```

3. Restart the dev server (`npm start`) — `EXPO_PUBLIC_*` vars are inlined at bundle time. A fast refresh is not enough.

---

## How parsing works

- Prompt asks the model to return JSON only:
  `{"amount": <number>, "description": "<string>", "category": "<string>", "type": "<income|expense>"}`
- Rules baked into the prompt: amounts are positive IDR; `rb`/`ribu` = thousands, `jt`/`juta` = millions; type defaults to `expense` unless text suggests income (`gaji`, `salary`, `bonus`, ...).
- Response is passed through a JSON-extraction regex and validated (amount number > 0, type in `income|expense`). Invalid output throws `AI returned an invalid transaction format.`

---

## Error handling

| Situation | Result |
|-----------|--------|
| No Gemini key set | Request hits the API with an empty key → HTTP 400 `API_KEY_INVALID` (logged as `Gemini API error: ...`) |
| 9router key/URL missing | 9router is skipped entirely; Gemini is used |
| Model returns non-JSON | `Could not parse AI response into a transaction.` |
| Model returns invalid shape | `AI returned an invalid transaction format.` |
| HTTP non-2xx | throws `Gemini API request failed: <status>` / `9router API request failed: <status>` |

There is no automatic retry.

---

## Cost / limits

- Applies to Gemini free tier: 1,500 requests/day (subject to Google pricing at https://ai.google.dev). No billing config is wired into the app.
- 9router is expected to be a local proxy; cost depends on the upstream model it routes to.

---

## Troubleshooting

- **`API key not valid` (HTTP 400)**: the key in `.env` is wrong, expired, or not an `AIza...` key. Fix `.env`, then restart `npm start`.
- **Parsing fails after adding a key**: verify the var name `EXPO_PUBLIC_GEMINI_API_KEY` (the `EXPO_PUBLIC_` prefix is required) and restart Metro.
- **Empty key / wrong provider**: app falls back to Gemini only when 9router URL/key are both missing. If you want Gemini, leave the `EXPO_PUBLIC_9ROUTER_*` vars out of `.env`.

---

**Last Updated**: 2026-08-05
