# Introduce

ng-staticize 是一个把 Angular 模板静态化的一个 directive，适用在一些性能敏感的场景。在 Angular 模板静态化之后，Angular 的 watcher 数量会显著降低，渲染速度(在数据量较大的情况下)在 IE8 上会有10-20x的性能提升。

你可以花几分钟查看 [这个例子](http://elemefe.github.io/ng-staticize/) 来体验一下 ng-staticize 带来的性能提升，在 IE8 或者 Firefox 下会看到更明显的性能提升。

从降低 Angular watcher 的角度来看，ng-staticize 是一个与 [bindonce](https://github.com/Pasvaz/bindonce) 类似的项目，区别在于 ng-staticize 无需改变模板中 directive 的定义。

从设计之初，ng-staticize 就存在以下缺陷，请知悉：

1. 应用 ng-staticize 的区域中不能使用 directive 兼容列表以外的 directive。
2. 渲染出的 DOM 不再动态，即在 Controller 中的数据变更后，应用了 ng-staticize 的区域不会重新渲染。不过你可以为 ng-staticize 指定一个表达式，在表达式变更后这个区域会重新渲染。

以下是 ng-staticize 适用场景：

1. 页面动态渲染比较少，类似于静态页面，只是使用了 Angular 的模板来描述数据绑定。
2. 页面中需要渲染的数据较多，需要做性能优化。

如果你对 ng-staticize 的实现细节感兴趣，你可以阅读 [这篇文档](HOW.MD)。

# Usage

## Install

如果你使用 Browerify 或者 Webpack，可以使用 npm 来安装 ng-staticize:

```Bash
npm install ng-staticize —save
```

如果没有使用 npm，则可以下载项目后，在项目中引用 dist 下的 ng-staticize.js。

## Include ngStaticize

```JavaScript
angular.module('demo', [ 'ngStaticize' ]);
```

## Use

如果只是想把页面中的某一个页面中的某个区域进行静态化操作，只需要为这个区域的元素添加一个属性：ng-staticize。

```HTML
<div ng-staticize>...</div>
```

如果需要在某些数据变更之后重新渲染这块区域，为 ng-staticize 属性设置一个表达式，在该表达式变更之后这个区域会重新渲染。比如在 scope 中的 todos 属性发生了变化之后重新渲染，则这么定义：

```HTML
<div ng-staticize="todos">...</div>
```

> 如果需要兼容低版本浏 IE 览器(IE8、IE9)，请不要在 table、tbody、tfoot、thead、title、tr 等元素上使用 ng-staticize，原因见 [此文章](http://w3help.org/zh-cn/causes/BX9046)。

# Compatible Directive
ng-staticize 只兼容了一些常见的 directive，列表如下：

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
如果你想修改 ng-staticize 的代码，在项目文件夹下执行这两个命令：

```Bash
npm install
npm run dev
```

# License
MIT
