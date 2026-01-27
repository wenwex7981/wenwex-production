'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCcL68vprAX67C6gVTuLiyIRaQXoUPxGV8";

export async function chatWithWenwexAI(query: string) {
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
            3. Compare general service types (e.g., WordPress vs Custom Code).

            Rules:
            - Keep answers short, punchy, and helpful (max ~50 words).
            - Tone: Futuristic, professional, yet friendly.
            - If asked about "Project" or "Service", guide them to the search bar.
            - Do not invent specific vendor names.
            
            Response:
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return { success: true, reply: text };
    } catch (error: any) {
        console.error("AI Error:", error);
        return { success: false, reply: `AI Error: ${error.message || "Unknown error"}` };
    }
}
