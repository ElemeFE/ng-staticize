/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var parser = __webpack_require__(1);
	var builder = __webpack_require__(3);
	
	angular.module('ngStaticize', [])
	  .factory('templateParser', parser)
	  .factory('templateBuilder', builder)
	  .directive('ngStaticize', ['templateParser', 'templateBuilder', '$parse', function(templateParser, templateBuilder) {
	    return {
	      restrict: 'EA',
	      replace: true,
	      terminal: true,
	      priority: 1001,
	      compile: function(element) {
	        var html = element[0].innerHTML;
	        var template = templateParser.parse(html);
	        return {
	          post: function(scope, element, attrs) {
	            var reRender = function () {
	              var result = templateBuilder.build(template, scope);
	              element[0].innerHTML = result;
	            };
	
	            reRender();
	
	            var watchExpr = attrs.ngStaticize;
	
	            if (watchExpr) {
	              scope.$watch(watchExpr, function() {
	                reRender();
	              }, true);
	            }
	          }
	        };
	      }
	    };
	  }]);
	
	module.exports = {};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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
	      return walk(__webpack_require__(2)(template));
	    }
	  };
	}];
	
	module.exports = templateParser;

/***/ },
/* 2 */
/***/ function(module, exports) {

	
	/**
	 * Expose `parse`.
	 */
	
	module.exports = parse;
	
	/**
	 * Tests for browser support.
	 */
	
	var innerHTMLBug = false;
	var bugTestDiv;
	if (typeof document !== 'undefined') {
	  bugTestDiv = document.createElement('div');
	  // Setup
	  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
	  // Make sure that link elements get serialized correctly by innerHTML
	  // This requires a wrapper element in IE
	  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
	  bugTestDiv = undefined;
	}
	
	/**
	 * Wrap map from jquery.
	 */
	
	var map = {
	  legend: [1, '<fieldset>', '</fieldset>'],
	  tr: [2, '<table><tbody>', '</tbody></table>'],
	  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
	  // for script/link/style tags to work in IE6-8, you have to wrap
	  // in a div with a non-whitespace character in front, ha!
	  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
	};
	
	map.td =
	map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];
	
	map.option =
	map.optgroup = [1, '<select multiple="multiple">', '</select>'];
	
	map.thead =
	map.tbody =
	map.colgroup =
	map.caption =
	map.tfoot = [1, '<table>', '</table>'];
	
	map.polyline =
	map.ellipse =
	map.polygon =
	map.circle =
	map.text =
	map.line =
	map.path =
	map.rect =
	map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];
	
	/**
	 * Parse `html` and return a DOM Node instance, which could be a TextNode,
	 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
	 * instance, depending on the contents of the `html` string.
	 *
	 * @param {String} html - HTML string to "domify"
	 * @param {Document} doc - The `document` instance to create the Node for
	 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
	 * @api private
	 */
	
	function parse(html, doc) {
	  if ('string' != typeof html) throw new TypeError('String expected');
	
	  // default to the global `document` object
	  if (!doc) doc = document;
	
	  // tag name
	  var m = /<([\w:]+)/.exec(html);
	  if (!m) return doc.createTextNode(html);
	
	  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace
	
	  var tag = m[1];
	
	  // body support
	  if (tag == 'body') {
	    var el = doc.createElement('html');
	    el.innerHTML = html;
	    return el.removeChild(el.lastChild);
	  }
	
	  // wrap map
	  var wrap = map[tag] || map._default;
	  var depth = wrap[0];
	  var prefix = wrap[1];
	  var suffix = wrap[2];
	  var el = doc.createElement('div');
	  el.innerHTML = prefix + html + suffix;
	  while (depth--) el = el.lastChild;
	
	  // one element
	  if (el.firstChild == el.lastChild) {
	    return el.removeChild(el.firstChild);
	  }
	
	  // several elements
	  var fragment = doc.createDocumentFragment();
	  while (el.firstChild) {
	    fragment.appendChild(el.removeChild(el.firstChild));
	  }
	
	  return fragment;
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjdkNTNjOTk2N2FhMTA3MWQ2NzAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9kb21pZnkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2J1aWxkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUN0Q0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSCxxQjs7Ozs7O0FDckNBO0FBQ0EsMEJBQXlCO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLGlCQUFnQjtBQUNoQjtBQUNBOztBQUVBLHVDQUFzQyxPQUFPO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLG9CQUFtQixhQUFhO0FBQ2hDO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUNBQXNDLE9BQU87QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsYUFBYTtBQUNsQztBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVELGlDOzs7Ozs7O0FDN0ZBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLFNBQVM7QUFDcEIsYUFBWSxRQUFRO0FBQ3BCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx5Q0FBd0M7O0FBRXhDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQy9HQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFpRDtBQUNqRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1DQUFrQyxPQUFPO0FBQ3pDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsb0NBQW1DLE9BQU87QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBLFVBQVM7QUFDVDtBQUNBLFVBQVM7QUFDVDtBQUNBLFVBQVM7QUFDVDtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVDQUFzQyxPQUFPO0FBQzdDO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7QUFFRCxrQyIsImZpbGUiOiJuZy1zdGF0aWNpemUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIGY3ZDUzYzk5NjdhYTEwNzFkNjcwXG4gKiovIiwidmFyIHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyJyk7XG52YXIgYnVpbGRlciA9IHJlcXVpcmUoJy4vYnVpbGRlcicpO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdTdGF0aWNpemUnLCBbXSlcbiAgLmZhY3RvcnkoJ3RlbXBsYXRlUGFyc2VyJywgcGFyc2VyKVxuICAuZmFjdG9yeSgndGVtcGxhdGVCdWlsZGVyJywgYnVpbGRlcilcbiAgLmRpcmVjdGl2ZSgnbmdTdGF0aWNpemUnLCBbJ3RlbXBsYXRlUGFyc2VyJywgJ3RlbXBsYXRlQnVpbGRlcicsICckcGFyc2UnLCBmdW5jdGlvbih0ZW1wbGF0ZVBhcnNlciwgdGVtcGxhdGVCdWlsZGVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgICAgcHJpb3JpdHk6IDEwMDEsXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciBodG1sID0gZWxlbWVudFswXS5pbm5lckhUTUw7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRlbXBsYXRlUGFyc2VyLnBhcnNlKGh0bWwpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHBvc3Q6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgdmFyIHJlUmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGVtcGxhdGVCdWlsZGVyLmJ1aWxkKHRlbXBsYXRlLCBzY29wZSk7XG4gICAgICAgICAgICAgIGVsZW1lbnRbMF0uaW5uZXJIVE1MID0gcmVzdWx0O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVSZW5kZXIoKTtcblxuICAgICAgICAgICAgdmFyIHdhdGNoRXhwciA9IGF0dHJzLm5nU3RhdGljaXplO1xuXG4gICAgICAgICAgICBpZiAod2F0Y2hFeHByKSB7XG4gICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCh3YXRjaEV4cHIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJlUmVuZGVyKCk7XG4gICAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge307XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9pbmRleC5qc1xuICoqIG1vZHVsZSBpZCA9IDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciB0ZW1wbGF0ZVBhcnNlciA9IFsnJHBhcnNlJywgJyRpbnRlcnBvbGF0ZScsIGZ1bmN0aW9uKCRwYXJzZSwgJGludGVycG9sYXRlKSB7XG4gIHZhciBuZWVkSW50ZXJwb2xhdGUgPSB7ICduZy1zcmMnOiB0cnVlLCAnbmctaHJlZic6IHRydWUgfTtcbiAgdmFyIFRFWFRfTk9ERSA9IDM7XG4gIHZhciBFTEVNRU5UX05PREUgPSAxO1xuXG4gIGZ1bmN0aW9uIHdhbGsoZWwpIHtcbiAgICBpZiAoZWwubm9kZVR5cGUgIT09IEVMRU1FTlRfTk9ERSkgcmV0dXJuO1xuXG4gICAgdmFyIGNoaWxkcmVuID0gW107XG4gICAgdmFyIG5vZGUgPSB7IHRhZ05hbWU6IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSB9O1xuICAgIHZhciBhdHRyaWJ1dGVzID0gZWwuYXR0cmlidXRlcztcbiAgICB2YXIgYXR0cnMsIGRpcnMsIGksIGo7XG5cbiAgICBmb3IgKGkgPSAwLCBqID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgIHZhciBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2ldO1xuICAgICAgdmFyIG5hbWUgPSBhdHRyaWJ1dGUubmFtZTtcbiAgICAgIHZhciB2YWx1ZSA9IGF0dHJpYnV0ZS5ub2RlVmFsdWU7XG4gICAgICBpZiAobmFtZSAmJiBuYW1lLnN1YnN0cigwLCAzKSA9PT0gJ25nLScpIHtcbiAgICAgICAgaWYgKCFkaXJzKSB7XG4gICAgICAgICAgZGlycyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lLmxlbmd0aCA+IDggJiYgbmFtZS5zdWJzdHIoMCwgOCkgPT09ICduZy1hdHRyLScpIHtcbiAgICAgICAgICBpZiAoIWF0dHJzKSB7XG4gICAgICAgICAgICBhdHRycyA9IHt9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBhdHRyc1tuYW1lLnN1YnN0cig5KV0gPSAkcGFyc2UodmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICduZy1yZXBlYXQnKSB7XG4gICAgICAgICAgdmFyIG1hdGNoZXMgPSAvKFxcdyspXFxzK2luXFxzKyguKj8pJC8uZXhlYyh2YWx1ZSk7XG4gICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIGRpcnNbbmFtZV0gPSB7XG4gICAgICAgICAgICAgIGl0ZW1OYW1lOiBtYXRjaGVzWzFdLFxuICAgICAgICAgICAgICBnZXRBcnJheTogJHBhcnNlKG1hdGNoZXNbMl0pXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXJzW25hbWVdID0gbmVlZEludGVycG9sYXRlW25hbWVdID8gJGludGVycG9sYXRlKHZhbHVlKSA6ICRwYXJzZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghYXR0cnMpIHtcbiAgICAgICAgICBhdHRycyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmICgvXFxzKih7e1xccyooLis/KVxccyp9fSlcXHMqL2dpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgYXR0cnNbbmFtZV0gPSAkaW50ZXJwb2xhdGUodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0dHJzW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgZm9yIChpID0gMCwgaiA9IGNoaWxkTm9kZXMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZE5vZGVzW2ldO1xuICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSBURVhUX05PREUpIHtcbiAgICAgICAgdmFyIHRleHQgPSBjaGlsZC5ub2RlVmFsdWU7XG4gICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgaWYgKC9cXHMqKHt7XFxzKiguKz8pXFxzKn19KVxccyovZ2kudGVzdCh0ZXh0KSkge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaCgkaW50ZXJwb2xhdGUodGV4dCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHJ8XFxzKS9nbSwgJycpO1xuICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2godGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdmFyIHBhcnNlUmVzdWx0ID0gd2FsayhjaGlsZCk7XG4gICAgICBpZiAocGFyc2VSZXN1bHQpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaChwYXJzZVJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIG5vZGUuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB9XG5cbiAgICBpZiAoYXR0cnMpIHtcbiAgICAgIG5vZGUuYXR0cnMgPSBhdHRycztcbiAgICB9XG5cbiAgICBpZiAoZGlycykge1xuICAgICAgbm9kZS5kaXJzID0gZGlycztcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGFyc2U6IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gd2FsayhyZXF1aXJlKCdkb21pZnknKSh0ZW1wbGF0ZSkpO1xuICAgIH1cbiAgfTtcbn1dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlUGFyc2VyO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvcGFyc2VyLmpzXG4gKiogbW9kdWxlIGlkID0gMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogVGVzdHMgZm9yIGJyb3dzZXIgc3VwcG9ydC5cbiAqL1xuXG52YXIgaW5uZXJIVE1MQnVnID0gZmFsc2U7XG52YXIgYnVnVGVzdERpdjtcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIGJ1Z1Rlc3REaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgLy8gU2V0dXBcbiAgYnVnVGVzdERpdi5pbm5lckhUTUwgPSAnICA8bGluay8+PHRhYmxlPjwvdGFibGU+PGEgaHJlZj1cIi9hXCI+YTwvYT48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIvPic7XG4gIC8vIE1ha2Ugc3VyZSB0aGF0IGxpbmsgZWxlbWVudHMgZ2V0IHNlcmlhbGl6ZWQgY29ycmVjdGx5IGJ5IGlubmVySFRNTFxuICAvLyBUaGlzIHJlcXVpcmVzIGEgd3JhcHBlciBlbGVtZW50IGluIElFXG4gIGlubmVySFRNTEJ1ZyA9ICFidWdUZXN0RGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaW5rJykubGVuZ3RoO1xuICBidWdUZXN0RGl2ID0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFdyYXAgbWFwIGZyb20ganF1ZXJ5LlxuICovXG5cbnZhciBtYXAgPSB7XG4gIGxlZ2VuZDogWzEsICc8ZmllbGRzZXQ+JywgJzwvZmllbGRzZXQ+J10sXG4gIHRyOiBbMiwgJzx0YWJsZT48dGJvZHk+JywgJzwvdGJvZHk+PC90YWJsZT4nXSxcbiAgY29sOiBbMiwgJzx0YWJsZT48dGJvZHk+PC90Ym9keT48Y29sZ3JvdXA+JywgJzwvY29sZ3JvdXA+PC90YWJsZT4nXSxcbiAgLy8gZm9yIHNjcmlwdC9saW5rL3N0eWxlIHRhZ3MgdG8gd29yayBpbiBJRTYtOCwgeW91IGhhdmUgdG8gd3JhcFxuICAvLyBpbiBhIGRpdiB3aXRoIGEgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyIGluIGZyb250LCBoYSFcbiAgX2RlZmF1bHQ6IGlubmVySFRNTEJ1ZyA/IFsxLCAnWDxkaXY+JywgJzwvZGl2PiddIDogWzAsICcnLCAnJ11cbn07XG5cbm1hcC50ZCA9XG5tYXAudGggPSBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXTtcblxubWFwLm9wdGlvbiA9XG5tYXAub3B0Z3JvdXAgPSBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXTtcblxubWFwLnRoZWFkID1cbm1hcC50Ym9keSA9XG5tYXAuY29sZ3JvdXAgPVxubWFwLmNhcHRpb24gPVxubWFwLnRmb290ID0gWzEsICc8dGFibGU+JywgJzwvdGFibGU+J107XG5cbm1hcC5wb2x5bGluZSA9XG5tYXAuZWxsaXBzZSA9XG5tYXAucG9seWdvbiA9XG5tYXAuY2lyY2xlID1cbm1hcC50ZXh0ID1cbm1hcC5saW5lID1cbm1hcC5wYXRoID1cbm1hcC5yZWN0ID1cbm1hcC5nID0gWzEsICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCI+JywnPC9zdmc+J107XG5cbi8qKlxuICogUGFyc2UgYGh0bWxgIGFuZCByZXR1cm4gYSBET00gTm9kZSBpbnN0YW5jZSwgd2hpY2ggY291bGQgYmUgYSBUZXh0Tm9kZSxcbiAqIEhUTUwgRE9NIE5vZGUgb2Ygc29tZSBraW5kICg8ZGl2PiBmb3IgZXhhbXBsZSksIG9yIGEgRG9jdW1lbnRGcmFnbWVudFxuICogaW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgY29udGVudHMgb2YgdGhlIGBodG1sYCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWwgLSBIVE1MIHN0cmluZyB0byBcImRvbWlmeVwiXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBkb2MgLSBUaGUgYGRvY3VtZW50YCBpbnN0YW5jZSB0byBjcmVhdGUgdGhlIE5vZGUgZm9yXG4gKiBAcmV0dXJuIHtET01Ob2RlfSB0aGUgVGV4dE5vZGUsIERPTSBOb2RlLCBvciBEb2N1bWVudEZyYWdtZW50IGluc3RhbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShodG1sLCBkb2MpIHtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBodG1sKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdHJpbmcgZXhwZWN0ZWQnKTtcblxuICAvLyBkZWZhdWx0IHRvIHRoZSBnbG9iYWwgYGRvY3VtZW50YCBvYmplY3RcbiAgaWYgKCFkb2MpIGRvYyA9IGRvY3VtZW50O1xuXG4gIC8vIHRhZyBuYW1lXG4gIHZhciBtID0gLzwoW1xcdzpdKykvLmV4ZWMoaHRtbCk7XG4gIGlmICghbSkgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZShodG1sKTtcblxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7IC8vIFJlbW92ZSBsZWFkaW5nL3RyYWlsaW5nIHdoaXRlc3BhY2VcblxuICB2YXIgdGFnID0gbVsxXTtcblxuICAvLyBib2R5IHN1cHBvcnRcbiAgaWYgKHRhZyA9PSAnYm9keScpIHtcbiAgICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xuICAgIGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gIH1cblxuICAvLyB3cmFwIG1hcFxuICB2YXIgd3JhcCA9IG1hcFt0YWddIHx8IG1hcC5fZGVmYXVsdDtcbiAgdmFyIGRlcHRoID0gd3JhcFswXTtcbiAgdmFyIHByZWZpeCA9IHdyYXBbMV07XG4gIHZhciBzdWZmaXggPSB3cmFwWzJdO1xuICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmlubmVySFRNTCA9IHByZWZpeCArIGh0bWwgKyBzdWZmaXg7XG4gIHdoaWxlIChkZXB0aC0tKSBlbCA9IGVsLmxhc3RDaGlsZDtcblxuICAvLyBvbmUgZWxlbWVudFxuICBpZiAoZWwuZmlyc3RDaGlsZCA9PSBlbC5sYXN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCk7XG4gIH1cblxuICAvLyBzZXZlcmFsIGVsZW1lbnRzXG4gIHZhciBmcmFnbWVudCA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHdoaWxlIChlbC5maXJzdENoaWxkKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCkpO1xuICB9XG5cbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vZG9taWZ5L2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRyaW0gPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXltcXHNcXHVGRUZGXSt8W1xcc1xcdUZFRkZdKyQvZywgJycpO1xufTtcblxudmFyIHRlbXBsYXRlQnVpbGRlciA9IFtmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gc2hhbGxvd0Nsb25lKG9iamVjdCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBwcm9wIGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wKSkgcmVzdWx0W3Byb3BdID0gb2JqZWN0W3Byb3BdO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbmV3Q29udGV4dChjb250ZXh0KSB7XG4gICAgdmFyIGVtcHR5ID0gZnVuY3Rpb24oKSB7fTtcbiAgICBlbXB0eS5wcm90b3R5cGUgPSBjb250ZXh0O1xuXG4gICAgcmV0dXJuIG5ldyBlbXB0eSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U3R5bGUob2JqZWN0KSB7XG4gICAgdmFyIGNzc1RleHQgPSAnJztcbiAgICBmb3IgKHZhciBwcm9wIGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBjc3NUZXh0ICs9IHByb3AgKyAnOicgKyBvYmplY3RbcHJvcF0gKyAnOyc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjc3NUZXh0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q2xhc3NlcyhvYmplY3QpIHtcbiAgICB2YXIgY2xhc3NlcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3AgaW4gb2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KHByb3ApICYmICEhb2JqZWN0W3Byb3BdKSB7XG4gICAgICAgIGNsYXNzZXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNsYXNzZXMuam9pbignICcpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvbmVSZXBlYXROb2RlKG5vZGUpIHtcbiAgICB2YXIgY2xvbmVOb2RlID0gc2hhbGxvd0Nsb25lKG5vZGUpO1xuICAgIGNsb25lTm9kZS5kaXJzID0gc2hhbGxvd0Nsb25lKG5vZGUuZGlycyk7XG4gICAgY2xvbmVOb2RlLmRpcnNbJ25nLXJlcGVhdCddID0gbnVsbDtcbiAgICBkZWxldGUgY2xvbmVOb2RlLmRpcnNbJ25nLXJlcGVhdCddO1xuXG4gICAgcmV0dXJuIGNsb25lTm9kZTtcbiAgfVxuXG4gIHZhciBBVFRSX0RJUl9NQVAgPSB7XG4gICAgJ25nLXNyYyc6IHRydWUsXG4gICAgJ25nLWhyZWYnOiB0cnVlLFxuICAgICduZy1hbHQnOiB0cnVlLFxuICAgICduZy10aXRsZSc6IHRydWUsXG4gICAgJ25nLWlkJzogdHJ1ZSxcbiAgICAnbmctZGlzYWJsZWQnOiB0cnVlLFxuICAgICduZy12YWx1ZSc6IHRydWVcbiAgfTtcblxuICB2YXIgSFRNTF9ESVJfTUFQID0ge1xuICAgICduZy1odG1sJzogdHJ1ZSxcbiAgICAnbmctYmluZCc6IHRydWUsXG4gICAgJ25nLXRleHQnOiB0cnVlXG4gIH07XG5cbiAgdmFyIGVtcHR5QXJyYXkgPSBbXTtcblxuICBmdW5jdGlvbiB0b0hUTUwobm9kZSwgY29udGV4dCkge1xuICAgIHZhciBodG1sLCBpLCBqO1xuICAgIGlmIChub2RlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGh0bWwgPSAnJztcblxuICAgICAgZm9yIChpID0gMCwgaiA9IG5vZGUubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgIGh0bWwgKz0gdG9IVE1MKG5vZGVbaV0sIGNvbnRleHQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5vZGUgPT09ICdzdHJpbmcnKSByZXR1cm4gbm9kZTtcbiAgICBpZiAodHlwZW9mIG5vZGUgPT09ICdmdW5jdGlvbicpIHJldHVybiBub2RlKGNvbnRleHQpO1xuXG4gICAgdmFyIHRhZyA9IG5vZGUudGFnTmFtZTtcbiAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgIHZhciBhdHRycyA9IG5vZGUuYXR0cnM7XG4gICAgdmFyIGRpcnMgPSBub2RlLmRpcnM7XG4gICAgdmFyIGNvbnRlbnQgPSBub2RlLnRleHRDb250ZW50O1xuICAgIHZhciBjbGFzc2VzID0gJyc7XG4gICAgdmFyIGNzc1RleHQgPSAnJztcblxuICAgIGlmIChkaXJzICYmIGRpcnNbJ25nLXJlcGVhdCddKSB7XG4gICAgICB2YXIgY2xvbmVOb2RlID0gY2xvbmVSZXBlYXROb2RlKG5vZGUpO1xuICAgICAgdmFyIHJlcGVhdERpciA9IGRpcnNbJ25nLXJlcGVhdCddO1xuICAgICAgdmFyIGFycmF5ID0gcmVwZWF0RGlyLmdldEFycmF5KGNvbnRleHQpIHx8IGVtcHR5QXJyYXk7XG4gICAgICB2YXIgaXRlbU5hbWUgPSByZXBlYXREaXIuaXRlbU5hbWU7XG5cbiAgICAgIGh0bWwgPSAnJztcblxuICAgICAgZm9yIChpID0gMCwgaiA9IGFycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICB2YXIgc3ViQ29udGV4dCA9IG5ld0NvbnRleHQoY29udGV4dCk7XG4gICAgICAgIHN1YkNvbnRleHQuJGluZGV4ID0gaTtcbiAgICAgICAgc3ViQ29udGV4dC4kZmlyc3QgPSBpID09PSAwO1xuICAgICAgICBzdWJDb250ZXh0LiRsYXN0ID0gaSA9PT0gaiAtIDE7XG4gICAgICAgIHN1YkNvbnRleHQuJG1pZGRsZSA9ICEoc3ViQ29udGV4dC4kZmlyc3QgfHwgc3ViQ29udGV4dC4kbGFzdCk7XG4gICAgICAgIHN1YkNvbnRleHRbaXRlbU5hbWVdID0gYXJyYXlbaV07XG5cbiAgICAgICAgaHRtbCArPSB0b0hUTUwoY2xvbmVOb2RlLCBzdWJDb250ZXh0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuXG4gICAgaHRtbCA9ICc8JyArIHRhZztcblxuICAgIGZvciAodmFyIGRpciBpbiBkaXJzKSB7XG4gICAgICBpZiAoZGlycy5oYXNPd25Qcm9wZXJ0eShkaXIpKSB7XG4gICAgICAgIHZhciBmbiA9IGRpcnNbZGlyXTtcbiAgICAgICAgdmFyIHZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdmFsdWUgPSBmbihjb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaXIgPT09ICduZy1pZicpIHtcbiAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKEFUVFJfRElSX01BUFtkaXJdKSB7XG4gICAgICAgICAgaHRtbCArPSAnICcgKyBkaXIuc3Vic3RyKDMpICsgJz1cIicgKyB2YWx1ZSArICdcIic7XG4gICAgICAgIH0gZWxzZSBpZiAoSFRNTF9ESVJfTUFQW2Rpcl0pIHtcbiAgICAgICAgICBjb250ZW50ID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyID09PSAnbmctc3R5bGUnKSB7XG4gICAgICAgICAgY3NzVGV4dCA9IGdldFN0eWxlKHZhbHVlKSArIGNzc1RleHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyID09PSAnbmctY2xhc3MnKSB7XG4gICAgICAgICAgY2xhc3NlcyArPSBnZXRDbGFzc2VzKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChkaXIgPT09ICduZy1zaG93JyB8fCBkaXIgPT09ICduZy1oaWRlJykge1xuICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjbGFzc2VzICs9ICcgJyArIGRpcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBhdHRyIGluIGF0dHJzKSB7XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYXR0cikpIHtcbiAgICAgICAgaWYgKGF0dHIgPT09ICdzdHlsZScpIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBhdHRyVmFsdWUgPSBhdHRyc1thdHRyXTtcbiAgICAgICAgaWYgKHR5cGVvZiBhdHRyVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBhdHRyVmFsdWUgPSBhdHRyVmFsdWUoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHIgPT09ICdjbGFzcycpIHtcbiAgICAgICAgICBjbGFzc2VzICs9ICcgJyArIGF0dHJWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBodG1sICs9ICcgJyArIGF0dHIgKyAnPVwiJyArIGF0dHJWYWx1ZSArICdcIic7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xhc3Nlcykge1xuICAgICAgaHRtbCArPSAnIGNsYXNzPVwiJyArIHRyaW0oY2xhc3NlcykgKyAnXCInO1xuICAgIH1cblxuICAgIGlmIChjc3NUZXh0KSB7XG4gICAgICBodG1sICs9ICcgc3R5bGU9XCInICsgY3NzVGV4dCArICdcIic7XG4gICAgfVxuXG4gICAgaHRtbCArPSAnPic7XG5cbiAgICBpZiAoY29udGVudCkge1xuICAgICAgaHRtbCArPSBjb250ZW50O1xuICAgIH1cblxuICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgZm9yIChpID0gMCwgaiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaHRtbCArPSB0b0hUTUwoY2hpbGQsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGh0bWwgKz0gJzwvJyArIHRhZyArICc+JztcblxuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBidWlsZDogdG9IVE1MXG4gIH07XG59XTtcblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZUJ1aWxkZXI7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9idWlsZGVyLmpzXG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==