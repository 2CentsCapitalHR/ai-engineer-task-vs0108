// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { checkChecklist } = require('./utils/checklist');
const { annotateDocx } = require('./utils/annotateDocx');
const { retrieve } = require('./utils/retrieveRefs');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mammoth = require("mammoth");

// ✅ Load API key from .env
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
console.error("❌ GOOGLE_API_KEY is missing in your environment variables.");
process.exit(1);
}

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, UPLOAD_DIR),
filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const app = express();
app.use(express.json());

// Initialize Google AI Studio
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Removed duplicate declaration
//const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.post('/upload', upload.array('docs', 10), async (req, res) => {
try {
    const files = req.files; // Multer puts uploaded files here
    console.log(files);
    if (!files?.length) {
    return res.status(400).json({ error: 'No files uploaded. Use field name "docs".' });
    }

    // Parse uploaded DOCX files
    const parsed = await Promise.all(
    files.map(async f => ({
        filename: f.originalname,
        path: f.path,
        text: await parseDocx(f.path)
    }))
    );

    const process = 'Company Incorporation';
    const checklistResult = checkChecklist(parsed, process);

    // Detection rules
    const rules = [
    {
        match: /UAE Federal Courts|Federal Courts/iu,
        section: 'Jurisdiction clause',
        issue: 'References UAE Federal Courts instead of ADGM',
        severity: 'High',
        suggestion: 'Update jurisdiction to ADGM Courts.'
    },
    {
        match: /signature|signed by|signatory/iu,
        section: 'Signatures',
        issue: 'No signatory / signature section detected',
        severity: 'Medium',
        suggestion: 'Add a signature block with signatory name, position and date.',
        invert: true
    }
    ];

    const issuesFound = [];

    for (const p of parsed) {
    for (const rule of rules) {
        const isMatch = rule.invert ? !rule.match.test(p.text) : rule.match.test(p.text);
        if (isMatch) {
          // Retrieve top matches from Data Sources
        const refs = retrieve(rule.issue);

          // Build LLM prompt
        let llm_summary = null;
        if (refs.length) {
            const prompt = `
You are an ADGM compliance assistant.
The following are excerpts from official ADGM sources:

${refs.map(r => `Source: ${r.source_file}\nExcerpt:\n${r.text}`).join("\n\n")}

Question: Based on these references, explain why the following issue is a compliance concern and suggest the ADGM-compliant wording or correction.
Issue: ${rule.issue}
`;

            try {
            const result = await model.generateContent(prompt);
            llm_summary = result.response.text();
            } catch (err) {
            console.error("Gemini API error:", err.message);
            llm_summary = "Error retrieving LLM analysis.";
            }
        }

        issuesFound.push({
            document: p.filename,
            section: rule.section,
            issue: rule.issue,
            severity: rule.severity,
            suggestion: rule.suggestion,
            official_references: refs,
            llm_summary
        });
        }
    }
    }

    // Create annotated DOCX report
    const annotatedOut = path.join(UPLOAD_DIR, `annotated-${uuidv4()}.docx`);
    await annotateDocx(parsed, issuesFound, annotatedOut);

    // Return structured JSON + file name
    res.json({
    output: {
        process,
        documents_uploaded: parsed.length,
        required_documents: checklistResult.required_count,
        missing_document: checklistResult.missing.length ? checklistResult.missing.join(', ') : null,
        issues_found: issuesFound
    },
    annotated_docx: path.basename(annotatedOut)
    });

} catch (err) {
    console.error('Error /upload:', err);
    res.status(500).json({ error: err.message });
}
});

app.get('/download/:fname', (req, res) => {
const filePath = path.join(__dirname, 'uploads', req.params.fname);
return fs.existsSync(filePath) ? res.download(filePath) : res.status(404).send('File not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

async function parseDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}
module.exports = { parseDocx };
