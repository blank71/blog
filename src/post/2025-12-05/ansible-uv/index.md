---
layout: layouts/post.vto
openGraphLayout: /layouts/og_images.jsx
type: blog
title: Ansible 環境を Rye から uv に移行する
date: 2025-12-05
changelog:
  - summary: 初稿
    date: '2025-12-05'
draft: false
tags:
  - Ansible
  - Rye
  - uv
---

> [!NOTE]
> この記事は [Ansible - Qiita Advent Calendar 2025](https://qiita.com/advent-calendar/2025/ansible) の 5 日目の記事です。
> 
> 4 日目の記事は [Ansible x AI = AIOps](https://irixjp.github.io/stuff/2025-11-30-123945.advent_calendar_ansible_2025.html) でした。

Ansible 環境を Rye で構築していたが、Rye は開発中止になり uv に移行することがアナウンスされているため、uv に移行した。


## 導入
[既存 Ansible Playbook 改善 - Rye による Python パッケージ管理と ansible-lint による静的解析](https://blog.blank71.com/post/2024-09-24/ansible/) では Rye を用いて Ansible 環境を構築していた。

> Rye is no longer developed. We encourage all users to use [uv](https://docs.astral.sh/uv/), the [successor project](https://lucumr.pocoo.org/2024/8/21/harvest-season/) from the same maintainers, which is actively maintained and much more widely used.

https://github.com/astral-sh/rye では上記のように Rye の開発中止と uv への移行が案内されている。

uv は Rye と同様に Python の依存パッケージとプロジェクトを管理するツールである。
依存パッケージを宣言的に管理することができ、簡単に環境構築を行うことができる。

## インストール
インストールは下記を実行することで可能である。

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Rye では下記のようにサイレントインストールする際に変数を指定する必要があったが uv では不要になっていた。

```bash
curl -sSf https://rye.astral.sh/get | RYE_INSTALL_OPTION="--yes" bash
```

下記のようにユーザー領域にインストールされる。

```console
$ which uv
~/.local/bin/uv

$ which uvx
~/.local/bin/uvx

$ uv --version
uv 0.9.9
```

シェル補完スクリプトも提供されており、下記のようにして生成することができる。

```bash
mkdir -p ~/.local/share/bash-completion/completions
uv generate-shell-completion bash > ~/.local/share/bash-completion/completions/uv.bash
```

## uv 環境作成
試しに uv で新規プロジェクトを作成してみる。下記のような構成になる。

```console
$ uv init uv-test
$ cd uv-test

$ tree . -a -L 1
.
├── .git
├── .gitignore
├── main.py
├── pyproject.toml
├── .python-version
└── README.md

1 directory, 5 files
```

依存パッケージをインストールして環境を構築する場合は下記のようにする。`uv.lock` と `.venv` が作成されていることが分かる。

```console
$ uv sync
Using CPython 3.14.0
Creating virtual environment at: .venv
Resolved 1 package in 1ms
Audited in 0.00ms

$ tree . -a -L 1
.
├── .git
├── .gitignore
├── main.py
├── pyproject.toml
├── .python-version
├── README.md
├── uv.lock
└── .venv

2 directories, 6 files
```

`uv.lock` を更新せずに環境を構築する際は `uv sync --frozen` を実行する必要がある。
個人的には、lock ファイルは明示的に更新するとき以外は固定しておいて欲しい。

Rye では `requirements.lock` と `requirements-dev.lock` が作成されていたが、uv では `uv.lock` のみになった。

```diff
  .python-version
  pyproject.toml
- requirements-dev.lock
- requirements.lock
+ uv.lock
```

`pyproject.toml` に `name` と `version` 指定がないとエラーになる。Ansible を実行するだけならば必要ないように感じられるが、uv 移行に伴い必要になる。

```toml {.filename="pyproject.toml"}
[project]
name = "user-playbook"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
    "ansible-core==2.16.14",
    "ansible-lint==25.9.2",
]
```

参考に Rye での設定を下記に示す。`tool.rye` テーブルは必要な項目だったのかは定かではないが、uv では不要である。

```toml {.filename="pyproject.toml"}
[project]
requires-python = ">=3.13"
dependencies = [
    "ansible-core==2.16.14",
    "ansible-lint==25.9.2",
]

[tool.rye]
managed = true
virtual = true
dev-dependencies = []
```

依存パッケージの追加は下記のようにする。これを実行すると自動的に `uv.lock` が更新される。

```bash
uv add "ansible-core==2.16.14" "ansible-lint==25.9.2"
```

`.venv` に入らずに ansible コマンドを実行する場合は下記のようにする。
`rye run` だった部分を単純に `uv run` に置き換えれば良い。

```bash
$ uv run ansible --version
ansible [core 2.16.14]
```

## Rye アンイストール
Rye の環境を削除する場合は下記のようにすればよい。

Rye 本体は `~/.rye` にインストールされている。

```console
$ rm -rf ~/.rye
```

パス設定を行っている場合は設定を削除する。

```bash
vim ~/.bashrc
# 下記の行を削除する
# source "$HOME/.rye/env"
```

シェル補完スクリプトを生成していた場合は削除する。

```bash
rm ~/.local/share/bash-completion/completions/rye.bash
```

## CI 
`ansible-lint` の実行をしているのみの CI において 1 分 30 秒ほどの実行時間を 1 分程度に短縮することができた。
Rye から uv に置き換えたのみで、それ以外のことはしていない。
