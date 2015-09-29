var fs = require('fs');
var path = require('path');
var useMin = require('usemin-lib');
const EXAMPLES_PATH = './examples';
const DIST_PATH = './dist/';

var entries = ['index.html'];

entries.map(function(fileName) {
  var entry = path.join(EXAMPLES_PATH, fileName);
  var content = fs.readFileSync(entry).toString();
  var blocks = useMin.getBlocks(entry, content, true);
  useMin.processBlocks(blocks, DIST_PATH);
  fs.writeFile(DIST_PATH + fileName, useMin.getHTML(content, blocks, false));
});
