// Confirmed municipal collection districts. Review before registering additional districts.
export const TRASH_REGIONS = [
  {
    "id": "suita_fe373dd63605",
    "municipality": "大阪府吹田市",
    "label": "千里山霧が丘・虹が丘・星が丘",
    "schedule": [
      {
        "label": "燃焼ごみ",
        "days": "火曜日・金曜日"
      },
      {
        "label": "資源ごみ",
        "days": "第1・3月曜日"
      },
      {
        "label": "大型複雑ごみ",
        "days": "第4月曜日"
      },
      {
        "label": "小型複雑ごみ・有害危険ごみ",
        "days": "第2月曜日"
      }
    ],
    "calendarUrl": "https://www.city.suita.osaka.jp/_res/projects/default_project/_page_/001/015/233/180.pdf",
    "sourceUrl": "https://www.city.suita.osaka.jp/kurashi/1018418/1020112/1015233.html",
    "checkedOn": "2026-10-11",
    "exceptions": "",
    "addressPrefixes": [
      "大阪府吹田市千里山霧が丘",
      "大阪府吹田市千里山虹が丘",
      "大阪府吹田市千里山星が丘"
    ]
  }
];
export function trashSettings(propertyNo, property) {
  const explicit = ['trash_collection_type','trash_region_id'].some(key => Object.hasOwn(property,key));
  if (explicit) return {collectionType: property.trash_collection_type,regionId: property.trash_region_id};
  return {};
}
export function trashCollection(settings, address) {
  if (settings?.collectionType !== 'municipal' || typeof address !== 'string') return null;
  const normalized=address.normalize('NFKC').replace(/\s|〒\d{3}-?\d{4}/g,'');
  const matches=TRASH_REGIONS.filter(region => region.id === settings.regionId).flatMap(region =>
    region.addressPrefixes.filter(prefix => normalized.startsWith(prefix) && /^[0-9一二三四五六七八九十]/.test(normalized.slice(prefix.length)))
      .map(prefix => ({region,prefix}))
  );
  if (matches.length !== 1) return null;
  const {region,prefix}=matches[0];
  return {...region,displayLabel:prefix.slice(region.municipality.length)};
}
export function mountTrashCollection(main, collection, {element,link}) {
  if(!collection)return;
  const section=element('section','panel trash-collection');section.setAttribute('aria-label','この物件のゴミ収集日');
  section.append(element('h2','','ゴミの収集日'));
  const table=element('table','trash-schedule'),caption=element('caption','',collection.displayLabel || 'この物件の収集日');table.append(caption);
  const body=element('tbody');
  for(const row of collection.schedule){const tr=element('tr'),th=element('th','',row.label);th.setAttribute('scope','row');tr.append(th,element('td','',row.days));body.append(tr);}
  table.append(body);section.append(table,element('p','muted','年末年始などの変更は、公式カレンダーをご確認ください。'));
  const calendar=link('収集カレンダーを確認する ↗',collection.calendarUrl,'button');calendar.target='_blank';calendar.rel='noopener noreferrer';
  section.append(calendar);main.append(section);
  mountMovingWaste(main, collection, {element,link});
}

// Remove only exact duplicate Casa copy when a confirmed regional schedule is available.
export function prepareTrashSection(section, collection, propertyNo) {
  if (!collection || String(propertyNo) !== '11300' || section?.variant !== 'casa_11300' || !section.blocks?.length) return section;
  const amendments = {
    trash_casa_11300_002: [
      '収集日当日の朝8時までに、所定のごみ置き場へ出してください。\n前日の夜や、決められた日時以外には出さないでください。\n収集日は地域（町名）によって異なります。\n公式ページで「千里山霧が丘」の収集日を確認してください。',
      '収集日当日の朝8時までに、所定のごみ置き場へ出してください。\n前日の夜や、決められた日時以外には出さないでください。'
    ],
    trash_casa_11300_005: ['分別区分と収集回数', '分別の基本'],
    trash_casa_11300_006: [
      '吹田市は12種分別です。\n・燃焼ごみ：週2回\n・資源ごみ（7分類）：月2回\n・大型複雑ごみ：月1回\n・小型複雑ごみ・有害危険ごみ：月1回\nペットボトルは、公共施設や協力店舗などの拠点回収をご利用ください。',
      '吹田市は12種分別です。\nペットボトルは、公共施設や協力店舗などの拠点回収をご利用ください。'
    ],
    trash_casa_11300_013: ['収集日・分別を確認する', '分別を確認する'],
    trash_casa_11300_014: [
      '収集日や分別に迷ったときは、下の吹田市公式ページをご確認ください。\nごみ置き場を清潔に保つため、ルールを守ってご利用ください。',
      '分別に迷ったときは、吹田市公式ページをご確認ください。\nごみ置き場を清潔に保つため、ルールを守ってご利用ください。'
    ]
  };
  const blocks=section.blocks.flatMap(block=>{
    if(block.id==='trash_casa_11300_015' && block.type==='button' && block.actionUrl===collection.sourceUrl && block.actionLabel==='町名別の収集日を確認する')return [];
    const change=amendments[block.id];return [change && block.content===change[0] ? {...block,content:change[1]} : block];
  });
  return {...section,blocks};
}

function mountMovingWaste(main, collection, {element,link}) {
  // Suita-specific service eligibility must not be applied to other municipalities.
  if(collection.municipality !== '大阪府吹田市')return;
  const panel=element('section','panel trash-moving-waste');panel.setAttribute('aria-label','引っ越しで出るゴミ');
  panel.append(element('h2','','引っ越しで大量のゴミが出るとき'),element('p','','大量のゴミを一度に出す前に、処分方法と置き場所を確認してください。'));
  panel.append(element('h3','','入居時の段ボールなど'),element('p','','段ボールはたたんでひもで十字に束ね、資源ごみの日に出してください。搬入・開梱時の回収は、引っ越し業者へ確認してください。'),element('p','','市外からの転入時に持ち込んだゴミは、吹田市の「引越しごみ」収集の対象外です。'));
  panel.append(element('h3','','退去時の大量ごみ'),element('p','','吹田市内での転居・市外への転出は、有料の「引越しごみ」収集を申し込めます。ゴミを出す日の1か月前〜2週間前に、吹田市の事業課へ電話してください。'),element('p','','収集日時は指定できず、出した当日に回収されるとは限りません。共同住宅では、置き場所を事前に管理会社へご相談ください。'));
  const phone=link('吹田市の事業課に電話する','tel:0668320026','button secondary');
  const official=link('引越しごみの申込み・対象を確認する ↗','https://www.city.suita.osaka.jp/kurashi/1018418/1018419/1015147.html','button secondary');official.target='_blank';official.rel='noopener noreferrer';
  panel.append(phone,official);main.append(panel);
}
