'use server';

/**
 * WENWEX ADMIN AI - DEACTIVATED TEMPORARILY
 */

export async function moderateContentAction(content: string) {
    // Default to 'Safe' while AI is offline to avoid blocking admin work
    return {
        success: true,
        data: {
            flagged: false,
            isSafe: true,
            reason: "AI Moderator is currently offline.",
            score: 100
        }
    };
}
