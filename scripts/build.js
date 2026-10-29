// Generates questions.js from questions.json so the page also works without fetch.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
function render() {
  const json = fs.readFileSync(path.join(root, 'questions.json'), 'utf8');
  JSON.parse(json);
  return '// Generated from questions.json by scripts/build.js. Do not edit.\nself.QUIZ_DATA = ' + json.trim() + ';\n';
}
if (require.main === module) {
  fs.writeFileSync(path.join(root, 'questions.js'), render());
  console.log('questions.js written');
}
module.exports = { render };
