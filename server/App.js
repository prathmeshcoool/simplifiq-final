const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const scrapeWebsite = require("./services/scrapeService");
const generateAudit = require("./services/aiService");
const generateHTMLReport = require("./templates/reportTemplate");
const { generatePDF } = require("./services/pdfService");
const sendEmail = require("./services/emailService");
const addLeadToSheet = require("./services/sheetsService");

const app = express();

// Render (and most cloud platforms) sit behind a reverse proxy that sets
// X-Forwarded-For. This tells Express to trust that header so
// express-rate-limit can correctly identify clients by IP.
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

// Rate limiting — max 10 requests per 15 minutes per IP
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

app.get("/", (req, res) => {
  res.send("API running");
});

app.post("/api/lead", leadLimiter, async (req, res) => {
  const { name, email, company, website } = req.body;

  if (!name || !email || !company || !website) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must be at least 2 characters.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  if (company.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Company name must be at least 2 characters.",
    });
  }

  if (!isValidURL(website)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid website URL (e.g. https://example.com).",
    });
  }

  try {
    console.log("Lead received:", company);

    const scrapedContent = await scrapeWebsite(website);
    const audit = await generateAudit(scrapedContent);
    const htmlReport = generateHTMLReport(audit, company);
    const pdfPath = await generatePDF(htmlReport, company);

    await sendEmail(email, company, pdfPath);

    await addLeadToSheet({
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      status: "Success",
    });

    res.json({
      success: true,
      message: `Audit generated for ${company}`,
      audit,
    });
  } catch (error) {
    console.error("Lead processing error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process lead. Please try again.",
    });
  }
});

// Note: app.listen() is NOT called here.
// This keeps App.js a pure Express app definition, so it can be
// safely require()'d in tests (supertest) without binding a real port.
// The server is actually started from index.js.
module.exports = app;
