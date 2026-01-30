import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

let apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^GOOGLE_API_KEY=(.*)$/m);
    if (match) apiKey = match[1].trim();
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function check() {
    const res = await fetch(url);
    const data = await res.json();
    const model = data.models.find(m => m.name.includes('imagen-4.0-fast'));
    console.log(JSON.stringify(model, null, 2));
}

check();
