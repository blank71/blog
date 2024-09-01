---
layout: layouts/post.vto
openGraphLayout: /layouts/og_images.jsx
type: blog

title: "P3NFEST 2024 Summer"

date: '2024-09-01'
changelog:
  - summary: 初稿
    date: "2024-08-31"
  - summary: 微修正
    date: "2024-09-01"

draft: false
tags:
  - P3NFEST
  - Security
metas:
  title: "=title"
---

## P3NFEST 2024 Summer

IssueHunt 主催の
[P3NFEST 2024 Summer](https://issuehunt.jp/events/2024/summer/p3nfest)
に学生として現地参加した。
[#BBJP_Podcast](https://x.com/hashtag/BBJP_Podcast)
というバグバウンティのポッドキャストを興味本位で聞いており、こちらを運営している
[morioka12](https://x.com/scgajge12)
さん経由で今回のイベントについて知った。
セキュリティに関して触れるのは初めてなので、セキュリティ専門家たちが話すセキュリティの実態について実感を得たいと思い参加した。

## VulnUni

現地参加の特典として以下のハンズオンから抽選で 1 つを受講することができた。

- 脆弱性の探求：攻撃者の目線で校内ネットワークを探る, VulnHub - VulnUni
- 実践的なバグバウンティ入門
- ハッキング・ラブ！はじめてのハッキングをやってみよう
- ZAPを活用した脆弱性診断入門

私は、学部の学生有志のチームとして学部のコンピュータ資源の多くを管理している立場にある。
そのため、校内の LMS に対してどのように侵入を行って権限を取得するかについて知ることは大事だと考え、VulnUni のハンズオンを受講した。

事前準備として行ったことは次の通りである。

- 仮想化基盤として VMware Workstation をインストール。
- ペネトレーション基盤として Kali Linux を VMware 上の仮想マシンとしてインストール。
- ペネトレーション先として [VulnUni](https://www.vulnhub.com/entry/vulnuni-101,439/) をインストール。

便利のために私は Kali Linux に `openssh-server` サーバーと `xrdp` サーバーの環境を作成しておいた。
これで、手元のターミナルからコマンドが叩けるし、VMware のウィンドウではなく RDP で GUI を操作することができる。

ハンズオンの内容自体は公開されていないため詳細については書くことは避けるが、基本的には下記の Udemy のコースをベースにした内容だった。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">今回も用意しました。 <a href="https://twitter.com/hashtag/P3NFEST?src=hash&amp;ref_src=twsrc%5Etfw">#P3NFEST</a> ハンズオンにて実施した「VulnHub - VulnUni」の解説を含むUdemyコースの無料クーポンコードです。<br>先着100名まで。<br>コース取得後は、アカウントが有効で、かつUdemyがコースのライセンスを所有し続ける限り、学習期間の制限はありません。<a href="https://t.co/178QoWdNmz">https://t.co/178QoWdNmz</a> <a href="https://t.co/4phhTRluPN">pic.twitter.com/4phhTRluPN</a></p>&mdash; Noriaki Hayashi (@v_avenger) <a href="https://twitter.com/v_avenger/status/1829781540353818731?ref_src=twsrc%5Etfw">August 31, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

公開されている情報を理路整然と収集することで、脆弱性を発見することができ、複数の脆弱性を段階的に経由することで root 権限を取得することができた。

ハンズオンの前説が良いと感激した。
「皆さんには元来、潜在能力があるのだから、このハンズオンでは障害を取り除くことで実績を最大化します」といった内容であった。
スライドは下記である。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">2時間のハンズオンという限られた時間で何を伝えるべきなのか。それが今回のテーマでした。<br>そこで、『インナーゲーム』ティモシー・ガルウェイから「P=p-i」公式について紹介させていただきました。<br>この機会に、バグバウンティとして活躍するための「障害」について考えてみませんか。<a href="https://twitter.com/hashtag/P3NFEST?src=hash&amp;ref_src=twsrc%5Etfw">#P3NFEST</a> <a href="https://t.co/fwaxAdFcKC">pic.twitter.com/fwaxAdFcKC</a></p>&mdash; Noriaki Hayashi (@v_avenger) <a href="https://twitter.com/v_avenger/status/1829735196528463967?ref_src=twsrc%5Etfw">August 31, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

これよりも前に「不正アクセス行為の禁止等に関する法律」についての説明があり、法律は遵守しなければならない、という説明があった。
当たり前ではあるが、いくら強調しても強調しすぎることはない。

## 実践的なバグバウンティ入門

『実践的なバグバウンティ入門』の資料は公開されている。
あとで読み直したいためメモしておく。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">P3NFEST 2024 Summer のハンズオン講座『実践的なバグバウンティ入門』の一般公開用スライドを公開しました！ (非公開部分あり)<a href="https://twitter.com/hashtag/P3NFEST?src=hash&amp;ref_src=twsrc%5Etfw">#P3NFEST</a><a href="https://t.co/8QGiyo8yI4">https://t.co/8QGiyo8yI4</a></p>&mdash; morioka12 (@scgajge12) <a href="https://twitter.com/scgajge12/status/1829719509739147532?ref_src=twsrc%5Etfw">August 31, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

## 講演

午後はオンラインでも参加できるものになっている。
開始の挨拶にサプライズゲストとして
[徳丸浩](https://x.com/ockeghem)
先生が登場した。
印象深かった言葉としては、昨今は HackTheBox や TryHackMe など脆弱性を勉強することは可能であるが、作り物ではない天然の脆弱性についても触れていって欲しいというものであった。

### 脆弱星に導かれて

西村宗晃 (にしむねあ) さんの講演。

<script defer class="speakerdeck-embed" data-id="bebd84aa0fd94f87bd1f56a3d9e9a2db" data-ratio="1.7777777777777777" src="//speakerdeck.com/assets/embed.js"></script>

継続の大切さを説いていた。
セキュキャンの講師として はせがわようすけ さんから推薦いただいたが、他の参加者と比較して実績がなかった。
実績を作り、自信をつけるためにブラウザで脆弱性を見つける取り組みを行った。
脆弱性を見つけることができず、心が折れてしまったらセキュキャンの講師を辞退するつもりであった。
毎朝、脆弱性を見つける生活を続け、6 ヶ月後に初めて脆弱性を見つけることができた。
これをきっかけに自信がついて幾つもの脆弱性を見つけることができた。
実施したことは下記である。
- ソースコードを全部読む
- git diff で変更点を読む
- ビルドして動かす
- 報告されている脆弱性を自分の手で再現する
- 仕様を確かめる

講演を受けた感想として、やっぱり自分で手を動かし続けることが一番の力になることを実感した。

### ソフトバンクのセキュリティエンジニアからセキュリティの重要性

ソフトバンク人事の小野彰久さんの講演。

ソフトバンクの昔話から、今とこれから取り組んでいくことを話していた。
途上国ではスマホを持っている人はたくさんいるが、基地局の設置が砂漠環境だったりと難しい点が多い。
成層圏基地局「HAPS」で空からネットワークを提供する取り組みを行っている。
外国に頼らない国内インフラを強化しており、地政学的に分散も大切なので北海道の苫小牧にデータセンターを構築している。
最近注力しているのは AI 分野であり、SB Intuitions という会社を立ち上げて頑張っている。(私は注目しているがセキュリティ分野の学生たちはあまり知らないようだった。)
ソフトバンクの関連会社は数多くあり、全社横断的にセキュリティを維持したい人募集。

### とあるペンテスターたちの成長記録

- モデレーター
  - 洲崎 俊氏（三井物産セキュアディレクション 先端技術事業部 レッドチーム マネージャー）
- パネリスト
  - 山﨑 泉樹氏（NEC サイバーセキュリティ戦略統括部 プロフェッショナル）
  - 保要 隆明氏（エヌ・エフ・ラボラトリーズ Principal Security Engineer）
  - 市川 遼氏（GMOサイバーセキュリティ byイエラエ プロダクトサービス部 部長）

自分で手を動かす習慣をつける。
「脆弱性がない」というのは悪魔の証明だから、脆弱性がないと認可したソフトウェアに脆弱性が存在するかもしれないプレッシャー。
脆弱性の診断やペネトレーション以外にも、各部署のステークホルダーとすり合わせを行っていく必要性がある。
社内のソースコードを渡してもらえて読めるので嬉しい。
脆弱性がない、という前提で動作しているため、問題が発生したときに怒られが生じるが、動いているときに褒められることは少ない。
インシデント対応時に感謝される。

### サイバーセキュリティ業界における、女性の活躍とキャリアデザイン

- モデレーター
  - 黒澤 綾香氏（Sansan 技術本部 情報セキュリティ部 CSIRTグループ テクニカルリード）
- パネリスト
  - 中島 春香氏（NEC サイバーセキュリティ戦略統括部 リスクハンティング・システムグループ 主任）
  - 愛甲 日路親氏（PwCコンサルティング トラストコンサルティング部門 マネージャー）
  - 鈴木 悠氏（国立研究開発法人情報通信研究機構 サイバーセキュリティ研究所サイバーセキュリティ研究室・専門研究技術員）

キャリアデザインといいつつ再現性があるのか疑問だった。
色々なバックグラウンドについて知ることができた。
他の講演ではワークばかりの話が出ていたが、ここではライフの話も出ていた。
男性のライフの話も知りたいと思った。

### ソフトウェア開発とサイバーセキュリティ、二兎を追う若者たちへ

- モデレーター
  - 渡辺 洋司氏（サイバーセキュリティクラウド 代表取締役 CTO）
- パネリスト
  - ただただし氏（フリー PSIRTマネージャー）
  - 星 北斗氏（LayerX 部門執行役員 CISO）
  - 田島 悟史氏（Finatextホールディングス 取締役CTO/CISO）

ソフトウェアとセキュリティの二兎を追う、という題材になっているが、話していくと結局のところ巨大な一兎を追っていたというところに着地した。
セキュリティだけでなくて色々なものを学ぶことでセキュリティを高めることに繋がる。
セキュリティを高めるためには開発力が必要で、開発力を高めるにはセキュリティを学ぶ必要がある。
組織全体を見て安定したサービスを提供するという点で考えると SRE との共通項があるな、と私は思った。

### 懇親会

VulnUni のハンズオンを一緒に受けた方と一緒に、色々な方とお話した。
- [https://x.com/Nissy_itsec](https://x.com/Nissy_itsec)
- [https://x.com/chizu_potato](https://x.com/chizu_potato)

LayerX の星さん、日本総研の中川さん、高村さんと深く話すことができた。

脆弱性を潰すことは大事だけれど人的リソースも金銭的リソースも限られているから、何をどこまで対応する必要があるのかという判断基準が大切であると知った。

## まとめ

脆弱性を無くすためにはセキュリティそのものだけでなくてソフトウェアの仕様であったり、実際の動作であったりを学ぶも大切である。
これらを習得するためには、手を動かして量をこなす必要がある。
これによってソフトウェアが実際にどのように動作するのか実感を得るのが大事である。
手を動かしてみないと分からないことがある。

Just Do It

<iframe style="aspect-ratio: 16 / 9; width: 100%; height: 100%;" src="https://www.youtube.com/embed/ZXsQAXx_ao0?si=apXNodPMupDVni09" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
