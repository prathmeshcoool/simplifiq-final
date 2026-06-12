const path = require("path");
const fs = require("fs");

// Mock puppeteer — we don't want a real browser launching in tests
jest.mock("puppeteer", () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(undefined),
    }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

const { generatePDF, cleanupPDF } = require("../services/pdfService");

describe("pdfService — generatePDF", () => {
  test("returns a file path ending in .pdf", async () => {
    const result = await generatePDF("<html><body>Test</body></html>", "Acme Corp");
    expect(result).toMatch(/\.pdf$/);
  });

  test("sanitises special characters in company name for the filename", async () => {
    const result = await generatePDF("<html></html>", "Acme & Co / Ltd");
    const filename = path.basename(result);
    // Should not contain &, spaces, or slashes
    expect(filename).not.toMatch(/[& /]/);
  });

  test("calls puppeteer page.pdf with A4 format and printBackground true", async () => {
    const puppeteer = require("puppeteer");
    const mockPage = await (await puppeteer.launch()).newPage();

    await generatePDF("<html></html>", "TestCo");

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "A4",
        printBackground: true,
      })
    );
  });
});

describe("pdfService — cleanupPDF", () => {
  test("calls fs.unlink on the given path", () => {
    const spy = jest.spyOn(fs, "unlink").mockImplementation((p, cb) => cb(null));
    cleanupPDF("/tmp/fake-report.pdf");
    expect(spy).toHaveBeenCalledWith("/tmp/fake-report.pdf", expect.any(Function));
    spy.mockRestore();
  });
});
