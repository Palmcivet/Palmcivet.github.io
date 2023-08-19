---
title: DPDK 工具
toc: true
top: false
cover: false
password: false
comment: true
date: 2019-04-30 10:15:20
img: https://s2.ax1x.com/2020/01/19/1P9sIS.png
categories: 系统开发
tags:
  - DPDK
summary: DPDK 项目提供了很多工具和脚本用来测试，以方便开发者，本文记录两个发包测试工具。
---

## 前言
DPDK 中提供了一些工具用来测试，本文对此进行一些简单的介绍，以期抛砖引玉。

- 操作环境同上篇。虚拟机分配 4 个核心
    - 系统：CentOS 7 Kernel 3.10
    - 架构：IA，64 位，4 核
    - 内存：1 GB
    - DPDK 版本：18.11.1 LTS
    - 网卡：使用 VirtualBox 虚拟机的 Intel 82540EM
- DPDK 提供的工具大多为实例，因此具有 EAL，在运行时需注意传入参数
- 大多实例需要两个以上核心，一个核用来管理命令行等信息，另外的核用来处理数据包
- 实例的运行可能需要 root 权限，建议使用 root 账户操作

## TestPMD
- 功能：在网络接口的以太网端口之间转发数据包。TestPMD 随 DPDK 库和工具一同编译，无需另外安装
- 路径：`<RTE_SDK>/<RTE_TARGET>`，此处为 `/dpdk/x86_64-native-linuxapp-gcc`

### 概述
设置方式：
- 将两个端口连接到外部流量生成器
- 使用回送模式下的两个端口接在一起

转发模式：
- 输入/输出：默认。通常称为 IO 模式，在内核接收一个端口的数据包（Rx）并将其传输到里一个端口（Tx）
- 仅 Rx：轮询来自 Rx 端口的数据包
- 仅 Tx：生成 64 字节的 IP 数据包并在 Rx 端口传输

### 启动
1. 设置 Hugepages、加载 UIO 驱动、绑定端口
2. 运行程序。TestPMD 默认在非交互模式下运行，指定`-i` 可交互
    ```bash
    $ sudo /build/app/testpmd/test-pmd –l 2,3,4 –n 4 -- -i
    ```
    - `-l`：指定逻辑核心，核心 2 用于管理命令行，核心 3 和 4 将用于转发分组
    - `-n`：指定系统的内存通道数

稍等片刻即可进入命令行交互界面。

### 常用参数
- `--nb-cores=N`：设置转发核心数，其中 1≤N≤核心数，默认 1
- `--nb-ports=N`：设置转发端口的数量，其中 1≤N≤端口数
- `--coremask=0xXX`：设置转发测试核心的十六进制掩码。主 lcore 仅保留用于命令行解析
- `--portmask=0xXX`：设置转发测试的端口的十六进制掩码
- `--eth-peer=N,XX:XX:XX:XX:XX:XX`：设置端口 N 的 MAC 地址
- `--tx-ip=SRC,DST`：设置仅进行传输测试时使用的源和目的地址

### 常用运行时命令
- 检查配置
    ```
    show config fwd
    ```
- 开始/停止 转发
    ```
    start / stop
    ```
- 显示应用程序正在使用的所有端口的统计信息：
    ```
    show port stats all
    ```
- 使用多个内核
    ```
    set nbcore 2
    ```

## Pktgen-dpdk
Pktgen-dpdk（Packet Generator）是一个基于 DPDK 开发的发包工具，因此也可以认为是一个实例，详询 [官方文档](https://pktgen-dpdk.readthedocs.io/en/latest/commands.html)。

### 编译
1. 安装 Lua [文档](https://www.lua.org/manual/5.3/readme.html)
    CentOS 7 所包含的 Lua 版本过低(5.1.x)，需要自行安装，此处使用 Lua 5.3.5
    ```bash
    $ cd /usr/local/src
    $ wget http://www.lua.org/ftp/lua-5.3.5.tar.gz
    $ tar zxf lua-5.3.0.tar.gz
    $ cd lua-5.3.0
    $ make <platform> install
    ```
    `<platform>` 可选如下平台：
    ```
    aix bsd c89 freebsd generic linux macosx mingw posix solaris
    ```
    此处为 `linux`
2. 安装依赖
    根据情况，CentOS 7 可能需要安装一些依赖才能编译，具体版本就不给出了
    ```bash
    $ yum install libpcap-dev
    $ yum install libreadline-dev
    ```
3. 设置环境变量
    ```bash
    $ export RTE_SDK=~/dpdk
    $ export RTE_TARGET=x86_64-native-linuxapp-gcc
    ```
4. 进入 pktgen 目录，编译
    ```bash
    $ cd <pktgen-dir>
    $ make
    ```

### 启动
1. 可使用 `tools/run.py` 设置启动环境，该 Python 脚本尝试配置系统，内部有提权操作，因而不需要 *sudo*。
    ```bash
    $ ./tools/run.py default
    ```
    该命令需在 pktgen 顶级目录下运行，使用 `/cfg/default.cfg` 配置文件
2. 启动
    启动参数包含 EAL 和自身参数，用 `--` 分隔，将进入命令行
    ```bash
    $ sudo ./pktgen -l 0-1 -n 3 -- -P -T
    ```
    pktgen 需要至少两个逻辑内核才能运行

### 常用参数
- `-f`：指定脚本，`.pkt` 或 `.lua`
- `-l`：指定日志文件
- `-p`：指定端口
- `-P`：在所有端口启用混杂模式
- `-T`：彩色终端输出
- `-G`：启用 socket
- `-N`：启用 NUMA 支持
- `-s<P>:<file>`：要传输的端口和 PCAP 文件
- `-m <string>`：将端口映射到核心
    - `:` 表示分别
    - `-` 表示和
    - [Core].[Port]
    - [rx:tx]
    ```
    1.0, 2.1, 3.2
    [1:2].0
    [1:2].[0-1]
    ```

### 常见运行时命令
- set
    ```
    set <portlist> <command> value
    ```
    - command 参数：
        - `count`：发送报文的数量
        - `size`：报文大小
        - `rate`：发送报文的速率
        - `sport`：TCP 源端口号
        - `dport`：TCP 目的端口号
    - 也可设置 MAC 及 IP
        ```
        set mac <portlist> <ethaddr>
        set ip src|dst <portlist> <ipaddr>
        ```
- seq：发送报文信息
    ```
    seq <seq#> <portlist> dst_mac src_mac dst_ip src_ip sport dport ipv4|ipv6|vlan udp|tcp|icmp vid pktsize
    ```
- save/load：保存/导入当前配置到文件

## Pktgen
pktgen 是一个位于 Linux 内核层的高性能网络测试工具，支持多线程，能产生随机 MAC 地址、IP 地址、UDP 端口号等信息的数据包。

- Linux 发行版默认包含
- pktgen 的配置与统计信息查看都使用 `/proc` 文件系统的数据写入功能

### 启动
1. 加载内核
    ```bash
    $ modprobe pktgen
    ```
    在 `/proc/net/pktgen` 可看见如下内容，文件数由 CPU 决定：
    ```
    kpktgend_0  kpktgend_1  kpktgend_2  kpktgend_3  pgctrl
    ```
2. 手动运行命令
    ```bash
    echo "rem_device_all" > /proc/net/pktgen/kpktgend_0
    echo "add_device eth0" > /proc/net/pktgen/kpktgend_0
    echo "pkt_size 1000" > /proc/net/pktgen/eth0
    echo "count 1000" > /proc/net/pktgen/eth0
    echo "delay 1" > /proc/net/pktgen/eth0
    echo "src 10.180.80.179" > /proc/net/pktgen/eth0
    echo "dst 10.180.80.181" > /proc/net/pktgen/eth0
    echo "start" > /proc/net/pktgen/pgctrl
    ```
    - `pkt_size`：包长
    - `count`：发包个数
    - `delay`：时间间隔，单位是纳秒
3. 也可使用命令构建脚本

### 常见命令
#### 控制命令
| 命令  | 说明             |
| ----- | ---------------- |
| start | 所有线程开始发送 |
| stop  | 停止             |

#### 线程的控制命令
| 命令               | 说明                                       |
| ------------------ | ------------------------------------------ |
| add_device         | 添加某个端口到某个线程                     |
| rem_device_all     | 删除绑定在某个线程的所有端口               |
| max_before_softirq | 在最多发送多少个数据包后,执行 do_softirq() |

#### 端口命令
| 命令           | 说明                                       |
| -------------- | ------------------------------------------ |
| debug          | 调试                                       |
| clone_skb      | 对每个 skb 进行多少个复制，0 表示不复制    |
| clear_counters | 清空计数器，默认自动清空                   |
| pkt_size       | 链路包的大小（除去CRC的值）                |
| min_pkt_size   | 数据包最小值                               |
| max_pkt_size   | 数据包最大值                               |
| flags          | 包的分片数量                               |
| count          | 发送数据包的个数，0 表示一直发送           |
| delay          | 发送两个数据包之间的延时                   |
| dst            | 目的 IP                                    |
| dst_min        | 目的 IP 的最小值                           |
| dst_max        | 目的 IP 的最大值                           |
| src_min        | 源 IP 最小值                               |
| src_max        | 源 IP 最大值                               |
| dst6           | 目的 IPv6 地址                             |
| src6           | 源 IPv6 地址                               |
| dstmac         | 目的 MAC                                   |
| srcmac         | 源 MAC                                     |
| src_mac_count  | 源 MAC 的数量，从 srcmac 的 MAC 开始轮询   |
| dst_mac_count  | 目的 MAC 的数量，从 srcmac 的 MAC 开始轮询 |
| udp_src_min    | 最小源 UDP 端口号                          |
| udp_src_max    | 最大源 UDP 端口号                          |
| udp_dst_min    | 最小目的 UDP 端口号                        |
| udp_dst_max    | 最大目的 UDP 端口号                        |
| flows          | 并发流的个数                               |
| flowlen        | 流的长度                                   |

#### Flags
| 命令       | 说明                      |
| ---------- | ------------------------- |
| IPSRC_RND  | PSRC_RND 源 IP 随机发送   |
| IPDST_RND  | IPDST_RND 源 IP 随机发送  |
| TXSIZE_RND | YXSIZE_RND 源 IP 随机发送 |
| UDPSRC_RND | UDPSRC_RND 源 IP 随机发送 |
| UDPDST_RND | UDPDST_RND 源 IP 随机发送 |
| MACSRC_RND | MACSRC_RND 源 IP 随机发送 |
| MACDST_RND | MACDST_RND 源 IP 随机发送 |
