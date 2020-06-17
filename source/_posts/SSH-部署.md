---
title: SSH 部署
toc: true
top: false
cover: false
password: false
comment: true
date: 2018-11-12 10:44:00
img: https://s2.ax1x.com/2020/01/20/1Fp6un.jpg
categories:
  - 运维
tags:
  - Linux
  - 部署
summary: SSH，是一种加密的网络传输协议，可在不安全的网络中为网络服务提供安全的传输环境。
---

## SSH 概述

SSH，[Secure Shell](https://en.wikipedia.org/wiki/Secure_Shell "Wiki")，是一种加密的网络传输协议，可在不安全的网络中为网络服务提供安全的传输环境。该协议由 *IETF* 的网络工作小组（Network Working Group）制定。

SSH 是 Telnet 和非安全 shell 的替代品。Telnet 和 rsh、rexec 等协议采用明文传输，使用不可靠的密码，容易遭到监听、嗅探和中间人攻击。SSH 旨在保证非安全网络环境（例如互联网）中信息加密完整可靠。

众所周知，SSH 最常见的用途就是远程登录系统。

## OpenSSH

> OpenSSH（[OpenBSD Secure Shell](https://en.wikipedia.org/wiki/OpenSSH "Wiki")）是 OpenBSD 的子项目。它是取代由 SSH Communications Security 所提供的商用版本的开放源代码方案。

[OpenSSH](https://www.openssh.com "主页") 是 SSH 的一个开源实现，提供了服务端后台程序和客户端工具。

该项目主要由以下部分组成：

- 远程操作工具：
    - ssh
    - scp
    - sftp
- 秘钥管理工具：
	- ssh-add
	- ssh-keysign
	- ssh-keyscan
	- ssh-keygen
- 服务器端程序：
	- sshd
	- sftp-server
	- ssh-agent

其中比较常见的，ssh 是远程登陆的客户端，macOS 和大多数 Linux 发行版默认集成，Windows 从 Win10 1809 开始集成（以前版本则需要一些管理工具，如 Putty、Xshell、MobaXterm 等） ，sshd 是服务器端的守护进程，ssh-keygen 用于生成秘钥。

### 安装
在服务器部署 OpenSSH 守护进程。

```bash
$ apt install openssh-server     # Ubuntu
$ yum install openssh-server     # CentOS
```

安装完毕可以在本机测试是否连通：

```bash
$ ssh localhost
```

### 启动
```bash
$ service sshd start      # Ubuntu、CentOS
$ /etc/init.d/ssh start   # Debian
```

### 重启
```bash
$ service ssh restart     # Ubuntu、CentOS
$ /etc/init.d/ssh restart # Debian
```

## 配置
服务器配置文件路径：`/etc/ssh/sshd_config`。

部分说明如下：

```
# StrictHostKeyChecking ask
# IdentityFile ~/.ssh/id_rsa
# IdentityFile ~/.ssh/id_dsa
# IdentityFile ~/.ssh/id_ecdsa
# IdentityFile ~/.ssh/id_ed25519
# Port 22
# Protocol 2
# ListenAddress 0.0.0.0   绑定的 IP 地址
# ServerKeyBits 1024      服务器秘钥位数
# PermittedRootLogin yes  允许 root 登录
# StrictModes yes         接受登录请求之前检查用户主目录
# Tunnel no
# TunnelDevice any:any
# PrintMod yes  登录时显示 /etc/motd 信息
# RSAAuthentication yes 允许 RSA 验证
# PermitEmptyPasswords no
# AllowUsers    允许连接的用户
# AllowGroups   允许连接的群组
# DenyUsers     拒绝连接的用户
# Denygroups    拒绝连接的群组
# PermitLocalCommand no
# VisualHostKey no
# RekeyLimit 1G 1h
```

## 第一次登录
使用口令登录：

```bash
$ ssh <user>@<host> -p [port]
```

第一次登录，需要验证公钥指纹以权衡风险，会遇到如下提示：

```
The authenticity of host 'host (12.18.429.97)' can't be established.
RSA key fingerprint is 98:2e:d7:e0:de:9f:ac:67:28:c2:42:2d:33:16:58:4d.
Are you sure you want to continue connecting (yes/no)?
```

确认后输入 `yes` 即可登录服务器账户。

### 公钥文件
确认提示后会将所登录的主机写入一个文件，记录可信赖的 **远程主机** 的公钥，该文件路径如下：

- 当前用户：`$HOME/.ssh/known_hosts`
- 系统：`/etc/ssh/ssh_known_hosts`

实际上 `ssh` 文件夹下，有以下文件：

```
id_rsa
id_rsa.pub
known_hosts
```

`id_rsa` 和 `id_rsa.pub` 分别为用户主机的私钥和公钥。

### 公钥登陆
用户将自己的公钥储存在远程主机上，登录的时候，远程主机向用户发送一段随机字符串，用户用自己的私钥加密后，再发回来。远程主机用事先储存的公钥进行解密

1. 生成用户公钥 `ssh-keygen`
2. 运行结束以后，`$HOME/.ssh/` 目录下会生成两个文件 `id_rsa.pub` 和 `id_rsa`
3. 前者是公钥，后者是私钥
4. 用 `ssh-copy-id` 将公钥传送到远程主机上
5. 检查远程主机的 `/etc/ssh/sshd_config`
    ```
    RSAAuthentication yes
    PubkeyAuthentication yes
    AuthorizedKeysFile .ssh/authorized_keys
    ```

## 登录选项
常用登录选项：

- `-N`：只连接远程主机，不打开远程 shell
- `-T`：不分配 TTY
- `-f`：后台运行
- `-p <端口>`：指定端口号
- `-l <登录名>`：指定登录名
- `-q`：安静模式
- `-v`：详细模式
- `-b <绑定地址:>`：指定绑定地址作为源地址
-  `-g`：远程主机在本地的转发端口
- `-4`：只使用 ipv4
- `-6`：只使用 ipv6
