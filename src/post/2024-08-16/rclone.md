---
layout: layouts/post.vto
type: blog

title: "Windows で rclone を使う"
description: "Windows で rclone を使う"

date: '2024-08-18'

draft: false
tags:
  - rclone
metas:
  title: "=title"
---

Windows で rsync 環境を構築するのが面倒だったので rclone を用いる。

# 背景

Linux 環境に配置してあるファイルを Windows 環境にコピーするときに、Windows 上の
WSL 環境の rsync を利用していた。しかし、WSL
を使用すると少なくないメモリを確保してしまう。毎回、WSL を利用したあとは WSL
環境を終了させていた。WSL で OS
を動かさずにコンテナを動かせばメモリ消費量は抑えられる気配があるが、そもそも
Windows 上で rsync のようなコマンドが使用できれば便利である。sftp
を利用する案があるが、対話形式ではない、かつ差分コピーがあると嬉しい。そのため
rclone を利用する。

# install

winget を用いてインストールする。

```
winget Rclone.Rclone
```

# rclone config

rclone を使用するためには config を設定する必要があるとのこと。`rclone config`
でコンフィグウィザードが立ち上がり、対話形式で設定することができる。`sftp`
を指定し、ssh
に必要な鍵を指定する等を行う。対話形式で設定した結果、設定ファイルは下記のようになった。

```
[some-source]
type = sftp
host = some-host
user = some-user
pubkey_file = ~/.ssh/some-host.pub
```

# rclone copy

ソースからファイルをコピーする場合は下記のようにする。

```
rclone copy --verbose some-source:/some/dir .
```

デフォルトで差分コピーしてくれる。
