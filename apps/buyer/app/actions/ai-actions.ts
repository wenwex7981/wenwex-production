'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.gemini_api_key;
};

export async function chatWithWenwexAI(query: string) {
    const apiKey = getApiKey();
    if (!apiKey) {
        return { success: false, reply: "I'm offline right now (System Config Error)." };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // FORCING v1 API and gemini-1.5-flash as per strict requirement
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" },
            { apiVersion: "v1" }
        );

        const prompt = `
            You are WENWEX AI, the intelligent assistant for the WENWEX marketplace.
            User Query: "${query}"

            Your capabilities:
            1. Recommend services based on needs.
            2. Explain technical terms to non-tech buyers.
            3. Compare general service types.

            Rules:
            - Keep answers short, punchy, and helpful (max ~40 words).
            - Tone: Futuristic, professional, yet friendly.
            Response:
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return { success: true, reply: text };
    } catch (error: any) {
        console.error("AI Permanent Error:", error);
        return {
            success: false,
            reply: `Internal adjustment in progress. (${error.message || "Endpoint Unavailable"}).`
        };
    }
}
