const ADGM_CHECKLISTS = {
"Company Incorporation": {
    required: [
    "Articles of Association",
    "Memorandum of Association",
    "Register of Members and Directors",
    "Incorporation Application Form",
    "UBO Declaration Form"
    ]
}
};

function detectDocType(text) {
if (!text) return 'Unknown';
if (/Articles of Association|AoA/iu.test(text)) return 'Articles of Association';
if (/Memorandum of Association|MoA/iu.test(text)) return 'Memorandum of Association';
if (/Register of Members and Directors|Register of Members/iu.test(text)) return 'Register of Members and Directors';
if (/Incorporation Application Form/iu.test(text)) return 'Incorporation Application Form';
if (/UBO Declaration|Ultimate Beneficial Owner/iu.test(text)) return 'UBO Declaration Form';
  // fallback: search for keywords
if (/articles|association/iu.test(text) && /company/iu.test(text)) return 'Articles of Association';
return 'Unknown';
}

function checkChecklist(parsedFiles = [], processName = 'Company Incorporation') {
const required = (ADGM_CHECKLISTS[processName] && ADGM_CHECKLISTS[processName].required) || [];
const found = new Set();

for (const p of parsedFiles) {
    const dt = detectDocType(p.text);
    if (dt !== 'Unknown') found.add(dt);
}

const missing = required.filter(r => !found.has(r));
return {
    required_list: required,
    required_count: required.length,
    found: Array.from(found),
    missing
};
}

module.exports = { checkChecklist, detectDocType };
