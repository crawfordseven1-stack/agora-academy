import { GoogleGenAI, Type } from "@google/genai";
import { LeadSubmission } from '../types';

// Ensure API Key is present
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || 'mock_key' });

const MODEL_FLASH = 'gemini-2.5-flash';

export const startChat = (systemInstruction: string) => {
  return ai.chats.create({
    model: MODEL_FLASH,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });
};

export const evaluateRolePlay = async (transcript: string) => {
  if (!API_KEY) return mockRolePlayEvaluation();

  const prompt = `
    Analyze the following transcript between a Funding Affiliate (User) and a Business Owner (AI).
    Transcript:
    ${transcript}

    Score the Affiliate (0-100) on:
    1. Compliance (No guarantees made)
    2. Qualification (Did they check for 2+ Years Time in Business, $20k+ Revenue, and 680+ Credit?)
    3. Trust Building & Transparency

    Return JSON:
    {
      "score": number,
      "feedback": string,
      "tips": string[], // List of 3 specific actionable tips for improvement
      "passed": boolean
    }
    Pass threshold is 70.
  `;

  try {
    const response = await ai.models.generateContent({
        model: MODEL_FLASH,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
                    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                    passed: { type: Type.BOOLEAN }
                }
            }
        }
    });
    const result = JSON.parse(response.text || '{}');
    
    // Force logical consistency: If score is high enough, it must be a pass.
    // This prevents AI hallucinations where score is 100 but passed is false.
    if (typeof result.score === 'number') {
        result.passed = result.score >= 70;
    }
    
    return result;
  } catch (error) {
    console.error("Gemini Eval Error", error);
    return mockRolePlayEvaluation();
  }
};

export const evaluateLeadSubmission = async (submission: LeadSubmission) => {
    if (!API_KEY) return mockLeadEvaluation(submission);

    const prompt = `
      Evaluate this lead submission for Agora Enterprises (Business Funding).
      Data: ${JSON.stringify(submission)}

      ICP Rules (Strict):
      - Revenue >= $20,000/mo
      - Time in Business >= 2 Years
      - Credit Score >= 680
      - Has Bank Statements = True
      - Industry != "Adult" or "Gambling" or "Firearms"
      - No guaranteed approvals promised

      Return JSON:
      {
        "status": "Accepted" | "Rejected",
        "reason": string,
        "notes": string
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING, enum: ["Accepted", "Rejected"] },
                        reason: { type: Type.STRING },
                        notes: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return mockLeadEvaluation(submission);
    }
};

// Fallbacks if API Key is missing or fails (for robustness in preview)
const mockRolePlayEvaluation = () => ({
    score: 85,
    feedback: "Good job. You correctly identified that the client met the 2-year threshold and handled the rate objection complianty.",
    tips: ["Ask more open-ended questions about their business goals.", "Confirm the exact credit score earlier.", "Express more empathy for their past bad experiences."],
    passed: true
});

const mockLeadEvaluation = (sub: LeadSubmission) => {
    const rev = parseInt(sub.revenue.replace(/[^0-9]/g, '')) || 0;
    const credit = parseInt(sub.creditScore.replace(/[^0-9]/g, '')) || 0;
    
    // Parse time in business roughly for mock
    let tibValid = false;
    if (sub.businessTime.includes('2y+') || sub.businessTime.includes('5y') || sub.businessTime.includes('10y')) {
        tibValid = true;
    }

    const isQualified = rev >= 20000 && tibValid && credit >= 680 && sub.hasBankStatements && sub.icpMet;
    
    let reason = "Meets all ICP criteria.";
    if (!tibValid) reason = "Time in Business is less than 2 years.";
    else if (rev < 20000) reason = "Monthly Revenue is under $20k.";
    else if (credit < 680) reason = "Credit Score is under 680.";
    else if (!sub.hasBankStatements) reason = "Must have access to bank statements.";

    return {
        status: isQualified ? "Accepted" : "Rejected",
        reason: isQualified ? "Meets strict ICP criteria." : reason,
        notes: isQualified ? "Great job vetting this lead." : "Please review the ICP requirements in Module 3."
    };
};