# V4 解約フォームの表示判定修正（2026-10-22）

Casaネッビア11300の公開設定 cancellation_form_enabled が文字列 TRUE で保存されていたため、boolean true のみを認める判定により部屋の解約フォームが非表示になっていた。

既存の normalizeBool で判定を統一。FALSE・未設定・不明な値は非表示を維持し、登録済みのフォームURLと物件の設定値は変更していない。

ユーザー承認により不具合修正だけを本番反映。Firebase Hosting site univlife-living-guide の76ファイルのうち、変更は v4/cancellation-eligibility.js の1ファイル。他の75ファイルと公開設定を保持し、トップ画面のデザイン試作は反映していない。

ローカル4テスト、公開ページの320・375・390px、無効設定の非表示、既存フォーム「解約通知電子フォーム（部屋）」への到達を確認。フォーム送信とFirestore更新は行っていない。

直前公開版: sites/univlife-living-guide/versions/3eef261d88f9cd3f
修正公開版: sites/univlife-living-guide/versions/60e434ff6e711511
記録: _removed_candidates/v4-cancellation-link-20261022/
