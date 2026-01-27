'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        "AIzaSyBMtzc0xiJk5GbQQwLigwA3faYAlhlMQac";
};

export async function chatWithWenwexAI(query: string) {
    const apiKey = getApiKey();
    if (!apiKey) {
        return { success: false, reply: "I'm offline right now (System Config Error)." };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return { success: true, reply: text };
    } catch (error: any) {
        console.error("AI Error:", error);
        return {
            success: false,
            reply: `AI Diagnostic: ${error.message || "Unknown error"}`
        };
    }
}
