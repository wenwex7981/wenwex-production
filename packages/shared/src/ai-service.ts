
/**
 * SHARED AI SERVICE - DEACTIVATED TEMPORARILY
 */

export const AI_SERVICE = {
    generateServiceDescription: async (title: string, category: string, keywords: string[]) => {
        return "AI Service under maintenance.";
    },

    explainTechStack: async (techName: string) => {
        return "AI Service under maintenance.";
    },

    moderateContent: async (content: string, type: string) => {
        return { flagged: false, reason: "Maintenance", score: 100 };
    }
};
