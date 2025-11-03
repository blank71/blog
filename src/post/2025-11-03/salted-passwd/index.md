---
layout: layouts/post.vto
openGraphLayout: /layouts/og_images.jsx
type: blog

title: "ソルトつきパスワードの生成と検証"
description: ""

date: "2025-11-03"
changelog:
  - summary: 初稿
    date: "2025-11-03"

draft: false
tags:
  - openssl
  - passwd
metas:
  title: "=title"
---

ソルトつきパスワードを生成する必要があったので、それのメモ。

```bash
cat << '_EOF_' > gen-pass.sh
#!/bin/bash

export SALT=$(openssl rand -hex 4)
echo -n "PASSWD: "
read -s PASSWD
echo ""
export HASHED=$(openssl passwd -6 -salt=$SALT $PASSWD)
echo ${HASHED}

unset PASSWD
_EOF_

chmod 744 gen-pass.sh
```

実行すると下記のようになる。`source` を使用して環境変数として `HASHED` に代入する。

```bash
% source ./gen-pass.sh
PASSWD:
$6$3b3010b8$QqVR7VOCyIpR0KdT8Yl18LMDEA0XrcTDVewXxXFkdQiekO.kgCIKW2i04/pIOQONs9ZE0SXEv.ihto/pjvYuY.

% echo $HASHED
$6$3b3010b8$QqVR7VOCyIpR0KdT8Yl18LMDEA0XrcTDVewXxXFkdQiekO.kgCIKW2i04/pIOQONs9ZE0SXEv.ihto/pjvYuY.
```

検証は下記のように行う。

```bash
cat << '_EOF_' > verify-pass.sh
#!/bin/bash

HASHED=${HASHED:-$1}

echo -n "PASSWD to verify: "
read -s PASSWD
echo ""

SALT=$(echo "$HASHED" | cut -d'$' -f3)
VERIFY=$(openssl passwd -6 -salt=$SALT "$PASSWD")

if [[ "$HASHED" = "$VERIFY" ]]; then
	echo "true"
else
	echo "false"
fi

unset PASSWD VERIFY
_EOF_

chmod 744 verify-pass.sh
```

実行結果は下記のようになる。

```bash
% ./verify-pass.sh ${HASHED}
PASSWD to verify:
true
```
