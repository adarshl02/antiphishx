function normalizeRiskScore(rawScore, threshold = 3) {
  if (rawScore <= 0) return 0;
  if (rawScore < threshold) return 10 + (rawScore * 7.5);
  if (rawScore === threshold) return 50;
  if (rawScore > threshold && rawScore <= 7) return 75;
  return 95;
}

export function getVerdictFromComprehend(analysis, text = "") {
  const reasons = [];
  let rawScore = 0;

  const lowerText = text.toLowerCase();  

  // 1. Suspicious Keywords & Urgency
  const suspiciousKeywords = [
    "congratulations",
    "lottery",
    "winner",
    "verify",
    "bank",
    "account",
    "password",
    "urgent",
    "click here",
    "restore access",
    "suspended",
    "limited time",
    "act now",
    "free gift",
    "exclusive offer",
    "claim your reward"
  ];
  if (suspiciousKeywords.some(word => lowerText.includes(word))) {
    rawScore += 2;
    reasons.push("Suspicious keywords or urgency detected");
  }

  // 2. Sensitive PII Detection (from Comprehend)
  const sensitivePIITypes = [
    "BANK_ACCOUNT_NUMBER",
    "BANK_ROUTING",
    "CREDIT_DEBIT_NUMBER",
    "CREDIT_DEBIT_CVV",
    "CREDIT_DEBIT_EXPIRY",
    "PIN",
    "SSN",
    "DRIVER_ID",
    "PASSPORT_NUMBER",
    "INTERNATIONAL_BANK_ACCOUNT_NUMBER",
    "SWIFT_CODE",
    "URL",
    "EMAIL",
    "PHONE_NUMBER"
  ];
  if (analysis.piiEntities && analysis.piiEntities.Entities.length > 0) {
    const flagged = analysis.piiEntities.Entities.filter(e =>
      sensitivePIITypes.includes(e.Type)
    );
    if (flagged.length > 0) {
      rawScore += 3;
      reasons.push(
        "Sensitive data request detected: " +
          flagged.map(f => f.Type).join(", ")
      );
    }
  }

  // 3. Manual sensitive phrases
  const sensitivePhrases = ["pan number", "otp", "cvv", "ifsc", "aadhar", "pin", "security code"];
  if (sensitivePhrases.some(p => lowerText.includes(p))) {
    rawScore += 3;
    reasons.push("Message explicitly requests sensitive information");
  }

  // 4. Large Money Detection
  if (
    analysis.entities &&
    analysis.entities.Entities.some(
      e =>
        e.Type === "QUANTITY" &&
        /\d{5,}/.test(e.Text.replace(/[,₹$]/g, ""))
    )
  ) {
    rawScore += 2;
    reasons.push("Unrealistic money/prize amount detected");
  }

  // 5. Sentiment Checks
  if (
    analysis.sentiment &&
    analysis.sentiment.Sentiment === "POSITIVE" &&
    analysis.sentiment.SentimentScore.Positive > 0.95
  ) {
    rawScore += 1;
    reasons.push("Overly positive tone (common scam technique)");
  }
  if (
    analysis.sentiment &&
    analysis.sentiment.Sentiment === "NEGATIVE" &&
    analysis.sentiment.SentimentScore.Negative > 0.75
  ) {
    rawScore += 2;
    reasons.push("Threatening/negative tone (pressure scam)");
  }

  // 6. URL / Domain Analysis
  const suspiciousURLPatterns = [/bit\.ly/i, /tinyurl/i, /secure-/i, /login-/i];
  if (suspiciousURLPatterns.some(pattern => lowerText.match(pattern))) {
    rawScore += 2;
    reasons.push("Suspicious/shortened URL detected");
  }

  // 7. Brand Impersonation (Misspellings)
  const trustedBrands = ["amazon", "flipkart", "myntra", "paypal", "google", "microsoft"];
  const spoofedBrands = [/amaz0n/i, /paypa1/i, /g00gle/i, /micros0ft/i];
  if (spoofedBrands.some(pattern => lowerText.match(pattern))) {
    rawScore += 3;
    reasons.push("Possible spoofed brand detected");
  }
  if (trustedBrands.some(brand => lowerText.includes(brand))) {
    rawScore -= 1;
    reasons.push("Message references a trusted brand (lower risk)");
  }

  // 8. Contextual Stress Detection (legal, threats, urgency)
  const threatPhrases = ["legal action", "account suspended", "final warning", "immediately", "penalty"];
  if (threatPhrases.some(p => lowerText.includes(p))) {
    rawScore += 3;
    reasons.push("Threatening/urgent language detected");
  }

  // Final Verdict
  const phishingThreshold = 3;
  const isPhishing = rawScore >= 3;

  const riskScore = normalizeRiskScore(rawScore, phishingThreshold);
  return {
    isPhishing,
    verdict: isPhishing ? "⚠️ Potential Phishing" : "✅ Safe",
    riskScore,
    reasons
  };
}
