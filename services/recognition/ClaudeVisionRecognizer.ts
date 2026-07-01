import { IStickerRecognizer, DetectedSticker } from '@/types';
import albumData from '@/assets/data/stickers.json';

// ─── Lookup tables ──────────────────────────────────────────────────────────

interface StickerMeta {
  id: string;
  number: number;
  playerName: string;
  country: string;
}

const byNumber = new Map<number, StickerMeta>();
const byNameWord = new Map<string, StickerMeta[]>();
const byId = new Map<string, StickerMeta>();

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

albumData.pages.forEach((p) =>
  p.countries.forEach((c) =>
    c.stickers.forEach((s) => {
      const meta: StickerMeta = { id: s.id, number: s.number, playerName: s.playerName, country: c.code };
      byNumber.set(s.number, meta);
      byId.set(s.id, meta);
      s.playerName.split(/\s+/).forEach((word) => {
        const key = normalize(word);
        if (key.length < 3) return;
        if (!byNameWord.has(key)) byNameWord.set(key, []);
        byNameWord.get(key)!.push(meta);
      });
    })
  )
);

// ─── Matching ───────────────────────────────────────────────────────────────

function findBestMatch(name: string, number: number | null, country: string | null): StickerMeta | null {
  // Try number first (most reliable)
  if (number && byNumber.has(number)) {
    return byNumber.get(number)!;
  }

  // Score all stickers by name word overlap
  const normName = normalize(name);
  const scored = new Map<string, number>();

  for (const [key, metas] of byNameWord) {
    if (key.length < 3) continue;
    if (normName.includes(key) || key.includes(normName.slice(0, Math.max(3, normName.length - 1)))) {
      const pts = key.length;
      for (const m of metas) {
        // Boost if country matches
        const countryBoost = (country && m.country === country) ? 5 : 0;
        scored.set(m.id, (scored.get(m.id) ?? 0) + pts + countryBoost);
      }
    }
  }

  if (scored.size === 0) return null;
  const [bestId] = [...scored.entries()].sort((a, b) => b[1] - a[1])[0];
  return byId.get(bestId) ?? null;
}

// ─── Recognizer ────────────────────────────────────────────────────────────

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

const PROMPT = `You are analyzing a Panini FIFA World Cup 2026 sticker card.
Look at the sticker and extract the following information:
- Player full name (as printed on sticker, usually at the bottom)
- Sticker number (a 1-3 digit number, if visible)
- Country code (3-letter code like FRA, ESP, BRA, ARG — look for the flag or text)

Respond with ONLY valid JSON, no explanation:
{"name": "PLAYER NAME", "number": 123, "country": "FRA"}

If you cannot find a field, use null. Always respond with valid JSON.`;

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

    // Convert data URL to base64 + mediaType
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
          max_tokens: 128,
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
      this.log(`Claude: ${text.slice(0, 80)}`);

      // Remove markdown code fences e extrai o JSON via regex
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { this.log('sem JSON na resposta'); return []; }
      const parsed = JSON.parse(jsonMatch[0]);
      const { name, number, country } = parsed as { name?: string; number?: number; country?: string };

      if (!name) { this.log('sem nome na resposta'); return []; }

      const meta = findBestMatch(name ?? '', number ?? null, country ?? null);
      if (!meta) { this.log(`sem match para "${name}"`); return []; }

      return [{
        stickerId: meta.id,
        number: meta.number,
        playerName: meta.playerName,
        country: meta.country,
        confidence: 0.92,
        isOwned: false,
        boundingBox: { x: 0.05, y: 0.1, width: 0.9, height: 0.8 },
      }];
    } catch (e: any) {
      this.log(`ERR: ${e?.message ?? e}`);
      return [];
    }
  }
}
