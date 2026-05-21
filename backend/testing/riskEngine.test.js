import { calculateRisk } from "../services/riskEngine.js";

// =============================================
// NULL / INVALID INPUT
// =============================================

describe("calculateRisk — invalid input", () => {

  test("returns High risk for null input", () => {
    const result = calculateRisk(null);
    expect(result.riskLevel).toBe("High");
    expect(result.riskScore).toBe(100);
  });

  test("returns High risk for empty string", () => {
    const result = calculateRisk("");
    expect(result.riskLevel).toBe("High");
    expect(result.riskScore).toBe(100);
  });

  test("returns High risk for non-string input", () => {
    const result = calculateRisk(12345);
    expect(result.riskLevel).toBe("High");
    expect(result.riskScore).toBe(100);
  });

  test("always returns required fields", () => {
    const result = calculateRisk(null);
    expect(result).toHaveProperty("riskScore");
    expect(result).toHaveProperty("riskLevel");
    expect(result).toHaveProperty("reasons");
    expect(result).toHaveProperty("structuralIntegrity");
    expect(result).toHaveProperty("issuerConfidence");
    expect(result).toHaveProperty("verificationScore");
  });
});

// =============================================
// TRUSTED ORGANISATION DETECTION
// =============================================

describe("calculateRisk — trusted organisation", () => {

  test("detects Google as trusted organisation", () => {
    const result = calculateRisk(
      "This certificate is issued by Google for completing Machine Learning."
    );
    const found = result.reasons.some(r =>
      r.toLowerCase().includes("google")
    );
    expect(found).toBe(true);
  });

  test("detects Coursera as trusted organisation", () => {
    const result = calculateRisk(
      "Awarded by Coursera for successfully completing the course."
    );
    expect(result.issuerConfidence).toBeGreaterThan(50);
  });

  test("penalises certificate with no trusted org", () => {
    const result = calculateRisk(
      "This certificate is awarded to John Doe for completing the workshop on 12 March 2024."
    );
    const hasWarning = result.reasons.some(r =>
      r.includes("No trusted organization")
    );
    expect(hasWarning).toBe(true);
  });

  test("detects NPTEL as trusted organisation", () => {
    const result = calculateRisk(
      "Certificate issued by NPTEL for completing the online course in 2024."
    );
    expect(result.issuerConfidence).toBeGreaterThan(50);
  });
});

// =============================================
// STRUCTURE KEYWORDS
// =============================================

describe("calculateRisk — certificate structure", () => {

  test("rewards strong structure keywords", () => {
    const result = calculateRisk(
      "This certificate is hereby awarded to Jane Smith for successfully completing the certification course. In recognition of achievement."
    );
    const strong = result.reasons.some(r =>
      r.includes("Strong certificate structure")
    );
    expect(strong).toBe(true);
    expect(result.structuralIntegrity).toBeGreaterThanOrEqual(90);
  });

  test("penalises missing structure keywords", () => {
    const result = calculateRisk(
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod."
    );
    expect(result.structuralIntegrity).toBeLessThan(50);
  });
});

// =============================================
// VERIFICATION URL
// =============================================

describe("calculateRisk — verification URL", () => {

  test("rewards trusted verification URL", () => {
    const result = calculateRisk(
      "This certificate is awarded to John Doe. Verify at: https://coursera.org/verify/ABC123DEF"
    );
    const found = result.reasons.some(r =>
      r.includes("Trusted verification URL")
    );
    expect(found).toBe(true);
    expect(result.verificationScore).toBeGreaterThan(60);
  });

  test("warns on unknown domain URL", () => {
    const result = calculateRisk(
      "Verify your certificate at: https://randomsite.io/verify/XYZ"
    );
    const found = result.reasons.some(r =>
      r.includes("unrecognized domain")
    );
    expect(found).toBe(true);
  });

  test("penalises missing URL", () => {
    const result = calculateRisk(
      "This certificate is awarded to Jane Doe for completing the course in 2024."
    );
    const noUrl = result.reasons.some(r =>
      r.includes("No verification URL")
    );
    expect(noUrl).toBe(true);
  });
});

// =============================================
// SUSPICIOUS CONTENT
// =============================================

describe("calculateRisk — suspicious content", () => {

  test("penalises 'fake' keyword heavily", () => {
    const result = calculateRisk(
      "This is a fake certificate for John Doe issued in 2024."
    );
    expect(result.riskScore).toBeGreaterThanOrEqual(40);
  });

  test("penalises 'sample' keyword", () => {
    const result = calculateRisk(
      "Sample certificate — this is not a real credential."
    );
    expect(result.riskScore).toBeGreaterThanOrEqual(40);
  });

  test("penalises 'demo' keyword", () => {
    const result = calculateRisk(
      "Demo certificate template — for testing only."
    );
    expect(result.riskScore).toBeGreaterThanOrEqual(40);
  });

  test("clean certificate has no suspicious flag", () => {
    const result = calculateRisk(
      "This certificate is awarded to Priya Mehta for completing the Bits and Bytes of Computer Networking by Google via Coursera. Verify at: https://coursera.org/verify/J4FHBE1DVTQX"
    );
    const noSuspicious = result.reasons.some(r =>
      r.includes("No suspicious content")
    );
    expect(noSuspicious).toBe(true);
  });
});

// =============================================
// RISK LEVEL THRESHOLDS
// =============================================

describe("calculateRisk — risk levels", () => {

  test("Low risk for a high-quality real certificate", () => {
    const result = calculateRisk(
      `This certificate is hereby awarded to Tishya Chugh for successfully completing
       The Bits and Bytes of Computer Networking, authorized by Google and offered
       through Coursera. Amanda Brophy, Global Director of Google Career Certificates.
       Verify at: https://coursera.org/verify/J4FHBE1DVTQX. Issued: March 2024.`
    );
    expect(result.riskLevel).toBe("Low");
    expect(result.riskScore).toBeLessThan(40);
  });

  test("High risk for clearly fake certificate", () => {
    const result = calculateRisk(
      "This is a fake sample dummy certificate generated for testing placeholder only."
    );
    expect(result.riskLevel).toBe("High");
    expect(result.riskScore).toBeGreaterThanOrEqual(70);
  });

  test("riskScore is always between 0 and 100", () => {
    const inputs = [
      "fake dummy sample placeholder void not valid",
      "This certificate is awarded to John by Google. Verify at https://coursera.org/verify/ABC. Issued March 2024.",
      "",
      null
    ];
    inputs.forEach(input => {
      const result = calculateRisk(input);
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });
  });

  test("riskLevel is always Low, Medium, or High", () => {
    ["google coursera certificate awarded", "random text", "fake dummy"].forEach(input => {
      const { riskLevel } = calculateRisk(input);
      expect(["Low", "Medium", "High"]).toContain(riskLevel);
    });
  });
});

// =============================================
// DATE VALIDATION
// =============================================

describe("calculateRisk — date detection", () => {

  test("rewards valid issue date", () => {
    const result = calculateRisk(
      "This certificate was issued on 15 March 2024 to Jane Doe."
    );
    const found = result.reasons.some(r =>
      r.includes("Valid issue date")
    );
    expect(found).toBe(true);
  });

  test("penalises future date when date pattern is matched", () => {
    // riskEngine only flags future dates when a date pattern matches (e.g. "March 2028")
    // A bare year alone does not trigger the date regex — needs month context
    const futureYear = new Date().getFullYear() + 2;
    const result = calculateRisk(
      `This certificate was issued in March ${futureYear} to John Doe by Coursera.`
    );
    const flagged = result.reasons.some(r =>
      r.includes("Suspicious future date")
    );
    expect(flagged).toBe(true);
  });
});