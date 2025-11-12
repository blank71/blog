---
layout: layouts/post.vto
openGraphLayout: /layouts/og_images.jsx
type: blog

title: "Mattermost v11 で PostgreSQL v13 が Drop された"
description: ""

date: "2025-11-12"
changelog:
  - summary: 初稿
    date: "2025-11-12"

draft: false
tags:
  - Mattermost
  - PostgreSQL
metas:
  title: "=title"
---

## 概要
Mattermost v11 から PostgreSQL v13 のサポートが終了した。

- [https://docs.mattermost.com/product-overview/mattermost-v11-changelog.html](https://docs.mattermost.com/product-overview/mattermost-v11-changelog.html)

> Support for PostgreSQL v13 has been removed. The new minimum PostgreSQL version is v14+. See the [minimum supported PostgreSQL version policy](https://docs.mattermost.com/deployment-guide/software-hardware-requirements.html#minimum-postgresql-database-support-policy) documentation for details.


最低のサポートバージョンは PostgreSQL v14 となる。
データベースをダンプし、PostgreSQL v17 にインポートすることで問題を解決した。

DB の更新は初めてなので、記録する。

## 環境
[mattemost/docker](https://github.com/mattermost/docker/tree/74f80e51e0b279b6703506f004a7565055d87d37) を用いて Docker Compose で動作させている。

下記が更新前のバージョンである。

```console
$ cat .env | grep -E "^(POSTGRES_IMAGE_TAG|MATTERMOST_IMAGE_TAG)"
POSTGRES_IMAGE_TAG=13-alpine
MATTERMOST_IMAGE_TAG=release-11
```

## エラー内容
Mattermost v11 に更新して起動すると Mattermost コンテナから PostgreSQL を v14 以上にするようにエラーが出力される。

簡単のためにエイリアスを作成する。

```bash
alias mm="docker compose -f ~/container/mattermost/docker-compose.yml -f ~/container/mattermost/docker-compose.without-nginx.yml --env-file ~/container/mattermost/.env"
```

起動すると下記のエラーが出力される。

```console
$ mm up
...
mattermost-1  | Error: failed to initialize platform: cannot create store: error while checking DB version: minimum Postgres version requirements not met. Found: 13.22, Wanted: 14.0
```

## 対応
[Upgrade from 10 to 11 postgres update from v.13 db restore issue](https://forum.mattermost.com/t/upgrade-from-10-to-11-postgres-update-from-v-13-db-restore-issue/25320) を参考に DB をダンプして PostgreSQL v17 にインポートする。

既存のデータベースをバックアップしておく。

```bash
mm down
cp -a volumes/db{,-$(date -I)}
```

PostgreSQL コンテナを起動してダンプする。

```bash
export $(cat .env | grep -e "^POSTGRES_USER")
export $(cat .env | grep -e "^POSTGRES_DB")
mm up -d postgres
mm exec -it postgres pg_dump ${POSTGRES_DB} -U ${POSTGRES_USER} --no-privileges > ./postgres13-update-backup.sql
mm down
```

PostgreSQL を v17 に更新して、ダンプしたデータをインポートする。

まず PostgreSQL を v17 に更新する。

```bash
perl -pi -e 's|^(POSTGRES_IMAGE_TAG)=.*|$1=17-alpine|' .env
```

バージョンを確認する。

```console
$ cat .env | grep -E "^(POSTGRES_IMAGE_TAG|MATTERMOST_IMAGE_TAG)"
POSTGRES_IMAGE_TAG=17-alpine
MATTERMOST_IMAGE_TAG=release-11
```

既存のデータベースを削除して、新しい PostgreSQL v17 コンテナを起動し、ダンプしたデータをインポートする。

```bash
rm volumes/db -rf
mm up -d postgres
mm exec -it postgres dropdb ${POSTGRES_DB} -U ${POSTGRES_USER}
mm exec -it postgres createdb ${POSTGRES_DB} -U ${POSTGRES_USER}
mm exec -T postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} < ./postgres13-update-backup.sql
mm down
```

これで v17 に移行が完了した。起動して確認する。

```bash
mm up -d 
mm ps
mm logs -f
```

`curl` コマンドで HTTP ステータスコードが 200 であることを確認する。

```console
$ export $(cat .env | grep -E "^APP_PORT")
$ curl -s -o /dev/null -w "%{http_code}\n" localhost:${APP_PORT}
200
```

## メモ
- [Mattermost v11 Changes in Free Offerings](https://forum.mattermost.com/t/mattermost-v11-changes-in-free-offerings/25126)

上記に書かれているように、GitLab Omnibus に Mattermost が同梱されなくなる。
そして Mattermost v11 の Team Edition から GitLab SSO が削除される。
GitLab Omnibus の Mattermost を利用している場合は移行の検討が必要である。
