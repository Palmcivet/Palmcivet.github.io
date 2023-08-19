---
title: GitHub 与 SPA 部署
toc: true
top: false
cover: false
mathjax: false
reprintPolicy: cc_by
date: 2020-02-03 19:34:16
coverImg:
img: https://s2.ax1x.com/2020/02/04/1DDiEF.png
categories:
  - 运维
tags:
  - GitHub
  - React
summary: 最近部署 SPA 时遇到了一些问题，即刷新页面会返回 404，设置服务器的 404 页面可以解决。基于静态页面托管的原理，可以将 SPA 发布在 GitHub Pages 上，并借助 Actions 实现持续部署（CD）。
---

## 前言

最近在写一个 [单页面应用](https://en.wikipedia.org/wiki/Single-page_application "Wiki")，用来练习 [Redux](https://redux.js.org/ "主页")，其中用到了 [React Router](https://reacttraining.com/react-router/ "主页") 库，~~实际开发过程中，Redux 用的挺顺手，Router 反而不会用了。~~ 采用前后端分离的方式。本地调试一直都是起一个 devServer，写完了登录页，扔给后端同学测一下，却反馈说双击打开一片空白。

确实，我之前使用 Router 库，预览的时候也是不能直接打开，因为路径问题，我默认 `/` 为主页，因此 `file:///xxx/index.html` 这个 URL 显然不匹配，而 `index.html` 文件是有效的，只是 JS 处理路由的代码没执行而已，因此使用服务器，默认访问 `/` 就是 `index.html`，就忽略了 URL 差异。

## `file:///`

先来看一下 file，在电脑上双击 HTML 文件，可以在浏览器打开，访问其页面，有很多应用如 [QRazyBox](https://merricx.github.io/qrazybox/ "主页") 就是这样做到离线使用。

其实这是一个协议，就如同 HTTP 协议：

```
protocol :// hostname[:port] / path / [;parameters][?query]#fragment
```

而需注意，*file* 是三条 `/`，Google Chrome 默认不显示协议名称，将地址栏的内容复制出来则会自动加上。为什么是三条 `/` 呢，这要看 [URI](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier "Wiki") 的定义：

```
scheme : [//[user:password@] host [:port]] [/] path [?query] [#fragment]
```

以 `https://www.zhihu.com/question/37063799` 为例，`www.zhihu.com` 是 *host*（主机名）， 后面的属于 `path`，而如果是本地文件，*host* 部分就不需要了，所以合起来就变成了 `///`，但根据 `[]`，其实两个 `//` 都应该省略的。

再看 *file* 协议，它是用于访问本地计算机中的文件，就如同在 Windows 资源管理器中打开文件一样，注意它是针对本地（本机）的，简单说，file 协议是访问本机的文件资源。

```
file:///C:/Users/Admin/file.avi
```

就相当于

```
C:/Users/Admin/file.avi
```

访问本地 HTML，其实是在本地起了一台 HTTP 服务器，然后访问电脑上的本地服务器，HTTP 服务器再去访问本机的文件资源。
曾经虚拟机玩的不熟，增强工具总是安装失败，就考虑通过网络来共享文件，在 Ubuntu 里成功部署过 SMB 服务器，然后通过 Windows 下的资源管理器访问，在地址栏输入 `\\192.168.1.1` 访问，就可以像在本机一样操作 ~~远程~~ 主机，如同局域网共享（实际上本来就是，Windows 支持很多共享协议）。

在浏览器的地址栏输入 `file:///` 就可以看到本机的文件（目录）了，有点类似 FTP 站点。

![#b# 访问本地文件](https://s2.ax1x.com/2020/02/04/1DQHTf.png)

再回到 *file* 协议打开 HTML 的问题，访问 `index.html`，会引入该文件需要的静态文件，而如果脚本文件又引入（`import`）了其他文件，在这里则是无效的，我们可以做个实验：

```js
export const test = (a, b) => a + b;
```

写上述脚本命名为 `test.js`

```js
import { test } from "./test";

console.log(test(3, 4));
```

再在以上代码内引用，保存并命名为 `main.js`，通过 `<script>` 插入到一份 HTML 文件，访问就可以得到一个 Error：

![#b# 加载失败](https://s2.ax1x.com/2020/02/04/1DQ4ld.png)

~~Chrome 显然已经支持了很多 ES6 语法。~~ 加载 `test.js` 需要服务器解析并返回，所以开发者工具的 Source 以及 Network 会有一堆文件（当然，ES6 以及 JS 模块的原理还是很深奥，这里不深入了），*file* 协议这里仅是静态的访问，就跟资源管理器（或 Finder）里打开一样，无法参与解析。当然，不引用外部文件，或者直接在 HTML 文件里，JS 脚本是可以执行的。

![#b# 直接执行](https://s2.ax1x.com/2020/02/04/1DQ56A.png)

那么既然了解了直接打开文件的原理，又该如何处理前言这个问题呢？理论上，直接浏览器打开文件是可行的，毕竟 React 只有一个 HTML 和一个 JS（当然也可以有多个），我没用 Router 库之前也是直接打开的，~~对，用了之后就不行了。~~ 在我没有意识到我可以修改路由之前，我进行了一些 ~~搜索~~ 尝试。

## SPA
众所周知，SPA 这个概念是比较新的，在大前端时代，新概念、新技术层出不穷，SPA、MPA、PWA、SSR、Hybrid、Native，~~这几个名词并不具有一定的关系~~ 可以引出宽广的技术栈。

SPA 就是单页面应用，只有一个 HTML 页面，原理类似点击一个按钮通过 JS 的 DOM 操作创建一个节点然后显示出来，但可以更改地址栏的 URL，然后 JS 通过 URL（History）的变化渲染对应组件，不同于动态网站，浏览器 URL 怎么变都跟服务器无关（实际上这就是静态网页）。

是吗？似乎不全是，React Router 切换路径不会发送请求，还是当前的 HTML（以及 JS）处理这个 URL（即 *前端路由*），但是一刷新，或者不是访问 `/`（或者 `index.html`），而是访问 `/home`（假如网页有该路径），实际上这两者是一个效果，都是向服务器请求 `/home`，但前面提到，URL 变化跟服务器无关，服务器哪认得这个 URL，~~我静态网页只托管 `index.html`，其他的没有~~，一个 404 打发回去，这与通常的动态网页不同，后端是不匹配（实际上是没有）路由的。

## SPA 部署

所以，问题很明显了，SPA 需要专门的部署方式。后端采用 Tomcat，带入关键词一搜，果然圈内普遍存在这种部署问题。前端路由的问题，React Router 和 Vue Router 都会遇到，解决方案很简单，使用 Node.js 服务器即可（逃

这并不能解决问题，我调试用的就是基于 Express 的 devServer，刷新或者热更新就找不到了（~~`historyApiFallback` 无效，因为有一个基地址~~），需要手动更改 URL。搜索结果更多的是使用 **重定向** 来解决，将后端未知的 URL 请求重定向回去（即还是交给 `index.html` 处理），就可以了。

### Nginx

Nginx 作为高性能服务器，静态资源托管的大哥，转发流量是不在话下，`server` 块只需要加一句处理 fallback。

```nginx
server {
    listen 80;
    server_name  www.example.com;
    root /mnt/html/spa;
    index index.html;
    location ~ ^/favicon\.ico$ {
        root /mnt/html/spa;
    }

    location / {
        try_files $uri $uri/ @fallback;
        index index.html;
        proxy_set_header   Host             $host;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto  $scheme;
    }
    location @fallback {
        rewrite ^.*$ /index.html break;
    }
    access_log  /mnt/logs/nginx/access.log  main;
}
```

### Tomcat

后端主 Java 技术栈，使用 Tomcat 部署。对于汤姆猫，需要在 `web.xml` 文件设置 404 页面。

```xml
<error-page>
    <error-code>404</error-code>
    <location>/spa/index.html</location>
</error-page>
```

### Apache

Apache httpd 是修改 `httpd.conf`。

1. 打开 `mod_rewrite.so` 模块，取消注释
	```ini
	LoadModule rewrite_module modules/mod_rewrite.so
	```
2. 修改 `AllowOverride` 选项，将 `None` 改为 `All`
	```ini
	AllowOverride All
	```
3. 建立 `.htacess` 文件放入网站文件夹（也可以在 `httpd-vhosts.conf` 文件中设置）
	```xml
	<IfModule mod_rewrite.c>
		RewriteEngine On
		RewriteBase /
		RewriteRule ^index\.html$ - [L]
		RewriteCond %{REQUEST_FILENAME} !-f
		RewriteCond %{REQUEST_FILENAME} !-d
		RewriteRule . /index.html [L]
	</IfModule>
	```

## GitHub Pages
### 静态网页

倒腾了很久，后来意识到我可以修改路由，不必让首页匹配 `/`，就是说，~~是我编码问题，跟 SPA 关系不大。~~ 使其跟普通页面一样，一进入就有内容，这样首先能解决点击空白的问题，再搭配服务器重定向的策略，就能解决刷新返回 404 的问题，如此，即可实现正常访问了。

很好，但是我每一个逻辑页面都有在判断路由，这样一改，首页就没法判断了，这时候，就用到了 ~~（学到了）~~ React Router 一个组件，[`<withRouter />`](https://reacttraining.com/react-router/web/api/withRouter "文档") 高阶组件，把 `location`、`history`、`match` 等路由组件才有的信息注入普通组件，这样，首页就也能判断路由了。完美解决问题。

于是，我的 SPA 跟普通静态网页彻底一致了，既然是静态页面，就可以托管在 **GitHub Pages** 上，如此一来，可以实现真正的前后端分离，不必配置汤姆猫了。~~（但会带来跨域问题。）~~

### 静态网站生成器

我们都知道，Github 提供了 [GitHub Pages](https://help.github.com/en/github/working-with-github-pages "文档") 服务，用于项目展示，Geek 们利用这个特性可以制作个人主页、搭建博客，于是涌现了很多网站生成器，如 [Hexo](https://hexo.io/zh-cn/ "主页")、[Hugo](https://gohugo.io "主页")，还有官方推荐的基于 Ruby 的 Jekyll 等等。

这些工具都有一个特点，生成的网页都是静态的，因为 GitHub Pages 只能托管静态网页。对于动态网页，言必及 WordPress，使用 WordPress 是需要自己准备服务器的。而不同于服务端组织页面来返回，静态页面是直接托管在服务器上已存在的内容，访问就能得到。静态网站生成器的作用，就是帮助用户 **生成好所有页面**，这样上传到服务器（Github）就能直接访问。

使用 GitHub Pages 搭建个人博客，我们都知道是建立一个 **以用户名命名** 的仓库，形如 `<user>.github.io`，开启了 GitHub Pages，然后即可通过 `http(s)://<user>.github.io/` 访问。

![#b# 图片来自官方文档](https://help.github.com/assets/images/help/pages/create-repository-name-pages.png)

每个项目都可以启用 GitHub Pages。经常可以看到一些网站的 URL 类似 `http(s)://<user>.github.io/<repo>`，比如 Element for React：

![#b# Element-React](https://s2.ax1x.com/2020/02/04/1DQ70P.png)

通常一个仓库 Setting 页的 GitHub Pages 设置如下：

![#b# 普通仓库的 GitHub Pages](https://s2.ax1x.com/2020/02/04/1DlC7V.png)

能够看到，可以选用当前 Repo 的 `master` 分支托管网站，也可以使用 `master` 分支的 `docs` 文件夹。实际上不一定需要托管在主分支。当 Repo 设立了 `gh-pages` 分支，Github Pages 的 Option 会多出来该分支：

![#b# 设立了 gh-pages](https://s2.ax1x.com/2020/02/04/1DQjpQ.png)

再看 Element-React 项目的 Github：

![#b# Element-React 的 gh-pages 分支](https://s2.ax1x.com/2020/02/04/1DQqk8.png)

根据 [官方文档](https://help.github.com/en/github/working-with-github-pages/about-github-pages "官方文档")，个人站点和组织站点是类似的，默认使用 `master` 分支，项目站点默认使用 `gh-pages`，也可以使用 `master` 分支或 `master` 分支上的 `/docs` 文件夹。

### 404 Not Found

这样就好了吗？正如标题所云，还没解决 SPA 刷新造成 404 的问题，如果是被请求的服务器可以将请求重定向回 `index.html`，但静态网站访问之后，资源找不到就是找不到。所以 GitHub 提供了 [自定义 404 页面](https://help.github.com/en/github/working-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site "官方文档") 的功能，找不到资源时，会搜索 `404.html` 或 `404.md`，Geek 们可以自定义样式和内容。

同样，针对 SPA 的路由，知乎有这样一个 [问题及回答](https://www.zhihu.com/question/64173754 "知乎")：

![#b# 知乎问答](https://s2.ax1x.com/2020/02/04/1DQzXn.png)

题主及答主给出了几种修复 URL 的方案：

1. 通过 sessionStorage 存储之前的地址，然后跳转到新地址里并读取之前存储的内容，重新 route
2. 把当前地址作为参数跳转到 `index.html`
3. 复制 `index.html` 到 `404.html` 最简单粗暴，不过没准效果是最好的
4. 让 `404.html` 直接获取 `index.html`，然后直接把它丢到文档流里

最初我使用了 Hack 的方法，在 `404.html` 读取 `windwos.location`，修改 URL，将路径变为哈希字符串，然后使用  `history.replaceState()` 跳转到 `index.html`，主页检测 URL 再还原回来，但是效果不理想。~~应该是我编码（不对，思路）问题。~~ 最后直接复制 `index.html` 为 `404.html`，试下来，真应了这句话：

> 最简单粗暴，不过没准效果是最好的……

故而，假使不好处理 404 的问题，不妨也复制一份 index 文件，立竿见影。

## GitHub Actions

使用 GitHub Pages 托管静态网站最简单的方法，就是在 `master` 分支上创一个 `/docs` 文件夹，然后 `build` 出文件，随源代码提交，即可热更新，非常酷炫。

这还不够酷，[GitHub Actions](https://github.com/features/actions "主页") 了解一下。GitHub Actions 是 GitHub 的 [持续集成](http://www.ruanyifeng.com/blog/2015/09/continuous-integration.html "阮一峰的博文") 服务，于 2018 年 10 月推出。官方是这样描述的：

> GitHub Actions makes it easy to automate all your software workflows, now with world-class CI/CD. Build, test, and deploy your code right from GitHub. Make code reviews, branch management, and issue triaging work the way you want.

对于一个项目来说，写完代码还没完事，还要经过测试、部署等等一系列工作，这是正常流程，但每次提交、修复 bug 或者添加新特性，都要走一遍这样的流程，自然会觉得烦。“重复 3 次以上的工作都要用程序来自动化”，因此有了 [Travis](https://travis-ci.org "主页")、[Pre-commit Hooks](https://pre-commit.com/hooks "主页") 等工具，帮助开发者实现部分自动化，很多 Repo 里都有类似 `.travis.yml` 的文件。自从 GitHub 推出了 Actions 功能，这一历史就将改写，因为从代码提交到部署上线这一过程更加原生，一条龙服务 ~~，如果不用 Github，那就当我没说~~。（对，Github 不只是托管代码，当然，GitLab、Gitee 也都在积极提出 CI/CD 和 DevOps 产品，以适应现代开发理念，更好的迎合市场需求。）

简而言之，Github Actions 就是提供一个环境，在某些条件下，可以执行一些操作。这个条件（配置文件的 `on` 字段）可以是 `push`、`issue`、PR 或是其他；执行的操作可以是编译、测试、fork、commit、发布等等，只要有配置文件，就能自动执行；所运行的环境可以是 Linux、Windows 以及 macOS（对，macOS 也支持，不过限制更多一点），硬件如下：

- 2-core CPU
- 7 GB of RAM memory
- 14 GB of SSD disk space

也可以自建环境（self-hosted），比如自己的树莓派（self-hosted runner）。借助 GitHub Actions，作为个人开发者我们可以实现每次提交源码，自动测试编译打包，然后发布到自己的平台（VPS 或者 GitHub Pages），当然 Geek 的想象力是无限的，Actions 能做的远远不止于此。

该功能入口在此：

![#b# GitHub Actions](https://s2.ax1x.com/2020/02/04/1DQIOI.png)

据 [文档](https://help.github.com/cn/actions/automating-your-workflow-with-github-actions) 所述，Action 有以下几个概念：

1. *workflow*：持续集成运行一次的过程，就是一个 workflow
2. *job*：一个 workflow 由一个或多个 jobs 构成，含义是一次持续集成的运行，可以完成多个任务。多个 job 是并发执行的
3. *step*：每个 job 由多个 step 构成，一步步完成，因此可以指定顺序（即依赖关系：`needs` 字段）
4. *action*：每个 step 可以依次执行一个或多个命令（action）

workflow 想必各位有点耳熟，iOS 上的 App [捷径](https://apps.apple.com/cn/app/id915249334) 被收购前就叫 *Workflow*，产品如其名，可以自动化处理一些操作，Actions 也一样。

### Actions 加持

所以我盘算使用 GitHub Actions 来自动部署我的 SPA。Actions 的配置文件存放在 Repo 根目录的 `./github/workflow` 文件夹下，使用 YAML 语法配置。关于配置项，官方文档给的很详细，还提供了了编辑器，各位大牛的教程也很到位，这里不再赘述。以下是我这个项目的 workflow：

```yml
name: SPA Deployer

on:
  push:
    branches:
      - master

jobs:
  build-deploy:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v1
      - name: Setup Node
        uses: actions/setup-node@v1
        with:
          node-version: '10.x'
      - run: yarn install
      - run: yarn release
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v2
        env:
          ACTIONS_DEPLOY_KEY: ${{ secrets.ACTIONS_DEPLOY_KEY }}
          PUBLISH_BRANCH: gh-pages
          PUBLISH_DIR: ./public/release
```

使用自己指定的 `yarn release` 命令，将文件编译到 `./public/release` 文件夹。用到了如下 Actions：

1. [actions/checkout](https://github.com/marketplace/actions/checkout "Marketplace")
	- [GitHub](https://github.com/actions/checkout "GitHub")
	- 切换分支，即拉取代码
2. [actions/setup-node](https://github.com/marketplace/actions/setup-node-js-for-use-with-actions "Marketplace")
	- [GitHub](https://github.com/actions/setup-node "GitHub")
   	- 安装 Node.js，此后即可使用 Node 命令
   	- 同样支持 Yarn，之前我以为不支持，还找了另外的 actions：[GitHub Actions for Yarn](https://github.com/marketplace/actions/github-action-for-yarn "Marketplace")
3. [actions-gh-pages](https://github.com/marketplace/actions/github-pages-action "Marketplace")
	- [GitHub](https://github.com/peaceiris/actions-gh-pages "GitHub")
	- 主角。部署项目到 `gh-pages` 分支（其他分支也可）
	- 注意 `env` 的 `ACTIONS_DEPLOY_KEY` 是 SSH 私钥
	- 具体操作见 [README](https://github.com/peaceiris/actions-gh-pages/blob/master/README.md "GitHub README")

至此，SPA 项目可以实现在 GitHub 上提交后自动构建并发布，与后端彻底分离。

## 后记

试错阶段失败了很多次，最后终于成功了。

![#b# 构建失败](https://s2.ax1x.com/2020/02/04/1DQTmt.png)

通过这一系列部署，学到了很多操作。运维不同于开发，求稳而不求变，遵循一定的流程，难怪需要大量自动化脚本，继而又涌现了大量 Docker、K8S 等自动化部署工具和 [Jenkins](https://jenkins.io/ "主页") 等持续集成工具。**技术改变世界**，相信使用脚本刀耕火种的日子不复存在。

## 参考文章
1. [前端部署发展史](https://juejin.im/post/5dc4ae67f265da4cfa7bbb9a)
2. [用github actions部署你的应用(hexo)](https://jsonz1993.github.io/2019/12/github-actions/)
3. [Github Action 文档](https://help.github.com/cn/actions/automating-your-workflow-with-github-actions)
4. [GitHub Actions 入门教程](http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)