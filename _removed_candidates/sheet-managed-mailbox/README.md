# Casaネッビア：メールボックス本文の管理

2026-10-05、ローカル専用の文言案をcontent_blocksで公開する。

- content_blocks：A23:L38、16行、variant_key=casa_11300、enabled=TRUE。
- 本文・見出し編集：F23:F38（content）。
- properties_shiori _upsert：I8（mailbox）=casa_11300。
- シート編集後はcontent_blocksをアップサートする。文言のみの変更は再デプロイ不要。
- ローカルの固定本文差し替えを撤去。本番・ローカルともFirestoreの本文を表示する。
- 宅配ボックスや他物件の参照設定は維持。
- rows.jsonは今回の同期スナップショット。再同期前にシートの対象16行を再取得する。
- 復元用のfirestore-before.jsonとproperty-content-before.jsはローカルに保存。
