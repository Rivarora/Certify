export const calculateRisk = (content) => {

  if (!content || typeof content !== "string") {
    return {
      riskScore: 100,
      riskLevel: "High",
      reasons: ["❌ Invalid certificate content"],
      flaggedIssues: ["❌ Invalid certificate content"],
      structuralIntegrity: 0,
      issuerConfidence: 0,
      verificationScore: 0,
      details: {}
    };
  }

  let riskScore = 0;
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
    { name: "edx", weight: 12 },
    { name: "adobe", weight: 12 },
    { name: "salesforce", weight: 12 },
    { name: "cisco", weight: 15 },
    { name: "comptia", weight: 15 },
    { name: "pmi", weight: 15 },
    { name: "isc2", weight: 15 },
    { name: "red hat", weight: 15 },
    { name: "databricks", weight: 12 },
    { name: "snowflake", weight: 12 },
    { name: "tableau", weight: 12 },
    { name: "hubspot", weight: 10 },
    { name: "semrush", weight: 10 }
  ];

  const foundOrgs = trustedOrgs.filter(org =>
    lower.includes(org.name)
  );

  if (foundOrgs.length > 0) {
    details.trustedOrgs = foundOrgs.map(o => o.name);
    reasons.push(
      `✅ Trusted organization detected: ${foundOrgs.map(o => o.name).join(", ")}`
    );
  } else {
    riskScore += 25;
    reasons.push("❌ No trusted organization detected");
  }

  // =============================================
  // 2. CERTIFICATE STRUCTURE KEYWORDS
  // =============================================

  const structureKeywords = [
    "certificate", "certification", "certifies",
    "completed", "completion", "awarded",
    "presented", "successfully", "achievement",
    "this is to certify", "has successfully completed",
    "course certificate", "authorized", "hereby",
    "proud to certify", "in recognition", "participation"
  ];

  const foundStructure = structureKeywords.filter(k =>
    lower.includes(k)
  );

  details.structureKeywords = foundStructure;

  if (foundStructure.length >= 3) {
    reasons.push("✅ Strong certificate structure detected");
  } else if (foundStructure.length >= 1) {
    riskScore += 10;
    reasons.push("⚠️ Basic certificate structure detected");
  } else {
    riskScore += 25;
    reasons.push("❌ Certificate structure not detected");
  }

  // =============================================
  // 3. SIGNATORY / AUTHORITY DETECTION
  // =============================================

  const signatoryKeywords = [
    "signature", "signed", "authorized signatory",
    "director", "president", "ceo", "manager",
    "head of", "officer", "instructor", "professor",
    "global director", "vice president", "founder",
    "principal", "dean", "chancellor", "registrar",
    "chairman", "chief", "coordinator", "facilitator"
  ];

  const foundSignatory = signatoryKeywords.filter(k =>
    lower.includes(k)
  );

  if (foundSignatory.length > 0) {
    details.signatory = foundSignatory;
    reasons.push(`✅ Valid signatory detected: ${foundSignatory[0]}`);
  } else {
    riskScore += 20;
    reasons.push("❌ No signatory or authority detected");
  }

  // =============================================
  // 4. VERIFICATION URL
  // =============================================

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlRegex);

  const trustedDomains = [
    "coursera.org", "google.com", "linkedin.com",
    "microsoft.com", "credly.com", "udemy.com",
    "edx.org", "harvard.edu", "mit.edu", "nptel.ac.in",
    "credential.net", "youracclaim.com", "badgr.com",
    "cisco.com", "adobe.com", "salesforce.com",
    "comptia.org", "pmi.org", "isc2.org"
  ];

  let trustedUrl = null;

  if (urls && urls.length > 0) {
    trustedUrl = urls.find(url =>
      trustedDomains.some(domain => url.includes(domain))
    );

    if (trustedUrl) {
      details.verificationUrl = trustedUrl;
      reasons.push(`✅ Trusted verification URL found: ${trustedUrl}`);
    } else {
      riskScore += 10;
      details.verificationUrl = urls[0];
      reasons.push(`⚠️ Verification URL found (unrecognized domain): ${urls[0]}`);
    }
  } else {
    riskScore += 25;
    reasons.push("❌ No verification URL found");
  }

  // =============================================
  // 5. CREDENTIAL / CERTIFICATE ID
  // =============================================

  const credIdPatterns = [
    /certificate[\s\w]*id[:\s#]+([A-Z0-9\-]{4,})/i,
    /credential[\s\w]*id[:\s#]+([A-Z0-9\-]{4,})/i,
    /verify\/([A-Z0-9]{6,})/i,
    /certificate[^\n]{0,30}([A-Z0-9]{10,})/i,
    /\b([A-Z0-9]{12,})\b/
  ];

  const credIdFound = credIdPatterns.some(p => p.test(content));

  if (credIdFound) {
    riskScore += 0;
    const match = credIdPatterns
      .map(p => content.match(p))
      .find(Boolean);
    details.credentialId = match?.[1] || "detected";
    reasons.push(`✅ Credential ID detected: ${details.credentialId}`);
  } else {
    riskScore += 15;
    reasons.push("❌ Certificate ID not detected");
  }

  // =============================================
  // 6. RECIPIENT NAME DETECTION
  // =============================================

  const recipientPatterns = [
    /awarded to[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/,
    /presented to[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/,
    /this certifies that[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /certify that[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /^([A-Z][a-z]+(?: [A-Z][a-z]+)+)$/m
  ];

  const recipientFound = recipientPatterns.some(p => p.test(content));

  if (recipientFound) {
    const match = recipientPatterns
      .map(p => content.match(p))
      .find(Boolean);
    details.recipientName = match?.[1] || "detected";
    reasons.push(`✅ Recipient name detected: ${details.recipientName}`);
  } else {
    riskScore += 10;
    reasons.push("❌ Recipient name not clearly detected");
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
  const currentYear = new Date().getFullYear();
  const yearMatch = content.match(/\b(20\d{2})\b/);
  const certYear = yearMatch ? parseInt(yearMatch[1]) : null;

  if (dateFound) {
    const match = datePatterns
      .map(p => content.match(p))
      .find(Boolean);
    details.date = match?.[0];

    if (certYear && certYear > currentYear) {
      riskScore += 30;
      reasons.push(`❌ Suspicious future date detected: ${certYear}`);
    } else {
      reasons.push(`✅ Valid issue date detected: ${details.date}`);
    }
  } else {
    riskScore += 10;
    reasons.push("❌ No issue date detected");
  }

 

  // =============================================
  // 9. SUSPICIOUS CONTENT DETECTION
  // =============================================

  const suspiciousWords = [
    "fake", "sample", "demo", "generated",
    "test certificate", "dummy", "template",
    "lorem ipsum", "placeholder", "example only",
    "not valid", "void", "specimen"
  ];

  const foundSuspicious = suspiciousWords.filter(w =>
    lower.includes(w)
  );

  if (foundSuspicious.length > 0) {
    riskScore += 40;
    reasons.push(`❌ Suspicious content detected: ${foundSuspicious.join(", ")}`);
  } else {
    reasons.push("✅ No suspicious content found");
  }

  

  // =============================================
  // CLAMP SCORE 0 - 100
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

  const structuralIntegrity =
    foundStructure.length >= 3 ? 90 :
    foundStructure.length >= 1 ? 65 : 25;

  const issuerConfidence =
    foundOrgs.length > 0
      ? Math.min(95, 60 + Math.max(...foundOrgs.map(o => o.weight)))
      : 25;

  const verificationScore = (() => {
    let score = 30;
    if (urls && urls.length > 0) score += 25;
    if (trustedUrl) score += 25;
    if (credIdFound) score += 20;
    return Math.min(100, score);
  })();

  // =============================================
  // RETURN
  // =============================================

  return {
    riskScore,
    riskLevel,
    reasons,
    flaggedIssues: reasons,
    structuralIntegrity,
    issuerConfidence,
    verificationScore,
    details
  };
};