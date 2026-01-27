
import Groq from "groq-sdk";

const getApiKey = () => {
    return process.env.GROQ_API_KEY;
};

const getGroq = () => {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    return new Groq({ apiKey });
}

const MODEL = "llama-3.3-70b-versatile";

export const AI_SERVICE = {
    generateServiceDescription: async (title: string, category: string, keywords: string[]) => {
        const groq = getGroq();
        if (!groq) return "AI Key missing";
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: `Write a service description for ${title} in category ${category}. Keywords: ${keywords.join(", ")}` }],
                model: MODEL,
            });
            return completion.choices[0]?.message?.content || "AI generation failed.";
        } catch (e: any) {
            return `AI Error: ${e.message}`;
        }
    },

    explainTechStack: async (techName: string) => {
        const groq = getGroq();
        if (!groq) return "AI Key missing";
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: `Explain ${techName} concisely for a non-tech buyer.` }],
                model: MODEL,
            });
            return completion.choices[0]?.message?.content || "AI Error.";
        } catch (e: any) {
            return `AI Error: ${e.message}`;
        }
    },

    moderateContent: async (content: string, type: string) => {
        const groq = getGroq();
        if (!groq) return { flagged: false, reason: "AI Key missing", score: 50 };
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "system", content: "Return JSON { flagged: boolean, reason: string, score: number }" }, { role: "user", content: `Moderate ${type}: ${content}` }],
                model: MODEL,
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0]?.message?.content || "{}");
        } catch (error: any) {
            return { flagged: false, reason: error.message, score: 50 };
        }
    }
};
