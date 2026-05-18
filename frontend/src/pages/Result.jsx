export const calculateRisk = (content) => {

  if (!content || typeof content !== "string") {
    return {
      riskScore: 100,
      riskLevel: "High",
      reasons: ["Invalid certificate content"],
      structuralIntegrity: 0,
      issuerConfidence: 0,
      verificationScore: 0,
      flaggedIssues: ["Invalid certificate content"],
      details: {}
    };
  }

  let riskScore = 50; // start neutral
  const reasons = [];
  const details = {};

  const lower = content.toLowerCase();

  // =============================================
  // 1. TRUSTED ORGANIZATION DETECTION
  // =============================================

  const trustedOrgs = [
    { name: "google", weight: 20 },
    { name: "coursera", weight: 18 },
    { name: "microsoft", weight: 18 },
    { name: "amazon", weight: 18 },
    { name: "aws", weight: 18 },
    { name: "meta", weight: 15 },
    { name: "ibm", weight: 15 },
    { name: "oracle", weight: 15 },
    { name: "infosys", weight: 12 },
    { name: "tcs", weight: 12 },
    { name: "wipro", weight: 12 },
    { name: "udemy", weight: 10 },
    { name: "linkedin", weight: 12 },
    { name: "harvard", weight: 20 },
    { name: "mit", weight: 20 },
    { name: "stanford", weight: 20 },
    { name: "nptel", weight: 15 },
    { name: "edx", weight: 12 }
  ];

  const foundOrgs = trustedOrgs.filter(org => lower.includes(org.name));

  if (foundOrgs.length > 0) {
    const maxWeight = Math.max(...foundOrgs.map(o => o.weight));
    riskScore -= maxWeight;
    details.trustedOrgs = foundOrgs.map(o => o.name);
    reasons.push(`Trusted organization detected: ${foundOrgs.map(o => o.name).join(", ")}`);
  } else {
    riskScore += 20;
    reasons.push("No trusted organization detected");
  }

  // =============================================
  // 2. CERTIFICATE STRUCTURE KEYWORDS
  // =============================================

  const structureKeywords = [
    "certificate", "certification", "certifies",
    "completed", "completion", "awarded",
    "presented", "successfully", "achievement",
    "this is to certify", "has successfully completed",
    "course certificate", "authorized"
  ];

  const foundStructure = structureKeywords.filter(k => lower.includes(k));

  if (foundStructure.length >= 3) {
    riskScore -= 15;
    reasons.push("Strong certificate structure detected");
  } else if (foundStructure.length >= 1) {
    riskScore -= 7;
    reasons.push("Basic certificate structure detected");
  } else {
    riskScore += 20;
    reasons.push("Certificate structure not detected");
  }

  details.structureKeywords = foundStructure;

  // =============================================
  // 3. SIGNATORY / AUTHORITY DETECTION
  // =============================================

  const signatoryKeywords = [
    "signature", "signed", "authorized signatory",
    "director", "president", "ceo", "manager",
    "head of", "officer", "instructor", "professor",
    "global director", "vice president", "founder"
  ];

  const foundSignatory = signatoryKeywords.filter(k => lower.includes(k));

  if (foundSignatory.length > 0) {
    riskScore -= 12;
    details.signatory = foundSignatory;
    reasons.push(`Valid signatory detected: ${foundSignatory[0]}`);
  } else {
    riskScore += 15;
    reasons.push("No signatory or authority detected");
  }

  // =============================================
  // 4. VERIFICATION URL
  // =============================================

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlRegex);

  const trustedDomains = [
    "coursera.org", "google.com", "linkedin.com",
    "microsoft.com", "credly.com", "udemy.com",
    "edx.org", "harvard.edu", "mit.edu", "nptel.ac.in"
  ];

  if (urls && urls.length > 0) {
    const trustedUrl = urls.find(url =>
      trustedDomains.some(domain => url.includes(domain))
    );

    if (trustedUrl) {
      riskScore -= 18;
      details.verificationUrl = trustedUrl;
      reasons.push(`Trusted verification URL found: ${trustedUrl}`);
    } else {
      riskScore -= 5;
      details.verificationUrl = urls[0];
      reasons.push("Verification URL found (unrecognized domain)");
    }
  } else {
    riskScore += 20;
    reasons.push("No verification URL found");
  }

  // =============================================
  // 5. CREDENTIAL / CERTIFICATE ID
  // =============================================

  const credIdPatterns = [
    /certificate[\s\w]*id[:\s#]+([A-Z0-9\-]{4,})/i,
    /credential[\s\w]*id[:\s#]+([A-Z0-9\-]{4,})/i,
    /verify\/([A-Z0-9]{8,})/i,         // coursera-style URL ID
    /certificate[^\n]{0,30}([A-Z0-9]{10,})/i
  ];

  const credIdFound = credIdPatterns.some(p => p.test(content));

  if (credIdFound) {
    riskScore -= 10;
    const match = credIdPatterns.map(p => content.match(p)).find(Boolean);
    details.credentialId = match?.[1] || "detected";
    reasons.push(`Credential ID detected: ${details.credentialId}`);
  } else {
    riskScore += 10;
    reasons.push("Certificate ID not detected");
  }

  // =============================================
  // 6. RECIPIENT NAME DETECTION
  // =============================================

  const recipientPatterns = [
    /awarded to[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/,
    /presented to[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/,
    /this certifies that[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /^([A-Z][a-z]+(?: [A-Z][a-z]+)+)$/m   // standalone proper name line
  ];

  const recipientFound = recipientPatterns.some(p => p.test(content));

  if (recipientFound) {
    riskScore -= 8;
    const match = recipientPatterns.map(p => content.match(p)).find(Boolean);
    details.recipientName = match?.[1] || "detected";
    reasons.push(`Recipient name detected: ${details.recipientName}`);
  } else {
    riskScore += 10;
    reasons.push("Recipient name not clearly detected");
  }

  // =============================================
  // 7. DATE VALIDATION
  // =============================================

  const datePatterns = [
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+\d{1,2}[,\s]+\d{4}/i,
    /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/,
    /\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i
  ];

  const dateFound = datePatterns.some(p => p.test(content));

  if (dateFound) {
    const match = datePatterns.map(p => content.match(p)).find(Boolean);
    details.date = match?.[0];

    // Check if date is in the future (suspicious)
    const currentYear = new Date().getFullYear();
    const yearMatch = content.match(/\b(20\d{2})\b/);
    const certYear = yearMatch ? parseInt(yearMatch[1]) : null;

    if (certYear && certYear > currentYear) {
      riskScore += 25;
      reasons.push(`Suspicious future date detected: ${certYear}`);
    } else {
      riskScore -= 5;
      reasons.push(`Issue date detected: ${details.date}`);
    }
  } else {
    riskScore += 8;
    reasons.push("No issue date detected");
  }

  // =============================================
  // 8. SUSPICIOUS CONTENT DETECTION
  // =============================================

  const suspiciousWords = [
    "fake", "sample", "demo", "generated",
    "test certificate", "dummy", "template",
    "lorem ipsum", "placeholder", "example only"
  ];

  const foundSuspicious = suspiciousWords.filter(w => lower.includes(w));

  if (foundSuspicious.length > 0) {
    riskScore += 40;
    reasons.push(`Suspicious content detected: ${foundSuspicious.join(", ")}`);
  }

  // =============================================
  // 9. CONTENT LENGTH CHECK
  // =============================================

  const wordCount = content.trim().split(/\s+/).length;

  if (wordCount < 20) {
    riskScore += 15;
    reasons.push("Certificate content too short to verify");
  } else if (wordCount > 50) {
    riskScore -= 5;
    reasons.push("Certificate has sufficient content");
    details.wordCount = wordCount;
  }

  // =============================================
  // CLAMP SCORE
  // =============================================

  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  // =============================================
  // RISK LEVEL
  // =============================================

  let riskLevel = "Low";
  if (riskScore >= 70) riskLevel = "High";
  else if (riskScore >= 40) riskLevel = "Medium";

  // =============================================
  // SUB-SCORES
  // =============================================

  const structuralIntegrity = foundStructure.length >= 3
    ? 90 : foundStructure.length >= 1 ? 65 : 25;

  const issuerConfidence = foundOrgs.length > 0
    ? Math.min(95, 60 + Math.max(...foundOrgs.map(o => o.weight)))
    : 25;

  const verificationScore = (() => {
    let score = 30;
    if (urls && urls.length > 0) score += 30;
    if (details.verificationUrl && trustedDomains.some(d => details.verificationUrl.includes(d))) score += 25;
    if (credIdFound) score += 15;
    return Math.min(100, score);
  })();

  return {
    riskScore,
    riskLevel,
    reasons,
    flaggedIssues: reasons,  // keep both for compatibility
    structuralIntegrity,
    issuerConfidence,
    verificationScore,
    details
  };
};