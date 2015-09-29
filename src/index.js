var parser = require('./parser');
var builder = require('./builder');

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