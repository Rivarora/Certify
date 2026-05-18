import { fixSpacedOCRText } from "../utils/ocrUtils.js";

/*
=====================================
fixSpacedOCRText — UNIT TESTS
=====================================
*/

describe("fixSpacedOCRText — empty and null input", () => {

  test("returns empty string for empty input", () => {
    expect(fixSpacedOCRText("")).toBe("");
  });

  test("returns empty string for null", () => {
    expect(fixSpacedOCRText(null)).toBe("");
  });

  test("returns empty string for undefined", () => {
    expect(fixSpacedOCRText(undefined)).toBe("");
  });
});

describe("fixSpacedOCRText — spaced character fixing", () => {

  test("fixes spaced verify keyword: 'V er if y'", () => {
    const result = fixSpacedOCRText("V er if y at");
    expect(result).not.toMatch(/V er/);
    expect(result.toLowerCase()).toContain("verify");
  });

  test("fixes spaced https: 'h ttp s'", () => {
    const result = fixSpacedOCRText("h ttp s://coursera.org");
    expect(result).not.toMatch(/h ttp/);
    expect(result).toContain("https");
  });

  test("fixes spaced certificate ID: 'J4F HBE 1DV TQ X'", () => {
    const result = fixSpacedOCRText("J4F HBE 1DV TQ X");
    expect(result).not.toMatch(/J4F HBE/);
  });

  test("fixes spaced domain: 'co u r se r a'", () => {
    const result = fixSpacedOCRText("co u r se r a");
    expect(result).not.toMatch(/co u r/);
  });

  test("fixes full spaced URL line from real Coursera certificate", () => {
    const input = "V er if y at: h ttp s://co u r ser a.o r g /v er if y /58B5Q Q 92O WR2";
    const result = fixSpacedOCRText(input);
    expect(result).not.toMatch(/V er/);
    expect(result).not.toMatch(/h ttp/);
    expect(result).not.toMatch(/co u r/);
  });

  test("fixes spaced issuer line from real certificate", () => {
    const input = "C ou r ser a h as con fir med th e id en tity";
    const result = fixSpacedOCRText(input);
    expect(result).not.toMatch(/C ou r/);
  });

  test("fixes multiple broken lines", () => {
    const input = `V er if y at:\nh ttp s://co u r ser a.o r g`;
    const result = fixSpacedOCRText(input);
    expect(result).not.toMatch(/V er/);
    expect(result).not.toMatch(/h ttp/);
  });
});

describe("fixSpacedOCRText — normal text preservation", () => {

  test("does not collapse normal English sentence", () => {
    const input = "This certificate is awarded to John Doe for completing the course.";
    const result = fixSpacedOCRText(input);
    expect(result).toBe(input);
  });

  test("does not collapse person name", () => {
    const input = "Awarded to Priya Mehta";
    const result = fixSpacedOCRText(input);
    expect(result).toBe(input);
  });

  test("does not collapse course title", () => {
    const input = "The Bits and Bytes of Computer Networking";
    const result = fixSpacedOCRText(input);
    expect(result).toBe(input);
  });

  test("does not collapse organization name", () => {
    const input = "Global Director of Google Career Certificates";
    const result = fixSpacedOCRText(input);
    expect(result).toBe(input);
  });

  test("does not collapse already clean URL", () => {
    const input = "Verify at: https://coursera.org/verify/ABC123";
    const result = fixSpacedOCRText(input);
    expect(result).toBe(input);
  });
});

describe("fixSpacedOCRText — real certificate samples", () => {

  test("cleans full Coursera OCR output correctly", () => {
    const input = `
      This certificate is awarded to Tishya Chugh
      for successfully completing The Bits and Bytes of Computer Networking
      authorized by Google and offered through Coursera.
      Amanda Brophy Global Director of Google Career Certificates
      V er if y at: h ttp s://co u r ser a.o r g /v er if y /J4F HBE1DV TQ X
      C ou r ser a h as con fir med th e id en tity of th is in d iv id u al
    `;
    const result = fixSpacedOCRText(input);
    expect(result).not.toMatch(/V er if y/);
    expect(result).not.toMatch(/h ttp s/);
    expect(result).not.toMatch(/C ou r ser a/);
    expect(result).toContain("Tishya Chugh");
    expect(result).toContain("Google");
    expect(result).toContain("Coursera");
  });

  test("cleans spaced certificate ID from any certificate", () => {
    const input = "Certificate ID: 58B5Q Q 92O WR2";
    const result = fixSpacedOCRText(input);
    expect(result).not.toMatch(/Q Q/);
  });

  test("cleans university certificate OCR noise", () => {
    const input = `
      This is to certify that Rahul Sharma
      has successfully completed Bachelor of Technology
      P un ja b Te ch ni ca l Un iv er si ty
      Ver ify at: htt ps://ptu.ac.in/ver ify/DEF456
    `;
    const result = fixSpacedOCRText(input);
    expect(result).not.toMatch(/P un ja b/);
    expect(result).not.toMatch(/Ver ify/);
    expect(result).toContain("Rahul Sharma");
  });

  test("cleans internship certificate OCR noise", () => {
    const input = `
      This certificate is presented to Priya Mehta
      for completing internship at TC S
      Iss ued by HR Man ag er
      Ver ify at: htt ps://tcs.com/ver ify/GHI789
    `;
    const result = fixSpacedOCRText(input);
    expect(result).not.toMatch(/TC S/);
    expect(result).not.toMatch(/Iss ued/);
    expect(result).toContain("Priya Mehta");
  });
});

describe("fixSpacedOCRText — whitespace handling", () => {

  test("collapses multiple spaces into one", () => {
    const result = fixSpacedOCRText("Hello   World");
    expect(result).not.toMatch(/\s{2,}/);
  });

  test("trims leading and trailing whitespace", () => {
    const result = fixSpacedOCRText("   Hello World   ");
    expect(result).toBe("Hello World");
  });

  test("preserves newlines between lines", () => {
    const input = "Line one\nLine two";
    const result = fixSpacedOCRText(input);
    expect(result).toContain("\n");
  });

  test("handles multiple blank lines gracefully", () => {
    const input = "Hello\n\n\nWorld";
    const result = fixSpacedOCRText(input);
    expect(result).toContain("Hello");
    expect(result).toContain("World");
  });
});