---
title: 使用 CTFd 搭建靶场
top: false
cover: false
password: false
comment: true
date: 2019-10-25 15:39:26
categories: CTF
tags:
  - Docker
summary: 使用 CTFd 搭建一个 CTF 平台，以供练习
img: https://i.loli.net/2021/04/04/x87I5QlOh6SmkLP.png
---

众所周知，渗透测试练习有许多平台可供使用，比如 [Metasploitable](https://sourceforge.net/projects/metasploitable/)、[DVWA](http://dvwa.co.uk/ "Homepage") 等环境，而搭建 CTF 平台也有许多项目可供参考，如 [CTFd](https://ctfd.io/ "Homepage")、[FBCTF](https://github.com/facebook/fbctf "Github")，一些比赛以及各个大学的练习站点就使用了这些项目。

CTFd 可使用多种方式 [部署](https://github.com/CTFd/CTFd/wiki/Advanced-Deployment "Github")，为了以更加轻便的方式运行，此处使用 [Docker](https://www.docker.com/ "Homepage")。

## 环境部署
### Docker

1. 安装 Docker 的依赖
  ```bash
  $ yum install yum-utils device-mapper-persistent-data lvm2 bind-utils
  ```
2. 添加 Docker 的源，再 [安装 Docker](https://docs.docker.com/install/linux/docker-ce/centos/ "Docs")
    ```bash
    $ yum-config-manager \
		--add-repo \
		https://download.docker.com/linux/centos/docker-ce.repo
    $ yum install docker-ce
    ```

###  Docker Compose

[Docker Compose](https://github.com/docker/compose "Github") 使用 Python 开发，因此需先安装好 Python 的 pip
```bash
$ yum install epel-release python-pip
$ pip install docker-compose
```

## 启动 CTFd
### CTFd

1. 下载 [CTFd](https://github.com/CTFd/CTFd "Github")
	```bash
	$ git clone https://github.com/CTFd/CTFd.git
	```
2. 进入 `CTFd`，会发现项目文件夹中还有一个 `CTFd` 文件夹
	```bash
	$ cd CTFd
	$ docker-compose up -d
	```
	`docker-compose` 使用了 Docker API，等同于 `docker`，`up` 选项构建、运行容器，`-d` 参数表示在后台运行。

首次构建将拉取几个镜像（mariadb、python、redis 等），速度较慢，等到脚本跑完，就可以在本地通过 `http://127.0.0.1:8000` 访问。初次运行需注册 Admin 用户，填写相关信息。

### 汉化

其实没必要汉化，不过为了后期可定制化，[此处](https://github.com/Gu-f/CTFd_chinese_CN "CTFd_chinese_CN") 为汉化项目的地址，不过该项目只汉化了选手的界面，管理员相关页面仍为英文。

1. 下载汉化包
	```bash
	$ git clone https://github.com/Gu-f/CTFd_chinese_CN.git
	```
2. 替换或者增加 theme
	- 将 `core_chinese` 文件夹直接放入 `CTFd/CTFd/themes` 目录
	- 将 `themes` 直接替换 `CTFd/CTFd` 目录下的 `themes` 即可

## 动态独立靶机
现在很多比赛都使用了动态独立靶机（dynamic standalone instance），每道题目环境分离，且能为每个队伍生成独一无二的 flag，动态创建也能减少资源开销。

此处使用 [赵师傅](https://www.zhaoj.in/) 的 [CTFd-whale]

根据 README，需要下载 [frps](https://github.com/fatedier/frp/)，以实现穿透

在 `docker-compose.yml` 的 `volume:` 添加：

```yml
service:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
```

## 参考资料

1. [手把手教你如何建立一个支持ctf动态独立靶机的靶场（ctfd+ctfd-whale）](https://blog.csdn.net/fjh1997/article/details/100850756)
2. [CTFd动态flag镜像编写](http://www.gtfly.top/2019/09/27/CTFd动态docker镜像编写.html#创建动态flag)
