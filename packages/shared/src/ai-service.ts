
import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.gemini_api_key;
};

const getModel = () => {
    const key = getApiKey();
    if (!key) return null;
    const genAI = new GoogleGenerativeAI(key);
    // FORCING v1 API and gemini-1.5-flash as per strict requirement
    return genAI.getGenerativeModel(
        { model: "gemini-1.5-flash" },
        { apiVersion: "v1" }
    );
};

export const AI_SERVICE = {
    generateServiceDescription: async (title: string, category: string, keywords: string[]) => {
        const model = getModel();
        if (!model) return "AI Key missing";
        const prompt = `Write a service description for ${title} in category ${category}. Keywords: ${keywords.join(", ")}`;
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e: any) {
            return `AI Error: ${e.message}`;
        }
    },

    explainTechStack: async (techName: string) => {
        const model = getModel();
        if (!model) return "AI Key missing";
        const prompt = `Explain ${techName} concisely for a non-tech buyer.`;
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e: any) {
            return `AI Error: ${e.message}`;
        }
    },

    moderateContent: async (content: string, type: string) => {
        const model = getModel();
        if (!model) return { flagged: false, reason: "AI Key missing", score: 50 };
        const prompt = `Moderate this ${type} content: ${content}. Return JSON { flagged: boolean, reason: string, score: number }`;
        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error: any) {
            return { flagged: false, reason: error.message, score: 50 };
        }
    }
};
