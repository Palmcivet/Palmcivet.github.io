---
title: gmpy2 编译安装的坑
top: false
cover: false
password: false
comment: true
date: 2019-11-2 15:10:01
img: https://s2.ax1x.com/2020/01/20/1ivTTU.png
categories: CTF
tags:
  - 密码学
  - 部署
summary: 本文记录 Kali 下编译安装 gmpy2 的过程，需要在网上爬很多帖，但后来发现，可以直接使用 apt 就可以安装，所以踩坑记录变成了部署记录。
---

## 前言
> GMP，GNU Multiple Precision Arithmetic Library，GNU 高精度算术运算库

gmpy2 是 [Python](https://www.python.org/) 的一个扩展库，常用在 CTF 的 Crypto 题中分解大素数。

- [Github](https://github.com/aleaxit/gmpy)
- [PyPi](https://pypi.org/project/gmpy2/)
- [文档](https://gmpy2.readthedocs.io/en/latest/)

## TD;DR

本文记录 Kali 下编译安装 gmpy2 的过程，过程挺艰难，需要在网上爬很多帖，但后来发现，可以直接使用 apt 命令来安装，所以踩坑记录变成了部署记录。使用以下两条命令即可完成安装：

```bash
$ apt install m4 libgmp-dev libmpfc-dev libmpc-dev
$ pip3 install gmp2
```

> APT 具有超级牛力。

## 编译环境

好，所以现在开始编译安装。首先确保安装了 gcc 和 make。

```bash
$ apt install gcc make
```

- Kali：5.2.0-kali2-amd64u
- GCC：8.3.0
- Make：4.2.1

## 安装依赖库

gmpy2 依赖 GMP、MPFR、MPC 三个库，需要提前安装。

为便于指定编译路径，先使用变量指定文件夹。

```bash
$ mkdir -p $HOME/gmpy2
$ GMPY=$HOME/gmpy2
```

预先下载好所有依赖库的文件包，并解压，依次进入文件夹进行编译。

### m4

[m4](http://ftp.gnu.org/gnu/m4/ "下载列表") 是 *POSIX* 标准中的一部分，所有版本的 UNIX 下都可用。虽然这种语言可以单独使用，但大多数人需要 m4 仅仅是因为 GNU autoconf 中的 *configure* 脚本依赖它。

m4 模块最新版本是 `1.4.18`：

```bash
$ v=1.4.18
$ cd m4-${v}
$ ./configure -prefix=/usr/local
$ make && make check && make install
```

### GMP

> [GMP](https://gmplib.org "官网")，GNU Multiple Precision Arithmetic Library，GNU 高精度算术运算库

GMP 提供了大量操作高精度大整数、浮点数的算术库，可直接使用，详细操作见 [官方文档](https://gmplib.org/gmp-man-6.1.0.pdf "文档")。

```bash
$ v=6.1.2
$ cd gmp-${v}
$ ./configure --prefix=$GMPY --enable-static --disable-shared --with-pic
$ make && make check && make install
```

### MPFR

> The MPFR library is a C library for multiple-precision floating-point computations with correct rounding. MPFR has continuously been supported by the INRIA and the current main authors come from the Caramba and AriC project-teams at Loria (Nancy, France) and LIP (Lyon, France) respectively; see more on the credit page. MPFR is based on theGMP multiple-precision library.

[MPFR](https://www.mpfr.org "官网") 是一个基于 GMP 库的高精度浮点计算库，因此需要先按照 GMP。

```bash
$ v=4.0.2
$ cd mpfr-${v}
$ ./configure --prefix=$GMPY --enable-static --disable-shared --with-pic --with-gmp=$GMPY
$ make && make check && make install
```

### MPC

[MPC](http://www.multiprecision.org/mpc/)
```bash
$ v=1.1.0
$ cd mpc-${v}
$ ./configure --prefix=$GMPY --enable-static --disable-shared --with-pic --with-gmp=$GMPY --with-mpfr=$GMPY
$ make && make check && make install
```

## 安装 gmpy2

使用安装脚本：

```bash
$ python setup.py build --prefix=$GMPY
```

或者直接使用 pip：

```
$ pip3 install gmpy2
```

不出意外的话，到此就安装成功了。~~但出了意外就还得爬帖了，（逃~~

## 参考文章
1. [gmpy2安装使用方法](https://www.cnblogs.com/pcat/p/5746821.html)
2. [python2/3 gmpy2库在linux下安装](https://www.jianshu.com/p/0ab4b0d8facb)
