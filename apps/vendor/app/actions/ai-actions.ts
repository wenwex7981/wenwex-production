'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.gemini_api_key;
};

async function generateWithFallback(prompt: string) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key Missing");
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) return { success: true, text };
        } catch (error: any) {
            console.error(`Vendor AI Attempt ${modelName} failed:`, error.message);
            lastError = error;
        }
    }
    throw lastError || new Error("AI services currently unavailable.");
}

export async function generateServiceDescriptionAction(title: string, category: string, features: string[]) {
    try {
        const prompt = `
            Act as a professional copywriter for WENWEX, a premium B2B service marketplace.
            Write a high-converting service description based on:
            Title: "${title}"
            Category: "${category}"
            Key Features: ${features.filter(f => f).join(", ")}
            Requirements: Professional tone, plain text only, approx 150 words.
        `;

        const result = await generateWithFallback(prompt);
        return { success: true, data: result.text };
    } catch (error: any) {
        console.error("AI Generation failed:", error);
        return { success: false, error: `Support required: ${error.message}` };
    }
}
