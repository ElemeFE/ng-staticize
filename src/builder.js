var trim = function (string) {
  return string.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

var templateBuilder = [function() {
  function shallowClone(object) {
    var result = {};
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) result[prop] = object[prop];
    }
    return result;
  }

  function newContext(context) {
    var empty = function() {};
    empty.prototype = context;

    return new empty();
  }

  function getStyle(object) {
    var cssText = '';
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        cssText += prop + ':' + object[prop] + ';';
      }
    }
    return cssText;
  }

  function getClasses(object) {
    var classes = [];
    for (var prop in object) {
      if (object.hasOwnProperty(prop) && !!object[prop]) {
        classes.push(prop);
      }
    }
    return classes.join(' ');
  }

  function cloneRepeatNode(node) {
    var cloneNode = shallowClone(node);
    cloneNode.dirs = shallowClone(node.dirs);
    cloneNode.dirs['ng-repeat'] = null;
    delete cloneNode.dirs['ng-repeat'];

    return cloneNode;
  }

  var ATTR_DIR_MAP = {
    'ng-src': true,
    'ng-href': true,
    'ng-alt': true,
    'ng-title': true,
    'ng-id': true,
    'ng-disabled': true,
    'ng-value': true
  };

  var HTML_DIR_MAP = {
    'ng-html': true,
    'ng-bind': true,
    'ng-text': true
  };

  var emptyArray = [];

  function toHTML(node, context) {
    var html, i, j;
    if (node instanceof Array) {
      html = '';

      for (i = 0, j = node.length; i < j; i++) {
        html += toHTML(node[i], context);
      }

      return html;
    }

    if (typeof node === 'string') return node;
    if (typeof node === 'function') return node(context);

    var tag = node.tagName;
    var children = node.children;
    var attrs = node.attrs;
    var dirs = node.dirs;
    var content = node.textContent;
    var classes = '';
    var cssText = '';

    if (dirs && dirs['ng-repeat']) {
      var cloneNode = cloneRepeatNode(node);
      var repeatDir = dirs['ng-repeat'];
      var array = repeatDir.getArray(context) || emptyArray;
      var itemName = repeatDir.itemName;

      html = '';

      for (i = 0, j = array.length; i < j; i++) {
        var subContext = newContext(context);
        subContext.$index = i;
        subContext.$first = i === 0;
        subContext.$last = i === j - 1;
        subContext.$middle = !(subContext.$first || subContext.$last);
        subContext[itemName] = array[i];

        html += toHTML(cloneNode, subContext);
      }

      return html;
    }

    html = '<' + tag;

    for (var dir in dirs) {
      if (dirs.hasOwnProperty(dir)) {
        var fn = dirs[dir];
        var value;
        if (typeof fn === 'function') {
          value = fn(context);
        }

        if (dir === 'ng-if') {
          if (!value) {
            return '';
          }
        } else if (ATTR_DIR_MAP[dir]) {
          html += ' ' + dir.substr(3) + '="' + value + '"';
        } else if (HTML_DIR_MAP[dir]) {
          content = value;
        } else if (dir === 'ng-style') {
          cssText = getStyle(value) + cssText;
        } else if (dir === 'ng-class') {
          classes += getClasses(value);
        } else if (dir === 'ng-show' || dir === 'ng-hide') {
          if (value !== null && value !== undefined) {
            classes += ' ' + dir;
          }
        }
      }
    }

    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        if (attr === 'style') continue;

        var attrValue = attrs[attr];
        if (typeof attrValue === 'function') {
          attrValue = attrValue(context);
        }
        if (attr === 'class') {
          classes += ' ' + attrValue;
        } else {
          html += ' ' + attr + '="' + attrValue + '"';
        }
      }
    }

    if (classes) {
      html += ' class="' + trim(classes) + '"';
    }

    if (cssText) {
      html += ' style="' + cssText + '"';
    }

    html += '>';

    if (content) {
      html += content;
    }

    if (children) {
      for (i = 0, j = children.length; i < j; i++) {
        var child = children[i];
        html += toHTML(child, context);
      }
    }

    html += '</' + tag + '>';

    return html;
  }

  return {
    build: toHTML
  };
}];

module.exports = templateBuilder;