
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getApiKey = () => {
    try {
        const envPath = path.join(__dirname, '.env');
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/GOOGLE_API_KEY=(.*)/);
        if (match && match[1]) {
            return match[1].trim();
        }
    } catch (e) {
        console.error("Error reading .env:", e);
    }
    return null;
};

const listModels = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.name.includes("flash") || m.name.includes("imagen")) {
                    console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
};

listModels();
