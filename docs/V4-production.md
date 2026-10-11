# V4の物件展開

管理元：master_storyblok の properties_shiori _upsert、content_blocks、guides_master_raw。
補助表：V4本文カタログ、V4入力項目説明、V4公開前チェック。

## 入力
1. 物件No、正式名称、住所を確定。新物件は shiori_enabled=FALSE。
2. 各項目に存在する完成したvariantを選ぶ。FALSE/空欄は非表示。TRUE/baseは物件全体variant_keyを先に探すため、base強制ではない。
3. 新しい物件条件欄は確認済みの値だけを入れる。ガスの導管事業者は小売会社・住所から推測しない。停止不要、鍵貸出、解約フォーム、USAC/JBRの条件を11300からコピーしない。
4. 水まわりはdrainageを使う。明示FALSEを優先し、未設定・空欄の場合だけ旧water_areaを使う。旧列は移行が終わるまで維持。
5. v4_commonはトイレ・騒音・訪問販売の一般案内。物件の追加ルールがある場合は、完成した条件別/物件別variantを作る。共通と物件本文を単純連結しない。
6. 部屋専用token、開錠情報、Wi-Fi情報、入居者名を公開の管理表や本文へ入れない。

## 本文資産
旧本文は移行資産として残す。カタログで要確認になっているものは適用条件を確認してから使う。同じ項目/variantの重複を日付順だけで削除しない。共通本文の変更は利用する全物件に影響するため、対象を確認する。

## チェックと同期
公開用のproperty、masters、blocks、必要ならcontents/catalogue/forbiddenTermsをJSONに出し、読み取り専用の tools/guide-preflight.mjs で確認する。ブロック欠落を検出するため、catalogue.expectedBlocksも指定する。

node tools/guide-preflight.mjs 入力.json 確認結果.json

同じ項目・variantの本文不足、無効ブロック、ID重複、想定外baseへのfallback、別物件Noのリンク、部屋専用値の混入を検出する。ツールが成功しても設備・契約の根拠確認と375px/320pxの画面確認は別に行う。

更新は管理元とFirestoreを差分で同期する。データの同期とHostingのデプロイは別操作。管理元を直しただけではFirestoreは変わらない。現在の補助表は入力・確認用で、同期のトリガーではない。

公開前に追加・変更・削除件数と前版を保存する。新物件を本番で一時公開して確認せず、ローカルの合成プレビューから始める。実物件の資料がそろってから対象を承認・公開する。

## 表示の管理元
- UI・検索・戻る・開閉：V4共通ソース。
- 本文と画像キャプション：content_blocks。項目ごとに完成variantを一つ選ぶ。
- 電気/水道/給湯/ネット/鍵/緊急窓口：物件の公開設定をproperty-settings.jsで正規化。
- 地域番号・収集日：確認済み地域マスターと物件住所。現行の地域表はコード管理で、公式変更監視の確認後に更新する。
- 解約フォーム：確認済みcancellation_form_enabledがTRUEの物件だけ。内部サイボウズ情報は入居者へ渡さない。
- 部屋専用情報：既存token経路。本文と共通表に複製しない。
- 並び順：navigation.js。sections_masterのgroup/orderだけを変更しても並び順は変わらない。

新しい構造への一括変換や旧本文の一括削除は行わない。

## 差分同期の実行手順

公開用の入力JSONに必要な物件設定と対象ブロックだけを入れ、tools/guide-sync.mjsのprepareで差分・前版を保存する。applyは保存した入力と前版が変わっていない場合だけ更新し、対象フィールドを読み戻して照合する。省略した項目・空欄・他物件・公開ルールを変更せず、削除は実行しない。共通variantの更新は利用物件に影響するため、準備された差分を必ず確認する。

node tools/guide-sync.mjs prepare 入力.json 差分.json
node tools/guide-sync.mjs apply 入力.json 差分.json

shiori_enabled=TRUEで公開する入力は、確認・承認後に--publishを付ける。追加アクセスが必要な場合は既存の正規ログインを使い、別の認証情報へ切り替えない。Firebase CLIの既存ログインとランタイムを使用する。実行環境が変わった場合はFIREBASE_TOOLS_LIBにインストール済みFirebase CLIのlibを指定する。同期後のHosting公開は別操作。

V4公開前チェックの補助表は次物件用のひな型。11300の今回の検証結果は実行レポートに記録している。
