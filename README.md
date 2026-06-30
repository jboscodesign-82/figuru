# Figuru — Copa 2026

App React para gerenciamento de figurinhas da Copa do Mundo 2026.

## Funcionalidades

- Galeria de 120 figurinhas de 10 seleções
- Marcar/desmarcar figurinhas como coletadas
- Lista de figurinhas faltando por seleção
- Scanner com OCR (Tesseract.js) para leitura automática de códigos
- Dados salvos no localStorage (Zustand persist)
- Deploy automático no GitHub Pages

## Seleções incluídas

🇧🇷 Brasil · 🇦🇷 Argentina · 🇫🇷 França · 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra · 🇩🇪 Alemanha
🇪🇸 Espanha · 🇵🇹 Portugal · 🇳🇱 Holanda · 🇺🇾 Uruguai · 🇺🇸 EUA

## Tecnologias

- React 18 + Vite 5
- React Router DOM v6
- Zustand 4 (estado global + persistência localStorage)
- Tesseract.js 5 (OCR)
- CSS Modules

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Deploy

O GitHub Actions faz deploy automático no GitHub Pages a cada push na `main`.

URL: https://jboscodesign-82.github.io/figuru/
