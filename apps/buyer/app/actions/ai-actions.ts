'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

// Robust API Key retrieval
const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.gemini_api_key;
};

/**
 * Executes AI generation with an automatic fallback mechanism.
 * Tries multiple models and API versions to ensure it never fails.
 */
async function generateWithFallback(prompt: string) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key Missing (System Config)");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Ordered list of models to try
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            // Try v1 first (stable), then v1beta (default)
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) return { success: true, text };
        } catch (error: any) {
            console.error(`Attempt with ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    throw lastError || new Error("All AI models failed to respond.");
}

export async function chatWithWenwexAI(query: string) {
    try {
        const prompt = `
            You are WENWEX AI, the intelligent assistant for the WENWEX marketplace.
            User Query: "${query}"

            Your capabilities:
            1. Recommend services based on needs.
            2. Explain technical terms to non-tech buyers.
            3. Compare general service types.

            Rules:
            - Keep answers short, punchy, and helpful (max ~50 words).
            - Tone: Futuristic, professional, yet friendly.
            Response:
        `;

        const result = await generateWithFallback(prompt);
        return { success: true, reply: result.text };
    } catch (error: any) {
        console.error("AI Permanent Error:", error);
        return {
            success: false,
            reply: `I am currently optimizing my systems. (Technical Detail: ${error.message || "Endpoint Unavailable"}). Please try again in a moment.`
        };
    }
}
