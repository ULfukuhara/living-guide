# J:COMのインターネット案内をV4専用本文へ統一

実施日：2026年10月19日

既存本文を使用していた7物件のインターネット項目だけを、見出し・電話ボタン・公式サイト・問い合わせボタンを備えたV4専用本文へ更新した。J:COMの公開対象24物件すべてがV4専用本文になった。

| 物件No | 公開ページ | 契約登録 | V4専用本文 |
|---|---|---|---|
| 44200 | [COPULAEAST](https://guide.univ-life.com/v4/?propertyNo=44200#section/internet) | jcom100M_wifi | あり |
| 44100 | [COPULAWEST](https://guide.univ-life.com/v4/?propertyNo=44100#section/internet) | jcom100M_wifi | あり |
| 46100 | [DOIBARAKI](https://guide.univ-life.com/v4/?propertyNo=46100#section/internet) | jcom320M_wifi | あり |
| 49000 | [NEVESALICE](https://guide.univ-life.com/v4/?propertyNo=49000#section/internet) | jcom320M_wifi | あり |
| 64500 | [ソレイユ関大前](https://guide.univ-life.com/v4/?propertyNo=64500#section/internet) | jcom100M_wifi | あり |
| 41500 | [メゾンヴェール月見町1](https://guide.univ-life.com/v4/?propertyNo=41500#section/internet) | jcom320M_wifi | あり |
| 63300 | [レジデンス石橋](https://guide.univ-life.com/v4/?propertyNo=63300#section/internet) | jcom320M_wifi | あり |

## 保持した条件

- 100M＋Wi-Fi無料：44200・44100・64500。100Mまで無料、1Gまで割引料金の登録を保持。
- 320M＋Wi-Fi無料：46100・49000・41500・63300。320Mまで無料の登録を保持。
- 利用開始はJ:COMへの手続きが必要。機器の設置・設定が必要な場合がある登録文を保持。ルーターの備え付け・解約不要等の未確認条件を追加していない。
- インターネット以外の本文・設備・契約・公開フラグを維持。V1のinternet列は変更せず、v4_section_variantsのinternet項目のみ追加。
- 64500は給湯未確認のため物件全体のV4量産スキップを維持。今回整備したのはインターネット案内のみ。

## 44000の管理終了

44000（第2高槻ハイム）は今回の書式統一対象から除外。ご指示を受け、管理表とFirestoreのshiori_enabled・cancellation_form_enabledをFALSEにした。既存URLを維持し、V1・V2・V3・V4とV4詳細直リンクの6画面で本文・フォーム案内非表示を確認。共有本文は削除していない。記録：artifacts/v4-44000-retired-20261019/。

## 確認記録

- ローカル・公開後に320px／375px幅、7物件のインターネット詳細・接続不具合・退去案内を各42画面で確認。見出し・ボタン・速度・Wi-Fi条件・横はみ出しなしを確認。
- 新しい本文91ブロック・対象7件の設定を個別に読み戻し照合。既存J:COM233ブロックと他20物件の公開設定を維持。
- 対象7物件について、インターネット以外の全本文と公開条件が変更前と一致。
- 管理表218行を照合し、7物件のV4本文設定と44000の公開停止以外の値は変更なし。本文カタログと確認一覧を更新し、確認済みチェック・64500スキップを保持。
- 追加行：content_blocks 23573〜23663、V4本文カタログ2008〜2014。値・書式・入力規則を継承し、読み戻し確認。
- Hostingのコード・URL・ナビゲーション・公開ルールは変更なし。

詳細：artifacts/v4-jcom-format-20261019/。
