'use server';

import Groq from "groq-sdk";

const getApiKey = () => {
    return process.env.GROQ_API_KEY;
};

export async function chatWithWenwexAI(query: string) {
    const apiKey = getApiKey();
    if (!apiKey) {
        return { success: false, reply: "AI Service Configuration Error: Missing API Key." };
    }

    const groq = new Groq({ apiKey });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are WENWEX AI, the intelligent assistant for the WENWEX marketplace. Your capabilities: 1. Recommend services based on needs. 2. Explain technical terms to non-tech buyers. 3. Compare general service types. Rules: Keep answers short, punchy, and helpful (max ~50 words). Tone: Futuristic, professional, yet friendly."
                },
                {
                    role: "user",
                    content: query
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const reply = chatCompletion.choices[0]?.message?.content || "";
        return { success: true, reply };
    } catch (error: any) {
        console.error("Groq AI Error:", error);
        return {
            success: false,
            reply: `AI Support: ${error.message || "Maintenance in progress."}`
        };
    }
}
