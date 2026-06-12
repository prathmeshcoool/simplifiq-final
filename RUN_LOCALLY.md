# Running this project locally

This is the upgraded version of SimplifiQ AI Lead System. Follow these steps in order.

## Prerequisites

- Node.js 18 or higher (`node -v` to check)
- A Groq API key (free at console.groq.com)
- A Gmail account with an App Password (Google Account → Security → 2-Step Verification → App passwords)
- A Google Cloud service account JSON file with access to a Google Sheet (Sheets API enabled)

## 1. Server setup

```bash
cd server
cp .env.example .env
```

Open `.env` and fill in:

```
GROQ_API_KEY=your_groq_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
GOOGLE_SHEET_ID=your_google_sheet_id
PORT=5000
```

Place your Google service account key file in `server/` and name it exactly:

```
google-credentials.json
```

Install and run:

```bash
npm install
npm run dev
```

You should see: `Server running on port 5000`

## 2. Client setup (new terminal)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

This opens at `http://localhost:5173`. The `.env` file already points to
`http://localhost:5000` which matches the server above — no changes needed
for local dev.

## 3. Run the test suite

```bash
cd server
npm test
```

Should show all tests passing across 4 suites (aiService, scrapeService,
pdfService, validation). These are fully mocked — no API keys, no network,
and no real browser/email/sheet calls happen during tests.

## 4. Try it end to end

With both servers running, open `http://localhost:5173`, fill in the form
with a real website URL and your own email address, and submit. You should:

- See the audit JSON rendered on the page
- Receive an email with a PDF report attached
- See a new row appended to your Google Sheet

## What changed from the original version

- Input validation (email format, URL format, minimum lengths) with specific
  error messages
- Rate limiting on `/api/lead` (10 requests / 15 min per IP)
- `GOOGLE_SHEET_ID` moved from hardcoded value to `.env`
- axios scraping now has an 8s timeout and a User-Agent header
- Puppeteer runs with explicit `headless: true` and `--no-sandbox` (needed
  for cloud deployment)
- Generated PDFs are deleted from disk after the email is sent
- Frontend reads the API URL from `VITE_API_URL` instead of a hardcoded
  `localhost:5000`
- Added `server/index.js` as the real entry point; `App.js` now only
  defines the Express app (needed so tests don't bind a real port)
- Added a Jest + Supertest test suite (16 tests across 4 files)
- Removed the unused `openai` package
- Fixed a missing `tailwindcss` / `@tailwindcss/vite` dependency in
  `client/package.json` that would have caused `npm run dev` to fail

## Deploying (do this after local testing works)

Backend → Render (Puppeteer needs a real browser, so Vercel won't work for
the backend). Frontend → Vercel. Ask for deployment steps when you're ready
— there's one extra change needed for `sheetsService.js` to read credentials
from an environment variable instead of a file, since Render doesn't support
file uploads.
