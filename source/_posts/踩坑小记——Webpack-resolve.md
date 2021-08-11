---
title: 踩坑小记——Webpack resolve
toc: true
top: false
cover: false
password: false
comment: true
date: 2019-08-19 19:28:35
img: https://s2.ax1x.com/2019/08/23/mDFQjP.png
categories: 前端开发
tags:
  - Webpack
  - 踩坑
summary: Webpack 提示 Module not found 时，尝试在 resolve.modules 里添加 import xxx from './xxx' 中 ./xxx 的路径。
---

前段时间，学习了 [Webpack](https://webpack.js.org/)、[EJS](https://ejs.co/)、[Babel](https://babeljs.io/) 等工具，在学习 [React](https://reactjs.org/) 及其全家桶时，开始着手开发一些项目，以此巩固和提高。遂在之前一个已有项目的基础上，建立项目文件夹，项目结构如下：

```
repo
├── todo-list
│  ├── webpack.config.js
│  ├── screenshots
│  ├── server
│  ├── dist
│  └── src
│     ├── components
│     ├── index.html
│     ├── index.jsx
│     ├── layout
│     └── style
├── package.json
├── node_modules
└── README.md
```

其中，`repo` 为 Git 文件夹，除了 `todo-list` 这个文件夹以外还有其他项目文件夹，各个项目共用一个 `node_modules`~~，以节省空间~~

Webpack 入口（Entry）在 `index.jsx`，一般情况下，引用 `components` 文件夹下的 `container` 组件，代码应为：
```js
import Container from './layout/container'
```

`webpack.config.js` 配置如下：
```js
const ENTRY = path.join(__dirname, 'src')
const OUTPUT = path.join(__dirname, 'dist')

module.exports = {
    entry: path.join(ENTRY, 'index.jsx'),
    output: {
        path: OUTPUT,
        filename: 'index.bundle.js',
    }
    // ...
}
```

构建运行，结果却是：

![](https://s2.ax1x.com/2019/08/19/m3hly6.png)

提示无法解析 `./layout/container`，猜测可能是相对于 Webpack 配置文件的路径，考虑到项目可能会扩大，因此添加 alias，并且修改 import 语句，

```js
const ENTRY = path.join(__dirname, 'src')
const OUTPUT = path.join(__dirname, 'dist')

module.exports = {
    entry: path.join(ENTRY, 'index.jsx'),
    output: {
        path: OUTPUT,
        filename: 'index.bundle.js',
    },
    resolve: {
		alias: {
			"src": ENTRY
		}
    }
    // ...
}
```

~~此处的 `"src": ENTRY` 似乎多此一举，但当时配置文件在 `repo` 文件夹，因此还有一个 `todo-list` 文件夹，路径更长~~

依旧报错……去掉 alias，还是报错，*How old are you？* 最后把组件和入口文件全部放在一起，还是报错……

意识到这应该不是路径的问题，可能是 Webpack 配置不对，再去翻文档，[`resolve.alias`](https://webpack.docschina.org/configuration/resolve/#resolve-alias)，按照文档的意思，alias 配置没有问题，再去 [知乎](https://www.zhihu.com/)、[Bing](https://www.bing.com/) 搜索 alias 的用法，虽然大家写法不一，但总体和我是差不多的，但是 Webpack 似乎没有用上 alias 这一功能~~，虽然也看不出来，都是无法解析~~

最后搜索 `Module not found`，终于找到了些眉目：[Module not found: Error: Can't resolve 'react' in · 简书](https://www.jianshu.com/p/f5d1d73fe414)，在这里，居然发现有 `resolve.modules` 这一项，山穷水复的情况下，拿来直接用，居然成功打包！！！

---

文档如下：
> resolve.modules
> `[string]: ['node_modules']`
> 告诉 webpack 解析模块时应该搜索的目录。
> ……
> 如果你想要添加一个目录到模块搜索目录，此目录优先于 node_modules/ 搜索

该选项给出解析时的路径，默认是 `node_modules`，查找是会先从最近的 `node_modules` 目录里找，找不到则往上层找~~，因此，我之前共用一个包文件夹的设想是成功的~~

**可添加自定义的模块**，路径应写在 `'node_modules'` 之前

---

因此，在这里，应配置为：
```js
const ENTRY = path.join(__dirname, 'src')
const OUTPUT = path.join(__dirname, 'dist')

module.exports = {
    entry: path.join(ENTRY, 'index.jsx'),
    output: {
        path: OUTPUT,
        filename: 'index.bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [ENTRY, 'node_modules']
    }
	// ...
}
```

至于 alias 和 `index.js` 中的 import 语句，爱咋样咋样，保持原样即可
