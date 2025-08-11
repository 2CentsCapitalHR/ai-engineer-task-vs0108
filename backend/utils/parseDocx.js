const mammoth = require('mammoth');

async function parseDocx(filepath) {
const result = await mammoth.extractRawText({ path: filepath });
  // mammoth returns object with .value (text)
return result.value || '';
}

module.exports = { parseDocx };
