'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.gemini_api_key ||
        "AIzaSyCcL68vprAX67C6gVTuLiyIRaQXoUPxGV8";
};

async function generateWithFallback(prompt: string) {
    const apiKey = getApiKey();
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
            console.error(`Admin AI Attempt ${modelName} failed:`, error.message);
            lastError = error;
        }
    }
    throw lastError || new Error("AI Moderation services currently unavailable.");
}

export async function moderateContentAction(content: string) {
    try {
        const prompt = `
            Act as a Trust & Safety Officer for a marketplace.
            Analyze this content for policy violations: "${content.substring(0, 500)}"
            Return ONLY JSON: { "isSafe": boolean, "flagged": boolean, "reason": "short", "score": 0-100 }
        `;

        const result = await generateWithFallback(prompt);
        const jsonStr = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return { success: true, data: JSON.parse(jsonStr) };
    } catch (error: any) {
        console.error("AI Moderation Error:", error);
        return { success: false, error: error.message };
    }
}
