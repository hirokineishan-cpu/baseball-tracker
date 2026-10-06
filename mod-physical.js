/* フィジカル
   入力   ：測定日と種目を選んで、選手をまとめて記録する（管理・スタッフ）
   種目別 ：1つの種目について、全員を並べて見る（管理・スタッフ）
   選手別 ：1人について、全種目の今と推移を見る。選手がログインしたときは、自分のこのページだけが出る
   測っていない値は、計算で埋めない。無いものは出さないか「データなし」と出す。 */

const CSS = `
#tab-physical .pw{ max-width:1100px; margin:0 auto; padding:12px 14px 60px }
#tab-physical .hd{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin:6px 2px 12px }
#tab-physical .hd h2{ margin:0; font-size:17px; letter-spacing:.05em }
#tab-physical .hd .sub{ color:var(--muted); font-size:12px }
#tab-physical .hd .sp{ margin-left:auto; display:flex; gap:6px; flex-wrap:wrap; align-items:center }
#tab-physical .seg{ display:inline-flex; background:var(--raise); border:1px solid var(--line); border-radius:9px; padding:2px; gap:2px }
#tab-physical .seg button{ appearance:none; border:0; background:transparent; color:var(--ink2); font-size:14px; font-weight:600; padding:7px 14px; border-radius:7px; cursor:pointer }
#tab-physical .seg button[aria-pressed="true"]{ background:var(--accent); color:var(--accentInk) }
#tab-physical button.b{ appearance:none; font-size:14px; cursor:pointer; border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:8px; padding:7px 12px; white-space:nowrap }
#tab-physical button.b:hover{ border-color:var(--accent) }
#tab-physical button.b.primary{ background:var(--accent); color:var(--accentInk); border-color:var(--accent); font-weight:700 }
#tab-physical button.b[disabled]{ opacity:.45; cursor:default }
#tab-physical select, #tab-physical input{ font-size:16px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:6px 8px; max-width:100%; min-width:0 }
#tab-physical label.f{ display:flex; flex-direction:column; gap:3px; font-size:11px; color:var(--muted); min-width:0 }
#tab-physical .bar{ display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap; background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:10px 12px; margin-bottom:12px }
#tab-physical .bar.stick{ position:sticky; top:calc(var(--barH) + env(safe-area-inset-top) + 4px); z-index:20; box-shadow:0 4px 12px rgba(0,0,0,.08) }
#tab-physical .bar .acts{ margin-left:auto; display:flex; gap:8px; align-items:center; flex-wrap:wrap }
#tab-physical .note{ font-size:12px; color:var(--muted); line-height:1.6; margin:2px 2px 10px }
#tab-physical .note.err{ color:var(--clay) } #tab-physical .note.okmsg{ color:var(--hit) }
#tab-physical .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:12px 14px; margin-bottom:12px; min-width:0 }
#tab-physical .card h3{ margin:0 0 9px; font-size:13.5px; letter-spacing:.04em; color:var(--ink2); display:flex; align-items:baseline; gap:8px; flex-wrap:wrap }
#tab-physical .card h3 .u{ margin-left:auto; font-weight:400; font-size:11.5px; color:var(--muted) }
#tab-physical .tw{ overflow-x:auto; -webkit-overflow-scrolling:touch }
#tab-physical table{ width:100%; border-collapse:collapse; font-size:13.5px }
#tab-physical th, #tab-physical td{ padding:6px 8px; border-bottom:1px solid var(--line); text-align:left; white-space:nowrap }
#tab-physical td.nm{ white-space:normal; min-width:6.5em }
#tab-physical td.nm small{ display:block; font-size:11px; color:var(--muted) }
#tab-physical th{ font-size:11px; color:var(--muted); font-weight:600; letter-spacing:.04em }
#tab-physical td.n, #tab-physical th.n{ text-align:right; font-family:var(--num); font-size:15px }
#tab-physical th.n{ font-family:var(--jp); font-size:11px }
#tab-physical td.n small{ font-family:var(--num); font-size:11px; margin-left:4px }
#tab-physical tr.me td{ background:color-mix(in srgb, var(--gold) 14%, transparent) }
#tab-physical .muted{ color:var(--muted) }
#tab-physical a{ color:inherit; text-decoration:underline; text-decoration-color:var(--gold); text-underline-offset:3px }
#tab-physical .in{ width:5.4em; text-align:right; font-family:var(--num); font-size:16px; padding:6px 7px }
#tab-physical .in.dirty{ border-color:var(--gold); box-shadow:0 0 0 2px color-mix(in srgb, var(--gold) 35%, transparent) }
#tab-physical .in.has{ background:var(--raise) }
#tab-physical .gauge{ position:relative; height:10px; background:var(--ground); border-radius:5px; overflow:hidden; min-width:90px }
#tab-physical .gauge i{ position:absolute; left:0; top:0; bottom:0; background:var(--accent); border-radius:5px }
#tab-physical td.g{ width:30%; min-width:120px }
#tab-physical .pill{ display:inline-block; font-size:11px; font-weight:700; padding:1px 8px; border-radius:99px; letter-spacing:.03em; white-space:nowrap }
#tab-physical .pill.ok{ background:color-mix(in srgb, var(--hit) 16%, transparent); color:var(--hit) }
#tab-physical .pill.ng{ background:color-mix(in srgb, var(--clay) 16%, transparent); color:var(--clay) }
#tab-physical .pill.na{ background:var(--ground); color:var(--muted) }
#tab-physical .dlt.up{ color:var(--hit) } #tab-physical .dlt.dn{ color:var(--clay) } #tab-physical .dlt.fl{ color:var(--muted) }
#tab-physical .grid2{ display:grid; grid-template-columns:repeat(auto-fill,minmax(min(330px,100%),1fr)); gap:12px }
#tab-physical .grid2 .card{ margin-bottom:0 }
#tab-physical .spark{ display:block }
#tab-physical .cat{ margin:18px 2px 8px; font-size:12px; letter-spacing:.09em; color:var(--ink2); font-weight:700; border-left:3px solid var(--gold); padding-left:8px }
#tab-physical .empty{ padding:26px; text-align:center; color:var(--muted); font-size:13px; border:1px dashed var(--line); border-radius:var(--r) }
#tab-physical .src{ font-size:11.5px; color:var(--muted); line-height:1.6; margin-top:7px; padding-top:7px; border-top:1px dotted var(--line); white-space:normal }
#tab-physical details{ margin-top:7px; font-size:12px; color:var(--muted) }
#tab-physical details summary{ cursor:pointer; padding:3px 0 }
#tab-physical details table{ font-size:12.5px }
#tab-physical details td.n{ font-size:13px }
#tab-physical .who{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin:2px 2px 6px }
#tab-physical .who b{ font-size:18px }
#tab-physical .who span{ font-size:12px; color:var(--muted) }
#tab-physical .who .po{ display:none }
@media (max-width:620px){
  #tab-physical .pw{ padding:10px 10px 50px }
  #tab-physical td.g, #tab-physical th.g, #tab-physical .hide-s{ display:none }
  #tab-physical .seg{ width:100% } #tab-physical .seg button{ flex:1; padding:7px 4px }
  #tab-physical .hd .sp{ width:100% }
  #tab-physical .in{ width:4.6em }
  #tab-physical th, #tab-physical td{ padding:6px 5px }
}
@media (max-height:520px) and (orientation:landscape){ #tab-physical .bar.stick{ position:static } }
@media print{
  #tab-physical .hd, #tab-physical .bar, #tab-physical .noprint, #tab-physical #ph-msg{ display:none !important }
  #tab-physical .who .po{ display:inline !important }
  #tab-physical .pw{ max-width:none; padding:0 }
  #tab-physical .card{ break-inside:avoid; page-break-inside:avoid }
  #tab-physical .cat{ break-after:avoid; page-break-after:avoid }
  #tab-physical .grid2{ grid-template-columns:1fr 1fr }
  #tab-physical td.g, #tab-physical th.g{ display:none }
  #tab-physical .tw{ overflow:visible }
}
`;

/* ================= 小道具 ================= */
const pad2 = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
const num = (v, dec) => (v == null || v === '' || isNaN(v)) ? '—' : Number(v).toFixed(dec);
const NOCLASS = '\u0001none';

/* 学年（4月2日〜翌4月1日生まれが同じ学年）。生年月日が無ければ空 */
export function schoolGrade(birth, now) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(birth || '')); if (!m) return '';
  const y = Number(m[1]), md = m[2] + m[3];
  const entry = md >= '0402' ? y + 7 : y + 6;                 // 小学1年になる年度
  const t = now || new Date(), fy = t.getMonth() + 1 >= 4 ? t.getFullYear() : t.getFullYear() - 1;
  const g = fy - entry + 1;
  if (g >= 1 && g <= 6) return '小' + g;
  if (g >= 7 && g <= 9) return '中' + (g - 6);
  if (g >= 10 && g <= 12) return '高' + (g - 9);
  return '';
}

/* 算出項目：ここに書いてある分だけを、同じ日に測った値から計算する */
const DERIVED = {
  'm-lmi':  { need: ['m-lbm', 'm-height'],     calc: v => (v['m-lbm'] && v['m-height']) ? v['m-lbm'] / Math.pow(v['m-height'] / 100, 2) : null },
  'm-bmi':  { need: ['m-weight', 'm-height'],  calc: v => (v['m-weight'] && v['m-height']) ? v['m-weight'] / Math.pow(v['m-height'] / 100, 2) : null },
  'm-erir': { need: ['m-hhd-er', 'm-hhd-ir'],  calc: v => (v['m-hhd-er'] && v['m-hhd-ir']) ? v['m-hhd-er'] / v['m-hhd-ir'] * 100 : null }
};
/* 左右のことば：種目によって意味が違う。投げ手が分からないときは出さない */
const LEG_ITEMS = ['m-latjump', 'm-hhd-abd', 'm-hip-ir', 'm-hip-er', 'm-sl-h', 'm-sl-c'];
const ARM_ITEMS = ['m-hhd-er', 'm-hhd-ir', 'm-erir', 'm-grip'];

/* 球速連動の基準："140:63" と "150:66" の2点を、目標球速で按分する */
function veloStandard(item, target) {
  if (item['基準の型'] !== '球速連動' || !target) return null;
  const p = String(item['基準1']).split(':').map(Number), q = String(item['基準2']).split(':').map(Number);
  if (p.length !== 2 || q.length !== 2 || p.concat(q).some(isNaN) || p[0] === q[0]) return null;
  const lo = Math.min(p[0], q[0]), hi = Math.max(p[0], q[0]);
  if (target < lo || target > hi) return { out: true, lo, hi };
  return { val: p[1] + (target - p[0]) * (q[1] - p[1]) / (q[0] - p[0]) };
}
/* 判定。基準が無い・値が無いときは null（何も出さない） */
function judge(item, val, ctx) {
  const t = String(item['基準の型'] || 'なし');
  const b1 = Number(item['基準1']), b2 = Number(item['基準2']);
  if (val == null || val === '' || isNaN(val)) return null;
  const ok = h => ({ cls: 'ok', txt: '達成', hint: h }), ng = (w, h) => ({ cls: 'ng', txt: w, hint: h });
  if (t === '範囲') return (val >= b1 && val <= b2) ? ok(`目安 ${b1}〜${b2}`) : ng('範囲外', `目安 ${b1}〜${b2}`);
  if (t === '下限') return val >= b1 ? ok(`${b1}以上`) : ng('不足', `${b1}以上`);
  if (t === '上限') return val <= b1 ? ok(`${b1}以下`) : ng('超過', `${b1}以下`);
  if (t === '球速連動') {
    const s = veloStandard(item, ctx && ctx.target);
    if (!s) return null;
    if (s.out) return { cls: 'na', txt: '基準の外', hint: `目標球速 ${s.lo}〜${s.hi} の範囲で判定します` };
    const need = s.val.toFixed(Number(item['小数桁'] || 0));
    return val >= s.val ? ok(`必要 ${need}`) : ng('不足', `必要 ${need}`);
  }
  return null;
}
function judgeDiff(item, l, r) {
  if (String(item['基準の型']) !== '左右差' || l == null || r == null) return null;
  const mx = Math.max(Math.abs(l), Math.abs(r)); if (!mx) return null;
  const d = Math.abs(l - r) / mx * 100, lim = Number(item['基準1']);
  return { pct: d, cls: d <= lim ? 'ok' : 'ng', txt: d.toFixed(1) + '%', hint: `左右差 ${lim}%以内が目安` };
}
function spark(hist, w, h) {
  if (hist.length < 2) return '';
  const vs = hist.map(x => x.v), lo = Math.min(...vs), hi = Math.max(...vs), sp = (hi - lo) || 1;
  const pts = hist.map((x, i) => [(4 + i * (w - 8) / (hist.length - 1)).toFixed(1), (h - 5 - (x.v - lo) / sp * (h - 12)).toFixed(1)]);
  const e = pts[pts.length - 1];
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <polyline fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" points="${pts.map(p => p.join(',')).join(' ')}"/>
    <circle cx="${e[0]}" cy="${e[1]}" r="2.8" fill="var(--gold)"/></svg>`;
}

/* ================= 本体 ================= */
export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-physical'; st.textContent = CSS; document.head.appendChild(st);
  const { api, esc, store } = CORE;
  const $ = s => ROOT.querySelector(s);
  /* 選手がログインしているとき：自分の記録だけを受け取り、「選手別」の自分のページだけを出す */
  const SELF = CORE.role() === '選手';
  const CACHE = SELF ? 'ph-me' : 'ph';

  let view = SELF ? 'player' : (['in', 'item', 'player'].indexOf(store.get('ph-view')) >= 0 ? store.get('ph-view') : 'in');
  let ITEMS = [], NROWS = 0, IDX = new Map(), CELL = new Map(), ALL = [], PLAYERS = [];
  let selItem = '', selItem2 = '', selPlayer = '', selDate = today(), selClass = '';
  let draft = {};            // 入力中の値  key: 選手ID|項目ID|側|測定日
  let loaded = false, busy = false, msg = '', msgOk = false, loadedAt = 0;

  /* ---- 受け取ったものを使える形にする ---- */
  function applyPlayers(list) {
    ALL = (list || []).slice();
    PLAYERS = ALL.filter(x => !String(x['状態'] || ''))
      .sort((a, b) => (Number(a['順']) || 0) - (Number(b['順']) || 0) || String(a['かな'] || a['氏名']).localeCompare(String(b['かな'] || b['氏名']), 'ja'));
    if (!PLAYERS.some(p => String(p['選手ID']) === selPlayer)) selPlayer = PLAYERS.length ? String(PLAYERS[0]['選手ID']) : '';
    if (selClass && !classes().some(c => c.v === selClass)) selClass = '';
  }
  function applyPhys(p) {
    ITEMS = (p.items || []).slice().sort((a, b) => (Number(a['順']) || 0) - (Number(b['順']) || 0));
    IDX = new Map(); CELL = new Map(); NROWS = 0;
    (p.rows || []).forEach(r => {
      const v = Number(r[4]); if (r[4] === '' || r[4] == null || !isFinite(v)) return;
      const k = r[0] + '|' + r[2] + '|' + (r[3] || '');
      let a = IDX.get(k); if (!a) { a = []; IDX.set(k, a); }
      a.push({ d: String(r[1]), v }); CELL.set(k + '|' + r[1], v); NROWS++;
    });
    IDX.forEach(a => a.sort((x, y) => x.d < y.d ? -1 : x.d > y.d ? 1 : 0));
    const measured = ITEMS.filter(i => i['入力種別'] !== '算出');
    if (!measured.some(i => String(i['項目ID']) === selItem)) selItem = measured.length ? String(measured[0]['項目ID']) : '';
    if (!ITEMS.some(i => String(i['項目ID']) === selItem2)) selItem2 = selItem;
  }
  function applySelf(me) {
    if (!me || !me.pid) return;
    applyPlayers([{ '選手ID': me.pid, '氏名': me.name, '投': me.hand || '', '状態': '', '順': 0 }]);
    selPlayer = String(me.pid);
  }
  function warmStart() {      // 通信を待たずに、まず前回の内容を出す
    const c = store.get(CACHE); if (!c || !c.items) return;
    if (SELF) { if (!c.me) return; applySelf(c.me); } else { if (!c.players) return; applyPlayers(c.players); }
    applyPhys(c); loaded = true;
  }
  async function load() {
    if (busy) return;
    busy = true; if (!loaded) render();
    try {
      let pack;
      if (SELF) {
        const p = await api('getMyPhysical');
        if (!p.ok) throw new Error(p.error || 'フィジカルのデータを取れませんでした');
        applySelf(p.me); applyPhys(p);
        pack = { items: p.items, rows: p.rows, me: p.me };
      } else {
        const [m, p] = await Promise.all([api('getMaster'), api('getPhysical')]);
        if (!m.ok) throw new Error(m.error || '選手名簿を取れませんでした');
        if (!p.ok) throw new Error(p.error || 'フィジカルのデータを取れませんでした');
        applyPlayers(m.master.players); applyPhys(p);
        pack = { items: p.items, rows: p.rows, players: m.master.players };
      }
      store.set(CACHE, pack);
      loaded = true; loadedAt = Date.now();
      if (!msgOk) msg = '';
    } catch (e) { msg = String(e.message || e); msgOk = false; }
    busy = false; render();
  }

  /* ---- 取り出し ---- */
  const item = id => ITEMS.find(i => String(i['項目ID']) === String(id));
  const player = pid => ALL.find(x => String(x['選手ID']) === String(pid));
  const sides = it => (String(it['左右']) === '左右' ? ['左', '右'] : ['']);
  const dec = it => Number(it['小数桁'] || 0);
  function hist(pid, iid, side) {            // 古い順の [{d,v}]
    const it = item(iid);
    if (it && it['入力種別'] === '算出') return derivedHist(pid, iid, side);
    return IDX.get(pid + '|' + iid + '|' + (side || '')) || [];
  }
  function derivedHist(pid, iid, side) {
    const def = DERIVED[iid]; if (!def) return [];
    const byDate = {};
    def.need.forEach(src => {
      const si = item(src), sideFor = si && String(si['左右']) === '左右' ? side : '';
      (IDX.get(pid + '|' + src + '|' + (sideFor || '')) || []).forEach(x => { (byDate[x.d] = byDate[x.d] || {})[src] = x.v; });
    });
    return Object.keys(byDate).sort().map(d => { const v = def.calc(byDate[d]); return v == null || !isFinite(v) ? null : { d, v }; }).filter(Boolean);
  }
  const last = (pid, iid, side) => { const h = hist(pid, iid, side); return h.length ? h[h.length - 1] : null; };
  const target = pid => { const t = last(pid, 'm-target', ''); return t ? t.v : null; };
  function sideWord(pid, it, side) {
    if (!side) return '';
    if (String(it['カテゴリ']) === '打撃') return side + '打席';
    const p = player(pid), th = p ? String(p['投'] || '') : '';
    if (th !== '左' && th !== '右') return '';
    const iid = String(it['項目ID']);
    if (LEG_ITEMS.indexOf(iid) >= 0) return side === th ? '軸足' : '着地脚';
    if (ARM_ITEMS.indexOf(iid) >= 0) return side === th ? '投げる側' : '反対側';
    return '';
  }
  /* 前回との差。良い方向が決まっている種目だけ色を付ける */
  function delta(it, v, p) {
    if (!v || !p) return '';
    const dl = v.v - p.v; if (Math.abs(dl) < 1e-9) return '';
    const good = String(it['良い方向'] || '');
    const cls = good === '大きいほど良い' ? (dl > 0 ? 'up' : 'dn') : good === '小さいほど良い' ? (dl < 0 ? 'up' : 'dn') : 'fl';
    return `<small class="dlt ${cls}">${dl > 0 ? '+' : '−'}${Math.abs(dl).toFixed(dec(it))}</small>`;
  }
  const sub = p => { const g = schoolGrade(p['生年月日']), c = String(p['クラス'] || ''); return [g, c].filter(Boolean).join(' ／ '); };
  function classes() {
    const names = []; let none = false;
    PLAYERS.forEach(p => { const c = String(p['クラス'] || ''); if (!c) none = true; else if (names.indexOf(c) < 0) names.push(c); });
    if (!names.length) return [];
    const out = names.sort((a, b) => a.localeCompare(b, 'ja')).map(c => ({ v: c, l: c }));
    if (none) out.push({ v: NOCLASS, l: '（クラスなし）' });
    return out;
  }
  const shown = () => !selClass ? PLAYERS : PLAYERS.filter(p => selClass === NOCLASS ? !String(p['クラス'] || '') : String(p['クラス'] || '') === selClass);

  /* ---- 選ぶ欄 ---- */
  function itemSelect(id, sel, measuredOnly) {
    const list = ITEMS.filter(i => !(measuredOnly && i['入力種別'] === '算出')), cats = [];
    list.forEach(i => { const c = String(i['カテゴリ']); if (cats.indexOf(c) < 0) cats.push(c); });
    return `<select id="${id}">` + cats.map(c => `<optgroup label="${esc(c)}">` + list.filter(i => String(i['カテゴリ']) === c)
      .map(i => `<option value="${esc(i['項目ID'])}"${String(i['項目ID']) === sel ? ' selected' : ''}>${esc(i['項目名'])}</option>`).join('') + '</optgroup>').join('') + '</select>';
  }
  function classSelect() {
    const cs = classes(); if (!cs.length) return '';
    return `<label class="f">クラス<select id="ph-class"><option value="">すべて</option>${cs.map(c => `<option value="${esc(c.v)}"${c.v === selClass ? ' selected' : ''}>${esc(c.l)}</option>`).join('')}</select></label>`;
  }
  function itemNote(it) {
    const bits = [], t = String(it['基準の型'] || 'なし');
    if (t === '範囲') bits.push(`目安 ${esc(it['基準1'])}〜${esc(it['基準2'])} ${esc(it['単位'] || '')}`);
    if (t === '下限') bits.push(`${esc(it['基準1'])} 以上`);
    if (t === '上限') bits.push(`${esc(it['基準1'])} 以下`);
    if (t === '左右差') bits.push(`左右差 ${esc(it['基準1'])}% 以内`);
    if (t === '球速連動') bits.push(`目標球速に応じて変わる（${esc(it['基準1'])} ／ ${esc(it['基準2'])}）`);
    if (String(it['左右']) === '左右') bits.push('左右それぞれ記録');
    if (it['入力種別'] === '算出') bits.push('同じ日に測った値から計算');
    const note = String(it['出典メモ'] || '');
    if (!bits.length && !note) return '';
    return `<div class="note">${bits.length ? '<b>' + bits.join('　/　') + '</b><br>' : ''}${esc(note)}</div>`;
  }

  /* ================= 画面：入力 ================= */
  const draftCount = () => Object.keys(draft).length;
  function viewInput() {
    const it = item(selItem);
    if (!it) return '<div class="empty">入力できる種目がありません</div>';
    const ss = sides(it), d = dec(it), unit = String(it['単位'] || ''), list = shown();
    const rows = list.map(p => {
      const pid = String(p['選手ID']);
      const tds = ss.map(sd => {
        const ck = pid + '|' + selItem + '|' + sd, k = ck + '|' + selDate;
        const saved = CELL.get(k);
        const v = (k in draft) ? draft[k] : (saved != null ? saved : '');
        const cls = (k in draft) ? 'in dirty' : (saved != null ? 'in has' : 'in');
        return `<td class="n"><input class="${cls}" type="number" inputmode="decimal" step="any" data-k="${esc(k)}" value="${esc(v)}" aria-label="${esc(p['氏名'])} ${sd}"></td>`;
      }).join('');
      const pv = ss.map(sd => { const h = hist(pid, selItem, sd).filter(x => x.d !== selDate); return h.length ? h[h.length - 1] : null; });
      const hint = pv.some(Boolean)
        ? pv.map((q, i) => q ? (ss[i] ? ss[i] + ' ' : '') + num(q.v, d) : '—').join(' / ') + ` <span class="muted">（${esc(pv.find(Boolean).d)}）</span>`
        : '<span class="muted">前回なし</span>';
      const s2 = sub(p);
      return `<tr><td class="nm">${esc(p['氏名'])}${s2 ? `<small>${esc(s2)}</small>` : ''}</td>${tds}<td class="muted hide-s" style="font-size:12px">${hint}</td></tr>`;
    }).join('');
    const head = ss.map(sd => `<th class="n">${sd || '値'}${unit ? ' ' + esc(unit) : ''}</th>`).join('');
    const n = draftCount();
    return `
    <div class="bar stick">
      <label class="f">測定日<input type="date" id="ph-date" value="${esc(selDate)}" max="2100-12-31"></label>
      <label class="f">種目${itemSelect('ph-item', selItem, true)}</label>
      ${classSelect()}
      <div class="acts">
        <span class="muted" id="ph-n" style="font-size:12px">${n ? '未保存 ' + n + '件' : ''}</span>
        <button class="b" id="ph-clear" ${n ? '' : 'disabled'}>取消</button>
        <button class="b primary" id="ph-save" ${n ? '' : 'disabled'}>保存</button>
      </div>
    </div>
    ${itemNote(it)}
    <p class="note">数字を消して保存すると、その記録を消します。日付や種目を切り替えても、未保存の入力は残ります。</p>
    <div class="card"><div class="tw"><table id="ph-intable">
      <tr><th>選手（${list.length}人）</th>${head}<th class="hide-s">前回</th></tr>${rows || `<tr><td colspan="${ss.length + 2}" class="muted">選手がいません（管理の「選手名簿」で登録してください）</td></tr>`}
    </table></div></div>`;
  }

  /* ================= 画面：種目別 ================= */
  function viewItem() {
    const it = item(selItem2);
    if (!it) return '<div class="empty">種目がありません</div>';
    const ss = sides(it), d = dec(it), unit = String(it['単位'] || ''), good = String(it['良い方向'] || '');
    const isDiff = ss.length === 2 && String(it['基準の型']) === '左右差';
    const rows = shown().map(p => {
      const pid = String(p['選手ID']);
      const hs = ss.map(sd => hist(pid, selItem2, sd));
      const vals = hs.map(h => h.length ? h[h.length - 1] : null), pvs = hs.map(h => h.length > 1 ? h[h.length - 2] : null);
      const have = vals.filter(Boolean);
      const rep = have.length ? have.reduce((a, x) => a + x.v, 0) / have.length : null;      // 並べるための値（左右があれば、ある分の平均）
      return { pid, p, vals, pvs, rep, date: have.length ? have.map(x => x.d).sort().pop() : '' };
    });
    const have = rows.filter(r => r.rep != null), none = rows.filter(r => r.rep == null);
    const mx = have.length ? Math.max(...have.map(r => Math.abs(r.rep))) : 0;
    have.sort((a, b) => good === '小さいほど良い' ? a.rep - b.rep : b.rep - a.rep);
    const body = have.map((r, i) => {
      const cells = r.vals.map((v, k) => `<td class="n">${v ? num(v.v, d) : '—'}${delta(it, v, r.pvs[k])}</td>`).join('');
      let jd = '<td class="muted">—</td>';
      if (isDiff) {
        const j = judgeDiff(it, r.vals[0] && r.vals[0].v, r.vals[1] && r.vals[1].v);
        if (j) jd = `<td><span class="pill ${j.cls}">${j.txt}</span></td>`;
      } else if (ss.length === 2) {
        const ps = r.vals.map((v, k) => { const j = v ? judge(it, v.v, { target: target(r.pid) }) : null; return j ? `<span class="pill ${j.cls}">${ss[k]} ${j.txt}</span>` : ''; }).filter(Boolean).join(' ');
        if (ps) jd = `<td>${ps}</td>`;
      } else {
        const j = judge(it, r.rep, { target: target(r.pid) });
        if (j) jd = `<td><span class="pill ${j.cls}">${j.txt}</span><small class="muted hide-s" style="margin-left:6px">${esc(j.hint || '')}</small></td>`;
      }
      const w = mx ? Math.max(3, Math.abs(r.rep) / mx * 100) : 0, s2 = sub(r.p);
      return `<tr${r.pid === selPlayer ? ' class="me"' : ''}>
        <td class="muted" style="width:1.6em">${i + 1}</td>
        <td class="nm"><a href="#" data-goto="${esc(r.pid)}">${esc(r.p['氏名'])}</a>${s2 ? `<small>${esc(s2)}</small>` : ''}</td>
        ${cells}${jd}
        <td class="g"><div class="gauge"><i style="width:${w.toFixed(1)}%"></i></div></td>
        <td class="muted hide-s" style="font-size:12px">${esc(r.date)}</td></tr>`;
    }).join('');
    const head = ss.map(sd => `<th class="n">${sd || '値'}</th>`).join('');
    const hasStd = String(it['基準の型'] || 'なし') !== 'なし';
    return `
    <div class="bar">
      <label class="f">種目${itemSelect('ph-item2', selItem2, false)}</label>
      ${classSelect()}
      <div class="acts"><button class="b" id="ph-print">印刷・PDFで保存</button></div>
    </div>
    ${itemNote(it)}
    <div class="card">
      <h3>${esc(it['項目名'])}<span class="u">${esc(unit)}${good ? '　' + esc(good) : ''}　それぞれの最新の値</span></h3>
      ${have.length ? `<div class="tw"><table id="ph-ranktable"><tr><th></th><th>選手（${have.length}人）</th>${head}<th>${isDiff ? '左右差' : (hasStd ? '判定' : '')}</th><th class="g"></th><th class="hide-s">測定日</th></tr>${body}</table></div>`
        : '<div class="empty">データなし（この種目はまだ記録がありません）</div>'}
      ${none.length ? `<details class="noprint" id="ph-none"><summary>まだ測っていない選手 ${none.length}人</summary><p class="src" style="border:0">${none.map(r => esc(r.p['氏名'])).join('、')}</p></details>` : ''}
    </div>`;
  }

  /* ================= 画面：選手別 ================= */
  function viewPlayer() {
    const p = player(selPlayer);
    if (!selPlayer || !p) return `<div class="empty">${SELF ? 'データなし' : '選手がいません（管理の「選手名簿」で登録してください）'}</div>`;
    const tg = target(selPlayer);
    const cats = [];
    ITEMS.forEach(i => { const c = String(i['カテゴリ']); if (c !== '目標' && cats.indexOf(c) < 0) cats.push(c); });
    function card(it) {
      const iid = String(it['項目ID']), d = dec(it), ss = sides(it);
      const hs = ss.map(sd => hist(selPlayer, iid, sd));
      if (!hs.some(h => h.length)) return '';
      const rows = ss.map((sd, k) => {
        const h = hs[k];
        const w = sideWord(selPlayer, it, sd);
        const lab = sd ? `<td>${esc(sd)}${w === sd + '打席' ? '打席' : (w ? `<small class="muted"> ${esc(w)}</small>` : '')}</td>` : '';
        if (!h.length) return sd ? `<tr>${lab}<td class="n muted">—</td><td class="muted" style="white-space:normal;font-size:12px">データなし</td><td></td></tr>` : '';
        const v = h[h.length - 1], pv = h.length > 1 ? h[h.length - 2] : null;
        const j = String(it['基準の型']) === '左右差' ? null : judge(it, v.v, { target: tg });   // 左右差で見る種目以外は、片側ごとに基準と突き合わせる
        return `<tr>${lab}
          <td class="n">${num(v.v, d)}${delta(it, v, pv)}</td>
          <td style="white-space:normal">${j ? `<span class="pill ${j.cls}">${j.txt}</span><small class="muted" style="margin-left:5px">${esc(j.hint || '')}</small>` : ''}</td>
          <td style="width:68px">${spark(h, 62, 24)}</td></tr>`;
      }).join('');
      let diff = '';
      if (ss.length === 2) {
        const j = judgeDiff(it, hs[0].length ? hs[0][hs[0].length - 1].v : null, hs[1].length ? hs[1][hs[1].length - 1].v : null);
        if (j) diff = `<div class="src"><span class="pill ${j.cls}">左右差 ${j.txt}</span> <span class="muted">${esc(j.hint)}</span></div>`;
      }
      const dates = hs.map(h => h.length ? h[h.length - 1].d : '').filter(Boolean);
      const dtxt = dates.length ? (dates.every(x => x === dates[0]) ? dates[0] : dates.join(' / ')) : '';
      const allDates = []; hs.forEach(h => h.forEach(x => { if (allDates.indexOf(x.d) < 0) allDates.push(x.d); }));
      allDates.sort().reverse();
      const histTbl = allDates.length > 1 ? `<details class="noprint"><summary>これまでの記録（${allDates.length}回）</summary><div class="tw"><table>
        <tr><th>測定日</th>${ss.map(sd => `<th class="n">${sd || '値'}</th>`).join('')}</tr>
        ${allDates.map(dt => `<tr><td>${esc(dt)}</td>${hs.map(h => { const x = h.find(y => y.d === dt); return `<td class="n">${x ? num(x.v, d) : '—'}</td>`; }).join('')}</tr>`).join('')}</table></div></details>` : '';
      const note = String(it['出典メモ'] || '');
      return `<div class="card" data-item="${esc(iid)}"><h3>${esc(it['項目名'])}<span class="u">${esc(it['単位'] || '')}${dtxt ? '　' + esc(dtxt) : ''}</span></h3>
        <div class="tw"><table>${rows}</table></div>${diff}${histTbl}${note && !SELF ? `<div class="src noprint">${esc(note)}</div>` : ''}</div>`;
    }
    const blocks = cats.map(c => {
      const cards = ITEMS.filter(i => String(i['カテゴリ']) === c).map(card).filter(Boolean).join('');
      return cards ? `<div class="cat">${esc(c)}</div><div class="grid2">${cards}</div>` : '';
    }).join('');
    const list = shown();
    const opts = (list.some(x => String(x['選手ID']) === selPlayer) ? list : [p].concat(list))
      .map(x => `<option value="${esc(x['選手ID'])}"${String(x['選手ID']) === selPlayer ? ' selected' : ''}>${esc(x['氏名'])}</option>`).join('');
    const s2 = sub(p);
    const tgTxt = tg ? `目標球速 <b style="font-size:14px">${esc(tg)}</b> km/h`
      : (SELF ? '' : '目標球速は未入力（入力の「目標球速」で登録すると、球速連動の基準が出ます）');
    return `
    ${SELF ? '' : `<div class="bar">${classSelect()}<label class="f">選手<select id="ph-player">${opts}</select></label>
      <div class="acts"><button class="b" id="ph-print">印刷・PDFで保存</button></div></div>`}
    <div class="who" id="ph-who"><b>${esc(p['氏名'])}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}<span>${tgTxt}</span><span>作成 ${today()}</span><span class="po">取扱注意</span></div>
    ${blocks || '<div class="empty">データなし（まだ記録がありません）</div>'}`;
  }

  /* ================= 描画 ================= */
  function render() {
    const sy = window.scrollY;
    if (SELF) view = 'player';
    const tabs = SELF ? [] : [['in', '入力'], ['item', '種目別'], ['player', '選手別']];
    const body = !loaded
      ? (busy ? '<div class="empty">読み込んでいます…</div>'
              : `<div class="empty"><span id="ph-loaderr">${esc(msg || 'まだ読み込んでいません')}</span><br><br><button class="b" id="ph-reload">読み込む</button></div>`)
      : (view === 'in' ? viewInput() : view === 'item' ? viewItem() : viewPlayer());
    ROOT.innerHTML = `<div class="pw">
      <div class="hd">
        <h2>フィジカル</h2>
        <span class="sub">${!loaded ? '' : SELF ? `記録 ${NROWS}件` : `選手 ${PLAYERS.length}人・記録 ${NROWS}件`}</span>
        <div class="sp">
          ${tabs.length ? `<div class="seg">${tabs.map(([k, n]) => `<button data-v="${k}" aria-pressed="${view === k}">${n}</button>`).join('')}</div>` : ''}
          <button class="b" id="ph-refresh">最新にする</button>
          ${SELF && loaded ? '<button class="b" id="ph-print">印刷・PDFで保存</button>' : ''}
        </div>
      </div>
      ${msg && loaded ? `<div class="note ${msgOk ? 'okmsg' : 'err'}" id="ph-msg">${esc(msg)}</div>` : ''}
      ${body}</div>`;
    if (sy) window.scrollTo(0, sy);
  }

  /* ================= 操作 ================= */
  ROOT.addEventListener('click', async e => {
    const v = e.target.closest('[data-v]');
    if (v) { if (!SELF) { view = v.dataset.v; store.set('ph-view', view); } render(); window.scrollTo(0, 0); return; }
    const g = e.target.closest('[data-goto]');
    if (g) { e.preventDefault(); selPlayer = g.dataset.goto; view = 'player'; render(); window.scrollTo(0, 0); return; }
    if (e.target.id === 'ph-reload' || e.target.id === 'ph-refresh') { msg = ''; load(); return; }
    if (e.target.id === 'ph-clear') { draft = {}; msg = ''; render(); return; }
    if (e.target.id === 'ph-print') { window.print(); return; }
    if (e.target.id === 'ph-save') { if (!SELF) await save(); return; }
  });
  ROOT.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'ph-date')   { selDate = /^\d{4}-\d{2}-\d{2}$/.test(t.value) ? t.value : today(); render(); }
    if (t.id === 'ph-item')   { selItem = t.value; render(); }
    if (t.id === 'ph-item2')  { selItem2 = t.value; render(); }
    if (t.id === 'ph-class')  { selClass = t.value; const l = shown(); if (view === 'player' && l.length && !l.some(x => String(x['選手ID']) === selPlayer)) selPlayer = String(l[0]['選手ID']); render(); }
    if (t.id === 'ph-player') { selPlayer = t.value; render(); }
  });
  ROOT.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k; if (!k) return;
    const saved = CELL.get(k), val = e.target.value.trim();
    if (val === (saved != null ? String(saved) : '')) { delete draft[k]; e.target.classList.remove('dirty'); }   // 元に戻したら、未保存から外す
    else { draft[k] = val; e.target.classList.add('dirty'); }
    const n = draftCount(), s = $('#ph-save'), c = $('#ph-clear'), l = $('#ph-n');
    if (s) s.disabled = !n; if (c) c.disabled = !n; if (l) l.textContent = n ? '未保存 ' + n + '件' : '';
  });
  window.addEventListener('beforeunload', e => { if (draftCount()) { e.preventDefault(); e.returnValue = ''; } });

  async function save() {
    if (busy) return;
    const rows = [], now = Date.now(); let bad = 0;
    Object.keys(draft).forEach(k => {
      const [pid, iid, sd, d] = k.split('|'), raw = draft[k];
      if (raw !== '' && !isFinite(Number(raw))) { bad++; return; }
      rows.push({ '選手ID': pid, '測定日': d, '項目ID': iid, '側': sd, '値': raw === '' ? '' : Number(raw), '更新日時': now });
    });
    if (bad) { msg = '数字として読めない入力が ' + bad + '件あります。直してから保存してください'; msgOk = false; render(); return; }
    const btn = $('#ph-save'); if (btn) { btn.disabled = true; btn.textContent = '保存中…'; }
    busy = true;
    try {
      const j = await api('upsertMeasures', { rows });
      if (!j.ok) throw new Error(j.error || '保存できませんでした');
      draft = {}; busy = false;
      msg = `保存しました（追加${j.added || 0}・更新${j.updated || 0}${j.removed ? '・削除' + j.removed : ''}${j.skipped ? '・受け付けなかったもの' + j.skipped : ''}）`; msgOk = !j.skipped;
      await load();
      setTimeout(() => { if (msgOk) { msg = ''; msgOk = false; const m = $('#ph-msg'); if (m) m.remove(); } }, 5000);
    } catch (e) { msg = String(e.message || e); msgOk = false; busy = false; render(); }
  }

  /* タブを開き直したとき、5分以上たっていれば取り直す（入力の途中では取り直さない） */
  ROOT.addEventListener('bt:show', () => { if (!busy && (!loaded || (Date.now() - loadedAt > 5 * 60000 && !draftCount()))) load(); });
  warmStart();
  render();
  load();
}
