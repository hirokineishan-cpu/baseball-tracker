/* メッセージ配信（管理・スタッフ）
   ・クラス別（いくつでも選べる）か、個別（選手を選ぶ）で、お知らせを送る
   ・送ったものは、選手のマイページに出る。「メールでも送る」を選ぶと、選手名簿のメールアドレスにも届く
   ・宛先を決めるのはサーバー。画面からは「どのクラスか」「どの選手か」だけを送る */

const CSS = `
#tab-message .mw{ max-width:860px; margin:0 auto; padding:12px 14px 60px }
#tab-message h2{ margin:6px 2px 12px; font-size:17px; letter-spacing:.05em }
#tab-message .card{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:14px 16px; margin-bottom:12px; min-width:0 }
#tab-message .card h3{ margin:0 0 10px; font-size:14px; color:var(--ink2) }
#tab-message .seg{ display:inline-flex; background:var(--raise); border:1px solid var(--line); border-radius:9px; padding:2px; gap:2px; margin-bottom:10px }
#tab-message .seg button{ appearance:none; border:0; background:transparent; color:var(--ink2); font-size:14px; font-weight:600; padding:7px 16px; border-radius:7px; cursor:pointer }
#tab-message .seg button[aria-pressed="true"]{ background:var(--accent); color:var(--accentInk) }
#tab-message label.f{ display:flex; flex-direction:column; gap:4px; font-size:12px; color:var(--muted); margin-top:10px; min-width:0 }
#tab-message input[type=text], #tab-message input[type=search], #tab-message select, #tab-message textarea{ font-size:16px; font-family:inherit; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:9px; padding:9px 10px; width:100%; min-width:0 }
#tab-message textarea{ min-height:150px; resize:vertical; line-height:1.6 }
#tab-message .chips{ display:flex; flex-wrap:wrap; gap:6px }
#tab-message .chip{ display:inline-flex; align-items:center; gap:6px; font-size:14px; color:var(--ink); border:1px solid var(--line); border-radius:999px; padding:6px 12px; cursor:pointer; background:var(--paper) }
#tab-message .chip input, #tab-message .pick input, #tab-message .chk input{ width:18px; height:18px; accent-color:var(--accent); margin:0; flex:0 0 auto }
#tab-message .chip:has(input:checked){ border-color:var(--accent); background:var(--raise); font-weight:700 }
#tab-message .chip small{ color:var(--muted); font-weight:400 }
#tab-message .two{ display:grid; grid-template-columns:2fr 1fr; gap:8px }
#tab-message .picks{ max-height:290px; overflow-y:auto; border:1px solid var(--line); border-radius:9px; margin-top:8px }
#tab-message .pick{ display:flex; align-items:center; gap:10px; padding:8px 10px; border-bottom:1px solid var(--line); cursor:pointer; font-size:14.5px }
#tab-message .pick:last-child{ border-bottom:0 }
#tab-message .pick small{ color:var(--muted); font-size:11.5px; margin-left:auto; text-align:right }
#tab-message .chk{ display:flex; gap:9px; align-items:center; font-size:14px; color:var(--ink); margin-top:12px; cursor:pointer }
#tab-message .sum{ font-size:13px; color:var(--ink); margin:10px 0 0; line-height:1.7 }
#tab-message .note{ font-size:12px; color:var(--muted); line-height:1.7; margin:6px 0 0 }
#tab-message .msg{ font-size:13px; color:var(--clay); min-height:1.2em; margin:8px 0 0 }
#tab-message .okmsg{ font-size:14px; color:var(--hit); margin:0 0 10px; line-height:1.7 }
#tab-message button.b{ appearance:none; font-size:14px; cursor:pointer; border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:9px; padding:9px 16px }
#tab-message button.b.primary{ background:var(--accent); color:var(--accentInk); border-color:var(--accent); font-weight:700 }
#tab-message button.b[disabled]{ opacity:.5 }
#tab-message .acts{ display:flex; gap:8px; flex-wrap:wrap; margin-top:12px }
#tab-message .pv{ background:var(--raise); border-radius:9px; padding:10px 12px; margin-top:8px; white-space:pre-wrap; overflow-wrap:anywhere; font-size:14px; line-height:1.7 }
#tab-message .hist{ list-style:none; margin:0; padding:0 }
#tab-message .hist li{ border-top:1px solid var(--line); padding:10px 0 }
#tab-message .hist b{ font-size:14.5px } #tab-message .hist .meta{ font-size:12px; color:var(--muted); margin-top:2px }
#tab-message .hist details{ margin-top:4px } #tab-message .hist summary{ cursor:pointer; font-size:12.5px; color:var(--ink2) }
@media (max-width:520px){ #tab-message .two{ grid-template-columns:1fr } #tab-message .seg{ display:flex } #tab-message .seg button{ flex:1 } }
`;
const NONE = '（クラスなし）', SUBJECT_MAX = 100, BODY_MAX = 2000;

export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-message'; st.textContent = CSS; document.head.appendChild(st);
  const { api, esc, store } = CORE, D = CORE.data.state;
  const $ = s => ROOT.querySelector(s);

  const kept = store.get('msg-draft') || {};
  const S = { mode: kept.mode === '個別' ? '個別' : 'クラス', classes: new Set(kept.classes || []), pids: new Set(kept.pids || []), subject: kept.subject || '', body: kept.body || '', email: !!kept.email };
  let step = 'edit', busy = false, err = '', done = null, q = '', qc = '', hist = [], quota = null, histErr = '', histAt = 0;
  const keep = () => store.set('msg-draft', { mode: S.mode, classes: [...S.classes], pids: [...S.pids], subject: S.subject, body: S.body, email: S.email });

  const hasMail = p => !!(p['メール'] || p['メールあり']);
  const players = () => (D.players || []).slice().sort((a, b) => (Number(a['順']) || 0) - (Number(b['順']) || 0) || String(a['かな'] || a['氏名']).localeCompare(String(b['かな'] || b['氏名']), 'ja'));
  const active = () => players().filter(p => !String(p['状態'] || ''));
  const clsOf = p => String(p['クラス'] || '') || NONE;
  function classList() {
    const m = new Map(); active().forEach(p => { const c = clsOf(p); m.set(c, (m.get(c) || 0) + 1); });
    return [...m.keys()].sort((a, b) => (a === NONE) - (b === NONE) || a.localeCompare(b, 'ja')).map(c => ({ c, n: m.get(c) }));
  }
  function targets() {
    if (S.mode === 'クラス') return active().filter(p => S.classes.has(clsOf(p)));
    return players().filter(p => S.pids.has(String(p['選手ID'])));
  }
  function summary() {
    const t = targets(), m = t.filter(hasMail).length;
    return { n: t.length, mail: m, text: `宛先 <b id="mg-n">${t.length}</b>人（メールアドレスあり <b id="mg-nm">${m}</b>人）` };
  }
  function pickList() {
    const kw = q.trim().toLowerCase();
    const list = players().filter(p => (!String(p['状態'] || '') || S.pids.has(String(p['選手ID']))) && (!qc || clsOf(p) === qc)
      && (!kw || (String(p['氏名']) + ' ' + String(p['かな'] || '')).toLowerCase().indexOf(kw) >= 0));
    if (!list.length) return '<p class="note" style="padding:10px">あてはまる選手がいません</p>';
    return list.map(p => { const id = String(p['選手ID']);
      return `<label class="pick"><input type="checkbox" data-pid="${esc(id)}" ${S.pids.has(id) ? 'checked' : ''}>${esc(p['氏名'])}<small>${esc(p['クラス'] || '')}${hasMail(p) ? '' : '　メールなし'}</small></label>`; }).join('');
  }
  function editHtml() {
    const cl = classList(), s = summary();
    const to = S.mode === 'クラス'
      ? `<div class="chips" id="mg-classes">${cl.map(x => `<label class="chip"><input type="checkbox" data-class="${esc(x.c)}" ${S.classes.has(x.c) ? 'checked' : ''}>${esc(x.c)}<small>${x.n}人</small></label>`).join('') || '<span class="note">在籍の選手がいません</span>'}</div>
         ${cl.length > 1 ? `<div class="acts" style="margin-top:8px"><button class="b" id="mg-call">すべて選ぶ</button><button class="b" id="mg-cnone">すべて外す</button></div>` : ''}
         <p class="note">選んだクラスの、在籍の選手に届きます（休会・退会者には届きません）。</p>`
      : `<div class="two"><input type="search" id="mg-q" value="${esc(q)}" placeholder="名前でさがす" autocomplete="off" aria-label="名前でさがす">
           <select id="mg-qc" aria-label="クラスで絞る"><option value="">すべてのクラス</option>${cl.map(x => `<option value="${esc(x.c)}"${x.c === qc ? ' selected' : ''}>${esc(x.c)}</option>`).join('')}</select></div>
         <div class="picks" id="mg-picks">${pickList()}</div>
         <div class="acts" style="margin-top:8px"><button class="b" id="mg-pall">表示中をすべて選ぶ</button><button class="b" id="mg-pnone">選択をすべて外す</button></div>`;
    return `<div class="card" id="mg-edit"><h3>だれに送るか</h3>
        <div class="seg"><button data-mode="クラス" aria-pressed="${S.mode === 'クラス'}">クラス別</button><button data-mode="個別" aria-pressed="${S.mode === '個別'}">個別</button></div>
        ${to}
        <p class="sum" id="mg-sum">${s.text}</p>
      </div>
      <div class="card"><h3>内容</h3>
        <label class="f" style="margin-top:0">件名（${SUBJECT_MAX}文字まで）<input type="text" id="mg-subject" value="${esc(S.subject)}" maxlength="${SUBJECT_MAX}" autocomplete="off"></label>
        <label class="f">本文（${BODY_MAX}文字まで）<textarea id="mg-body" maxlength="${BODY_MAX}">${esc(S.body)}</textarea></label>
        <p class="note" id="mg-len">${S.body.length} / ${BODY_MAX}文字</p>
        <label class="chk"><input type="checkbox" id="mg-email" ${S.email ? 'checked' : ''}> メールでも送る</label>
        <p class="note">送ったお知らせは、選手のマイページに出ます。「メールでも送る」を選ぶと、選手名簿のメールアドレスにも届きます（同じアドレスには1通だけ）。本文に URL（https://…）を書くと、選手の画面で押せるリンクになります。${quota == null ? '' : `今日あと <b id="mg-quota">${quota}</b> 通送れます。`}</p>
        <div class="msg" id="mg-err">${esc(err)}</div>
        <div class="acts"><button class="b primary" id="mg-next">確認へ</button><button class="b" id="mg-reset">入力を消す</button></div>
      </div>`;
  }
  function confirmHtml() {
    const s = summary(), t = targets();
    const who = S.mode === 'クラス' ? [...S.classes].join('、') : t.slice(0, 8).map(p => p['氏名']).join('、') + (t.length > 8 ? ' ほか' + (t.length - 8) + '人' : '');
    const over = S.email && quota != null && s.mail > quota;
    return `<div class="card" id="mg-confirm"><h3>この内容で送ります</h3>
      <p class="sum">${s.text}<br>${S.mode === 'クラス' ? 'クラス' : '選手'}：${esc(who)}</p>
      <p class="sum">${S.email ? `マイページと、メール（最大 ${s.mail}通）で届けます。` : 'マイページに届けます（メールは送りません）。'}</p>
      ${over ? `<p class="msg" id="mg-over">今日メールで送れるのは、あと ${quota}通です。入りきらない分はメールでは届かず、マイページだけに出ます。</p>` : ''}
      <p class="sum" style="font-weight:700; margin-top:12px">${esc(S.subject)}</p>
      <div class="pv" id="mg-pv">${CORE.linkify(S.body)}</div>
      <div class="msg" id="mg-err">${esc(err)}</div>
      <div class="acts"><button class="b primary" id="mg-send" ${busy ? 'disabled' : ''}>${busy ? '送っています…' : '送る'}</button><button class="b" id="mg-back" ${busy ? 'disabled' : ''}>直す</button></div>
      ${busy && S.email ? '<p class="note">メールは1通ずつ送るので、人数が多いと1〜2分かかります。このまま待ってください。</p>' : ''}</div>`;
  }
  function doneHtml() {
    const d = done, bits = [];
    if (d.emailAsked) { bits.push(`メール ${d.mailed}通`); if (d.noaddr) bits.push(`アドレスなし ${d.noaddr}人`); if (d.over) bits.push(`今日の上限で送れなかった ${d.over}通`); if (d.failed) bits.push(`送れなかった ${d.failed}通`); }
    return `<div class="card" id="mg-done"><p class="okmsg"><b>${d.count}人</b>に送りました。${bits.length ? '（' + bits.join('・') + '）' : ''}</p>
      <div class="acts" style="margin-top:0"><button class="b primary" id="mg-new">新しく書く</button></div></div>`;
  }
  function histHtml() {
    return `<div class="card" id="mg-hist"><h3>送った記録（新しい順）</h3>
      ${histErr ? `<div class="msg">${esc(histErr)}</div>` : !histAt ? '<p class="note">読み込んでいます…</p>' : !hist.length ? '<p class="note" id="mg-nohist">まだ送っていません。</p>' :
        `<ul class="hist">${hist.map(m => `<li><b>${esc(m.subject)}</b>
          <div class="meta">${esc(String(m.at).slice(0, 16))}　${esc(m.from)}　→　${esc(m.mode === 'クラス' ? 'クラス：' : '')}${esc(m.to)}（${m.count}人）${m.mailed ? '　メール ' + m.mailed + '通' : ''}${m.unsent ? '　メールで送れず ' + m.unsent + '通' : ''}</div>
          <details><summary>本文を見る</summary><div class="pv">${CORE.linkify(m.body)}</div></details></li>`).join('')}</ul>`}</div>`;
  }
  function render() {
    const sy = window.scrollY;
    if (!D.ready) { ROOT.innerHTML = `<div class="mw"><h2>メッセージ配信</h2><p class="note">${esc(D.error || '読み込んでいます…')}</p></div>`; return; }
    ROOT.innerHTML = `<div class="mw"><h2>メッセージ配信</h2>${step === 'confirm' ? confirmHtml() : step === 'done' ? doneHtml() : editHtml()}${histHtml()}</div>`;
    if (sy) window.scrollTo(0, sy);
  }
  const refreshSum = () => { const el = $('#mg-sum'); if (el) el.innerHTML = summary().text; };
  async function loadHist() {
    try { const j = await api('listMessages'); if (!j.ok) throw new Error(j.error || '記録を取れませんでした'); hist = j.messages || []; quota = Number(j.mailQuota) || 0; histErr = ''; }
    catch (e) { histErr = String(e.message || e); }
    histAt = Date.now();
    const typing = document.activeElement && ROOT.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (typing) { const h = $('#mg-hist'); if (h) h.outerHTML = histHtml(); const qv = $('#mg-quota'); if (qv) qv.textContent = quota; } else render();
  }
  async function send() {
    busy = true; err = ''; render();
    try {
      const j = await api('sendMessage', { mode: S.mode, classes: [...S.classes], pids: [...S.pids], subject: S.subject.trim(), body: S.body.trim(), email: S.email });
      if (!j.ok) throw new Error(j.error || '送れませんでした');
      done = Object.assign({ emailAsked: S.email }, j); quota = Number(j.mailQuota) || 0;
      S.subject = ''; S.body = ''; S.pids.clear(); S.classes.clear(); S.email = false; keep();
      step = 'done'; busy = false; render(); loadHist();
    } catch (e) { err = String(e.message || e); busy = false; render(); }
  }

  ROOT.addEventListener('click', e => {
    const t = e.target, m = t.closest('[data-mode]');
    if (m) { S.mode = m.dataset.mode; err = ''; keep(); render(); return; }
    if (t.id === 'mg-call') { classList().forEach(x => S.classes.add(x.c)); keep(); render(); return; }
    if (t.id === 'mg-cnone') { S.classes.clear(); keep(); render(); return; }
    if (t.id === 'mg-pall') { ROOT.querySelectorAll('#mg-picks [data-pid]').forEach(x => S.pids.add(x.dataset.pid)); keep(); render(); return; }
    if (t.id === 'mg-pnone') { S.pids.clear(); keep(); render(); return; }
    if (t.id === 'mg-reset') { S.subject = ''; S.body = ''; S.pids.clear(); S.classes.clear(); S.email = false; err = ''; keep(); render(); return; }
    if (t.id === 'mg-next') {
      const s = summary();
      err = !s.n ? '宛先を選んでください' : !S.subject.trim() ? '件名を入れてください' : !S.body.trim() ? '本文を入れてください' : '';
      if (!err) step = 'confirm';
      render(); window.scrollTo(0, 0); return;
    }
    if (t.id === 'mg-back') { step = 'edit'; err = ''; render(); return; }
    if (t.id === 'mg-send') { if (!busy) send(); return; }
    if (t.id === 'mg-new') { step = 'edit'; done = null; render(); return; }
  });
  ROOT.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset && t.dataset.class != null) { if (t.checked) S.classes.add(t.dataset.class); else S.classes.delete(t.dataset.class); keep(); refreshSum(); return; }
    if (t.dataset && t.dataset.pid) { if (t.checked) S.pids.add(t.dataset.pid); else S.pids.delete(t.dataset.pid); keep(); refreshSum(); return; }
    if (t.id === 'mg-email') { S.email = t.checked; keep(); return; }
    if (t.id === 'mg-qc') { qc = t.value; $('#mg-picks').innerHTML = pickList(); return; }
  });
  ROOT.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'mg-q') { q = t.value; $('#mg-picks').innerHTML = pickList(); return; }
    if (t.id === 'mg-subject') { S.subject = t.value; keep(); return; }
    if (t.id === 'mg-body') { S.body = t.value; keep(); const l = $('#mg-len'); if (l) l.textContent = S.body.length + ' / ' + BODY_MAX + '文字'; return; }
  });
  CORE.data.on(changed => { if (!changed && ROOT.querySelector('#mg-hist')) return;
    const a = document.activeElement; if (a && ROOT.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return; if (step === 'edit') render(); });
  ROOT.addEventListener('bt:show', () => { if (Date.now() - histAt > 60000) loadHist(); });
  render();
}
