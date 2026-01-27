'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        "AIzaSyBMtzc0xiJk5GbQQwLigwA3faYAlhlMQac";
};

export async function generateServiceDescriptionAction(title: string, category: string, features: string[]) {
    const apiKey = getApiKey();
    if (!apiKey) return { success: false, error: "AI key missing." };

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as a professional copywriter for WENWEX, a premium B2B service marketplace.
            Write a high-converting service description based on:
            Title: "${title}"
            Category: "${category}"
            Key Features: ${features.filter(f => f).join(", ")}
            Requirements: Professional tone, plain text only, approx 150 words.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return { success: true, data: text };
    } catch (error: any) {
        console.error("AI Generation failed:", error);
        return { success: false, error: "System busy, please try again." };
    }
}
