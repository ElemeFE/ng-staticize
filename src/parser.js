var templateParser = ['$parse', '$interpolate', function($parse, $interpolate) {
  var needInterpolate = { 'ng-src': true, 'ng-href': true };
  var TEXT_NODE = 3;
  var ELEMENT_NODE = 1;

  function walk(el) {
    if (el.nodeType !== ELEMENT_NODE) return;

    var children = [];
    var node = { tagName: el.tagName.toLowerCase() };
    var attributes = el.attributes;
    var attrs, dirs, i, j;

    for (i = 0, j = attributes.length; i < j; i++) {
      var attribute = attributes[i];
      var name = attribute.name;
      var value = attribute.nodeValue;
      if (name && name.substr(0, 3) === 'ng-') {
        if (!dirs) {
          dirs = {};
        }
        if (name.length > 8 && name.substr(0, 8) === 'ng-attr-') {
          if (!attrs) {
            attrs = {};
          }
          attrs[name.substr(9)] = $parse(value);
        } else if (name === 'ng-repeat') {
          var matches = /(\w+)\s+in\s+(.*?)$/.exec(value);
          if (matches) {
            dirs[name] = {
              itemName: matches[1],
              getArray: $parse(matches[2])
            };
          }
        } else {
          dirs[name] = needInterpolate[name] ? $interpolate(value) : $parse(value);
        }
      } else {
        if (!attrs) {
          attrs = {};
        }
        if (/\s*({{\s*(.+?)\s*}})\s*/gi.test(value)) {
          attrs[name] = $interpolate(value);
        } else {
          attrs[name] = value;
        }
      }
    }

    var childNodes = el.childNodes;
    for (i = 0, j = childNodes.length; i < j; i++) {
      var child = childNodes[i];
      if (child.nodeType === TEXT_NODE) {
        var text = child.nodeValue;
        if (text) {
          if (/\s*({{\s*(.+?)\s*}})\s*/gi.test(text)) {
            children.push($interpolate(text));
          } else {
            text = text.replace(/(\r\n|\n|\r|\s)/gm, '');
            if (text.length) {
              children.push(text);
            }
          }
        }
        continue;
      }
      var parseResult = walk(child);
      if (parseResult) {
        children.push(parseResult);
      }
    }

    if (children.length > 0) {
      node.children = children;
    }

    if (attrs) {
      node.attrs = attrs;
    }

    if (dirs) {
      node.dirs = dirs;
    }

    return node;
  }

  return {
    parse: function(template) {
      return walk(require('domify')(template));
    }
  };
}];

module.exports = templateParser;