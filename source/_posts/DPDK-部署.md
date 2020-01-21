---
title: DPDK 部署
toc: true
top: false
cover: false
password: false
comment: true
date: 2019-04-26 20:05:57
img: https://s2.ax1x.com/2020/01/19/1P9sIS.png
categories: 系统开发
tags:
  - DPDK
  - 部署
summary: DPDK 可以为 Intel Architecture（IA）处理器架构下用户空间高效的数据包处理提供库函数和驱动的支持。本文记录 DPDK 部署的过程，以方便参考。
---

## 前言
> [DPDK](https://www.dpdk.org/) is the Data Plane Development Kit that consists of libraries to accelerate packet processing workloads running on a wide variety of CPU architectures.

最近用到 *Intel©️DPDK*，即 Intel Data Plane Development Kit，[官方文档](http://doc.dpdk.org/guides/index.html) 挺全面，但是一路跟下来，问题并不少；同时，该工具包本身不是像 ZSH 那样一般常见且常用的工具，各大平台上相关的资料并不算多。故在此将学习的过程记录下来，希望能起到抛砖引玉的作用。

## 部署
### 环境
- 系统：CentOS 7 Kernel 3.10
- 架构：IA，64 位
- 内存：1 GB
- DPDK 版本：18.11.1 LTS
- 网卡：使用 VirtualBox 虚拟机的 Intel 82540EM

目录结构如下：
```
dpdk-18.11.1
├── app
├── devtools
├── doc
├── examples
├── kernel
├── drivers
├── lib
├── buildtools
├── config
├── mk
├── license
├── pkg
├── test
└── usertools
```

### 安装条件
1. 硬件支持，查询 [网卡支持](http://core.dpdk.org/supported/)
2. 查看 CPU 是否支持大页内存技术
    ```bash
    $ grep flags /proc/cpuinfo
    ```
    - 包含 pge 表示支持 2MB 大页内存
    - 包含 pdpe1gb 表示支持 1GB 大页内存
3. 查看内存分页情况：
    ```bash
    $ grep Huge /proc/meminfo
    ```
4. 安装必要依赖
    ```bash
    $ yum install numactl-devel*x86_64
    ```

更具体的信息在 [官方文档](http://doc.dpdk.org/guides/linux_gsg/sys_reqs.html) 中

### 编译
1. 设置环境变量
    将以下内容增加到 `~/.bash_profile` 或 `~/.zshrc` 等 *shell* 配置文件，或者直接输入：
    ```bash
    export DPDK_DIR=<DPDK-DIR>
    export DPDK_TARGET=<TARGET>
    export DPDK_BUILD=$DPDK_DIR/$DPDK_TARGET
    ```
    `TARGET` 格式为 `ARCH-MACHINE-EXECENV-TOOLCHAIN`
    - ARCH: i686，x86_64，ppc_64，arm64
    - MACHINE: native，power8，armv8a
    - EXECENV: linux，freebsd
    - TOOLCHAIN: gcc，icc

    带入变量，命令如下：
    ```bash
    $ export DPDK_DIR=/root/dpdk
    $ export DPDK_TARGET=x86_64-native-linuxapp-gcc
    ```
2. 编译
    ```bash
    $ make install T=<TARGET>   # T 指定编译的目标环境
    $ make install T=x86_64-native-linuxapp-gcc
    ```
    将提示 `Installation cannot run with T defined and DESTDIR undefined`，即未指定安装位置，此处只需编译，可忽略，目录下多了名为 `<TARGET>` 的文件夹

### 目录结构
```
x86_64-native-linuxapp-gcc    # 即指定的 <TARGET>
├── app
├── build
├── include
├── kmod        # 存放内核模块
├── lib
└── Makefile
```

## 启动环境
DPDK 可总结如下：
- UIO，Userspace I/O
- Hugepages
- CPU Affinity 机制

其中一些特性的实现还需要系统环境支持，可使用 DPDK 提供的 `usertools/dpdk-setup.sh` 脚本来配置

### hugepages
为支持 Hugepages，需要配置内存页。
- 若仅使用 2MiB 大页内存
    输入以下命令，比较灵活方便，但是每次启动都要操作：
    ```bash
    $ sudo echo 1024 > /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
    ```
- 若使用 VFIO
    添加以下内容到 `/etc/default/grub` 的 `GRUB_CMDLINE_LINUX`：
    ```
    hugepages=1024  # 对于 2MiB 页面
    default_hugepagesz=1G hugepagesz=1G hugepages=4 iommu=pt intel_iommu=on
    ```
    更新 grub 并重启
    ```bash
    $ grub2-mkconfig -o /boot/grub2/grub.cfg
    ```
- 若使用 igb_uio
    可不开启 `iommu` 的两个选项

设置完内存页，需要挂载内存：
```bash
$ mkdir /mnt/huge
$ mount -t hugetlbfs nodev /mnt/huge
```
将以下命令添加到 `/etc/fstab` 可以永久保存:
```
nodev /mnt/huge hugetlbfs defaults 0 0
```

### 加载内核模块
#### UIO
- Linux 内核所包含的标准 *uio_pci_generic* 模块可提供 UIO 能力
    ```bash
    $ sudo modprobe uio_pci_generic
    ```
- DPDK 提供了一个 *igb_uio* 模块，在 `$DPDK_TARGET/kmod` 目录
    ```bash
    $ sudo modprobe uio
    $ sudo insmod $DPDK_TARGET/kmod/igb_uio.ko
    ```

#### VFIO
Linux 内核从 3.6.0 之后默认包含 *VFIO* 模块，因此也可使用该模块
```bash
$ sudo modprobe vfio-pci
```

### 绑定端口
DPDK 程序在运行前，需要将所要使用的端口绑定到 *uio_pci_generic*, *igb_uio* 或 *vfio-pci* 模块上

1. 停用网卡
    ```bash
    $ ifconfig eth0 down
    ```
2. `usertools/dpdk-devbind.py` 提供当前系统上网络接口的状态，绑定或解绑定来自不同内核模块的接口
    ```bash
    $ dpdk-devbind.py --status  # 查看状态
    $ dpdk-devbind.py --status-dev eth0 # 查看接口状态
    $ dpdk-devbind.py --bind=igb_uio 03:00.0    # 绑定接口到 igb_uio 驱动，可使用接口名称
    $ dpdk-devbind.py -u 0000:03:00.0   # 解绑
    ```

## 运行实例
### 构建
构建实例时，需要导入以下环境变量：
- `RTE_SDK` - 指向 DPDK 安装目录
- `RTE_TARGET` - 指向 DPDK 目标环境目录
```bash
$ export RTE_SDK=<DPDK_DIR>
$ export RTE_TARGET=<RTE_TARGET>
$ make
```
为保持项目文件夹纯净，也可将实例放在其他目录以保持 DPDK 目录结构不变
此处以 l2fwd 举例：
```bash
$ cp ~/dpdk/examples/l2fwd ~/l2fwd-eg
$ export RTE_SDK=~/dpdk
$ export RTE_TARGET=x86_64-native-linuxapp-gcc
$ cd ~/l2fwd-eg
$ make
```

### 启动环境
1. [hugepages](#hugepages)，若此前永久保存，可略过
2. [加载内核模块](#加载内核模块)，因为 UIO 需要内核支持
3. [绑定端口](#绑定端口)，DPDK 作用是收发数据包，因此需要配置端口

### EAL
> EAL，Environment Abstraction Layer，环境抽象层

应用程序与 DPDK 目标环境的环境抽象库相关联，也就是说，每个实例运行的参数分为 EAL 参数和自身的参数。

示例：
```bash
$ <example> -c <coremask> -l <corelist> -n 2 -- -i
$ l2fwd -c 0x3 -l 2,3,4 -n 2 -- -i
```
常用参数：
- `-c`：核心数的十六进制掩码，如 11 对应 0x3
    读取 `/proc/cpuinfo` 中的 `physical id` 可知 core 的信息
- `-l`：逻辑核心列表，第一个核用于管理命令行
- `-n`：内存通道数
- `--master-lcore`：主服务器的核心
- `-p`：端口十六进制掩码
- `--`：分割 EAL 与各实例的参数
- `-i`：某些实例如 *testpmd* 有可交互的参数

至此，DPDK 的部署工作基本完成。文章并不详细，算不上教程，没有给出所以然，权当一个记录，若有需要，今后再做补充；如有问题，欢迎讨论。

工具包提供了不少脚本以供加快进度，同时 `/examples` 下包含了几十个实例，不得不说，*Intel©️DPDK* 项目很友好，后续将深入学习。