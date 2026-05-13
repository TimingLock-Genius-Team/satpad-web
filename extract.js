const fs = require('fs');
const html = fs.readFileSync('Eulr-demo.html', 'utf-8');
const match = html.match(/<script type="__bundler\/template"\>\r?\n(.*)\n  <\/script>/s);
if (match) {
  let template = JSON.parse(match[1]);
  fs.writeFileSync('temp-template.html', template);
  console.log('done');
}
