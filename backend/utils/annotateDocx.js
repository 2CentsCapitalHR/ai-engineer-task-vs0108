const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

/*
Create a docx that lists detected issues, suggestions, and any official references found via RAG.
Each issue entry includes:
    - Document name
    - Section
    - Issue description
    - Severity level
    - Suggested fix
    - List of relevant ADGM official references with scores and excerpts
The generated document is designed to be clean and easy for reviewers to read.
*/
async function annotateDocx(parsedFiles, issues, outPath) {
const children = [];

  // Title
children.push(new Paragraph({
    text: "ADGM Agent Review Report",
    heading: HeadingLevel.HEADING_1
}));
children.push(new Paragraph({ text: "" }));

  // Processed files summary
children.push(new Paragraph({
    text: `Documents processed: ${parsedFiles.map(p => p.filename).join(', ')}`
}));
children.push(new Paragraph({ text: "" }));

  // No issues
if (!issues || issues.length === 0) {
    children.push(new Paragraph({
    text: "No issues detected by rule-based scanner.",
    bold: true
    }));
} else {
    for (const issue of issues) {
      // Main issue details
    children.push(new Paragraph({
        children: [ new TextRun({ text: `Document: ${issue.document}`, bold: true }) ]
    }));
    children.push(new Paragraph({ text: `Section: ${issue.section}` }));
    children.push(new Paragraph({ text: `Issue: ${issue.issue}` }));
    children.push(new Paragraph({ text: `Severity: ${issue.severity}` }));
    children.push(new Paragraph({ text: `Suggestion: ${issue.suggestion}` }));

    if (issue.llm_summary) {
    children.push(new Paragraph({
        children: [ new TextRun({ text: "LLM Compliance Guidance:", bold: true }) ]
    }));
    children.push(new Paragraph({ text: issue.llm_summary }));
}

      // References from RAG
    if (issue.official_references && issue.official_references.length) {
        children.push(new Paragraph({
        text: "Official references found:",
        bold: true
        }));
        for (const ref of issue.official_references) {
        children.push(new Paragraph({
            children: [
            new TextRun({
                text: `• ${ref.source_file} (score=${ref.score})`,
                italics: true
            })
            ]
        }));
        if (ref.text) {
            children.push(new Paragraph({
            text: `Excerpt: ${ref.text.substring(0, 200)}...`
            }));
        }
        }
    }

      // Divider line for readability
    children.push(new Paragraph({
        children: [ new TextRun({ text: "—".repeat(50), italics: true }) ]
    }));
    children.push(new Paragraph({ text: "" }));
    }
}

  // Create docx
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
