const fs = require('fs');
const path = require('path');

function loadSources() {
const dir = path.join(__dirname, '..', 'adgm_sources');
if (!fs.existsSync(dir)) return [];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
return files.map(f => {
    const p = path.join(dir, f);
    const text = fs.readFileSync(p, 'utf8');
    const snippet = text.slice(0, 5000); // Keep more context for RAG
    return { id: f, path: p, text, snippet };
});
}

function tokens(s) {
return (s || '').toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
}

function scoreOverlap(aTokens, bTokens) {
const bSet = new Set(bTokens);
let c = 0;
for (const t of aTokens) if (bSet.has(t)) c++;
return c;
}

function retrieve(issueText, topK = 3) {
const sources = loadSources();
if (sources.length === 0) return [];

const qTokens = tokens(issueText);
const scored = sources.map(s => ({
    id: s.id,
    path: s.path,
    score: scoreOverlap(qTokens, tokens(s.text)),
    snippet: s.snippet
}));

scored.sort((a, b) => b.score - a.score);

return scored.filter(s => s.score > 0).slice(0, topK).map(h => ({
    text: h.snippet,       // actual excerpt from Data Sources
    source_file: h.id,
    score: h.score,
    path: h.path
}));
}

module.exports = { retrieve, loadSources };
