import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptDir = __dirname;
const envPath = path.join(scriptDir, '.env');

// Try to read .env file manually
let apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/^GOOGLE_API_KEY=(.*)$/m);
        if (match) apiKey = match[1].trim();
    } catch (e) { }
}

if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY not set in environment or .env file.");
    process.exit(1);
}

const prompt = "A panoramic view of a futuristic city, 16:9 aspect ratio";
const outputPath = path.join(process.cwd(), "test_ar_169.png");

async function main() {
    const modelName = 'imagen-4.0-fast-generate-001';
    console.log(`Generating image with ${modelName} (predict endpoint)...`);

    const requestBody = {
        instances: [
            {
                prompt: prompt
            }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "16:9" // Testing this specific parameter
        }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const prediction = data.predictions?.[0];

        if (!prediction) {
            console.error("Unexpected response structure:", JSON.stringify(data, null, 2));
            throw new Error("No prediction found in response");
        }

        let base64Data = "";

        if (typeof prediction === 'string') {
            base64Data = prediction; // Imagen 4 fast usually returns string
        } else if (prediction.bytesBase64Encoded) {
            base64Data = prediction.bytesBase64Encoded;
        } else if (prediction.bytes) {
            base64Data = prediction.bytes;
        } else {
            console.error("Unknown prediction format:", JSON.stringify(prediction));
            throw new Error("Unknown image format");
        }

        const buffer = Buffer.from(base64Data, "base64");

        fs.writeFileSync(outputPath, buffer);
        console.log(`Image saved successfully to: ${outputPath}`);

    } catch (error) {
        console.error("Generation failed:", error.message);
        process.exit(1);
    }
}

main();
