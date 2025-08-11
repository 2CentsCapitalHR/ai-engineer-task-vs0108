const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseDocx } = require('./utils/parseDocx');
const { checkChecklist } = require('./utils/checklist');
const { annotateDocx } = require('./utils/annotateDocx');
const { retrieve } = require('./utils/retrieveRefs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const app = express();
app.use(express.json());

app.post('/upload', upload.array('docs', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded. Use field name "docs".' });

        const parsed = [];
        for (const f of req.files) {
            const text = await parseDocx(f.path);
            parsed.push({ filename: f.originalname, path: f.path, text });
        }

        const process = 'Company Incorporation';
        const checklistResult = checkChecklist(parsed, process);

        const issuesFound = [];
        for (const p of parsed) {
            if (/UAE Federal Courts|Federal Courts/iu.test(p.text)) {
                const issue = {
                    document: p.filename,
                    section: 'Jurisdiction clause',
                    issue: 'References UAE Federal Courts instead of ADGM',
                    severity: 'High',
                    suggestion: 'Update jurisdiction to ADGM Courts.',
                    official_references: retrieve('jurisdiction ADGM court')
                };
                issuesFound.push(issue);
            }
            if (/signature|signed by|signatory/iu.test(p.text) === false) {
                const issue = {
                    document: p.filename,
                    section: 'Signatures',
                    issue: 'No signatory / signature section detected',
                    severity: 'Medium',
                    suggestion: 'Add a signature block with signatory name, position and date.',
                    official_references: retrieve('signature block signatory ADGM')
                };
                issuesFound.push(issue);
            }
        }

        const annotatedOut = path.join(UPLOAD_DIR, 'annotated-' + uuidv4() + '.docx');
        await annotateDocx(parsed, issuesFound, annotatedOut);

        const output = {
            process,
            documents_uploaded: parsed.length,
            required_documents: checklistResult.required_count,
            missing_document: checklistResult.missing.length ? checklistResult.missing.join(', ') : null,
            issues_found: issuesFound
        };

        res.json({ output, annotated_docx: path.basename(annotatedOut) });
    } catch (err) {
        console.error('Error /upload:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/download/:fname', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.fname);
    if (fs.existsSync(filePath)) return res.download(filePath);
    return res.status(404).send('File not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
