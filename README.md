# JobMatch AI

AI-powered job matcher — upload any company list (CSV) and your CV to find the most relevant open positions, scored and ranked by Gemini AI.

Built with React v19 + Vite + Gemini API. Deploys to Vercel in one click.

---

## Features

- **Tab 1 — CSV + CV Matcher**: Upload any company list (startups, big tech, FAANG, any CSV) + your CV → get top 15 matched companies with score, suggested role, salary, remote policy, skill tags, and job search links (LinkedIn, Indeed, Glassdoor, Google Jobs)
- **Tab 2 — Job URL Scorer**: Paste any job post URL + your CV → get a detailed match score, skill tag breakdown (matched / partial / missing), strengths, and gaps
- API key saved to localStorage — no backend needed
- Fully responsive, mobile-first design

---

## Setup

### 1. Get your free Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key

### 2. Install and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 3. Paste your API key in the app

The key is saved to localStorage — you only need to enter it once per browser.

---

## Deploy to Vercel

```bash
npm run build
```

Then drag the `dist/` folder to [vercel.com/new](https://vercel.com/new), or connect your GitHub repo and deploy with one click.

**Note:** The Gemini API key is entered by users in the browser. For a public app with a shared key, move the API call to a Vercel serverless function:

```
/api/analyze.js  ← use process.env.GEMINI_API_KEY here
```

---

## Tech Stack

- React v19
- Vite
- CSS Modules
- PapaParse (CSV parsing)
- Gemini 2.0 Flash API
- Vercel (deployment)

---

## Free Tier Limits (Gemini API)

- 15 requests per minute
- 1 million tokens per day
- ~10–15 concurrent users comfortably

Upgrade to paid Gemini API for higher limits (~$0.075 per 1M tokens).
