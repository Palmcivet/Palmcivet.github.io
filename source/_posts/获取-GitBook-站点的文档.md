---
title: 获取 GitBook 站点的文档
toc: true
top: false
cover: false
mathjax: false
reprintPolicy: cc_by
date: 2020-03-13 19:08:11
img: https://s1.ax1x.com/2020/03/13/8KIQ6U.png
password:
categories:
  - Geek
tags:
  - Python
summary: wget 加 -m 选项下载站点资源，然后使用 Python 提供的 SimpleHTTPServer 搭建简易服务器，可以实现在本地访问文档。
---

## TL;DR
wget 加 `-m` 选项下载站点资源，然后使用 Python 提供的 SimpleHTTPServer 搭建简易服务器，可以实现在本地访问文档。

## 前言

有些网站如果不用一些手段的话，访问速度特别慢，尤其是提供在线内容的网站比如官方文档，点半天没反应 ~~对，就是 GitHub 和 GitBook~~，开发体验极差。如果能本地访问就好了，像 Java 开发可能会查阅 CHM 格式的 API 手册，速度就会快很多，还有一些文档工具，综合了大量离线文档，如 [Dash](https://kapeli.com/dash "主页") 及与之对应的 [Zeal](https://zealdocs.org/ "主页")。

此处提供一个站点，可离线存储文档：[https://devdocs.io/](https://devdocs.io/ "主页")，用的前端技术栈。

水这么一篇文章，是因为最近阅读 [《C++ 并发编程》](https://chenxiaowei.gitbook.io/cpp_concurrency_in_action/ "文档")，切换页面速度太慢了，得想办法搞下来 <.<

## 下载静态资源

大多数文档都使用 [GitBook](https://www.gitbook.com/ "主页") 制作并托管，而 GitBook 是个静态页面，因此对于这类网页，可以下载静态资源到本地，从而加快访问速度。

正好该网站是用 GitBook 托管，每个页面都是 HTML 文件，所以在本地找个目录，[wget](https://www.gnu.org/software/wget/ "主页") 一把梭。

```bash
$ wget -m https://xxx.xxx.com
```

其中，`-m` 是 `-N -r -l inf --no-remove-listing` 的缩写形式。

还可以使用如下选项：

```bash
$ wget -k -r -c https://xxx.xxx.com
```

- `-k,  --convert-links`：让下载得到的 HTML 或 CSS 中的链接指向本地文件
- `-r,  --recursive`：指定递归下载
- `-c,  --continue`：断点续传下载文件
- `-np, --no-parent`：不追溯至父级，即只下载某子目录

类似工具还有 [HTTrack](http://www.httrack.com "主页") 等，可以镜像一个网站。

一波操作之后，在该目录就得到了网站的资源，双击 `index.html`（如果有的话），一个克隆网站映入眼帘，点击一个链接，如果没有使用 `-k` 选项的话，链接可能会失效，因为 URL 路径问题，关于 `file` 协议，[这里](https://palmcivet.github.io/2020/02/Github-%E4%B8%8E-SPA-%E9%83%A8%E7%BD%B2/ "文章") 有提到。

![#b# 网站资源 download 到本地](https://s1.ax1x.com/2020/03/13/8KheFx.png)

## 托管页面

众所周知，使用 Apache 或者 Nginx 托管静态页面再好不过，但是为了查一下文档在生产机安装服务端软件属实欠妥，最为上乘的是轻量级的解决方案如使用一个脚本启动一个服务器。随手一查，果然存在。

SimpleHTTPServer 是 Python 2 自带的一个模块，是 Python 的 Web 服务器。它在 Python 3 已经合并到 `http.server` 模块中。SimpleHTTPServer 在 Python 3 的用法与在 Python 2 的用法相似。

在终端进入一个目录，执行命令：

```bash
$ python -m SimpleHTTPServer 6789
$ python3 -m http.server 6789
```

使用浏览器输入 [127.0.0.1:6789](http://127.0.0.1:6789 "打开") 或 [0.0.0.0:6789](http://0.0.0.0:6789 "打开") 即可访问。

![访问之，可看到日志记录](https://s1.ax1x.com/2020/03/13/8KhEwR.png)

若当前目录存在 `index.html`，则默认显示该页面，否则显示为文件目录。

![运行在本地的文档页面](https://s1.ax1x.com/2020/03/13/8KhVT1.png)

其实 GitBook 也可以提供脚本和文件，可以在本地用这种方式运行一个网站的。>.<

## 随时启动

每次输命令哪够啊，肯定得 `alias` 一下，此后轻轻松松就可以打开服务器浏览任意文件了，开发的时候也可以做测试。~~当然香还是 Webpack 的 DevServer 香~~。

编辑 Shell 的配置文件（我使用 Zsh：`~/.zshrc`）：

```bash
alias simple="python3 -m http.server 9999"
```

对于 macOS，有一个 `open` 命令，可以指定浏览器打开某个页面，如 `open https://www.bing.com` 使用默认浏览器打开 [Bing](https://www.bing.com "主页")。当然也可指定浏览器，使用 `-a` 选项，比如 `open -a Firefox https://www.bing.com`。

`-a` 选项其实是用来打开软件的，就是 `/Applications` 文件夹下的应用程序，URL 只是个参数。

回过头来，命令设置如下：

```bash
alias simple="open http://0.0.0.0:9999 && python3 -m http.server 9999"
```

因 SimpleHTTPServer 打开后一直处于前台运行，况且打开软件需要响应时间，所以将 `open` 命令提到前面，这样的调用顺序正好并行处理。打开后窗口的焦点落于浏览器，获得极致体验。

可以使用 `&` 将命令放到后台而不占用终端，但简易服务器应随开随关，后台运行似乎不妥。

## 局域网访问

在局域网（使用无线路由器连接的家庭网络）内，PC、笔记本和手机等设备在同一网段，可通过内网相互访问。

![查看 IP](https://s1.ax1x.com/2020/03/13/8MpW8S.png)

查看一下 IP，绑定了本机地址，所以其他设备连接本机 IP 即可访问该页面：

![#b# 移动端访问本地文档](https://s1.ax1x.com/2020/03/13/8MC1T1.jpg)

## 题外话：Apache

macOS 系统对开发的友好之处就在于内置了一些必要的软件，曾经翻系统目录的时候找到过如下内容：

![#b# macOS 内置的 WebServer](https://s1.ax1x.com/2020/03/13/8KhAm9.png)

没错正是 [Apache httpd](http://httpd.apache.org/ "主页")，虽然见怪不怪，但在 macOS 上找到 Apache 多少还是有点惊讶的

![#b# macOS 内置的 Apache](https://s1.ax1x.com/2020/03/13/8KhmY6.png)

对于这个 httpd，可使用如下命令查看版本：

```bash
$ apachectl -version
```

### 启动与停用

httpd 的管理需要 `sudo` 权限，默认运行在 [`80`](http://0.0.0.0:80 "打开") 端口。

```bash
$ sudo apachectl start
$ sudo apachectl stop
$ sudo apachectl restart
```

打开浏览器查看，可以看到，后端操作系统是 UNIX（即 Darwin）。

![It works！](https://s1.ax1x.com/2020/03/13/8KhnfK.png)

### 配置

网站根目录为 `/Library/WebServer/Documents/`。可编辑配置文件：

```bash
$ sudo vi /etc/apache2/httpd.conf
```

具体配置项不做介绍，按照 Apache 文档配置即可。

## 后记
可以想象，在下载时网站的流量必然不小，因此需审慎下载，此外，对于这类资源，应尊重作者的劳动成果，譬如我下载的文档是作者的译文，不应用作其他用途。

SimpleHTTPServer，Python2 就有了，十几年前吧，我应该不是最后一个知道 ╮(╯▽╰)╭，不过貌似以前看到过。但至少我知道，Python 可以架设一个 Web 服务器。好，就这样，水了一篇文章。
