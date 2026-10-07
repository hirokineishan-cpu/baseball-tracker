/* お知らせ（選手だけ）
   スタッフが「メッセージ配信」で送ったもののうち、自分あてのものを新しい順に出す。
   どれが自分あてかは、サーバーが決める（画面からは選手IDを送らない）。 */

const CSS = `
#tab-news .nw{ max-width:640px; margin:0 auto; padding:14px 14px 60px }
#tab-news .hd{ display:flex; align-items:center; gap:10px; margin:4px 2px 14px }
#tab-news h2{ margin:0; font-size:18px; letter-spacing:.04em; flex:1 1 auto }
#tab-news button.b{ appearance:none; font-size:14px; cursor:pointer; border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:9px; padding:8px 14px }
#tab-news button.b[disabled]{ opacity:.5 }
#tab-news .item{ background:var(--paper); border:1px solid var(--line); border-radius:var(--r); padding:14px 16px; margin-bottom:12px }
#tab-news .item.unread{ border-color:var(--gold) }
#tab-news .item b{ font-size:16px; overflow-wrap:anywhere }
#tab-news .meta{ font-size:12px; color:var(--muted); margin:3px 0 9px }
#tab-news .tx{ white-space:pre-wrap; overflow-wrap:anywhere; font-size:15px; line-height:1.75 }
#tab-news .new{ display:inline-block; font-size:11px; font-weight:700; color:var(--goldInk); border:1px solid var(--gold); border-radius:999px; padding:0 8px; margin-left:8px; vertical-align:middle }
#tab-news .empty{ padding:26px; text-align:center; color:var(--muted); font-size:13px; border:1px dashed var(--line); border-radius:var(--r) }
#tab-news .msg{ font-size:13px; color:var(--clay); margin:0 2px 10px }
`;

export function mount(ROOT, CORE) {
  const st = document.createElement('style');
  st.id = 'css-news'; st.textContent = CSS; document.head.appendChild(st);
  const { esc, store } = CORE, D = CORE.data.state;
  let fresh = null, busy = false;          // fresh：この画面を開いたときに、まだ読んでいなかったもの（開いている間は「新着」を残す）

  function render() {
    const list = D.messages || [], seen = store.get('msg-seen') || [];
    if (!fresh) fresh = new Set(list.filter(m => seen.indexOf(m.id) < 0).map(m => m.id));
    ROOT.innerHTML = `<div class="nw"><div class="hd"><h2>お知らせ</h2><button class="b" id="nw-refresh" ${busy ? 'disabled' : ''}>${busy ? '確かめています…' : '最新にする'}</button></div>
      ${D.error ? `<p class="msg" id="nw-err">${esc(D.error)}</p>` : ''}
      ${!D.ready ? '<div class="empty">読み込んでいます…</div>' : !list.length ? '<div class="empty" id="nw-empty">お知らせはまだありません。</div>' :
        `<div id="nw-list">${list.map(m => `<div class="item ${fresh.has(m.id) ? 'unread' : ''}"><b>${esc(m.subject)}</b>${fresh.has(m.id) ? '<span class="new">新着</span>' : ''}
          <div class="meta">${esc(String(m.at).slice(0, 16))}　${esc(m.from)}</div><div class="tx">${CORE.linkify(m.body)}</div></div>`).join('')}</div>`}</div>`;
  }
  /* 見たら、タブの印を消す */
  function markSeen() {
    if (ROOT.hidden || !D.ready) return;
    store.set('msg-seen', (D.messages || []).map(m => m.id));
    document.querySelector('#tabs button[data-tab="news"]')?.classList.remove('dot');
  }
  async function reload() {
    if (busy) return;
    busy = true; render();
    await CORE.data.refresh(true);
    busy = false;
    const seen = store.get('msg-seen') || []; (D.messages || []).forEach(m => { if (seen.indexOf(m.id) < 0) fresh.add(m.id); });
    render(); markSeen();
  }
  ROOT.addEventListener('click', e => { if (e.target.id === 'nw-refresh') reload(); });
  ROOT.addEventListener('bt:show', () => { if (Date.now() - D.at > 60000) reload(); else { render(); markSeen(); } });
  CORE.data.on(() => { if (!busy) { render(); markSeen(); } });
  render();
}
