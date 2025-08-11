const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

async function annotateDocx(parsedFiles, issues, outPath) {
const children = [];

children.push(new Paragraph({ text: "ADGM Agent Review Report", heading: HeadingLevel.HEADING_1 }));
children.push(new Paragraph({ text: "" }));

children.push(new Paragraph({ text: `Documents processed: ${parsedFiles.map(p => p.filename).join(', ')}` }));
children.push(new Paragraph({ text: "" }));

if (issues.length === 0) {
    children.push(new Paragraph({ text: "No issues detected by rule-based scanner.", bold: true }));
} else {
    for (const issue of issues) {
    children.push(new Paragraph({
        children: [ new TextRun({ text: `Document: ${issue.document}`, bold: true }) ]
    }));
    children.push(new Paragraph({ children: [ new TextRun({ text: `Section: ${issue.section}` }) ] }));
    children.push(new Paragraph({ children: [ new TextRun({ text: `Issue: ${issue.issue}` }) ] }));
    children.push(new Paragraph({ children: [ new TextRun({ text: `Severity: ${issue.severity}` }) ] }));
    children.push(new Paragraph({ children: [ new TextRun({ text: `Suggestion: ${issue.suggestion}` }) ] }));
    children.push(new Paragraph({ text: "" }));
    }
}

  // ✅ docx v8+ requires sections at creation
const doc = new Document({
    creator: "ADGM Agent",
    title: "ADGM Review Report",
    description: "Automated compliance review output",
    sections: [
    {
        properties: {},
        children
    }
    ]
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
return outPath;
}

module.exports = { annotateDocx };
