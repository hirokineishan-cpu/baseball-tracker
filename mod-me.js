/* マイページ
   ・まだログインしていないとき：ログイン（ユーザーが1人もいないときは、最初の管理者の登録）
   ・ログイン中：だれで入っているか、使える項目への入口、パスワードの変更、ログアウト
   ・最初のパスワード変更が済むまでは、ここ以外は開けない（サーバー側でも断っている） */

const CSS = `
#tab-me .pw{ max-width:560px; margin:0 auto; padding:18px 14px 60px }
#tab-me .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:16px; margin-bottom:14px }
#tab-me h2{ margin:4px 2px 14px; font-size:18px; letter-spacing:.04em }
#tab-me h3{ margin:0 0 10px; font-size:14px; color:var(--ink2) }
#tab-me label.f{ display:flex; flex-direction:column; gap:4px; font-size:12px; color:var(--muted); margin-bottom:10px }
#tab-me input{ font-size:16px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:9px; padding:10px 11px; width:100% }
#tab-me button.b{ appearance:none; font-size:15px; cursor:pointer; border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:9px; padding:10px 16px }
#tab-me button.b.primary{ background:var(--accent); color:var(--accentInk); border-color:var(--accent); font-weight:700; width:100% }
#tab-me button.b[disabled]{ opacity:.5 }
#tab-me .msg{ font-size:13px; color:var(--clay); margin:8px 0 0; min-height:1.2em }
#tab-me .msg.ok{ color:var(--hit) }
#tab-me .note{ font-size:12px; color:var(--muted); line-height:1.7; margin:0 }
#tab-me .who{ font-size:20px; font-weight:800 }
#tab-me .role{ display:inline-block; font-size:12px; border:1px solid var(--gold); border-radius:999px; padding:1px 10px; margin-left:8px; color:var(--ink2); vertical-align:middle; font-weight:400 }
#tab-me .links{ display:flex; flex-direction:column; gap:8px; margin-top:12px }
#tab-me .links button{ text-align:left }
#tab-me .must{ background:var(--warnBg); color:var(--warn); border:1px solid var(--warn); border-radius:var(--r); padding:12px 14px; margin-bottom:14px; font-size:14px; font-weight:700 }
`;

export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-me'; st.textContent = CSS; document.head.appendChild(st);
  const { api, conn, store, esc } = CORE;

  let busy = false, msg = '', okMsg = '';
  let view = 'load';          // load | nourl | error | setup | login | in
  let rs = { id: '', name: '' };   // メールのリンクで開いたとき、だれのパスワードを決めるか
  let srvErr = '';            // ログイン中に、サーバーから断られた理由（選手のログインを止めている、など）

  function render() {
    const c = conn();
    if (view === 'load') { ROOT.innerHTML = `<div class="pw"><p class="note">確かめています…</p></div>`; return; }
    if (view === 'nourl') {
      ROOT.innerHTML = `<div class="pw"><h2>BaseballTracker</h2><div class="card"><h3>接続先がまだ設定されていません</h3>
        <p class="note">このページを用意した人に確認してください。</p></div></div>`; return;
    }
    if (view === 'error') {
      ROOT.innerHTML = `<div class="pw"><h2>BaseballTracker</h2><div class="card"><h3>つながりませんでした</h3>
        <div class="msg">${esc(msg)}</div><p class="note" style="margin-top:10px">電波の届くところで、もう一度試してください。</p>
        <button class="b" id="me-retry" style="margin-top:12px">もう一度試す</button></div></div>`; return;
    }
    if (view === 'setup') {
      ROOT.innerHTML = `<div class="pw"><h2>はじめの設定</h2><div class="card"><h3>最初の管理者を登録する</h3>
        <p class="note" style="margin-bottom:12px">まだだれも登録されていません。準備のときに出た「初期設定コード」を入れて、管理者のIDとパスワードを自分で決めてください。</p>
        <label class="f">初期設定コード<input id="su-code" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
        <label class="f">ID（半角の英数字）<input id="su-id" autocomplete="username" autocapitalize="off" spellcheck="false"></label>
        <label class="f">表示名<input id="su-name" autocomplete="off"></label>
        <label class="f">パスワード（6文字以上）<input id="su-pw" type="password" autocomplete="new-password"></label>
        <label class="f">パスワード（もう一度）<input id="su-pw2" type="password" autocomplete="new-password"></label>
        <button class="b primary" id="su-go" ${busy ? 'disabled' : ''}>${busy ? '登録しています…' : '登録する'}</button>
        <div class="msg">${esc(msg)}</div></div></div>`; return;
    }
    if (view === 'reset') {
      ROOT.innerHTML = `<div class="pw"><h2>パスワードを決める</h2><div class="card">
        <p class="note">ログインする人</p><div class="who" style="margin-bottom:12px"><span id="rs-name">${esc(rs.name)}</span><span class="role">ID：${esc(rs.id)}</span></div>
        <label class="f">新しいパスワード（6文字以上）<input id="rs-pw" type="password" autocomplete="new-password"></label>
        <label class="f">新しいパスワード（もう一度）<input id="rs-pw2" type="password" autocomplete="new-password"></label>
        <button class="b primary" id="rs-go" ${busy ? 'disabled' : ''}>${busy ? '決めています…' : 'このパスワードに決める'}</button>
        <div class="msg">${esc(msg)}</div>
        <p class="note" style="margin-top:12px">決めたパスワードは、スタッフにも見えません。IDとあわせて、自分でおぼえておいてください。</p></div></div>`; return;
    }
    if (view === 'resetend') {
      ROOT.innerHTML = `<div class="pw"><h2>BaseballTracker</h2><div class="card"><h3>${esc(okMsg || 'このリンクは使えません')}</h3>
        <div class="msg ${okMsg ? 'ok' : ''}" id="rs-endmsg">${esc(msg)}</div>
        <button class="b" id="rs-login" style="margin-top:12px">ログイン画面へ</button></div></div>`; return;
    }
    if (view === 'forgot') {
      ROOT.innerHTML = `<div class="pw"><h2>BaseballTracker</h2><div class="card"><h3>パスワードを忘れたとき</h3>
        <p class="note" style="margin-bottom:12px">IDを入れると、登録してあるメールアドレスに「パスワードを決め直すリンク」を送ります。</p>
        <label class="f">ID<input id="fg-id" autocomplete="username" autocapitalize="off" spellcheck="false"></label>
        <button class="b primary" id="fg-go" ${busy ? 'disabled' : ''}>${busy ? '送っています…' : '送る'}</button>
        <div class="msg ${okMsg ? 'ok' : ''}" id="fg-msg">${esc(okMsg || msg)}</div>
        <button class="b" id="fg-back" style="margin-top:12px">ログイン画面にもどる</button></div></div>`; return;
    }
    if (view === 'login') {
      ROOT.innerHTML = `<div class="pw"><h2>BaseballTracker</h2><div class="card"><h3>ログイン</h3>
        <label class="f">ID<input id="me-id" autocomplete="username" autocapitalize="off" spellcheck="false"></label>
        <label class="f">パスワード<input id="me-pw" type="password" autocomplete="current-password"></label>
        <button class="b primary" id="me-login" ${busy ? 'disabled' : ''}>${busy ? 'ログインしています…' : 'ログイン'}</button>
        <div class="msg">${esc(msg)}</div>
        <p class="note" style="margin-top:12px">IDは、スタッフからの案内（メール）に書いてあります。</p>
        <button class="b" id="me-forgot" style="margin-top:10px; font-size:13px">パスワードを忘れたとき</button></div></div>`; return;
    }
    const others = CORE.tabs().filter(t => t.key !== 'me');
    const name = (c.me && c.me.name) || (c.user && c.user.name) || '';
    ROOT.innerHTML = `<div class="pw"><h2>マイページ</h2>
      ${c.must ? `<div class="must" id="me-must">最初に、パスワードを自分だけのものに変えてください。変えるまで、ほかのページは開けません。</div>` : ''}
      ${srvErr ? `<div class="must" id="me-srverr">${esc(srvErr)}</div>` : ''}
      <div class="card"><p class="note">ログイン中</p><div class="who"><span id="me-name">${esc(name)}</span><span class="role" id="me-role">${esc(CORE.role())}</span></div>
        ${others.length ? `<div class="links">${others.map(t => `<button class="b" data-go="${esc(t.key)}">${esc(t.label)}を開く</button>`).join('')}</div>` : ''}</div>
      <div class="card"><h3>パスワードを変える</h3>
        <label class="f">今のパスワード<input id="me-old" type="password" autocomplete="current-password"></label>
        <label class="f">新しいパスワード（6文字以上）<input id="me-new" type="password" autocomplete="new-password"></label>
        <label class="f">新しいパスワード（もう一度）<input id="me-new2" type="password" autocomplete="new-password"></label>
        <button class="b" id="me-chpw" ${busy ? 'disabled' : ''}>${busy ? '変更しています…' : '変更する'}</button>
        <div class="msg ${okMsg ? 'ok' : ''}" id="me-chmsg">${esc(okMsg || msg)}</div></div>
      <div class="card"><button class="b" id="me-logout">ログアウト</button>
        <p class="note" style="margin-top:10px">みんなで使う端末では、見終わったら必ずログアウトしてください。この端末に残した自分のデータも消えます。</p></div></div>`;
  }
  const val = id => (ROOT.querySelector('#' + id)?.value || '');

  async function check() {
    if (conn().token) {
      view = 'in'; render();
      const j = await CORE.session;
      if (j && !j.ok && j.error && !j.mustChange) { srvErr = j.error; render(); }
      else if (j && j.ok) render();
      return;
    }
    if (!CORE.appUrl()) { view = 'nourl'; render(); return; }
    view = 'load'; render();
    if (CORE.resetToken) {
      try {
        const j = await api('resetInfo', { rt: CORE.resetToken });
        if (j && j.ok) { rs = { id: j.id, name: j.name }; view = 'reset'; msg = ''; }
        else { view = 'resetend'; okMsg = ''; msg = (j && j.error) || 'このリンクは使えません'; }
      } catch (e) { view = 'error'; msg = String(e.message || e); }
      render(); return;
    }
    try {
      const p = await api('ping');
      if (!p || !p.ok) throw new Error((p && p.error) || 'サーバーが応答しませんでした');
      if (String(p.team || '') !== CORE.cfg.TEAM_ID) throw new Error('接続先が、このページ用のものではありません（名札が違います）');
      view = p.needsSetup ? 'setup' : 'login'; msg = '';
    } catch (e) { view = 'error'; msg = String(e.message || e); }
    render();
  }
  function enter(j) {
    CORE.setConn({ token: j.token, user: { id: j.user.id, name: j.user.name, role: j.user.role }, exp: j.exp, must: !!j.user.must });
    store.del('tab');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    location.reload();
  }

  ROOT.addEventListener('click', async e => {
    const t = e.target;
    if (t.id === 'me-retry') { check(); return; }
    if (t.id === 'rs-login') { history.replaceState(null, '', location.pathname + location.search); location.reload(); return; }
    if (t.id === 'me-forgot') { view = 'forgot'; msg = okMsg = ''; render(); return; }
    if (t.id === 'fg-back') { view = 'login'; msg = okMsg = ''; render(); return; }
    const go = t.closest('[data-go]'); if (go) { CORE.go(go.dataset.go); return; }
    if (busy) return;
    if (t.id === 'su-go') {
      const keep = { code: val('su-code').trim(), id: val('su-id').trim(), name: val('su-name').trim() };
      const pw = val('su-pw'), pw2 = val('su-pw2');
      const back = () => { render(); ROOT.querySelector('#su-code').value = keep.code; ROOT.querySelector('#su-id').value = keep.id; ROOT.querySelector('#su-name').value = keep.name; };
      if (!keep.code || !keep.id || !pw) { msg = '初期設定コード・ID・パスワードを入れてください'; back(); return; }
      if (pw.length < 6) { msg = 'パスワードは6文字以上にしてください'; back(); return; }
      if (pw !== pw2) { msg = '2つのパスワードが同じではありません'; back(); return; }
      busy = true; msg = ''; back();
      try {
        const j = await api('bootstrapAdmin', { code: keep.code, id: keep.id, name: keep.name, password: pw });
        if (!j.ok) throw new Error(j.error || '登録できませんでした');
        enter(j); return;
      } catch (er) { msg = String(er.message || er); }
      busy = false; back(); return;
    }
    if (t.id === 'rs-go') {
      const pw = val('rs-pw'), pw2 = val('rs-pw2');
      if (pw.length < 6) { msg = 'パスワードは6文字以上にしてください'; render(); return; }
      if (pw !== pw2) { msg = '2つのパスワードが同じではありません'; render(); return; }
      busy = true; msg = ''; render();
      try {
        const j = await api('resetPassword', { rt: CORE.resetToken, newPassword: pw });
        if (!j.ok) throw new Error(j.error || '決められませんでした');
        store.wipe();                                   // パスワードを決めた人の端末として扱う（前の人のログインや控えが残っていれば、ここで消す）
        if (j.token) { enter(j); return; }
        view = 'resetend'; okMsg = 'パスワードを決めました'; msg = j.note || '';
      } catch (er) { msg = String(er.message || er); }
      busy = false; render(); return;
    }
    if (t.id === 'fg-go') {
      const id = val('fg-id').trim();
      if (!id) { msg = 'IDを入れてください'; okMsg = ''; render(); return; }
      busy = true; msg = okMsg = ''; render();
      try {
        const j = await api('requestReset', { id });
        if (!j.ok) throw new Error(j.error || '送れませんでした');
        okMsg = j.note || '送りました';
      } catch (er) { msg = String(er.message || er); }
      busy = false; render(); return;
    }
    if (t.id === 'me-login') {
      const id = val('me-id').trim(), pw = val('me-pw');
      const back = () => { render(); ROOT.querySelector('#me-id').value = id; };
      if (!id || !pw) { msg = 'IDとパスワードを入れてください'; back(); return; }
      busy = true; msg = ''; back();
      try {
        const j = await api('login', { id, password: pw });
        if (!j.ok) throw new Error(j.error || 'ログインできませんでした');
        enter(j); return;
      } catch (er) { msg = String(er.message || er); }
      busy = false; back(); return;
    }
    if (t.id === 'me-chpw') {
      const o = val('me-old'), n = val('me-new'), n2 = val('me-new2');
      okMsg = '';
      if (!o) { msg = '今のパスワードを入れてください'; render(); return; }
      if (n.length < 6) { msg = '新しいパスワードは6文字以上にしてください'; render(); return; }
      if (n !== n2) { msg = '新しいパスワードが2つとも同じではありません'; render(); return; }
      busy = true; msg = ''; render();
      try {
        const j = await api('changePassword', { oldPassword: o, newPassword: n });
        if (!j.ok) throw new Error(j.error || '変更できませんでした');
        const c = conn(), was = !!c.must;
        c.token = j.token; c.exp = j.exp; c.must = false; CORE.setConn(c);
        if (was) { location.reload(); return; }      // ほかのページを開けるようにする
        okMsg = 'パスワードを変更しました';
      } catch (er) { msg = String(er.message || er); }
      busy = false; render(); return;
    }
    if (t.id === 'me-logout') {
      const dr = Object.keys((store.get('ph-draft') || {}).draft || {}).length;
      if (dr && t.dataset.sure !== '1') { t.dataset.sure = '1'; t.textContent = 'ログアウトする（未保存の入力を捨てる）';
        t.insertAdjacentHTML('afterend', `<div class="msg" id="me-outwarn">計測に、まだ保存していない入力が ${dr}件あります。ログアウトすると消えます。よければ、もう一度押してください。</div>`); return; }
      busy = true;
      try { await api('logout'); } catch (er) {}
      store.wipe();                                   // この端末に残した自分のデータの控えも消す
      location.reload(); return;
    }
  });
  ROOT.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'me-pw' || e.target.id === 'me-id') ROOT.querySelector('#me-login')?.click();
    if (e.target.id === 'su-pw2') ROOT.querySelector('#su-go')?.click();
    if (e.target.id === 'rs-pw2') ROOT.querySelector('#rs-go')?.click();
    if (e.target.id === 'fg-id') ROOT.querySelector('#fg-go')?.click();
    if (e.target.id === 'me-new2') ROOT.querySelector('#me-chpw')?.click();
  });

  check();
}
