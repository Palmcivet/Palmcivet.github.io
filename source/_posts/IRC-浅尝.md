---
title: IRC 浅尝
toc: true
top: false
cover: false
password: false
comment: true
date: 2019-05-22 20:50:17
img: https://s2.ax1x.com/2019/08/23/mBHgsI.png
categories: Geek
tags:
  - IRC
  - 通信
summary: IRC 是一种互联网聊天方式，采用分布式的客户端/服务器架构，每个 IRC 网络由多个服务器连接而成，几乎只要有互联网就可以聊天。
---

不久前接触到 IRC，感觉很有意思，遂了解了一下，记录下来。最近 [D^3CTF](https://d3ctf.io/) 官方提供了一个 IRC 频道，想进去水一水，结果发现 IRC 不怎么会用了，在此检讨一下，重新学习。

![#b# D^3CTF](https://s1.ax1x.com/2019/11/19/MgOSB9.png "#d^3ctf")

## 概述

> 因特网中继聊天（Internet Relay Chat，IRC）是一种历史悠久、应用广泛、成熟稳定的 **网络即时通讯协议**，被广泛地应用于在线通讯和网络聊天中。IRC 最早由芬兰人 *雅尔口·欧伊卡林恁*（Jarkko Oikarinen）于 1988 年 8 月创造以取代一个叫做 MUT 的程序，随后便一直在互联网中扮演重要角色。凡是支持互联网的操作系统，几乎都可以使用 IRC。虽然在 2003 年以后，许多功能更加丰富的聊天程序和服务取代了只能进行纯文字交流的 IRC，许多曾经的大型 IRC 服务器日渐式微，失去了 60% 的使用者。但对于许多应用来说，依然是一种方便可靠的通讯方式。（来自 [Wikipedia](https://zh.wikibooks.org/wiki/IRC)）

我们有时会在电影里看到，黑客使用终端进行聊天，这似乎非常奇妙，~~黑客可以用终端做任何事情~~ 就像下面这样。

![#b# 《Mr.Reboot》截图](https://s1.ax1x.com/2019/11/20/MRdJjH.png)

这是一种通讯方式，称为 IRC。

IRC 的实现方式，简言之，就是 IRC 用户使用 **客户端** 软件连接到 **IRC 服务器**，通过服务器 **中继** 与其他连接到这一服务器上的用户交流。

众所周知，A 与 B 可以直接进行通信，但 A、B 和 C 的通信则需要借助第三方 S 进行转发，如果参与到通信的人越来越多，则 S 的负担会越来越重。

因此如果有多个服务器，形成一张网络，服务器之间转发消息，用户只需要登录其中一个服务器，发送的消息就可以推送到各个用户节点。这一切通过互联网进行，因此称为 *互联网中继聊天*。

### 聊天网络
从一个 IRC 服务器可以连接其他服务器，由此构成一个网络。依据 IRC 协议组成的聊天网络，常见的有：
- [*freenode*](https://freenode.net "主页")：irc.freenode.net
- *EFnet*：www.efnet.org
- *EFPer*
- *DALnet*

大多数的 IRC 服务器不需要客户注册登录，但是在连接前必须设定好昵称（nickname）。

### 频道
频道的本质是广播室，相当于群组~~聊天室~~。

- 单个 `#` 开头的频道表明这是一个和自由和开源软件项目有关的正式交流频道
- 两个 `#` 号开头的频道表明这是一个非官方、非正式，或和某个项目无关的自由讨论频道

以下为几个较为活跃的频道 ~~2019 年未必日常活跃~~：
- `#wikipedia-zh`：中文维基百科交流使用的官方正式频道
- `#ubuntu-cn`：Ubuntu 中文社区频道
- `#linuxba`：Linux 贴吧频道
- `#haskell`：Haskell 语言频道
- `#c_lang_cn`：C 语言 IRC 频道
- `#vim`：Vim 社区频道
- `#openstack-chinese`
- `#git`
- `##javascript`
- `#macosx`
- `#ustc_lug`
- `#kali`
- `#debiancn`
- `#osdev`

以下为几个官方的频道列表：
- KDE [频道列表](https://userbase.kde.org/IRC_Channels/zh-cn)
- Arch [频道列表](https://wiki.archlinux.org/index.php/Arch_IRC_channels)
- CentOS [频道列表](https://wiki.centos.org/zh/irc)

### 特点
传统的 IRC 是基于文本的，因此，**图片** 和表情则无法发送，若实在有必要，可使用图床等在线工具，这样一来只需发送图片链接即可。这里提供了几个网站可以张贴图片：

- http://img.vim-cn.com/
- http://paste.edisonnotes.com/

另外，类似 **代码段** 这样的长文本也不利于阅读，同样可以发到第三方平台进行共享。

- http://dpaste.com/
- http://paste.ubuntu.com/

需要注意，尽管 IRC 频道可加密，甚至可以自建服务器在其之上通信，可确保会话安全，但通讯线路并不加密，需要第三方软件或客户端实现加密，从这一角度上看，IRC 通信安全性并不高。

## 客户端
接下来列举几个常见客户端

### pidgin
安装：
1. macOS
    ```bash
    $ brew install adium
    ```
2. Ubuntu
    ```bash
    $ apt install pidgin
    ```
3. Windows 可去 [主页](http://pidgin.im/) 下载，注意需使用 offline 版本

初次使用，需要在菜单->添加新的账户选择 IRC

![添加账号](https://s1.ax1x.com/2019/11/19/MRkXbq.jpg)

昵称任意，主机名可以填国内较快的 `irc.ubuntu.com`

文件->加入群组聊天

![加入聊天](https://s1.ax1x.com/2019/11/19/MRkvV0.jpg)

填写 [频道](#频道 "跳转到频道章节") 和密码（大多公共频道无密码）

![adium 聊天界面](https://s1.ax1x.com/2019/11/19/MgOp7R.png)

### Textual
[主页](https://www.codeux.com/textual/)

可免费全功能试用 30 天，到期后可功能有删减

![Textual 聊天界面（现在太冷清了](https://s1.ax1x.com/2019/11/19/M2YVkF.png)

### Irssi
[主页](https://irssi.org)
[GitHub](https://github.com/irssi/irssi)

轻量级 CLI 客户端

安装：
1. macOS
    ```bash
    $ brew install irssi
    ```
2. Ubuntu
    ```bash
    $ apt install irssi
    ```

快捷键：
- <kbd>Alt</kbd>+<kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd>：切换窗口
- <kbd>Alt</kbd>+<kbd>N</kbd>/<kbd>P</kbd>：滚动屏幕
- <kbd>PageUp</kbd>/<kbd>PageDown</kbd>：上下翻页

配置文件：`~/.irssi/config`

#### 常用命令
1. 直接带昵称登录指定的服务器
    ```bash
    $ irrsi -c <server> [-p port -n nickname]
    ```
2. 登陆/退出 IRC 服务器
    ```
    /connect <server> [port]
    /disconnect <server>
    ```
3. 修改昵称
    ```
    /nick <nickname>
    ```
4. 进入频道
    ```
    /join <#channel> <password>
    ```
5. 查看窗口列表
    ```
    /window list
    ```
6. 关闭当前窗口
    ```
    /window close <窗口编号>
    ```
7. 退出应用
    ```
    /wc
    ```

### WeeChat
> [WeeChat](https://weechat.org "主页")，Wee Enhanced Environment for Chat

C 语言编写的 CLI 客户端，具有扩展性，支持 Python、Perl、Ruby

该项目仍在更新中，截稿时 [最新版](https://weechat.org/download/, "下载页面") 为 v2.6（Sep 8, 2019）

安装：
1. macOS
    ```bash
    $ brew install weechat
    ```
2. Ubuntu
    ```bash
    $ apt install weechat screen
    ```
3. Arch
    ```bash
    $ pacman -S weechat screen
    ```

- 连接到服务器
    ```irc
    /connect freenode
    ```

自动连接到 freenode：
1. 添加一个 server
    ```irc
    /server add freenode <chat.freenode.net>
    ```
2. 设置自动连接到 freenode
    ```irc
    /set irc.server.freenode.autoconnect on
    ```

~~东西有点多，此处简单记下，日后慢慢体验（逃~~

### 其他
- [mIRC](https://www.mirc.com)：Windows 客户端
    ![#b# 图片来自网络](https://s1.ax1x.com/2019/11/19/M2YefJ.jpg)
    ![#b# 图片来自网络](https://s1.ax1x.com/2019/11/19/M2Ynp9.jpg)
- irccloud：iOS/Android 客户端
- [AndroidIRC](http://www.androirc.com/zh/)：Android 客户端
- Hexchat
- xchat

~~IRC 毕竟曾经火过，衍生产品不少，只不过大多较为古老罢了。~~

## 常用命令
RFC 规定了 IRC 命令规范，详询 [List of Internet Relay Chat commands](https://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands "维基百科")

[Ubuntu 中文](https://wiki.ubuntu.org.cn/IRC基本命令说明) 给出了一些命令说明。

常见的 IRC 命令有以下几个，但不同平台的实现各有不同，具体需要参考相关说明。

注册频道、昵称等命令以 freenode 为例 ~~，毕竟目前（2019 年）稳定较为活跃的平台也就这么点~~，该平台提供了一些服务，可用来进行操作，如：
- 昵称操作使用 `NickServ`
- 频道操作使用 `ChanServ`

其实相当于一个用户

![#b# ChanServ 管理员](https://s1.ax1x.com/2019/11/19/M2YATU.png)

[irssi](#irssi) 和 [Weechat](#weechat) 等命令行界面常用命令大同小异，但各自又有不同，可简单参照 ~~，挖个坑，先把 GUI 玩好了，之后再把玩 CLI~~。

### 连接到网络
连接到 IRC 服务器 `server`

```irc
/server <server>
/connect <server>
```

### 频道
#### 加入频道
进入 `#channel` 频道

```irc
/part <#channel>
/join <#channel>
```

#### 退出频道
离开 `#channel` 频道，可留下离开的原因 `reason`

```irc
/quit <#channel> [reason]
/leave <#channel>
```

#### 暂时离开
告诉别人暂时离开，当别人小窗你时将得到 `reason` 的消息

```irc
/away <reason>
```

#### 注册频道
1. 进入（临时）频道 `#channel`
    ```irc
    /join <#channel>
    ```
2. 设定密码
    ```irc
    /msg ChanServ register <#channel> <password>
    ```

### 用户
#### 注册昵称
1. 更改密码为 `password`, 邮箱为 `me@gmail.com`
    ```irc
    /msg ChanServ register <password> <me@gmail.com>
    ```
2. 登录：
    ```irc
    /msg ChanServ identify <password>
    ```

#### 更换昵称
进入 IRC 服务器后，可修改昵称

```irc
/nick <newName>
```

### 管理
#### 查看信息
- 查看 `nick` 用户的信息
    ```irc
    /who <nick>
    ```
- 查看 `IP` 登录
    ```irc
    /who <IP>
    ```

#### 踢出用户
```irc
/kick <#channel> <nick> <reason>
```

#### 更改话题
```irc
/topic <#channel> <topic>
```

---

## 后记

以上就是 IRC 的大致情况和基本用法，相信仍有一些不当之处，欢迎指正。

可以看到，虽然 IRC 在现在的中国互联网已然没落，但因其简单、自由的性质，在极客圈中仍有不少追随者。IRC 服务器可作为一个节点加入 IRC 网络，因此，自建服务器也是可行的。得益于 IRC 协议的开放性，自建服务器也有多种方案，如 UnrealIRCd。

> [UnrealIRCd](https://www.unrealircd.org "主页") is an Open Source IRC Server, serving thousands of networks since 1999.

借助此项目建立私有的服务器，可使得信息不被不公开（首先得确保网络通信也是安全的）

~~想想也是挺有意思的，此处挖个坑，尝试自建一个 IRC 服务器。~~

在互联网通信高度发达的 9102 年，我在此挖掘几年甚至十几年前的技术似乎不合时宜，尽管如此，但 IRC 技术自身并非一无是处，某些特性甚至具有先进性，故仍具有其存在的意义。

## 参考文章
1. [如何使用IRC](https://blog.csdn.net/john_cdy/article/details/7742218)
2. [命令行 IRC 客户端 irssi 的基本操作](https://www.cnblogs.com/tsdxdx/p/7291877.html)