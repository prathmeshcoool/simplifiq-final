const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const REPORTS_DIR = path.join(__dirname, "../../generated-reports");

// Ensure the reports directory exists before trying to write into it
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const generatePDF = async (html, company) => {
  // Sanitise company name so it's safe to use in a filename
  const safeName = company.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filePath = path.join(REPORTS_DIR, `${safeName}-${Date.now()}.pdf`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    return filePath;
  } finally {
    await browser.close();
  }
};

/**
 * Deletes a generated PDF from disk.
 * Call this after the email has been sent so files don't accumulate.
 */
const cleanupPDF = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error("PDF cleanup error:", err.message);
    else console.log("PDF cleaned up:", path.basename(filePath));
  });
};

module.exports = { generatePDF, cleanupPDF };
