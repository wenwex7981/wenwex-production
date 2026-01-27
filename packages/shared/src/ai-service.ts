
import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.gemini_api_key;
};

/**
 * Shared utility for robust AI generation across the monorepo.
 */
async function runAiGeneration(prompt: string) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key Missing");
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            console.error(`Shared AI Error (${modelName}):`, error.message);
            lastError = error;
        }
    }
    throw lastError || new Error("Global AI service failed.");
}

export const AI_SERVICE = {
    generateServiceDescription: async (title: string, category: string, keywords: string[]) => {
        const prompt = `Write a service description for ${title} in category ${category}. Keywords: ${keywords.join(", ")}`;
        try {
            return await runAiGeneration(prompt);
        } catch (e: any) {
            return `AI Error: ${e.message}`;
        }
    },

    explainTechStack: async (techName: string) => {
        const prompt = `Explain ${techName} concisely for a non-tech buyer.`;
        try {
            return await runAiGeneration(prompt);
        } catch (e: any) {
            return `AI Error: ${e.message}`;
        }
    },

    compareAgencies: async (agencyA: any, agencyB: any) => {
        const prompt = `Compare these two agencies: ${JSON.stringify(agencyA)} and ${JSON.stringify(agencyB)}`;
        try {
            return await runAiGeneration(prompt);
        } catch (e: any) {
            return "Comparison failed.";
        }
    },

    moderateContent: async (content: string, type: string) => {
        const prompt = `Moderate this ${type} content: ${content}. Return JSON { flagged: boolean, reason: string, score: number }`;
        try {
            const text = await runAiGeneration(prompt);
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error: any) {
            return { flagged: false, reason: error.message, score: 50 };
        }
    }
};
