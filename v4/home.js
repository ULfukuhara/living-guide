import { groupedSections, sectionTitle } from './navigation.js?v=20261010-next-seven-1';
import { troubleItems, splitGasGuide, splitElectricityGuide, splitInternetGuide, splitKeyGuide } from './trouble.js?v=20261010-next-seven-1';
import { guideHref } from '/assets/site-links.js';
export function initHeader(){const b=document.querySelector('#homeMenuButton'),m=document.querySelector('#homeMenu');const close=()=>{m.hidden=true;b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','メニューを開く');};b.onclick=()=>{m.hidden=!m.hidden;b.setAttribute('aria-expanded',String(!m.hidden));b.setAttribute('aria-label',m.hidden?'メニューを開く':'メニューを閉じる');};m.onclick=e=>{if(e.target.closest('a'))close();};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden){close();b.focus();}});}
const menus=[['intro','はじめに','入居後まず確認','orange','home'],['equipment','お部屋・設備','使い方・お手入れ','blue','equipment'],['trash','ゴミの出し方','分別・収集日','green','trash'],['rules','暮らしのルール','生活のマナー','pink','rules'],['procedures','手続き・サポート','解約・費用・相談','purple','procedures'],['trouble','困ったとき','トラブル・相談','red','trouble']];
const shapes={"home":"<path d=\"m3 10 9-7 9 7v11h-6v-7H9v7H3z\"/>","equipment":"<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0L21.5 5.5a6 6 0 0 1-7.9 7.9l-7.8 7.8a2.1 2.1 0 0 1-3-3l7.8-7.8a6 6 0 0 1 7.9-7.9Z\"/>","trash":"<path d=\"M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7\"/>","rules":"<path d=\"M12 5v16M3 3h5l4 2 4-2h5v16h-5l-4 2-4-2H3z\"/>","procedures":"<path d=\"M5 3h10l4 4v14H5zM14 3v5h5M9 12h6m-6 4h6\"/>","trouble":"<path d=\"M10.3 4a2 2 0 0 1 3.4 0l8 14a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3zM12 9v5\"/><circle cx=\"12\" cy=\"17.5\" r=\".7\" fill=\"currentColor\" stroke=\"none\"/>"};
Object.assign(shapes,{
 equipment:'<path d="m2 10 8-7 8 7M4 9v12h6v-7"/><circle cx="17" cy="17" r="3"/><path d="M17 12v2m0 6v2m-5-5h2m6 0h2m-8.5-3.5 1.4 1.4m4.2 4.2 1.4 1.4m-7 0 1.4-1.4m4.2-4.2 1.4-1.4"/>',
 trouble:'<path d="M21 11a9 9 0 0 1-9 9H3l1-5A9 9 0 1 1 21 11Z"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 4"/><circle cx="12" cy="16" r=".7" fill="currentColor" stroke="none"/>'
});
export function mountHome(main,guide,{element:el,link,icon}){
 const isCasa=String(guide.propertyNo)==='11300';
 const home=el('div','home-screen'+(isCasa?' casa-home':''));
 const modal=(title,build)=>{const d=el('dialog','room-dialog v4-dialog');d.setAttribute('aria-label',title);const c=el('button','room-close','閉じる ×');c.type='button';c.onclick=()=>d.close();d.append(c,el('h2','',title));build(d);d.addEventListener('close',()=>d.remove(),{once:true});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});document.body.append(d);d.showModal();};
 const hero=el('section','v4-property');hero.append(el('h1','',guide.title),el('p','','入居後の暮らしをサポートします'));home.append(hero);
 if(guide.roomInfo){
  const info=guide.roomInfo;
  const values=[['ポスト開錠番号',info.mailbox],['宅配ボックス',info.delivery],['Wi-Fi（SSID）',info.ssid],['Wi-Fiパスワード',info.wifiPassword],['駐輪場',info.bicycle]];
  const showDetails=(title,entries)=>modal(title,d=>{if(guide.room)d.append(el('h3','',guide.room+'号室'));let shown=false;for(const [label,value] of entries)if(value){shown=true;d.append(el('p','room-detail-label',label),el('p','room-detail-value',value));}if(!shown)d.append(el('p','','お部屋の詳細情報は登録されていません。'));});
  const room=el('section','v4-room');room.setAttribute('aria-label','あなたのお部屋');room.append(el('h2','','あなたのお部屋'));
  const row=el('div','v4-room-heading'),no=el('p','v4-room-number');no.append(el('strong','',guide.room||'お部屋'),el('span','',guide.room?'号室':''));
  const detail=el('button','v4-detail','詳細を見る ›');detail.type='button';detail.onclick=()=>showDetails('あなたのお部屋',values);row.append(no,detail);room.append(row);
  const hints=el('div','v4-room-hints');
  for(const [label,symbol,entries] of [['ポスト','rules',values.slice(0,1)],['宅配BOX','box',values.slice(1,2)],['Wi-Fi','wifi',values.slice(2,4)]])if(entries.some(([,value])=>value)){
   const item=el('button');item.type='button';item.setAttribute('aria-label',label+'の情報を見る');item.innerHTML=icon(symbol);item.append(el('span','',label),el('span','v4-hint-arrow','›'));item.onclick=()=>showDetails(label,entries);hints.append(item);
  }
  if(hints.childElementCount)room.append(hints);home.append(room);
 }
 const search=el('label','home-search'),symbol=el('span'),copy=el('span','v4-search-copy');symbol.innerHTML=icon('search');const input=el('input');input.id='homeSearch';input.type='search';input.placeholder='何をお探しですか？';input.setAttribute('aria-label','暮らしの情報を検索');input.setAttribute('aria-controls','homeSearchResults');copy.append(input,el('small','','お湯が出ない、ゴミ、解約など'));search.append(symbol,copy,el('span','v4-chevron','›'));home.append(search);
 const results=el('section','home-results');results.id='homeSearchResults';results.hidden=true;const status=el('p','home-search-status');status.setAttribute('role','status');home.append(status,results);
 const normalize=text=>text.normalize('NFKC').toLowerCase().replace(/[\sー−‐-]/g,'').replace(/ごみ/g,'ゴミ');const aliases={trash:'ごみ ゴミ 分別 収集日',internet:'Wi-Fi wifi ネット 接続',gas:isCasa?'開栓 ガスの使用開始 ガスの停止':'お湯が出ない 給湯器',heater:'暖房 暖房器具',cancellation:'解約 退去',delivery_box:'宅配BOX 宅配ボックス',key:isCasa?'鍵 管理 追加 返却':'鍵 紛失'};
 const symptoms={
  'gas-smell':'ガスのにおい ガス臭い ガスくさい ガスの臭い ガス漏れ ガスもれ ガスの匂い',
  'gas-trouble':'ガスが使えない ガス使えない ガスが急に使えなくなった ガスが急に使えない ガスが止まった ガス止まった ガスメーター 復旧',
  'electricity-trouble':'停電時はお部屋のブレーカーを確認する 建物全体が停電したとき 停電 電気つかない 電気がつかない 電気使えない 電気が使えない ブレーカー 部屋が暗い 部屋暗い 暗い 照明 照明がつかない 照明つかない 電灯がつかない 電球が切れた 電球切れた ライトがつかない',
  'no-hot-water':'お湯でない お湯出ない お湯がでない 水しか出ない 給湯器 エラー 給湯器が動かない 給湯器動かない 給湯器のエラー',
  'water-leak':'漏水 水もれ 水漏れ 水が漏れる 水が漏れている 水がもれる',
  'toilet-trouble':'トイレ 詰まり つまる 流れない 水が止まらない 便座 トイレが詰まった トイレ詰まった トイレがつまった トイレが流れない',
  'air-conditioner-trouble':'エアコン 冷えない 暖まらない 動かない 異音 水漏れ エアコンが冷えない エアコンが暖まらない エアコンが動かない',
  'lost-key':'鍵 紛失 なくした 入れない 鍵なくした 鍵を失くした 鍵を無くした カギなくした かぎをなくした 家に入れない',
  'internet-trouble':'Wi-Fi wifi ネット 接続できない つながらない 繋がらない ネットが使えない wifiがつながらない Wi-Fiが繋がらない インターネットが使えない',
  'noise-trouble':'騒音 うるさい 音',
  'other-trouble':'その他 相談 困りごと'
 };
 input.addEventListener('input',()=>{
  if(!isCasa){
   const words=normalize(input.value).trim();results.replaceChildren();results.hidden=!words;status.textContent='';if(!words)return;
   const hits=Object.entries(guide.sections).filter(([key,s])=>normalize(sectionTitle(key,s)+' '+s.body+' '+(aliases[key]||'')).includes(words));
   status.textContent=hits.length?`${hits.length}件の案内が見つかりました`:'該当する案内がありません。別の言葉でお試しください。';
   hits.forEach(([key,s])=>results.append(link(sectionTitle(key,s)+' ›','#section/'+key)));return;
  }
  const words=input.value.trim().split(/\s+/).map(normalize).filter(Boolean);
  results.replaceChildren();results.hidden=!words.length;status.textContent='';if(!words.length)return;
  const matches=text=>words.every(word=>normalize(text).includes(word));
  const troubleHits=troubleItems.filter(item=>(!['gas-smell','gas-trouble'].includes(item.route)||guide.sections.gas)&&(!item.route.startsWith('section/')||guide.sections[item.route.slice(8)])&&matches(item.title+' '+(symptoms[item.route]||'')));
  const hits=Object.entries(guide.sections).filter(([key,s])=>matches(sectionTitle(key,s)+' '+(key==='gas'&&s.blocks?.length ? splitGasGuide(s).preparation.body : key==='electricity'&&s.blocks?.length ? splitElectricityGuide(s).preparation.body : key==='internet'&&s.blocks?.length ? splitInternetGuide(s).preparation.body : key==='key'&&s.blocks?.length ? splitKeyGuide(s).preparation.body : s.body||'')+' '+(aliases[key]||''))&&!troubleHits.some(item=>item.route==='section/'+key));
  const count=troubleHits.length+hits.length;
  status.textContent=count?`${count}件の案内が見つかりました`:'該当する案内がありません。別の言葉でお試しください。';
  if (!count) results.append(link('困ったときの一覧から探す ›', '#trouble'));
  troubleHits.forEach(item=>results.append(link(item.title+' ›','#'+item.route)));
  hits.forEach(([key,s])=>results.append(link(sectionTitle(key,s)+' ›','#section/'+key)));
 });
 const quick=el('nav','quick-menu-grid');quick.setAttribute('aria-label','主要メニュー');for(const [route,title,description,color,symbol] of menus){const a=link('','#'+route,'v4-menu '+color);const glyph=el('span','v4-icon');glyph.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[symbol]}</svg>`;a.append(glyph,el('strong','',title),el('small','',description));quick.append(a);}home.append(quick);
 const popular=el('section','popular-info'),heading=el('div','home-section-heading'),h=el('h2'),flame=el('span','v4-flame');flame.innerHTML=icon('heater');h.append('よく見られる情報');const all=el('button','v4-all','すべて見る ›');all.type='button';all.onclick=()=>modal('すべてのご案内',d=>{for(const group of groupedSections(guide.sections)){d.append(el('h3','',group.title));for(const key of group.keys){const a=link(sectionTitle(key,guide.sections[key])+' ›','#section/'+key,'room-guide-link');a.onclick=()=>d.close();d.append(a);}}if(!Object.keys(guide.sections).length)d.append(el('p','','この物件のご案内は準備中です。'));});heading.append(h,all);popular.append(heading);const grid=el('div','popular-grid');for(const [keys,title,photo] of [[['gas'],'お湯が出ない','shower'],[['trash'],'ゴミの出し方','bins'],[['delivery_box'],'宅配ボックス','lockers']]){const k=keys.find(k=>guide.sections[k]),a=photo==='shower'?link('','#no-hot-water','popular-card'):photo==='bins'?link('','#trash','popular-card'):k?link('','#section/'+k,'popular-card'):el('div','popular-card unavailable'),visual=el('span','v4-photo '+photo);visual.setAttribute('aria-hidden','true');a.append(visual,el('strong','',title));if(!k&&photo==='lockers')a.append(el('small','','案内準備中'));grid.append(a);}popular.append(grid);home.append(popular);
 const cta=link('',guideHref('/kurasapo/'),'kurasapo-cta'),phone=el('span','v4-phone'),text=el('span','v4-cta-copy');phone.innerHTML=icon('kurasapo');text.append(el('strong','','くらさぽコネクト'),el('small','','管理会社への連絡・アプリの使い方'));cta.append(phone,text,el('span','v4-chevron','›'));home.append(cta);main.append(home);
 // Preserve the current image-loading behavior for other properties.
 if(!isCasa){
  const visuals=home.querySelectorAll('.v4-photo');
  if('IntersectionObserver' in window){
   const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('photo-ready');observer.unobserve(entry.target);}},{rootMargin:'100px'});
   visuals.forEach(visual=>observer.observe(visual));
   window.addEventListener('hashchange',()=>observer.disconnect(),{once:true});
  }else visuals.forEach(visual=>visual.classList.add('photo-ready'));
 }
}
