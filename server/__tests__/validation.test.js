/**
 * Integration-style tests for the /api/lead route.
 * Uses supertest to hit the Express app directly — no network needed.
 */
const request = require("supertest");
const app = require("../App");

// Mock every downstream service so tests are fast and isolated
jest.mock("../services/scrapeService", () =>
  jest.fn().mockResolvedValue("Mocked company content")
);
jest.mock("../services/aiService", () =>
  jest.fn().mockResolvedValue({
    companySummary: "A test company.",
    painPoints: ["Pain 1"],
    aiOpportunities: ["Opp 1"],
    recommendations: ["Do X"],
  })
);
jest.mock("../services/pdfService", () => ({
  generatePDF: jest.fn().mockResolvedValue("/tmp/test.pdf"),
  cleanupPDF: jest.fn(),
}));
jest.mock("../services/emailService", () => jest.fn().mockResolvedValue(undefined));
jest.mock("../services/sheetsService", () => jest.fn().mockResolvedValue(undefined));

const VALID_BODY = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Acme Corp",
  website: "https://acme.com",
};

describe("POST /api/lead — input validation", () => {
  test("returns 400 when any required field is missing", async () => {
    const res = await request(app)
      .post("/api/lead")
      .send({ name: "Jane", email: "jane@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/required/i);
  });

  test("returns 400 for an invalid email format", async () => {
    const res = await request(app)
      .post("/api/lead")
      .send({ ...VALID_BODY, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  test("returns 400 for an invalid website URL", async () => {
    const res = await request(app)
      .post("/api/lead")
      .send({ ...VALID_BODY, website: "not a url" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid website URL/i);
  });

  test("returns 400 when name is too short", async () => {
    const res = await request(app)
      .post("/api/lead")
      .send({ ...VALID_BODY, name: "X" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/2 characters/i);
  });

  test("returns 200 and audit data for a valid request", async () => {
    const res = await request(app).post("/api/lead").send(VALID_BODY);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.audit).toBeDefined();
    expect(res.body.audit.companySummary).toBe("A test company.");
  });
});
