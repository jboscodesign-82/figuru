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

const PROMPT = `You are analyzing a photo that may contain one or more Panini FIFA World Cup 2026 sticker cards.
Identify ALL stickers visible in the image. For each sticker extract:
- Player full name (as printed on the sticker, usually at the bottom band)
- Sticker number (1-3 digit number printed on the sticker, if visible)
- Country code (3-letter FIFA code like FRA, ESP, BRA, ARG, USA, GER, TUR — look for the flag or text)

Respond with ONLY valid JSON array, no explanation:
[{"name": "PLAYER NAME", "number": 123, "country": "FRA"}, {"name": "OTHER PLAYER", "number": null, "country": "BRA"}]

If only one sticker, still return an array with one element. Use null for fields you cannot read.`;

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
      const items: { name?: string; number?: number | null; country?: string }[] =
        Array.isArray(parsed) ? parsed : [parsed];

      this.log(`Claude identificou ${items.length} figurinha(s): ${items.map(i => `${i.name}(${i.country ?? '?'}#${i.number ?? '?'})`).join(', ').slice(0, 150)}`);

      const results: DetectedSticker[] = [];
      const seenIds = new Set<string>();

      for (const item of items) {
        if (!item.name) continue;
        const stickerId = buildStickerId(item.country, item.number ?? null, item.name);
        if (seenIds.has(stickerId)) continue;
        seenIds.add(stickerId);
        results.push({
          stickerId,
          number: item.number ?? 0,
          playerName: item.name,
          country: (item.country ?? 'UNK').toUpperCase().slice(0, 3),
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
