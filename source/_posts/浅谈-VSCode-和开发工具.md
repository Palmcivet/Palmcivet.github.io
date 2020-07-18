---
title: 浅谈 VSCode 和开发工具
toc: true
top: false
cover: false
mathjax: false
reprintPolicy: cc_by
categories: Geek
tags:
  - 参考
date: 2020-03-06 20:07:46
img: https://s1.ax1x.com/2020/07/13/UGtZQI.png
summary: 微软家带 Visual 的东西实在太多了，傻傻分不清楚，本文用于厘清 VS 的关系，介绍了下 VSCode 的基本玩法，并且讨论一些开发工具。
---

## 前言

早在今年二月份，我产生了一个自建云开发环境的想法，就是复刻微软的 Visual Studio Online，~~（因为这一服务需要 Azure，而 Azure 要钱），~~ 然后在 iPad 上就可以码代码了，日常通勤只需携带 iPad。

地毯式搜索之后，发现解决方案还是不少的，[*Code Server*](https://github.com/cdr/code-server "GitHub") 就是其中一个，其本质就是魔改 VSCode。你也可以更极客（硬核）一点，VSCode 官方提供了 [编译步骤](https://github.com/microsoft/vscode/wiki/How-to-Contribute "GitHub Wiki")，可以编译为 Web 应用，部署在自己的服务器上，成为比 *Code Server* 更原生的云编辑器。

![Code Server - 图片来自官方 GitHub](https://github.com/cdr/code-server/raw/master/doc/assets/screenshot.png)

除此之外，如 [StackBlitz](https://stackblitz.com/ "主页") 等其他解决方案以及具体玩法见后文 ~~，后文的意思是今后的文章（逃~~

之后（五月），GitHub 又推出了 [Codespaces](https://github.com/features/codespaces "主页")，这么多项目~~玩具~~，谁是谁，关系又如何，完全搞不清楚，所以产生了一篇名为《非权威解读 Visual Studio “全家桶”》的文章草稿，只是开了个头，就搁置了。一是只介绍产品没什么深度，二是要学习新知识没精力~~就是懒~~，三是就这么点东西，关系厘清就好了，真没啥可写。再后来也就是现在（七月），应邀~~硬要~~介绍一下 VSCode 的基本玩法，并且讨论一些开发工具，作为入门~~启蒙读物~~还是有必要的，故而我就一瓶子不满半瓶子晃，厚着脸皮在此搬弄。

## 开发工具

大多数编程初学者用 C 语言入门，不少高校以及出版教材都使用 Visual C++ 6.0 作为开发工具进行演示，光这一点就被人诟病已久；另一方面，类似谭浩强版教材，或因写作历史久远缺乏更新，却因校方教材审校不当，或因作者只想完成任务，导致学习难度增加，提高了计算机专业的入门门槛（注意是对口的计算机专业，也就是说，消磨了热衷于学习的初学者的热情）。

我们盘点一下 C 教学经常用到的工具。

- [Microsoft Visual C++](https://baike.baidu.com/item/Microsoft%20Visual%20C%2B%2B/8646587 "百度知道")
	- 也称 MSVC，是微软的 C++ 开发工具，具有可视化界面（Visual）
	- 6.0 版本于 1998 年发行
	- 后来的版本被集成在 Visual Studio 中，成为其中的一个组件
	- 历史久远，存在较多错误和兼容性问题
- [C Free](http://programarts.com/ "主页")
	- 国产收费软件
	- 最新版为 5.0，发布于 2010 年 7 月 19 日
- Dev C++
	- 是一款开源的自由软件，集成了 MinGW 中的 GCC、GDB 等工具
	- 原开发公司 *Bloodshed* 在开发完 [4.9.9.2](https://sourceforge.net/projects/dev-cpp/ "原 SourceForge") 后停止开发，现在由 *Orwell* 公司继续开发更新，称为 [orwelldevcpp](https://sourceforge.net/projects/orwelldevcpp/ "新 SourceForge")
	- 最新版为 5.12，发布于 2016 年 11 月 29 日
- [Code::Blocks](http://www.codeblocks.org/)
	- 开源软件，跨平台（上述三款仅限 Windows 平台）
	- 最新版为 20.03，发布于 2020 年 3 月 19 日

作为学习使用，比较推荐的是 Dev C++ 和 Code::Blocks。这些软件有一个共性：都是集成开发环境（简称 [IDE](https://zh.wikipedia.org/zh-hans/集成开发环境 "Wiki")）。

### IDE

> 集成开发环境（Integrated Development Environment，IDE），是用于提供程序开发环境的应用程序，一般包括代码 *编辑器*、*编译器*、*调试器* 和图形用户界面等工具。集成了代码编写功能、分析功能、编译功能、调试功能等一体化的开发软件服务套件。
> —— 百度百科

很多教材和教师在 C/C++ 入门介绍的时候，简略或忽略预处理、编译、汇编、链接这一过程，而在 Java 入门的时候，会强调体验一下“使用记事本写一个 `.java` 文件，然后用 `javac` 命令编译为 `.class` 文件，再使用 `java` 命令运行”这个过程。

![#b# C 编译过程 - 图片来自网络](http://aliyunzixunbucket.oss-cn-beijing.aliyuncs.com/jpg/67e5ff298100a5d491d1e610dab63905.jpg)

实际上，编译型语言的运行都需要经过编译，转换成可执行文件方可运行。运行 Java 代码这一过程虽然不复杂，但开发时每次修改都要重复一遍，显然不人道。所以把这些重复动作交给脚本或者程序使其自动完成，程序员只需专注于代码本身，这样可以极大提高工作效率。

另一方面，程序出错之后需要找错误，使用各种 *调试*（debug）手段。什么？`print` 语句/函数？写 3 行代码可以，3 百行代码可以，但是 3 万行、3 千万行呢？手动添加调试代码的方式不仅缺乏交互性，还增加了工作量，需要在开发结束删除或者通过某种机制禁用（如 C 的 `DEBUG` 宏）。调试器就提供了这样的功能，能够在程序运行过程中实时监测变量的值，在代码中设立 *断点*（breakpoint）或 *观测点*（watchpoint），调试时动态显示这些值，再次提高工作效率。

![#b# VSCode 调试 Python](https://s1.ax1x.com/2020/07/13/UGtPoD.png)

再者，代码写完需要构建成一个可以用的软件/项目，需要执行打包、压缩、加壳、添加水印、颁发证书等等操作，这些流程同样需要自动化；开发过程中，代码不是一成不变的，而是需要经过无数次的改动，每次改动之间的联系和关系需要管理；作为一个团队，需要共享一些配置和代码/库 …… 这一切的一切，都需要一堆工具和一套科学的方法体系来管理控制，IDE 就是这样一个工具集合，依据某些开发理论组合而成。

### 编译器

> 编译器（compiler）是一种计算机程序，它会将某种编程语言写成的源代码（原始语言）转换成另一种编程语言（目标语言）。
> 主要的目的是将便于人编写、阅读、维护的高级计算机语言所写作的源代码程序，翻译为计算机能解读、运行的低阶机器语言的程序，也就是可执行文件
> —— 万维百科

对于 C/C++，编译器将源代码转换成可执行文件，其本质就是计算机指令的二进制表示，可以直接在操作系统上运行；对 Java，编译器将源代码转换成 Java 虚拟机（JVM）能运行的二进制指令。

*编译原理* 是计算机专业的一门重要专业课，旨在介绍编译程序构造的一般原理和基本方法。内容包括语言和文法、词法分析、语法分析、语法制导翻译、中间代码生成、存储管理、代码优化和目标代码生成。编译原理是轮子哥（[vczh](https://www.zhihu.com/people/excited-vczh "知乎个人主页")）所说的“计算机中的「三大浪漫」”，另两个是操作系统和图形学。

#### 静态和动态

通常，静态类型的语言在 **编译期间** 检查数据类型，使用前必须声明数据类型，如 C/C++、C#、Java、Rust，通常需要编译。

而动态类型的语言通常不需要编译，**运行期间** 才做数据类型检查，源代码由 *解释器*（interpreter） 解释执行，因此叫 *解释型* 语言（相对于 *编译型*），如 JavaScript、Python、PHP，该类型的语言会在第一次赋值给变量时，在内部将数据类型记录下来。

#### JIT 和 AOT

但实际上，JavaScript 是有编译过程的，但这又与传统的编译不同，不是提前编译整份文件，而是大部分情况在代码执行前编译，甚至是代码执行时编译（JIT，Just In Time），称为 *及时编译*。一个比较显著的现象就是变量/函数 *提升*（hoist）。

```js
a = 2;
var a;
console.log(a);
```

正如上述 JS 代码，可以先赋值，再声明。如果一行一行解释执行的话，则无法预知在下方的声明。

相比于「编写-编译-执行」这一过程，运行时编译可以加快从编码到执行的时间，JVM 在运行时也用到了 JIT 技术。与 JIT 相对的就是 AOT（Ahead Of Time），运行前编译，比如普通的静态编译。

实际上，种种技术都是 **速度** 和 **质量** 博弈的结果，静态类型保证数据的可靠性，加快了执行速度，但降低了开发效率，动态类型提高了开发效率，但免不了数据出现错误，JIT 技术可以说是一个折中，但又会消耗运行时（runtime）资源。为了压榨性能，新兴的现代编程语言是多种技术的集合，是不能简单用几个标签就能归类的。

编程语言是以一种 **规范**，具有语法特性，每种语言都有各自对应的编译器/解释器，每款编译器/解释器的具体实现不一。对于 C/C++，VS 使用 MSVC，Linux 使用 `gcc`/`g++`，XCode 使用 `clang`/`clang++`；对于 Python，有使用 C 开发的解释器 *CPython*（最流行，[官网](https://www.python.org/) 默认即为 CPython），有使用 Java 开发的 *JPython*，有使用 Python 开发的 *PyPy*。各种语言的实现都可以有，但每种编译器/解释器的实现方式和优化不尽相同，质量有高有低。

用 Python 开发 Python 的解释器，编程语言的这种行为称为 [*自举*](https://en.wikipedia.org/wiki/Bootstrapping_(compilers) "Wiki")（bootstrap）。通常来说，一门新的编译型语言（假设为 NL）的编译器会使用其他语言（比如 C、C++、汇编）来开发，然后使用得到的编译器（如 CNL）编译编译器的源码，再逐步完善（得到使用 NL 开发的编译器 NLNL）。

既然提到了编译器，就不得不说 GCC 和 LLVM 了。

#### GCC

> [GNU](https://gcc.gnu.org/)，GNU Compiler Collection，GNU 编译器套件。

GCC 原为 *GNU C Compiler*，只能处理 C 语言。但其很快扩展，变得可处理 C++，后来又扩展为能够支持更多编程语言，如 Fortran、Pascal、Objective-C、Java、Ada、Go 以及各类处理器架构上的汇编语言等，所以改名 *GNU Compiler Collection*。

GCC 套件包括但不限以下工具：

- `gcc`：运行该工具等同于执行编译链接生成等一系列过程
- `g++`：类似 gcc，默认语言设置为 C++
- `ld`：链接器
- `as`：GNU 汇编器，实际上是一族汇编器，可以编译为能在各个平台上工作
- `gdb`：GNU 调试器，一款强大的调试器
- `nm`：列出目标文件中定义的符号
- `make`：执行脚本的工具，C/C++ 开发时，通常使用 Makefile 编写好文件之间的依赖和关系，然后使用 `make` 执行时，将按照 Makefile 定义的顺序编译链接生成
- `objdump`：显示目标文件中保存的多种不同信息

除此之外还有一系列库。

GCC 是一套组件的 **集合**（在此用大写标识），而 `gcc` 和 `g++` 实际上是 **驱动器**，根据文件特征或者参数调用相关工具和库，最终生成目标文件。详细区别可见 [gcc和g++是什么关系？ - 知乎](https://www.zhihu.com/question/20940822)。

#### LLVM

> The LLVM Project is a collection of modular and reusable compiler and toolchain technologies. Despite its name, LLVM has little to do with traditional virtual machines. The name "LLVM" itself is not an acronym; it is the full name of the project.
> —— [The LLVM Compiler Infrastructure](http://llvm.org/ "主页")

LLVM 的命名最早来源于底层语言虚拟机（Low Level Virtual Machine）的缩写。它是一个用于建立编译器的基础框架，最初是伊利诺伊大学（*University of Illinois*）的一个研究项目，目标是提供一种现代的、基于 SSA 的编译策略，能够同时支持任意编程语言的静态和动态编译。自那时以来，LLVM 已经成为一个由若干子项目组成的总括项目，包括但不限于：

- LLVM Core：LLVM 核心库提供一个与源和目标无关的现代优化器，以及对许多流行 CPU 的代码生成支持，核心库是围绕 *LLVM IR*（LLVM 中间表示）构建的。
- Clang：LLVM 原生的 C/C++/Objective-C 编译器
- LLDB：建立在 LLVM 和 Clang 提供的库之上，提供一个优秀的调试器
- LLD：一个新的链接器，取代系统链接器，运行速度更快
- `libc++` 和 `libc++ ABI`：提供了一个标准的、符合规范的、高性能的 C++ 标准库实现

LLVM 跟 GCC 不是对应关系，后者是一个组件，而前者是一个编译器框架，一个最明显的体现在于 LLVM IR。不同于机器码，这是一种更低层（更接近机器），但尚未完全暴露出具体平台相关的特征的代码表示，因此具有通用性和可移植性。

各种各样的应用（DSL、GPU 数据库、TVM、安全、区块链等）
=> 生成 LLVM IR
=> 编写针对自己特定应用的优化
=> LLVM 的优化
=> LLVM 代码生成
=> 目标代码（ARM、x86、Hexagon、NVPTX、AMDGPU、WebAssembly、定制的芯片等）

LLVM 是一个后端，C 和 Python 都可以编译成 LLVM IR，然后再进一步处理。这种模块化的组成降低了设计一款编程语言的难度。因此 LLVM 与底层虚拟机已风马牛不相及，只是一个名称而已。各种语言如 Go、Rust、Swift 都有基于 LLVM 的编译器前端。

### 编辑器

说完编译器（compiler），再谈一谈编辑器（editor）。编辑器就是写代码的工具，本质就是文本编辑器。文本编辑器是计算机软件中的一种，主要用于用来编写和查看文本文件。*Microsoft Word* 是文本编辑器吗？不是，它编辑和保存的文件是二进制文件，文本文件应由字符（可打印和不可打印）组成。下面列举一些文本编辑器。

#### Notepad

Notepad 就是 Windows 系统 `C:\windows\system32\` 下的 `notepad.exe`，中文名为 *记事本*。代码的本质就是文本文件，使用它书写足矣。

![#b# 近 60 位鹅厂程序员对 Python 开发工具的偏好 - 原图来自网络](https://s1.ax1x.com/2020/07/13/UGtSL6.jpg)

可是，为什么真正使用记事本的人少之又少呢？

表述开发、编程、代码等关键词时以及在公众号博客等文章的封面，我们能经常看到类似这样的图片：

![#b# 图片来自网络](https://goss1.veer.com/creative/vcg/veer/612/veer-143481084.jpg)

![#b# 图片来自网络](http://pics.sc.chinaz.com/files/pic/pic9/201811/zzpic15036.jpg)

最直接的感受就是深色背景下花花绿绿的字体，这种将代码着以不同色彩的行为叫做 *高亮*（highlight）。代码是有规律可循的，相同的语法结构应该高亮出来，方便辨认，这就是记事本等普通编辑器无法做到的，但又是代码编辑器需要完成的目标之一。不同的人有不同的喜好，因此产生了各种配色，大多数代码编辑器支持自定义配色，用户可以选择第三方调校好的主题或者自行搭配。

在此分享两个网站：

- [VSCodeThemes](https://vscodethemes.com/)：VSCode 主题市场，可自由选择
- [TmThemeEditor](https://tmtheme-editor.herokuapp.com/)：自定义 Sublime Text 3 主题，其中也内置了著名主题，用户可以在此基础上修改

此外还要搭配合适的编程字体（宋体实在太没辨识度了，`0O1il` 不分）。以下为 *异次元软件世界* 介绍的几款编程字体

- [JetBranson Mono](https://www.iplaysoft.com/jetbrains-mono.html "文章页")
	![#b# 文章封面](https://img.iplaysoft.com/wp-content/uploads/2020/jetbrains-mono/jetbrains_mono_banner.png!0x0.webp)
- [Cascaia Code](https://www.iplaysoft.com/cascadia-code.html "文章页")
	![#b# 文章封面](https://img.iplaysoft.com/wp-content/uploads/2019/cascadia-code/cascadia_banner.jpg!0x0.webp)
- [Mononoki](https://www.iplaysoft.com/mononoki.html "文章页")
	![#b# 文章封面](https://img.iplaysoft.com/wp-content/uploads/2016/mononoki/mononoki_banner.jpg!0x0.webp)
- [其他推荐字体合集](https://www.iplaysoft.com/programming-fonts-collection.html "文章页")

一个成熟的代码编辑器需要完成的目标还有 **语法检测**、**风格检测**、**格式化**、**语法提示** 和 **自动补全** 等。开发者们矢志不渝，致力于打造方便快捷高效的工具，帮助开发者们提升开发体验（DX，Develop eXperience）。

![#b# 代码提示和语法检测，按回车可补全](https://s1.ax1x.com/2020/07/13/UGYxQ1.png)

目前使用比较多的编辑器非 Vim/Emacs 和 VSCode 莫属，下面简单谈谈。

#### Sublime Text

> 用“最性感的编辑器”书写崇高的文本

![#b# 异次元软件世界介绍 ST 时的封面](https://img.iplaysoft.com/wp-content/uploads/2012/Sublime-Text-2---_D09E/sublimetext.jpg!0x0.webp)

[Sublime Text](http://www.sublimetext.com/ "主页") 是闭源收费软件，但可以免费无限期试用（全功能），但某个时间段使用频率较高时会弹窗提示购买。~~这才是良心软件，免费给予使用权，收费给予所有权。~~

![#b# Sublime Text 提示购买 - 图片来自网络](https://a.axihe.com//img/tools/sublimetext/2015-09-05_55ea6f675e6c4.jpg)

目前最新版本为 `3.x`。ST 很难开箱即用，需要进行一些基本配置，如果要求较高，还得深度定制。现代编辑器包括下面提到的几个都拥有插件机制，得益于 Package Control，使用命令面板即可安装插件，也可到 [插件市场](https://packagecontrol.io/ "Package Control 插件市场主页") 挑选。

![#b# Sublime Text 的插件市场](https://s1.ax1x.com/2020/07/13/UGtCdO.png)

#### VS Code 和 Atom

Atom 是 GitHub 的一个开源项目，五六年前较为盛行，使用 Electron 技术栈打造，相当于把浏览器搬到桌面，Web 前端技术栈发挥空间较大，但随之而来的就是体积臃肿和运行卡慢。

2015 年，微软发布并开源了 [Visual Studio Code](https://code.visualstudio.com/ "主页")，一款轻量级的代码编辑器，同样基于 Electron。作为 Atom 的后继者，由微软牵头打造，经过多年努力，性能和功能非 Atom 所能及。

![#b# VS 的安装大小 - 来自知乎专栏，作者见水印](https://picb.zhimg.com/v2-847a0fe866f6afb66af967aedaa5d3cb_r.jpg)

我们在谈到编辑器的时候总会说「轻量级」这个词，而 IDE 总会说重量级，原因前文已经说过，编辑器只不过是 IDE 中的一个组件。虽然 VSCode 只是个编辑器，但搭配上插件，匹敌 IDE 不是难事，无论功能上还是体量上。

![#b# VSC 和 ST3 体积对比，macOS 平台日常使用，数据仅供参考](https://s1.ax1x.com/2020/07/13/UGtFFe.png)

同时打开速度上，ST 可以实现瞬开，但 VSCode 只能实现秒开，但比 IDE 快多了。我通常使用 ST 更改配置文件、临时查看代码，使用 VSCode 作为开发环境。

成也 Electron，败也 Electron，使用该框架，即使没有功能，打包后体积也需 100MiB 起步，但巨硬拥有全球顶尖的团队，不断压榨性能的同时，还在拓宽功能，形成了一个繁荣的生态系统，拥有庞大的插件市场。更多信息和玩法见 [VSCode](#vs-code) 一节。

#### 其他编辑器

文本编辑器千千万，在 Atom 和 VSCode 之前和之后，都涌现大量工具，其中不乏优秀作品。下面列举一部分。

- [EditPlus](https://www.editplus.com/)
	- 30 天免费试用
- [Notepad++](https://notepad-plus-plus.org/)
	- 这两个都是 XP 时代的 UI 风格
	- 免费使用
- [Notepads](https://www.notepadsapp.com/)
	![Notepads App - 图片来自官网](https://static.wixstatic.com/media/0fcd80_f13c96da960d491fa8862087ad614ce4~mv2.png/v1/fill/w_972,h_745,al_c,q_90,usm_0.66_1.00_0.01/1.webp)
	- Fluent Design 现代化 UI
	- Windows UWP
	- 开源在 [GitHub](https://github.com/JasonStein/Notepads "GitHub 仓库")，可在 [微软商店](https://www.microsoft.com/zh-cn/p/notepads-app/9nhl4nsc67wm "Microsoft Store") 下载

#### 请出 Vim

> Vi IMproved

Vim 压轴并不为过，这款诞生于上个世纪的编辑器，是 Linux 下的文本编辑器，是 Vi 命令的加强版，支持各大平台架构。

- *gVim* 是 Vim 的图形化前端。跨平台
- *NeoVim* 是 Vim 的衍生，与 Vim 存在竞争关系

关于 Vim，最著名的段子就是「如何退出」，这与其独特的编辑模式密不可分：

- Normal：普通模式，<kbd>Esc</kbd> 进入
- Insert：插入模式，<kbd>I</kbd> 进入
- Visual：可视模式，<kbd>V</kbd> 进入
- Replace：替换模式，<kbd>R</kbd> 进入
- 命令行模式，<kbd>:</kbd> 进入

退出使用命令模式：

- `q` 退出
- `wq` 写入（保存）
- `q!` 不写入退出

使用 `vim` 命令进入将得到一个黑色的窗口，很难想象这就是一个有力的开发工具。诚然，不经配置的工具，和记事本并无区别。得益于 VimScript 和 [插件系统](https://vimawesome.com/ "插件市场")，可玩性大大增强，VimScript 是一门基于 Vim 的语言，因此可以通过 Vim 和 Shell 命令操纵任何事物。~~只有你想不到的，没有我 Vim 做不到的（逃~~

Vim 最新版本为 `8.x`，支持异步 API 和浮动窗口，这个古老的生产力工具同样具有很多新特性，分享一张我配置的 Vim 截图，主题为 *gruvbox*。

![#b# Vim 开发界面](https://s1.ax1x.com/2020/07/13/UGtkJH.png)

#### Emacs 不服

Emacs 跟 Vim 一样，也是元老级，足够强大，但我没有使用过，不好在此评判。~~虽然没有用过，但必须拥有姓名（逃~~

### 再谈 IDE

~~关于 IDE 还没完，大 VS 和 JB 家族必须拉出来吹一下。~~

前面 [开发工具](#开发工具) 一节提到，Visual Studio C++ 已被 [Visual Studio](https://visualstudio.microsoft.com/zh-hans/ "主页") 集成，不止是 C++，还有 Visual Studio Python、Visual Studio C# 等一系列组件，动辄十几 G，实际上客户端开发的 IDE，如 XCode 和 Android Studio，都需要大量依赖和库，体量是不会小的。

#### JetBrains 必须拥有姓名

[JetBrains](https://www.jetbrains.com/ "主页") 是一家很酷的公司，开发了一系列优质的 IDE，最出名的莫过于 [IntelliJ IDEA](https://www.jetbrains.com/idea/ "IntelliJ IDEA主页") 和 [PyCharm](https://www.jetbrains.com/pycharm/ "PyCharm 主页")。此外 [Kotlin](https://kotlinlang.org/ "主页") 语言也是 JB 家的。

![#b# JetBrains 主页](https://s1.ax1x.com/2020/07/13/UGYzsx.png)

产品虽好用，但是收费，不过 IDEA 和 PyCharm 有可以免费使用的社区版；作为学生或教师，可免费使用所有产品；作为开发者，同样可以申请认证，从而免费使用所有产品。

#### ~~过气网红~~ Eclipse

提到 Java 开发，[Eclipse Platform](https://projects.eclipse.org/projects/eclipse.platform "主页") 拥有一席之地，该开源项目隶属于 [Eclipse 基金会](https://www.eclipse.org/ "主页")。Eclipse 是一个可扩展开发平台（platform），本身只是一个框架，通过插件来构建开发环境，所以可执行文件只有几 MiB。Eclipse 包括一个插件开发环境（Plug-in Development Environment，注意这个词，不是说开发插件的环境，而是环境由插件组成，环境是 `plug-in` 的。~~原来英文也会有这个时候╮(╯▽╰)╭~~）。官方提供了一个标准插件集，其中就包含 Java 开发包（[Eclipse Java development tools(JDT)](https://projects.eclipse.org/projects/eclipse.jdt)），当然也有 C/C++（[Eclipse C/C++ Development Tooling(CDT)](https://projects.eclipse.org/projects/tools.cdt)）等开发包。

因为这个项目是用 Java 开发的，所以……卡慢。~~比 IDEA 还慢（IDEA 也是 Java 写的）。~~

## VS 全家桶
> “全家桶”这个称呼是我冠上的，实际上称为系列更合理。

~~下面才是原本的文章~~

![#b# VS 主页](https://s1.ax1x.com/2020/07/13/UGtVSA.png)

### Visual Studio

众所周知，VS 是 Windows 上宇宙第一 IDE，不多说。

![#b# Visual Studio Code 主页](https://s1.ax1x.com/2020/07/13/UGtZQI.png)

### Visual Studio Online

北京时间 2019 年 11 月 4 日，在 Microsoft Ignite 2019 大会上，微软正式发布了 Visual Studio Online 公开预览版。

简单来说，VS Online 由两部分组成：

- 前端：VS Code、VS 和 Web 版 VS Code（也就是 VS Online 提供的前端界面）
- 后端：由云服务支撑的开发环境，由 [Azure](https://www.azure.cn/ "主页") 提供有力支持

本质上说，是一种 SaaS 服务，其实就是后端建立标准化的的开发环境，前端通过某些形式（PC 端软件、移动端软件、Web 页面）接入。

\- 懂了吗？
\- 懂了！
\- 好！改名部上。

### Visual Studio Codespaces

![#b# Visual Studio Codespaces](https://s1.ax1x.com/2020/07/13/UGtAWd.png)

正如你所见，Visual Studio Online 现在称为 [*Visual Studio Codespaces*](https://visualstudio.microsoft.com/zh-hans/services/visual-studio-codespaces/) 啦。

了解了产品的本质，现在来说一说替代品。

- 腾讯云的 [Cloud Studio](https://coding.net/products/cloudstudio "主页")
	![#b# Cloud Studio 的特性](https://s1.ax1x.com/2020/07/13/UGt9eK.png)
	- 是腾讯云旗下 Coding 的产品，Coding 本身就兼具代码托管、集成测试、CI/CD 等功能，将代码编辑上云，方便开发也不足为奇，使开发成为闭环
- [StackBlitz](https://stackblitz.com/ "主页")
	![#b# StackBlitz 的 Web 界面](https://s1.ax1x.com/2020/07/13/UGtdTU.png)
	- 在浏览器编写代码并实时预览，可连接到 GitHub 仓库
	- 目前仅限前端技术栈
- [Code Server](https://github.com/cdr/code-server "GitHub")
	- 部署好后直接使用地址访问即可，相当于自建的 StackBlitz

这些产品都具有一个特点，都是基于 Web 前端，在网页中写代码，打开浏览器即可。大多数都用了 Monaco Editor 这个基于网页的编辑器（见 [VS Code](#vs-code) 一节）。

### Visual Studio Code

跟 VS 不同，VSCode 是轻量级的编辑器，千文介绍过了，后文将进一步讨论。

### Visual Studio Code Remote

Visual Studio Code Remote 是一系列 VSCode 的 **插件**，允许开发者将容器（container），远程计算机，或 Windows Subsystem for Linux (WSL) 作为完整的开发环境，插件分别如下：

- `Remote - SSH`：通过 SSH 连接到远程计算机或者虚拟机，选择一个文件夹作为工作目录
- `Remote - Containers`：把 Docker 作为开发容器
- `Remote - WSL`：在 Windows Subsystem for Linux 中，获得 Linux 般的开发体验

搜索 「Remote」 关键词时会出现 `Remote Development extension pack`，这是一个插件包，包含以上三个插件，一键下载即可全部安装。~~第一次装的时候没看清，有点蒙圈。~~

### Codespaces

嗯？Visual Studio Codespaces 跟这个 [Codespaces](https://github.com/features/codespaces "主页") 有什么关系？

没有直接关系，这是 GitHub 推出的服务，而不是微软的，尽管 GitHub 现已被微软收购。实际上如果没改名，可能就不那么容易搞混 ~~也许就是为这事儿改名的（逃~~

<video width="650px" height="451px" loop autoplay playsinline muted type="video/mp4; codecs=avc1.4D401E,mp4a.40.2" src="https://github.githubassets.com/images/modules/site/codespaces/hero.h264.mp4"></video>

从来自官网的动图看，这项服务可以在浏览 GitHub 仓库时一键进入该项目的工作目录，开始修改或阅读代码。

> How is Codespaces different from VS Code?
> Codespaces sets up a cloud-hosted, containerized, and customizable VS Code environment. After set up, you can connect to a codespace through the browser or through VS Code.

VS Codespaces 是将 VSCode 作为一个前端，这个功能网页也可以替代，其重点是后端的 Azure 云开发环境；而 GitHub Codespaces 是将 GitHub 网页作为唯一前端（Get the full Visual Studio Code experience without leaving GitHub.），其重点在 Web 页面，不离开 GitHub 网页就可以获得 VSCode 的开发体验。

## VS Code

~~终于开始点题了~~

### 杰出特性

微软集结了杰出工程师，汇聚全球开发者的智慧。其团队负责人 *Erich Gamma*，是：

- JUnit 作者之一
- 《设计模式》作者之一
- Eclipse 架构师

2011 加入微软，在瑞士苏黎世组建团队开发基于 Web 技术的编辑器，也就是后来的 [*Monaco Editor*](https://microsoft.github.io/monaco-editor/ "主页")。VSCode 开发团队早期成员 10 来个人，但大多有 Eclipse 开发团队的背景。[Monaco Editor](https://github.com/microsoft/monaco-editor "GitHub") 是基于 Web 的编辑器，从 VSCode 脱离出来，成为一个独立的项目。

VSCode 在短短几年内，超越了 Atom、Sublime Text、Vim，成为最受欢迎的代码编辑器。同时，其架构设计和开发理念将代码编辑器提升到一个新的高度，我认为称之「神话」并不为过（[推荐阅读](#推荐阅读)-3）。不得不说巨硬还是强，但凡用心。~~改名部和大刀部笑了。不把一手好牌打烂就不叫微软（逃~~

![#b# 图片来自知乎](https://pic4.zhimg.com/v2-f06d2184194415c4581b872e68674408_r.jpg)
![#b# 图片来自知乎](https://pic4.zhimg.com/v2-1a79eba389c1a66908c6b0262cdfe0bb_r.jpg)

目前 VSCode 已统治了前端开发，几乎所有前端开发者都在使用。产品本身好用是一回事，另一个原因是 VSCode 本身就是由前端技术栈打造，对 JS/TS 的支持度较高，除此之外还有更重要的一点就是前端技术纷繁芜杂，变化多端，五六年之间，从刀耕火种，完成了工程化，在大前端时代，很难找到一款适合每个团队的 IDE，相比之下，选择重要组件，辅以不同的配置项来搭建开发环境更为便捷。

![Erich Gamma 在 2017 SpringOne Platform 上分享对于 VSCode 的定位 - 来自知乎](https://pic2.zhimg.com/v2-623a63be2fde7b549a3c471d48fc585b_r.jpg)

#### LSP

> Language Server Protocol

用于语法提示，是 VSCode 的一大创举，传统语法提示基于语法结构，将代码转换成抽象语法树（AST，Abstract Syntax Tree）再解析，而 LSP 不再关注 AST 和 Parser，转而关注 Document 和 Position，从而实现语言无关。

将语言提示变成 CS 架构，核心抽象成当点击了文档的第几行第几列位置需要 Server 作出什么响应的一个简单模型，基于 JSON RPC 协议传输，每个语言都可以基于协议实现通用后端。

![#b# LSP](https://code.visualstudio.com/assets/api/language-extensions/language-server-extension-guide/lsp-illustration.png)

#### DAP

> Debug Adaptor Protocol

VSCode 的另一大创举，实现了一个基于抽象协议、通用的、语言无关的调试协议。该协议用于和调试器后端通信，但调试器没有实现该协议，因此需要一个中介（adaptor）来适配，该中介称为 *Debugger Adaptor*（DA），通常是一个独立进程。

![#b# DAP 架构示意 - 来自官方文档](https://code.visualstudio.com/assets/api/extension-guides/debugger-extension/debug-arch1.png)

这两大设计属于高屋建瓴，可以看出开发团队的思想层次，把自己的东西做成标准，做出生态，开放共赢。连 Vim 也开始兼容这些协议。

在其他方面，VSCode 的表现同样可圈可点，比如全文查找替换和全目录查找替换，且支持正则匹配，甚至做到毫秒级响应。

![#b# VSCode 界面组成](https://code.visualstudio.com/assets/docs/getstarted/userinterface/hero.png)

下面简单讨论几个常用功能点。[官方文档](https://code.visualstudio.com/docs/) 有详细且权威的资料，更多信息请移步。

### 工作区

工作区由一个个标签组成，通常打开的是文本文件，但打开格式流行的图片也是可以的。

![#b# 来自 VSCode 文档](https://code.visualstudio.com/assets/api/extension-guides/webview/basics-drag.gif)

### 设置

VSCode 提供了两种设置方式：GUI 和配置文件。在之前也跟 ST 和 Atom 一样都是编辑配置文件，现在 Atom 和 VSCode 都引入了图形化的配置方式。

![#b# VSCode 设置 GUI](https://code.visualstudio.com/assets/docs/getstarted/settings/settings.png)

每个插件都可以有自己的配置项，在不明确配置项或者读完文档之前，难以下手进行配置，通过图形界面可以展示每个项目。通过复选框、下拉列表和输入框，完成了大多数配置要求。

- 鼠标掠过配置项左侧，将浮现一个齿轮 ⚙，点击可复制该项到 JSON 文件。
- 单击标签栏右上角「打开设置」的图标，即可打开 `settings.json` 配置文件。

### 插件系统

这也是其他编辑器共有的特性，没有插件，就变成了记事本和 VS（要么过弱要么过强）。但不同于 ST 和 Vim，VSCode 是开箱即用的，下载安装就能上手简单的开发，这实际上是由内置插件实现的，VSCode 内部功能也是插件化独立的。（VSCode 将模块化做到极致，甚至连图标都整合一套并开源了。）

官方为几种语言提供了插件和开发包，可直接安装使用（当然要在准备好开发依赖的前提下）。

![#b# Activity Bar 上的「扩展」图标 - 图片来自官方文档](https://code.visualstudio.com/assets/docs/editor/extension-gallery/extensions-view-icon.png)

点击左侧的扩展图标，搜索栏自动获得焦点，在此可以检索相关插件，点击可查看插件详情，打开为一个不可编辑标签。

![#b# 搜索查看插件 - 图片来自官方文档](https://code.visualstudio.com/assets/docs/editor/extension-gallery/extensions-popular.png)

如下图，Go 语言的插件由 Microsoft 开发，这些主流语言的插件都由官方提供并维护。

![#b# 点击查看插件详情 - 图片来自官方文档](https://code.visualstudio.com/assets/docs/editor/extension-gallery/extension-contributions.png)

### 快捷键

高效的工作流离不开快捷键的加持。VSCode 支持自定义快捷键，结合插件，可以引入 ST、Atom、VS 等编辑器的快捷键方案，同样这些插件也由官方提供。

![#b# 快捷键编辑](https://code.visualstudio.com/assets/docs/getstarted/keybinding/keyboard-shortcuts.gif)

以下为三大平台上默认快捷键映射表：

- [Windows](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf "PDF")
- [macOS](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf "PDF")
- [Linux](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-linux.pdf "PDF")

### 集成终端

VSCode 集成了终端，默认按 <kbd>Ctrl</kbd> + <kbd>`</kbd> 切换，可以开启多个会话。类似 VS，VSCode 将问题、输出和终端分开，又引入了调试控制台，使得调试过程中能够交互式（REPL，Read-Eval-Print Loop）查看变量，执行相关语句。

![#b# 调试控制台 - 图片来自官方文档](https://code.visualstudio.com/assets/docs/editor/debugging/debugconsole.png)

### 命令面板

<kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>F</kbd> 可唤出命令面板，在此可输入并执行一些命令，快捷键的本质也就是绑定这些命令。

- 以 `>` 为提示符是执行命令：<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>，Windows 下为 <kbd>Ctrl</kbd>
- 以 `:` 为提示符是跳转到当前文件某行：<kbd>Ctrl</kbd> + <kbd>G</kbd>
- 以 `@` 为提示符是跳转到当前文件的某个结构：<kbd>Cmd</kbd> + <kbd>Shift </kbd> + <kbd>O</kbd>，Windows 下为 <kbd>Ctrl</kbd>
- 没有提示符是打开当前工作目录的文件：<kbd>Cmd</kbd> + <kbd>P</kbd>，Windows 下为 <kbd>Ctrl</kbd>

以上功能仅仅是 VSCode 强大功能的冰山一角，

每年，开发团队会发布一个 Roadmap，表示接下来一年要做的工作，每个月 VSCode 都会发布一个新版本，每次更新都会打开一份发行声明（「帮助-发行声明」也可以查看），详细描述更新的新功能和预览版功能（已经做完的和做好了的），每次通读都会感叹 VSCode 实在是太强大了。如果能读完每一篇发行声明，那必定会对这款软件产生更深刻的理解，可惜我目前做不到-_-。

多翻翻文档和设置，每次指定会有新收获。比如「Developer: Toggle Screencast Mode」命令，启用后每次按键、每次点击都会在窗口内标识，用于截图和录屏演示的场景。

![#b# Screencast 模式，2019.1 发行说明  - 图片来自官方文档](https://code.visualstudio.com/assets/updates/1_31/screencast.gif)

## 后记
肝了两天，这篇难产的文章终于告一段落了，行文至此，应该可以摆脱内容太浅的问题了，起码足够广。~~虽然也很水。~~

## 推荐阅读
1. [Visual Studio Code 官方文档](https://code.visualstudio.com/docs)
2. [AOT和JIT - CSDN](https://blog.csdn.net/xtlisk/article/details/39099199)
3. [编译器是如何编译自己的？ - RednaxelaFX的回答](https://www.zhihu.com/question/38355661/answer/76067276)
4. [从 VSCode 看大型 IDE 技术架构 - paranoidjk的文章](https://zhuanlan.zhihu.com/p/96041706)
5. [Visual Studio Code 可以翻盘成功主要是因为什么？ - 知乎](https://www.zhihu.com/question/363365943)

## 参考文章
1. [重磅！微软发布 Visual Studio Online：Web 版 VS Code + 云开发环境](https://zhuanlan.zhihu.com/p/90094288)
2. [VS Code Remote 发布！开启远程开发新时代](https://zhuanlan.zhihu.com/p/64505333)
