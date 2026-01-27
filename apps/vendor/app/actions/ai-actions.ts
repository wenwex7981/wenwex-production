'use server';

import Groq from "groq-sdk";

const getApiKey = () => {
    return process.env.GROQ_API_KEY;
};

export async function generateServiceDescriptionAction(title: string, category: string, features: string[]) {
    const apiKey = getApiKey();
    if (!apiKey) return { success: false, error: "AI key missing." };

    const groq = new Groq({ apiKey });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Act as a professional copywriter for WENWEX, a premium B2B service marketplace. Write a high-converting service description. Tone: Professional, authoritative, and persuasive. Format: Plain text only. Length: approx 150 words."
                },
                {
                    role: "user",
                    content: `Write a service description for: "${title}" in category "${category}". Key features: ${features.filter(f => f).join(", ")}`
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const text = chatCompletion.choices[0]?.message?.content || "";
        return { success: true, data: text };
    } catch (error: any) {
        console.error("Groq AI Error:", error);
        return { success: false, error: "AI generation failed." };
    }
}
