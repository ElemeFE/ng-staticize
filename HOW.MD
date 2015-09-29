## 起因
Angular的模板在数据量较大(比如渲染一个2000条数据表格)可能会遇到渲染速度比较慢的问题，[bindonce](https://github.com/Pasvaz/bindonce)提供了一个解决方案，用来解决页面中因为watcher数量较多造成的性能问题。

在IE8下，DOM操作是一个非常昂贵的操作，你可以阅读这个stack overflow上这个[问答](http://stackoverflow.com/questions/9639703/ie8-javascript-very-slow-to-load-large-list-of-options-in-select-element)来了解其中的细节。

简单来讲，在IE8下创建6000个option元素，需要花费16s。这个问题的解决办法就是使用innerHTML来创建option，不使用createElement来创建option。

## 解决办法

ng-staticize做的事情非常简单，自己解析了Angular的模板，并通过解析后的模板构建出要输出的HTML。