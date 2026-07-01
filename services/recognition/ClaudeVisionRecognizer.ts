import { IStickerRecognizer, DetectedSticker } from '@/types';

// ─── API key helpers ────────────────────────────────────────────────────────

export const CLAUDE_KEY_STORAGE = 'figuru_claude_api_key';

export function getClaudeApiKey(): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(CLAUDE_KEY_STORAGE) : null;
  } catch {
    return null;
  }
}

export function setClaudeApiKey(key: string) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (key) localStorage.setItem(CLAUDE_KEY_STORAGE, key);
      else localStorage.removeItem(CLAUDE_KEY_STORAGE);
    }
  } catch { /* noop */ }
}

// ─── Sticker ID from Claude output ─────────────────────────────────────────

// Builds a stable ID from country + number (e.g. "FRA014").
// Falls back to normalized name when number is unavailable.
function buildStickerId(country: string | null | undefined, number: number | null | undefined, name: string): string {
  const c = (country ?? 'UNK').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  if (number && number > 0) {
    return `${c}${String(number).padStart(3, '0')}`;
  }
  const normName = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12);
  return `${c}_${normName}`;
}

// ─── Prompt ────────────────────────────────────────────────────────────────

const PROMPT = `You are reading the BACK of one or more Panini FIFA World Cup 2026 stickers.
The back of each sticker shows a 3-letter country code and a number from 1 to 20 (e.g. "FRA 14", "BRA 7", "USA 3").
Valid country codes: MEX RSA KOR CZE CAN BIH QAT SUI BRA MAR HAI SCO USA PAR AUS TUR GER CUW CIV ECU NED JPN SWE TUN BEL EGY IRN NZL ESP CPV KSA URU FRA SEN IRQ NOR ARG ALG AUT JOR POR COD UZB COL ENG CRO GHA PAN FWC CC

For EACH sticker visible, extract:
- country: the 3-letter code exactly as printed
- number: the number (integer 0-20, or for CC stickers the numeric part of "CC1"-"CC14")

Respond with ONLY a valid JSON array, no explanation:
[{"country": "FRA", "number": 14}, {"country": "BRA", "number": 7}]

If only one sticker is visible, still return an array with one element. Use null for fields you cannot read.`;

// ─── Recognizer ────────────────────────────────────────────────────────────

export class ClaudeVisionRecognizer implements IStickerRecognizer {
  private log: (msg: string) => void;

  constructor(log?: (msg: string) => void) {
    this.log = log ?? ((msg) => console.log('[ClaudeVision]', msg));
  }

  get isReady() { return !!getClaudeApiKey(); }

  async recognize(frame: unknown): Promise<DetectedSticker[]> {
    if (typeof frame !== 'string') return [];
    const apiKey = getClaudeApiKey();
    if (!apiKey) { this.log('ERR: sem API key'); return []; }

    const match = (frame as string).match(/^data:([^;]+);base64,(.+)$/);
    if (!match) { this.log('ERR: imagem inválida'); return []; }
    const [, mediaType, base64Data] = match;

    this.log(`enviando p/ Claude (${Math.round(base64Data.length / 1024)}KB)...`);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
              { type: 'text', text: PROMPT },
            ],
          }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.log(`ERR API ${res.status}: ${err.slice(0, 80)}`);
        return [];
      }

      const json = await res.json();
      const text = json.content?.[0]?.text ?? '';
      this.log(`Claude: ${text.slice(0, 120)}`);

      const jsonMatch = text.match(/\[[\s\S]*\]/) ?? text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { this.log('sem JSON na resposta'); return []; }
      const parsed = JSON.parse(jsonMatch[0]);
      const items: { country?: string; number?: number | null; name?: string }[] =
        Array.isArray(parsed) ? parsed : [parsed];

      this.log(`Claude leu ${items.length} figurinha(s): ${items.map(i => `${i.country ?? '?'}#${i.number ?? '?'}`).join(', ')}`);

      const results: DetectedSticker[] = [];
      const seenIds = new Set<string>();

      for (const item of items) {
        const country = (item.country ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
        if (!country) continue;
        const num = item.number ?? null;
        const stickerId = buildStickerId(country, num, item.name ?? country);
        if (seenIds.has(stickerId)) continue;
        seenIds.add(stickerId);
        results.push({
          stickerId,
          number: num ?? 0,
          playerName: item.name ?? `${country} #${num ?? '?'}`,
          country,
          confidence: 0.92,
          isOwned: false,
          boundingBox: { x: 0.05, y: 0.1, width: 0.9, height: 0.8 },
        });
      }

      if (results.length === 0) this.log('nenhum sticker detectado');
      return results;
    } catch (e: any) {
      this.log(`ERR: ${e?.message ?? e}`);
      return [];
    }
  }
}
