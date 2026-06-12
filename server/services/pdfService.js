const path = require("path");
const fs = require("fs");

const REPORTS_DIR = path.join(__dirname, "../../generated-reports");

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const generatePDF = async (html, company) => {
  const safeName = company.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filePath = path.join(REPORTS_DIR, `${safeName}-${Date.now()}.pdf`);

  let browser;

  // On Render (or any non-local env), use the bundled Chromium binary
  // that doesn't need to be downloaded at all. Locally, use regular puppeteer.
  if (process.env.NODE_ENV === "production" || process.env.RENDER) {
    const chromium = require("@sparticuz/chromium");
    const puppeteer = require("puppeteer-core");

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = require("puppeteer");
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

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

const cleanupPDF = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error("PDF cleanup error:", err.message);
    else console.log("PDF cleaned up:", path.basename(filePath));
  });
};

module.exports = { generatePDF, cleanupPDF };