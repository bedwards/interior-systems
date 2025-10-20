{
  "name": "interior-systems",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "deploy": "npm run build && gh-pages -d dist",
    "deploy:worker": "cd workers && npm run deploy"
  }
}