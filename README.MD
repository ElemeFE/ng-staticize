# Introduce

ng-staticize是一个把Angular模板静态化的一个directive，适用在一些性能敏感的场景。在Angular模板静态化之后，Angular的watcher数量会显著降低，渲染速度(在数据量较大的情况下)在IE8上会有10-20x的性能提升。

从降低Angular watcher的角度来看，ng-staticize是一个与[bindonce](https://github.com/Pasvaz/bindonce)类似的项目，区别在于ng-staticize无需改变模板中directive的定义。

你可以花几分钟查看[这个例子](http://elemefe.github.io/ng-staticize/)来看一下ng-staticize带来的性能提升，在IE8或者Firefox下测试会看到更明显的效果。

从设计之初，ng-staticize就存在以下缺陷，请知悉：

1. 模板中不能使用directive兼容列表以外的directive。
2. 渲染出的DOM不再动态，即在Controller中的数据变更后，应用了ng-staticize的区域不会重新渲染。不过你可以为ng-staticize指定一个表达式，在表达式变更后ng-staticize会重新渲染。

以下是ng-staticize适用场景：

1. 页面动态渲染比较少，类似于静态页面，只是使用了Angular的模板来描述数据绑定。
2. 页面中需要渲染的数据较多，需要做性能优化。

如果你对ng-staticize的实现细节感兴趣，你可以阅读[这篇文档](HOW.MD)。

# Usage

## Install

如果你使用browerify或者web pack，可以使用npm来安装ng-staticize:

```Bash
npm install ng-staticize —save
```

如果没有使用npm，则可以下载项目后，在项目中引用dist下的ng-staticize.js。

## Include ngStaticize

```JavaScript
angular.module('demo', [ 'ngStaticize' ]);
```

## Use

如果只是想把页面中的某一个页面中的某个区域进行静态化操作，只需要为这个区域的元素添加一个属性：ng-staticize。

```HTML
<div ng-staticize>...</div>
```

如果需要在某些数据变更之后重新渲染这块区域，为ng-staticize属性赋值，该值是一个表达式，在该表达式变更之后这个区域会重新渲染。比如在scope中的todos属性发生了变化之后重新渲染，则这么定义：

```HTML
<div ng-staticize="todos">...</div>
```

> 如果需要兼容低版本浏IE览器(IE8、IE9)，请不要在table、tbody、tfoot、thead、title、tr等元素上使用ng-staticize，原因见[此文章](http://w3help.org/zh-cn/causes/BX9046)。

# Compatible Directive
ng-staticize只兼容了一些常见的Directive，列表如下：

- ng-if
- ng-repeat
- ng-style
- ng-class
- ng-show
- ng-hide
- ng-html
- ng-bind
- ng-text
- ng-src
- ng-href
- ng-alt
- ng-title
- ng-id
- ng-disabled
- ng-value

# Fork
如果你想修改ng-staticize的代码，在项目文件夹下执行这两个命令：

```Bash
npm install
npm run dev
```

# License
MIT
