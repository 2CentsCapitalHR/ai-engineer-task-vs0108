// utils/retrieveRefs.js
const fs = require('fs');
const path = require('path');

function loadSources() {
const dir = path.join(__dirname, '..', 'adgm_sources');
if (!fs.existsSync(dir)) return [];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
  // each "source" will be { id, text, path, snippet }
const sources = files.map(f => {
    const p = path.join(dir, f);
    const text = fs.readFileSync(p, 'utf8');
    const snippet = text.slice(0, 5000); // keep the file body (trim large)
    return { id: f, path: p, text, snippet };
});
return sources;
}

// simple tokenizer
function tokens(s) {
return (s || '').toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
}

// naive overlap score
function scoreOverlap(aTokens, bTokens) {
const bSet = new Set(bTokens);
let c = 0;
for (const t of aTokens) if (bSet.has(t)) c++;
return c;
}

// retrieve top-K sources for a given issueText
function retrieve(issueText, topK = 3) {
    const sources = loadSources();
    if (sources.length === 0) return [];

    const qTokens = tokens(issueText);

    const scored = sources.map(s => ({
        id: s.id,
        path: s.path,
        score: scoreOverlap(qTokens, tokens(s.text)),
        snippet: s.snippet   // ✅ keep snippet
    }));

    scored.sort((a, b) => b.score - a.score);

    const hits = scored.filter(s => s.score > 0).slice(0, topK);

    // ✅ now include snippet in return
    return hits.map(h => ({
        text: h.snippet,       // actual text from Data Sources
        source_file: h.id,
        score: h.score
    }));
}


module.exports = { retrieve, loadSources };
