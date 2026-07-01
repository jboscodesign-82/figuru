export const C = {
  bg: '#0a0a0f',
  surface: '#16161f',
  surface2: '#1e1e2a',
  border: 'rgba(255,255,255,0.08)',
  // Azul de destaque (usado em botões, FAB e estados ativos)
  accent: '#3b9ae4',
  accentBlue: '#3b9ae4',
  success: '#4ade80',
  danger: '#f87171',
  text: '#e8e8f0',
  textMuted: '#888899',
  textDim: '#44445a',
} as const;

// Header sóbrio: grafite escuro com leve gradiente (sem cor forte)
export const HEADER_GRADIENT = ['#22252f', '#181820', '#101014'] as const;

// Gradiente neutro para os cards — leve brilho cinza no topo, sem matiz colorido.
export function countryGradient(_code: string): [string, string] {
  return ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.015)'];
}
