import { schoolGrade, monthsOld, DERIVED } from './mod-physical.js?v=202610070331';

/* 解析（管理・スタッフだけ。選手には出さない。全員分のデータは、サーバーが選手には返さない）
   2つの項目の関係（相関）を、選手1人を1つの点として見る。
   ・測った値と、そこから計算できる値だけを使う。無い選手は点にしない（埋めない）
   ・クラス・年齢・投げる手・期間・もう1つの項目の条件で絞れる */

const CSS = `
#tab-analysis .aw{ max-width:1100px; margin:0 auto; padding:12px 14px 60px }
#tab-analysis h2{ margin:6px 2px 12px; font-size:17px; letter-spacing:.05em }
#tab-analysis .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:12px 14px; margin-bottom:12px; min-width:0 }
#tab-analysis .card h3{ margin:0 0 9px; font-size:13.5px; letter-spacing:.04em; color:var(--ink2) }
#tab-analysis .grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr)); gap:9px 12px }
#tab-analysis label.f{ display:flex; flex-direction:column; gap:3px; font-size:11px; color:var(--muted); min-width:0 }
#tab-analysis select, #tab-analysis input[type=number], #tab-analysis input[type=date]{ font-size:16px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:7px 8px; width:100%; min-width:0 }
#tab-analysis .pair{ display:flex; gap:5px; align-items:center } #tab-analysis .pair > *{ flex:1 1 0; min-width:0 } #tab-analysis .pair > span{ flex:0 0 auto; color:var(--muted) }
#tab-analysis .chips{ display:flex; flex-wrap:wrap; gap:6px; margin-top:3px }
#tab-analysis .chip{ display:inline-flex; align-items:center; gap:5px; font-size:13px; color:var(--ink); border:1px solid var(--line); border-radius:999px; padding:5px 11px; cursor:pointer; background:var(--paper) }
#tab-analysis .chip input{ width:16px; height:16px; accent-color:var(--accent); margin:0 }
#tab-analysis .chip:has(input:checked){ border-color:var(--accent); background:var(--raise); font-weight:700 }
#tab-analysis .sec{ font-size:11px; color:var(--muted); margin:12px 0 0 }
#tab-analysis button.b{ appearance:none; font-size:14px; cursor:pointer; border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:8px; padding:7px 12px }
#tab-analysis .stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(118px,1fr)); gap:8px; margin-bottom:10px }
#tab-analysis .stat{ background:var(--raise); border-radius:9px; padding:8px 10px; min-width:0 }
#tab-analysis .stat small{ display:block; font-size:11px; color:var(--muted) }
#tab-analysis .stat b{ font-family:var(--num); font-size:21px; color:var(--ink) }
#tab-analysis .stat span{ font-size:11px; color:var(--muted); margin-left:4px }
#tab-analysis .say{ font-size:14px; line-height:1.7; color:var(--ink); margin:0 0 8px }
#tab-analysis .note{ font-size:12px; color:var(--muted); line-height:1.7; margin:4px 0 0 }
#tab-analysis .plot{ position:relative; max-width:760px; margin:0 auto }
#tab-analysis svg{ display:block; width:100%; height:auto; overflow:visible }
#tab-analysis svg text{ font-family:var(--jp); fill:var(--muted); font-size:11.5px }
#tab-analysis svg text.ttl{ fill:var(--ink2); font-size:12.5px; font-weight:600 }
#tab-analysis svg .gridl{ stroke:var(--line); stroke-width:1 }
#tab-analysis svg .pt{ fill:var(--accent); stroke:var(--paper); stroke-width:2; cursor:pointer }
#tab-analysis svg .pt.out{ fill:var(--paper); stroke:var(--muted); stroke-dasharray:2 2 }
#tab-analysis svg .pt.hot{ fill:var(--gold) }
#tab-analysis svg .fit{ stroke:var(--gold); stroke-width:2; fill:none; stroke-linecap:round }
#tab-analysis .tip{ position:absolute; pointer-events:none; background:var(--paper); color:var(--ink); border:1px solid var(--line); border-radius:8px; padding:6px 9px; font-size:12px; line-height:1.5;
  box-shadow:0 4px 14px rgba(0,0,0,.18); white-space:nowrap; z-index:5 }
#tab-analysis .tip b{ display:block; font-size:13px } #tab-analysis .tip i{ font-style:normal; color:var(--muted) }
#tab-analysis .empty{ padding:26px; text-align:center; color:var(--muted); font-size:13px; border:1px dashed var(--line); border-radius:var(--r) }
#tab-analysis .tw{ overflow-x:auto }
#tab-analysis table{ width:100%; border-collapse:collapse; font-size:13px }
#tab-analysis th, #tab-analysis td{ padding:5px 8px; border-bottom:1px solid var(--line); text-align:left; white-space:nowrap }
#tab-analysis th{ font-size:11px; color:var(--muted); font-weight:600 }
#tab-analysis td.n, #tab-analysis th.n{ text-align:right; font-family:var(--num) } #tab-analysis th.n{ font-family:var(--jp) }
#tab-analysis tr.out td{ color:var(--muted); text-decoration:line-through }
#tab-analysis details summary{ cursor:pointer; font-size:13px; padding:4px 0; color:var(--ink2) }
@media print{ #tab-analysis .noprint{ display:none !important } #tab-analysis .card{ break-inside:avoid } }
`;

/* ---------------- 計算（画面と切り離してあるので、単体で確かめられる） ---------------- */
function ranks(a) {
  const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = new Array(a.length);
  for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const rk = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[idx[k][1]] = rk; i = j + 1; }
  return r;
}
function pearson(xs, ys) {
  const n = xs.length; if (n < 3) return null;
  let sx = 0, sy = 0; for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
  const mx = sx / n, my = sy / n; let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; sxx += a * a; syy += b * b; sxy += a * b; }
  if (sxx < 1e-12 || syy < 1e-12) return null;                       // どちらかが全員同じ値なら、相関は出せない
  const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
  return { r, slope: sxy / sxx, icpt: my - sxy / sxx * mx, mx, my };
}
/* 相関のまとめ。n が3未満、またはどちらかにばらつきが無いときは r を出さない */
export function correlate(xs, ys) {
  const n = xs.length, out = { n, r: null, r2: null, rho: null, lo: null, hi: null, slope: null, icpt: null };
  const p = pearson(xs, ys); if (!p) return out;
  out.r = p.r; out.r2 = p.r * p.r; out.slope = p.slope; out.icpt = p.icpt;
  const s = pearson(ranks(xs), ranks(ys)); out.rho = s ? s.r : null;
  if (n >= 4 && Math.abs(p.r) < 1) {                                  // 95%の幅（フィッシャーのz変換）
    const z = Math.atanh(p.r), se = 1 / Math.sqrt(n - 3);
    out.lo = Math.tanh(z - 1.96 * se); out.hi = Math.tanh(z + 1.96 * se);
  }
  return out;
}
function niceTicks(lo, hi, want) {
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
  const raw = (hi - lo) / want, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
  const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, t = [];
  for (let v = a; v <= b + step * 1e-6; v += step) t.push(Math.abs(v) < step * 1e-6 ? 0 : v);
  return { lo: a, hi: b, ticks: t, dec: Math.max(0, -Math.floor(Math.log10(step) + 1e-9)) };
}

const AGE = '\u0001age';
/* まとめた項目：種類の違う記録を、1つの項目として扱う（同じ日に複数あれば、大きいほう）。左右の打席もまとめる。
   球の種類や測り方による差は、ならしていない（そのままの数字を使う） */
const GROUPS = {
  '\u0001g-velo':  { label: '球速（J球・M球・硬球をまとめる）', short: '球速（まとめ）', src: ['m-velo-j', 'm-velo-m', 'm-velo-hard'] },
  '\u0001g-swing': { label: 'スイング速度（左右の打席をまとめる）', short: 'スイング速度（まとめ）', src: ['m-swing'] },
  '\u0001g-exit':  { label: '打球速度（ティー・マシン、左右の打席をまとめる）', short: '打球速度（まとめ）', src: ['m-exit-tee', 'm-exit-mach'] }
};
const pad2 = n => String(n).padStart(2, '0');

export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-analysis'; st.textContent = CSS; document.head.appendChild(st);
  const { esc, store } = CORE, D = CORE.data.state;
  const $ = s => ROOT.querySelector(s);

  const saved = store.get('an') || {};
  const S = Object.assign({ x: '', xs: 'avg', y: '', ys: 'avg', mode: 'last', same: false, from: '', to: '', cls: [], a1: '', a2: '', hand: '',
    ci: '', cop: 'ge', cv: '' }, saved);
  let ITEMS = [], IDX = new Map(), PLAYERS = [], excluded = new Set(), points = [], pending = false;

  function pull() {
    ITEMS = (D.items || []).filter(i => String(i['カテゴリ']) !== '目標').slice().sort((a, b) => (Number(a['順']) || 0) - (Number(b['順']) || 0));
    PLAYERS = (D.players || []).slice();
    IDX = new Map();
    D.cells.forEach((v, k) => { const n = Number(v); if (!isFinite(n)) return; const a = k.split('|'), kk = a[0] + '|' + a[1] + '|' + a[2];
      let arr = IDX.get(kk); if (!arr) { arr = []; IDX.set(kk, arr); } arr.push({ d: a[3], v: n }); });
    IDX.forEach(a => a.sort((p, q) => p.d < q.d ? -1 : p.d > q.d ? 1 : 0));
    const ok = id => id === AGE || !!grp(id) || ITEMS.some(i => String(i['項目ID']) === id);
    if (!ok(S.x)) S.x = ITEMS.some(i => i['項目ID'] === 'm-height') ? 'm-height' : (ITEMS[0] ? String(ITEMS[0]['項目ID']) : AGE);
    if (!ok(S.y)) S.y = ITEMS.some(i => i['項目ID'] === 'm-weight') ? 'm-weight' : (ITEMS[1] ? String(ITEMS[1]['項目ID']) : AGE);
    if (S.ci && !ok(S.ci)) S.ci = '';
  }
  const item = id => ITEMS.find(i => String(i['項目ID']) === String(id));
  /* まとめた項目のうち、今ある項目だけを使う。1つも無ければ、選択肢に出さない */
  const grp = id => { const g = GROUPS[id]; if (!g) return null; const src = g.src.filter(x => item(x)); return src.length ? Object.assign({}, g, { src }) : null; };
  const tagOf = (iid, side) => { const n = String((item(iid) || {})['項目名'] || ''), m = /（(.+)）/.exec(n); return [m ? m[1] : '', side ? side + '打席' : ''].filter(Boolean).join('・'); };
  function groupHist(pid, g) {
    const by = new Map();
    g.src.forEach(iid => (twoSided(iid) ? ['左', '右'] : ['']).forEach(sd => rawHist(pid, iid, sd).forEach(x => { const c = by.get(x.d); if (!c || x.v > c.v) by.set(x.d, { d: x.d, v: x.v, tag: tagOf(iid, sd) }); })));
    return [...by.values()].sort((p, q) => p.d < q.d ? -1 : 1);
  }
  const twoSided = id => { const it = item(id); return !!it && String(it['左右']) === '左右'; };
  const inRange = d => (!S.from || d >= S.from) && (!S.to || d <= S.to);
  /* 1人・1項目・片側の、測った日ごとの値（古い順）。算出項目は、同じ日に測った値から計算する */
  function rawHist(pid, iid, side) {
    const it = item(iid);
    if (it && it['入力種別'] === '算出') {
      const def = DERIVED[iid]; if (!def) return [];
      const by = {};
      def.need.forEach(src => { (IDX.get(pid + '|' + src + '|' + (twoSided(src) ? side : '')) || []).forEach(x => { (by[x.d] = by[x.d] || {})[src] = x.v; }); });
      return Object.keys(by).sort().map(d => { const v = def.calc(by[d]); return v == null || !isFinite(v) ? null : { d, v }; }).filter(Boolean);
    }
    return IDX.get(pid + '|' + iid + '|' + (side || '')) || [];
  }
  /* 左右のある項目は、「左右の平均／左／右／大きいほう」を日ごとにまとめる。平均は、その日に両方あるときだけ */
  function hist(pid, iid, sideMode) {
    let h; const g = grp(iid);
    if (g) h = groupHist(pid, g);
    else if (!twoSided(iid)) h = rawHist(pid, iid, '');
    else if (sideMode === '左' || sideMode === '右') h = rawHist(pid, iid, sideMode);
    else {
      const l = rawHist(pid, iid, '左'), rr = rawHist(pid, iid, '右'), r = new Map(rr.map(x => [x.d, x.v]));
      if (sideMode === 'max') {                     // 測った側のうち、大きいほう（片側しか測っていなくても使う）
        const by = new Map(); l.concat(rr).forEach(x => { const c = by.get(x.d); if (!c || x.v > c.v) by.set(x.d, x); });
        h = [...by.values()].sort((p, q) => p.d < q.d ? -1 : 1);
      } else h = l.filter(x => r.has(x.d)).map(x => ({ d: x.d, v: (x.v + r.get(x.d)) / 2 }));
    }
    return h.filter(x => inRange(x.d));
  }
  function pick(h, iid) {                           // 期間内の値を、1人1つにまとめる
    if (!h.length) return null;
    if (S.mode === 'avg') return { v: h.reduce((a, x) => a + x.v, 0) / h.length, d: h.length + '回の平均', n: h.length, last: h[h.length - 1].d };
    if (S.mode === 'best') { const it = item(iid), small = it && String(it['良い方向']) === '小さいほど良い';
      const b = h.reduce((a, x) => (small ? x.v < a.v : x.v > a.v) ? x : a, h[0]); return { v: b.v, d: b.d + (b.tag ? '（' + b.tag + '）' : ''), last: b.d }; }
    const x = h[h.length - 1]; return { v: x.v, d: x.d + (x.tag ? '（' + x.tag + '）' : ''), last: x.d };
  }
  const ageAt = (p, d) => { const m = /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) ? monthsOld(p['生年月日'], new Date(d + 'T12:00:00')) : monthsOld(p['生年月日']); return m; };
  function inFilter(p) {
    const s = String(p['状態'] || ''), c = String(p['クラス'] || '');
    const tag = s === '退会' ? '\u0001left' : s ? '\u0001rest' : (c || '\u0001none');
    if (S.cls.length ? S.cls.indexOf(tag) < 0 : !!s) return false;          // 何も選ばなければ、在籍の全員
    if (S.hand && String(p['投'] || '') !== S.hand) return false;
    if (S.a1 !== '' || S.a2 !== '') { const m = monthsOld(p['生年月日']); if (m == null) return false; const y = m / 12;
      if (S.a1 !== '' && y < Number(S.a1)) return false; if (S.a2 !== '' && y >= Number(S.a2) + 1) return false; }
    if (S.ci && S.cv !== '' && isFinite(Number(S.cv))) {
      let v;
      if (S.ci === AGE) v = monthsOld(p['生年月日']);
      else { const h = hist(String(p['選手ID']), S.ci, 'avg'); v = h.length ? h[h.length - 1].v : null; }
      if (v == null) return false;
      if (S.cop === 'ge' ? v < Number(S.cv) : v > Number(S.cv)) return false;
    }
    return true;
  }
  function compute() {
    points = []; let noX = 0, noY = 0, pool = 0;
    PLAYERS.forEach(p => {
      if (!inFilter(p)) return; pool++;
      const pid = String(p['選手ID']); let X = null, Y = null;
      const hx = S.x === AGE ? null : hist(pid, S.x, S.xs), hy = S.y === AGE ? null : hist(pid, S.y, S.ys);
      if (S.same && hx && hy) {                                     // 同じ日に両方測った組だけ（いちばん新しい日）
        const my = new Map(hy.map(o => [o.d, o])); const c = hx.filter(o => my.has(o.d)).pop(), tg = o => o.d + (o.tag ? '（' + o.tag + '）' : '');
        if (c) { X = { v: c.v, d: tg(c), last: c.d }; Y = { v: my.get(c.d).v, d: tg(my.get(c.d)), last: c.d }; }
      } else { if (hx) X = pick(hx, S.x); if (hy) Y = pick(hy, S.y); }
      if (S.x === AGE) { const m = ageAt(p, Y && Y.last); X = m == null || (S.y !== AGE && !Y) ? null : { v: m, d: Y ? Y.last + ' 時点' : '今日' }; }
      if (S.y === AGE) { const m = ageAt(p, X && X.last); Y = m == null || (S.x !== AGE && !X) ? null : { v: m, d: X && X.last ? X.last + ' 時点' : '今日' }; }
      if (!X) noX++; if (!Y) noY++;
      if (X && Y) points.push({ pid, name: String(p['氏名']), sub: [schoolGrade(p['生年月日']), p['クラス']].filter(Boolean).join(' ／ '), x: X.v, y: Y.v, dx: X.d, dy: Y.d });
    });
    return { pool, noX, noY };
  }

  /* ---------------- 画面 ---------------- */
  const vlabel = (id, sm) => { if (id === AGE) return '月齢'; if (grp(id)) return grp(id).short; const it = item(id); if (!it) return '';
    return String(it['項目名']) + (twoSided(id) ? '（' + ({ avg: '左右の平均', max: '測った側の大きいほう', '左': '左', '右': '右' })[sm] + '）' : ''); };
  const vunit = id => id === AGE ? 'か月' : String((item(grp(id) ? grp(id).src[0] : id) || {})['単位'] || '');
  const vdec = id => id === AGE ? 0 : grp(id) ? 1 : Math.min(3, Number((item(id) || {})['小数桁'] || 0) + (S.mode === 'avg' || twoSided(id) ? 1 : 0));
  function varSelect(id, sel, withNone) {
    const cats = []; ITEMS.forEach(i => { const c = String(i['カテゴリ']); if (cats.indexOf(c) < 0) cats.push(c); });
    const gs = Object.keys(GROUPS).filter(k => grp(k));
    return `<select id="${id}">${withNone ? '<option value="">（条件なし）</option>' : ''}`
      + (gs.length ? `<optgroup label="まとめた項目">${gs.map(k => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(GROUPS[k].label)}</option>`).join('')}</optgroup>` : '') + cats.map(c => `<optgroup label="${esc(c)}">` + ITEMS.filter(i => String(i['カテゴリ']) === c)
      .map(i => `<option value="${esc(i['項目ID'])}"${String(i['項目ID']) === sel ? ' selected' : ''}>${esc(i['項目名'])}</option>`).join('') + '</optgroup>').join('')
      + `<optgroup label="選手"><option value="${AGE}"${sel === AGE ? ' selected' : ''}>月齢（生年月日から）</option></optgroup></select>`;
  }
  const sideSelect = (id, sel, on) => `<select id="${id}" ${on ? '' : 'hidden'} aria-label="左右のどちらを使うか">${[['avg', '左右の平均'], ['max', '測った側の大きいほう'], ['左', '左'], ['右', '右']].map(([v, l]) => `<option value="${v}"${v === sel ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  function classChips() {
    const names = []; let none = false, rest = false, left = false;
    PLAYERS.forEach(p => { const s = String(p['状態'] || ''), c = String(p['クラス'] || ''); if (s === '退会') left = true; else if (s) rest = true; else if (!c) none = true; else if (names.indexOf(c) < 0) names.push(c); });
    const list = names.sort((a, b) => a.localeCompare(b, 'ja')).map(c => [c, c]);
    if (none) list.push(['\u0001none', '（クラスなし）']); if (rest) list.push(['\u0001rest', '休会']); if (left) list.push(['\u0001left', '退会者']);
    S.cls = S.cls.filter(v => list.some(x => x[0] === v));
    return list.map(([v, l]) => `<label class="chip"><input type="checkbox" data-cls="${esc(v)}" ${S.cls.indexOf(v) >= 0 ? 'checked' : ''}>${esc(l)}</label>`).join('');
  }
  function controls() {
    return `<div class="card noprint" id="an-ctl"><h3>くらべる項目</h3>
      <div class="grid">
        <label class="f">よこ軸<span class="pair">${varSelect('an-x', S.x)}${sideSelect('an-xs', S.xs, twoSided(S.x))}</span></label>
        <label class="f">たて軸<span class="pair">${varSelect('an-y', S.y)}${sideSelect('an-ys', S.ys, twoSided(S.y))}</span></label>
        <label class="f">1人につき、どの値を使うか<select id="an-mode" ${S.same ? 'disabled' : ''}>${[['last', 'いちばん新しい値'], ['avg', '期間の平均'], ['best', '期間でいちばん良い値']].map(([v, l]) => `<option value="${v}"${v === S.mode ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <label class="chip" style="margin-top:9px"><input type="checkbox" id="an-same" ${S.same ? 'checked' : ''}>同じ日に両方測った記録だけを使う</label>
      <button class="b" id="an-swap" style="margin-left:6px">よこ・たてを入れ替える</button>
      <p class="sec">絞り込み（何も選ばなければ、在籍の全員）</p>
      <div class="chips" id="an-cls">${classChips() || '<span class="note">クラスはまだ分かれていません</span>'}</div>
      <div class="grid" style="margin-top:10px">
        <label class="f">年齢（歳）<span class="pair"><input type="number" id="an-a1" value="${esc(S.a1)}" min="0" max="99" inputmode="numeric" placeholder="から" aria-label="年齢 から"><span>〜</span><input type="number" id="an-a2" value="${esc(S.a2)}" min="0" max="99" inputmode="numeric" placeholder="まで" aria-label="年齢 まで"></span></label>
        <label class="f">投げる手<select id="an-hand">${[['', 'すべて'], ['右', '右投げ'], ['左', '左投げ']].map(([v, l]) => `<option value="${v}"${v === S.hand ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="f">測定日の期間<span class="pair"><input type="date" id="an-from" value="${esc(S.from)}" max="2100-12-31" aria-label="期間 から"><span>〜</span><input type="date" id="an-to" value="${esc(S.to)}" max="2100-12-31" aria-label="期間 まで"></span></label>
        <label class="f">もう1つの条件（いちばん新しい値で）<span class="pair">${varSelect('an-ci', S.ci, true)}</span></label>
        <label class="f" ${S.ci ? '' : 'hidden'} id="an-cbox">条件の値<span class="pair"><input type="number" id="an-cv" value="${esc(S.cv)}" step="any" inputmode="decimal" aria-label="条件の値"><select id="an-cop"><option value="ge"${S.cop === 'ge' ? ' selected' : ''}>以上</option><option value="le"${S.cop === 'le' ? ' selected' : ''}>以下</option></select></span></label>
      </div></div>`;
  }
  function strength(r) { const a = Math.abs(r); return a < 0.2 ? 'ほとんど関係が見られません' : a < 0.4 ? '弱い関係があります' : a < 0.7 ? '中くらいの関係があります' : '強い関係があります'; }
  function result() {
    const info = compute();
    const used = points.filter(p => !excluded.has(p.pid));
    const c = correlate(used.map(p => p.x), used.map(p => p.y));
    const xl = vlabel(S.x, S.xs), yl = vlabel(S.y, S.ys), xu = vunit(S.x), yu = vunit(S.y), dx = vdec(S.x), dy = vdec(S.y);
    const f2 = v => v == null ? '—' : (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
    if (!points.length) return `<div class="card" id="an-res"><div class="empty" id="an-empty">データなし（この条件で、よこ軸とたて軸の両方がそろっている選手がいません）<br>対象 ${info.pool}人 ／ よこ軸なし ${info.noX}人 ／ たて軸なし ${info.noY}人</div></div>`;
    let say;
    if (c.r == null) say = used.length < 3 ? '点が3つ未満のため、相関は出していません。' : 'どちらかの値が全員同じのため、相関は出せません。';
    else say = `<b>${strength(c.r)}</b>${Math.abs(c.r) >= 0.2 ? `（${esc(xl)}が大きい選手ほど、${esc(yl)}が${c.r > 0 ? '大きい' : '小さい'}傾向）` : ''}。` +
      (c.lo != null ? `人数から見た相関の幅は ${f2(c.lo)} 〜 ${f2(c.hi)} です${c.lo < 0 && c.hi > 0 ? '（0 をまたぐので、たまたまの可能性が残ります）' : ''}。` : '') +
      (used.length < 10 ? ' 人数が少ないので、参考程度に見てください。' : '');
    return `<div class="card" id="an-res">
      <h3>${esc(xl)} と ${esc(yl)}</h3>
      <div class="stats">
        <div class="stat"><small>使った選手</small><b id="an-n">${used.length}</b><span>人</span></div>
        <div class="stat"><small>相関係数 r</small><b id="an-r">${f2(c.r)}</b></div>
        <div class="stat"><small>決定係数 r²</small><b id="an-r2">${c.r2 == null ? '—' : c.r2.toFixed(2)}</b></div>
        <div class="stat"><small>順位の相関</small><b id="an-rho">${f2(c.rho)}</b></div>
      </div>
      <p class="say" id="an-say">${say}</p>
      ${plot(used, c, xl, yl, xu, yu, dx, dy)}
      <p class="note">点は選手1人。点を押すと、その選手を計算から外せます（もう一度押すと戻ります）。${excluded.size ? `<button class="b noprint" id="an-back" style="margin-left:6px">外した ${points.filter(p => excluded.has(p.pid)).length}人を戻す</button>` : ''}</p>
      <p class="note">対象 ${info.pool}人のうち、両方の値がある ${points.length}人を点にしています（よこ軸なし ${info.noX}人 ／ たて軸なし ${info.noY}人）。値の無い選手は、計算で埋めていません。</p>
      ${grp(S.x) || grp(S.y) ? `<p class="note" id="an-gnote">「まとめた項目」は、種類の違う記録を1つとして扱っています（同じ日に複数あれば大きいほう）。球の種類や測り方による数字の差は、ならしていません。どの記録を使ったかは、点に合わせるか、下の表で分かります。</p>` : ''}
      <p class="note">相関は「一緒に動いている」ことを示すだけで、原因までは分かりません。学年が混ざっていると、体の大きさの差だけで相関が強く出ます。年齢やクラスで絞って、同じ傾向が残るかを確かめてください。順位の相関は、とび抜けた値に引っぱられにくい見方です。</p>
      <details id="an-tbl"><summary>表で見る（${points.length}人）</summary><div class="tw"><table>
        <tr><th>選手</th><th class="n">${esc(xl)}${xu ? ' ' + esc(xu) : ''}</th><th class="n">${esc(yl)}${yu ? ' ' + esc(yu) : ''}</th><th>測定日</th></tr>
        ${points.slice().sort((a, b) => b.y - a.y).map(p => `<tr class="${excluded.has(p.pid) ? 'out' : ''}"><td>${esc(p.name)}${p.sub ? ` <small style="color:var(--muted)">${esc(p.sub)}</small>` : ''}</td><td class="n">${p.x.toFixed(dx)}</td><td class="n">${p.y.toFixed(dy)}</td><td style="color:var(--muted);font-size:12px">${esc(p.dx === p.dy ? p.dx : p.dx + ' ／ ' + p.dy)}</td></tr>`).join('')}
      </table></div></details></div>`;
  }
  const W = 640, H = 430, M = { l: 58, r: 16, t: 14, b: 48 };
  function plot(used, c, xl, yl, xu, yu, dx, dy) {
    const xs = points.map(p => p.x), ys = points.map(p => p.y);
    const ax = niceTicks(Math.min(...xs), Math.max(...xs), 6), ay = niceTicks(Math.min(...ys), Math.max(...ys), 5);
    const px = v => M.l + (v - ax.lo) / (ax.hi - ax.lo) * (W - M.l - M.r), py = v => H - M.b - (v - ay.lo) / (ay.hi - ay.lo) * (H - M.t - M.b);
    let fit = '';
    if (c.slope != null && used.length >= 3) {
      const ux = used.map(p => p.x), x1 = Math.min(...ux), x2 = Math.max(...ux);
      fit = `<line class="fit" id="an-fit" x1="${px(x1).toFixed(1)}" y1="${py(c.icpt + c.slope * x1).toFixed(1)}" x2="${px(x2).toFixed(1)}" y2="${py(c.icpt + c.slope * x2).toFixed(1)}"/>`;
    }
    return `<div class="plot" id="an-plot"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(xl)} と ${esc(yl)} の散布図。${used.length}人">
      ${ay.ticks.map(t => `<line class="gridl" x1="${M.l}" x2="${W - M.r}" y1="${py(t).toFixed(1)}" y2="${py(t).toFixed(1)}"/><text x="${M.l - 7}" y="${(py(t) + 4).toFixed(1)}" text-anchor="end">${t.toFixed(Math.min(ay.dec, 3))}</text>`).join('')}
      ${ax.ticks.map(t => `<line class="gridl" y1="${M.t}" y2="${H - M.b}" x1="${px(t).toFixed(1)}" x2="${px(t).toFixed(1)}"/><text y="${H - M.b + 16}" x="${px(t).toFixed(1)}" text-anchor="middle">${t.toFixed(Math.min(ax.dec, 3))}</text>`).join('')}
      <text class="ttl" x="${(M.l + W - M.r) / 2}" y="${H - 8}" text-anchor="middle">${esc(xl)}${xu ? '（' + esc(xu) + '）' : ''}</text>
      <text class="ttl" transform="translate(14 ${(M.t + H - M.b) / 2}) rotate(-90)" text-anchor="middle">${esc(yl)}${yu ? '（' + esc(yu) + '）' : ''}</text>
      ${fit}
      ${points.map((p, i) => `<circle class="pt${excluded.has(p.pid) ? ' out' : ''}" data-i="${i}" cx="${px(p.x).toFixed(1)}" cy="${py(p.y).toFixed(1)}" r="5.5"/>`).join('')}
    </svg><div class="tip" id="an-tip" hidden></div></div>`;
  }
  function render() {
    const sy = window.scrollY;
    if (!D.ready) { ROOT.innerHTML = `<div class="aw"><h2>解析</h2><div class="empty">${esc(D.error || '読み込んでいます…')}</div></div>`; return; }
    ROOT.innerHTML = `<div class="aw"><h2>解析<span style="font-size:12px; font-weight:400; color:var(--muted); margin-left:10px">2つの項目の関係を見る</span></h2>${controls()}<div id="an-out">${result()}</div></div>`;
    if (sy) window.scrollTo(0, sy);
  }
  const redraw = () => { store.set('an', S); const o = $('#an-out'); if (o) o.innerHTML = result(); };

  ROOT.addEventListener('change', e => {
    const t = e.target, id = t.id;
    if (t.dataset && t.dataset.cls != null) { const v = t.dataset.cls; S.cls = S.cls.filter(x => x !== v); if (t.checked) S.cls.push(v); excluded.clear(); redraw(); return; }
    const map = { 'an-x': 'x', 'an-xs': 'xs', 'an-y': 'y', 'an-ys': 'ys', 'an-mode': 'mode', 'an-hand': 'hand', 'an-from': 'from', 'an-to': 'to', 'an-ci': 'ci', 'an-cop': 'cop' };
    if (id === 'an-same') { S.same = t.checked; excluded.clear(); store.set('an', S); render(); return; }
    if (!map[id]) return;
    S[map[id]] = t.value; excluded.clear();
    if (id === 'an-x' || id === 'an-y' || id === 'an-ci') { store.set('an', S); render(); } else redraw();
  });
  ROOT.addEventListener('input', e => {
    const map = { 'an-a1': 'a1', 'an-a2': 'a2', 'an-cv': 'cv' }, k = map[e.target.id]; if (!k) return;
    S[k] = e.target.value; excluded.clear(); redraw();
  });
  ROOT.addEventListener('click', e => {
    if (e.target.id === 'an-swap') { [S.x, S.y] = [S.y, S.x]; [S.xs, S.ys] = [S.ys, S.xs]; excluded.clear(); store.set('an', S); render(); return; }
    if (e.target.id === 'an-back') { excluded.clear(); redraw(); return; }
    const pt = e.target.closest('.pt'); if (!pt) return;
    const p = points[Number(pt.dataset.i)]; if (!p) return;
    if (excluded.has(p.pid)) excluded.delete(p.pid); else excluded.add(p.pid);
    redraw();
  });
  function tip(e) {
    const pt = e.target.closest && e.target.closest('.pt'), box = $('#an-tip'); if (!box) return;
    ROOT.querySelectorAll('.pt.hot').forEach(x => x.classList.remove('hot'));
    if (!pt) { box.hidden = true; return; }
    const p = points[Number(pt.dataset.i)], wrap = $('#an-plot').getBoundingClientRect(), r = pt.getBoundingClientRect();
    pt.classList.add('hot');
    box.innerHTML = `<b>${esc(p.name)}</b>${p.sub ? `<i>${esc(p.sub)}</i><br>` : ''}${esc(vlabel(S.x, S.xs))}：${p.x.toFixed(vdec(S.x))} ${esc(vunit(S.x))} <i>${esc(p.dx)}</i><br>${esc(vlabel(S.y, S.ys))}：${p.y.toFixed(vdec(S.y))} ${esc(vunit(S.y))} <i>${esc(p.dy)}</i>${excluded.has(p.pid) ? '<br><i>計算から外しています</i>' : ''}`;
    box.hidden = false;
    const bw = box.offsetWidth, bh = box.offsetHeight;
    let x = r.left - wrap.left + r.width / 2 - bw / 2, y = r.top - wrap.top - bh - 8;
    x = Math.max(0, Math.min(wrap.width - bw, x)); if (y < 0) y = r.bottom - wrap.top + 8;
    box.style.left = x + 'px'; box.style.top = y + 'px';
  }
  ROOT.addEventListener('pointermove', tip);
  ROOT.addEventListener('pointerleave', () => { const b = $('#an-tip'); if (b) b.hidden = true; });

  const typing = () => { const a = document.activeElement; return !!a && ROOT.contains(a) && /^(INPUT|SELECT)$/.test(a.tagName) && !ROOT.hidden; };
  CORE.data.on(changed => { if (!changed && $('#an-out')) return; pull(); if (typing()) { pending = true; return; } render(); });
  ROOT.addEventListener('focusout', () => { if (pending) setTimeout(() => { if (pending && !typing()) { pending = false; render(); } }, 60); });
  ROOT.addEventListener('bt:show', () => { if (Date.now() - D.at > 60000) CORE.data.refresh(false); });
  pull(); render();
}
