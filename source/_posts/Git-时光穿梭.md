---
title: Git 时光穿梭
top: false
cover: false
password: false
comment: true
date: 2020-12-26 17:49:21
categories: Geek
tags:
  - Git
  - GitHub
summary: 本文主要学习记录关于 Git 提交日期的一些操作，实现穿越时间的效果（然而并没有什么用
img: https://i.loli.net/2021/04/05/zHbIDvngw5TuXAG.png
---

## 前言

曾经在 [GitHub](https://github.com/) 看到一个仓库，是某版 Unix 的历史归档，提交日期是上个世纪。项目具体名称和时间记不清了，在写作本文时我找了很久，只找到一个疑似 [项目](https://github.com/qrush/unix)，如下图所示，其提交时间为 13 years ago，即 2008 年，正好是 GitHub 刚上线的时候，或许前段时间 GitHub 有过调整，早于这个时间的项目都以 2008 年计。

![#b# UNIX 项目主页](https://i.loli.net/2021/04/05/dmfZCLjre8t7zyR.png)

不过怎样，在 2021 年看到几十年前的项目着实令人震撼，这是怎么做到的？

首先能想到，文件的时间是属性信息的一种，由文件系统赋予。

## 文件属性

在 UNIX 环境下，文件具有以下时间属性：

- `atime`：access time，最后一次读取文件的时间
- `mtime`：modify time，最后一次文件内容更改的时间
- `ctime`：change time，最后一次文件属性更改的时间

文件操作会产生如下影响：

- 读取文件时，`atime` 改变
- 修改文件属性时，`ctime` 改变
- 修改文件内容时，`atime`、`mtime`、`ctime` 都会改变
- more、less、cat、nl、tail、tac 等命令会更新 `atime`
- ls、stat 不会更新文件的 `atime`
- cmod、chown 修改文件属性，会更新 `ctime`
- touch 都会更改

### 查看信息

使用 stat 命令可查看以上时间信息。需注意，在 macOS 环境，stat 命令需要加 `-x` 选项。

```bash
➜ history-repo git:(master) ✗ stat -x README.md
-F  -- append file type indicators (implies -l)
-L  -- dereference symbolic links
-f  -- display per the specified format string
-l  -- display in `ls -lT` format
-n  -- suppress terminating newlines
-q  -- suppress error messages about lstat(2)/stat(2) failure
-r  -- display in raw (numerical) format
-s  -- display in shell variable-assignment format
-t  -- specify strftime(3) format string
-x  -- display in verbose (Linux-style) format
```

### 修改时间戳

很早以前就知道 touch 不仅可以创建文件，还能修改时间戳，一直都没试过，~~反正平常也用不着，~~ 用法如下：

![#b# touch 命令的提示](https://i.loli.net/2021/04/05/3FfiCSuXW8tMKnp.png)

使用 `-r` 选项可以将文件的时间更改为指定文件的时间，需注意 `-r <ref_file>` 是一组选项+参数，其后才是要更改的文件，过程如下图：

![#b# touch 更改时间戳](https://i.loli.net/2021/04/05/KxZqCBbi1Rr2epY.png)

除此之外，还能自行指定时间，格式为 `[[CC]YY]MMDDhhmm[.SS]`，因此，在本地文件系统上，文件时间可被自由更改。

## Git 提交
### `--date` 选项

Git 在 `commit` 时，默认会将当前系统时间作为时间戳，可使用 `--date=` 选项覆盖，详细文档 [在此](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---dateltdategt)。

![#b# 伪造一个历史提交](https://i.loli.net/2021/04/05/9VPvwZNgBDo6CXx.png)

可以看到，date 为 1975 年。

### 环境变量

> Git 总是在一个 bash shell 中运行，并借助一些 shell 环境变量来决定它的运行方式。

除了指定选项和参数，还可使用环境变量来指定更改时间和提交时间，Git [文档](https://git-scm.com/book/zh/v2/Git-%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86-%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F) 描述如下：

> Git 提交对象的创建通常最后是由 `git-commit-tree` 来完成， `git-commit-tree` 用这些环境变量作主要的信息源。 仅当这些值不存在才回退到预置的值。
>
> `GIT_AUTHOR_NAME` 是 “author” 字段的可读名字。
> `GIT_AUTHOR_EMAIL` 是 “author” 字段的邮件。
> `GIT_AUTHOR_DATE` 是 “author” 字段的时间戳。
> `GIT_COMMITTER_NAME` 是 “committer” 字段的可读名字。
> `GIT_COMMITTER_EMAIL` 是 “committer” 字段的邮件。
> `GIT_COMMITTER_DATE` 是 “committer” 字段的时间戳。
>
> 如果 `user.email` 没有配置， 就会用到 `EMAIL` 指定的邮件地址。 如果 **这个** 也没有设置， Git 继续回退使用系统用户和主机名。

示例命令如下：

```bash
$ GIT_AUTHOR_DATE="2031-01-01 12:33:08" \
    GIT_COMMITTER_DATE="2031-02-01 12:33:08" \
    git commit . \
    -m "some commit message"
```

现在将仓库上传到 GitHub，时间依然显示为当前时间：

![#b# 项目主页的时间](https://i.loli.net/2021/04/05/PdNThkvgbJAQIaM.png)

但是打开个人 Profile 会发现 Activity 年份一直到 1975 年：

![#b# 历史](https://i.loli.net/2021/04/05/GBUmdC48ciejQx1.png)

GitHub 大抵确乎是改变了显示方式，按照上传时间来显示，但提交时间属于 Git 仓库的信息，依然被保留。

既然能够控制提交时的时间，那能否修改已提交版本的时间呢？

## 修改上一次提交

修改已提交的内容使用 `--amand` 选项，使用 `-C --reuse-message` 重用某一次历史提交及其信息，当然也可以手动输入 `author`、`date` 等每一个字段。

```bash
$ git commit -C c95bed7 --amend --date="2019-01-01 23:12:01"
```

对于 `-C` 参数，Git [文档](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt--cltcommitgt) 描述如下：

> -C <commit>
> --reuse-message=<commit>
> Take an existing commit object, and reuse the log message and the authorship information (including the timestamp) when creating the commit.

> -c <commit>
> --reedit-message=<commit>
> Like -C, but with -c the editor is invoked, so that the user can further edit the commit message.

注意，这种方式只能修改上一次提交了的信息，对于已被覆盖的历史版本，需要使用 `rebase` 子命令。

## 修改历史提交

> Git 没有一个改变历史工具，但是可以使用变基工具来变基一系列提交，基于它们原来的 HEAD 而不是将其移动到另一个新的上面。

变基首先要界定修改范围，假设有以下几次提交：

```bash
commit 1ce2760811ffd5fdc37a841ce9b39198dec4c8b7 (HEAD -> master)
Date:   Thu Jan 1 23:12:01 2099 +0800

    third commit

commit 65d1c641337c79137f73ca4d1a76fed83c467d32
Date:   Tue Jan 1 23:12:01 2019 +0800

    second commit

commit c95bed78bd36a7e1f4bb4ca1270e8b0791d9f864
Date:   Fri Dec 5 12:23:23 1975 +0800

    first commit
```

要修改 `second commit` 的内容，就得回到 `65d1c641337` **之前一次** 提交，即：

```bash
$ git reabse -i 65d1c641337^
```

上述命令表示对 `7075919` 到 `HEAD` 之间的提交进行 rebase，`-i --interactive` 交互式变基。

![#b# 进入交互式变基引导界面](https://i.loli.net/2021/04/05/HwRum6GSh7btCZc.png)


可以看到，从上到下依次为历史提交，在 `c95bed7` 的基础上（onto）。此时，在需要修改的提交前，将 `pick` 改为 `edit`，保存退出，将会收到以下提示：

```bash
Stopped at 65d1c64...  second commit
You can amend the commit now, with

  git commit --amend

Once you are satisfied with your changes, run

  git rebase --continue
```

现在就类似 [修改上一次提交](#修改上一次提交)，可以更改文件，使用 `git commit --amend` 更改提交，提交之后使用 `git rebase --continue` 进入下一个标记为 `edit` 的提交，假如没有冲突且全部更改完成，将成功退出。

```bash
➜ history-repo git:(ae2a4c8) ✗ git commit --amend -m "commit from rebase"
[detached HEAD 5e8e09e] commit from rebase
 Date: Thu Jan 1 23:12:01 2099 +0800
 1 file changed, 2 insertions(+)
➜ history-repo git:(5e8e09e) ✗ git rebase --continue
Successfully rebased and updated refs/heads/master.
➜ history-repo git:(master) ✗
```

此时查看 log，会发现 commit 信息已被修改，且 Hash 也 **重新计算**（Zsh 的命令提示符发生了变化）。改变历史，注定会影响现在，至少在 Git 系统中是如此处理的。

不难预见，在团队协作时，单个仓库内版本历史变更后，其他同步版本库的历史状态都会受到影响，在使用变基时需要各自协调好。关于 `rebase` 的文档 [在此](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E9%87%8D%E5%86%99%E5%8E%86%E5%8F%B2)，最后提醒：慎用 `rebase`。

## 面子工程

掌握了 Git 的时间密码，现在就可以实现 GitHub 打卡了，写个脚本自动刷小绿点
，要多少有多少（逃

![#b# GitHub 打卡](https://i.loli.net/2021/04/05/2PCbxRENKgFWyhM.png)

显然这是名副其实的面子工程，全年 365 天不休息并不是什么好习惯，强如 Linus 也有不工作的时间 ~~，如果不休假，就不会诞生 Git 了（逃~~

最后敬告：

> 打铁还需自身硬，评价永远都是基于客观因素，不能只惦记光鲜亮丽的外表。
