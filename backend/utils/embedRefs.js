const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI with your API key
const genAI = new GoogleGenerativeAI("AIzaSyC8XhLMBEkQDOOXRt4XkBxsDrT7HwGtTKM");

async function embedSources() {
const dir = path.join(__dirname, '..', 'adgm_sources');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
const out = [];

for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8').substring(0, 3000);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    out.push({ file: f, embedding: result.embedding.values });
}

fs.writeFileSync(path.join(dir, 'embeddings.json'), JSON.stringify(out));
console.log(`Saved embeddings for ${out.length} sources.`);
}

if (require.main === module) {
embedSources();
}

module.exports = { embedSources };
