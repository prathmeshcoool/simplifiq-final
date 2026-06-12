const scrapeWebsite = require("../services/scrapeService");

jest.mock("axios");
const axios = require("axios");

describe("scrapeService — scrapeWebsite", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns extracted text from a valid HTML page", async () => {
    axios.get.mockResolvedValue({
      data: `
        <html>
          <body>
            <nav>Navigation junk</nav>
            <p>We build great software products.</p>
            <script>alert('remove me')</script>
            <footer>Footer junk</footer>
          </body>
        </html>
      `,
    });

    const result = await scrapeWebsite("https://example.com");

    expect(result).toContain("We build great software products.");
    // nav, footer, and script content should be stripped
    expect(result).not.toContain("Navigation junk");
    expect(result).not.toContain("Footer junk");
    expect(result).not.toContain("alert");
  });

  test("returns fallback string when axios throws (site unreachable)", async () => {
    axios.get.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await scrapeWebsite("https://dead-site.example");

    expect(result).toBe("Unable to scrape website content");
  });

  test("truncates output to 5000 characters", async () => {
    const longText = "word ".repeat(3000); // ~15 000 chars
    axios.get.mockResolvedValue({
      data: `<html><body><p>${longText}</p></body></html>`,
    });

    const result = await scrapeWebsite("https://example.com");

    expect(result.length).toBeLessThanOrEqual(5000);
  });

  test("passes timeout and User-Agent to axios", async () => {
    axios.get.mockResolvedValue({ data: "<html><body>OK</body></html>" });

    await scrapeWebsite("https://example.com");

    expect(axios.get).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({
        timeout: 8000,
        headers: expect.objectContaining({ "User-Agent": expect.any(String) }),
      })
    );
  });
});
