// scripts/extract_pdf.js
// Usage: node scripts/extract_pdf.js "./Data Sources.pdf"
// This extracts the PDF text and writes a single text file adgm_sources/all_sources.txt
// You can later split manually if you want multiple files per category.

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function extract(pdfPath) {
const dataBuffer = fs.readFileSync(pdfPath);
const data = await pdfParse(dataBuffer);
  // crude cleaning
const text = (data.text || '').replace(/\r/g, '');
const outDir = path.join(__dirname, '..', 'adgm_sources');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'all_sources.txt');
fs.writeFileSync(outFile, text, 'utf8');
console.log('Wrote', outFile);
}

const argv = process.argv;
if (argv.length < 3) {
console.error('Usage: node scripts/extract_pdf.js path/to/Data\\ Sources.pdf');
process.exit(2);
}
extract(argv[2]).catch(err => { console.error(err); process.exit(1); });
