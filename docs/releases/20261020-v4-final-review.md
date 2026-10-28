# V4 最終確認分（2026-10-20）

## 対象

コミュニティ回収の確認が解消した12物件と、民間回収条件の回答がそろったベルエアー（11700）の計13物件を作成。64400・64500はユーザーの指示により一旦保留。給湯はガスとの回答を不明点一覧に記録し、2物件の公開本文・公開設定・管理表の設備項目は変更しない。

## 根拠・契約条件

- 古紙・衣類の地域・曜日・回収業者：https://www.city.osaka.lg.jp/kankyo/page/0000450195.html
- 収集場所・排出方法は従来どおり：https://www.city.osaka.lg.jp/kankyo/page/0000288460.html
- 12物件それぞれの住所を全域の対象範囲と照合。確認済みの曜日に、従来の古紙・衣類の排出場所・方法で排出する。
- ベルエアー（11700）は、ご回答により東清掃 06-6568-7676、月〜土曜日（祝日含む）、12月31日〜1月4日休止。粗大ごみ・引越しによる大量の段ボールは事前申込の有料回収。
- ベルエアーのカードキー追加料金2,200円を既存契約本文どおり保持。
- タウンズマンション下村（27300）の水道は管理会社検針・家賃と合わせた請求。入居・退去時の開栓・閉栓手続きは不要。

## 確認

- ローカル13物件、幅320px・375px、計1,128画面。
- 196物件の本文選択・取得条件を照合。対象外183物件に新規本文が適用されない。
- 既存16物件のインターネット不具合・ごみ・ガス臭の画面は変更前後で一致。
- 新規本文3,767行、カタログ325行をスプレッドシートに登録して全件読み戻し。書式・入力規則を保持。
- Hostingは74ファイルを保全し、v4/trash-collection.jsとv4/app.jsのみ更新。app.jsの変更対象はベルエアーの民間回収問い合わせ先に限定。

## 作成対象

| 物件No | 物件名 | 確認URL |
| --- | --- | --- |
| 29800 | CRUM-1 | https://guide.univ-life.com/v4/?propertyNo=29800 |
| 11000 | DO・Z | https://guide.univ-life.com/v4/?propertyNo=11000 |
| 11100 | M&Mウメダイースト | https://guide.univ-life.com/v4/?propertyNo=11100 |
| 63400 | S・フルール | https://guide.univ-life.com/v4/?propertyNo=63400 |
| 11600 | アルファ帝塚山 | https://guide.univ-life.com/v4/?propertyNo=11600 |
| 12100 | エテルノヨシダ | https://guide.univ-life.com/v4/?propertyNo=12100 |
| 10200 | カーサ御崎 | https://guide.univ-life.com/v4/?propertyNo=10200 |
| 11500 | コンセール裕恵 | https://guide.univ-life.com/v4/?propertyNo=11500 |
| 63600 | サンメゾン | https://guide.univ-life.com/v4/?propertyNo=63600 |
| 27300 | タウンズマンション下村 | https://guide.univ-life.com/v4/?propertyNo=27300 |
| 26500 | ハイアットコート薮野 | https://guide.univ-life.com/v4/?propertyNo=26500 |
| 11700 | ベルエアー | https://guide.univ-life.com/v4/?propertyNo=11700 |
| 12300 | 小松・パラッツオ旧源蔵町 | https://guide.univ-life.com/v4/?propertyNo=12300 |

公開後も13物件・1,128画面を確認済み。対象外183物件（64400・64500を含む）と既存41,591ブロックが変更されていないことを照合。新規3,767ブロックの一致も確認済み。不明点一覧・事前調査の状態を公開確認済みに更新し、回答欄・書式・入力規則を保持した。完了記録：artifacts/v4-final-20261020/completion.json。