# SimplifiQ AI Lead Automation System

An AI-powered lead enrichment and audit automation platform.

The system automates the complete workflow from lead submission to AI-generated business audit report delivery.

---

# Features

- Lead capture form using React + Tailwind CSS
- Automated backend workflow using Express.js
- Company website scraping and enrichment
- AI-powered business analysis using Groq LLM
- Structured audit generation with JSON validation
- Dynamic PDF report generation using Puppeteer
- Automated email delivery with PDF attachment
- Google Sheets lead logging
- Error handling and fallback responses
- Modular service-based backend architecture
- Responsive modern UI

---

# Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS
- Axios

## Backend
- Node.js
- Express.js
- Puppeteer
- Nodemailer
- Cheerio
- Groq API
- Google Sheets API

---

# System Workflow

1. User submits lead form
2. Backend validates incoming lead data
3. Website content is scraped and enriched
4. AI generates structured business audit
5. HTML report template is generated
6. PDF report is created using Puppeteer
7. Email with PDF attachment is automatically sent
8. Lead activity is logged into Google Sheets

---

# Project Structure

```bash
client/
server/
  services/
  templates/
  generated-reports/
screenshots/
README.md
reflection.txt
```

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/prathmeshcool/simplifiq-ai-lead-system
```

---

## 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 3. Backend Setup

```bash
cd server
npm install
npm run dev
```

---

# Environment Variables

Create `.env` inside `/server`

```env
GROQ_API_KEY=your_key

EMAIL_USER=your_email
EMAIL_PASS=your_app_password

GOOGLE_SHEET_ID=your_sheet_id
```

---

# API Endpoint

## POST `/api/lead`

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Stripe",
  "website": "https://stripe.com"
}
```

---

# Engineering Decisions

## Structured AI Output
The AI model is forced to return structured JSON to ensure predictable frontend rendering and reduce parsing issues.

## Error Handling
Fallback responses were added for:
- invalid AI JSON
- scraping failures
- API failures
- email issues

## PDF Generation
Puppeteer was used to generate professional reports with custom HTML templates.

## Modular Architecture
Services were separated into:
- scraping
- AI generation
- PDF generation
- email delivery
- Google Sheets logging

to improve maintainability and scalability.

---

# Challenges Faced

- Handling malformed AI JSON responses
- Managing async workflow between scraping, AI analysis, PDF generation, and email delivery
- Improving PDF readability and styling
- Configuring secure email authentication
- Handling external API failures gracefully

---

# Future Improvements

- Google Drive PDF archiving
- Authentication system
- Database integration
- CRM integrations
- Multi-page PDF reports
- AI scoring and lead prioritization
- Cloud deployment and monitoring

---

# Screenshots

## Lead Form
![Lead Form](./screenshots/form.png)

## Generated Audit Overview

### Audit Top
![Audit Overview](./screenshots/audit-top.png)
<br>
<br>
<br>

### Audit Bottom
<img src="./screenshots/audit-bottom.png" alt="Audit Details" style="margin-left: 25px;">


<br>
<br>
<br>

## PDF Report Overview
![PDF Report Overview](./screenshots/pdf-top.png)
![PDF Report Details](./screenshots/pdf-bottom.png)

## Email Delivery
![Email Delivery](./screenshots/email.png)

## Google Sheets Logging
![Google Sheets](./screenshots/sheets.png)

---

# Author

Prathmesh Naiknaware
