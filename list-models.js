require('dotenv').config({ path: './server/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('API Key missing');
        return;
    }

    try {
        // Use a generic fetch or the SDK if possible
        // The Node SDK doesn't have a direct 'listModels' in the top-level genAI object in all versions
        // Let's try the standard way or just try 1.5-flash-latest
        const genAI = new GoogleGenerativeAI(apiKey);
        console.log("Testing gemini-1.5-flash...");
        try {
            const m15 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const r15 = await m15.generateContent("test");
            console.log("gemini-1.5-flash works!");
        } catch (e) {
            console.log("gemini-1.5-flash failed:", e.message);
        }

        console.log("Testing gemini-1.5-flash-latest...");
        try {
            const m15l = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const r15l = await m15l.generateContent("test");
            console.log("gemini-1.5-flash-latest works!");
        } catch (e) {
            console.log("gemini-1.5-flash-latest failed:", e.message);
        }

        console.log("Testing gemini-pro...");
        try {
            const mp = genAI.getGenerativeModel({ model: "gemini-pro" });
            const rp = await mp.generateContent("test");
            console.log("gemini-pro works!");
        } catch (e) {
            console.log("gemini-pro failed:", e.message);
        }

    } catch (error) {
        console.error('Fatal error:', error.message);
    }
}

listModels();
