require('dotenv').config({ path: './server/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testImage() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using common imagen model name
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
        
        console.log("Generating image...");
        const result = await model.generateContent("A cute tech robot assistant");
        
        // Log the full response structure to see where the image data is
        console.log("Response Keys:", Object.keys(result.response));
        
        // In some SDK versions, the image is in candidates[0].content.parts[0]
        const part = result.response.candidates[0].content.parts[0];
        if (part.inlineData) {
            console.log("Image data found! Mime type:", part.inlineData.mimeType);
            fs.writeFileSync('test-image.png', Buffer.from(part.inlineData.data, 'base64'));
            console.log("Image saved to test-image.png");
        } else {
            console.log("No inlineData found. Part content:", JSON.stringify(part, null, 2));
        }
    } catch (error) {
        console.error('Image Gen Failed:', error.message);
        if (error.response) console.log(error.response.data);
    }
}

testImage();
