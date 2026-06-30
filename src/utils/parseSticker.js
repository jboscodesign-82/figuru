import { stickers } from '../data/stickers'

const CODES = new Set(stickers.map(s => s.code))

// Extrai códigos de figurinha (ex: BRA001, ARG012) do texto OCR
export function parseSticker(text) {
  if (!text) return []
  const matches = text.toUpperCase().match(/[A-Z]{3}\d{3}/g) || []
  return [...new Set(matches)].filter(code => CODES.has(code))
}
