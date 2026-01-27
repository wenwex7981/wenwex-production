'use server';

import Groq from "groq-sdk";

const getApiKey = () => {
    return process.env.GROQ_API_KEY;
};

export async function moderateContentAction(content: string) {
    const apiKey = getApiKey();
    if (!apiKey) return { success: false, error: "AI key missing." };

    const groq = new Groq({ apiKey });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Act as a Trust & Safety Officer for a marketplace. Analyze content for policy violations. Return ONLY JSON: { \"isSafe\": boolean, \"flagged\": boolean, \"reason\": \"string\", \"score\": 0-100 }"
                },
                {
                    role: "user",
                    content: `Analyze this content: "${content.substring(0, 500)}"`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const reply = chatCompletion.choices[0]?.message?.content || "{}";
        return { success: true, data: JSON.parse(reply) };
    } catch (error: any) {
        console.error("Groq AI Error:", error);
        return { success: false, error: "Moderation check skipped." };
    }
}
