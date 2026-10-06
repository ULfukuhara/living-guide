import json, re, html
from pathlib import Path

root = Path(__file__).parent
titles = dict(moving='引っ越し・入居の流れ', key='鍵の管理・紛失時の対応', mailbox='メールボックス', delivery_box='宅配ボックス', bicycle_space='自転車置き場', bike_parking='バイク置き場', car_parking='駐車場', room_equipment='室内設備', internet='インターネット', electricity='電気', gas='ガス', water='水道', heater='暖房器具', air_conditioner='エアコン', toilet='トイレ', drainage='水まわり', ventilation='換気', trash='ゴミの出し方', common_area='共用部分', noise='生活音・騒音', pets='ペット', sales='訪問販売・勧誘', expenses='入居中の費用負担', cancellation='解約・退去手続き', management_other='入居後アンケート', kurasapo_connect='くらさぽコネクト', usac='USAC')
overrides = {
 'cancellation_013': '退去手続きで分からないことは相談',
 'electricity_003': '電気料金は家賃と一緒に口座振替',
 'bike_parking_001': '利用前に申込み（有料）',
 'car_parking_001': '利用前に申込み（有料）',
 'air_conditioner_011': '室外機の周囲に物を置かない',
 'air_conditioner_013': '症状・メーカー名・型式を伝える',
 'common_area_003': '共用部に私物を置かない',
 'drainage_007': '油を排水口に流さない',
 'drainage_009': '冬季の給湯器の凍結に注意',
 'toilet_001': 'トイレットペーパー以外は流さない',
 'toilet_003': '詰まり・水漏れ時は追加で水を流さない',
 'toilet_007': '便座・温水洗浄便座は無理に取り外さない',
 'toilet_009': '冬季の凍結に注意',
 'room_equipment_007': '電球・電池などの消耗品は入居者様負担',
 'room_equipment_011': '排水口に髪の毛や異物を流さない',
 'room_equipment_013': '床や壁に傷・跡を残さない',
 'sales_007': '依頼していない点検・交換はいったん断る',
 'ventilation_001': 'こまめな換気でカビ・結露を防ぐ',
 'ventilation_005': '入浴後・トイレ使用後も換気を続ける',
 'water_006': '水道メーターの付近に物を置かない',
 'mailbox_006': '長期間不在にする場合は、日本郵便の「不在届」をご検討ください。\n届出期間中の郵便物等を最長30日間保管し、期間終了後に配達するサービスです。利用条件は日本郵便の案内をご確認ください。\n\n[日本郵便：不在時の郵便物の取り扱い](https://www.post.japanpost.jp/question/115.html)',
 'mailbox_008': '郵便局へ「転居届」を提出すると、旧住所宛ての郵便物等が新住所へ無料で転送されます。\n転送期間は届出日から1年間です。窓口・ポスト投函・Webから手続きできます。\n\n[日本郵便：転居・転送サービス](https://www.post.japanpost.jp/service/receive/relocation/)',
 'mailbox_013': '差出人や配達した郵便局・配送業者へ、配達状況をご確認ください。\n重要書類やカード類が届かない場合は、発行元へ速やかに相談し、必要な手続きを確認してください。',
 'delivery_box_002': '・荷物は早めにお受け取りください。長期間入れたままにすると、他の入居者様が利用できなくなります。\n・私物や不要品の保管には使用できません。\n・大きな荷物など、ボックスに入らない荷物は利用できない場合があります。',
 'delivery_box_010': '操作ミスや暗証番号の入力間違いで開錠できない場合は、管理会社が開錠作業に対応できます。',
 'bicycle_space_010': '点検や清掃の妨げになる場合は、管理会社が一時的に自転車を移動することがあります。',
 'bike_parking_002': 'バイク置き場は有料契約です。利用前にお申し込みください。\n満車の場合は利用できません。',
 'car_parking_002': '駐車場は有料契約です。利用前にお申し込みください。\n満車の場合は利用できません。',
 'common_area_002': '廊下・エントランス・階段は、すべての入居者様が利用する共用部です。\n安全に通行できるよう、以下のルールをお守りください。',
 'common_area_010': '廊下での話し声、深夜の会話、階段を駆け上がる音・駆け下りる音は、近隣の迷惑になる場合があります。\n早朝・深夜は特に、足音やドアの開閉音にもご配慮ください。',
 'electricity_004': '管理会社が定期的に検針し、使用量に応じた電気料金を戸別にご請求します。\n検針の時期は物件ごとに異なる場合があります。料金は家賃とあわせて口座振替でお支払いいただきます。',
 'gas_002': '本物件はIHコンロですが、給湯にはガスを使用します。\n入居者様ご自身で、ガス会社へ使用開始をお申し込みください。代表的なガス会社として大阪ガスがあります。',
 'water_002': '水道を使うには開栓手続きが必要です。\n下記の吹田市公式サイトから、水道局へ使用開始日をお伝えください。',
 'heater_002': '火災のおそれがあるため、石油ストーブや石油を使用する暖房器具は使用できません。',
 'internet_002': 'インターネット回線は無料で利用できます。\n各お部屋まで回線は引き込まれていますが、Wi-Fi機器（無線LANルーター）は設置されていません。',
 'internet_010': 'LANケーブルやルーターの接続をご確認ください。\n改善しない場合は、サービス提供会社の株式会社ファイバー・プラス（Fiberplus）へご連絡ください。\n電話：0800-100-3311',
 'air_conditioner_012': '室外機の前後に物を置くと、性能が大きく低下します。植物・荷物・段ボールなどを近くに置かないでください。\n異音や振動がある場合は、早めにご連絡ください。',
 'air_conditioner_014': '「いつから」「どのような症状か」「どのお部屋のエアコンか」を、くらさぽコネクトからお知らせください。\nメーカー名・型式が分かる写真も添付すると、対応がスムーズです。',
 'ventilation_002': '湿度が高い状態が続くと、カビ・壁紙の変色・建具の反りにつながります。特に冬場は結露にご注意ください。\n窓を少し開けてこまめに換気し、キッチン・浴室の換気扇も併用してください。',
 'ventilation_006': '入浴後は30分〜1時間程度、換気を続けると効果的です。\nトイレの換気扇も、臭いや湿気を抑えるため、使用後しばらく運転してください。',
 'drainage_002': '髪の毛や油汚れは詰まりの原因になります。キッチン・浴室・洗面の排水ネットやヘアキャッチャーを清掃してください。\n排水トラップの水が減って臭う場合は、水を流して改善するか確認してください。',
 'drainage_004': '蛇口を閉めても水が止まらない場合や、給水管・排水管から漏れる場合は、可能な範囲で水を受け、濡れた床を拭いてください。\n被害の拡大を防ぎ、「どこで」「いつから」「どの程度」漏れているかを写真や動画とともにお知らせください。',
 'toilet_004': '追加で水を流したり、無理にレバーを操作したりすると、水があふれるおそれがあります。\n状況を確認し、管理会社へご連絡ください。異物を落とした場合は、その内容もお知らせください。原因によっては有償対応となります。',
 'noise_010': '「いつ・どの時間帯に」「どのような音が」聞こえたかをメモし、くらさぽコネクトからご相談ください。\n発生元の入居者名や部屋番号はご自身で特定せず、聞こえた状況をお知らせください。管理会社が状況に応じて確認します。',
 'pets_002': '犬・猫・鳥・小動物・爬虫類などの飼育は禁止です。\n一時的に預かることや、友人のペットをお部屋に入れることもできません。',
 'sales_004': 'インターネット回線・新聞・電気契約・ウォーターサーバーなどの強引な勧誘にご注意ください。\nその場で判断せず、契約内容を持ち帰り、ご自身で比較・検討してください。',
 'cancellation_004': '管理会社スタッフまたは委託業者が立ち会い、室内を確認します。日時は事前にご連絡のうえ調整してください。\n立会いが不要の物件では、鍵の返却後に室内を確認します。',
 'room_equipment_006': '通常使用による故障は管理会社で対応します。故意・過失による破損は、修理費をご負担いただく場合があります。\nくらさぽコネクトから、次の情報をお知らせください。\n・症状（例：電源は入るが冷えない、給湯が途中で止まる）\n・メーカー名・型番・年式\n・設備全体、本体ラベル、症状が分かる箇所の写真',
 'management_other_002': '管理体制や案内内容の改善に役立てるため、入居後の感想をお聞きする簡単なアンケートを実施しています。\n率直なご意見をお聞かせください。',
 'management_other_004': '回答は任意です。いただいたご意見は、今後のサービス向上に活用します。',
 'kurasapo_connect_002': '設備の不具合やお困りごとは、入居者様向けアプリ「くらさぽコネクト」からご連絡ください。\n写真を添付すると、状況確認がスムーズです。入居時に気になる傷や汚れの写真も送信できます。',
 'usac_002': 'サービス内容と申込み方法は、下のパンフレットをご確認ください。'
}

def revise(row):
    text = row['content']
    key = row['section_key'] + '_' + row['block_id'].rsplit('_', 1)[-1]
    if key in overrides:
        return overrides[key]
    if row['block_type'] == 'heading':
        text = text.replace('ご連絡ください', '連絡').replace('ご相談ください', '相談')
        text = text.replace('ご確認ください', '確認').replace('お申し込みください', '申込み')
        text = text.replace('してください', 'する').replace('しないでください', 'しない')
        text = text.replace('ご利用には', '利用には').replace('について', '')
        return text
    if row['block_type'] in ('text', 'notice'):
        text = text.replace('ご入居時', '入居時').replace('ご入居日', '入居日')
        text = text.replace('添付いただくと', '添付すると').replace('お気軽にご相談ください', 'ご相談ください')
        # Break long paragraphs without changing the wording or linked text.
        text = re.sub(r'(?<=[。])(?=[^\n\s])', '\n', text)
    return text

def escape(text):
    return html.escape(text)

groups=[]
changes=0
for path in sorted(root.glob('*-sheet-rows.json')):
    original=json.loads(path.read_text(encoding='utf-8-sig'))
    key=original[0]['section_key']
    reviewed=json.loads(json.dumps(original,ensure_ascii=False))
    previous=root/(path.name.replace('-sheet-rows.json','-copy-review-rows.json'))
    if key in ('moving','key') and previous.exists():
        reviewed=json.loads(previous.read_text(encoding='utf-8-sig'))
    else:
        for row in reviewed:
            row['content']=revise(row)
    for a,b in zip(original,reviewed):
        assert a['block_id']==b['block_id']
        for field in a:
            if field != 'content': assert a[field]==b[field], (key,field)
        # Important numeric facts and URLs must remain in each revised block.
        assert re.findall(r'\d+(?:[,.]\d+)*',a['content'])==re.findall(r'\d+(?:[,.]\d+)*',b['content']),a['block_id']
        assert re.findall(r'https?://[^\s)]+',a['content'])==re.findall(r'https?://[^\s)]+',b['content']),a['block_id']
        changes += a['content']!=b['content']
    out=root/'all-copy-review-rows'
    out.mkdir(exist_ok=True)
    (out/path.name).write_text(json.dumps(reviewed,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    blocks=[]
    for a,b in zip(original,reviewed):
        if b['block_type'] in ('text','heading','notice'):
            tag='h3' if b['block_type']=='heading' else 'p'
            changed=a['content']!=b['content']
            blocks.append(f'<div class="block"><{tag}>{escape(b["content"])}</{tag}><details><summary>{"現在の文言と比較" if changed else "文言は維持"}</summary><p>{escape(a["content"])}</p></details></div>')
        elif b['block_type']=='button':
            blocks.append(f'<p class="kept">リンク維持：{escape(b["action_label"])}<br>{escape(b["action_url"])}</p>')
        elif b['block_type']=='image':
            blocks.append(f'<p class="kept">画像維持：{escape(b["alt_text"] or "案内画像")}</p>')
    groups.append((key,titles[key],''.join(blocks)))
nav=''.join(f'<a href="#{k}">{escape(t)}</a>' for k,t,_ in groups)
nav='<nav aria-label="項目一覧">'+nav+'</nav>'
content=''.join(f'<article id="{k}"><h2>{escape(t)}</h2>{b}<a href="#top">項目一覧へ戻る</a></article>' for k,t,b in groups)
page='''<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>全項目・本文見直し案</title><style>body{margin:0;background:#f0f8fc;color:#3c4653;font:15px/1.9 system-ui}main{max-width:680px;margin:auto;padding:24px 20px;background:white}h1{font-size:25px}h1,h2,h3{color:#243f66}h2{font-size:23px}h3{font-size:17px;line-height:1.65}nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}nav a{padding:12px;border:1px solid #e1e9f1;border-radius:10px;text-decoration:none;color:#243f66}article{padding-top:30px;scroll-margin-top:20px}.block{padding:16px 4px;border-bottom:1px solid #e9edf1}.block:has(h3){padding-bottom:0;border:0}.block p{white-space:pre-wrap;overflow-wrap:anywhere}summary{cursor:pointer;color:#55759c;font-size:13px}details p,.kept{font-size:13px;color:#68727e;overflow-wrap:anywhere}.notice{background:#f5f8fb;padding:16px;border-radius:12px}@media(max-width:380px){nav{grid-template-columns:1fr}}</style><main id="top"><h1>全項目・本文見直し案</h1><p class="notice">Casaネッビアの登録済み27項目を対象にした文言案です。シートと公開本文は変更していません。数字・費用・期限・リンク・操作手順は維持しています。比較元はローカルに保存済みのシート用データです。公開前にシートの最新値と照合します。</p>'''+nav+content+'</main></html>'
(root/'all-copy-review.html').write_text(page,encoding='utf-8')
print(f'{len(groups)} sections; {changes} revised text blocks; numeric facts, links and metadata preserved')
