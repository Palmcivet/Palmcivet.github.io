---
title: 踩坑小记——CSS Table 布局
toc: true
top: false
cover: false
password: false
comment: true
date: 2021-08-09 17:23:18
img: https://i.loli.net/2021/08/10/N32Qa7mCX8vGzFo.png
categories: 前端开发
tags:
  - JavaScript
  - CSS
  - 踩坑
summary: table 标签指定了 height 样式之后，假如总高度不足表格高度，每一行将会等分这个值。
---

## TL;DR

> `<table>` 标签指定了 `height` 样式之后，假如总高度不足表格高度，每一行将会等分这个值。

## 前言

最近开发过程中使用了一个表格组件，该组件使用 `<table>` 标签实现，主要用于大量数据的展示，因此自然需要指定高度并且支持滚动。

样式调整妥当后，试着给了两行数据，发现严重跑版，如下图：

![#b# 只出现两行数据时渲染出现问题](https://i.loli.net/2021/08/10/1fRmBbTos2pH8MQ.png)

预期第一列为复选框，支持选中当前行，第二列为展示的数据。检查细节如下（信息已脱敏）：

![#b# 第一列呈现居中](https://i.loli.net/2021/08/10/Lj4qXAJ71irNP9f.png)

![#b# 第二列却未居中](https://i.loli.net/2021/08/10/kQyb2VaqgUBOuos.png)

## 抛砖引玉
### 云山雾罩

尝试了多行数据，发现情况类似，都是等分了高度。总结一下，主要存在以下两个问题：

1. 指定表格高度，固定为 266，行高 38，即 $266 = 38 \times 7$，呈现 7 行，只有两行时却等分了表格高度；
2. 两列的 class 都相同，理应呈现相同的样式，为何第二列没有等分；

首先猜测 `<table>` 有等分行高的 CSS 属性，使用某个属性可以关闭，搜了半天没有结果。打算从以下几个方面入手：

- `<table>` 有特定 HTML 属性可以控制该效果（表格布局有一系列元素，但平常使用不多），找到该属性
- 某个层级的隐藏 CSS 属性触发了该效果，找到该属性
- 尝试其他布局方式 ~~（`display` 一个一个试）~~
- 重写表格渲染的逻辑，使用 `<div>` 一把梭

### 峰回路转

经过一系列挣扎，突然发现取消 `<table>` 的 `height` 属性即可恢复 😅。开发的问题是解决了，可是为什么会这样呢？

1. 什么原理导致加了 `height` 属性就会产生这种效果？
2. 为什么只等分了第一列？

最初的猜测其实是较为合理的：

1. 等分表格的总高度在某些场景下可美化布局
2. 第一列的表格语义上一般作为编号，居中更合理，其余行的样式由用户定义

但奇怪的是这种特性在搜索结果中，没有反映出来（可能是我关键词不对），~~况且浪费了将近一天时间，不能就这样草草结束~~，所以非得找个说法才行。

### 柳暗花明

首先能想到比较权威的文档就是 [MDN](https://developer.mozilla.org/) 了。找遍了 HTML `<table>` 和 CSS table 模块，没有相关描述。突然想到有个 《CSS 权威指南》（下称 《指南》），也许会有记录，果不出所料：

![#b# 《CSS 权威指南（第三版）》对表格高度的描述](https://i.loli.net/2021/08/10/STHd1trDZepb7nA.png)

如上图，用户代理（User-Agent）在这里起了不可替代的作用，于是写了一个 demo（见 [示例代码](#示例代码)），尝试了 Firefox、Safari、Chrome 和 Edge 下的表现，效果相同。

《指南》听名字就很权威，但我还是不够满足，在  [xileng](https://github.com/Xiaoleng123) 的指导下，想起来还有 [W3C](https://www.w3.org/) 的存在，这里应该能找到我要的标准和规范了。

在海量的文献里，最终定位到了问题：

![#b# CSS 3 草案关于 table height 的描述](https://i.loli.net/2021/08/10/EORTDMLZWavSpKd.png)

如上图（原文 [在此](https://www.w3.org/TR/2019/WD-css-tables-3-20190727/#height-distribution)），印证了《指南》中的描述。

## 表格元素

HTML 中关于表格有一系列元素，参见 [表格标签 - 网道](https://wangdoc.com/html/table.html)。

- 定义大纲
    - `<table>`：**块级** 容器元素，承载所有内容
    - `<caption>`：可选。是 `<table>` 标签第一个子元素，表示表格的标题
- 定义结构：有以下元素，都是块级容器元素，且都是 `<table>` 的一级子元素
    - `<thead>`：表头
    - `<tbody>`：表体。可使用多个 `<tbody>`，表示连续的多个部分
    - `<tfoot>`：表尾
- 定义行列
    - `<colgroup>`：`<table>` 的一级子元素，定义行
    - `<col>`：`<colgroup>` 的一级子元素，定义列。单独使用，没有结束标签，且 不含子元素

    ```html
    <table>
      <colgroup>
        <col class="c1">
        <col class="c2">
        <col class="c3">
      </colgroup>
      <tr>
        <td>1</td>
        <td>2</td>
        <td>3</td>
      </tr>
    </table>
    ```

    为每一列指定 class
- 表示行列
    - `<tr>`：表格的一行
    - `<th>`：标题单元格
    - `<td>`：数据单元格

    ```html
    <table>
      <tr>
        <th>学号</th><th>姓名</th>
      </tr>
      <tr>
        <td>001</td><td>张三</td>
      </tr>
      <tr>
        <td>002</td><td>李四</td>
      </tr>
    </table>
    ```

## 表格样式

![#b# 表格的用户代理样式](https://i.loli.net/2021/08/10/H9KhstuyMorWj1D.png)

观察一下默认样式，有以下几个不熟悉：

- `border-collapse`：决定表格的边框是分开还是合并
    - `collapse`：共用边框
    - `separate`：每个单元格独立边框
- `border-spacing`：指定相邻单元格之间的距离，因此只适用于 `border-collapse: separate;`
	- 相当于 HTML 的 `cellspacing` 属性
	- 可分别指定水平和垂直：`border-spacing: 1px 2px;`

## `display` 布局

至此，第一个 [问题](#云山雾罩) 解决了，但第二个问题还没见到原因。说来奇怪，调试的时候突然发现第二列写了 flex 布局，该属性来自组件库，取消后就居中了 😅。那么问题又来了：为什么 flex 可以不按上述规定？

其实很好笼统地解释：布局使然，`table`、`flex`、`inline-table` 效果不尽相同，之前尝试 `inline` 以及 `inline-block` 可以绕道解决问题，所以才产生重写布局的想法，然而 CSS 基础太差了，这些布局一知半解。借此机会整理一下。

### 全局属性值

- `inherit`：从父元素继承属性的值
- `initial`：恢复元素属性的默认值（默认值由 CSS 规范定义，而非用户代理）
- `unset`：
    - 如果父类有值，则从父类继承，类似 `inherit`
    - 否则，设为初始值，类似 `initial`
- `revert`：类似 `unset` *CSS Cascading 3*
    - 恢复到用户代理或用户创建的自定义样式表设置的值

### 上下文

- `none`：元素将从文档流中移除，不会显示
- `block`：块级元素
    - 独占一行，后面的元素新起一行，默认填满父元素宽度
    - 高度一般以子元素撑开的高度为准
    - 可设置 `width`/`height`，`margin` 和 `padding`
- `inline`：内联元素
    - 在同一行，直到排满换行
    - `width`/`height` 无效
    - `margin` 和 `padding` 有效，但 `-top`、`-bottom` 无效
- `inline-block`：结合 `block` 和 `inline`
    - 在同一行内，但内容有块级元素的效果
    - `width`、`height`、`margin`、`padding` 都有效
- `list-item`：将元素作为列表显示，借助 `list-style-position`、`list-style-type` 可模拟 `<li>` 效果
- `flex`：具体布局技术不说了，规范见 [CSS Flexbox 1](https://www.w3.org/TR/css-flexbox-1)
    > 在本文中，第二列指定了高度，并且设置了 flex，遵循 [规定](https://www.w3.org/TR/css-flexbox-1/#box-model)，flexbox 取指定的值
- `inline-flex`：没有指定宽度时，`flex` 会填充父容器，`inline-flex` 不会

### 表格相关

- `table`：作为块级表格来显示（类似 `<table>`）
- `inline-table`：会作为内联表格来显示（类似 `<table>`）
- `table-row`：会作为一个表格行显示（类似 `<tr>`）
- `table-cell`：会作为一个表格单元格显示（类似 `<td>` 和 `<th>`）

## 推荐阅读

- [W3C Standards and Drafts](https://www.w3.org/TR/)
- [HTML Standard](https://html.spec.whatwg.org/)。本文细节出自 [CSS table 3](https://www.w3.org/TR/2019/WD-css-tables-3-20190727/)

## 附录：示例代码

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table Height demo</title>
  </head>
  <body>
    <div class="wrapper">
      <table>
        <colgroup>
          <col />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td>1</td>
            <td><span>title</span></td>
          </tr>
          <tr>
            <td>2</td>
            <td><span>content-1</span></td>
          </tr>
          <tr>
            <td>3</td>
            <td><span>content-3</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
  <style>
    table {
      height: 226px;
    }

    tr {
      cursor: pointer;
    }

    tr:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    td {
      height: 38px;
    }
  </style>
</html>
```
