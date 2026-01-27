'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function generateServiceDescriptionAction(title: string, category: string, features: string[]) {
    if (!apiKey) {
        // Fallback for demo if no key is present, though user should set it.
        // Or return error.
        return { success: false, error: "System Error: One-Click AI is not configured (Missing API Key)." };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            Act as a professional copywriter for WENWEX, a premium B2B service marketplace.
            Write a high-converting service description based on:
            
            Title: "${title}"
            Category: "${category}"
            Key Features: ${features.filter(f => f).join(", ")}

            Requirements:
            - Tone: Professional, authoritative, and persuasive.
            - Structure: 
               1. Engagement hook (1-2 sentences)
               2. Main value proposition (paragraph)
               3. Why choose this service? (short list)
            - Format: Plain text only (no markdown symbols like # or *), suitable for a textarea.
            - Length: Approx 150 words.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return { success: true, data: text };
    } catch (error: any) {
        console.error("AI Error:", error);
        return { success: false, error: "AI generation failed. Please try again later." };
    }
}
