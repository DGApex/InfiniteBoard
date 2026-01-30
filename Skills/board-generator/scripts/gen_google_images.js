
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Argument Parsing ---
const args = process.argv.slice(2);
const positionalArgs = args.filter(a => !a.startsWith('--'));
const flags = args.filter(a => a.startsWith('--'));

const prompt = positionalArgs[0];
const outputPath = positionalArgs[1];
const refImagePath = positionalArgs[2]; // Optional

const AR_FLAG = flags.find(f => f.startsWith('--ar=')) || "--ar=1:1";
const ASPECT_RATIO = AR_FLAG.split('=')[1];
const SHOULD_ENHANCE = flags.includes('--enhance');

const scriptDir = __dirname;
const envPath = path.join(scriptDir, '.env');

// --- API Key Loading ---
let apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey && fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/^GOOGLE_API_KEY=(.*)$/m);
        if (match) apiKey = match[1].trim();
    } catch (e) { }
}

if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY not set.");
    process.exit(1);
}

if (!prompt || !outputPath) {
    console.error(`Usage: node gen_google_images.js "Prompt" "Output.png" [RefPath] --ar=16:9 --enhance`);
    process.exit(1);
}

// --- Helpers (Mirrored from aiGenerator.js) ---

async function callGeminiFlash(system, user, imagePath = null) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const parts = [{ text: user }];

    if (imagePath && fs.existsSync(imagePath)) {
        const bitmap = fs.readFileSync(imagePath);
        const base64 = bitmap.toString('base64');
        // Simple mime deduction
        const ext = path.extname(imagePath).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

        parts.push({
            inline_data: {
                mime_type: mime,
                data: base64
            }
        });
    }

    const body = {
        contents: [{ parts }],
        system_instruction: { parts: [{ text: system }] }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        throw new Error(`Gemini Flash Error: ${await res.text()}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function enhancePrompt(originalPrompt) {
    console.log("Enhancing prompt with Gemini 2.5 Flash...");
    try {
        const sys = "You are an expert Prompt Engineer. Rewrite the user's prompt to be more descriptive, artistic, and detailed. Output ONLY the optimized prompt.";
        const enhanced = await callGeminiFlash(sys, originalPrompt);
        if (enhanced) {
            console.log(`Enhanced: "${enhanced.substring(0, 50)}..."`);
            return enhanced.trim();
        }
    } catch (e) {
        console.warn("Enhance failed:", e.message);
    }
    return originalPrompt;
}

async function getVisionDescription(imagePath) {
    console.log("Analyzing reference image with Gemini 2.5 Flash...");
    try {
        const sys = "Describe the artistic style, color palette, composition, and key elements of this image in detail. This description will be used to generate a similar image.";
        const desc = await callGeminiFlash(sys, "Describe this image", imagePath);
        if (desc) {
            console.log(`Vision Description: "${desc.substring(0, 50)}..."`);
            return desc;
        }
    } catch (e) {
        console.warn("Vision analysis failed:", e.message);
    }
    return "";
}

async function main() {
    let finalPrompt = prompt;

    // 1. Vision Bridge
    if (refImagePath) {
        const visionDesc = await getVisionDescription(refImagePath);
        if (visionDesc) {
            finalPrompt = `${finalPrompt}. (Style Reference: ${visionDesc})`;
        }
    }

    // 2. Enhancer
    if (SHOULD_ENHANCE) {
        finalPrompt = await enhancePrompt(finalPrompt);
    }

    // 3. Generation (Imagen 4.0 Fast)
    const modelName = 'imagen-4.0-fast-generate-001';
    console.log(`Generating with ${modelName} | AR: ${ASPECT_RATIO}...`);

    // Check ref image handling logic:
    // Imagen 4 via API currently works best with text-only prompts that include the vision description.

    const requestBody = {
        instances: [{ prompt: finalPrompt }],
        parameters: {
            sampleCount: 1,
            aspectRatio: ASPECT_RATIO
        }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Imagen API Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const prediction = data.predictions?.[0];

        if (!prediction) throw new Error("No prediction found");

        let base64Data = "";
        if (typeof prediction === 'string') base64Data = prediction;
        else if (prediction.bytesBase64Encoded) base64Data = prediction.bytesBase64Encoded;
        else if (prediction.bytes) base64Data = prediction.bytes;
        else throw new Error("Unknown output format");

        const buffer = Buffer.from(base64Data, "base64");
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(outputPath, buffer);
        console.log(`Image saved: ${outputPath}`);

    } catch (e) {
        console.error("Generation failed:", e.message);
        process.exit(1);
    }
}

main();
