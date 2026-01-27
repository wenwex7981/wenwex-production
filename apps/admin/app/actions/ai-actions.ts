'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCcL68vprAX67C6gVTuLiyIRaQXoUPxGV8";

export async function moderateContentAction(content: string) {
    if (!apiKey) {
        return { success: false, error: "AI Moderation Unconfigured" };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = `
            Act as a Trust & Safety Officer for a marketplace.
            Analyze this content for policy violations:
            
            "${content.substring(0, 1000)}"

            Check for:
            - Scams / Phishing
            - Personal Contact Info (Phone/Email in description)
            - Offensive Language
            - Gibberish / Low Quality

            Return ONLY JSON:
            {
               "isSafe": boolean,
               "flagged": boolean,
               "reason": "short explanation, or null",
               "score": number (0-100, 100 is perfectly safe)
            }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Basic cleanup
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return { success: true, data: JSON.parse(jsonStr) };
    } catch (error: any) {
        console.error("AI Error:", error);
        return { success: false, error: "Moderation Failed" };
    }
}
