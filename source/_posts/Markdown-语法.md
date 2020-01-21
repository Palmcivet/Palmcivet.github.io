---
title: Markdown 语法
toc: true
top: false
cover: false
password: false
comment: true
date: 2019-4-28 12:48:00
img: https://s2.ax1x.com/2020/01/18/1pqQT1.png
categories: Geek
tags:
  - Markdown
  - 参考
summary: Markdown 是一种轻量级的标记语言，是一种纯文本格式，类似于 HTML，且兼容 HTML 标签。本文记录 Markdown 的标准语法和扩展语法以备参考。
---

## 概述
本文不是 Markdown 入门教程，而是收录各种 Markdown 编辑器的语法及快捷键，方便查询和扩展

目前整理收录了以下语法：
- GitHub
- 有道云笔记
- VSCode 的 Markdown Preview Enhanced
- VSCode 的 Markdown All in One

## 常用语法
### 标题
1. 使用 N 个 `#` 表示 N 级标题，填上空格，可闭合
2. 类 Setext：`=` 最高阶标题；`-` 第二阶标题

### 斜体
内容两端使用 `*`，且不加空格，即 HTML 中的 `<em>`
`*内容*` --> *内容*

### 粗体
内容两端使用 `*`，且不加空格，即 HTML 中的 `<strong>`
`**文字` --> **文字**

### 删除线
内容两端使用 `~~`，且不加空格
`~~Word~~` --> ~~Word~~

### 分割线
- 使用三个及以上的 `*`/`-`/`_`

---

## 列表
### 无序列表
- 使用 `*`/`+`/`-`，符号和内容空一格 ` `

### 有序列表
- 数字加点`.`，空一格 ` `再填写内容，可嵌套 Markdown 语法

```markdown
1. A
    1. a
    2. b
    - c
2. B
```
显示如下：
1. A
    1. a
    2. b
    - b
2. B

## 引用
- 使用 `>` 表示说明的文本
- 可多层嵌套 Markdown 语法

```markdown
> This is quote
> > This is *quote* in quote
```
显示如下：
> This is quote

> > This is *quote* in quote

### 嵌套缩进
[列表](#列表)与[引用](#引用)的嵌套语法相同
- 列表多段落用 1~3 空格 ` ` 或 1 Tab
- 列表内引用 `>` 缩进 1 次
- 列表内引用代码缩进 2 次

## 链接
### 行内式
- `[]` 内注明显示的文本
- `()` 内填写 URI，可以是本文档的内容
- `" "` 内填写鼠标悬停时的说明，需与链接空一格

代码
```markdown
This is [Bing](http://www.bing.com/ "Bing")
```
显示为：
This is [Bing](http://www.bing.com/ "Bing")

### 参考式
- 在文件的 **任意** 处，定义标记的链接内容
- 用 ID 作为索引，可以是数字、文本符号
- ` `（title）可放到下一行，也可以缩进

This is [Bing][ID]

[ID]: http://www.bing.com/
"Bing"

### 目录
1. 在文章前填写 `[TOC]`
2. 使用 [列表](列表) 加 [链接](#链接) 的形式
3. MPE：在任意位置插入 `<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=3 orderedList=false} -->`

### 注脚
- 使用 `[^ID]` 表示注脚

```markdown
1. 一个注脚[^footnote]的样例
2. 第二个注脚[^footnote2]的样例
```
显示为：
1. 一个注脚[^footnote]的样例
2. 第二个注脚[^footnote2]的样例

## 图像
### URI
```markdown
![描述](URI "悬停时的注释")
```
- `描述` 为网络出错时的文字叙述
- URI 之后空一格，填写鼠标悬停时的注释
- `URI` 可以为网络资源，也可以是本地图片

### *base64*
```markdown
<img src="data:img/扩展名;base64,base64编码" />
```
因 *Base64* 较长，故可用[参考式](#参考式)的方式将 *Base64* 字符串置于文章末尾

### `<img>` 标签
Markdown 兼容 *HTML* 标记语言，可使用 *HTML* 的 `div` 标签
- 大小
    ```html
    <img width = "300" height = "200" alt="图片名称" align=center />
    ```
- 居中
    ```css
    <div  align="center">
    ...
    </div>
    ```

## 代码块
1. 行内代码块：\`
2. 非代码：\`\`\`
3. 代码块：
    1. 4 空格 或 1 Tab 缩进
    2. 1 对 \`\`\` 跨行引用

### 扩展语法
1. 语法高亮：在代码块前的 \`\`\` 行注明
2. 行号显示:`{class:"line-numbers"}`

## 表格
基于 HTML，可以用相关 `<table>` 标签创建多种样式
- 用 `|`、`-`标记表格
- 栏与栏间用 `|`
- 标题行与数据行用 `-` 分隔

### Markdown
```Markdown
| 项目   | 价格   | 数量 |
| ----- | ------ | ---- |
| 手机   | \$12   | 12   |
| 管线   | \$1    | 234  |
```
显示为：
| 项目   | 价格   | 数量 |
| ----- | ------ | ---- |
| 手机   | \$12   | 12   |
| 管线   | \$1    | 234  |

### HTML
```html
<table>
    <tr>
        <th>项目</th>
        <th>价格</th>
        <th>星期</th>
    </tr>
    <tr>
        <td>计算机</td>
        <td>$1600</td>
        <td>5</td>
    </tr>
</table>
```
显示为：
<table>
    <tr>
        <th>项目</th>
        <th>价格</th>
        <th>星期</th>
    </tr>
    <tr>
        <td>计算机</td>
        <td>$1600</td>
        <td>5</td>
    </tr>
    <tr>
        <td>移动硬盘</td>
        <td>$80</td>
        <td>50</td>
    </tr>
</table>

## Todo 列表
- `[ ]`（未完成）或 `[x]`（已完成）
- 支持子列表嵌套 Markdown 语法

```markdown
- [ ] **Markdown 开发**
    - [ ] 支持以 PDF 格式导出文稿
    - [x] 新增 Todo 列表功能
    - [x] 改进 LaTex 功能
        - [x] 修复 LaTex 公式渲染问题
        - [x] 新增 LaTex 公式编号功能
- [ ] **七月旅行准备**
    - [ ] 准备邮轮上需要携带的物品
    - [x] 购买七月一日的船票
```
显示如下：
- [ ] **Markdown 开发**
    - [ ] 支持以 PDF 格式导出文稿
    - [x] 新增 Todo 列表功能
    - [x] 改进 LaTex 功能
        - [x] 修复 LaTex 公式渲染问题
        - [x] 新增 LaTex 公式编号功能
- [ ] **七月旅行准备**
    - [ ] 准备邮轮上需要携带的物品
    - [x] 购买七月一日的船票

### 转义
- 使用反斜线 `/`，以下内容可能需转义：
    1. \\：反斜线
    2. \`：反引号
    3. \*：星号
    4. \_：底线
    5. \{\}：花括号
    6. \[\]：方括号
    7. \(\)：括弧
    8. \#：井字号
    9. \+：加号
    10. \-：减号
    11. \.：英文句点
    12. \!：惊叹号

- `<`：`&lt;`
- `&`：`&amp;`
- &copy;：`&copy;`

### 首行缩进
- 半方大的空白`&ensp;`或`&#8194`
- 全方大的空白`&emsp;`或`&#8195`
- 不断行的空白格`&nbsp;`或`&#160`

## 扩展语法
*Visual Studio Code* 插件 Markdown Preview Enhanced
1. 目录：
    1. 在任意位置插入 `<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=3 orderedList=false} -->`
    2. 代码
        ```markdown
        ---
        toc:
            depth_from:2
            depth_to:4
            ordered:false
        ---
        ```
2. 批注：
    1. ==高亮：== `== ==`
    2. 注释：{>>注释<<}
    3. 下划线：{++下划线内容++}
3. 表格
    - `^` 向上合并单元格，`>` 向右合并单元格
4. 在文档里运行代码
5. 导入文件：`@import "file"`

[^footnote]: 这是一个 *注脚* 的 **文本**。
[^footnote2]: 这是另一个 *注脚* 的 **文本**。