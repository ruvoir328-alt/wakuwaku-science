/* わくわく化学基礎 チャレンジモード（化学1章〜）
   物理のドリル（physics/app.js）と同じ見た目・同じごほうび（メダル＝10問中4問以上、トロフィー＝全問正解）。
   化学は「選ぶ問題」が多いので、問題は2つの形：
     選ぶ問題  { badge, text, choices: ['…', …], answer: '…（choices のどれか）', explain, pic? }
     数の問題  { badge, text, number: true, answer: 273, unit: 'K', tol: 0, explain, pic? }
   記録は端末の中だけ（localStorage の wakuwakupub_progress_guest。単元の番号は「化1-1」など） */

const TOTAL = 10;
const MEDAL = 4;
const KEY = 'wakuwakupub_progress_guest';

let score = 0, count = 0, current = null, answered = false, picked = null;

const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickOne = a => a[Math.floor(Math.random() * a.length)];
// 選ぶ問題：正解1つ＋まちがい（ランダムに並べる）
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ========================================
// 問題（単元ごと）
// ========================================

/* 化1-1（第1話）：純物質と混合物 */
const PURE = ['水（純水）', '酸素', '塩化ナトリウム', '鉄', '二酸化炭素', 'エタノール', 'ダイヤモンド', '銅'];
const MIX  = ['海水', '空気', '牛乳', '食塩水', '石油', 'しょうゆ', '花こう岩', '水道水'];
function qPureOrMix() {
  const pure = Math.random() < 0.5, name = pickOne(pure ? PURE : MIX);
  return {
    badge: '純物質と混合物',
    text: `ニュートンくんが、ビーカーに入れた「<b>${name}</b>」を見せた。<br>これは純物質？ それとも混合物？`,
    choices: ['純物質', '混合物'], answer: pure ? '純物質' : '混合物',
    explain: pure ? `${name}は、1種類の物質だけでできている → <b>純物質</b>。` : `${name}は、2種類以上の物質がまざっている → <b>混合物</b>。`
  };
}
function qFindMix() {
  const mix = pickOne(MIX), pures = shuffle(PURE).slice(0, 3);
  return {
    badge: '純物質と混合物',
    text: `リカが4つのものをならべた。<br>この中で<b>混合物</b>はどれ？`,
    choices: shuffle([mix, ...pures]), answer: mix,
    explain: `${mix}は、いくつかの物質がまざった<b>混合物</b>。ほかの3つは、1種類の物質だけでできた純物質。`
  };
}
function qBoiling() {
  const pure = Math.random() < 0.5;
  const what = pure ? '純水' : '食塩水';
  return {
    badge: '純物質と混合物',
    text: `${what}を同じ強さで熱し続けた。沸騰が始まったあと、温度はどうなる？<br><small>（1気圧）</small>`,
    choices: ['100 ℃ で一定になる', '100 ℃ をこえて、少しずつ上がり続ける', 'だんだん下がる'],
    answer: pure ? '100 ℃ で一定になる' : '100 ℃ をこえて、少しずつ上がり続ける',
    explain: pure ? '純物質は沸点が決まっている。純水は 100 ℃ で温度が一定になる。'
                  : '混合物は沸点が決まっていない。水が減って濃くなると、沸騰する温度も上がっていく。'
  };
}

/* 化1-7（第8話）：熱運動と絶対温度  T = t + 273 */
function qToKelvin() {
  const t = pickOne([-273, -73, -23, 0, 27, 37, 100, 127, 227]);
  return {
    badge: '絶対温度',
    text: `セルシウス温度 <b>${t < 0 ? '−' + (-t) : t} ℃</b>は、絶対温度で何 K？<br><small>（T = t + 273）</small>`,
    number: true, answer: t + 273, unit: 'K', tol: 0,
    explain: `T = t + 273 = ${t < 0 ? '(−' + (-t) + ')' : t} + 273 = <b>${t + 273} K</b>`
  };
}
function qToCelsius() {
  const T = pickOne([0, 73, 200, 273, 300, 310, 373, 400]);
  return {
    badge: '絶対温度',
    text: `絶対温度 <b>${T} K</b>は、セルシウス温度で何 ℃？<br><small>（t = T − 273。マイナスのときは − をつけて入力）</small>`,
    number: true, signed: true, answer: T - 273, unit: '℃', tol: 0,
    explain: `t = T − 273 = ${T} − 273 = <b>${T - 273} ℃</b>`
  };
}
function qParticle() {
  return pickOne([
    { badge: '熱運動', text: '水が水蒸気になると、水の粒はどうなる？',
      choices: ['粒の大きさは同じで、すきまが広がる', '粒そのものが大きくなる', '粒の数がふえる'],
      answer: '粒の大きさは同じで、すきまが広がる',
      explain: '粒の大きさも数も変わらない。粒がはげしく動いて、すきまが広がるので体積が大きくなる。' },
    { badge: '熱運動', text: '温度が高くなると、物質をつくる粒の動き（熱運動）はどうなる？',
      choices: ['はげしくなる', 'おだやかになる', '変わらない'], answer: 'はげしくなる',
      explain: '温度が高いほど、粒ははげしく熱運動をする。' },
    { badge: '絶対温度', text: '粒の熱運動が止まる、いちばん低い温度は？',
      choices: ['−273 ℃（0 K）', '0 ℃（273 K）', '−100 ℃（173 K）'], answer: '−273 ℃（0 K）',
      explain: '−273 ℃ で粒の動きが止まる。この温度を 0 とした温度が絶対温度（単位 K）。' }
  ]);
}

// 単元：名前・話の番号（📖 第◯話）・問題
const UNITS = {
  '化1-1': { name: '純物質と混合物',   ep: 1, title: '透明な水は、純粋？',               gens: [qPureOrMix, qFindMix, qBoiling] },
  '化1-7': { name: '熱運動と絶対温度', ep: 8, title: '水が水蒸気になると、粒は大きくなる？', gens: [qToKelvin, qToCelsius, qParticle] }
};
// シミュから来たときの「← 第◯話のシミュにもどる」（化学1章のシミュを作ったら足す）
const SIM_EP = {};

const unitId = new URLSearchParams(location.search).get('unit');
const unit = UNITS[unitId] || UNITS['化1-1'];
const unitKey = UNITS[unitId] ? unitId : '化1-1';

// ========================================
// 音（物理のドリルと同じ音）
// ========================================
let soundOn = true, audioCtx = null;
function getAudioCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playTone(freq, type, start, dur, vol, ctx) {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start); osc.stop(start + dur + 0.01);
}
function sound(fn) { if (!soundOn) return; try { fn(getAudioCtx()); } catch (e) { /* 音が出せない端末 */ } }
const playCorrect = () => sound(ctx => { const n = ctx.currentTime; playTone(523.25, 'sine', n, .15, .28, ctx); playTone(783.99, 'sine', n + .12, .25, .28, ctx); });
const playWrong = () => sound(ctx => { const n = ctx.currentTime; playTone(220, 'square', n, .18, .12, ctx); playTone(180, 'square', n + .14, .18, .10, ctx); });
const playFanfare = () => sound(ctx => { const n = ctx.currentTime; [[523.25, 0], [659.25, .14], [783.99, .28], [1046.5, .42]].forEach(([f, d]) => playTone(f, 'sine', n + d, .3, .22, ctx)); });
function awardJingle(kind) {
  sound(ctx => {
    const now = ctx.currentTime;
    const seq = kind === 'trophy'
      ? [[523.25, 0, .16], [659.25, .14, .16], [783.99, .28, .16], [1046.5, .42, .5], [783.99, .74, .14], [1046.5, .88, .14], [1318.5, 1.02, .7]]
      : [[783.99, 0, .14], [1046.5, .13, .14], [1318.5, .26, .45]];
    seq.forEach(([f, d, len]) => { playTone(f, 'triangle', now + d, len, .2, ctx); playTone(f * 2, 'sine', now + d, len * .8, .05, ctx); });
  });
}
function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('sound-btn').textContent = soundOn ? '🎵' : '🔇';
}

// ========================================
// リカ（いっしょに解くガイド役）
// ========================================
function rika(face, text) {
  document.getElementById('rika-img').src = `../story/img/rika_${face}.webp`;
  document.getElementById('rika-line').textContent = text;
}
['normal', 'confident', 'surprise', 'idea', 'question', 'happy', 'oops'].forEach(f => { new Image().src = `../story/img/rika_${f}.webp`; });

// ========================================
// 問題を出す・答え合わせ
// ========================================
function loadProblem() {
  answered = false; picked = null;
  if (count === 0) rika('normal', 'いっしょに解こう！ ニュートンくんの話を思い出してね。');
  else if (TOTAL - count <= 3) rika('confident', `あと ${TOTAL - count} 問！ ラストスパート！`);
  else rika('normal', '次の問題、いってみよう！');
  current = pickOne(unit.gens)();

  document.getElementById('badge').textContent = current.badge;
  document.getElementById('problem-text').innerHTML = current.text;
  document.getElementById('pic').innerHTML = current.pic || '';
  const area = document.getElementById('answer-area');
  if (current.number) {
    area.innerHTML = `<div class="input-row"><span class="input-label">答え =</span>
      <input type="number" class="answer-input" id="inp-result" placeholder="?" inputmode="${current.signed ? 'text' : 'decimal'}" step="any" autocomplete="off">
      <span class="unit">${current.unit}</span></div>`;
  } else {
    area.innerHTML = '<div class="choices" role="group" aria-label="答えをえらぶ"></div>';
    const box = area.firstChild;
    current.choices.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'choice-btn'; b.textContent = c; b.setAttribute('aria-pressed', 'false');
      b.onclick = () => { if (answered) return; picked = c; box.querySelectorAll('.choice-btn').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); };
      box.appendChild(b);
    });
  }
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('explain').style.display = 'none';
  document.getElementById('check-btn').style.display = 'block';
  document.getElementById('next-btn').style.display = 'none';
}

function checkAnswer() {
  if (answered) return;
  let ok;
  if (current.number) {
    const el = document.getElementById('inp-result');
    if (el.value === '') { rika('question', 'あれ、答えの欄がまだ空いてるよ？'); return; }
    const v = parseFloat(el.value.replace('−', '-'));
    ok = Math.abs(v - current.answer) <= (current.tol || 0) + 1e-9;
    el.classList.add(ok ? 'correct' : 'incorrect'); el.disabled = true;
  } else {
    if (picked === null) { rika('question', 'どれかひとつ、えらんでね。'); return; }
    ok = picked === current.answer;
    document.querySelectorAll('.choice-btn').forEach(b => {
      b.disabled = true;
      if (b.textContent === current.answer) b.classList.add('correct');
      else if (b.textContent === picked) b.classList.add('incorrect');
    });
  }
  answered = true; count++;
  if (ok) score++;
  const fb = document.getElementById('feedback');
  fb.textContent = ok ? '✓ 正解！' : `✗ ざんねん。答えは「${current.answer}${current.number ? ' ' + current.unit : ''}」`;
  fb.className = 'feedback ' + (ok ? 'correct' : 'incorrect');
  const ex = document.getElementById('explain');
  ex.innerHTML = current.explain; ex.style.display = 'block';
  if (ok) { playCorrect(); rika('happy', pickOne(['やった、正解！', 'その調子！', 'ばっちりだね！'])); }
  else { playWrong(); rika('oops', 'わたしもまちがえた…。下の説明を読んでおこう！'); }
  document.getElementById('score').textContent = score;
  document.getElementById('total').textContent = count;
  document.getElementById('progress-fill').style.width = (count / TOTAL * 100) + '%';
  document.getElementById('progress-text').textContent = `${count} / ${TOTAL} 問`;
  document.getElementById('check-btn').style.display = 'none';
  const next = document.getElementById('next-btn');
  next.style.display = 'block';
  next.textContent = count >= TOTAL ? '結果を見る →' : '次の問題 →';
}

function nextProblem() {
  if (count >= TOTAL) { showResult(); return; }
  loadProblem();
}

// ========================================
// 結果とごほうび（物理のドリルと同じ）
// ========================================
function loadAll() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
function saveProgress() {
  const data = loadAll(), prev = data[unitKey] || { bestScore: 0, perfect: false };
  data[unitKey] = { bestScore: Math.max(prev.bestScore, score), perfect: prev.perfect || score === TOTAL };
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 保存できない端末 */ }
}
function medalSVG(kind) {
  if (kind === 'trophy') return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M34 22 h52 v20 a26 26 0 0 1 -52 0z" fill="#ffe14a" stroke="#7e5129" stroke-width="3"/>
    <path d="M34 28 h-12 a12 12 0 0 0 14 18 M86 28 h12 a12 12 0 0 1 -14 18" fill="none" stroke="#7e5129" stroke-width="3"/>
    <rect x="54" y="66" width="12" height="16" fill="#e9c48f" stroke="#7e5129" stroke-width="3"/>
    <rect x="38" y="82" width="44" height="14" rx="3" fill="#22305a"/>
    <text x="60" y="93" text-anchor="middle" font-size="9" fill="#ffe14a" font-family="Zen Maru Gothic" font-weight="900">10 / 10</text>
    <path d="M50 34 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#fff" opacity=".8"/></svg>`;
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M44 8 l-10 40 h18 l8 -22z M76 8 l10 40 h-18 l-8 -22z" fill="#d93a3f"/>
    <path d="M44 8 l-10 40 h18 l8 -22z" fill="#22305a" opacity=".85"/>
    <circle cx="60" cy="74" r="30" fill="#ffe14a" stroke="#7e5129" stroke-width="3"/>
    <circle cx="60" cy="74" r="22" fill="none" stroke="#e9c48f" stroke-width="3"/>
    <path d="M60 60 l4.5 9 10 1.4 -7.2 7 1.7 10 -9 -4.7 -9 4.7 1.7 -10 -7.2 -7 10 -1.4z" fill="#d93a3f"/></svg>`;
}
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(card) {
  if (REDUCE) return;
  const colors = ['#d93a3f', '#22305a', '#ffe14a', '#e9c48f', '#3f9a5c'];
  for (let i = 0; i < 36; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};` +
      `animation-delay:${Math.random() * .5}s;animation-duration:${1.6 + Math.random()}s;--dx:${(Math.random() - .5) * 80}px;--r:${Math.random() * 720}deg`;
    card.appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
}
function showResult() {
  const prev = loadAll()[unitKey] || { bestScore: 0, perfect: false };
  saveProgress();
  document.getElementById('problem-view').style.display = 'none';
  document.getElementById('result-view').style.display = 'block';
  const pct = score / TOTAL;
  let title, msg;
  if      (pct >= .9) { title = '完璧！すごい！';   msg = `${score}問正解！この単元はバッチリですね！`;     rika('happy', 'すごすぎる！ わたしも見習わなきゃ！'); }
  else if (pct >= .7) { title = 'よくできました！'; msg = `${score}問正解！あと少しで満点です！`;         rika('confident', 'いい感じ！ 次は満点ねらっちゃおう！'); }
  else if (pct >= .5) { title = 'もう少し！';       msg = `${score}問正解。説明を読んで再挑戦！`;         rika('idea', '説明を読み直したら、きっとのびるよ！'); }
  else                { title = '頑張ろう！';        msg = `${score}問正解。くり返し練習しよう！`;       rika('oops', 'わたしも最初はまちがえてばっかりだったよ。もう一回やろう！'); }
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-score-num').textContent = score;
  document.getElementById('result-msg').textContent = msg;

  let kind = null, label = '', sub = '';
  const hadMedal = prev.bestScore >= MEDAL;
  if (score === TOTAL)     { kind = 'trophy'; label = prev.perfect ? 'トロフィー（もう持っている）' : 'トロフィー ゲット！'; sub = '全問正解のしるし'; }
  else if (score >= MEDAL) { kind = 'medal';  label = !hadMedal ? 'メダル ゲット！' : score > prev.bestScore ? 'ベスト記録 更新！' : 'メダル（もう持っている）'; sub = 'ベスト ' + Math.max(score, prev.bestScore) + ' / 10'; }
  const isNew = kind === 'trophy' ? !prev.perfect : kind === 'medal' ? (!hadMedal || score > prev.bestScore) : false;
  const card = document.querySelector('.result-card');
  card.querySelectorAll('.award, .award-hint').forEach(e => e.remove());
  const box = document.createElement('div');
  if (kind) {
    box.className = 'award ' + kind + (isNew ? ' new' : '');
    box.innerHTML = `<div class="award-badge">${medalSVG(kind)}</div><div class="award-label">${label}</div><div class="award-sub">${sub}</div>`;
    if (isNew) { confetti(card); awardJingle(kind); } else playFanfare();
  } else {
    box.className = 'award-hint';
    box.textContent = `あと ${MEDAL - score} 問でメダル！（${MEDAL}問以上）`;
    playFanfare();
  }
  card.insertBefore(box, card.querySelector('.result-msg').nextSibling);
}

function retry() {
  score = 0; count = 0;
  ['score', 'total'].forEach(id => document.getElementById(id).textContent = '0');
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-text').textContent = `0 / ${TOTAL} 問`;
  document.getElementById('result-view').style.display = 'none';
  document.getElementById('problem-view').style.display = 'block';
  loadProblem();
}

// ========================================
// はじめ：単元の名前、どの話の問題か、来たところへもどるリンク
// ========================================
function cameFrom() {
  try {
    const r = new URL(document.referrer);
    if (r.origin !== location.origin) return null;
    const ep = r.searchParams.get('ep');
    if (/\/story\/(index\.html)?$/.test(r.pathname) && ep && /^c/i.test(ep))
      return { href: r.href, label: `第${Number(ep.replace(/\D/g, ''))}話のストーリーにもどる` };
    const file = r.pathname.split('/').pop();
    if (SIM_EP[file]) return { href: r.href, label: `第${SIM_EP[file]}話のシミュにもどる` };
  } catch (e) { /* referrer がないとき */ }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('drill-title').textContent = `${unitKey}　${unit.name}`;
  document.title = `${unit.name} - わくわく化学基礎`;
  // どの話の問題か
  const chip = document.createElement('a');
  chip.className = 'story-chip';
  chip.href = '../story/index.html?ep=c' + String(unit.ep).padStart(2, '0');
  chip.innerHTML = `<img src="../story/img/newton_question.webp" alt="" width="26" height="26">化学 第${unit.ep}話「${unit.title}」の問題<span>ストーリーを見る ›</span>`;
  const card = document.querySelector('#problem-view .card');
  card.parentNode.insertBefore(chip, card);
  // 来たところへもどる
  const from = cameFrom();
  if (from) {
    const back = document.querySelector('.top .back-link');
    const box = document.createElement('div'); box.className = 'back-links';
    back.replaceWith(box);
    const a = document.createElement('a'); a.className = 'back-link'; a.href = from.href; a.textContent = '← ' + from.label;
    box.append(a, back);
  }
  document.addEventListener('keydown', e => { if (e.key === 'Enter') { if (!answered) checkAnswer(); else nextProblem(); } });
  loadProblem();
});
