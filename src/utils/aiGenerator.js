import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';

// Helper to get API Key
const getApiKey = async () => {
    // 1. Check LocalStorage ( User Settings )
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) return storedKey;

    try {
        // 2. Fallback: Check local .env in the same directory (relative)
        // Note: In production or shared envs, rely on LocalStorage or Environment Variables
        // Removing hardcoded absolute path for security
    } catch (e) {
        console.warn("Could not read API Key from .env file:", e);
    }
    return null;
};

/**
 * Generic helper to call Gemini 1.5 Flash
 */
const callGeminiFlash = async (systemInstruction, userPrompt, imageBase64 = null, apiKey) => {
    // Using the model ID found in the user's environment list
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const parts = [{ text: userPrompt }];

    if (imageBase64) {
        // Extract correct mime type
        const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        parts.push({
            inline_data: {
                mime_type: mimeType,
                data: cleanBase64
            }
        });
    }

    const requestBody = {
        contents: [{ parts }],
        system_instruction: {
            parts: [{ text: systemInstruction }]
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Gemini Flash Error: ${txt}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

/**
 * Uses Gemini 1.5 Flash to enhance a prompt
 */
export const enhancePrompt = async (currentPrompt) => {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const systemPrompt = "You are an expert Prompt Engineer for AI Image Generators. Rewrite the user's prompt to be more descriptive, artistic, and detailed. Focus on lighting, texture, mood, and composition. Keep it under 40 words. Output ONLY the optimized prompt.";

    try {
        const enhanced = await callGeminiFlash(systemPrompt, currentPrompt, null, apiKey);
        return enhanced.trim();
    } catch (e) {
        console.error("Enhance failed:", e);
        return currentPrompt; // Fallback
    }
};

/**
 * Vision Bridge: Describes an image for Imagen
 */
const describeImageWithGemini = async (base64Image, apiKey) => {
    try {
        console.log("Bridging Vision: Analyzing reference image with Gemini 1.5 Flash...");
        const systemPrompt = "Describe the artistic style, color palette, composition, and key elements of this image in detail. This description will be used to generate a similar image.";
        const description = await callGeminiFlash(systemPrompt, "Describe this image", base64Image, apiKey);

        if (description) {
            console.log("Vision Description obtained:", description.substring(0, 50) + "...");
            return description;
        }
    } catch (e) {
        console.warn("Vision Bridge failed, ignoring reference:", e);
    }
    return "";
};

/**
 * Generates an image using Imagen 4.0 Fast (Vertex/Generative Language API)
 */
export const generatePanelImage = async (prompt, referenceBase64 = null, aspectRatio = "1:1") => {
    console.log(`Starting Generation. Prompt: "${prompt}", AR: ${aspectRatio}`);

    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error("API Key not found in Skills/board-generator/scripts/.env");
    }

    let finalPrompt = prompt;

    // VISION BRIDGE LOGIC
    if (referenceBase64) {
        const visualDescription = await describeImageWithGemini(referenceBase64, apiKey);
        if (visualDescription) {
            finalPrompt = `${prompt}. (Style Reference: ${visualDescription})`;
        }
    }

    // Using Verified Imagen 4.0 Fast endpoint
    const modelName = 'imagen-4.0-fast-generate-001';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;

    const requestBody = {
        instances: [
            {
                prompt: finalPrompt
            }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio
        }
    };

    try {
        console.log("Sending request to Imagen 4.0 Fast...", JSON.stringify(requestBody.parameters));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Imagen API Error (${response.status}): ${err}`);
        }

        const data = await response.json();

        const prediction = data.predictions?.[0];

        if (!prediction) {
            throw new Error("No prediction found in response");
        }

        let base64Data = "";

        if (typeof prediction === 'string') {
            base64Data = prediction;
        } else if (prediction.bytesBase64Encoded) {
            base64Data = prediction.bytesBase64Encoded;
        } else if (prediction.bytes) {
            base64Data = prediction.bytes;
        } else {
            console.warn("Unknown prediction format, attempting JSON stringify:", prediction);
            throw new Error("Unknown image format in response");
        }

        return base64Data;

    } catch (error) {
        console.error("Panel generation failed:", error);
        throw error;
    }
};
