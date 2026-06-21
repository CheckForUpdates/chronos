# Development Guide

Chronos is built with React, Vite, and TypeScript. It uses no external dependencies for cryptography, relying solely on the native browser Web Crypto API.

## Prerequisites
* Node.js v18+
* npm

## Running locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## Building for production

Chronos is designed to be hosted as a static site (GitHub Pages, Vercel, Netlify).

```bash
npm run build
```

This will generate a `dist` folder containing the optimized static assets. You can test the production build locally using:

```bash
npm run preview
```
