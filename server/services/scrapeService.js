const axios = require("axios");
const cheerio = require("cheerio");

const scrapeWebsite = async (url) => {
  try {
    const { data } = await axios.get(url, {
      timeout: 8000, // fail fast if site is slow or unreachable
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SimplifiQ-Bot/1.0; +https://simplifiq.ai)",
      },
    });

    const $ = cheerio.load(data);

    $("script").remove();
    $("style").remove();
    $("nav").remove();
    $("footer").remove();

    const text = $("body").text();

    return text.replace(/\s+/g, " ").trim().slice(0, 5000);
  } catch (error) {
    console.error("Scraping Error:", error.message);
    return "Unable to scrape website content";
  }
};

module.exports = scrapeWebsite;
