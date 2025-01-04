---
layout: layouts/post.vto
openGraphLayout: /layouts/og_images.jsx
type: blog

title: "Scala のコレクションについて勉強した"
description: ""

date: '2025-01-05'
changelog:
  - summary: 初稿
    date: "2025-01-05"

draft: false
tags:
  - Scala
metas:
  title: "=title"
---
Scala に関して勉強する講義があり、そこでコレクションについて勉強した。成果物があるので紹介をする。加えて編集後記というか雑記を残しておく。

## 参考文献
講義の参考書として Scala スケーラブルプログラミング 第 4 版を使用した。この本は Scala 3 に対応していないものの、コレクションの章に関しては Scala 3 で問題なく実行することができた。

- Scalaスケーラブルプログラミング 第4版
  - [https://book.impress.co.jp/books/1119101190](https://book.impress.co.jp/books/1119101190)

Scala の公式サイトに上記の構成や文がほとんど同じ日本語で書かれた文献がある。こちらは Scala 2.8 の時代のもので、上記の文献は Scala 2.13 に対応を謳っているため、こちらの文献の方が古い。

- [https://docs.scala-lang.org/ja/overviews/collections/introduction.html](https://docs.scala-lang.org/ja/overviews/collections/introduction.html)
  - 2025-01-05 参照

同じく Scala の公式サイトに英語で書かれた文献がある。こちらは Scala 2.13 のときにリニューアルされたページであり、Scala 3 のコードも掲載されている。ほとんど [https://docs.scala-lang.org/ja/overviews/collections/introduction.html](https://docs.scala-lang.org/ja/overviews/collections/introduction.html) と違いがないので、コピーしてきて修正をすれば良さそうな雰囲気がある。スケーラブルプログラミングはこれを訳したものだと思われる。

- [https://docs.scala-lang.org/overviews/collections-2.13/introduction.html](https://docs.scala-lang.org/overviews/collections-2.13/introduction.html)
  - 2025-01-05 参照

## 成果物
成果物は [https://github.com/blank71/scala-learn](https://github.com/blank71/scala-learn) で公開している。
### スライド
講義で発表するため、コレクションについて `scala` REPL 上で動作確認を行ったものを表示しながら説明を行うスライドを作成した。PowerPoint ではなくて Typst と呼ばれる組版システムを初めて用いた。見た目やオブジェクトの配置に意識を取られることなく、簡単にコードを貼ることができるため効率的にスライドを作成することができた。今回はどちらかというと PowerPoint が向いているアニメーションや図を多用するものでなかったため最適な手段だった。テキストデータとして持っておけるのも良い。

### コード
`scala` REPL での実行は試行錯誤する場合や動作を表示したりするのに便利。しかし他の人が同じコードで動作確認をしたいときにコピーペーストを行う必要がある。そのためコードとして振る舞いを確認できるようにした。実行すると下記のようになる。イミュータブルとミュータブルの Set では挙動が異なることが分かる。

- `src/Set-trait.scala`
```scala
object SetTrait {
  def make_title(title: String): String = s"// *** $title ***"
  def section(title: String, x: () => Unit) = {
    println(make_title(title))
    x()
    println(make_title(title) + "\n")
  }
  def main(args: Array[String]) = {
    // https://docs.scala-lang.org/overviews/collections-2.13/sets.html
    {
      section(
        "イミュータブル Set に要素を追加",
        () => {
          // val だと変更できない
          var s = collection.immutable.Set(1, 2, 3)
          println(s"var s = collection.immutable.Set(1, 2, 3) = ${s}")
          println(s"s += 4")
          println(s += 4)
          println(s"s -= 2")
          println(s -= 2)
          println(s"s = ${s}")
        }
      )
    }
    {
      section(
        "ミュータブル Set に要素を追加",
        () => {
          var s = collection.mutable.Set(1, 2, 3)
          println(s"val s = collection.mutable.Set(1, 2, 3) = ${s}")
          println(s"s += 4")
          println(s += 4)
          println(s"s -= 2")
          println(s -= 2)
          println(s"s = ${s}")
        }
      )
    }
  }
}
```

```bash
$ scala-cli run . --server=false --main-class SetTrait
// *** イミュータブル Set に要素を追加 ***
var s = collection.immutable.Set(1, 2, 3) = Set(1, 2, 3)
s += 4
()
s -= 2
()
s = Set(1, 3, 4)
// *** イミュータブル Set に要素を追加 ***

// *** ミュータブル Set に要素を追加 ***
val s = collection.mutable.Set(1, 2, 3) = HashSet(1, 2, 3)
s += 4
HashSet(1, 2, 3, 4)
s -= 2
HashSet(1, 3, 4)
s = HashSet(1, 3, 4)
// *** ミュータブル Set に要素を追加 ***
```
