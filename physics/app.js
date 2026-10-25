/* ================================
   わくわく物理基礎 - ドリルロジック
   ================================ */

const TOTAL = 10;
const MEDAL = 4;   // メダルは 4問以上（40%）、トロフィーは全問正解

// ★ Google Apps Script の Web アプリ URL をここに貼り付ける
const SHEET_URL = ''; // 公開版：記録は送信しない

let score = 0;
let count = 0;
let current = null;
let animId = null;
let t0 = null;
let answered = false;

// モード: 'easy' | 'calc' | 'test'
let mode = 'easy';

// ========================================
// ユーティリティ
// ========================================

function ri(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round1(n) { return Math.round(n * 10) / 10; }

// ========================================
// 問題生成
// ========================================

/* 1-1〜1-6 はストーリーの場面にそろえた問題（数値は場面に合うはんい：自転車 2〜8 m/s、動く歩道 1〜3 m/s など） */

/** 1-1a（第1話）：リカの自転車の速さ  v = x ÷ t */
function probRaceSpeed() {
  const v = ri(2, 8), t = ri(2, 10), x = v * t;
  return {
    badge: '速さ',
    text: `リカが自転車で、<b>${t} 秒間</b>に <b>${x} m</b>進んだ。<br>リカの速さ <i>v</i> を求めよ。`,
    formula: 'v = x ÷ t',
    inputs: [
      { variable: 'x', unit: 'm', answer: x, tol: 0 },
      { variable: 't', unit: 's', answer: t, tol: 0 }
    ],
    result: { variable: 'v', value: v, unit: 'm/s', expression: `${x} ÷ ${t}` },
    anim: 'p-race', ap: { v, t, who: 'rika' }
  };
}

/** 1-1b（第1話）：先生が走った距離  x = v × t */
function probRaceDist() {
  const v = ri(3, 8), t = ri(2, 10);
  return {
    badge: '速さ',
    text: `体育の先生が <b>${v} m/s</b>の速さで、<b>${t} 秒間</b>まっすぐ走った。<br>走った距離 <i>x</i> を求めよ。`,
    formula: 'x = v × t',
    inputs: [
      { variable: 'v', unit: 'm/s', answer: v, tol: 0 },
      { variable: 't', unit: 's',   answer: t, tol: 0 }
    ],
    result: { variable: 'x', value: v * t, unit: 'm', expression: `${v} × ${t}` },
    anim: 'p-race', ap: { v, t, who: 'teacher' }
  };
}

/** 1-2（第3話）：動く歩道で運ばれる距離  x = v × t */
function probWalkway() {
  const v = ri(1, 3), t = ri(1, 6) * 10;
  return {
    badge: '等速直線運動',
    text: `空港の動く歩道が <b>${v} m/s</b>で動いている。リカがその上に <b>${t} 秒間</b>立っていた。<br>運ばれた距離 <i>x</i> を求めよ。`,
    formula: 'x = v × t',
    inputs: [
      { variable: 'v', unit: 'm/s', answer: v, tol: 0 },
      { variable: 't', unit: 's',   answer: t, tol: 0 }
    ],
    result: { variable: 'x', value: v * t, unit: 'm', expression: `${v} × ${t}` },
    anim: 'p-walk', ap: { v, t }
  };
}

/** 1-3a（第5話）：斜面を下る台車の速度  v = v₀ + at */
function probCartV() {
  const v0 = ri(0, 2), a = ri(1, 3), t = ri(1, 4);
  return {
    badge: '等加速度運動',
    text: `斜面を下る台車が、初速度 <b>${v0} m/s</b>、加速度 <b>${a} m/s²</b>で下っていく。<br><b>${t} 秒後</b>の速度 <i>v</i> を求めよ。<br><small>（斜面にそって下向きを正とする）</small>`,
    formula: 'v = v₀ + a × t',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0, tol: 0 },
      { variable: 'a',  unit: 'm/s²', answer: a,  tol: 0 },
      { variable: 't',  unit: 's',    answer: t,  tol: 0 }
    ],
    result: { variable: 'v', value: v0 + a * t, unit: 'm/s', expression: `${v0} + ${a} × ${t}` },
    anim: 'p-slope', ap: { v0, a, t }
  };
}

/** 1-3b（第5話）：斜面を下る台車の変位  x = v₀t + ½at² */
function probCartX() {
  const v0 = ri(0, 2), a = ri(1, 3), t = ri(1, 4);
  const v0t = v0 * t, half = 0.5 * a * t * t;
  return {
    badge: '等加速度運動',
    text: `斜面を下る台車が、初速度 <b>${v0} m/s</b>、加速度 <b>${a} m/s²</b>で <b>${t} 秒間</b>下った。<br>進んだ距離（変位）<i>x</i> を求めよ。<br><small>（斜面にそって下向きを正とする）</small>`,
    formula: 'x = v₀t + ½at²',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0, tol: 0 },
      { variable: 'a',  unit: 'm/s²', answer: a,  tol: 0 },
      { variable: 't',  unit: 's',    answer: t,  tol: 0 }
    ],
    result: { variable: 'x', value: v0t + half, unit: 'm', expression: `${v0}×${t} + ½×${a}×${t}² = ${v0t} + ${half}` },
    anim: 'p-slope', ap: { v0, a, t }
  };
}

/** 1-4（第6話）：塔の上からリンゴを静かにはなす  v = gt */
function probAppleDrop() {
  const t = ri(1, 4);
  return {
    badge: '自由落下',
    text: `ニュートンくんが、高い塔の上からリンゴを静かにはなした。<br><b>${t} 秒後</b>のリンゴの速さ <i>v</i> を求めよ。<br><small>（下向きを正とする。g = 9.8 m/s²。空気の抵抗は考えない）</small>`,
    formula: 'v = g × t',
    inputs: [
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 },
      { variable: 't', unit: 's',    answer: t,   tol: 0 }
    ],
    result: { variable: 'v', value: round1(9.8 * t), unit: 'm/s', expression: `9.8 × ${t}` },
    anim: 'p-drop', ap: { v0: 0, t }
  };
}

/** 1-5（第7話）：塔の上からリンゴを投げ下ろす  v = v₀ + gt */
function probAppleDown() {
  const v0 = ri(1, 10), t = ri(1, 4);
  return {
    badge: '鉛直投げおろし',
    text: `ニュートンくんが、塔の上からリンゴを真下に <b>${v0} m/s</b>で投げ下ろした。<br><b>${t} 秒後</b>のリンゴの速さ <i>v</i> を求めよ。<br><small>（下向きを正とする。g = 9.8 m/s²）</small>`,
    formula: 'v = v₀ + g × t',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0,  tol: 0 },
      { variable: 'g',  unit: 'm/s²', answer: 9.8, tol: 0.05 },
      { variable: 't',  unit: 's',    answer: t,   tol: 0 }
    ],
    result: { variable: 'v', value: round1(v0 + 9.8 * t), unit: 'm/s', expression: `${v0} + 9.8 × ${t}` },
    anim: 'p-drop', ap: { v0, t }
  };
}

/** 1-6a（第7話）：リンゴを真上に投げ上げる（速度）  v = v₀ − gt */
function probAppleUpV() {
  const tMax = ri(2, 3), v0 = round1(9.8 * tMax), t = ri(1, tMax - 1);
  return {
    badge: '鉛直投げ上げ',
    text: `ニュートンくんが、リンゴを真上に <b>${v0} m/s</b>で投げ上げた。<br><b>${t} 秒後</b>のリンゴの速度 <i>v</i> を求めよ。<br><small>（上向きを正とする。g = 9.8 m/s²）</small>`,
    formula: 'v = v₀ − g × t',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0,  tol: 0.05 },
      { variable: 'g',  unit: 'm/s²', answer: 9.8, tol: 0.05 },
      { variable: 't',  unit: 's',    answer: t,   tol: 0 }
    ],
    result: { variable: 'v', value: round1(v0 - 9.8 * t), unit: 'm/s', expression: `${v0} − 9.8 × ${t}` },
    anim: 'p-up', ap: { v0 }
  };
}

/** 1-6b（第7話）：最高点に達するまでの時間  t = v₀ ÷ g */
function probAppleUpTop() {
  const tMax = ri(1, 3), v0 = round1(9.8 * tMax);
  return {
    badge: '鉛直投げ上げ',
    text: `ニュートンくんが、リンゴを真上に <b>${v0} m/s</b>で投げ上げた。<br>リンゴがいちばん高いところ（最高点）に着くまでの時間 <i>t</i> を求めよ。<br><small>（上向きを正とする。最高点では v = 0）</small>`,
    formula: 'v = 0 になるとき  →  t = v₀ ÷ g',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0,  tol: 0.05 },
      { variable: 'g',  unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 't', value: tMax, unit: 's', expression: `${v0} ÷ 9.8` },
    anim: 'p-up', ap: { v0 }
  };
}

/** ニュートン第二法則（全単元共通）  a = F ÷ m */
function probNewton() {
  const m = ri(1, 10), a_ans = ri(1, 8);
  const F = m * a_ans;
  return {
    badge: 'ニュートンの第二法則',
    text: `質量 <b>${m} kg</b>の物体に <b>${F} N</b>の力を加えたときの加速度 <i>a</i> を求めよ。`,
    formula: 'F = ma  →  a = F ÷ m',
    inputs: [
      { variable: 'F', unit: 'N',  answer: F, tol: 0 },
      { variable: 'm', unit: 'kg', answer: m, tol: 0 }
    ],
    result: { variable: 'a', value: a_ans, unit: 'm/s²', expression: `${F} ÷ ${m}` },
    anim: 'newton', ap: { m, F }
  };
}

// ========================================
// モード切替
// ========================================

function setMode(m) {
  mode = m;
  ['easy', 'calc', 'test'].forEach(id => {
    const btn = document.getElementById(`btn-${id}`);
    if (btn) btn.classList.toggle('active', id === m);
  });
  loadProblem();
}

// ========================================
// 進捗の保存
// ========================================

function saveProgress() {
  if (!unitId) return;
  const studentId = 'guest';
  if (!studentId) return;

  // ── ベストスコア更新 ──
  const key  = `wakuwakupub_progress_${studentId}`;
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  const prev = data[unitId] || { bestScore: 0, perfect: false };

  const isFirstClear  = prev.bestScore < MEDAL && score >= MEDAL;
  const isFirstTrophy = !prev.perfect && score === TOTAL;

  data[unitId] = {
    bestScore: Math.max(prev.bestScore, score),
    perfect:   prev.perfect || (score === TOTAL)
  };
  localStorage.setItem(key, JSON.stringify(data));

  // ── 詳細ログを追記 ──
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600 * 1000);
  const ts  = jst.toISOString().replace('T', ' ').slice(0, 19);
  const logKey = `wakuwakupub_log_${studentId}`;
  const log    = JSON.parse(localStorage.getItem(logKey) || '[]');
  log.push({
    timestamp:   ts,
    studentId,
    classNum:    Math.floor(parseInt(studentId, 10) / 100) - 10,
    unitId,
    unitName:    unitTitle,
    score,
    total:       TOTAL,
    medal:       score >= MEDAL ? '◯' : '',
    trophy:      score === TOTAL ? '◯' : '',
    firstClear:  isFirstClear   ? '◯' : '',
    firstTrophy: isFirstTrophy  ? '◯' : '',
    mode,
  });
  localStorage.setItem(logKey, JSON.stringify(log));

  // ── Google Sheets へ送信 ──
  if (SHEET_URL) {
    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(log[log.length - 1])
    }).catch(() => {});
  }
}

// ========================================
// 2章「力と運動の法則」問題生成（ストーリーの場面にそろえた問題）
//   2-1 第10話（2人で引っぱる）、2-2 第11話・第9話、2-3 第14話・第15話、2-4 第16話、
//   2-5 第17話、2-6 第9話（ばね）、2-7 第13話（スケートで押し合う）
// ========================================

const g98 = m => round1(m * 9.8);
const f1d = n => n.toFixed(1);                       // 2 → "2.0"（脚本と同じ書き方）
const round2 = n => Math.round(n * 100) / 100;

/** 2-1a（第10話）：同じ向きに引く  F = F₁ + F₂ */
function probPullSame() {
  const f1 = ri(1, 5) * 10, f2 = ri(1, 5) * 10;
  return {
    badge: '力の合成',
    text: `リカが東へ <b>${f1} N</b>、ニュートンくんも東へ <b>${f2} N</b>の力で、同じ荷物を引っぱった。<br>荷物にはたらく合力 <i>F</i> を求めよ。<br><small>（東向きを正とする）</small>`,
    formula: 'F = F₁ + F₂',
    inputs: [
      { variable: 'F₁（リカ）', unit: 'N', answer: f1, tol: 0 },
      { variable: 'F₂（ニュートンくん）', unit: 'N', answer: f2, tol: 0 }
    ],
    result: { variable: 'F', value: f1 + f2, unit: 'N', expression: `${f1} + ${f2}` },
    anim: 'p-pull', ap: { kind: 'same', f1, f2 }
  };
}

/** 2-1b（第10話）：反対向きに引く  F = F₁ + F₂（F₂ < 0） */
function probPullOpp() {
  const f1 = ri(1, 5) * 10;
  let f2 = f1; while (f2 === f1) f2 = ri(1, 5) * 10;
  return {
    badge: '力の合成',
    text: `リカが東へ <b>${f1} N</b>、ニュートンくんが西へ <b>${f2} N</b>の力で、同じ荷物を引っぱった。<br>荷物にはたらく合力 <i>F</i> を求めよ。${EAST.replace('速度', '力')}`,
    formula: 'F = F₁ + F₂（西向きの力は −）',
    signed: true,
    inputs: [
      { variable: 'F₁（リカ）', unit: 'N', answer: f1, tol: 0 },
      { variable: 'F₂（ニュートンくん）', unit: 'N', answer: -f2, tol: 0 }
    ],
    result: { variable: 'F', value: f1 - f2, unit: 'N', expression: `${f1} + ${sgnTxt(-f2)}` },
    anim: 'p-pull', ap: { kind: 'opp', f1, f2 }
  };
}

/** 2-1c（第10話）：直角に引く  F = √(F₁² + F₂²)（3 : 4 : 5） */
function probPullRight() {
  const k = ri(2, 10), f1 = 3 * k, f2 = 4 * k;
  return {
    badge: '力の合成',
    text: `リカが東へ <b>${f1} N</b>、ニュートンくんが北へ <b>${f2} N</b>の力で、同じ荷物を引っぱった。<br>合力 <i>F</i> の大きさを求めよ。<br><small>（2つの力は直角。平行四辺形は長方形になる）</small>`,
    formula: 'F = √(F₁² + F₂²)',
    inputs: [
      { variable: 'F₁（東）', unit: 'N', answer: f1, tol: 0 },
      { variable: 'F₂（北）', unit: 'N', answer: f2, tol: 0 }
    ],
    result: { variable: 'F', value: 5 * k, unit: 'N', expression: `√(${f1}² + ${f2}²) = √${25 * k * k}` },
    anim: 'p-pull', ap: { kind: 'right', f1, f2 }
  };
}

/** 2-1d（第10話）：ななめに引く力の分解  Fx = F cos60° */
function probPullDecomp() {
  const F = ri(2, 10) * 10;
  return {
    badge: '力の分解',
    text: `ニュートンくんが台車のひもを、水平から <b>60°</b>の向きに <b>${F} N</b>の力で引いた。<br>台車を前に進める、水平の分力 <i>F<sub>x</sub></i> を求めよ。<br><small>（cos60° = 0.5）</small>`,
    formula: 'F<sub>x</sub> = F × cos60°',
    inputs: [
      { variable: 'F', unit: 'N', answer: F, tol: 0 },
      { variable: 'cos60°', unit: '', answer: 0.5, tol: 0.001 }
    ],
    result: { variable: 'Fx', value: F / 2, unit: 'N', expression: `${F} × 0.5` },
    anim: 'p-pull', ap: { kind: 'decomp', F }
  };
}

/** 2-2a（第9話）：机の上のかご（垂直抗力）  N = W = mg */
function probBasketNormal() {
  const m = ri(2, 10) * 0.5;
  return {
    badge: '力のつりあい',
    text: `机の上に、質量 <b>${f1d(m)} kg</b>のかごが置いてある。<br>机がかごを押し上げる力（垂直抗力）<i>N</i> を求めよ。<br><small>（上向きを正とする。g = 9.8 m/s²）</small>`,
    formula: 'つりあい：N = W = mg',
    inputs: [
      { variable: 'm', unit: 'kg', answer: m, tol: 0 },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 'N', value: g98(m), unit: 'N', expression: `${f1d(m)} × 9.8` },
    anim: 'p-basket', ap: { m }
  };
}

/** 2-2b（第11話）：植木鉢を2本のひもでつるす  T₂ = W − T₁ */
function probPotTension() {
  const m = ri(2, 10), W = g98(m);
  const t1 = ri(1, Math.floor(W / 10)) * 5;           // 5 N 〜 W の半分くらい
  return {
    badge: '力のつりあい',
    text: `重さ（重力）<b>${W} N</b>の植木鉢を、2本のひもで真上につるした。<br>片方のひもの張力が <b>${t1} N</b>のとき、もう片方の張力 <i>T₂</i> を求めよ。<br><small>（上向きを正とする）</small>`,
    formula: 'つりあい：T₁ + T₂ = W → T₂ = W − T₁',
    inputs: [
      { variable: 'W', unit: 'N', answer: W, tol: 0.05 },
      { variable: 'T₁', unit: 'N', answer: t1, tol: 0 }
    ],
    result: { variable: 'T₂', value: round1(W - t1), unit: 'N', expression: `${W} − ${t1}` },
    anim: 'p-pot', ap: { W, t1 }
  };
}

/** 2-3a（第14話）：台車の加速度  a = F ÷ m */
function probCartAccel() {
  const m = ri(1, 5), a = ri(1, 5), F = m * a;
  return {
    badge: '運動方程式',
    text: `まさつのない床の上で、リカが質量 <b>${m} kg</b>の台車を <b>${F} N</b>の力で押し続けた。<br>台車の加速度 <i>a</i> を求めよ。`,
    formula: 'ma = F → a = F ÷ m',
    inputs: [
      { variable: 'F', unit: 'N', answer: F, tol: 0 },
      { variable: 'm', unit: 'kg', answer: m, tol: 0 }
    ],
    result: { variable: 'a', value: a, unit: 'm/s²', expression: `${F} ÷ ${m}` },
    anim: 'p-cart', ap: { m, F }
  };
}

/** 2-3b（第14話）：必要な力  F = ma */
function probCartForce() {
  const m = ri(1, 5), a = ri(1, 5);
  return {
    badge: '運動方程式',
    text: `まさつのない床の上で、質量 <b>${m} kg</b>の台車を押したら、加速度 <b>${a} m/s²</b>で速くなった。<br>押した力 <i>F</i> を求めよ。`,
    formula: 'ma = F',
    inputs: [
      { variable: 'm', unit: 'kg', answer: m, tol: 0 },
      { variable: 'a', unit: 'm/s²', answer: a, tol: 0 }
    ],
    result: { variable: 'F', value: m * a, unit: 'N', expression: `${m} × ${a}` },
    anim: 'p-cart', ap: { m, F: m * a }
  };
}

/** 2-3c（第14話）：台車の質量  m = F ÷ a */
function probCartMass() {
  const m = ri(1, 5), a = ri(1, 5), F = m * a;
  return {
    badge: '運動方程式',
    text: `まさつのない床の上で、台車を <b>${F} N</b>の力で押したら、加速度 <b>${a} m/s²</b>で速くなった。<br>台車の質量 <i>m</i> を求めよ。`,
    formula: 'ma = F → m = F ÷ a',
    inputs: [
      { variable: 'F', unit: 'N', answer: F, tol: 0 },
      { variable: 'a', unit: 'm/s²', answer: a, tol: 0 }
    ],
    result: { variable: 'm', value: m, unit: 'kg', expression: `${F} ÷ ${a}` },
    anim: 'p-cart', ap: { m, F }
  };
}

/** 2-3d（第15話）：落ちる鉄球の加速度  a = W ÷ m（= g） */
function probFallAccel() {
  const m = ri(1, 8) * 0.5, W = g98(m);
  return {
    badge: '運動方程式',
    text: `ニュートンくんが、質量 <b>${f1d(m)} kg</b>の鉄球を真空の筒の中で落とした。鉄球にはたらく重力は <b>${W} N</b>。<br>鉄球の加速度 <i>a</i> を求めよ。<br><small>（下向きを正とする）</small>`,
    formula: 'ma = W → a = W ÷ m',
    inputs: [
      { variable: 'W', unit: 'N', answer: W, tol: 0.05 },
      { variable: 'm', unit: 'kg', answer: m, tol: 0 }
    ],
    result: { variable: 'a', value: 9.8, unit: 'm/s²', expression: `${W} ÷ ${f1d(m)}` },
    anim: 'p-drop', ap: { v0: 0, t: 1 }
  };
}

const MU = [0.20, 0.25, 0.30, 0.40, 0.50];
/** 2-4a（第16話）：押しても動かない本（静止摩擦力）  f = F */
function probBookStatic() {
  const m = ri(1, 4), mu = 0.5, fmax = round1(mu * m * 9.8);
  const F = ri(1, Math.floor(fmax - 0.5));
  return {
    badge: '摩擦力',
    text: `机の上の質量 <b>${m}.0 kg</b>の本を、リカが水平に <b>${F} N</b>の力で押した。本は動かなかった。<br>このときの静止摩擦力 <i>f</i> の大きさを求めよ。<br><small>（静止摩擦係数 μ = 0.50、g = 9.8 m/s²）</small>`,
    formula: '動かない → つりあい：f = F',
    inputs: [
      { variable: 'F', unit: 'N', answer: F, tol: 0 }
    ],
    result: { variable: 'f', value: F, unit: 'N', expression: `${F}（押す力と同じ）` },
    anim: 'p-book', ap: { m, F, kind: 'static' }
  };
}

/** 2-4b（第16話）：すべり出す直前（最大摩擦力）  f = μN = μmg */
function probBookMax() {
  const m = ri(1, 4), mu = [0.30, 0.40, 0.50, 0.60][ri(0, 3)];
  return {
    badge: '摩擦力',
    text: `机の上の質量 <b>${m}.0 kg</b>の本を、リカが少しずつ強く押していく。静止摩擦係数は <b>μ = ${mu.toFixed(2)}</b>。<br>本がすべり出す直前の最大摩擦力 <i>f</i> を求めよ。<br><small>（g = 9.8 m/s²）</small>`,
    formula: 'f = μN = μmg',
    inputs: [
      { variable: 'μ', unit: '', answer: mu, tol: 0.001 },
      { variable: 'm', unit: 'kg', answer: m, tol: 0 },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 'f', value: round2(mu * m * 9.8), unit: 'N', expression: `${mu.toFixed(2)} × ${m} × 9.8` },
    anim: 'p-book', ap: { m, F: round1(mu * m * 9.8), kind: 'max' }
  };
}

/** 2-4c（第16話）：すべっている本（動摩擦力）  f = μ'N = μ'mg */
function probBookKinetic() {
  const m = ri(1, 4), mu = MU[ri(0, 4)];
  return {
    badge: '摩擦力',
    text: `机の上を、質量 <b>${m}.0 kg</b>の本がすべっている。動摩擦係数は <b>μ' = ${mu.toFixed(2)}</b>。<br>本にはたらく動摩擦力 <i>f</i> を求めよ。<br><small>（g = 9.8 m/s²）</small>`,
    formula: "f = μ'N = μ'mg",
    inputs: [
      { variable: "μ'", unit: '', answer: mu, tol: 0.001 },
      { variable: 'm', unit: 'kg', answer: m, tol: 0 },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 'f', value: round2(mu * m * 9.8), unit: 'N', expression: `${mu.toFixed(2)} × ${m} × 9.8` },
    anim: 'p-book', ap: { m, F: round1(mu * m * 9.8 + 2), kind: 'kinetic' }
  };
}

/** 2-5a（第17話）：雪の上のリカ（圧力）  P = F ÷ S */
function probSnowPressure() {
  const F = [392, 441, 490, 539, 588][ri(0, 4)];           // 40〜60 kg × 9.8
  const S = [0.020, 0.040, 0.050, 0.20, 0.25, 0.50][ri(0, 5)];
  const what = S < 0.1 ? 'くつ' : 'スキー';
  return {
    badge: '圧力',
    text: `重さ <b>${F} N</b>の人が、${what}をはいて雪の上に立った。雪に接する面積は全部で <b>${S.toFixed(S < 0.1 ? 3 : 2)} m²</b>。<br>雪にかかる圧力 <i>P</i> を求めよ。`,
    formula: 'P = F ÷ S',
    inputs: [
      { variable: 'F', unit: 'N', answer: F, tol: 0 },
      { variable: 'S', unit: 'm²', answer: S, tol: 0.0001 }
    ],
    result: { variable: 'P', value: Math.round(F / S), unit: 'Pa', expression: `${F} ÷ ${S}` },
    exact: false,     // S が小数なので、少しのずれまで正解にする
    anim: 'p-snow', ap: { F, S, what }
  };
}

/** 2-5b（第17話）：水に沈めた石の浮力  F = ρVg */
function probStoneBuoyancy() {
  const k = [1, 2, 3, 5][ri(0, 3)], V = k / 10000;
  return {
    badge: '浮力',
    text: `ばねばかりにつるした石を、水の中に全部沈めた。石の体積は <b>${k}.0 × 10⁻⁴ m³</b>（${V} m³）。<br>石にはたらく浮力 <i>F</i> を求めよ。<br><small>（水の密度 1000 kg/m³、g = 9.8 m/s²）</small>`,
    formula: 'F = ρVg',
    inputs: [
      { variable: 'ρ', unit: 'kg/m³', answer: 1000, tol: 0 },
      { variable: 'V', unit: 'm³', answer: V, tol: 0.000001 },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 'F', value: round2(0.98 * k), unit: 'N', expression: `1000 × ${V} × 9.8` },
    anim: 'p-water', ap: { W: 1.96, F: round2(0.98 * k) }
  };
}

/** 2-5c（第17話）：水の中のばねばかりの目盛り  T = W − F */
function probScaleInWater() {
  const m = [0.20, 0.30, 0.40, 0.50][ri(0, 3)], W = round2(m * 9.8);
  const F = [0.49, 0.98][ri(0, 1)];
  return {
    badge: '浮力',
    text: `重さ <b>${W} N</b>の石をばねばかりにつるし、水の中に全部沈めたら、浮力が <b>${F} N</b>はたらいた。<br>ばねばかりの目盛り <i>T</i> を求めよ。<br><small>（上向きを正とする。つりあい：T + F = W）</small>`,
    formula: 'T = W − F',
    inputs: [
      { variable: 'W', unit: 'N', answer: W, tol: 0.005 },
      { variable: 'F', unit: 'N', answer: F, tol: 0.005 }
    ],
    result: { variable: 'T', value: round2(W - F), unit: 'N', expression: `${W} − ${F}` },
    anim: 'p-water', ap: { W, F }
  };
}

/** 2-6a（第9話）：ばねの弾性力  F = kx */
function probSpringForce() {
  const k = [20, 40, 49, 50, 98, 100][ri(0, 5)], x = ri(1, 6) * 0.1;
  return {
    badge: '弾性力',
    text: `ばね定数 <b>${k} N/m</b>のばねに、かごをつるしたら <b>${x.toFixed(2)} m</b>のびて止まった。<br>ばねがかごを引く力（弾性力）<i>F</i> を求めよ。`,
    formula: 'F = kx',
    inputs: [
      { variable: 'k', unit: 'N/m', answer: k, tol: 0 },
      { variable: 'x', unit: 'm', answer: round1(x), tol: 0.001 }
    ],
    result: { variable: 'F', value: round1(k * x), unit: 'N', expression: `${k} × ${x.toFixed(2)}` },
    anim: 'p-spring', ap: { k, x: round1(x) }
  };
}

/** 2-6b（第9話）：かごをつるしたばねののび  x = mg ÷ k */
function probSpringStretch() {
  const k = [49, 98][ri(0, 1)], m = ri(1, 6) * 0.5, x = round2(m * 9.8 / k);
  return {
    badge: '弾性力',
    text: `ばね定数 <b>${k} N/m</b>のばねに、質量 <b>${f1d(m)} kg</b>のかごをつるした。<br>止まったときの、ばねののび <i>x</i> を求めよ。<br><small>（つりあい：kx = mg。g = 9.8 m/s²）</small>`,
    formula: 'kx = mg → x = mg ÷ k',
    inputs: [
      { variable: 'm', unit: 'kg', answer: m, tol: 0 },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 },
      { variable: 'k', unit: 'N/m', answer: k, tol: 0 }
    ],
    result: { variable: 'x', value: x, unit: 'm', expression: `${f1d(m)} × 9.8 ÷ ${k}` },
    anim: 'p-spring', ap: { k, x }
  };
}

/** 2-6c（第9話）：ばね定数  k = F ÷ x */
function probSpringK() {
  const k = [20, 40, 50, 100][ri(0, 3)], x = ri(1, 5) * 0.1, F = round1(k * x);
  return {
    badge: '弾性力',
    text: `ばねを <b>${F} N</b>の力で引いたら、<b>${x.toFixed(2)} m</b>のびた。<br>このばねのばね定数 <i>k</i> を求めよ。`,
    formula: 'F = kx → k = F ÷ x',
    inputs: [
      { variable: 'F', unit: 'N', answer: F, tol: 0 },
      { variable: 'x', unit: 'm', answer: round1(x), tol: 0.001 }
    ],
    result: { variable: 'k', value: k, unit: 'N/m', expression: `${F} ÷ ${x.toFixed(2)}` },
    anim: 'p-spring', ap: { k, x: round1(x) }
  };
}

/** 2-7a（第13話）：押し返される力（向きつき）  反作用 = −作用 */
function probPushBack() {
  const F = ri(2, 20) * 10;
  return {
    badge: '作用・反作用',
    text: `スケートリンクで、リカがニュートンくんを右向きに <b>${F} N</b>の力で押した。<br>ニュートンくんがリカを押し返す力 <i>F'</i> を求めよ。<br><small>（右向きを正とする。左向きの力には − をつけて入力）</small>`,
    formula: "F' = −F（同じ大きさ・反対向き）",
    signed: true,
    inputs: [
      { variable: 'F（作用）', unit: 'N', answer: F, tol: 0 }
    ],
    result: { variable: "F'", value: -F, unit: 'N', expression: `−${F}` },
    anim: 'p-push', ap: { F, mR: 50, mN: 25 }
  };
}

/** 2-7b（第13話）：重い・軽いにかかわらず同じ大きさ */
function probPushMass() {
  const F = ri(2, 20) * 10, mR = ri(8, 12) * 5, mN = ri(4, 6) * 5;
  return {
    badge: '作用・反作用',
    text: `ニュートンくん（<b>${mN} kg</b>）が、リカ（<b>${mR} kg</b>）を左向きに <b>${F} N</b>の力で押した。<br>リカがニュートンくんを押し返す力の大きさ <i>F'</i> を求めよ。<br><small>（質量がちがっても…？）</small>`,
    formula: "|F'| = |F|（重さにはよらない）",
    inputs: [
      { variable: 'F（作用）', unit: 'N', answer: F, tol: 0 }
    ],
    result: { variable: "F'", value: F, unit: 'N', expression: `${F}` },
    anim: 'p-push', ap: { F, mR, mN, who: 'newton' }
  };
}

/** 2-7c（第13話・第9話）：本が机を押す力（反作用）  = N = mg */
function probBookOnDesk() {
  const m = ri(2, 10) * 0.5;
  return {
    badge: '作用・反作用',
    text: `机の上に、質量 <b>${f1d(m)} kg</b>のかごが止まっている。机がかごを押し上げる力（垂直抗力）は、つりあいから mg。<br>かごが机を押す力の大きさ <i>F'</i> を求めよ。<br><small>（g = 9.8 m/s²）</small>`,
    formula: "F' = N = mg（作用・反作用）",
    inputs: [
      { variable: 'm', unit: 'kg', answer: m, tol: 0 },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: "F'", value: g98(m), unit: 'N', expression: `${f1d(m)} × 9.8` },
    anim: 'p-basket', ap: { m, pair: true }
  };
}

// ========================================
// 1-7「合成速度・相対速度」（第4話：電車の中を歩く、すれちがう電車）
//   どの問題も、問題文で「東向きを正」と決めてから ＋/− を使う
//   合成速度 v = v₁ + v₂、相対速度 v_AB = v_B − v_A（相手 − 自分）
// ========================================

const EAST = '<br><small>（東向きを正とする。西向きの速度には − をつけて入力）</small>';
const sgnTxt = n => n < 0 ? `(−${-n})` : `${n}`;      // 式の中の負の数は（−○）と書く

/** 1-7a: 合成速度（進行方向に歩く）  v = v₁ + v₂ */
function probRelCompSame() {
  const vA = ri(10, 30), w = ri(1, 3);
  return {
    badge: '合成速度',
    text: `東へ <b>${vA} m/s</b>で走る電車の中を、リカが進行方向（東）へ <b>${w} m/s</b>で歩いている。<br>ホームから見たリカの速度 <i>v</i> を求めよ。${EAST}`,
    formula: 'v = v₁ + v₂（電車 ＋ 歩く）',
    signed: true,
    inputs: [
      { variable: 'v₁（電車）', unit: 'm/s', answer: vA, tol: 0 },
      { variable: 'v₂（歩く）', unit: 'm/s', answer: w,  tol: 0 }
    ],
    result: { variable: 'v', value: vA + w, unit: 'm/s', expression: `${vA} + ${w}` },
    anim: 'p-train', ap: { kind: 'comp', vA, v2: w }
  };
}

/** 1-7b: 合成速度（進行方向と逆向きに歩く）  v = v₁ + v₂（v₂ < 0） */
function probRelCompOpp() {
  const vA = ri(10, 30), w = ri(1, 3);
  return {
    badge: '合成速度',
    text: `東へ <b>${vA} m/s</b>で走る電車の中を、リカが進行方向と逆向き（西）へ <b>${w} m/s</b>で歩いている。<br>ホームから見たリカの速度 <i>v</i> を求めよ。${EAST}`,
    formula: 'v = v₁ + v₂（電車 ＋ 歩く）',
    signed: true,
    inputs: [
      { variable: 'v₁（電車）', unit: 'm/s', answer: vA, tol: 0 },
      { variable: 'v₂（歩く）', unit: 'm/s', answer: -w, tol: 0 }
    ],
    result: { variable: 'v', value: vA - w, unit: 'm/s', expression: `${vA} + ${sgnTxt(-w)}` },
    anim: 'p-train', ap: { kind: 'comp', vA, v2: -w }
  };
}

/** 1-7c: 相対速度（同じ向きに走る隣の電車）  v_AB = v_B − v_A */
function probRelSame() {
  const vA = ri(10, 25);
  let d = 0; while (d === 0) d = ri(-8, 8);             // 速さのちがい（0 はなし）
  const vB = vA + d;
  return {
    badge: '相対速度',
    text: `リカの乗った電車 A が東へ <b>${vA} m/s</b>、隣の線路の電車 B が東へ <b>${vB} m/s</b>で走っている。<br>A から見た B の速度（相対速度）<i>v</i><sub>AB</sub> を求めよ。${EAST}`,
    formula: 'v<sub>AB</sub> = v<sub>B</sub> − v<sub>A</sub>（相手 − 自分）',
    signed: true,
    inputs: [
      { variable: 'v<sub>B</sub>（相手）', unit: 'm/s', answer: vB, tol: 0 },
      { variable: 'v<sub>A</sub>（自分）', unit: 'm/s', answer: vA, tol: 0 }
    ],
    result: { variable: 'v<sub>AB</sub>', value: vB - vA, unit: 'm/s', expression: `${vB} − ${vA}` },
    anim: 'p-train', ap: { kind: 'rel', vA, vB }
  };
}

/** 1-7d: 相対速度（すれちがう電車）  v_AB = v_B − v_A（v_B < 0） */
function probRelPass() {
  const vA = ri(10, 25), sB = ri(10, 25);
  const vB = -sB;
  return {
    badge: '相対速度',
    text: `リカの乗った電車 A が東へ <b>${vA} m/s</b>で走っている。向こうから電車 B が西へ <b>${sB} m/s</b>で走ってきて、すれちがう。<br>A から見た B の速度（相対速度）<i>v</i><sub>AB</sub> を求めよ。${EAST}`,
    formula: 'v<sub>AB</sub> = v<sub>B</sub> − v<sub>A</sub>（相手 − 自分）',
    signed: true,
    inputs: [
      { variable: 'v<sub>B</sub>（相手）', unit: 'm/s', answer: vB, tol: 0 },
      { variable: 'v<sub>A</sub>（自分）', unit: 'm/s', answer: vA, tol: 0 }
    ],
    result: { variable: 'v<sub>AB</sub>', value: vB - vA, unit: 'm/s', expression: `${sgnTxt(vB)} − ${vA}` },
    anim: 'p-train', ap: { kind: 'rel', vA, vB }
  };
}

// ========================================
// 1-8「水平投射」（第8話：台から真横に投げたリンゴ）
//   水平方向は等速直線運動（x = v₀t）、鉛直方向は自由落下（y = ½gt²）を分けて考える
//   台の高さは、着地時間がちょうど整数秒になる 4.9 m（1 s）・19.6 m（2 s）・44.1 m（3 s）
// ========================================

const HT_NOTE = '<br><small>（水平方向は投げた向き、鉛直方向は下向きを正とする。g = 9.8 m/s²）</small>';
const HT_TABLE = [[4.9, 1], [19.6, 2], [44.1, 3]];       // [台の高さ m, 着地までの時間 s]
const htPick = () => HT_TABLE[ri(0, 2)];

/** 1-8a: 着地までの時間（縦だけ）  y = ½gt² → t = √(2y ÷ g) */
function probHThrowTime() {
  const [y, t] = htPick(), v0 = ri(1, 10);
  return {
    badge: '水平投射（縦）',
    text: `高さ <b>${y} m</b>の台の上から、リンゴを真横に <b>${v0} m/s</b>で投げた。<br>床に着くまでの時間 <i>t</i> を求めよ。${HT_NOTE}`,
    formula: 'y = ½gt²  →  t = √(2y ÷ g)',
    inputs: [
      { variable: 'y', unit: 'm',    answer: y,   tol: 0.05 },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 't', value: t, unit: 's', expression: `√(2 × ${y} ÷ 9.8) = √${t * t}` },
    anim: 'p-table', ap: { y, v0 }
  };
}

/** 1-8b: 台の高さ（縦だけ）  y = ½gt² */
function probHThrowHeight() {
  const [y, t] = htPick(), v0 = ri(1, 10);
  return {
    badge: '水平投射（縦）',
    text: `台の上から、リンゴを真横に <b>${v0} m/s</b>で投げたら、<b>${t} 秒後</b>に床に着いた。<br>台の高さ <i>y</i> を求めよ。${HT_NOTE}`,
    formula: 'y = ½ × g × t²',
    inputs: [
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 },
      { variable: 't', unit: 's',    answer: t,   tol: 0 }
    ],
    result: { variable: 'y', value: y, unit: 'm', expression: `½ × 9.8 × ${t}²` },
    anim: 'p-table', ap: { y, v0 }
  };
}

/** 1-8c: 水平距離（横だけ）  x = v₀t */
function probHThrowDist() {
  const [y, t] = htPick(), v0 = ri(1, 10);
  return {
    badge: '水平投射（横）',
    text: `台の上から、リンゴを真横に <b>${v0} m/s</b>で投げたら、<b>${t} 秒後</b>に床に着いた。<br>台から水平に何 m はなれたところに落ちたか。水平距離 <i>x</i> を求めよ。${HT_NOTE}`,
    formula: 'x = v₀ × t（横は等速直線運動）',
    inputs: [
      { variable: 'v₀', unit: 'm/s', answer: v0, tol: 0 },
      { variable: 't',  unit: 's',   answer: t,  tol: 0 }
    ],
    result: { variable: 'x', value: v0 * t, unit: 'm', expression: `${v0} × ${t}` },
    anim: 'p-table', ap: { y, v0 }
  };
}

/** 1-8d: 投げた速さ（横だけ）  v₀ = x ÷ t */
function probHThrowV0() {
  const [y, t] = htPick(), v0 = ri(1, 10);
  const x = v0 * t;
  return {
    badge: '水平投射（横）',
    text: `台の上から、リンゴを真横に投げたら、<b>${t} 秒後</b>に、台から水平に <b>${x} m</b>はなれた床に落ちた。<br>投げた速さ <i>v</i>₀ を求めよ。${HT_NOTE}`,
    formula: 'x = v₀t  →  v₀ = x ÷ t',
    inputs: [
      { variable: 'x', unit: 'm', answer: x, tol: 0 },
      { variable: 't', unit: 's', answer: t, tol: 0 }
    ],
    result: { variable: 'v₀', value: v0, unit: 'm/s', expression: `${x} ÷ ${t}` },
    anim: 'p-table', ap: { y, v0 }
  };
}

/** 1-8e: 縦と横を分けて（高さ → 時間 → 水平距離）  t = √(2y ÷ g)、x = v₀t */
function probHThrowFull() {
  const [y, t] = htPick(), v0 = ri(1, 10);
  return {
    badge: '水平投射（縦と横）',
    text: `高さ <b>${y} m</b>の台の上から、リンゴを真横に <b>${v0} m/s</b>で投げた。<br>台から水平に何 m はなれたところに落ちるか。水平距離 <i>x</i> を求めよ。<br><small>（まず縦の式で、着地までの時間 t を求めよう）</small>${HT_NOTE}`,
    formula: '縦：t = √(2y ÷ g)　横：x = v₀ × t',
    inputs: [
      { variable: 'v₀', unit: 'm/s', answer: v0, tol: 0 },
      { variable: 't',  unit: 's',   answer: t,  tol: 0 }
    ],
    result: { variable: 'x', value: v0 * t, unit: 'm', expression: `${v0} × ${t}（t = √(2 × ${y} ÷ 9.8) = ${t}）` },
    anim: 'p-table', ap: { y, v0 }
  };
}

// ── 全単元のデフォルト（URL パラメータなしの場合）──
const allGenerators = [probRaceDist, probCartV, probCartX, probAppleDrop, probNewton];

// ---- 単元と話の対応（ストーリーの場面）----
const STORY_EP = {
  '1-1': [1, 'どっちが速い？'], '1-2': [3, 'グラフがまっすぐになる運動'], '1-3': [5, '記録テープの暗号'],
  '1-4': [6, '重いほうが先に落ちる？'], '1-5': [7, 'てっぺんで、リンゴは止まる？'], '1-6': [7, 'てっぺんで、リンゴは止まる？'],
  '1-7': [4, '電車の中で走ると？'], '1-8': [8, '横に投げたら、遅く落ちる？'],
  '2-1': [10, '2人で引っぱると、何 N？'], '2-2': [11, '止まっているのは、力がないから？'], '2-3': [14, '同じ力で押し続けると？'],
  '2-4': [16, 'すべり出すのは、いつ？'], '2-5': [17, '水の中で、軽くなる？'], '2-6': [9, '机の上のかごに、力ははたらいている？'],
  '2-7': [13, '押したら、押し返される？']
};

// ── 単元マップ ──
const unitMap = {
  // 1節: 運動の表し方
  '1-1': { name: '速度と時間と変位', gens: [probRaceSpeed, probRaceDist] },
  '1-2': { name: '等速直線運動',     gens: [probWalkway] },
  '1-3': { name: '等加速度運動',     gens: [probCartV, probCartX] },
  '1-4': { name: '自由落下',         gens: [probAppleDrop] },
  '1-5': { name: '鉛直投げおろし',   gens: [probAppleDown] },
  '1-6': { name: '鉛直投げ上げ',     gens: [probAppleUpV, probAppleUpTop] },
  '1-7': { name: '合成速度・相対速度', gens: [probRelCompSame, probRelCompOpp, probRelSame, probRelPass] },
  '1-8': { name: '水平投射', gens: [probHThrowTime, probHThrowHeight, probHThrowDist, probHThrowV0, probHThrowFull] },
  // 2章: 力と運動の法則（ストーリーの場面にそろえた問題）
  '2-1': { name: '力の合成・分解',   gens: [probPullSame, probPullOpp, probPullRight, probPullDecomp] },
  '2-2': { name: '力のつりあい',     gens: [probBasketNormal, probPotTension] },
  '2-3': { name: '運動方程式',       gens: [probCartAccel, probCartForce, probCartMass, probFallAccel] },
  '2-4': { name: '摩擦力',           gens: [probBookStatic, probBookMax, probBookKinetic] },
  '2-5': { name: '圧力と浮力',       gens: [probSnowPressure, probStoneBuoyancy, probScaleInWater] },
  '2-6': { name: '弾性力',           gens: [probSpringForce, probSpringStretch, probSpringK] },
  '2-7': { name: '作用・反作用',     gens: [probPushBack, probPushMass, probBookOnDesk] },
};

// ── 起動時に URL パラメータを読む ──
const unitId   = new URLSearchParams(location.search).get('unit');
const unitInfo = unitId ? unitMap[unitId] : null;
const activeGens = unitInfo ? unitInfo.gens : allGenerators;
const unitTitle  = unitInfo ? unitInfo.name : '力学ドリル';

// ========================================
// Canvas 描画ヘルパー
// ========================================

const W = 400, H = 160, GY = 128;

function arrow(ctx, x1, y1, x2, y2, color) {
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
  if (len < 4) return;
  const ux = dx/len, uy = dy/len, hw = 9;
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = color;
  ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2,y2);
  ctx.lineTo(x2-ux*hw-uy*hw*.45, y2-uy*hw+ux*hw*.45);
  ctx.lineTo(x2-ux*hw+uy*hw*.45, y2-uy*hw-ux*hw*.45);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function drawBall(ctx, x, y, r, hex) {
  ctx.save();
  const g = ctx.createRadialGradient(x-r*.35, y-r*.35, r*.1, x, y, r);
  g.addColorStop(0,'rgba(255,255,255,.9)'); g.addColorStop(.35,hex); g.addColorStop(1,darken(hex));
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill(); ctx.restore();
}

function darken(hex) {
  return `rgb(${Math.max(0,parseInt(hex.slice(1,3),16)-40)},${Math.max(0,parseInt(hex.slice(3,5),16)-40)},${Math.max(0,parseInt(hex.slice(5,7),16)-40)})`;
}

function txt(ctx, text, x, y, color, size, bold) {
  ctx.save(); ctx.fillStyle = color||'#555';
  ctx.font = `${bold?'bold ':''}${size||12}px sans-serif`;
  ctx.fillText(text,x,y); ctx.restore();
}

function drawGround(ctx) {
  ctx.save();
  ctx.strokeStyle='#c3cad8'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(20,GY); ctx.lineTo(W-20,GY); ctx.stroke();
  ctx.strokeStyle='#dfe4ee'; ctx.lineWidth=1;
  for(let i=0;i<=8;i++){const x=20+(W-40)*i/8; ctx.beginPath(); ctx.moveTo(x,GY); ctx.lineTo(x+8,GY+10); ctx.stroke();}
  ctx.restore();
}

// ========================================
// アニメーション
// ========================================

function drawNewton(ctx, t, p) {
  const {m,F}=p, prog=(t%2.5)/2.5;
  ctx.fillStyle='#eef2f7'; ctx.fillRect(0,0,W,H); drawGround(ctx);
  const bw=52,bh=42,bx=90+prog*(W-bw-114),by=GY-bh;
  ctx.save(); ctx.fillStyle='#34467e';
  ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by,bw,bh,4):ctx.rect(bx,by,bw,bh); ctx.fill();
  ctx.strokeStyle='#22305a'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='white'; ctx.font='bold 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText(`${m} kg`,bx+bw/2,by+bh/2+5); ctx.textAlign='left'; ctx.restore();
  const fLen=Math.min(F/2,62), sx=Math.max(bx-fLen-4,12);
  arrow(ctx,sx,by+bh/2,bx-2,by+bh/2,'#ff6b35');
  txt(ctx,`F=${F}N`,sx-42,by+bh/2+4,'#ff6b35',11,true);
  txt(ctx,'加速中 →',bx+bw/2-22,by-8,'#27ae60',11,true);
  txt(ctx,`m = ${m} kg`,14,18,'#34467e',12,true);
}

// ========================================
// 1章の動く絵（ストーリー・シミュと同じ色・キャラで描く。座標は 400 × 160）
// ========================================

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
// ---- 色（ストーリー・シミュと同じもの）----
const PC = {
  coat: '#22305a', apple: '#d93a3f', ink: '#1f2638', muted: '#6b7488', line: '#dfe4ee',
  cream: '#fff7e9', creamLine: '#e9c48f', wood: '#b47a44', woodDark: '#7e5129',
  grass: '#86bb66', sky1: '#bfe2f6', sky2: '#e9f6fc', rail: '#9aa9b8', gray: '#d6dce6',
  lemon: '#ffe14a', wheel: '#59616f', win: '#dfe4ee'
};

const PIMG = {};
function pimg(who, face) {
  const k = who + '_' + face;
  if (!PIMG[k]) { PIMG[k] = new Image(); PIMG[k].src = '../story/img/' + k + '.webp'; }
  return PIMG[k];
}
['rika_normal', 'rika_confident', 'rika_surprise', 'rika_happy', 'newton_question', 'newton_proud', 'newton_surprise', 'newton_normal']
  .forEach(k => { const [w, f] = k.split('_'); pimg(w, f); });

function chara(ctx, who, face, cx, bottom, h) {
  const im = pimg(who, face);
  if (!im.complete || !im.naturalWidth) return;
  const w = im.naturalWidth / im.naturalHeight * h;
  ctx.drawImage(im, cx - w / 2, bottom - h, w, h);
}
function ptxt(ctx, s, x, y, color, size, align) {
  ctx.save();
  ctx.font = `700 ${size || 11}px "Zen Maru Gothic", sans-serif`;
  ctx.fillStyle = color || PC.muted; ctx.textAlign = align || 'left';
  ctx.fillText(s, x, y); ctx.restore();
}
function parrow(ctx, x1, y1, x2, y2, color, w) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  if (L < 4) return;
  const ux = dx / L, uy = dy / L, hh = Math.min(10, L * .6);
  ctx.save(); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = w || 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * hh * .8, y2 - uy * hh * .8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * hh - uy * hh * .55, y2 - uy * hh + ux * hh * .55);
  ctx.lineTo(x2 - ux * hh + uy * hh * .55, y2 - uy * hh - ux * hh * .55);
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function papple(ctx, x, y, r, alpha) {
  ctx.save(); ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  ctx.fillStyle = PC.apple; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PC.woodDark; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x + 2, y - r - 5, x + 5, y - r - 6); ctx.stroke();
  ctx.restore();
}
function psky(ctx, groundY) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PC.sky1); g.addColorStop(1, PC.sky2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (groundY !== undefined) { ctx.fillStyle = PC.grass; ctx.fillRect(0, groundY, W, H - groundY); }
}
function ptime(ctx, s) {                      // 左上の時間の表示
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(8, 8, 86, 22, 11) : ctx.rect(8, 8, 86, 22); ctx.fill(); ctx.restore();
  ptxt(ctx, s, 51, 23, PC.coat, 12, 'center');
}
// 1回の動き（dur 秒）＋ 止まる時間（rest 秒）をくり返す。0〜1 の進み具合を返す
const loop = (t, dur, rest) => Math.min(1, (t % (dur + rest)) / dur);

// 第1話：まっすぐな道を進む（自転車のリカ、または走る先生）
function pRace(ctx, t, p) {
  psky(ctx, 128);
  const X0 = 22, X1 = 300, Y = 104;
  ctx.fillStyle = PC.creamLine; ctx.fillRect(0, Y - 16, 320, 32);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
  ctx.beginPath(); ctx.moveTo(0, Y + 16); ctx.lineTo(320, Y + 16); ctx.stroke(); ctx.setLineDash([]);
  const k = loop(t, 3.2, 0.8), tau = k * p.t, S = (X1 - X0) / (p.v * p.t);
  for (let n = 1; n <= Math.floor(tau + 1e-9); n++) {        // 1秒ごとの位置
    const x = X0 + p.v * n * S;
    ctx.fillStyle = PC.woodDark; ctx.fillRect(x - 1, Y - 13, 2, 26);
  }
  const x = X0 + p.v * tau * S;
  if (p.who === 'rika') {                                    // 自転車
    ctx.save(); ctx.translate(x, Y + 4); ctx.strokeStyle = PC.coat; ctx.lineWidth = 2.2;
    [[-9, 0], [9, 0]].forEach(([cx]) => { ctx.beginPath(); ctx.arc(cx, 0, 7, 0, Math.PI * 2); ctx.stroke(); });
    ctx.strokeStyle = PC.apple; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-2, -10); ctx.lineTo(8, -10); ctx.lineTo(9, 0); ctx.moveTo(-2, -10); ctx.lineTo(0, 0); ctx.stroke(); ctx.restore();
  } else {
    ctx.fillStyle = PC.coat; ctx.beginPath(); ctx.arc(x, Y, 8, 0, Math.PI * 2); ctx.fill();
    ptxt(ctx, '先生', x, Y + 3.5, '#fff', 8, 'center');
  }
  ptxt(ctx, 'スタート', X0, Y - 22, PC.woodDark, 10, 'center');
  ptxt(ctx, '｜＝1秒ごとの位置', 300, 148, PC.ink, 10, 'right');
  ptime(ctx, tau.toFixed(1) + ' 秒');
  chara(ctx, 'rika', p.who === 'rika' ? 'confident' : 'normal', 362, 160, 120);
}

// 第3話：動く歩道
function pWalk(ctx, t, p) {
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PC.gray; ctx.fillRect(0, 118, W, 42);
  const X0 = 24, X1 = 300, Y = 106;
  ctx.fillStyle = PC.coat; ctx.fillRect(0, Y, 320, 6);
  ctx.fillStyle = PC.rail; ctx.fillRect(0, Y + 6, 320, 12);
  const k = loop(t, 3.5, 0.8), tau = k * p.t, S = (X1 - X0) / (p.v * p.t), off = (t * 30) % 20;
  ctx.strokeStyle = PC.gray; ctx.lineWidth = 2; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -off;
  ctx.beginPath(); ctx.moveTo(0, Y + 12); ctx.lineTo(320, Y + 12); ctx.stroke(); ctx.setLineDash([]);
  const step = p.t / 6;                                      // 1/6 ごとのシール
  for (let n = 1; n * step <= tau + 1e-9; n++) {
    ctx.fillStyle = PC.lemon; ctx.beginPath(); ctx.arc(X0 + p.v * n * step * S, Y + 12, 4, 0, Math.PI * 2); ctx.fill();
  }
  const x = X0 + p.v * tau * S;
  ctx.fillStyle = PC.apple; ctx.beginPath(); ctx.arc(x, Y - 12, 9, 0, Math.PI * 2); ctx.fill();
  ptxt(ctx, 'リカ', x, Y - 8.5, '#fff', 8, 'center');
  parrow(ctx, 120, 140, 200, 140, PC.coat, 3);
  ptxt(ctx, '動く歩道（速さはずっと同じ）', 160, 156, PC.ink, 10, 'center');
  ptime(ctx, Math.round(tau) + ' 秒');
  chara(ctx, 'rika', 'normal', 362, 160, 120);
}

// 第5話：斜面を下る台車（記録テープつき）
function pSlope(ctx, t, p) {
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PC.gray; ctx.fillRect(0, 140, W, 20);
  const A = { x: 24, y: 46 }, B = { x: 304, y: 136 }, L = Math.hypot(B.x - A.x, B.y - A.y);
  const ang = Math.atan2(B.y - A.y, B.x - A.x), cs = Math.cos(ang), sn = Math.sin(ang);
  ctx.fillStyle = PC.wood; ctx.fillRect(A.x - 12, A.y + 4, 12, 140 - A.y - 4);
  ctx.strokeStyle = PC.woodDark; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
  const xEnd = p.v0 * p.t + p.a * p.t * p.t / 2, S = (L - 34) / xEnd;
  const k = loop(t, 3, 0.9), tau = k * p.t, xs = tt => p.v0 * tt + p.a * tt * tt / 2;
  for (let n = 0; n <= 10; n++) {                            // テープの打点（t/10 ごと）
    const tt = p.t * n / 10; if (tt > tau + 1e-9) break;
    const d = xs(tt) * S; ctx.fillStyle = PC.ink; ctx.beginPath(); ctx.arc(A.x + d * cs, A.y + d * sn - 5, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  const d = xs(tau) * S;
  ctx.save(); ctx.translate(A.x + d * cs, A.y + d * sn); ctx.rotate(ang);
  ctx.fillStyle = PC.apple; ctx.fillRect(0, -17, 34, 12);
  ctx.fillStyle = PC.wheel; [7, 27].forEach(cx => { ctx.beginPath(); ctx.arc(cx, -4, 4, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
  const v = p.v0 + p.a * tau, L2 = 12 + v * 5;               // 速度の矢印（だんだん長く）
  const fx = A.x + (d + 36) * cs, fy = A.y + (d + 36) * sn - 10;
  if (d + 36 + L2 < L) parrow(ctx, fx, fy, fx + L2 * cs, fy + L2 * sn, PC.apple, 3);
  ptxt(ctx, '・は記録テープの打点（間隔がだんだん広がる）', 8, 152, PC.ink, 10);
  ptime(ctx, tau.toFixed(1) + ' 秒');
  chara(ctx, 'newton', 'normal', 362, 160, 120);
}

// 第6話・第7話：塔の上からリンゴを落とす（v0 = 0）／投げ下ろす
function pDrop(ctx, t, p) {
  psky(ctx, 146);
  const X = 236, TOP = 34, BOT = 140;
  ctx.fillStyle = PC.gray; ctx.fillRect(170, TOP + 8, 46, 146 - TOP - 8);   // 塔
  ctx.fillStyle = PC.rail; ctx.fillRect(166, TOP + 2, 54, 8);
  for (let y = TOP + 20; y < 140; y += 22) { ctx.fillStyle = '#fff'; ctx.fillRect(184, y, 18, 10); }
  const g = 9.8, yEnd = p.v0 * p.t + g * p.t * p.t / 2, S = (BOT - TOP) / yEnd;
  const k = loop(t, 2.6, 1), tau = k * p.t, ys = tt => p.v0 * tt + g * tt * tt / 2;
  for (let n = 1; n <= 8; n++) {                             // 残像（t/8 ごと）
    const tt = p.t * n / 8; if (tt > tau + 1e-9) break;
    papple(ctx, X, TOP + ys(tt) * S, 6, .25);
  }
  const y = TOP + ys(tau) * S;
  papple(ctx, X, y, 8);
  const v = p.v0 + g * tau, len = Math.min(34, 6 + v * 0.9);
  if (y + 10 + len < 158) parrow(ctx, X + 14, y, X + 14, y + len, PC.apple, 3);
  ptxt(ctx, '下向きを正 ↓', 8, 156, PC.ink, 10);
  ptxt(ctx, p.v0 ? '真下に投げる' : '静かにはなす', 193, TOP - 4, PC.coat, 10, 'center');
  ptime(ctx, tau.toFixed(1) + ' 秒');
  chara(ctx, 'newton', k >= 1 ? 'surprise' : 'question', 362, 160, 120);
}

// 第7話：リンゴを真上に投げ上げる（赤：速度、紺：加速度）
function pUp(ctx, t, p) {
  psky(ctx, 146);
  const g = 9.8, tT = p.v0 / g, X = 250, Y0 = 136, S = 112 / (p.v0 * p.v0 / (2 * g));
  const k = loop(t, 3.4, 0.8), tau = k * 2 * tT, y = Y0 - (p.v0 * tau - g * tau * tau / 2) * S, v = p.v0 - g * tau;
  ctx.strokeStyle = '#fff'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(196, Y0 - 112); ctx.lineTo(300, Y0 - 112); ctx.stroke(); ctx.setLineDash([]);
  ptxt(ctx, '最高点', 196, Y0 - 116, PC.woodDark, 10);
  papple(ctx, X, y, 8);
  if (Math.abs(v) > 0.3) parrow(ctx, X + 14, y, X + 14, y - v * 1.2, PC.apple, 3);
  else ptxt(ctx, 'v = 0', X + 14, y + 4, PC.apple, 11);
  parrow(ctx, X - 14, y, X - 14, y + 18, PC.coat, 3);
  ptxt(ctx, '赤：速度　紺：加速度（下向き g）', 8, 156, PC.ink, 10);
  ptxt(ctx, '上向きを正 ↑', 296, 156, PC.ink, 10, 'right');
  ptime(ctx, tau.toFixed(1) + ' 秒');
  chara(ctx, 'newton', 'proud', 362, 160, 120);
}

// 第4話：ホームから見た電車（1 m/s = 3 px/s）
function pTrain(ctx, t, p) {
  psky(ctx);
  const S = 3, Lc = 120, span = 330 + Lc, wrap = x => ((x % span) + span) % span - Lc;
  ctx.fillStyle = PC.gray; ctx.fillRect(0, 140, W, 20);
  ctx.fillStyle = PC.rail; ctx.fillRect(0, 84, 330, 3); ctx.fillRect(0, 136, 330, 3);
  for (let b = 0; b < 330; b += 55) { ctx.fillStyle = PC.rail; ctx.fillRect(b + 20, 40, 3, 96); }   // 電柱（動かない）
  const car = (x, y, color, label) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, 120, 26, 6) : ctx.rect(x, y, 120, 26); ctx.fill();
    ctx.fillStyle = PC.win; for (let i = 0; i < 6; i++) ctx.fillRect(x + 8 + i * 19, y + 5, 12, 9);
    ctx.fillStyle = PC.wheel; [x + 18, x + 102].forEach(cx => { ctx.beginPath(); ctx.arc(cx, y + 27, 4, 0, Math.PI * 2); ctx.fill(); });
    if (label) ptxt(ctx, label, x + 8, y + 23, '#fff', 9);
  };
  const xa = wrap(60 + p.vA * S * t);
  car(xa, 108, PC.coat, p.kind === 'rel' ? 'A（リカ）' : '');
  if (p.kind === 'comp') {
    const off = (((20 + p.v2 * S * t) % 100) + 100) % 100;
    ctx.fillStyle = PC.apple; ctx.beginPath(); ctx.arc(xa + 10 + off, 120, 5, 0, Math.PI * 2); ctx.fill();
  } else car(wrap(220 + p.vB * S * t), 56, PC.woodDark, 'B');
  ptxt(ctx, '東（正の向き）→', 318, 24, PC.apple, 11, 'right');
  ptxt(ctx, 'ホームから見たようす', 8, 152, PC.ink, 10);
  chara(ctx, 'rika', 'surprise', 362, 160, 120);
}

// 第8話：台から真横に投げた A と、手放した B（縦横同じ縮尺）
function pTable(ctx, t, p) {
  psky(ctx, 140);
  const g = 9.8, tl = Math.sqrt(2 * p.y / g), X0 = 58;
  const k = Math.min(108 / p.y, 240 / Math.max(p.v0 * tl, 0.5)), top = 140 - p.y * k;
  ctx.fillStyle = PC.wood; ctx.fillRect(X0 - 34, top, 34, 140 - top);
  ctx.strokeStyle = PC.woodDark; ctx.lineWidth = 2; ctx.strokeRect(X0 - 34, top, 34, 140 - top);
  const tau = loop(t, 1.8, 0.9) * tl, ay = tt => top + g * tt * tt / 2 * k, ax = tt => X0 + p.v0 * tt * k;
  for (let n = 1; n <= 10; n++) {
    const tn = tl * n / 10; if (tn > tau + 1e-9) break;
    ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = PC.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X0 + 6, ay(tn)); ctx.lineTo(ax(tn), ay(tn)); ctx.stroke(); ctx.restore();
    papple(ctx, ax(tn), ay(tn), 5, .3);
    ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = PC.coat; ctx.beginPath(); ctx.arc(X0 + 6, ay(tn), 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  papple(ctx, ax(tau), ay(tau), 7);
  ctx.fillStyle = PC.coat; ctx.beginPath(); ctx.arc(X0 + 6, ay(tau), 7, 0, Math.PI * 2); ctx.fill();
  ptxt(ctx, 'A', ax(tau) + 10, ay(tau) - 6, PC.apple, 11);
  ptxt(ctx, 'B', X0 + 18, ay(tau) + 4, PC.coat, 11);
  ptxt(ctx, '高さ ' + p.y + ' m', X0 - 17, top - 5, PC.woodDark, 10, 'center');
  ptxt(ctx, 'A：真横に投げる　B：手放す', 318, 24, PC.ink, 10, 'right');
  chara(ctx, 'newton', 'proud', 362, 160, 120);
}

const STORY_DRAW = { 'p-race': pRace, 'p-walk': pWalk, 'p-slope': pSlope, 'p-drop': pDrop, 'p-up': pUp, 'p-train': pTrain, 'p-table': pTable };

// ========================================
// 2章の動く絵（ストーリー・シミュと同じ色・キャラ。力の矢印：重力＝紺、人が加える力＝赤、支える力＝木、まさつ力＝うすい木）
// ========================================

function pfloor(ctx, y) {                     // 部屋の床
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PC.gray; ctx.fillRect(0, y, W, H - y);
}
function plabel(ctx, s, x, y, color, align) { ptxt(ctx, s, x, y, color, 10, align || 'center'); }
function pbox(ctx, x, y, w, h, fill, label) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PC.woodDark; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
  if (label) ptxt(ctx, label, x + w / 2, y + h / 2 + 4, '#fff', 10, 'center');
}
const grow = (t, dur) => REDUCE ? 1 : Math.min(1, (t % (dur + 1.4)) / dur);   // 0 → 1 にのびて、少し止まる
function pdash(ctx, x1, y1, x2, y2, color) {
  ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = color; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}

// 第10話：2人で荷物を引っぱる（同じ向き・反対向き・直角）、ななめに引く台車（分解）
function pPull(ctx, t, p) {
  pfloor(ctx, 132);
  const k = grow(t, 1.6);
  if (p.kind === 'decomp') {
    const X = 110, Y = 112, S = 0.9, L = Math.min(100, p.F * S) * k, c = 0.5, s = Math.sqrt(3) / 2;
    ctx.fillStyle = PC.apple; ctx.fillRect(X - 30, Y - 14, 44, 18);
    ctx.fillStyle = PC.wheel; [X - 20, X + 4].forEach(cx => { ctx.beginPath(); ctx.arc(cx, Y + 8, 5, 0, Math.PI * 2); ctx.fill(); });
    parrow(ctx, X + 14, Y - 6, X + 14 + L * c, Y - 6 - L * s, PC.apple, 3.5);
    if (k >= 1) {
      pdash(ctx, X + 14 + L * c, Y - 6 - L * s, X + 14 + L * c, Y - 6, PC.muted);
      parrow(ctx, X + 14, Y - 6, X + 14 + L * c, Y - 6, PC.woodDark, 3);
      plabel(ctx, '水平の分力 Fx', X + 14 + L * c / 2, Y + 24, PC.woodDark);
      plabel(ctx, '60°', X + 34, Y - 10, PC.ink);
    }
    plabel(ctx, 'F ' + p.F + ' N', X + 24 + L * c, Y - 14 - L * s, PC.apple, 'left');
    chara(ctx, 'newton', 'proud', 362, 160, 120);
    return;
  }
  const right = p.kind === 'right';
  const X = right ? 110 : 150, Y = right ? 116 : 82, S = right ? 2.0 : 1.4;
  if (right) pbox(ctx, X - 26, Y - 2, 24, 22, PC.wood, '');
  else pbox(ctx, X - 14, Y - 14, 28, 28, PC.wood, '荷物');
  const f1 = p.f1 * S * k, f2 = p.f2 * S * k;
  if (p.kind === 'same') {
    parrow(ctx, X + 14, Y - 6, X + 14 + f1, Y - 6, PC.apple, 3.5);
    parrow(ctx, X + 14, Y + 6, X + 14 + f2, Y + 6, PC.apple, 3.5);
    plabel(ctx, 'リカ ' + p.f1 + ' N', X + 18 + f1, Y - 12, PC.apple, 'left');
    plabel(ctx, 'ニュートンくん ' + p.f2 + ' N', X + 18 + f2, Y + 18, PC.apple, 'left');
  } else if (p.kind === 'opp') {
    parrow(ctx, X + 14, Y, X + 14 + f1, Y, PC.apple, 3.5);
    parrow(ctx, X - 14, Y, X - 14 - f2, Y, PC.apple, 3.5);
    plabel(ctx, 'リカ ' + p.f1 + ' N →', X + 14, Y - 22, PC.apple, 'left');
    plabel(ctx, '← ニュートンくん ' + p.f2 + ' N', X - 14, Y + 30, PC.apple, 'right');
  } else {                                                   // 直角：東と北
    parrow(ctx, X, Y, X + f1, Y, PC.apple, 3.5);
    parrow(ctx, X, Y, X, Y - f2 * 0.8, PC.apple, 3.5);
    plabel(ctx, '東 ' + p.f1 + ' N', X + f1 / 2, Y + 16, PC.apple);
    plabel(ctx, '荷物', X - 14, Y + 32, PC.woodDark);
    plabel(ctx, '北 ' + p.f2 + ' N', X - 8, Y - f2 * 0.8 + 6, PC.apple, 'right');
    if (k >= 1) {
      pdash(ctx, X + f1, Y, X + f1, Y - f2 * 0.8, PC.muted); pdash(ctx, X, Y - f2 * 0.8, X + f1, Y - f2 * 0.8, PC.muted);
      ctx.save(); ctx.setLineDash([6, 4]); parrow(ctx, X, Y, X + f1, Y - f2 * 0.8, PC.apple, 3); ctx.restore();
      plabel(ctx, '合力', X + f1 + 6, Y - f2 * 0.8 - 4, PC.apple, 'left');
    }
  }
  ptxt(ctx, '東（正の向き）→', 300, 150, PC.ink, 10, 'right');
  chara(ctx, 'rika', 'confident', 362, 160, 120);
}

// 第9話・第13話：机の上のかご（重力 W と 垂直抗力 N。pair のときは、かごが机を押す力も）
function pBasket(ctx, t, p) {
  pfloor(ctx, 150);
  const X = 140, TOP = 92, k = grow(t, 1.2), L = Math.min(48, 14 + p.m * 9) * k;
  ctx.fillStyle = PC.wood; ctx.fillRect(60, TOP, 170, 8); ctx.fillRect(72, TOP + 8, 8, 50); ctx.fillRect(210, TOP + 8, 8, 50);
  ctx.fillStyle = PC.creamLine; ctx.fillRect(X - 22, TOP - 22, 44, 22);
  ctx.strokeStyle = PC.woodDark; ctx.lineWidth = 1.5; ctx.strokeRect(X - 22, TOP - 22, 44, 22);
  [X - 10, X, X + 10].forEach(cx => papple(ctx, cx, TOP - 26, 6));
  parrow(ctx, X - 6, TOP - 11, X - 6, TOP - 11 + L, PC.coat, 3.5);
  parrow(ctx, X + 6, TOP - 11, X + 6, TOP - 11 - L, PC.woodDark, 3.5);
  plabel(ctx, 'W（重力）', X - 12, TOP - 11 + L + 4, PC.coat, 'right');
  plabel(ctx, 'N（垂直抗力）', X + 12, TOP - 11 - L + 8, PC.woodDark, 'left');
  if (p.pair && k >= 1) {
    parrow(ctx, X + 26, TOP + 2, X + 26, TOP + 2 + L * 0.8, PC.muted, 3);
    plabel(ctx, 'かごが机を押す力', X + 20, TOP + 50, PC.muted);
  }
  plabel(ctx, p.m.toFixed(1) + ' kg', X - 28, TOP - 6, PC.woodDark, 'right');
  ptxt(ctx, '上向きを正 ↑', 8, 18, PC.ink, 10);
  chara(ctx, 'rika', 'question', 362, 160, 120);
}

// 第11話：植木鉢を2本のひもでつるす
function pPot(ctx, t, p) {
  psky(ctx, 150);
  const k = grow(t, 1.2), X = 150, Y = 104;
  ctx.fillStyle = PC.woodDark; ctx.fillRect(80, 14, 140, 7);
  ctx.strokeStyle = PC.ink; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(122, 21); ctx.lineTo(126, Y - 16); ctx.moveTo(178, 21); ctx.lineTo(174, Y - 16); ctx.stroke();
  ctx.fillStyle = PC.grass; ctx.beginPath(); ctx.ellipse(X - 8, Y - 26, 7, 14, -0.4, 0, Math.PI * 2); ctx.ellipse(X + 9, Y - 26, 7, 14, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PC.wood; ctx.beginPath(); ctx.moveTo(X - 28, Y - 16); ctx.lineTo(X + 28, Y - 16); ctx.lineTo(X + 20, Y + 10); ctx.lineTo(X - 20, Y + 10); ctx.closePath(); ctx.fill();
  const w = 46 * k, a = 46 * p.t1 / p.W * k, b = 46 * (p.W - p.t1) / p.W * k;   // 長さは力の大きさに比例
  parrow(ctx, X, Y, X, Y + w, PC.coat, 3.5);
  parrow(ctx, 126, Y - 16, 126, Y - 16 - a, PC.woodDark, 3);
  parrow(ctx, 174, Y - 16, 174, Y - 16 - b, PC.woodDark, 3);
  plabel(ctx, 'T₁ ' + p.t1 + ' N', 120, Y - 22 - a, PC.woodDark, 'right');
  plabel(ctx, 'T₂ ?', 180, Y - 22 - b, PC.woodDark, 'left');
  plabel(ctx, 'W ' + p.W + ' N', X + 8, Y + w, PC.coat, 'left');
  ptxt(ctx, '上向きを正 ↑', 8, 18, PC.ink, 10);
  chara(ctx, 'newton', 'question', 362, 160, 120);
}

// 第14話：台車を押し続ける（0.5 秒ごとの位置。間隔がだんだん広がる）
function pCart(ctx, t, p) {
  pfloor(ctx, 130);
  const a = p.F / p.m, T = 2, X0 = 30, S = 230 / (a * T * T / 2);
  const tau = loop(t, 2.4, 0.8) * T, x = tt => X0 + a * tt * tt / 2 * S;
  for (let n = 1; n * 0.5 <= tau + 1e-9; n++) { ctx.fillStyle = PC.coat; ctx.beginPath(); ctx.arc(x(n * 0.5), 136, 3, 0, Math.PI * 2); ctx.fill(); }
  const cx = x(tau);
  ctx.fillStyle = PC.coat; ctx.fillRect(cx - 18, 104, 40, 18);
  ptxt(ctx, p.m + ' kg', cx + 2, 117, '#fff', 9, 'center');
  ctx.fillStyle = PC.wheel; [cx - 10, cx + 14].forEach(c => { ctx.beginPath(); ctx.arc(c, 125, 5, 0, Math.PI * 2); ctx.fill(); });
  parrow(ctx, cx - 50, 113, cx - 20, 113, PC.apple, 3.5);
  plabel(ctx, 'F ' + p.F + ' N', cx - 36, 100, PC.apple);
  ptxt(ctx, '●＝0.5秒ごとの位置（まさつのない床）', 8, 154, PC.ink, 10);
  ptime(ctx, tau.toFixed(1) + ' 秒');
  chara(ctx, 'rika', 'confident', 362, 160, 120);
}

// 第16話：机の上の本を押す（static：動かない／max：すべり出す直前／kinetic：すべっている）
function pBook(ctx, t, p) {
  pfloor(ctx, 150);
  const TOP = 104;
  ctx.fillStyle = PC.wood; ctx.fillRect(20, TOP, 270, 8); ctx.fillRect(34, TOP + 8, 8, 40); ctx.fillRect(268, TOP + 8, 8, 40);
  const k = grow(t, 1.2), slide = p.kind === 'kinetic' ? ((t * 22) % 80) : 0, X = 130 + (REDUCE ? 20 : slide);
  ctx.fillStyle = PC.coat; ctx.fillRect(X - 22, TOP - 20, 44, 20);
  ctx.strokeStyle = PC.lemon; ctx.lineWidth = 1.5; ctx.strokeRect(X - 19, TOP - 17, 38, 14);
  ptxt(ctx, '本 ' + p.m + '.0 kg', X, TOP - 7, '#fff', 9, 'center');
  const L = Math.min(60, 14 + p.F * 4) * k;
  const fL = p.kind === 'kinetic' ? Math.min(60, 14 + (p.F - 2) * 4) * k : L;
  parrow(ctx, X - 22 - L, TOP - 10, X - 22, TOP - 10, PC.apple, 3.5);
  parrow(ctx, X, TOP + 1, X - fL, TOP + 1, PC.wood, 3);
  plabel(ctx, '押す力 F', X - 22 - L / 2, TOP - 16, PC.apple);
  plabel(ctx, 'まさつ力 f', X - fL / 2, TOP + 18, PC.woodDark);
  const msg = p.kind === 'static' ? '押しても動かない（f = F）' : p.kind === 'max' ? 'すべり出す直前（最大摩擦力）' : 'すべっている（動摩擦力）';
  plabel(ctx, msg, 156, 26, p.kind === 'kinetic' ? PC.apple : PC.ink);
  ptxt(ctx, '右向きを正 →', 300, 150, PC.ink, 10, 'right');
  chara(ctx, 'rika', p.kind === 'kinetic' ? 'surprise' : 'confident', 362, 160, 120);
}

// 第17話：雪の上に、くつ／スキーで立つ（圧力が大きいほど沈む。絵だけ）
function pSnow(ctx, t, p) {
  psky(ctx);
  const P = p.F / p.S, sink = Math.min(26, P / 1000) * grow(t, 1.4);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 118, 320, 42);
  ctx.strokeStyle = PC.gray; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 118); ctx.lineTo(320, 118); ctx.stroke();
  const X = 150, w = p.what === 'くつ' ? 30 : 140;
  ctx.fillStyle = PC.gray; ctx.fillRect(X - w / 2, 118, w, sink);
  ctx.fillStyle = p.what === 'くつ' ? PC.woodDark : PC.apple; ctx.fillRect(X - w / 2, 112 + sink, w, 6);
  chara(ctx, 'rika', sink > 12 ? 'surprise' : 'happy', X, 114 + sink, 96);
  plabel(ctx, p.what + '（S = ' + p.S + ' m²）', X, 150, PC.ink);
  ptxt(ctx, '面積がせまいほど、ずぶっと沈む', 8, 18, PC.ink, 10);
  chara(ctx, 'newton', 'proud', 362, 160, 120);
}

// 第17話：ばねばかりにつるした石を水に沈める（W：紺、浮力 F と 張力 T：木）
function pWater(ctx, t, p) {
  pfloor(ctx, 150);
  const k = grow(t, 1.6), X = 150;
  ctx.fillStyle = PC.woodDark; ctx.fillRect(60, 10, 6, 140); ctx.fillRect(60, 10, 96, 6);
  ctx.fillStyle = '#fff'; ctx.fillRect(X - 9, 18, 18, 30); ctx.strokeStyle = PC.ink; ctx.lineWidth = 1.5; ctx.strokeRect(X - 9, 18, 18, 30);
  const T = round2(p.W - p.F * k), y = 82 + 34 * k;
  ptxt(ctx, T.toFixed(2) + ' N', X + 14, 38, PC.apple, 11);
  ctx.strokeStyle = PC.ink; ctx.beginPath(); ctx.moveTo(X, 48); ctx.lineTo(X, y - 10); ctx.stroke();
  ctx.fillStyle = 'rgba(191,226,246,.85)'; ctx.fillRect(96, 92, 110, 58);
  ctx.strokeStyle = PC.rail; ctx.lineWidth = 2; ctx.strokeRect(96, 92, 110, 58);
  ctx.fillStyle = PC.rail; ctx.fillRect(X - 10, y - 10, 20, 18);
  parrow(ctx, X - 4, y, X - 4, y + 26, PC.coat, 3);
  if (k > 0.3) parrow(ctx, X + 16, y + 6, X + 16, y + 6 - 22 * k, PC.woodDark, 3);
  plabel(ctx, 'W', X - 12, y + 26, PC.coat, 'right');
  if (k > 0.3) plabel(ctx, '浮力 F', X + 22, y - 8, PC.woodDark, 'left');
  ptxt(ctx, '上向きを正 ↑', 8, 18, PC.ink, 10);
  chara(ctx, 'rika', k >= 1 ? 'surprise' : 'question', 362, 160, 120);
}

// 第9話：ばねにかごをつるす（のび x と弾性力 F）
function pSpring(ctx, t, p) {
  pfloor(ctx, 150);
  const X = 150, TOP = 16, L0 = 40, k = grow(t, 1.4), ext = Math.min(70, p.x * 140) * k, bot = TOP + L0 + ext;
  ctx.fillStyle = PC.woodDark; ctx.fillRect(90, TOP - 6, 120, 6);
  ctx.strokeStyle = PC.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X, TOP);
  const n = 10; for (let i = 1; i <= n; i++) ctx.lineTo(X + (i % 2 ? 8 : -8), TOP + (L0 + ext) * i / (n + 1));
  ctx.lineTo(X, bot); ctx.stroke();
  ctx.fillStyle = PC.creamLine; ctx.fillRect(X - 18, bot, 36, 18); ctx.strokeStyle = PC.woodDark; ctx.strokeRect(X - 18, bot, 36, 18);
  pdash(ctx, X + 30, TOP + L0, X + 60, TOP + L0, PC.muted); pdash(ctx, X + 30, bot, X + 60, bot, PC.muted);
  if (ext > 6) { parrow(ctx, X + 50, TOP + L0, X + 50, bot, PC.muted, 1.5); plabel(ctx, 'のび x', X + 56, TOP + L0 + ext / 2 + 4, PC.ink, 'left'); }
  parrow(ctx, X - 26, bot + 9, X - 26, bot + 9 - 28 * k, PC.woodDark, 3);
  parrow(ctx, X - 10, bot + 9, X - 10, bot + 9 + 28 * k, PC.coat, 3);
  plabel(ctx, '弾性力 F', X - 32, bot - 8, PC.woodDark, 'right');
  plabel(ctx, 'W', X - 16, bot + 40, PC.coat, 'right');
  plabel(ctx, 'k = ' + p.k + ' N/m', 96, TOP + 18, PC.ink, 'right');
  chara(ctx, 'newton', 'question', 362, 160, 120);
}

// 第13話：スケートで押し合う（2つの力はいつも同じ大きさ・反対向き）
function pPush(ctx, t, p) {
  ctx.fillStyle = PC.sky2; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 110, W, 50);
  const k = grow(t, 1.2), L = Math.min(60, 16 + p.F / 5) * k, X = 150;
  chara(ctx, 'rika', 'normal', X - 46, 140, 82);
  chara(ctx, 'newton', 'surprise', X + 46, 140, 70);
  parrow(ctx, X + 8, 46, X + 8 + L, 46, PC.apple, 3.5);
  parrow(ctx, X - 8, 46, X - 8 - L, 46, PC.apple, 3.5);
  // 右の矢印＝ニュートンくんが受ける力、左の矢印＝リカが受ける力
  const nw = p.who === 'newton';
  plabel(ctx, nw ? '押し返す力 ?' : 'リカが押す力 ' + p.F + ' N', X + 8, 34, PC.apple, 'left');
  plabel(ctx, nw ? 'ニュートンくんが押す力 ' + p.F + ' N' : '押し返す力 ?', X - 8, 34, PC.apple, 'right');
  plabel(ctx, p.mR + ' kg', X - 46, 154, PC.ink); plabel(ctx, p.mN + ' kg', X + 46, 154, PC.ink);
  ptxt(ctx, '右向きを正 →', 300, 18, PC.ink, 10, 'right');
  ptxt(ctx, '作用と反作用は同じ大きさ', 8, 18, PC.ink, 10);
}

Object.assign(STORY_DRAW, { 'p-pull': pPull, 'p-basket': pBasket, 'p-pot': pPot, 'p-cart': pCart, 'p-book': pBook, 'p-snow': pSnow, 'p-water': pWater, 'p-spring': pSpring, 'p-push': pPush });


// ========================================
// アニメーションループ
// ========================================

function draw(ts) {
  if (!current) return;
  if (!t0) t0 = ts;
  const t = (ts - t0) / 1000;
  const cv = document.getElementById('canvas');
  if (cv.width !== W * 2) { cv.width = W * 2; cv.height = H * 2; }   // 2 倍の細かさで描く
  const ctx = cv.getContext('2d');
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  const story = STORY_DRAW[current.anim];
  if (story) story(ctx, REDUCE ? 2.4 : t, current.ap);               // 動きを減らす設定では、とちゅうの形で止める
  else switch(current.anim) {
    case 'newton':       drawNewton(ctx,t,current.ap);       break;
  }
  animId = requestAnimationFrame(draw);
}

function stopAnim() {
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  t0 = null;
}

// ========================================
// 正解エフェクト
// ========================================

function triggerSparkle() {
  const fb = document.getElementById('feedback');
  const rect = fb.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const icons = ['⭐', '✨', '💫', '🎉', '⚡', '🌟'];

  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'sparkle-particle';
    el.textContent = icons[Math.floor(Math.random() * icons.length)];

    const angle = Math.random() * Math.PI * 2;
    const dist  = 60 + Math.random() * 120;
    el.style.cssText = `
      left: ${cx}px; top: ${cy}px;
      font-size: ${14 + Math.random() * 14}px;
      --tx: ${Math.cos(angle) * dist}px;
      --ty: ${Math.sin(angle) * dist}px;
      animation-delay: ${Math.random() * 0.15}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  // カードをバウンス
  const card = document.querySelector('.card');
  if (card) {
    card.classList.add('bounce');
    card.addEventListener('animationend', () => card.classList.remove('bounce'), { once: true });
  }
}

// ========================================
// サウンド（Web Audio API）
// ========================================

let soundMode = 0; // 0=🎵 効果音のみ  1=🎶 BGM ON  2=🔇 ミュート
let audioCtx   = null;
let bgmTimerId = null;

const SOUND_ICONS = ['🎵', '🎶', '🔇'];

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type, start, dur, vol, ctx) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur + 0.01);
}

function playCorrect() {
  if (soundMode === 2) return;
  const ctx = getAudioCtx(), now = ctx.currentTime;
  playTone(523.25, 'sine', now,        0.15, 0.28, ctx); // C5
  playTone(783.99, 'sine', now + 0.12, 0.25, 0.28, ctx); // G5
}

function playWrong() {
  if (soundMode === 2) return;
  const ctx = getAudioCtx(), now = ctx.currentTime;
  playTone(220, 'square', now,        0.18, 0.12, ctx);
  playTone(180, 'square', now + 0.14, 0.18, 0.10, ctx);
}

function playFanfare() {
  if (soundMode === 2) return;
  const ctx = getAudioCtx(), now = ctx.currentTime;
  [[523.25, 0], [659.25, 0.14], [783.99, 0.28], [1046.5, 0.42]].forEach(([f, d]) => {
    playTone(f, 'sine', now + d, 0.30, 0.22, ctx);
  });
}

// BGM: 軽快な 8 小節ループ（BPM 120、triangle 波）
const BGM_BEAT = 0.5; // 120BPM → 1拍 = 0.5秒
const BGM_SEQ  = [
  [523.25, 0.5], [659.25, 0.5], [783.99, 0.5], [659.25, 0.5],
  [698.46, 0.5], [880.00, 0.5], [783.99, 1.0],
  [587.33, 0.5], [698.46, 0.5], [880.00, 0.5], [698.46, 0.5],
  [783.99, 0.5], [659.25, 0.5], [523.25, 1.0],
];
const BGM_TOTAL = BGM_SEQ.reduce((s, [, b]) => s + b * BGM_BEAT, 0);

function scheduleBGMLoop() {
  if (soundMode !== 1) return;
  const ctx = getAudioCtx(), now = ctx.currentTime;
  let t = now;
  BGM_SEQ.forEach(([freq, beats]) => {
    const dur = beats * BGM_BEAT;
    playTone(freq, 'triangle', t, dur * 0.82, 0.07, ctx);
    t += dur;
  });
  bgmTimerId = setTimeout(scheduleBGMLoop, (BGM_TOTAL - 0.1) * 1000);
}

function startBGM() {
  if (bgmTimerId) return;
  scheduleBGMLoop();
}

function stopBGM() {
  if (bgmTimerId) { clearTimeout(bgmTimerId); bgmTimerId = null; }
}

function cycleSoundMode() {
  // ボタンの初回押下で AudioContext を初期化（ブラウザの自動再生制限対応）
  getAudioCtx();
  soundMode = (soundMode + 1) % 3;
  const btn = document.getElementById('sound-btn');
  if (btn) btn.textContent = SOUND_ICONS[soundMode];
  if (soundMode === 1) startBGM();
  else                 stopBGM();
}

// ========================================
// 入力フィールドの動的生成
// ========================================

function renderInputs(inputs) {
  const container = document.getElementById('inputs-container');
  container.innerHTML = '';
  // 1-7 のように − を入れる問題は、スマホで − が打てるキーボードにする
  const im = current && current.signed ? 'text' : 'decimal';

  if (mode === 'test') {
    // テストモード：答え欄1つ ＋ メモ欄
    const r = current.result;
    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
      <span class="input-label">${r.variable} =</span>
      <input type="number" class="answer-input" id="inp-result"
             placeholder="?" inputmode="${im}" step="any" autocomplete="off">
      <span class="unit">${r.unit}</span>`;
    container.appendChild(row);

    const memoLabel = document.createElement('div');
    memoLabel.className = 'memo-label';
    memoLabel.textContent = '📝 メモ欄（計算に使ってね）';
    container.appendChild(memoLabel);

    const memo = document.createElement('textarea');
    memo.className = 'memo-area';
    memo.id = 'memo-area';
    memo.placeholder = 'ここに計算を書こう…';
    container.appendChild(memo);
    return;
  }

  // かんたん / 計算モード：代入入力欄
  inputs.forEach((inp, i) => {
    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
      <span class="input-label">${inp.variable} =</span>
      <input type="number" class="answer-input" id="inp-${i}"
             placeholder="?" inputmode="${im}" step="any" autocomplete="off">
      <span class="unit">${inp.unit}</span>`;
    container.appendChild(row);
  });

  // 計算モード：区切り線 ＋ 答え欄
  if (mode === 'calc') {
    const r = current.result;
    const divider = document.createElement('div');
    divider.className = 'result-divider';
    divider.textContent = '計算して答えよう';
    container.appendChild(divider);

    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
      <span class="input-label">${r.variable} =</span>
      <input type="number" class="answer-input" id="inp-result"
             placeholder="?" inputmode="${im}" step="any" autocomplete="off">
      <span class="unit">${r.unit}</span>`;
    container.appendChild(row);
  }
}

// ========================================
// ガイド役：リカ
// ========================================

const RIKA_START = {
  easy: 'いっしょに解こう！ まずは問題の数字を、公式の文字に入れてみてね。',
  calc: '代入できたら、計算までやってみよう！',
  test: 'テストモードだよ。メモ欄を使って、答えだけ入れてね。'
};
const RIKA_RIGHT = ['やった、正解！', 'すごい、ぴったり！', 'その調子！', 'ばっちりだね！'];
const pick = a => a[Math.floor(Math.random() * a.length)];

function rika(face, text) {
  const img = document.getElementById('rika-img');
  const line = document.getElementById('rika-line');
  if (img) img.src = `../story/img/rika_${face}.webp`;
  if (line) line.textContent = text;
}

// 表情の画像を先に読み込んでおく
['normal','confident','surprise','idea','question','confused','happy','oops']
  .forEach(f => { new Image().src = `../story/img/rika_${f}.webp`; });

// ========================================
// UI ロジック
// ========================================

function loadProblem() {
  answered = false;
  if (count === 0) rika('normal', RIKA_START[mode]);
  else if (TOTAL - count <= 3) rika('confident', `あと ${TOTAL - count} 問！ ラストスパート！`);
  else rika('normal', '次の問題、いってみよう！');
  current = activeGens[Math.floor(Math.random() * activeGens.length)]();

  document.getElementById('badge').textContent = current.badge;
  document.getElementById('problem-text').innerHTML = current.text;
  document.getElementById('formula').innerHTML = current.formula;   // 1-7 の v<sub>AB</sub> のような下つき文字を出す
  renderInputs(current.inputs);

  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('result-reveal').style.display = 'none';
  document.getElementById('check-btn').style.display = 'block';
  document.getElementById('next-btn').style.display = 'none';

  stopAnim();
  animId = requestAnimationFrame(draw);
  setTimeout(() => { const f = document.querySelector('#inputs-container input'); if(f) f.focus(); }, 50);
}

function checkAnswer() {
  if (answered) return;

  // ── 未入力チェック ──
  if (mode === 'test') {
    const r = document.getElementById('inp-result');
    if (!r || r.value === '') {
      document.getElementById('feedback').textContent = '答えを入力してください。';
      document.getElementById('feedback').className = 'feedback';
      rika('question', 'あれ、答えの欄がまだ空いてるよ？');
      return;
    }
  } else {
    let allFilled = true;
    current.inputs.forEach((_, i) => {
      const el = document.getElementById(`inp-${i}`);
      if (!el || el.value === '') allFilled = false;
    });
    if (mode === 'calc') {
      const r = document.getElementById('inp-result');
      if (!r || r.value === '') allFilled = false;
    }
    if (!allFilled) {
      document.getElementById('feedback').textContent = 'すべての欄に数値を入力してください。';
      document.getElementById('feedback').className = 'feedback';
      rika('question', 'あれ、まだ空いてる欄があるよ？');
      return;
    }
  }

  answered = true;
  count++;
  let allCorrect = true;

  // ── 代入欄の採点（easy / calc）──
  if (mode !== 'test') {
    current.inputs.forEach((inp, i) => {
      const el  = document.getElementById(`inp-${i}`);
      const val = parseFloat(el.value);
      const ok  = Math.abs(val - inp.answer) <= Math.max(inp.tol || 0, 0.01);
      el.classList.add(ok ? 'correct' : 'incorrect');
      el.disabled = true;
      if (!ok) allCorrect = false;
    });
  }

  // ── 答え欄の採点（calc / test）──
  if (mode === 'calc' || mode === 'test') {
    const el  = document.getElementById('inp-result');
    const val = parseFloat(el.value);
    // 整数だけで計算できる問題（入れる数も答えも整数）は、ぴったりだけ正解にする
    // （答えを四捨五入して作る問題は exact: false で外す）
    const intProb = current.exact !== false && Number.isInteger(current.result.value) && current.inputs.every(inp => Number.isInteger(inp.answer));
    const ok  = intProb
      ? Math.abs(val - current.result.value) < 1e-9
      : Math.abs(val - current.result.value) <= 0.05 * Math.max(Math.abs(current.result.value), 1) + 0.05;
    el.classList.add(ok ? 'correct' : 'incorrect');
    el.disabled = true;
    if (!ok) allCorrect = false;
  }

  // ── フィードバック ──
  const fb = document.getElementById('feedback');
  if (allCorrect) {
    score++;
    if      (mode === 'easy') fb.textContent = '✓ 正しく代入できました！';
    else if (mode === 'calc') fb.textContent = '✓ 代入も計算も正解！';
    else                      fb.textContent = '✓ 正解！';
    fb.className = 'feedback correct';
    rika('happy', pick(RIKA_RIGHT));
    triggerSparkle();
    playCorrect();
  } else {
    if (mode === 'test') fb.textContent = '✗ 不正解。計算を確認しよう。';
    else                 fb.textContent = '✗ 違います。赤い欄を確認しよう。';
    fb.className = 'feedback incorrect';
    rika('oops', mode === 'test'
      ? 'まちがえた〜。下の計算結果と、自分のメモをくらべてみよう！'
      : 'まちがえた〜。赤い欄を、いっしょに見直そう！');
    playWrong();
  }

  // ── 計算結果の表示 ──
  const r = current.result;
  const reveal = document.getElementById('result-reveal');
  reveal.innerHTML = `
    <div class="reveal-label">計算結果</div>
    <div class="reveal-calc">
      <span class="reveal-var">${r.variable}</span>
      <span class="reveal-eq">=</span>
      <span class="reveal-expr">${r.expression}</span>
      <span class="reveal-eq">=</span>
      <span class="reveal-value">${r.value}</span>
      <span class="reveal-unit">${r.unit}</span>
    </div>`;
  reveal.style.display = 'block';

  // ── スコア・進捗更新 ──
  document.getElementById('score').textContent = score;
  document.getElementById('total').textContent = count;
  document.getElementById('progress-fill').style.width = (count / TOTAL * 100) + '%';
  document.getElementById('progress-text').textContent = `${count} / ${TOTAL} 問`;
  document.getElementById('check-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'block';
  if (count >= TOTAL) document.getElementById('next-btn').textContent = '結果を見る →';
}

function nextProblem() {
  if (count >= TOTAL) { showResult(); return; }
  loadProblem();
}

// メダル・トロフィー
// ジングル（効果音のミュートには従う）
function awardJingle(kind) {
  if (soundMode === 2) return;
  const ctx = getAudioCtx(), now = ctx.currentTime;
  const seq = kind === 'trophy'
    ? [[523.25, 0, .16], [659.25, .14, .16], [783.99, .28, .16], [1046.5, .42, .5], [783.99, .74, .14], [1046.5, .88, .14], [1318.5, 1.02, .7]]
    : [[783.99, 0, .14], [1046.5, .13, .14], [1318.5, .26, .45]];
  seq.forEach(([f, d, len]) => {
    playTone(f, 'triangle', now + d, len, .2, ctx);
    playTone(f * 2, 'sine', now + d, len * .8, .05, ctx);
  });
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
  let prev = { bestScore: 0, perfect: false };
  try { prev = (JSON.parse(localStorage.getItem('wakuwakupub_progress_guest') || '{}'))[unitId] || prev; } catch (e) { /* 保存できない端末 */ }
  try { saveProgress(); } catch (e) { /* 保存できない端末でも続ける */ }
  stopAnim();
  document.getElementById('problem-view').style.display = 'none';
  document.getElementById('result-view').style.display = 'block';
  const pct = score / TOTAL;
  let title, msg;
  if      (pct >= .9) { title = '完璧！すごい！';   msg = `${score}問正解！この単元はバッチリですね！`;        rika('happy', 'すごすぎる！ わたしも見習わなきゃ！'); }
  else if (pct >= .7) { title = 'よくできました！'; msg = `${score}問正解！あと少しで満点です！`;            rika('confident', 'いい感じ！ 次は満点ねらっちゃおう！'); }
  else if (pct >= .5) { title = 'もう少し！';       msg = `${score}問正解。もう一度公式を確認して再挑戦！`; rika('idea', '公式を見直したら、きっとのびるよ！'); }
  else                { title = '頑張ろう！';        msg = `${score}問正解。くり返し練習しよう！`;          rika('oops', 'わたしも最初はまちがえてばっかりだったよ。もう一回やろう！'); }
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-score-num').textContent = score;
  document.getElementById('result-msg').textContent = msg;

  // どのごほうびか
  let kind = null, label = '', sub = '';
  const hadMedal = prev.bestScore >= MEDAL;
  if (score === TOTAL)      { kind = 'trophy'; label = prev.perfect ? 'トロフィー（もう持っている）' : 'トロフィー ゲット！'; sub = '全問正解のしるし'; }
  else if (score >= MEDAL)  { kind = 'medal';  label = !hadMedal ? 'メダル ゲット！' : score > prev.bestScore ? 'ベスト記録 更新！' : 'メダル（もう持っている）'; sub = 'ベスト ' + Math.max(score, prev.bestScore) + ' / 10'; }
  const isNew = kind === 'trophy' ? !prev.perfect : kind === 'medal' ? (!hadMedal || score > prev.bestScore) : false;

  const card = document.querySelector('.result-card');
  card.querySelectorAll('.award, .award-hint').forEach(e => e.remove());
  if (kind) {
    const box = document.createElement('div');
    box.className = 'award ' + kind + (isNew ? ' new' : '');
    box.innerHTML = `<div class="award-badge">${medalSVG(kind)}</div><div class="award-label">${label}</div><div class="award-sub">${sub}</div>`;
    card.insertBefore(box, card.querySelector('.result-msg').nextSibling);
    if (isNew) { confetti(card); awardJingle(kind); } else playFanfare();
  } else {
    playFanfare();
    const box = document.createElement('div');
    box.className = 'award-hint';
    box.textContent = `あと ${MEDAL - score} 問でメダル！（${MEDAL}問以上）`;
    card.insertBefore(box, card.querySelector('.result-msg').nextSibling);
  }
}

function retry() {
  score = 0; count = 0;
  ['score','total'].forEach(id => document.getElementById(id).textContent = '0');
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-text').textContent = `0 / ${TOTAL} 問`;
  document.getElementById('next-btn').textContent = '次の問題 →';
  document.getElementById('result-view').style.display = 'none';
  document.getElementById('problem-view').style.display = 'block';
  loadProblem();
}

// ========================================
// 初期化
// ========================================

// ========================================
// ストーリーやシミュから来たときは「第◯話にもどる」リンクを出す
// ========================================

const SIM_EP = {
  'speed-race.html': 1, 'displacement.html': 2, 'uniform-motion.html': 3, 'relative-velocity.html': 4,
  'inclined-plane.html': 5, 'inclined-plane-simulator.html': 5, 'freefall.html': 6, 'vertical-throw.html': 7, 'horizontal-throw.html': 8,
  'force-arrows.html': 9, 'force-composition.html': 10, 'force-balance.html': 11, 'inertia.html': 12, 'action-reaction.html': 13,
  'motion-equation.html': 14, 'fall-force.html': 15, 'friction.html': 16, 'buoyancy.html': 17
};
function cameFrom() {
  try {
    const r = new URL(document.referrer);
    if (r.origin !== location.origin) return null;
    const file = r.pathname.split('/').pop();
    if (/\/story\/(index\.html)?$/.test(r.pathname) && r.searchParams.get('ep'))
      return { href: r.href, label: `第${Number(r.searchParams.get('ep'))}話のストーリーにもどる` };
    if (SIM_EP[file]) return { href: r.href, label: `第${SIM_EP[file]}話のシミュにもどる` };
  } catch (e) { /* referrer がないとき */ }
  return null;
}
function showCameFrom() {
  const from = cameFrom();
  if (!from) return;
  const back = document.querySelector('.top .back-link');
  if (back) {
    const box = document.createElement('div');
    box.className = 'back-links';
    back.replaceWith(box);
    const a = document.createElement('a');
    a.className = 'back-link'; a.href = from.href; a.textContent = '← ' + from.label;
    box.append(a, back);
  }
  const home = document.querySelector('#result-view .btn-home');
  if (home) {
    const a = document.createElement('a');
    a.className = 'btn-home'; a.href = from.href; a.textContent = '← ' + from.label;
    home.before(a);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  showCameFrom();
  // どの話の問題か
  const ep = unitId && STORY_EP[unitId];
  if (ep) {
    const chip = document.createElement('a');
    chip.className = 'story-chip';
    chip.href = '../story/index.html?ep=' + String(ep[0]).padStart(2, '0');
    chip.innerHTML = `<img src="../story/img/newton_question.webp" alt="" width="26" height="26">第${ep[0]}話「${ep[1]}」の問題<span>ストーリーを見る ›</span>`;
    const card = document.querySelector('#problem-view .card');
    card.parentNode.insertBefore(chip, card);
  }
  // タイトルを単元名に変更
  const titleEl = document.getElementById('drill-title');
  if (titleEl) titleEl.textContent = unitInfo ? `${unitId}　${unitTitle}` : unitTitle;
  document.title = `${unitTitle} - わくわく物理基礎`;

  // Enter キー
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') { if (!answered) checkAnswer(); else nextProblem(); }
  });

  loadProblem();
});
