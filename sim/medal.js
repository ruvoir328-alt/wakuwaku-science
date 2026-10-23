/* シミュのミッション メダル・トロフィー（T-31。設計は docs/medal-plan.md）
   - メダル：ミッション 2こ（全部より1つ少ない）、トロフィー：ミッション全部
   - 絵・紙ふぶき・ジングルは、チャレンジモード（physics/app.js）と同じもの
   - 記録は端末の中（localStorage）だけ。保存できない端末でも、そのページの中ではふつうに動く
   使い方：シミュで <script src="medal.js"></script> を読みこみ、ミッションの ✓ をつけたあとに SimMedal.sync(done) を呼ぶ
           （done は { m1: true, ... }。シミュの中の done はさわらない。ニュートンくんのひとことの順番が変わらないように） */
(function () {
  const KEY = 'wakuwakupub_sim_guest';
  // シミュの一覧（ファイル名・話・名前）。マイページとシミュ一覧でも使う
  const SIMS = [
    { id: 'speed-race',        ep: 1, name: '速さくらべ' },
    { id: 'displacement',      ep: 2, name: '変位と移動距離' },
    { id: 'uniform-motion',    ep: 3, name: '動く歩道' },
    { id: 'relative-velocity', ep: 4, name: '電車と相対速度' },
    { id: 'inclined-plane',    ep: 5, name: '斜面台車' },
    { id: 'freefall',          ep: 6, name: '自由落下' },
    { id: 'vertical-throw',    ep: 7, name: '鉛直投げ上げ' },
    { id: 'horizontal-throw',  ep: 8, name: '水平投射' },
  ];

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveAll(all) {
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* 保存できない端末 */ }
  }
  const medalAt = total => Math.max(1, total - 1);
  function count(rec) { return Object.keys(rec || {}).filter(k => /^m\d+$/.test(k) && rec[k]).length; }
  function level(rec) {
    if (!rec || !rec.total) return '';
    const n = count(rec);
    return n >= rec.total ? 'trophy' : n >= medalAt(rec.total) ? 'medal' : '';
  }

  // ---- ここから下は、ミッションのあるシミュのページだけ ----
  const page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  const isSim = SIMS.some(s => s.id === page);
  let rec = null;   // このシミュの記録（保存できなくても、ここに残る）
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function items() { return Array.from(document.querySelectorAll('.missions li[id]')); }
  function getRec() {
    if (!rec) rec = Object.assign({}, loadAll()[page]);
    rec.total = items().length;
    return rec;
  }

  function addStyle() {
    if (document.getElementById('sim-medal-style')) return;
    const st = document.createElement('style');
    st.id = 'sim-medal-style';
    st.textContent = `
.missions{position:relative;overflow:hidden}
.missions h2 .sim-badge{margin-left:6px;font-size:16px;vertical-align:-1px}
.award{margin:10px auto 2px;text-align:center}
.award-badge{width:96px;height:96px;margin:0 auto}
.award-badge svg{width:100%;height:100%;display:block}
.award-label{font-family:'Dela Gothic One',sans-serif;font-size:18px;color:#d93a3f;margin-top:4px}
.award-sub{font-size:13px;font-weight:700;color:#6b7488}
.award-hint{margin:10px 0 2px;font-size:14px;font-weight:900;color:#7e5129;background:#fff7e9;border:2px dashed #e9c48f;border-radius:10px;padding:6px 10px;text-align:center}
.award.new .award-badge{animation:award-pop .9s cubic-bezier(.2,1.6,.4,1) both,award-shine 2.4s .9s ease-in-out infinite}
.award.new .award-label{animation:award-rise .5s .45s both}
@keyframes award-pop{0%{transform:scale(0) rotate(-200deg);opacity:0}70%{transform:scale(1.15) rotate(10deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes award-shine{0%,100%{transform:scale(1);filter:drop-shadow(0 0 0 rgba(255,225,74,0))}50%{transform:scale(1.05);filter:drop-shadow(0 0 10px rgba(255,225,74,.9))}}
@keyframes award-rise{from{transform:translateY(10px);opacity:0}to{transform:none;opacity:1}}
.confetti{position:absolute;top:-12px;width:8px;height:12px;border-radius:2px;pointer-events:none;animation:confetti-fall 2s ease-in forwards}
@keyframes confetti-fall{to{transform:translate(var(--dx),420px) rotate(var(--r));opacity:.2}}
@media (prefers-reduced-motion:reduce){.award.new .award-badge,.award.new .award-label{animation:none}.confetti{display:none}}`;
    document.head.appendChild(st);
  }

  // チャレンジモードと同じ絵（トロフィーの台の数字だけ、ミッションの数にする）
  function medalSVG(kind, total) {
    if (kind === 'trophy') return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M34 22 h52 v20 a26 26 0 0 1 -52 0z" fill="#ffe14a" stroke="#7e5129" stroke-width="3"/>
    <path d="M34 28 h-12 a12 12 0 0 0 14 18 M86 28 h12 a12 12 0 0 1 -14 18" fill="none" stroke="#7e5129" stroke-width="3"/>
    <rect x="54" y="66" width="12" height="16" fill="#e9c48f" stroke="#7e5129" stroke-width="3"/>
    <rect x="38" y="82" width="44" height="14" rx="3" fill="#22305a"/>
    <text x="60" y="93" text-anchor="middle" font-size="9" fill="#ffe14a" font-family="Zen Maru Gothic" font-weight="900">${total} / ${total}</text>
    <path d="M50 34 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#fff" opacity=".8"/></svg>`;
    return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M44 8 l-10 40 h18 l8 -22z M76 8 l10 40 h-18 l-8 -22z" fill="#d93a3f"/>
    <path d="M44 8 l-10 40 h18 l8 -22z" fill="#22305a" opacity=".85"/>
    <circle cx="60" cy="74" r="30" fill="#ffe14a" stroke="#7e5129" stroke-width="3"/>
    <circle cx="60" cy="74" r="22" fill="none" stroke="#e9c48f" stroke-width="3"/>
    <path d="M60 60 l4.5 9 10 1.4 -7.2 7 1.7 10 -9 -4.7 -9 4.7 1.7 -10 -7.2 -7 10 -1.4z" fill="#d93a3f"/></svg>`;
  }

  function confetti(box) {
    if (REDUCE) return;
    const colors = ['#d93a3f', '#22305a', '#ffe14a', '#e9c48f', '#3f9a5c'];
    for (let i = 0; i < 36; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};` +
        `animation-delay:${Math.random() * .5}s;animation-duration:${1.6 + Math.random()}s;--dx:${(Math.random() - .5) * 80}px;--r:${Math.random() * 720}deg`;
      box.appendChild(c);
      setTimeout(() => c.remove(), 3200);
    }
  }

  let audioCtx = null;
  function jingle(kind) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx, now = ctx.currentTime;
      const tone = (freq, type, start, dur, vol) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = type; osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.start(start); osc.stop(start + dur + 0.01);
      };
      const seq = kind === 'trophy'
        ? [[523.25, 0, .16], [659.25, .14, .16], [783.99, .28, .16], [1046.5, .42, .5], [783.99, .74, .14], [1046.5, .88, .14], [1318.5, 1.02, .7]]
        : [[783.99, 0, .14], [1046.5, .13, .14], [1318.5, .26, .45]];
      seq.forEach(([f, d, len]) => {
        tone(f, 'triangle', now + d, len, .2);
        tone(f * 2, 'sine', now + d, len * .8, .05);
      });
    } catch (e) { /* 音が出せない端末 */ }
  }

  // ✓・見出しのしるし・「あと ◯ こ」をかく
  function paint() {
    const r = getRec(), lv = level(r), box = document.querySelector('.missions');
    if (!box) return;
    items().forEach(li => {
      if (!r[li.id]) return;
      li.classList.add('done');
      li.querySelector('.box').textContent = '✓';
    });
    const h2 = box.querySelector('h2');
    let badge = h2 && h2.querySelector('.sim-badge');
    if (h2 && !badge) { badge = document.createElement('span'); badge.className = 'sim-badge'; h2.appendChild(badge); }
    if (badge) {
      badge.textContent = lv === 'trophy' ? '🏆' : lv === 'medal' ? '🥇' : '';
      badge.setAttribute('aria-label', lv === 'trophy' ? 'トロフィー' : lv === 'medal' ? 'メダル' : '');
    }
    let hint = box.querySelector('.award-hint');
    const left = lv === 'trophy' ? 0 : lv === 'medal' ? r.total - count(r) : medalAt(r.total) - count(r);
    if (lv === 'trophy' || box.querySelector('.award')) { if (hint) hint.remove(); return; }
    if (!hint) { hint = document.createElement('p'); hint.className = 'award-hint'; box.appendChild(hint); }
    hint.textContent = lv === 'medal' ? `あと ${left} こでトロフィー！（ミッション全部）` : `あと ${left} こでメダル！（ミッション ${medalAt(r.total)}こ）`;
  }

  // メダル・トロフィーをとった瞬間の箱
  function showAward(kind) {
    const box = document.querySelector('.missions'), r = getRec();
    box.querySelectorAll('.award, .award-hint').forEach(e => e.remove());
    const a = document.createElement('div');
    a.className = 'award new ' + kind;
    a.setAttribute('role', 'status');
    a.innerHTML = `<div class="award-badge">${medalSVG(kind, r.total)}</div>` +
      `<div class="award-label">${kind === 'trophy' ? 'トロフィー ゲット！' : 'メダル ゲット！'}</div>` +
      `<div class="award-sub">${kind === 'trophy' ? 'ミッション全部クリア' : 'ミッション ' + count(r) + ' / ' + r.total}</div>`;
    box.appendChild(a);
    confetti(box);
    jingle(kind);
  }

  // シミュから呼ぶ：今回たっせいしたミッションを記録に足す
  function sync(done) {
    if (!isSim) return;
    addStyle();
    const r = getRec(), before = level(r);
    let changed = false;
    items().forEach(li => { if (done && done[li.id] && !r[li.id]) { r[li.id] = true; changed = true; } });
    const after = level(r);
    if (changed) {
      const now = new Date().toISOString().slice(0, 19);
      if (after && !r.medalAt) r.medalAt = now;
      if (after === 'trophy' && !r.trophyAt) r.trophyAt = now;
      const all = loadAll(); all[page] = r; saveAll(all);
    }
    if (after && after !== before) showAward(after);
    paint();
  }

  window.SimMedal = {
    SIMS, sync,
    // マイページ・シミュ一覧用：{ id: 'medal' | 'trophy' | '' }
    levels() { const all = loadAll(); const o = {}; SIMS.forEach(s => { o[s.id] = level(all[s.id]); }); return o; },
    record(id) { return loadAll()[id] || null; },
    count,
  };

  if (isSim) {
    const start = () => { addStyle(); paint(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  }
})();
