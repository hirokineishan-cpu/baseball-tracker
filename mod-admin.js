import { schoolGrade, monthsOld } from './mod-physical.js?v=202610071408';

/* 管理（管理者だけ）
   ・ユーザー：追加、立場の変更、選手との結び付け、停止、パスワードの入れ直し
   ・選手のログインを許可するスイッチ
   ・選手名簿：追加と変更、さがす（クラス・学年・月齢など）、選んだ選手をまとめて変える
   ・測定項目：フィジカルの種目の追加と変更
   どの操作も、サーバー側で「管理者か」を確かめている。 */

const CSS = `
#tab-admin .wrap{ max-width:860px; margin:0 auto; padding:14px 14px 70px }
#tab-admin .seg{ display:flex; gap:6px; margin-bottom:14px }
#tab-admin .seg button{ appearance:none; flex:1; max-width:200px; font-size:14px; font-weight:600; cursor:pointer; padding:9px 10px; border-radius:9px;
  border:1px solid var(--line); background:var(--paper); color:var(--ink2) }
#tab-admin .seg button[aria-pressed="true"]{ background:var(--accent); border-color:var(--accent); color:var(--accentInk) }
#tab-admin .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:14px 16px; margin-bottom:14px }
#tab-admin .head{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px }
#tab-admin .head h3{ margin:0; font-size:15px; flex:1 1 auto }
#tab-admin .count{ font-size:12px; color:var(--muted); font-weight:400; margin-left:6px }
#tab-admin .note{ font-size:12px; color:var(--muted); line-height:1.7; margin:4px 0 0 }
#tab-admin .link{ font-family:var(--num); font-size:12px; user-select:all; color:var(--ink2) }
#tab-admin .sw{ display:flex; gap:10px; align-items:center; font-weight:700; cursor:pointer }
#tab-admin .sw input{ width:20px; height:20px; flex:0 0 auto; accent-color:var(--accent) }
#tab-admin button.b{ appearance:none; font-size:14px; cursor:pointer; border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:9px; padding:8px 14px }
#tab-admin button.b.primary{ background:var(--accent); color:var(--accentInk); border-color:var(--accent); font-weight:700 }
#tab-admin button.b[disabled]{ opacity:.5 }
#tab-admin input[type=text], #tab-admin input[type=email], #tab-admin input[type=search], #tab-admin input[type=number], #tab-admin input[type=date], #tab-admin select, #tab-admin textarea{
  font-size:16px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:9px; padding:9px 10px; width:100%; min-width:0 }
#tab-admin .list{ list-style:none; margin:0; padding:0; border-top:1px solid var(--line) }
#tab-admin .list li{ border-bottom:1px solid var(--line) }
#tab-admin .row{ appearance:none; width:100%; text-align:left; background:transparent; border:0; cursor:pointer; padding:10px 2px;
  display:flex; align-items:center; gap:10px; min-width:0 }
#tab-admin .row:hover{ background:var(--raise) }
#tab-admin .row .nm{ flex:1 1 auto; min-width:0 }
#tab-admin .row .nm b{ display:block; font-size:15px }
#tab-admin .row .nm span{ display:block; font-size:12px; color:var(--muted) }
#tab-admin .row .tags{ flex:0 0 auto; display:flex; gap:4px; flex-wrap:wrap; justify-content:flex-end; max-width:46% }
#tab-admin .tag{ font-size:11.5px; border:1px solid var(--line); border-radius:999px; padding:1px 9px; color:var(--ink2); white-space:nowrap }
#tab-admin .tag.role-管理{ border-color:var(--gold); color:var(--goldInk); font-weight:700 }
#tab-admin .tag.off{ border-color:var(--clay); color:var(--clay) }
#tab-admin .tag.warn{ border-color:var(--warn); color:var(--warn) }
#tab-admin .row.is-off .nm{ opacity:.55 }
#tab-admin .empty{ padding:18px 4px; color:var(--muted); font-size:13px }
#tab-admin .msg{ font-size:13px; color:var(--clay); min-height:1.2em; margin:6px 0 0 }
#tab-admin dialog{ border:1px solid var(--line); border-radius:var(--r); background:var(--paper); color:var(--ink); padding:0;
  width:min(520px, calc(100vw - 24px)); max-height:calc(100dvh - 24px) }
#tab-admin dialog::backdrop{ background:rgba(0,0,0,.45) }
#tab-admin dialog form{ padding:16px; display:flex; flex-direction:column; gap:10px }
#tab-admin dialog h3{ margin:0 0 2px; font-size:16px }
#tab-admin label.f{ display:flex; flex-direction:column; gap:4px; font-size:12px; color:var(--muted) }
#tab-admin .two{ display:grid; grid-template-columns:1fr 1fr; gap:10px }
#tab-admin .chk{ display:flex; gap:8px; align-items:center; font-size:14px; color:var(--ink) }
#tab-admin .chk input{ width:18px; height:18px; accent-color:var(--accent) }
#tab-admin .acts{ display:flex; gap:8px; justify-content:flex-end; margin-top:4px }
#tab-admin .flt{ display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:8px 10px; margin-bottom:8px }
#tab-admin .flt .wide{ grid-column:span 2 }
#tab-admin .mrange{ display:flex; align-items:center; gap:4px } #tab-admin .mrange input{ padding:9px 6px }
#tab-admin .togs{ display:flex; gap:14px; flex-wrap:wrap; margin:2px 0 10px }
#tab-admin .pr{ display:flex; align-items:stretch }
#tab-admin .pr .ck{ flex:0 0 auto; display:flex; align-items:center; padding:0 10px 0 4px; cursor:pointer }
#tab-admin .pr .ck input, #tab-admin .selall input{ width:20px; height:20px; accent-color:var(--accent) }
#tab-admin .pr.on{ background:color-mix(in srgb, var(--gold) 13%, transparent) }
#tab-admin .selall{ display:flex; gap:10px; align-items:center; font-size:13px; padding:8px 4px; cursor:pointer }
#tab-admin .bulk{ position:sticky; bottom:8px; z-index:15; border-color:var(--gold); box-shadow:0 6px 18px rgba(0,0,0,.18) }
#tab-admin .bulk .line{ display:flex; gap:8px; flex-wrap:wrap; align-items:flex-end }
#tab-admin .bulk .line label.f{ flex:1 1 150px }
@media (max-width:420px){ #tab-admin .two{ grid-template-columns:1fr } #tab-admin .flt .wide{ grid-column:auto } }
`;

const ROLES = ['管理', 'スタッフ', '選手'];
const ROLE_NOTE = '管理＝すべて／スタッフ＝記録の入力と全員分の閲覧（ユーザー管理はできない）／選手＝結び付けた選手本人の分を見るだけ';
const STATES = [['', '在籍'], ['休会', '休会'], ['退会', '退会者']];
const F_ALL = '\u0001all', F_NONE = '\u0001none', F_REST = '\u0001rest', F_LEFT = '\u0001left', NEWCLASS = '\u0001new';
const ageText = n => n == null ? '' : Math.floor(n / 12) + '歳' + (n % 12) + 'か月';

export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-admin'; st.textContent = CSS; document.head.appendChild(st);
  const { api, esc, toast, store } = CORE;

  let page = ['users', 'roster', 'items'].indexOf(store.get('admin-page')) >= 0 ? store.get('admin-page') : 'users';
  let items = [], editItem = null;
  let editPid = '', editWas = null;
  let imp = { data: null, step: '', text: '' };
  let mailQuota = 0, inv = { step: '', text: '' };
  let users = [], lite = [], players = [], playerLogin = false, loadErr = '', loading = true;
  let flt = { q: '', cls: '', grade: '', m1: '', m2: '', noMail: false, noBirth: false, sort: '順' };
  const sel = new Set();
  let bulk = { field: 'クラス', step: '', busy: false };
  let itemsAt = 0, loadedAt = 0;
  const D = CORE.data.state;
  const myId = () => String((CORE.conn().user || {}).id || '');

  ROOT.innerHTML = `<div class="wrap">
    <div class="seg"><button data-page="users">ユーザー</button><button data-page="roster">選手名簿</button><button data-page="items">測定項目</button></div>
    <div id="ad-body"></div>
    <dialog id="ad-dlg"><form method="dialog" id="ad-form"></form></dialog>
  </div>`;
  const body = ROOT.querySelector('#ad-body'), dlg = ROOT.querySelector('#ad-dlg'), form = ROOT.querySelector('#ad-form');

  async function call(action, payload) {
    const j = await api(action, payload);
    if (!j || !j.ok) throw new Error((j && j.error) || 'うまくいきませんでした');
    return j;
  }
  /* 選手と記録は、外枠がまとめて取ってくる分を使う。ここで取るのは、ユーザーの一覧だけ */
  function pullPlayers() { players = (D.players || []).slice().sort(byOrder); const ids = new Set(players.map(p => String(p['選手ID']))); [...sel].forEach(i => { if (!ids.has(i)) sel.delete(i); }); }
  async function load(full) {
    loading = !loadedAt; loadErr = ''; if (loading) render();
    try {
      const [u] = await Promise.all([call('listUsers'), CORE.data.refresh(!!full)]);
      users = u.users || []; lite = u.players || []; playerLogin = !!u.playerLogin; mailQuota = Number(u.mailQuota) || 0;
      pullPlayers(); loadedAt = Date.now();
      if (page === 'items') await loadItems(true);
    } catch (e) { loadErr = String(e.message || e); }
    loading = false; render();
  }
  /* 測定項目（使っていないものも含む）は、そのページを開いたときにだけ取る */
  async function loadItems(force) {
    if (!force && itemsAt) return;
    const ph = await call('getPhysical', { all: true, itemsOnly: true });
    items = (ph.items || []).slice().sort((a, b) => (Number(a['順']) || 0) - (Number(b['順']) || 0)); itemsAt = Date.now();
  }
  const quiet = () => !dlg.open && !(document.activeElement && body.contains(document.activeElement) && /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName));
  CORE.data.on(changed => { if (!changed || loading) return; pullPlayers(); if (page === 'roster' && quiet() && !bulk.busy && imp.step !== 'run') render(); });
  const byOrder = (a, b) => (Number(a['順']) || 0) - (Number(b['順']) || 0) || String(a['かな'] || a['氏名']).localeCompare(String(b['かな'] || b['氏名']), 'ja');
  const pname = pid => { const p = lite.find(x => x.id === pid); return p ? p.name : ''; };

  function render() {
    ROOT.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.page === page)));
    if (loading) { body.innerHTML = `<p class="empty">読み込んでいます…</p>`; return; }
    if (loadErr) { body.innerHTML = `<div class="card"><div class="msg">${esc(loadErr)}</div><button class="b" id="ad-reload" style="margin-top:10px">もう一度読み込む</button></div>`; return; }
    body.innerHTML = page === 'users' ? usersHtml() : page === 'roster' ? rosterHtml() : itemsHtml();
  }

  /* ---------------- ユーザー ---------------- */
  function usersHtml() {
    const link = location.href.split('#')[0] + '#me';
    return `<div class="card">
        <label class="sw"><input type="checkbox" id="ad-plogin" ${playerLogin ? 'checked' : ''}> 選手のログインを許可する</label>
        <p class="note">外すと、選手は全員すぐにログインできなくなります（スタッフには影響しません）。</p>
        <p class="note">選手用のリンク：<span class="link" id="ad-plink">${esc(link)}</span></p>
      </div>
      ${inviteHtml()}
      <div class="card">
        <div class="head"><h3>ユーザー<span class="count">${users.length}人</span></h3><button class="b primary" id="ad-uadd">ユーザーを追加</button></div>
        <p class="note" style="margin-bottom:10px">${esc(ROLE_NOTE)}</p>
        <ul class="list" id="ad-ulist">${users.map(u => `<li><button class="row ${u.enabled ? '' : 'is-off'}" data-uid="${esc(u.id)}">
          <span class="nm"><b>${esc(u.name)}</b><span>ID：${esc(u.id)}${u.role === '選手' ? '　選手：' + esc(pname(u.pid) || '（結び付けなし）') : ''}${u.last ? '　最終ログイン：' + esc(String(u.last).slice(0, 16)) : (u.invited ? '　案内：' + esc(String(u.invited).slice(0, 16)) : '')}</span></span>
          <span class="tags"><span class="tag role-${esc(u.role)}">${esc(u.role)}</span>${u.enabled ? '' : '<span class="tag off">停止中</span>'}${u.must ? '<span class="tag warn">パスワード未変更</span>' : ''}${u.pwSet ? '' : '<span class="tag warn">パスワード未設定</span>'}${u.role === '選手' && !u.pid ? '<span class="tag off">選手を選んでください</span>' : ''}</span>
        </button></li>`).join('')}</ul>
      </div>`;
  }
  /* メールで案内を送る相手：在籍・アドレスあり・まだパスワードを決めていない選手 */
  /* again＝false：まだ案内していない人。again＝true：案内は送ったが、まだ決めていない人（送り直し） */
  function inviteTargets(again) {
    const byPid = {}; users.forEach(u => { if (u.role === '選手' && u.pid) byPid[u.pid] = u; });
    return lite.filter(p => { const u = byPid[p.id]; return !p.state && p.email && !(u && (u.pwSet || !u.enabled)) && (!!(u && u.invited) === !!again); });
  }
  function inviteHtml() {
    const act = lite.filter(p => !p.state), withMail = act.filter(p => p.email).length;
    const byPid = {}; users.forEach(u => { if (u.role === '選手' && u.pid) byPid[u.pid] = u; });
    const done = act.filter(p => byPid[p.id] && byPid[p.id].pwSet).length, t = inviteTargets(inv.again), t2 = inviteTargets(true);
    return `<div class="card" id="ad-invbox">
        <div class="head"><h3>選手にログインの案内を送る</h3></div>
        <p class="note">選手名簿のメールアドレスに、ID と「パスワードを決めるリンク」を送ります。パスワードそのものは送りません（本人が決めます）。リンクは72時間・1回きりです。</p>
        <p class="note" id="ad-invstat">在籍 ${act.length}人 ／ アドレスあり ${withMail}人 ／ パスワードを決めた人 ${done}人　　今日あと <b>${mailQuota}</b> 通送れます</p>
        ${inv.step === 'run' ? `<p class="note" id="ad-invrun">${esc(inv.text)}</p>` :
          inv.step === 'ask' ? `<p class="note" style="color:var(--ink)"><b>${Math.min(t.length, mailQuota)}人</b>に送ります。${t.length > mailQuota ? '（今日の上限のため、残り ' + (t.length - mailQuota) + '人は明日以降に送ってください）' : ''}よろしいですか。</p>
            <div style="display:flex; gap:8px; margin-top:8px"><button class="b primary" id="ad-invgo">送る</button><button class="b" id="ad-invno">やめる</button></div>` :
          `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px"><button class="b primary" id="ad-inv" ${t.length && mailQuota ? '' : 'disabled'}>まだ案内していない選手に送る（${t.length}人）</button>
           <button class="b" id="ad-inv2" ${t2.length && mailQuota ? '' : 'disabled'}>案内したが、まだ決めていない選手に送り直す（${t2.length}人）</button></div>`}
        ${inv.step === '' && inv.text ? `<p class="note" id="ad-invres" style="color:var(--ink)">${esc(inv.text)}</p>` : ''}
      </div>`;
  }
  const siteBase = () => location.href.split('#')[0].split('?')[0];
  async function runInvite() {
    const all = inviteTargets(inv.again).slice(0, mailQuota), count = {}; let doneN = 0;
    inv = { step: 'run', text: '送っています… 0 / ' + all.length, again: inv.again }; render();
    try {
      for (let i = 0; i < all.length; i += 20) {
        const j = await call('sendInvites', { base: siteBase(), targets: all.slice(i, i + 20).map(p => ({ pid: p.id })) });
        (j.results || []).forEach(r => { count[r.status] = (count[r.status] || 0) + 1; });
        doneN += (j.results || []).length; mailQuota = Number(j.mailQuota) || 0;
        inv.text = '送っています… ' + doneN + ' / ' + all.length; render();
        if (count['今日の上限']) break;
      }
      inv = { step: '', text: '結果：' + (Object.keys(count).map(k => k + ' ' + count[k] + '人').join('、') || '送る相手がいませんでした') };
    } catch (e) { inv = { step: '', text: '途中で止まりました：' + String(e.message || e) + '（送れた分は届いています）' }; }
    await load();
  }
  const roleOpts = sel => ROLES.map(r => `<option ${r === sel ? 'selected' : ''}>${r}</option>`).join('');
  const pidOpts = sel => `<option value="">（どの選手か選ぶ）</option>` + lite.map(p => `<option value="${esc(p.id)}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)}${p.state ? '（' + esc(p.state) + '）' : ''}</option>`).join('');

  function openUser(u) {
    const isNew = !u, self = !isNew && u.id === myId();
    u = u || { id: '', name: '', role: 'スタッフ', pid: '', enabled: true };
    form.dataset.kind = 'user'; form.dataset.mode = isNew ? 'new' : 'edit';
    form.innerHTML = `<h3>${isNew ? 'ユーザーを追加' : 'ユーザーの変更'}</h3>
      <label class="f">ID（半角の英数字。あとから変えられません）<input type="text" name="id" value="${esc(u.id)}" ${isNew ? '' : 'readonly'} autocapitalize="off" autocomplete="off" spellcheck="false"></label>
      <label class="f">表示名<input type="text" name="name" value="${esc(u.name)}" autocomplete="off"></label>
      <label class="f">立場<select name="role" ${self ? 'disabled' : ''}>${roleOpts(u.role)}</select></label>
      <label class="f" data-only="選手">どの選手か<select name="pid">${pidOpts(u.pid)}</select></label>
      ${isNew ? '' : `<label class="chk"><input type="checkbox" name="enabled" ${u.enabled ? 'checked' : ''} ${self ? 'disabled' : ''}> 使えるようにする（外すと停止）</label>`}
      <label class="f" data-not="選手">メールアドレス<input type="email" name="email" value="${esc(u.role === '選手' ? '' : (u.email || ''))}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
      <p class="note" data-only="選手">選手のメールアドレスは、選手名簿で入れます。${!isNew && u.role === '選手' ? '（今：' + esc(u.email || '未登録') + '）' : ''}</p>
      ${self ? `<p class="note">自分の立場・停止・パスワードは、ここでは変えられません（パスワードはマイページで）。</p>` :
        `${isNew ? '' : `<button type="button" class="b" id="ad-sendone">パスワードを決めるリンクを、メールで送る</button>`}
         <label class="f">${isNew ? '初期パスワード（空のままなら、あとでメールの案内から本人が決めます）' : '新しいパスワード（こちらで入れ直すときだけ。6文字以上）'}<input type="text" name="password" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
         <p class="note">おすすめは、メールで案内を送る方法です（パスワードを伝える必要がありません）。ここで入れた場合は本人に伝えてください。最初のログインで、本人が変えるまでデータは見られません。今のパスワードは、管理者にも見えません。</p>`}
      <div class="msg" id="ad-dmsg"></div>
      <div class="acts"><button type="button" class="b" data-close>やめる</button><button type="submit" class="b primary" id="ad-save">${isNew ? '追加する' : '保存する'}</button></div>`;
    syncRole(); dlg.showModal();
  }
  function syncRole() {
    const r = form.elements.role ? form.elements.role.value : '';
    form.querySelectorAll('[data-only]').forEach(el => { el.hidden = el.dataset.only !== r; });
    form.querySelectorAll('[data-not]').forEach(el => { el.hidden = el.dataset.not === r; });
  }
  async function sendOne(btn) {
    const m = form.querySelector('#ad-dmsg'); btn.disabled = true; m.textContent = '';
    try {
      const j = await call('sendInvites', { base: siteBase(), targets: [{ id: form.elements.id.value }] });
      const stt = (j.results[0] || {}).status;
      if (stt !== '送信') throw new Error(stt === 'アドレスなし' ? 'メールアドレスが登録されていません（先に保存してください）' : '送れませんでした（' + stt + '）');
      mailQuota = Number(j.mailQuota) || 0; toast('案内を送りました'); dlg.close(); await load();
    } catch (er) { m.textContent = String(er.message || er); btn.disabled = false; }
  }
  async function saveUser() {
    const f = form.elements, isNew = form.dataset.mode === 'new';
    const id = f.id.value.trim(), role = f.role.value, name = f.name.value.trim();
    const p = { id, name, role };
    if (isNew) p.create = true;
    if (role === '選手') {
      p.pid = f.pid.value;
      if (!p.pid) throw new Error('どの選手か選んでください');
      if (isNew && !name) p.name = pname(p.pid);
    }
    if (f.enabled && !f.enabled.disabled) p.enabled = f.enabled.checked;
    if (f.password && f.password.value) p.password = f.password.value;
    if (role !== '選手' && f.email) p.email = f.email.value.trim();
    if (id === myId()) { delete p.role; delete p.enabled; }
    await call('setUser', p);
    toast(isNew ? 'ユーザーを追加しました' : '保存しました');
  }

  /* ---------------- 選手名簿 ---------------- */
  const stateOf = p => String(p['状態'] || '');
  const classList = () => [...new Set(players.map(x => String(x['クラス'] || '')).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja'));
  function filtered() {
    const kw = flt.q.trim().toLowerCase(), m1 = flt.m1 === '' ? null : Number(flt.m1), m2 = flt.m2 === '' ? null : Number(flt.m2);
    const out = players.filter(p => {
      const st8 = stateOf(p), c = String(p['クラス'] || '');
      if (flt.cls === '') { if (st8) return false; }
      else if (flt.cls === F_LEFT) { if (st8 !== '退会') return false; }
      else if (flt.cls === F_REST) { if (!st8 || st8 === '退会') return false; }
      else if (flt.cls === F_NONE) { if (st8 || c) return false; }
      else if (flt.cls !== F_ALL) { if (st8 || c !== flt.cls) return false; }
      if (kw && (String(p['氏名']) + ' ' + String(p['かな'] || '') + ' ' + String(p['選手ID'])).toLowerCase().indexOf(kw) < 0) return false;
      if (flt.grade && schoolGrade(p['生年月日']) !== flt.grade) return false;
      if (m1 != null || m2 != null) { const n = monthsOld(p['生年月日']); if (n == null || (m1 != null && n < m1) || (m2 != null && n > m2)) return false; }
      if (flt.noMail && p['メール']) return false;
      if (flt.noBirth && p['生年月日']) return false;
      return true;
    });
    const mo = p => { const n = monthsOld(p['生年月日']); return n == null ? Infinity : n; };
    if (flt.sort === 'かな') out.sort((a, b) => String(a['かな'] || a['氏名']).localeCompare(String(b['かな'] || b['氏名']), 'ja'));
    else if (flt.sort === '若い順') out.sort((a, b) => mo(a) - mo(b) || byOrder(a, b));
    else if (flt.sort === '上から') out.sort((a, b) => (mo(b) === Infinity ? -1 : mo(b)) - (mo(a) === Infinity ? -1 : mo(a)) || byOrder(a, b));
    else if (flt.sort === 'クラス') out.sort((a, b) => String(a['クラス'] || '\uffff').localeCompare(String(b['クラス'] || '\uffff'), 'ja') || byOrder(a, b));
    return out;
  }
  function listHtml() {
    const shown = filtered(), allOn = shown.length > 0 && shown.every(p => sel.has(String(p['選手ID'])));
    if (!shown.length) return `<p class="empty" id="ad-pempty">${players.length ? 'あてはまる選手がいません。' : 'まだ選手がいません。「選手を追加」から登録してください。'}</p>`;
    return `<label class="selall"><input type="checkbox" id="ad-selall" ${allOn ? 'checked' : ''}> 表示している <b id="ad-shown">${shown.length}</b>人をすべて選ぶ<span class="count" id="ad-seln">${sel.size ? '（' + sel.size + '人を選択中）' : ''}</span></label>
      <ul class="list" id="ad-plist">${shown.map(p => { const pid = String(p['選手ID']), n = monthsOld(p['生年月日']);
        return `<li class="pr ${sel.has(pid) ? 'on' : ''}"><label class="ck"><input type="checkbox" data-sel="${esc(pid)}" ${sel.has(pid) ? 'checked' : ''} aria-label="${esc(p['氏名'])}を選ぶ"></label>
          <button class="row ${stateOf(p) ? 'is-off' : ''}" data-pid="${esc(pid)}">
          <span class="nm"><b>${esc(p['氏名'])}</b><span>${esc(p['かな'] || '')}${[schoolGrade(p['生年月日']), n == null ? '' : ageText(n) + '（' + n + 'か月）', p['クラス']].filter(Boolean).map(x => '　' + esc(x)).join('')}${(p['投'] || p['打']) ? '　' + (p['投'] ? esc(p['投']) + '投' : '') + (p['打'] ? esc(p['打']) + '打' : '') : ''}</span></span>
          <span class="tags">${p['メール'] ? '' : '<span class="tag warn">メール未登録</span>'}${String(p['投手']) === '1' ? '<span class="tag">投手</span>' : ''}${stateOf(p) ? `<span class="tag off">${esc(stateOf(p) === '退会' ? '退会者' : stateOf(p))}</span>` : ''}</span>
        </button></li>`; }).join('')}</ul>`;
  }
  /* 選んだ選手をまとめて変える */
  const BULK = { 'クラス': 'クラス', '状態': '状態（在籍・休会・退会者）', '投手': '投手かどうか', '投': '投げる手', '打': '打席' };
  function bulkValueHtml() {
    const f = bulk.field;
    if (f === 'クラス') return `<label class="f">どのクラスにするか<select id="ad-bv">${classList().map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
        <option value="${NEWCLASS}">新しいクラス名を入れる…</option><option value="${F_NONE}">クラスなしにする</option><option value="${F_LEFT}">退会者にする</option></select></label>
        <label class="f" id="ad-bnewbox" ${classList().length ? 'hidden' : ''}>新しいクラス名<input type="text" id="ad-bnew" autocomplete="off"></label>`;
    if (f === '状態') return `<label class="f">どれにするか<select id="ad-bv">${opt(STATES, '')}</select></label>`;
    if (f === '投手') return `<label class="f">どちらにするか<select id="ad-bv"><option value="1">投手にする</option><option value="">投手から外す</option></select></label>`;
    if (f === '投') return `<label class="f">どれにするか<select id="ad-bv">${opt([['右', '右'], ['左', '左'], ['', '—（消す）']], '右')}</select></label>`;
    return `<label class="f">どれにするか<select id="ad-bv">${opt([['右', '右'], ['左', '左'], ['両', '両'], ['', '—（消す）']], '右')}</select></label>`;
  }
  function bulkHtml() {
    if (!sel.size) return '';
    if (bulk.step === 'ask') return `<div class="card bulk" id="ad-bulk"><p class="note" id="ad-bask" style="color:var(--ink); font-size:14px"><b>${sel.size}人</b>の ${esc(bulk.text)}。よろしいですか。</p>
      <div style="display:flex; gap:8px; margin-top:8px"><button class="b primary" id="ad-bgo" ${bulk.busy ? 'disabled' : ''}>${bulk.busy ? '変えています…' : '変える'}</button><button class="b" id="ad-bno">やめる</button></div></div>`;
    return `<div class="card bulk" id="ad-bulk"><div class="head" style="margin-bottom:6px"><h3>選んだ ${sel.size}人をまとめて変える</h3><button class="b" id="ad-bclear">選択をやめる</button></div>
      <div class="line"><label class="f">変える項目<select id="ad-bf">${Object.keys(BULK).map(k => `<option value="${k}" ${k === bulk.field ? 'selected' : ''}>${BULK[k]}</option>`).join('')}</select></label>
        ${bulkValueHtml()}<button class="b primary" id="ad-bnext">次へ</button></div>
      <div class="msg" id="ad-bmsg">${esc(bulk.err || '')}</div></div>`;
  }
  function bulkPlan() {
    const f = bulk.field, v = ROOT.querySelector('#ad-bv').value;
    if (f === 'クラス') {
      if (v === F_LEFT) return { set: { '状態': '退会' }, text: '状態を「退会者」に変えます（クラスの名前と記録は残ります）' };
      if (v === F_NONE) return { set: { 'クラス': '' }, text: 'クラスを空にします' };
      const name = v === NEWCLASS ? ROOT.querySelector('#ad-bnew').value.trim() : v;
      if (!name) throw new Error('クラス名を入れてください');
      return { set: { 'クラス': name }, text: `クラスを「${name}」に変えます` };
    }
    if (f === '状態') return { set: { '状態': v }, text: `状態を「${(STATES.find(x => x[0] === v) || ['', ''])[1]}」に変えます` };
    if (f === '投手') return { set: { '投手': v }, text: v ? '「投手」の印を付けます' : '「投手」の印を外します' };
    return { set: { [f]: v }, text: `${f === '投' ? '投げる手' : '打席'}を「${v || '—'}」に変えます` };
  }
  async function runBulk() {
    bulk.busy = true; render();
    try {
      const j = await call('patchPlayers', { ids: [...sel], set: bulk.set });
      toast(j.updated + '人を変えました' + (j.missing ? '（見つからなかった人 ' + j.missing + '人）' : ''));
      sel.clear(); bulk = { field: bulk.field, step: '', busy: false };
      await load();
    } catch (e) { bulk = { field: bulk.field, step: '', busy: false, err: String(e.message || e) }; render(); }
  }
  function rosterHtml() {
    const cs = classList(), grades = [];
    players.forEach(p => { const g = schoolGrade(p['生年月日']); if (g && grades.indexOf(g) < 0) grades.push(g); });
    const gOrder = g => '小中高'.indexOf(g[0]) * 10 + Number(g.slice(1));
    grades.sort((a, b) => gOrder(a) - gOrder(b));
    const active = players.filter(p => !stateOf(p)).length;
    return `<div class="card">
        <div class="head"><h3>選手名簿<span class="count" id="ad-pcount">在籍 ${active}人 ／ 全部で ${players.length}人</span></h3><button class="b primary" id="ad-padd">選手を追加</button></div>
        <div class="flt" id="ad-flt">
          <label class="f wide">名前・かな・IDでさがす<input type="search" id="ad-q" value="${esc(flt.q)}" autocomplete="off"></label>
          <label class="f">クラス<select id="ad-fcls">${opt([['', '在籍の全員'], ...cs.map(c => [c, c]), [F_NONE, '（クラスなし）'], [F_REST, '休会'], [F_LEFT, '退会者'], [F_ALL, 'すべて（退会者も含む）']], flt.cls)}</select></label>
          <label class="f">学年<select id="ad-fgrade">${opt([['', 'すべて'], ...grades.map(g => [g, g])], flt.grade)}</select></label>
          <label class="f">月齢（か月）<span class="mrange"><input type="number" id="ad-fm1" value="${esc(flt.m1)}" inputmode="numeric" min="0" placeholder="から" aria-label="月齢 から">〜<input type="number" id="ad-fm2" value="${esc(flt.m2)}" inputmode="numeric" min="0" placeholder="まで" aria-label="月齢 まで"></span></label>
          <label class="f">並べ方<select id="ad-fsort">${opt([['順', '並び順'], ['かな', 'かな'], ['クラス', 'クラス'], ['若い順', '月齢の小さい順'], ['上から', '月齢の大きい順']], flt.sort)}</select></label>
        </div>
        <div class="togs"><label class="chk"><input type="checkbox" id="ad-fnomail" ${flt.noMail ? 'checked' : ''}> メール未登録だけ</label>
          <label class="chk"><input type="checkbox" id="ad-fnobirth" ${flt.noBirth ? 'checked' : ''}> 生年月日なしだけ</label></div>
        <p class="note" style="margin-bottom:6px">月齢は、12歳0か月なら 144。学年と月齢は、生年月日を入れた選手だけ出ます。左の四角で選ぶと、下に「まとめて変える」が出ます。</p>
        <div id="ad-rl">${listHtml()}</div>
      </div>
      <div id="ad-bulkbox">${bulkHtml()}</div>
      <div class="card" id="ad-impbox">
        <div class="head"><h3>ファイルから取り込む（旧システムからの引き継ぎ用）</h3></div>
        <p class="note">「引き継ぎデータ.json」を選ぶと、選手と記録をまとめて取り込みます。すでにある選手・記録は増えません。こちらで直した内容は、取り込み直しても上書きされません。</p>
        ${imp.step === 'run' ? `<p class="note" id="ad-imprun" style="color:var(--ink)">${esc(imp.text)}</p>` :
          imp.step === 'ready' ? `<p class="note" id="ad-impinfo" style="color:var(--ink)">選手 <b>${imp.data.players.length}</b>人・記録 <b>${imp.data.rows.length}</b>件 のファイルです。</p>
            <div style="display:flex; gap:8px; margin-top:8px"><button class="b primary" id="ad-impgo">取り込む</button><button class="b" id="ad-impno">やめる</button></div>` :
          `<input type="file" id="ad-impfile" accept=".json,application/json" style="margin-top:8px; max-width:100%; font-size:14px">`}
        ${imp.step !== 'run' && imp.text ? `<p class="note" id="ad-impres" style="color:var(--ink)">${esc(imp.text)}</p>` : ''}
      </div>`;
  }
  const redrawList = () => { const el = ROOT.querySelector('#ad-rl'); if (el) el.innerHTML = listHtml(); const b = ROOT.querySelector('#ad-bulkbox'); if (b) b.innerHTML = bulkHtml(); };
  /* ---- 引き継ぎデータの取り込み。ふだんの保存と同じ道（upsertMaster・upsertMeasures）を、小分けにして通す ---- */
  function readImport(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(String(fr.result));
        const cols = ['選手ID', '測定日', '項目ID', '側', '値', '更新日時'];
        if (!d || !Array.isArray(d.players) || !Array.isArray(d.rows) || JSON.stringify(d.cols) !== JSON.stringify(cols)) throw new Error('形が違います');
        imp = { data: d, step: 'ready', text: '' };
      } catch (e) { imp = { data: null, step: '', text: 'このファイルは取り込めません（引き継ぎデータ.json を選んでください）' }; }
      render();
    };
    fr.onerror = () => { imp = { data: null, step: '', text: 'ファイルを読めませんでした' }; render(); };
    fr.readAsText(file);
  }
  async function runImport() {
    const d = imp.data, t = { pa: 0, ps: 0, a: 0, u: 0, s: 0 }, total = d.players.length + d.rows.length; let done = 0;
    const show = () => { imp.text = '取り込んでいます… ' + Math.floor(done / Math.max(1, total) * 100) + '%（このまま待ってください）'; const el = ROOT.querySelector('#ad-imprun'); if (el) el.textContent = imp.text; };
    imp.step = 'run'; show(); render();
    try {
      for (let i = 0; i < d.players.length; i += 200) {
        const part = d.players.slice(i, i + 200), j = await call('upsertMaster', { master: { players: part } });
        t.pa += j.result.added; t.ps += j.result.skipped + j.result.updated; done += part.length; show();
      }
      for (let i = 0; i < d.rows.length; i += 1000) {
        const part = d.rows.slice(i, i + 1000);
        const j = await call('upsertMeasures', { rows: part.map(r => ({ '選手ID': r[0], '測定日': r[1], '項目ID': r[2], '側': r[3], '値': r[4], '更新日時': r[5] })) });
        t.a += j.added || 0; t.u += j.updated || 0; t.s += j.skipped || 0; done += part.length; show();
      }
      imp = { data: null, step: '', text: `取り込みました。選手：追加 ${t.pa}人・すでにある ${t.ps}人 ／ 記録：追加 ${t.a}件・すでにある ${t.u}件・入れなかったもの ${t.s}件` };
    } catch (e) { imp = { data: null, step: '', text: '途中で止まりました：' + String(e.message || e) + '（もう一度取り込めば、続きから入ります）' }; }
    await load(true);
  }
  const opt = (pairs, sel) => pairs.map(([v, l]) => `<option value="${esc(v)}" ${String(sel || '') === v ? 'selected' : ''}>${esc(l)}</option>`).join('');
  function openPlayer(p) {
    const isNew = !p;
    p = p || { '選手ID': '', '氏名': '', 'かな': '', '生年月日': '', 'クラス': '', '打': '', '投': '', '投手': '', '状態': '', '備考': '',
               '順': players.reduce((m, x) => Math.max(m, Number(x['順']) || 0), 0) + 1 };
    form.dataset.kind = 'player'; form.dataset.mode = isNew ? 'new' : 'edit'; editPid = String(p['選手ID']); editWas = isNew ? null : Object.assign({}, p);
    form.innerHTML = `<h3>${isNew ? '選手を追加' : '選手の変更'}</h3>
      <div class="two"><label class="f">氏名<input type="text" name="氏名" value="${esc(p['氏名'])}" autocomplete="off"></label>
        <label class="f">かな<input type="text" name="かな" value="${esc(p['かな'])}" autocomplete="off"></label></div>
      <div class="two"><label class="f">投<select name="投">${opt([['', '—'], ['右', '右'], ['左', '左']], p['投'])}</select></label>
        <label class="f">打<select name="打">${opt([['', '—'], ['右', '右'], ['左', '左'], ['両', '両']], p['打'])}</select></label></div>
      <div class="two"><label class="f">生年月日（入れると学年が出ます）<input type="date" name="生年月日" value="${esc(p['生年月日'])}" min="1990-01-01" max="2100-12-31"></label>
        <label class="f">クラス<input type="text" name="クラス" value="${esc(p['クラス'])}" list="ad-classes" autocomplete="off"><datalist id="ad-classes">${classList().map(c => `<option value="${esc(c)}">`).join('')}</datalist></label></div>
      <div class="two"><label class="f">状態<select name="状態">${opt(STATES, p['状態'])}</select></label>
        <label class="f">並び順<input type="number" name="順" value="${esc(p['順'])}" inputmode="numeric"></label></div>
      <label class="chk"><input type="checkbox" name="投手" ${String(p['投手']) === '1' ? 'checked' : ''}> 投手</label>
      <label class="f">メールアドレス（ログインの案内を送る先。保護者のものでも可）<input type="email" name="メール" value="${esc(p['メール'] || '')}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
      <label class="f">備考<input type="text" name="備考" value="${esc(p['備考'])}" autocomplete="off"></label>
      <div class="msg" id="ad-dmsg"></div>
      <div class="acts"><button type="button" class="b" data-close>やめる</button><button type="submit" class="b primary" id="ad-save">${isNew ? '追加する' : '保存する'}</button></div>`;
    dlg.showModal();
  }
  const newPid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  async function savePlayer() {
    const f = form.elements, isNew = form.dataset.mode === 'new';
    const name = f['氏名'].value.trim();
    if (!name) throw new Error('氏名を入れてください');
    const row = { '選手ID': isNew ? newPid() : editPid, '氏名': name, 'かな': f['かな'].value.trim(), '生年月日': f['生年月日'].value, 'クラス': f['クラス'].value.trim(),
      '打': f['打'].value, '投': f['投'].value, '投手': f['投手'].checked ? '1' : '', '状態': f['状態'].value, '備考': f['備考'].value.trim(), 'メール': f['メール'].value.trim(),
      '更新日時': Date.now(), '順': f['順'].value === '' ? '' : Number(f['順'].value) };
    if (isNew) { await call('upsertMaster', { master: { players: [row] } }); toast('選手を追加しました'); return; }
    /* 変更は、変えた欄だけを送る（ほかの人が同じ選手の別の欄を直していても、消さない） */
    const set = {};
    ['氏名', 'かな', '生年月日', 'クラス', '打', '投', '投手', '状態', '備考', '順', 'メール'].forEach(k => { if (String(row[k] == null ? '' : row[k]) !== String(editWas[k] == null ? '' : editWas[k])) set[k] = row[k]; });
    if (!Object.keys(set).length) { toast('変更はありません'); return; }
    await call('patchPlayers', { ids: [editPid], set });
    toast('保存しました');
  }

  /* ---------------- 測定項目 ---------------- */
  const STD = ['なし', '範囲', '下限', '上限', '左右差', '球速連動'];
  const STD_HELP = { 'なし': '', '範囲': '基準1〜基準2 に入っていれば良い', '下限': '基準1 以上なら良い', '上限': '基準1 以下なら良い',
    '左右差': '左右の差が 基準1 ％以内なら良い（左右を記録する項目だけ）', '球速連動': '「140:63」「150:66」のように 球速:値 を2つ。選手ごとの目標球速から按分する' };
  function itemsHtml() {
    const cats = []; items.forEach(i => { const c = String(i['カテゴリ']); if (cats.indexOf(c) < 0) cats.push(c); });
    const stdTxt = i => { const t = String(i['基準の型'] || 'なし'); return t === 'なし' ? '' : t === '範囲' ? `範囲 ${i['基準1']}〜${i['基準2']}` : t === '球速連動' ? `球速連動 ${i['基準1']}／${i['基準2']}` : t === '左右差' ? `左右差 ${i['基準1']}%` : `${t} ${i['基準1']}`; };
    return `<div class="card">
        <div class="head"><h3>測定項目<span class="count">${items.length}件</span></h3><button class="b primary" id="ad-iadd">項目を追加</button></div>
        <p class="note" style="margin-bottom:10px">フィジカルの種目です。使わなくなった項目は、消さずに「使う」を外してください（記録は残ります）。</p>
        ${cats.map(c => `<p class="note" style="margin:12px 0 2px; font-weight:700; color:var(--ink2)">${esc(c)}</p><ul class="list">${items.filter(i => String(i['カテゴリ']) === c).map(i => `<li><button class="row ${String(i['有効']) === '0' ? 'is-off' : ''}" data-iid="${esc(i['項目ID'])}">
          <span class="nm"><b>${esc(i['項目名'])}</b><span>${esc(i['単位'] || '単位なし')}${stdTxt(i) ? '　基準：' + esc(stdTxt(i)) : ''}${i['良い方向'] ? '　' + esc(i['良い方向']) : ''}</span></span>
          <span class="tags">${String(i['左右']) === '左右' ? '<span class="tag">左右</span>' : ''}${i['入力種別'] === '算出' ? '<span class="tag">算出</span>' : ''}${String(i['有効']) === '0' ? '<span class="tag off">使わない</span>' : ''}</span>
        </button></li>`).join('')}</ul>`).join('')}
      </div>`;
  }
  function openItem(i) {
    const isNew = !i;
    i = i || { '項目ID': '', '順': items.reduce((m, x) => Math.max(m, Number(x['順']) || 0), 0) + 1, 'カテゴリ': '', '項目名': '', '単位': '', '小数桁': 1, '左右': '', '入力種別': '実測',
               '算出元': '', '基準の型': 'なし', '基準1': '', '基準2': '', '良い方向': '', '出典メモ': '', '有効': 1 };
    editItem = i;
    form.dataset.kind = 'item'; form.dataset.mode = isNew ? 'new' : 'edit';
    const calc = i['入力種別'] === '算出';
    form.innerHTML = `<h3>${isNew ? '項目を追加' : '項目の変更'}</h3>
      <label class="f">項目名<input type="text" name="項目名" value="${esc(i['項目名'])}" autocomplete="off"></label>
      <div class="two"><label class="f">カテゴリ<input type="text" name="カテゴリ" value="${esc(i['カテゴリ'])}" list="ad-cats" autocomplete="off"><datalist id="ad-cats">${[...new Set(items.map(x => String(x['カテゴリ'])))].map(c => `<option value="${esc(c)}">`).join('')}</datalist></label>
        <label class="f">単位<input type="text" name="単位" value="${esc(i['単位'])}" autocomplete="off"></label></div>
      <div class="two"><label class="f">小数の桁<select name="小数桁">${opt([['0', '0（整数）'], ['1', '1'], ['2', '2'], ['3', '3']], String(Number(i['小数桁']) || 0))}</select></label>
        <label class="f">良い方向<select name="良い方向">${opt([['', '決めない'], ['大きいほど良い', '大きいほど良い'], ['小さいほど良い', '小さいほど良い'], ['範囲内が良い', '範囲内が良い']], i['良い方向'])}</select></label></div>
      <label class="chk"><input type="checkbox" name="左右" ${String(i['左右']) === '左右' ? 'checked' : ''} ${isNew ? '' : 'disabled'}> 左右を別々に記録する${isNew ? '' : '（あとから変えられません）'}</label>
      ${calc ? `<p class="note">この項目は入力せず、同じ日に測ったほかの項目から計算します。</p>` : ''}
      <label class="f">基準の型<select name="基準の型">${opt(STD.map(x => [x, x]), String(i['基準の型'] || 'なし'))}</select></label>
      <p class="note" id="ad-stdhelp" style="margin:-4px 0 0"></p>
      <div class="two" id="ad-stdbox"><label class="f">基準1<input type="text" name="基準1" value="${esc(i['基準1'])}" autocomplete="off" inputmode="decimal"></label>
        <label class="f" id="ad-std2">基準2<input type="text" name="基準2" value="${esc(i['基準2'])}" autocomplete="off" inputmode="decimal"></label></div>
      <div class="two"><label class="f">並び順<input type="number" name="順" value="${esc(i['順'])}" inputmode="numeric"></label>
        <label class="chk" style="align-self:end; padding-bottom:9px"><input type="checkbox" name="有効" ${String(i['有効']) === '0' ? '' : 'checked'}> 使う</label></div>
      <label class="f">メモ（測り方や基準の根拠）<input type="text" name="出典メモ" value="${esc(i['出典メモ'])}" autocomplete="off"></label>
      <div class="msg" id="ad-dmsg"></div>
      <div class="acts"><button type="button" class="b" data-close>やめる</button><button type="submit" class="b primary" id="ad-save">${isNew ? '追加する' : '保存する'}</button></div>`;
    syncStd(); dlg.showModal();
  }
  function syncStd() {
    const t = form.elements['基準の型'].value;
    form.querySelector('#ad-stdhelp').textContent = STD_HELP[t] || '';
    form.querySelector('#ad-stdbox').hidden = t === 'なし';
    form.querySelector('#ad-std2').hidden = !(t === '範囲' || t === '球速連動');
  }
  async function saveItem() {
    const f = form.elements, isNew = form.dataset.mode === 'new', i = editItem;
    if (!f['項目名'].value.trim()) throw new Error('項目名を入れてください');
    if (!f['カテゴリ'].value.trim()) throw new Error('カテゴリを入れてください');
    const row = Object.assign({}, i, { '項目ID': isNew ? 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4) : i['項目ID'],
      '項目名': f['項目名'].value.trim(), 'カテゴリ': f['カテゴリ'].value.trim(), '単位': f['単位'].value.trim(), '小数桁': Number(f['小数桁'].value),
      '左右': f['左右'].checked ? '左右' : '', '良い方向': f['良い方向'].value, '基準の型': f['基準の型'].value, '基準1': f['基準1'].value.trim(), '基準2': f['基準2'].value.trim(),
      '順': Number(f['順'].value) || 0, '有効': f['有効'].checked ? 1 : 0, '出典メモ': f['出典メモ'].value.trim(), '更新日時': Date.now() });
    const j = await call('upsertMeasureItems', { rows: [row] });
    if (j.result && j.result.skipped) throw new Error('ほかの端末で先に直されていました。読み込み直してから、もう一度直してください');
    toast(isNew ? '項目を追加しました' : '保存しました');
  }

  /* ---------------- 操作 ---------------- */
  ROOT.addEventListener('click', e => {
    const t = e.target;
    const seg = t.closest('.seg button');
    if (seg) { page = seg.dataset.page; store.set('admin-page', page); render();
      if (page === 'items' && !itemsAt && !loading) loadItems().then(render, er => { loadErr = String(er.message || er); render(); });
      return; }
    if (t.id === 'ad-bclear') { sel.clear(); bulk.step = ''; redrawList(); return; }
    if (t.id === 'ad-bno') { bulk.step = ''; redrawList(); return; }
    if (t.id === 'ad-bnext') { try { const pl = bulkPlan(); bulk = { field: bulk.field, step: 'ask', set: pl.set, text: pl.text, busy: false }; } catch (er) { bulk.err = String(er.message || er); } redrawList(); return; }
    if (t.id === 'ad-bgo') { if (!bulk.busy) runBulk(); return; }
    if (t.id === 'ad-reload') { load(); return; }
    if (t.id === 'ad-uadd') { openUser(null); return; }
    if (t.id === 'ad-inv' || t.id === 'ad-inv2') { inv = { step: 'ask', text: '', again: t.id === 'ad-inv2' }; render(); return; }
    if (t.id === 'ad-invno') { inv = { step: '', text: '' }; render(); return; }
    if (t.id === 'ad-invgo') { runInvite(); return; }
    if (t.id === 'ad-sendone') { sendOne(t); return; }
    if (t.id === 'ad-padd') { openPlayer(null); return; }
    if (t.id === 'ad-impgo') { runImport(); return; }
    if (t.id === 'ad-impno') { imp = { data: null, step: '', text: '' }; render(); return; }
    if (t.id === 'ad-iadd') { openItem(null); return; }
    const ir = t.closest('.row[data-iid]'); if (ir) { openItem(items.find(i => String(i['項目ID']) === ir.dataset.iid)); return; }
    const ur = t.closest('.row[data-uid]'); if (ur) { openUser(users.find(u => u.id === ur.dataset.uid)); return; }
    const pr = t.closest('.row[data-pid]'); if (pr) { openPlayer(players.find(p => String(p['選手ID']) === pr.dataset.pid)); return; }
    if (t.closest('[data-close]')) { dlg.close(); return; }
  });
  ROOT.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'ad-q') flt.q = t.value; else if (t.id === 'ad-fm1') flt.m1 = t.value; else if (t.id === 'ad-fm2') flt.m2 = t.value; else return;
    redrawList();
  });
  ROOT.addEventListener('change', async e => {
    const t = e.target;
    if (t.id === 'ad-fcls') { flt.cls = t.value; redrawList(); return; }
    if (t.id === 'ad-fgrade') { flt.grade = t.value; redrawList(); return; }
    if (t.id === 'ad-fsort') { flt.sort = t.value; redrawList(); return; }
    if (t.id === 'ad-fnomail') { flt.noMail = t.checked; redrawList(); return; }
    if (t.id === 'ad-fnobirth') { flt.noBirth = t.checked; redrawList(); return; }
    if (t.dataset && t.dataset.sel) { if (t.checked) sel.add(t.dataset.sel); else sel.delete(t.dataset.sel); bulk.step = ''; redrawList(); return; }
    if (t.id === 'ad-selall') { filtered().forEach(p => { const id = String(p['選手ID']); if (t.checked) sel.add(id); else sel.delete(id); }); bulk.step = ''; redrawList(); return; }
    if (t.id === 'ad-bf') { bulk.field = t.value; bulk.err = ''; redrawList(); return; }
    if (t.id === 'ad-bv') { const nb = ROOT.querySelector('#ad-bnewbox'); if (nb) nb.hidden = t.value !== NEWCLASS; return; }
    if (t.id === 'ad-impfile') { if (t.files && t.files[0]) readImport(t.files[0]); return; }
    if (t.name === 'role' && form.contains(t)) { syncRole(); return; }
    if (t.name === '基準の型' && form.contains(t)) { syncStd(); return; }
    if (t.name === 'pid' && form.contains(t) && form.dataset.mode === 'new' && !form.elements.name.value.trim()) { form.elements.name.value = pname(t.value); return; }
    if (t.id === 'ad-plogin') {
      const on = t.checked; t.disabled = true;
      try { await call('setPlayerLogin', { on }); playerLogin = on; toast(on ? '選手のログインを許可しました' : '選手のログインを止めました'); }
      catch (er) { toast(String(er.message || er)); }
      render();
    }
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('#ad-save'), m = form.querySelector('#ad-dmsg');
    if (btn.disabled) return;
    btn.disabled = true; m.textContent = '';
    try {
      if (form.dataset.kind === 'user') await saveUser(); else if (form.dataset.kind === 'item') await saveItem(); else await savePlayer();
      const kind = form.dataset.kind;
      dlg.close(); if (kind === 'item') await loadItems(true).catch(() => {});
      await load();
    } catch (er) { m.textContent = String(er.message || er); btn.disabled = false; }
  });

  ROOT.addEventListener('bt:show', () => { if (!loading && Date.now() - loadedAt > 60000) load(); });
  load();
}
