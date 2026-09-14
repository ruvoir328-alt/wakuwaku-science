/* ===== わくわく化学 アプリ本体 =====
   ・スコアはこの端末の localStorage にだけ保存する（外部への送信はしない）
   ・ログイン／ユーザー登録の仕組みは持たない
*/

'use strict';

/* ---------- 保存キー ---------- */
const STORE_SCORES = 'wakuwaku_kagaku_v1_highscores';
const STORE_STATS  = 'wakuwaku_kagaku_v1_stats';
const STORE_SOUND  = 'wakuwaku_kagaku_v1_sound';

/* ---------- むずかしさ ---------- */
const DIFFICULTIES = [
  { id:'n20',  label:'20番まで',  icon:'🌱', max:20,
    desc:'水素（H）からカルシウム（Ca）まで。まずはここから！' },
  { id:'n92',  label:'ウランまで', icon:'🔷', max:92,
    desc:'1番からウラン（U）の92番まで。名前を聞いたことのある元素が多いよ。' },
  { id:'n118', label:'全部',      icon:'🌏', max:118,
    desc:'1番から118番まで。ぜんぶの元素にちょうせん！' },
];

/* ---------- あそびかた（3モード） ---------- */
const MODES = [
  { id:'simple', label:'きほんクイズ', short:'きほん', icon:'⚗️',
    desc:'番号・記号・名前の3点セットを4択で' },
  { id:'hard',   label:'チャレンジクイズ', short:'チャレンジ', icon:'🔬',
    desc:'分類・族・状態・ヒントからも出るよ' },
  { id:'ptable', label:'周期表タップ', short:'周期表', icon:'🗺',
    desc:'周期表のどこにあるかをタップ！' },
];

const COUNTS = [10, 20, 30];

/* ---------- 問題のかたち ---------- */
const BASE_TYPES = [
  { label:'原子番号', get:e=>String(e.no), ask:'元素記号は？', ans:e=>e.sym },
  { label:'原子番号', get:e=>String(e.no), ask:'元素名は？',   ans:e=>e.name },
  { label:'元素記号', get:e=>e.sym,        ask:'原子番号は？', ans:e=>String(e.no) },
  { label:'元素記号', get:e=>e.sym,        ask:'元素名は？',   ans:e=>e.name },
  { label:'元素名',   get:e=>e.name,       ask:'元素記号は？', ans:e=>e.sym },
  { label:'元素名',   get:e=>e.name,       ask:'原子番号は？', ans:e=>String(e.no) },
];

const EXTRA_TYPES = [
  { label:'元素名', get:e=>e.name, ask:'なかまわけは？',     ans:e=>e.type },
  { label:'元素名', get:e=>e.name, ask:'何族？',             ans:e=>e.group },
  { label:'元素名', get:e=>e.name, ask:'常温だとどの状態？', ans:e=>e.state },
  { label:'ヒント', get:e=>e.note, ask:'この元素の記号は？', ans:e=>e.sym },
];

const PT_TYPES = [
  { label:'元素記号', getQ:e=>e.sym,           cell:'no',        badge:'番号ひょうじ' },
  { label:'元素名',   getQ:e=>e.name,          cell:'no_or_sym', badge:'番号／記号ひょうじ' },
  { label:'原子番号', getQ:e=>e.no + '番',     cell:'sym',       badge:'記号ひょうじ' },
];

/* ---------- 状態 ---------- */
let currentDiff  = 'n20';
let currentMode  = 'simple';
let currentCount = 20;

let quiz = [], quizIdx = 0, correctCount = 0, totalQ = 0;
let ptCells = {}, ptCurrentQ = null, ptLastCellMode = '';
let soundOn = true;
let audioCtx = null;

/* ---------- ちいさなヘルパー ---------- */
const $ = id => document.getElementById(id);
const shuffle = a => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const pick = a => a[Math.floor(Math.random() * a.length)];
const diffOf = id => DIFFICULTIES.find(d => d.id === id);
const modeOf = id => MODES.find(m => m.id === id);
const comboKey = (d, m) => d + '__' + m;

/* ---------- localStorage（使えなくても動く） ---------- */
function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function getScores() { return readStore(STORE_SCORES, {}); }
function getStats()  { return readStore(STORE_STATS, { plays: 0, answered: 0, correct: 0 }); }

/* ---------- 音 ---------- */
function tone(freq, dur, type = 'sine', vol = 0.25) {
  if (!soundOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* 音が出せない環境では何もしない */ }
}
const soundCorrect = () => { tone(523,.09); setTimeout(()=>tone(659,.09),90); setTimeout(()=>tone(784,.16),180); };
const soundWrong   = () => tone(190,.26,'sawtooth',.18);
const soundStart   = () => [262,330,392,523].forEach((f,i)=>setTimeout(()=>tone(f,.13),i*70));
const soundFinish  = () => [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.18),i*95));
const soundBest    = () => [659,784,988,1319,1568].forEach((f,i)=>setTimeout(()=>tone(f,.2,'triangle',.22),i*110));

/* ---------- 画面 ---------- */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
  $('navbar').classList.toggle('hidden', name === 'title');
  window.scrollTo(0, 0);
}

function goSetup() {
  renderSetup();
  showScreen('setup');
}

/* ---------- モード選択画面 ---------- */
function renderSetup() {
  $('difficulty-list').innerHTML = DIFFICULTIES.map(d => `
    <button type="button" class="option ${d.id === currentDiff ? 'selected' : ''}"
            data-kind="diff" data-id="${d.id}">
      <span class="opt-icon">${d.icon}</span>
      <span class="opt-body">
        <span class="opt-name">${d.label}</span>
        <span class="opt-desc">${d.desc}</span>
      </span>
      <span class="opt-check">✓</span>
    </button>`).join('');

  $('mode-list').innerHTML = MODES.map(m => `
    <button type="button" class="option green ${m.id === currentMode ? 'selected' : ''}"
            data-kind="mode" data-id="${m.id}">
      <span class="opt-icon">${m.icon}</span>
      <span class="opt-body">
        <span class="opt-name">${m.label}</span>
        <span class="opt-desc">${m.desc}</span>
      </span>
      <span class="opt-check">✓</span>
    </button>`).join('');

  $('count-list').innerHTML = COUNTS.map(c => `
    <button type="button" class="pill ${c === currentCount ? 'selected' : ''}"
            data-kind="count" data-id="${c}">${c}問</button>`).join('');

  updateCurrentBest();
}

function onSetupClick(ev) {
  const btn = ev.target.closest('[data-kind]');
  if (!btn) return;
  const kind = btn.dataset.kind;
  if (kind === 'diff')  currentDiff  = btn.dataset.id;
  if (kind === 'mode')  currentMode  = btn.dataset.id;
  if (kind === 'count') currentCount = parseInt(btn.dataset.id, 10);
  renderSetup();
}

function updateCurrentBest() {
  const best = getScores()[comboKey(currentDiff, currentMode)];
  const name = `${diffOf(currentDiff).label} × ${modeOf(currentMode).label}`;
  $('current-best').innerHTML = best
    ? `🏅 いまのハイスコア（${name}）<br><strong>${best.correct}/${best.total}　正解率 ${best.pct}%</strong>`
    : `🆕 ${name} は、まだきろくがないよ。さいしょの1回にちょうせん！`;
}

/* ---------- 出題プール ---------- */
function elementPool() {
  const max = diffOf(currentDiff).max;
  return ELEMENTS.filter(e => e.no <= max);
}

/* ---------- 問題づくり ---------- */
function buildChoiceQuestions(pool, count) {
  const types = currentMode === 'hard' ? [...BASE_TYPES, ...EXTRA_TYPES] : BASE_TYPES;
  const questions = [];

  while (questions.length < count) {
    let made = null;

    for (let attempt = 0; attempt < 40 && !made; attempt++) {
      // ヒント問題はハードでも出しすぎないよう、ふつうに抽選
      const type = attempt < 30 ? pick(types) : pick(BASE_TYPES);
      const el = pick(pool);
      const correct = type.ans(el);
      if (correct === null || correct === undefined) continue; // 状態や分類が決まっていない元素はとばす

      // まちがいの選択肢。ふつうは3つ（=4択）だが、
      // 「常温だとどの状態？」のように答えの種類がそもそも少ない問題は3択にする
      const wrongs = [...new Set(
        shuffle(pool)
          .filter(e => e.no !== el.no)
          .map(e => type.ans(e))
          .filter(v => v !== null && v !== undefined && v !== correct)
      )].slice(0, 3);

      if (wrongs.length < 2) continue;

      made = {
        el, correct,
        label: type.label,
        question: type.get(el),
        ask: type.ask,
        choices: shuffle([correct, ...wrongs]),
      };
    }

    if (!made) break; // どうしても作れないときは、作れたぶんだけで進む
    questions.push(made);
  }
  return questions;
}

function buildPTableQuestions(pool, count) {
  const questions = [];
  const bag = shuffle(pool);
  for (let i = 0; i < count; i++) {
    const el = bag[i % bag.length];
    const def = pick(PT_TYPES);
    questions.push({ el, def, question: def.getQ(el) });
  }
  return questions;
}

/* ---------- スタート ---------- */
function startQuiz() {
  const pool = elementPool();
  quiz = currentMode === 'ptable'
    ? buildPTableQuestions(pool, currentCount)
    : buildChoiceQuestions(pool, currentCount);

  totalQ = quiz.length;
  if (!totalQ) { goSetup(); return; }

  quizIdx = 0;
  correctCount = 0;
  ptLastCellMode = '';
  soundStart();

  if (currentMode === 'ptable') {
    showScreen('ptable');
    showPTQuestion();
  } else {
    showScreen('quiz');
    showChoiceQuestion();
  }
}

function quitQuiz() {
  quiz = [];
  ptCurrentQ = null;
  goSetup();
}

/* ---------- 4択クイズ ---------- */
function showChoiceQuestion() {
  const q = quiz[quizIdx];
  $('q-progress').textContent = `${quizIdx + 1} / ${totalQ}`;
  $('q-score').textContent = `正解 ${correctCount}`;
  $('q-fill').style.width = `${(quizIdx / totalQ) * 100}%`;

  $('q-label').textContent = q.label;
  const main = $('q-main');
  main.textContent = q.question;
  main.classList.toggle('long', q.question.length > 6);
  $('q-ask').textContent = q.ask;

  const card = $('qcard');
  card.classList.remove('pop-in'); void card.offsetWidth; card.classList.add('pop-in');

  $('q-feedback').textContent = '';
  $('q-feedback').className = 'feedback';

  const box = $('choices');
  box.innerHTML = '';
  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice';
    btn.textContent = choice;
    btn.addEventListener('click', () => answerChoice(btn, choice, q));
    box.appendChild(btn);
  });
}

function answerChoice(btn, choice, q) {
  const buttons = document.querySelectorAll('#choices .choice');
  buttons.forEach(b => b.disabled = true);

  const ok = choice === q.correct;
  const fb = $('q-feedback');

  if (ok) {
    btn.classList.add('correct');
    correctCount++;
    fb.textContent = '⭕ 正解！';
    fb.className = 'feedback ok';
    soundCorrect();
  } else {
    btn.classList.add('wrong');
    buttons.forEach(b => { if (b.textContent === q.correct) b.classList.add('correct'); });
    fb.textContent = `❌ ざんねん… 正解は「${q.correct}」`;
    fb.className = 'feedback ng';
    soundWrong();
  }

  $('q-score').textContent = `正解 ${correctCount}`;

  setTimeout(() => {
    quizIdx++;
    if (quizIdx >= totalQ) showResult();
    else showChoiceQuestion();
  }, ok ? 900 : 1500);
}

/* ---------- 周期表タップ ---------- */
function buildPeriodicTable(cellMode) {
  const grid = $('pt-grid');
  const max = diffOf(currentDiff).max;
  grid.innerHTML = '';
  ptCells = {};

  ELEMENTS.forEach(el => {
    const cell = document.createElement('div');
    const inRange = el.no <= max;
    cell.className = 'pt-cell' + (inRange ? ' tappable' : ' out-of-range locked');
    cell.style.gridRow = el.row;
    cell.style.gridColumn = el.col;

    let text;
    if (cellMode === 'no') text = String(el.no);
    else if (cellMode === 'sym') text = el.sym;
    else text = Math.random() < 0.5 ? String(el.no) : el.sym;
    cell.textContent = text;

    if (inRange) {
      cell.addEventListener('click', () => onPTCellClick(el.no));
      ptCells[el.no] = cell;
    }
    grid.appendChild(cell);
  });

  // ランタノイド・アクチノイドの行に見出しをつける
  [[9, 3, 'ランタノイド'], [10, 3, 'アクチノイド']].forEach(([row, col, text]) => {
    const label = document.createElement('div');
    label.className = 'pt-cell label-cell';
    label.style.gridRow = row;
    label.style.gridColumn = `1 / ${col + 1}`;
    label.textContent = text;
    grid.appendChild(label);
  });
}

function resetPTCells() {
  Object.values(ptCells).forEach(cell => {
    cell.classList.remove('correct-ans', 'wrong-ans', 'show-correct', 'locked');
  });
}

function showPTQuestion() {
  const q = quiz[quizIdx];
  ptCurrentQ = q;

  let cellMode = q.def.cell;
  if (cellMode === 'no_or_sym') cellMode = Math.random() < 0.5 ? 'no' : 'sym';

  if (cellMode !== ptLastCellMode) {
    buildPeriodicTable(cellMode);
    ptLastCellMode = cellMode;
  } else {
    resetPTCells();
  }

  $('pt-progress').textContent = `${quizIdx + 1} / ${totalQ}`;
  $('pt-score').textContent = `正解 ${correctCount}`;
  $('pt-fill').style.width = `${(quizIdx / totalQ) * 100}%`;
  $('pt-q-label').textContent = q.def.label;

  const text = $('pt-q-text');
  text.textContent = q.question;
  text.classList.toggle('long', q.question.length > 6);

  $('pt-badge').textContent = cellMode === 'no' ? '番号ひょうじ' : '記号ひょうじ';
  $('pt-feedback').textContent = '';
  $('pt-feedback').className = 'pt-feedback';
}

function onPTCellClick(no) {
  if (!ptCurrentQ) return;

  const answer = ptCurrentQ.el;
  const fb = $('pt-feedback');
  Object.values(ptCells).forEach(cell => cell.classList.add('locked'));

  if (no === answer.no) {
    ptCells[no].classList.add('correct-ans');
    correctCount++;
    fb.textContent = `⭕ 正解！ ${answer.sym}（${answer.name}）`;
    fb.className = 'pt-feedback ok';
    soundCorrect();
  } else {
    ptCells[no].classList.add('wrong-ans');
    if (ptCells[answer.no]) ptCells[answer.no].classList.add('show-correct');
    fb.textContent = `❌ ざんねん… 正解は ${answer.sym}（${answer.name}）の場所！`;
    fb.className = 'pt-feedback ng';
    soundWrong();
  }

  $('pt-score').textContent = `正解 ${correctCount}`;
  ptCurrentQ = null;

  setTimeout(() => {
    quizIdx++;
    if (quizIdx >= totalQ) showResult();
    else showPTQuestion();
  }, no === answer.no ? 1100 : 1700);
}

/* ---------- 結果 ---------- */
function saveResult() {
  const pct = Math.round((correctCount / totalQ) * 100);

  const stats = getStats();
  stats.plays    = (stats.plays || 0) + 1;
  stats.answered = (stats.answered || 0) + totalQ;
  stats.correct  = (stats.correct || 0) + correctCount;
  writeStore(STORE_STATS, stats);

  const scores = getScores();
  const key = comboKey(currentDiff, currentMode);
  const prev = scores[key];
  // 正解率がよいほうを残す。同じ正解率なら、問題数が多いほうを残す
  const isBest = !prev || pct > prev.pct || (pct === prev.pct && totalQ > prev.total);

  if (isBest) {
    scores[key] = {
      correct: correctCount,
      total: totalQ,
      pct,
      date: new Date().toISOString().slice(0, 10),
    };
    writeStore(STORE_SCORES, scores);
  }

  return { pct, isBest, prev };
}

function rankIcon(pct) {
  if (pct >= 100) return '🏆';
  if (pct >= 80)  return '🥇';
  if (pct >= 60)  return '🥈';
  if (pct >= 40)  return '🥉';
  return '';
}

function showResult() {
  const { pct, isBest, prev } = saveResult();

  $('result-score').textContent = `${correctCount}/${totalQ}`;

  let emoji, comment;
  if (pct === 100)     { emoji = '🏆'; comment = 'パーフェクト！ぜんもん正解だ！！'; }
  else if (pct >= 80)  { emoji = '🌟'; comment = 'すごい！よくがんばったね！'; }
  else if (pct >= 60)  { emoji = '😊'; comment = 'いい感じ！あと少し！'; }
  else if (pct >= 40)  { emoji = '🔥'; comment = 'あきらめないで！れんしゅうあるのみ！'; }
  else                 { emoji = '💪'; comment = 'もう一回ちょうせんしてみよう！'; }

  $('result-emoji').textContent = emoji;
  $('result-comment').textContent = comment;
  $('result-meta').textContent =
    `${diffOf(currentDiff).label} × ${modeOf(currentMode).label} ／ 正解率 ${pct}% ${rankIcon(pct)}`;

  const banner = $('best-banner');
  banner.classList.toggle('hidden', !isBest);
  if (isBest) {
    $('bb-sub').textContent = prev
      ? `これまでのベスト ${prev.pct}% → ${pct}% に更新！`
      : `${diffOf(currentDiff).label} × ${modeOf(currentMode).label} のはじめてのきろく！`;
  }

  showScreen('result');
  soundFinish();

  const card = $('result-card');
  card.classList.remove('pop-in'); void card.offsetWidth; card.classList.add('pop-in');

  if (isBest) {
    setTimeout(() => { soundBest(); sparkle(); }, 380);
  }
}

/* 自己ベスト更新の演出 */
function sparkle() {
  const box = $('sparkles');
  box.innerHTML = '';
  const marks = ['✨', '🎉', '⭐️', '🎊', '💫'];
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = pick(marks);
    s.style.left = Math.random() * 96 + '%';
    s.style.animationDuration = (1.5 + Math.random() * 1.1) + 's';
    s.style.animationDelay = (Math.random() * 0.6) + 's';
    box.appendChild(s);
  }
  setTimeout(() => { box.innerHTML = ''; }, 3200);
}

/* ---------- きろく画面 ---------- */
function showRecord() {
  const scores = getScores();
  const stats = getStats();

  const rate = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;
  $('stat-row').innerHTML = `
    <div class="stat-box"><div class="sv">${stats.plays || 0}</div><div class="sl">あそんだ回数</div></div>
    <div class="stat-box"><div class="sv">${stats.correct || 0}</div><div class="sl">正解した数</div></div>
    <div class="stat-box"><div class="sv">${rate}%</div><div class="sl">ぜんたい正解率</div></div>`;

  const head = `<tr><th>むずかしさ</th>${MODES.map(m => `<th>${m.icon}<br>${m.short}</th>`).join('')}</tr>`;
  const body = DIFFICULTIES.map(d => {
    const cells = MODES.map(m => {
      const s = scores[comboKey(d.id, m.id)];
      if (!s) return '<td class="score-cell empty">—</td>';
      return `<td class="score-cell">
                <span class="rate">${rankIcon(s.pct)}${s.pct}%</span>
                <span class="raw">${s.correct}/${s.total}</span>
              </td>`;
    }).join('');
    return `<tr><td>${d.icon} ${d.label}</td>${cells}</tr>`;
  }).join('');

  $('score-table').innerHTML = head + body;
  showScreen('record');
}

function resetRecord() {
  if (!window.confirm('きろくをぜんぶ消します。もとにもどせません。いいですか？')) return;
  try {
    localStorage.removeItem(STORE_SCORES);
    localStorage.removeItem(STORE_STATS);
  } catch (e) { /* 消せない環境では何もしない */ }
  showRecord();
}

/* ---------- 音のオン・オフ ---------- */
function applySoundButton() {
  $('sound-toggle').textContent = soundOn ? '🔊' : '🔇';
}

/* ---------- 起動 ---------- */
function init() {
  soundOn = readStore(STORE_SOUND, true) !== false;
  applySoundButton();

  $('sound-toggle').addEventListener('click', () => {
    soundOn = !soundOn;
    writeStore(STORE_SOUND, soundOn);
    applySoundButton();
    if (soundOn) tone(660, .12);
  });

  $('difficulty-list').addEventListener('click', onSetupClick);
  $('mode-list').addEventListener('click', onSetupClick);
  $('count-list').addEventListener('click', onSetupClick);

  showScreen('title');
}

document.addEventListener('DOMContentLoaded', init);
