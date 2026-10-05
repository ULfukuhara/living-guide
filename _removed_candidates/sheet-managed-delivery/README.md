# Casaネッビア：宅配ボックス本文の管理

2026-10-05、コード内の宅配ボックス本文を撤去し、content_blocksに移行。

- スプレッドシート：11KJOQlt-eyz1O1AB3OtCEmzN0DfahUutw4oe1ouRZsA
- content_blocks：A8:L22、variant_key=casa_11300、enabled=TRUE
- 本文・見出し編集：F8:F22（content）
- properties_shiori _upsert：J8=casa_11300（11300 / Casaネッビア）
- 編集後はcontent_blocksをFirestoreにアップサートする。シート編集だけでは反映されない。
- 文章のみの変更にはHostingの再デプロイは不要。
- 現在開いているApps Scriptはバックアップ用。本文同期用ではない。

復元用：firestore-before.json、rules-before.json、data.js、property-content.js。
rows.jsonは今回同期したスナップショットであり、ライブのシートではない。
sync.cjsを再実行する前は、必ずシートの対象15行を再取得してrows.jsonを更新する。
メールボックス案はlocalhost/127.0.0.1のみ。本番は既存のメールボックス本文を維持。
