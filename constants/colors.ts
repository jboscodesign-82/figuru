export const C = {
  bg: '#0a0a0f',
  surface: '#16161f',
  surface2: '#1e1e2a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#ffd700',
  accentBlue: '#4cc9f0',
  success: '#4ade80',
  danger: '#f87171',
  text: '#e8e8f0',
  textMuted: '#888899',
  textDim: '#44445a',
} as const;

// Gradiente de header (mesma pegada do app de referência: leve wash frio→quente)
export const HEADER_GRADIENT = ['#1c2b45', '#2a1e3a', '#3a1e28'] as const;

// Gera um par de cores de gradiente único por seleção — dá a cada card
// uma "assinatura" de cor sutil sobre o fundo escuro (leves gradientes por conteúdo).
export function countryGradient(code: string): [string, string] {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360;
  return [
    `hsla(${h}, 60%, 48%, 0.22)`,
    `hsla(${(h + 45) % 360}, 55%, 30%, 0.04)`,
  ];
}
