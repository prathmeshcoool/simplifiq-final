const generateAudit = require("../services/aiService");

// Mock the Groq SDK so tests never hit the real API
jest.mock("groq-sdk", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

const Groq = require("groq-sdk");

describe("aiService — generateAudit", () => {
  let mockCreate;

  beforeEach(() => {
    // Get a fresh reference to the mocked method before each test
    mockCreate = new Groq().chat.completions.create;
    jest.clearAllMocks();
  });

  test("parses a clean JSON response correctly", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              companySummary: "A great company.",
              painPoints: ["Pain 1", "Pain 2"],
              aiOpportunities: ["Opportunity 1"],
              recommendations: ["Do X", "Do Y"],
            }),
          },
        },
      ],
    });

    const result = await generateAudit("some company content");

    expect(result.companySummary).toBe("A great company.");
    expect(result.painPoints).toEqual(["Pain 1", "Pain 2"]);
    expect(result.aiOpportunities).toHaveLength(1);
    expect(result.recommendations).toHaveLength(2);
  });

  test("strips markdown code fences before parsing", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content:
              "```json\n" +
              JSON.stringify({
                companySummary: "Summary here.",
                painPoints: [],
                aiOpportunities: [],
                recommendations: [],
              }) +
              "\n```",
          },
        },
      ],
    });

    const result = await generateAudit("content");

    expect(result.companySummary).toBe("Summary here.");
  });

  test("returns fallback object when Groq throws an error", async () => {
    mockCreate.mockRejectedValue(new Error("API unavailable"));

    const result = await generateAudit("content");

    expect(result.companySummary).toBe(
      "AI analysis could not be completed for this company."
    );
    expect(result.painPoints).toEqual([]);
    expect(result.aiOpportunities).toEqual([]);
    expect(result.recommendations).toEqual([]);
  });

  test("returns fallback when response is invalid JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "this is not json at all" } }],
    });

    const result = await generateAudit("content");

    expect(result.painPoints).toEqual([]);
  });

  test("sanitises response that has wrong types for array fields", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              companySummary: "Summary.",
              painPoints: "not an array",   // wrong type
              aiOpportunities: null,         // wrong type
              recommendations: ["Do Z"],
            }),
          },
        },
      ],
    });

    const result = await generateAudit("content");

    expect(Array.isArray(result.painPoints)).toBe(true);
    expect(Array.isArray(result.aiOpportunities)).toBe(true);
    expect(result.recommendations).toEqual(["Do Z"]);
  });
});
