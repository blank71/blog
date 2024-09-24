---
layout: layouts/post.vto
openGraphLayout: /layouts/og_images.jsx
type: blog

title: "既存 Ansible Playbook 改善"
description: "Rye による Python パッケージ管理と ansible-lint による静的解析"

date: '2024-09-24'
changelog:
  - summary: 初稿
    date: "2024-09-24"

draft: false
tags:
  - Ansible
  - ansible-lint
  - ansible-playbook
  - Rye
metas:
  title: "=title"
---

## 簡単な何か

- Rye による Python パッケージの管理と利用方法
- Ansible の簡単な使い方
- ansible-lint
- 既存実装に対する改善内容
- Ansible のディレクトリ構成

## 目的
現在、私が所属している学生有志団体では一部の環境作成に Ansible を利用している。
特権昇格可能なユーザーであるかどうかの設定など、ユーザー管理が主な利用内容である。
それ以外のものについてはメンバーの学習のためという側面があり、手順書とぬくもりのある手作業で成り立っている。
Ansible を利用すると環境構築が簡単になるのは分かるが、一番根底にある部分をブラックボックス化してしまうため、このような運用になっている。
組織の既存の Ansible のコードは冪等性が保証されていない部分があり、かつ、あるユーザーを削除する操作の手順が複雑で難解になっていた。
Ansible の実行者のオペミスによって、ユーザーが復活してしまう状況にあった。
私も過去にオペミスによってユーザーを死者蘇生してしまった。
私は Ansible について学習すると共に、この問題を解決することにした。

## 裏の目的
インターンという名のバイトをしている。
そこでは Google Cloud 上にあるインフラを Terraform のコードに落とし込む部分を担当している。
おそらく Terraform で管理したい部分については網羅することができた。
面白い点としては Terraform ではなく [CDKTF](https://developer.hashicorp.com/terraform/cdktf)と呼ばれる TypeScript や Go などの
プログラミング言語で Terraform を記述することができるツールを利用している。
インターン先は Go 言語に技術スタックを寄せているようなので、このような技術選定になっているらしい。
GitHub Actions を用いて自動的に Terraform が実行されるようにする部分も担当した。
この経験を踏まえて Infrastructure as Code の分類に該当する他のツールである Ansible について勉強したいと思った。

## 環境

全て AlmaLinux 9。

```
$ cat /etc/os-release | grep PRETTY_NAME
PRETTY_NAME="AlmaLinux 9.4 (Seafoam Ocelot)"
```

## deploy ユーザー作成

ansible の実行ユーザーとして各サーバーで deploy ユーザーを作成する。

```
mkdir -p /home/users
groupadd -g 1200 deploy
useradd -g deploy -u 1200 -c "ansible deploy" -d /home/users/deploy deploy
usermod -aG wheel deploy
passwd deploy
# 適当なぱすわど
```

## Ansible

各サーバーのユーザー制限を管理するために deploy ユーザーの環境に Ansible をインストールする。

### Rye

Python と Python パッケージを管理するために Rye を使用する。

[https://rye.astral.sh/](https://rye.astral.sh/)

#### インストール

ユーザー権限でインストールすることができる。
`RYE_INSTALL_OPTION="--yes"` で自動的にインストールが完了する。
インストール時に設定を行いたい場合はオプションの部分を除外する。

```
curl -sSf https://rye.astral.sh/get | RYE_INSTALL_OPTION="--yes" bash
```

パスを通す。

```
echo 'source "$HOME/.rye/env"' >> ~/.bashrc
```

Bash の補完を行う設定をする。

```
mkdir -p ~/.local/share/bash-completion/completions
rye self completion > ~/.local/share/bash-completion/completions/rye.bash
```

ドキュメント執筆時のバージョン情報。

```
$ rye --version
rye 0.39.0
commit: 0.39.0 (bf3ccf818 2024-08-21)
platform: linux (x86_64)
self-python: cpython@3.12.5
symlink support: true
uv enabled: true
```

#### プロジェクトの作成

このプロジェクトは Python プロジェクトではなく、ansible-playbook が動作すれば良いため `--virtual` オプションを指定する。

```
rye init . --virtual
```

直後のファイル構成は下記である。

```
$ tree -a -L 1
.
├── .git
├── .gitignore
├── pyproject.toml
├── .python-version
└── README.md

1 directory, 4 files
```

`pyproject.toml` は最低限の設定で良く、project name や project version 等は必要ないため下記で良い。

```
cat << '_EOF_' > ./pyproject.toml
[project]
dependencies = []
requires-python = ">= 3.8"

[tool.rye]
managed = true
virtual = true
dev-dependencies = []
_EOF_
```

`ansible-core`、`ansible-lint` を使用するパッケージとして追加する。
依存関係を薄くしたいので、それ以外は追加しないことにしている。
組織内では RHEL8 なディストリビューションも存在している。
そこでは Python 3.6 を利用している。
ansible-core のバージョン 2.17 以降は [Python 3.6 がサポートされていない](https://docs.ansible.com/ansible/latest/reference_appendices/release_and_maintenance.html)ため 2.17 未満を使用する。

```
rye add "ansible-core<2.17" "ansible-lint"
```

依存関係は下記のように記述される。

```
cat << '_EOF_' > ./pyproject.toml
[project]
dependencies = [
    "ansible-core<2.17",
    "ansible-lint>=24.9.2",
]
requires-python = ">= 3.8"

[tool.rye]
managed = true
virtual = true
dev-dependencies = []
_EOF_
```

下記で依存パッケージを環境にインストールすることができる。
`--no-lock` オプションを指定して lock ファイルを更新しないようすることができる。
パッケージ群を更新する際はオプションを指定せずに実行する。

```
rye sync --no-lock
```

バージョン情報は下記になった。

```
$ rye run ansible-lint --version
ansible-lint 24.9.2 using ansible-core:2.16.11 ansible-compat:24.9.1 ruamel-yaml:0.18.6 ruamel-yaml-clib:0.2.8
```

## inventory

ここから Ansible について入門する。
各コマンドで `rye run` から利用しているが、省略している。
(というか、rye の手順はこれらの手順より後に追加している)

inventory ファイルは管理対象であるマネージドノードの情報を記述する。
INI 形式で記述する場合は下記のようになる。
YAML 形式で記述することも可能。
すべてのマネージドノードは暗黙的に all グループに所属している。

```
cat << '_EOF_' > ./inventory
[controle]
cont ansible_host=192.168.122.123

[manage]
manage01 ansible_host=192.168.122.175
_EOF_
```

下記のようにグループに親子関係を作ることができる。
複数のマネージドノードを作成するのが面倒だったため、横着して指定している。

```
cat << '_EOF_' > ./inventory
[all:children]
controle
manage

[controle]
cont ansible_host=192.168.122.123

[manage]
manage01 ansible_host=192.168.122.175
manage02 ansible_host=192.168.122.175
_EOF_
```

YAML 形式では下記のように記述できる。

```
all:
  children:
    controle:
    manage:
  vars:
    ansible_ssh_user: deploy

controle:
  hosts:
    cont:
      ansible_host: 192.168.122.123

manage:
  hosts:
    manage01:
      ansible_host: 192.168.122.175
    manage02:
      ansible_host: 192.168.122.175

```

下記のコマンドで inventory がどのように読み込まれているのか確認することができる。

```
$ ansible-inventory --list
{
    "_meta": {
        "hostvars": {
            "cont": {
                "ansible_host": "192.168.122.123",
                "ansible_ssh_user": "deploy"
            },
            "manage01": {
                "ansible_host": "192.168.122.175",
                "ansible_ssh_user": "deploy"
            },
            "manage02": {
                "ansible_host": "192.168.122.175",
                "ansible_ssh_user": "deploy"
            }
        }
    },
    "all": {
        "children": [
            "ungrouped",
            "controle",
            "manage"
        ]
    },
    "controle": {
        "hosts": [
            "cont"
        ]
    },
    "manage": {
        "hosts": [
            "manage01",
            "manage02"
        ]
    }
}
```

## ansible.cfg

ansible 実行時にコマンドライン引数として指定しなくともコンフィグファイルとして指定することができる [https://docs.ansible.com/ansible/latest/reference_appendices/config.html](https://docs.ansible.com/ansible/latest/reference_appendices/config.html)。
`log_path` を指定すると該当のファイル名でログファイルを作成してくれる。
実行ログがログファイルに追記されていく。
デフォルトの設定ではログファイルが作成されないため設定しておくべきだろう。
`host_key_checking` はデフォルトで `true` ではある。

```
cat << '_EOF_' > ./ansible.cfg
[defaults]
inventory=./inventory
log_path=./ansible.log
host_key_checking = true
_EOF_
```

基本的な準備ができたので試しに実行してみる。

## ping 

ping を行う playbook を作成する。
all グループに対して実行する。

```
mkdir -p 01-ping
cat << '_EOF_' > 01-ping/ping.yaml
---
- name: My first play
  hosts: all
  tasks:
    - name: Ping my hosts
      ansible.builtin.ping:

    - name: Print message
      ansible.builtin.debug:
        msg: Hello world
_EOF_
```

実行する。

```
$ ansible-playbook 01-ping/ping.yaml

PLAY [Exec ping] **********************************************************

TASK [Gathering Facts] ****************************************************
ok: [cont]
ok: [manage02]
ok: [manage01]

TASK [Ping my hosts] ******************************************************
ok: [manage01]
ok: [manage02]
ok: [cont]

TASK [Print message] ******************************************************
ok: [manage01] => {
    "msg": "Hello world"
}
ok: [manage02] => {
    "msg": "Hello world"
}
ok: [cont] => {
    "msg": "Hello world"
}

PLAY RECAP ****************************************************************
cont                       : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage01                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage02                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

対象グループを変更してみる。
manage のみを対象にする。

```
cat << '_EOF_' > 01-ping/ping.yaml
---
- name: My first play
  hosts: manage
  tasks:
    - name: Ping my hosts
      ansible.builtin.ping:

    - name: Print message
      ansible.builtin.debug:
        msg: Hello world
_EOF_
```

実行する。

```
$ ansible-playbook 01-ping/ping.yaml

PLAY [My first play] **********************************************************

TASK [Gathering Facts] ********************************************************
ok: [manage02]
ok: [manage01]

TASK [Ping my hosts] **********************************************************
ok: [manage02]
ok: [manage01]

TASK [Print message] **********************************************************
ok: [manage01] => {
    "msg": "Hello world"
}
ok: [manage02] => {
    "msg": "Hello world"
}

PLAY RECAP ********************************************************************
manage01                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage02                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

-l オプションで実行先のノードまたはグループを指定することができるが、hosts で指定されたノードまたはグループからしか指定することができない。
例えば、cont は manage グループに属していないため指定することができない。

```
$ ansible-playbook 01-ping/ping.yaml -l cont

PLAY [My first play] **********************************************************
skipping: no hosts matched

PLAY RECAP ********************************************************************

$ ansible-playbook 01-ping/ping.yaml -l controle

PLAY [My first play] **********************************************************
skipping: no hosts matched

PLAY RECAP ********************************************************************

$ ansible-playbook 01-ping/ping.yaml -l manage01

PLAY [My first play] **********************************************************

TASK [Gathering Facts] ********************************************************
ok: [manage01]

TASK [Ping my hosts] **********************************************************
ok: [manage01]

TASK [Print message] **********************************************************
ok: [manage01] => {
    "msg": "Hello world"
}

PLAY RECAP ********************************************************************
manage01                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

## whoami

whoami を実行して ansible の実行環境上で得られた出力を出力する。
`ansible.builtin.shell` でシェルに対してコマンドを実行する。
何も変更しない場合は `changed_when` に `false` を設定する。
設定しないと ansible-lint に怒られる。
得られた標準出力を ansible の実行環境上で出力する。

```
mkdir -p 02-get-status
cat << '_EOF_' > 02-get-status/whoami.yaml
---
- name: Whoami
  hosts: all
  tasks:
    - name: Run
      ansible.builtin.shell: echo $(whoami)
      changed_when: false
      register: out

    - name: Print
      ansible.builtin.debug:
        msg: "{{ out.stdout }}"
_EOF_
```

実行する。

```
$ ansible-playbook 02-get-status/whoami.yaml

PLAY [Whoami] ******************************************************************

TASK [Gathering Facts] *********************************************************
ok: [manage02]
ok: [manage01]
ok: [cont]

TASK [Run] *********************************************************************
ok: [cont]
ok: [manage02]
ok: [manage01]

TASK [Print] *******************************************************************
ok: [cont] => {
    "msg": "deploy"
}
ok: [manage01] => {
    "msg": "deploy"
}
ok: [manage02] => {
    "msg": "deploy"
}

PLAY RECAP *********************************************************************
cont                       : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage01                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage02                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

## VERSION_ID

`/etc/os-release` から VERSION_ID を grep する。
パイプで出力を繋ぐ場合は `set -o pipefail` を設定することでパイプの途中でコマンドの実行に失敗したときに、そのコマンドの終了コードを返す。
Ansible の実行において終了コードを正しく得ることは大事である。
設定しないと ansible-lint に怒られる。

```
mkdir -p 02-get-status
cat << '_EOF_' > 02-get-status/version_id.yaml
---
- name: Get VERSION_ID
  hosts: all
  tasks:
    - name: Get
      ansible.builtin.shell: set -o pipefail && cat /etc/os-release | grep VERSION_ID
      changed_when: false
      register: out

    - name: Print
      ansible.builtin.debug:
        msg: "{{ out.stdout }}"
_EOF_
```

実行する。

```
$ ansible-playbook 02-get-status/version_id.yaml

PLAY [Get VERSION_ID] **********************************************************

TASK [Gathering Facts] *********************************************************
ok: [cont]
ok: [manage02]
ok: [manage01]

TASK [Get] *********************************************************************
ok: [cont]
ok: [manage01]
ok: [manage02]

TASK [Print] *******************************************************************
ok: [cont] => {
    "msg": "VERSION_ID=\"9.4\""
}
ok: [manage01] => {
    "msg": "VERSION_ID=\"9.4\""
}
ok: [manage02] => {
    "msg": "VERSION_ID=\"9.4\""
}

PLAY RECAP *********************************************************************
cont                       : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage01                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage02                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

## Gathering Facts

ansible 実行時に `Gathering Facts` として対象のマネージドノードの情報を収集する。
デフォルトでは playbook を実行時に初めに収集する。
下記で具体的な値を確認することができる。

```
ansible all -m ansible.builtin.setup
```

playbook の中では下記のようにして参照することができる。

```
mkdir -p 02-get-status
cat << '_EOF_' > 02-get-status/ansible_facts.yaml
---
- name: Get facts
  hosts: all
  tasks:
    - name: Print ansible_distribution
      ansible.builtin.debug:
        msg: "{{ ansible_distribution }}"

    - name: Print ansible_distribution_version
      ansible.builtin.debug:
        msg: "{{ ansible_distribution_version }}"
_EOF_
```

実行する。

```
$ ansible-playbook 02-get-status/ansible_facts.yaml

PLAY [Get facts] ***************************************************************

TASK [Gathering Facts] *********************************************************
ok: [manage02]
ok: [manage01]
ok: [cont]

TASK [Print ansible_distribution] **********************************************
ok: [cont] => {
    "msg": "AlmaLinux"
}
ok: [manage01] => {
    "msg": "AlmaLinux"
}
ok: [manage02] => {
    "msg": "AlmaLinux"
}

TASK [Print ansible_distribution_version] **************************************
ok: [cont] => {
    "msg": "9.4"
}
ok: [manage01] => {
    "msg": "9.4"
}
ok: [manage02] => {
    "msg": "9.4"
}

PLAY RECAP *********************************************************************
cont                       : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage01                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage02                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

これを用いると VERSION_ID を cat して grep するという playbook を記述する必要がない。
`Gathering Facts` の実行が必要がない場合は `gather_facts: false` を指定することで実行されないようになる。
ansible 全体の設定として実行されないようにする場合は `ansible.cfg` の `[defaults]` セクションに `gathering = explict` を設定する。
`explict` を設定すると全体では `Gathering Facts` を実行せず、必要のある playbook で都度有効にすることができる。
色々な Ansible の運用の記事を読んでみると、ベストプラクティスとして `explict` を指定している例が多い。
確かに `Gathering Facts` が必要になることはそこまで多くないはずで、このような運用の方が理にかなっていると感じる。

```
mkdir -p 02-get-status
cat << '_EOF_' > 02-get-status/ansible_facts.yaml
---
- name: Get facts
  hosts: all
  gather_facts: true ### here
  tasks:
    - name: Print ansible_distribution
      ansible.builtin.debug:
        msg: "{{ ansible_distribution }}"

    - name: Print ansible_distribution_version
      ansible.builtin.debug:
        msg: "{{ ansible_distribution_version }}"
_EOF_

cat << '_EOF_' > ansible.cfg
[defaults]
inventory=./inventory
log_path=./ansible.log
host_key_checking = true
gathering = explicit ### here
_EOF_
```

## add user

ユーザーを追加してみる。
ユーザーの追加は特権が必要になる。
特権が使用可能なユーザーと特権昇格のためのパスワードの入力が必要になる。

```
mkdir -p 03-user_create
cat << '_EOF_' > 03-user_create/add_user.yaml
---
- name: Setup local users
  hosts: all
  tasks:
    - name: Check exists
      become: true
      ansible.builtin.user:
        name: ansible-test
_EOF_
```

実行する。
実行時に特権昇格に使用するパスワードを入力するためのオプション `--ask-become-pass` を指定する必要がある。
`ansible.cfg` ファイルで設定することもできるが、特権昇格の必要がない playbook でもパスワードの入力が求められてしまう。
そのため、`ansible.cfg` ファイルで指定しない。
既に環境への適用が完了しているため `changed` が 0 になっている。

```
$ ansible-playbook 03-user_create/add_user.yaml --ask-become-pass
BECOME password: ### put passwd here

PLAY [Setup local users] **********************************************************************************************************************************

TASK [Gathering Facts] ************************************************************************************************************************************
ok: [cont]
ok: [manage01]
ok: [manage02]

TASK [Check exists] ***************************************************************************************************************************************
ok: [cont]
ok: [manage02]
ok: [manage01]

PLAY RECAP ************************************************************************************************************************************************
cont                       : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage01                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
manage02                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

## role

ロールを利用することで Playbook の処理にまとまりを作ることができる。
ロールを作成する。

```
mkdir -p 04-role/roles/user_create/tasks
cat << '_EOF_' > 04-role/roles/user_create/tasks/main.yml
---
- name: Say Hello
  ansible.builtin.debug:
    msg: "Hello"
_EOF_

cat << '_EOF_' > 04-role/user_create.yml
---
- name: Exec user_create
  hosts: all
  tasks:
    - name: Import user_create
      ansible.builtin.import_role:
        name: user_create
_EOF_
```

実行は下記のようにする。

```
ansible-playbook 04-role/user_create.yml
```

## Ansible Playbook 改善

基本を抑えたので既存の playbook を ansible-lint に則りつつ、リファクタリングした。

### check ansible-lint

既存の playbook を ansible-lint で解析してみると、何を直すべきなのか教えてくれる。

```
$ ansible-lint
...
Read documentation for instructions on how to ignore specific rule violations.

                      Rule Violation Summary
 count tag                        profile    rule associated tags
     2 schema[vars]               basic      core
    22 name[play]                 basic      idiom
     3 var-naming[no-role-prefix] basic      idiom
     8 var-naming[non-string]     basic      idiom
   704 yaml[comments]             basic      formatting, yaml
    96 yaml[empty-lines]          basic      formatting, yaml
   386 yaml[indentation]          basic      formatting, yaml
     1 yaml[key-duplicates]       basic      formatting, yaml
     6 yaml[line-length]          basic      formatting, yaml
     6 yaml[octal-values]         basic      formatting, yaml
   215 yaml[trailing-spaces]      basic      formatting, yaml
    17 yaml[truthy]               basic      formatting, yaml
    36 name[casing]               moderate   idiom
     5 risky-file-permissions     safety     unpredictability
     1 no-relative-paths          shared     idiom
    36 fqcn[action-core]          production formatting

Failed: 1544 failure(s), 0 warning(s) on 107 files. Last profile that met the validation criteria was 'min'.
```

具体的には難しいことはなく、ちまちま直せば良い。
今回は既存のコードを参考にしつつ、0 から書き直したので、実はあまり気にしていない。
何を直すべきなのか、いくつか載せておく。

- `name[casing]`: https://ansible.readthedocs.io/projects/lint/rules/name/
  - task と play に名前をつける必要がある。名前は大文字から始めなくてはいけない。
- `yaml[truthy]`: https://ansible.readthedocs.io/projects/lint/rules/yaml/
  - 真偽は `true|false` にする必要がある。Ansible のドキュメント的には `True|False` が使われている雰囲気があるが、ansible-lint のデフォルト設定になるべく寄せることにしたので `true|false` で統一していく。
- `fqcn[action-core]`: https://ansible.readthedocs.io/projects/lint/rules/fqcn/
  - 使用するモジュールは完全修飾コレクション名で表記される必要がある。`shell` ではなくて `ansible.builtin.shell` として表記する必要がある。

新しい実装では下記のように失敗と警告が 0 になっている。

```
$ ansible-lint
Passed: 0 failure(s), 0 warning(s) on 38 files. Last profile that met the validation criteria was 'production'.
```

ansible-lint で解析するファイルを指定することができる。
`ansible-lint` だけの場合は複数回参照されてしまい `107 files` のように実態のファイル数より多く表示されてしまう。
トップレベルの playbook を指定すると参照先まで自動的に解析してくれる。
新しい実装では既存実装と比較してファイルを削減して、かつ簡潔にすることができたと思う。
新しい実装では playbooks ディレクトリにまとめたので下記でいい感じに解析してくれる。

```
$ ansible-lint playbooks/*
Passed: 0 failure(s), 0 warning(s) on 17 files. Last profile that met the validation criteria was 'production'.

# ある playbook だけを解析する場合
$ ansible-lint playbooks/user_create.yml
Passed: 0 failure(s), 0 warning(s) on 3 files. Last profile that met the validation criteria was 'production'.
```

CI/CD で例えば `playbooks` だけを解析先として指定すると解析するファイルに漏れが出そうなので、ファイルを指定しない方が良いかと思う。

### ansible-playbook --check

ansible を実行する前に、どのような変更が適用されるのか確認することができる。
`ansible-playbook` コマンドのオプションとして `--check` を指定する。
これによって、対象のマネージドノードに対して変更が適用されず、何が変更されるのか、という情報を得ることができる。
意図しない変更が発生していないのか確認するときに有用。
特に問題がなければ `--check` を外して実行する。

### 改善内容

ユーザー作成と削除が別の playbook になっており、かつユーザーに関する設定がバラバラになっていた。

基本的なユーザー情報は下記のような形で一つのファイルにまとまっている。

```
- create_user: piyo
  uid: *****
  password: $6$SALT$*****
  groups: 
    - ssh
  pub_key: 
    - ssh-ed25519 *****
```

sudo が使えるかどうかの設定は、各マネージドノードごとにファイルが存在していて下記のような形になっている。
マネージドノードノードが 20 台存在したら、20 個のファイルが存在し、各ファイルに各ユーザーの設定が書かれている。

```
- user: piyo
  groups:
      - admin
```

これ以外にもユーザー作成/削除に関して、既存の実装には謎に複雑になっていた。
そのため、ユーザーに関する設定はファイル一つにまとめた。
ここからは新しく実装した内容になる。
ユーザーに関する変数は、他の playbook で参照する可能性があるため、role の vars ディレクトリに含めずに
`./vars` から参照するようにした。
下記が具体的なディレクトリ構成である。

```
$ tree . -L 2
.
├── ansible.cfg
├── ansible.log
├── inventory
├── playbooks
│   ├── ...
│   └── user_create.yml
├── pyproject.toml
├── README.md
├── requirements-dev.lock
├── requirements.lock
├── roles
│   ├── ...
│   └── user_create
└── vars
    └── user.yml
```

`playbooks/user_create.yml` では下記のようにして `vars/user.yml` を読み込んでいる。

```
---
- name: "Exec user_create"
  hosts: all
  become: true
  vars_files: ../vars/user.yml
  tasks:
    - name: "Import user_create"
      ansible.builtin.import_role:
        name: user_create
        vars_from: users
```

`vars/user.yml` ではユーザー情報は下記のような形になっている。
`state` でユーザーが存在する状態を維持したい場合は `present` を指定する。
ユーザーが存在しない状態を維持したい場合は `absent` を指定する。
`admin_hosts` では、指定のマネージドノード上で該当のユーザーを `admin` グループに属させることができる。
`groups` で `admin` を設定すると全てのマネージドノードで `admin` グループに属するため、`admin_hosts` の設定は特に意味はない。
`admin_hosts` で指定することによって、組織の新メンバーが特権を行使できるサーバーを制限している。

```
- create_user: piyo
  state: present
  uid: *****
  password: $6$SALT$*****
  groups:
    - ssh
    - admin
  pub_keys:
    - ssh-ed25519 *****
  admin_hosts: [
    'app01',
    'app02'
  ]
```

### まとめ

設定の変更が簡単になり、ディレクトリ構成も整理したので、あまり知識のない Ansible 実行者でもオペミスが発生しないようにすることができた。
Ansible で簡単に環境構築が行えるという嬉しさを実感を持って知ることができた。
