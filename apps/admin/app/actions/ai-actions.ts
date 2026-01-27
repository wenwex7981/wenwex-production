'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    return process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        "AIzaSyBMtzc0xiJk5GbQQwLigwA3faYAlhlMQac";
};

export async function moderateContentAction(content: string) {
    const apiKey = getApiKey();
    if (!apiKey) return { success: false, error: "API key missing." };

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as a Trust & Safety Officer for a marketplace.
            Analyze this content for policy violations: "${content.substring(0, 500)}"
            Return ONLY JSON: { "isSafe": boolean, "flagged": boolean, "reason": "short", "score": 0-100 }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return { success: true, data: JSON.parse(jsonStr) };
    } catch (error: any) {
        console.error("AI Moderation Error:", error);
        return { success: false, error: "Moderation check skipped due to system load." };
    }
}
