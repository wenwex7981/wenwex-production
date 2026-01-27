
import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Initialize only when needed to avoid build errors if key is missing
const getModel = () => {
    const key = getApiKey();
    if (!key) {
        console.warn("Gemini API Key is missing");
        return null;
    }
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({ model: "gemini-pro" });
};

export const AI_SERVICE = {
    // 1. Auto-generate Service Descriptions
    generateServiceDescription: async (title: string, category: string, keywords: string[]) => {
        const model = getModel();
        if (!model) return "AI Service Unavailable: Missing API Key";

        const prompt = `
      You are an expert copywriter for a premium B2B service marketplace called WENWEX.
      Write a compelling, professional, and SEO-optimized service description for:
      Title: "${title}"
      Category: "${category}"
      Keywords: ${keywords.join(", ")}
      
      Requirements:
      - Tone: Professional, authoritative, yet engaging.
      - Structure: Hook -> Key Benefits -> Deliverables -> Call to Action.
      - Length: Around 150-200 words.
      - Formatting: Use markdown (bold, bullet points) for readability.
    `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            console.error("AI Generation Error:", error);
            return "Failed to generate description. Please try again.";
        }
    },

    // 2. Tech Stack Explanation (Buyer Help)
    explainTechStack: async (techName: string) => {
        const model = getModel();
        if (!model) return "AI Service Unavailable";

        const prompt = `
      Explain the technology "${techName}" to a non-technical business buyer.
      - What is it?
      - Why is it popular?
      - best use cases?
      Keep it simple, avoid jargon, and use analogies if helpful. Max 100 words.
    `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            return "Could not explain this tech right now.";
        }
    },

    // 3. Compare Agencies
    compareAgencies: async (agencyA: any, agencyB: any) => {
        const model = getModel();
        if (!model) return "AI Service Unavailable";

        const prompt = `
      Compare these two agencies for a potential buyer:
      Agency A: ${JSON.stringify(agencyA)}
      Agency B: ${JSON.stringify(agencyB)}

      Highlight strengths of each, potential fit for different needs, and provide a neutral recommendation.
      Format as a concise comparison table (markdown) followed by a verdict.
    `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            return "Comparison failed.";
        }
    },

    // 4. Content Moderation (Admin)
    moderateContent: async (content: string, type: 'SERVICE' | 'PROFILE' | 'MESSAGE') => {
        const model = getModel();
        if (!model) return { flagged: false, reason: "AI Unavailable" };

        const prompt = `
      Analyze the following ${type} content for WENWEX marketplace policies.
      Content: "${content.substring(0, 1000)}"

      Check for:
      - Spam or scam patterns
      - Offensive language
      - Personal contact info sharing (if strict policy)
      - Low quality / gibberish

      Respond STRICTLY in JSON format:
      {
        "flagged": boolean,
        "reason": "short explanation if flagged, else null",
        "score": number (0-100, where 100 is safe, 0 is dangerous)
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            // Clean up markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error: any) {
            console.error("Moderation Error:", error);
            return { flagged: false, reason: "AI Analysis Failed", score: 50 };
        }
    },

    // 5. General Buyer Chat
    chatWithBuyer: async (query: string, context?: any) => {
        const model = getModel();
        if (!model) return "I'm currently offline (Configuration Error).";

        const prompt = `
       You are WENWEX AI, a helpful assistant on the WENWEX services marketplace.
       User Query: "${query}"
       Context: ${context ? JSON.stringify(context) : "General inquiry"}

       Answer contentiously and guide them to relevant services or categories. 
       If they ask for a service, suggest searching for it.
       Keep it brief and helpful.
     `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            return "I'm having trouble thinking right now.";
        }
    }
};
