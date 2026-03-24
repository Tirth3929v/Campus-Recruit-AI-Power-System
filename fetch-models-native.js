require('dotenv').config({ path: './server/.env' });
const https = require('https');

function getModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('API Key missing');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.models) {
                    console.log('Available Models (v1beta):');
                    parsed.models.forEach(m => {
                        if (m.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`- ${m.name}`);
                        }
                    });
                } else {
                    console.log('No models found in response:', data);
                }
            } catch (e) {
                console.error('Failed to parse JSON:', e.message);
                console.log('Raw data:', data);
            }
        });
    }).on('error', (err) => {
        console.error('Request failed:', err.message);
    });
}

getModels();
