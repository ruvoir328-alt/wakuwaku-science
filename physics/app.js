/* ================================
   わくわく物理基礎 - ドリルロジック
   ================================ */

const TOTAL = 10;

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

/** 1-1: 速度を求める  v = x ÷ t */
function probVelocity() {
  const v = ri(2, 15);
  const t = ri(2, 10);
  const x = v * t;
  return {
    badge: '速度と変位',
    text: `物体が <b>${t} 秒間</b> に <b>${x} m</b> 移動した。<br>速度 <i>v</i> を求めよ。`,
    formula: 'v = x ÷ t',
    inputs: [
      { variable: 'x', unit: 'm', answer: x, tol: 0 },
      { variable: 't', unit: 's', answer: t, tol: 0 }
    ],
    result: { variable: 'v', value: v, unit: 'm/s', expression: `${x} ÷ ${t}` },
    anim: 'uniform', ap: { v }
  };
}

/** 1-2: 等速直線運動  x = v × t */
function probUniform() {
  const v = ri(2, 15);
  const t = ri(2, 10);
  return {
    badge: '等速直線運動',
    text: `物体が <b>${v} m/s</b> の速度で <b>${t} 秒間</b> 直線運動した。<br>移動距離 <i>x</i> を求めよ。`,
    formula: 'x = v × t',
    inputs: [
      { variable: 'v', unit: 'm/s', answer: v, tol: 0 },
      { variable: 't', unit: 's',   answer: t, tol: 0 }
    ],
    result: { variable: 'x', value: v * t, unit: 'm', expression: `${v} × ${t}` },
    anim: 'uniform', ap: { v }
  };
}

/** 1-3a: 等加速度運動（速度）  v = v₀ + at */
function probAccelV() {
  const v0 = ri(0, 10), a = ri(1, 5), t = ri(2, 6);
  return {
    badge: '等加速度運動',
    text: `初速度 <b>${v0} m/s</b>、加速度 <b>${a} m/s²</b> の物体の <b>${t} 秒後</b> の速度 <i>v</i> を求めよ。`,
    formula: 'v = v₀ + a × t',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0, tol: 0 },
      { variable: 'a',  unit: 'm/s²', answer: a,  tol: 0 },
      { variable: 't',  unit: 's',    answer: t,  tol: 0 }
    ],
    result: { variable: 'v', value: v0 + a * t, unit: 'm/s', expression: `${v0} + ${a} × ${t}` },
    anim: 'accel', ap: { v0, a, t }
  };
}

/** 1-3b: 等加速度運動（変位）  x = v₀t + ½at² */
function probAccelX() {
  const v0 = ri(0, 6), a = ri(1, 4), t = ri(2, 5);
  const v0t = v0 * t, halfAt2 = 0.5 * a * t * t;
  return {
    badge: '等加速度運動',
    text: `初速度 <b>${v0} m/s</b>、加速度 <b>${a} m/s²</b> で <b>${t} 秒間</b> 動いた物体の移動距離 <i>x</i> を求めよ。`,
    formula: 'x = v₀t + ½at²',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0, tol: 0 },
      { variable: 'a',  unit: 'm/s²', answer: a,  tol: 0 },
      { variable: 't',  unit: 's',    answer: t,  tol: 0 }
    ],
    result: {
      variable: 'x', value: v0t + halfAt2, unit: 'm',
      expression: `${v0}×${t} + ½×${a}×${t}² = ${v0t} + ${halfAt2}`
    },
    anim: 'accel', ap: { v0, a, t }
  };
}

/** 1-4: 自由落下  v = gt */
function probFreeFall() {
  const t = ri(1, 5);
  return {
    badge: '自由落下',
    text: `静止状態から自由落下した物体の <b>${t} 秒後</b> の速度 <i>v</i> を求めよ。<br><small>（g = 9.8 m/s²）</small>`,
    formula: 'v = g × t',
    inputs: [
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 },
      { variable: 't', unit: 's',    answer: t,   tol: 0    }
    ],
    result: { variable: 'v', value: round1(9.8 * t), unit: 'm/s', expression: `9.8 × ${t}` },
    anim: 'fall', ap: { t }
  };
}

/** 1-5: 鉛直投げおろし  v = v₀ + gt */
function probVerticalDown() {
  const v0 = ri(1, 10), t = ri(1, 4);
  const v = round1(v0 + 9.8 * t);
  return {
    badge: '鉛直投げおろし',
    text: `初速度 <b>${v0} m/s</b> で真下に投げ下ろした。<br><b>${t} 秒後</b> の速度 <i>v</i> を求めよ。<br><small>（下向き正、g = 9.8 m/s²）</small>`,
    formula: 'v = v₀ + g × t',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0,  tol: 0    },
      { variable: 'g',  unit: 'm/s²', answer: 9.8, tol: 0.05 },
      { variable: 't',  unit: 's',    answer: t,   tol: 0    }
    ],
    result: { variable: 'v', value: v, unit: 'm/s', expression: `${v0} + 9.8 × ${t}` },
    anim: 'fall', ap: { t }
  };
}

/** 1-6a: 鉛直投げ上げ（速度）  v = v₀ − gt */
function probThrowUpV() {
  const tMax = ri(2, 5);
  const v0 = round1(9.8 * tMax);
  const t = ri(1, tMax - 1);
  const v = round1(v0 - 9.8 * t);
  return {
    badge: '鉛直投げ上げ',
    text: `初速度 <b>${v0} m/s</b> で真上に投げ上げた。<br><b>${t} 秒後</b> の速度 <i>v</i> を求めよ。<br><small>（上向き正、g = 9.8 m/s²）</small>`,
    formula: 'v = v₀ − g × t',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0,  tol: 0.05 },
      { variable: 'g',  unit: 'm/s²', answer: 9.8, tol: 0.05 },
      { variable: 't',  unit: 's',    answer: t,   tol: 0    }
    ],
    result: { variable: 'v', value: v, unit: 'm/s', expression: `${v0} − 9.8 × ${t}` },
    anim: 'throw-up', ap: { v0 }
  };
}

/** 1-6b: 鉛直投げ上げ（最高点に達する時間）  t = v₀ ÷ g */
function probThrowUpMaxT() {
  const tMax = ri(1, 5);
  const v0 = round1(9.8 * tMax);
  return {
    badge: '鉛直投げ上げ',
    text: `初速度 <b>${v0} m/s</b> で真上に投げ上げた。<br>最高点に達するまでの時間 <i>t</i> を求めよ。<br><small>（最高点では v = 0）</small>`,
    formula: 'v = 0 になるとき  →  t = v₀ ÷ g',
    inputs: [
      { variable: 'v₀', unit: 'm/s',  answer: v0,  tol: 0.05 },
      { variable: 'g',  unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 't', value: tMax, unit: 's', expression: `${v0} ÷ 9.8` },
    anim: 'throw-up', ap: { v0 }
  };
}

/** ニュートン第二法則（全単元共通）  a = F ÷ m */
function probNewton() {
  const m = ri(1, 10), a_ans = ri(1, 8);
  const F = m * a_ans;
  return {
    badge: 'ニュートンの第二法則',
    text: `質量 <b>${m} kg</b> の物体に <b>${F} N</b> の力を加えたときの加速度 <i>a</i> を求めよ。`,
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

  const isFirstClear  = !prev.bestScore && score > 0;
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
    medal:       score > 0      ? '◯' : '',
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
// 2節「力と運動の法則」問題生成
// ========================================

/** 2-1a: 同じ向きの合力  F = F₁ + F₂ */
function probForceAdd() {
  const f1 = ri(2, 20), f2 = ri(2, 20);
  return {
    badge: '力の合成',
    text: `同じ向きに <b>${f1} N</b> と <b>${f2} N</b> の力がはたらいている。<br>合力 <i>F</i> を求めよ。`,
    formula: 'F = F₁ + F₂',
    inputs: [
      { variable: 'F₁', unit: 'N', answer: f1, tol: 0 },
      { variable: 'F₂', unit: 'N', answer: f2, tol: 0 }
    ],
    result: { variable: 'F', value: f1 + f2, unit: 'N', expression: `${f1} + ${f2}` },
    anim: 'force-add', ap: { f1, f2 }
  };
}

/** 2-1b: 反対向きの合力  F = |F₁ − F₂| */
function probForceSub() {
  const f1 = ri(5, 25), f2 = ri(2, f1 - 1);
  return {
    badge: '力の合成',
    text: `右向きに <b>${f1} N</b>、左向きに <b>${f2} N</b> の力がはたらいている。<br>合力 <i>F</i> の大きさと向きを答えよ（右向き正）。`,
    formula: 'F = F₁ − F₂（右向き正）',
    inputs: [
      { variable: 'F₁', unit: 'N', answer: f1, tol: 0 },
      { variable: 'F₂', unit: 'N', answer: f2, tol: 0 }
    ],
    result: { variable: 'F', value: f1 - f2, unit: 'N（右向き）', expression: `${f1} − ${f2}` },
    anim: 'force-sub', ap: { f1, f2 }
  };
}

/** 2-1c: 力の分解（水平・鉛直成分）*/
function probForceDecomp() {
  const angles = [30, 45, 60];
  const deg = angles[ri(0, 2)];
  const F = ri(4, 20) * 5;           // きれいな数にする
  const rad = deg * Math.PI / 180;
  const fx = round1(F * Math.cos(rad));
  const fy = round1(F * Math.sin(rad));
  return {
    badge: '力の分解',
    text: `大きさ <b>${F} N</b> の力が水平から <b>${deg}°</b> の向きにはたらいている。<br>水平成分 <i>Fx</i> を求めよ。`,
    formula: `Fx = F × cos${deg}°`,
    inputs: [
      { variable: 'F',  unit: 'N', answer: F,   tol: 0 },
    ],
    result: { variable: 'Fx', value: fx, unit: 'N', expression: `${F} × cos${deg}° = ${F} × ${round1(Math.cos(rad))}` },
    anim: 'force-decomp', ap: { F, deg }
  };
}

/** 2-2a: 2力のつりあい（垂直抗力）  N = mg */
function probEquilNormal() {
  const m = ri(1, 20);
  const N = round1(m * 9.8);
  return {
    badge: '力のつりあい',
    text: `質量 <b>${m} kg</b> の物体が水平面上で静止している。<br>垂直抗力 <i>N</i> を求めよ。<br><small>（g = 9.8 m/s²）</small>`,
    formula: 'つりあい → N = mg',
    inputs: [
      { variable: 'm', unit: 'kg',  answer: m,   tol: 0    },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 'N', value: N, unit: 'N', expression: `${m} × 9.8` },
    anim: 'equil', ap: { m, N }
  };
}

/** 2-2b: 3力のつりあい（未知の力） */
function probEquil3() {
  const w  = ri(2, 15) * 10;   // 重力 [N]
  const f1 = ri(1, w - 10 > 0 ? Math.floor(w / 2) : 5) * 5;
  const f2 = w - f1;
  return {
    badge: '力のつりあい',
    text: `重力 <b>${w} N</b> の物体が2本のひもで支えられ静止している。<br>一方のひもの張力が <b>${f1} N</b> のとき、もう一方の張力 <i>T</i> を求めよ。`,
    formula: 'ΣF = 0 → T = W − T₁',
    inputs: [
      { variable: 'W',  unit: 'N', answer: w,  tol: 0 },
      { variable: 'T₁', unit: 'N', answer: f1, tol: 0 }
    ],
    result: { variable: 'T', value: f2, unit: 'N', expression: `${w} − ${f1}` },
    anim: 'equil', ap: { m: round1(w / 9.8), N: w }
  };
}

/** 2-3a: 運動方程式（加速度）  a = F ÷ m　← 既存 probNewton の拡充版 */
function probEqAccel() {
  const m = ri(1, 15), a = ri(1, 10);
  const F = m * a;
  return {
    badge: '運動方程式',
    text: `質量 <b>${m} kg</b> の物体に <b>${F} N</b> の力を加えた。<br>加速度 <i>a</i> を求めよ。`,
    formula: 'F = ma  →  a = F ÷ m',
    inputs: [
      { variable: 'F', unit: 'N',  answer: F, tol: 0 },
      { variable: 'm', unit: 'kg', answer: m, tol: 0 }
    ],
    result: { variable: 'a', value: a, unit: 'm/s²', expression: `${F} ÷ ${m}` },
    anim: 'newton', ap: { m, F }
  };
}

/** 2-3b: 運動方程式（力）  F = ma */
function probEqForce() {
  const m = ri(1, 15), a = ri(1, 10);
  const F = m * a;
  return {
    badge: '運動方程式',
    text: `質量 <b>${m} kg</b> の物体に力を加えたら加速度 <b>${a} m/s²</b> が生じた。<br>力 <i>F</i> を求めよ。`,
    formula: 'F = m × a',
    inputs: [
      { variable: 'm', unit: 'kg',  answer: m, tol: 0 },
      { variable: 'a', unit: 'm/s²', answer: a, tol: 0 }
    ],
    result: { variable: 'F', value: F, unit: 'N', expression: `${m} × ${a}` },
    anim: 'newton', ap: { m, F }
  };
}

/** 2-3c: 運動方程式（質量）  m = F ÷ a */
function probEqMass() {
  const m = ri(1, 15), a = ri(1, 10);
  const F = m * a;
  return {
    badge: '運動方程式',
    text: `<b>${F} N</b> の力を加えたら加速度 <b>${a} m/s²</b> が生じた。<br>物体の質量 <i>m</i> を求めよ。`,
    formula: 'F = ma  →  m = F ÷ a',
    inputs: [
      { variable: 'F', unit: 'N',   answer: F, tol: 0 },
      { variable: 'a', unit: 'm/s²', answer: a, tol: 0 }
    ],
    result: { variable: 'm', value: m, unit: 'kg', expression: `${F} ÷ ${a}` },
    anim: 'newton', ap: { m, F }
  };
}

/** 2-4a: 動摩擦力  f = μ'N = μ'mg */
function probFriction() {
  const mu  = [0.2, 0.3, 0.4, 0.5][ri(0, 3)];
  const m   = ri(1, 10);
  const N   = round1(m * 9.8);
  const f   = round1(mu * N);
  return {
    badge: '摩擦力',
    text: `動摩擦係数 <b>μ' = ${mu}</b>、質量 <b>${m} kg</b> の物体が水平面を滑っている。<br>動摩擦力 <i>f</i> を求めよ。<br><small>（g = 9.8 m/s²）</small>`,
    formula: "f = μ'N = μ'mg",
    inputs: [
      { variable: "μ'", unit: '',    answer: mu,  tol: 0.001 },
      { variable: 'm',  unit: 'kg',  answer: m,   tol: 0     },
      { variable: 'g',  unit: 'm/s²', answer: 9.8, tol: 0.05  }
    ],
    result: { variable: 'f', value: f, unit: 'N', expression: `${mu} × ${m} × 9.8` },
    anim: 'friction', ap: { m, mu }
  };
}

/** 2-4b: 静止摩擦・最大静止摩擦力  f_max = μN */
function probStaticFriction() {
  const mu  = [0.3, 0.4, 0.5, 0.6][ri(0, 3)];
  const m   = ri(1, 10);
  const N   = round1(m * 9.8);
  const f   = round1(mu * N);
  return {
    badge: '摩擦力',
    text: `静止摩擦係数 <b>μ = ${mu}</b>、質量 <b>${m} kg</b> の物体に水平の力を加え続ける。<br>最大静止摩擦力 <i>f</i> を求めよ。<br><small>（g = 9.8 m/s²）</small>`,
    formula: 'f = μN = μmg',
    inputs: [
      { variable: 'μ', unit: '',    answer: mu,  tol: 0.001 },
      { variable: 'm', unit: 'kg',  answer: m,   tol: 0     },
      { variable: 'g', unit: 'm/s²', answer: 9.8, tol: 0.05  }
    ],
    result: { variable: 'f', value: f, unit: 'N', expression: `${mu} × ${m} × 9.8` },
    anim: 'friction', ap: { m, mu }
  };
}

/** 2-5a: 圧力  P = F ÷ S */
function probPressure() {
  const F = ri(1, 20) * 10;
  const S = [0.1, 0.2, 0.4, 0.5, 1.0][ri(0, 4)];
  const P = round1(F / S);
  return {
    badge: '圧力',
    text: `面積 <b>${S} m²</b> の面に <b>${F} N</b> の力が垂直にはたらいている。<br>圧力 <i>P</i> を求めよ。`,
    formula: 'P = F ÷ S',
    inputs: [
      { variable: 'F', unit: 'N',  answer: F, tol: 0    },
      { variable: 'S', unit: 'm²', answer: S, tol: 0.001 }
    ],
    result: { variable: 'P', value: P, unit: 'Pa', expression: `${F} ÷ ${S}` },
    anim: 'pressure', ap: { F, S }
  };
}

/** 2-5b: 浮力  F = ρVg */
function probBuoyancy() {
  const rho = 1000;   // 水
  const V   = [0.001, 0.002, 0.005, 0.01][ri(0, 3)];
  const F   = round1(rho * V * 9.8);
  return {
    badge: '浮力',
    text: `水（密度 1000 kg/m³）に体積 <b>${V} m³</b> の物体が完全に沈んでいる。<br>浮力 <i>F</i> を求めよ。<br><small>（g = 9.8 m/s²）</small>`,
    formula: 'F = ρVg',
    inputs: [
      { variable: 'ρ', unit: 'kg/m³', answer: rho, tol: 0   },
      { variable: 'V', unit: 'm³',    answer: V,   tol: 0.0001 },
      { variable: 'g', unit: 'm/s²',  answer: 9.8, tol: 0.05 }
    ],
    result: { variable: 'F', value: F, unit: 'N', expression: `1000 × ${V} × 9.8` },
    anim: 'pressure', ap: { F, S: 1 }
  };
}

// ── 全単元のデフォルト（URL パラメータなしの場合）──
const allGenerators = [probUniform, probAccelV, probAccelX, probFreeFall, probNewton];

// ── 単元マップ ──
const unitMap = {
  // 1節: 運動の表し方
  '1-1': { name: '速度と時間と変位', gens: [probVelocity, probUniform] },
  '1-2': { name: '等速直線運動',     gens: [probUniform] },
  '1-3': { name: '等加速度運動',     gens: [probAccelV, probAccelX] },
  '1-4': { name: '自由落下',         gens: [probFreeFall] },
  '1-5': { name: '鉛直投げおろし',   gens: [probVerticalDown] },
  '1-6': { name: '鉛直投げ上げ',     gens: [probThrowUpV, probThrowUpMaxT] },
  // 2節: 力と運動の法則
  '2-1': { name: '力の合成・分解',   gens: [probForceAdd, probForceSub, probForceDecomp] },
  '2-2': { name: '力のつりあい',     gens: [probEquilNormal, probEquil3] },
  '2-3': { name: '運動方程式',       gens: [probEqAccel, probEqForce, probEqMass] },
  '2-4': { name: '摩擦力',           gens: [probFriction, probStaticFriction] },
  '2-5': { name: '圧力と浮力',       gens: [probPressure, probBuoyancy] },
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

function drawUniform(ctx, t, p) {
  const prog = (t%2.8)/2.8;
  ctx.fillStyle='#eef2f7'; ctx.fillRect(0,0,W,H); drawGround(ctx);
  const bx=26+prog*(W-52), by=GY-16;
  drawBall(ctx,bx,by,14,'#34467e');
  const ae=bx+55; if(ae<W-10){arrow(ctx,bx+14,by,ae,by,'#ff6b35'); txt(ctx,'v',ae+4,by+4,'#ff6b35',13,true);}
  txt(ctx,`v = ${p.v} m/s（一定）`,14,18,'#34467e',12,true);
}

function drawAccel(ctx, t, p) {
  const {v0,a} = p, at=t%3.2;
  const maxX=v0*3.2+.5*a*3.2*3.2, scale=Math.min((W-60)/Math.max(maxX,1),4);
  const bx=Math.min(26+(v0*at+.5*a*at*at)*scale,W-26), by=GY-16;
  ctx.fillStyle='#eef2f7'; ctx.fillRect(0,0,W,H); drawGround(ctx);
  drawBall(ctx,bx,by,14,'#34467e');
  const al=Math.min(Math.max((v0+a*at)*3.5,6),85);
  if(bx+al+14<W-8) arrow(ctx,bx+14,by,bx+14+al,by,'#ff6b35');
  txt(ctx,`a = ${a} m/s²（加速中）`,14,18,'#27ae60',12,true);
  txt(ctx,`v₀ = ${v0} m/s`,14,34,'#34467e',11);
}

function drawFall(ctx, t, p) {
  const at=t%3.0, g=9.8;
  const scale=Math.min((H-55)/Math.max(.5*g*9,1),1.5);
  const bx=W/2, by=Math.min(18+.5*g*at*at*scale,H-22);
  ctx.fillStyle='#eef2f7'; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.setLineDash([5,4]); ctx.strokeStyle='#b8c1d4'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(bx-24,18); ctx.lineTo(bx+24,18); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  for(let i=1;i<=3;i++){const tt=at-i*.22; if(tt>0){ctx.globalAlpha=.18*(4-i)/3; drawBall(ctx,bx,Math.min(18+.5*g*tt*tt*scale,H-22),12-i*2,'#34467e');}}
  ctx.globalAlpha=1;
  drawBall(ctx,bx,by,14,'#34467e');
  const al=Math.min(g*at*1.8,44); if(al>5&&by+14+al<H-4) arrow(ctx,bx,by+14,bx,by+14+al,'#ff6b35');
  txt(ctx,'g = 9.8 m/s² ↓',W-128,18,'#27ae60',12,true);
}

function drawThrowUp(ctx, t, p) {
  const {v0} = p, g=9.8;
  const tMax=v0/g, period=tMax*2+0.8;
  const at=t%period;
  const scale=Math.min((GY-30)/Math.max(v0*v0/(2*g),1),3);
  const y_phys=at<=tMax*2 ? v0*at-.5*g*at*at : 0;
  const v_phys=at<=tMax*2 ? v0-g*at : 0;
  const bx=W/2, by=GY-16-Math.max(0,y_phys)*scale;

  ctx.fillStyle='#eef2f7'; ctx.fillRect(0,0,W,H); drawGround(ctx);
  // 最高点の破線
  const topY=GY-16-(v0*v0/(2*g))*scale;
  ctx.save(); ctx.setLineDash([5,4]); ctx.strokeStyle='#b8c1d4'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(bx-30,topY); ctx.lineTo(bx+30,topY); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  txt(ctx,'最高点',bx+20,topY+4,'#aaa',10);

  drawBall(ctx,bx,by,14,'#34467e');
  const al=Math.min(Math.abs(v_phys)*2,44);
  if(al>4){
    if(v_phys>0) arrow(ctx,bx,by-14,bx,by-14-al,'#ff6b35');  // 上向き
    else if(v_phys<0) arrow(ctx,bx,by+14,bx,by+14+al,'#ff6b35');  // 下向き
  }
  txt(ctx,`v₀ = ${v0} m/s ↑`,14,18,'#34467e',12,true);
  txt(ctx,'g = 9.8 m/s² ↓',14,34,'#27ae60',12,true);
}

function drawForceAdd(ctx, t, p) {
  const { f1, f2 } = p;
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H); drawGround(ctx);
  const bw = 52, bh = 42, bx = W / 2 - bw / 2, by = GY - bh;
  ctx.save(); ctx.fillStyle = '#34467e';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 4) : ctx.rect(bx, by, bw, bh); ctx.fill();
  ctx.strokeStyle = '#22305a'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  // 右向き矢印 F1
  const len1 = Math.min(f1 * 2.5, 90);
  arrow(ctx, bx + bw + 4, by + bh / 2, bx + bw + 4 + len1, by + bh / 2, '#ff6b35');
  txt(ctx, `F₁=${f1}N`, bx + bw + 8, by + bh / 2 - 8, '#ff6b35', 11, true);
  // 右向き矢印 F2
  const len2 = Math.min(f2 * 2.5, 90);
  arrow(ctx, bx - 4 - len2, by + bh / 2, bx - 4, by + bh / 2, '#e74c3c');
  txt(ctx, `F₂=${f2}N`, bx - len2, by + bh / 2 - 8, '#e74c3c', 11, true);
  txt(ctx, `合力 F = ${f1 + f2} N`, 14, 18, '#27ae60', 12, true);
}

function drawForceSub(ctx, t, p) {
  const { f1, f2 } = p;
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H); drawGround(ctx);
  const bw = 52, bh = 42, bx = W / 2 - bw / 2, by = GY - bh;
  ctx.save(); ctx.fillStyle = '#34467e';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 4) : ctx.rect(bx, by, bw, bh); ctx.fill();
  ctx.strokeStyle = '#22305a'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  const len1 = Math.min(f1 * 2.2, 110);
  arrow(ctx, bx + bw + 4, by + bh / 2, bx + bw + 4 + len1, by + bh / 2, '#ff6b35');
  txt(ctx, `→ ${f1}N`, bx + bw + 8, by + bh / 2 - 8, '#ff6b35', 11, true);
  const len2 = Math.min(f2 * 2.2, 110);
  arrow(ctx, bx - 4, by + bh / 2, bx - 4 - len2, by + bh / 2, '#e74c3c');
  txt(ctx, `← ${f2}N`, bx - 4 - len2, by + bh / 2 - 8, '#e74c3c', 11, true);
  txt(ctx, `合力 = ${f1 - f2} N（右向き）`, 14, 18, '#27ae60', 12, true);
}

function drawForceDecomp(ctx, t, p) {
  const { F, deg } = p;
  const rad = deg * Math.PI / 180;
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H); drawGround(ctx);
  const ox = 90, oy = GY - 20;
  const len = Math.min(F * 3, 110);
  arrow(ctx, ox, oy, ox + len * Math.cos(rad), oy - len * Math.sin(rad), '#ff6b35');
  txt(ctx, `F=${F}N`, ox + 6, oy - len * Math.sin(rad) - 8, '#ff6b35', 11, true);
  // 水平成分
  arrow(ctx, ox, oy, ox + len * Math.cos(rad), oy, '#34467e');
  txt(ctx, `Fx`, ox + len * Math.cos(rad) + 4, oy + 4, '#34467e', 11, true);
  // 角度ラベル
  ctx.save(); ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(ox, oy, 28, -rad, 0); ctx.stroke(); ctx.restore();
  txt(ctx, `${deg}°`, ox + 32, oy - 8, '#888', 11);
}

function drawEquil(ctx, t, p) {
  const { m, N } = p;
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H); drawGround(ctx);
  const bw = 52, bh = 42, bx = W / 2 - bw / 2, by = GY - bh;
  ctx.save(); ctx.fillStyle = '#34467e';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 4) : ctx.rect(bx, by, bw, bh); ctx.fill();
  ctx.strokeStyle = '#22305a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'white'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`${m} kg`, bx + bw / 2, by + bh / 2 + 5); ctx.textAlign = 'left'; ctx.restore();
  // 下向き重力
  const gLen = Math.min(N / 3, 50);
  arrow(ctx, bx + bw / 2, by + bh + 2, bx + bw / 2, by + bh + 2 + gLen, '#e74c3c');
  txt(ctx, `mg`, bx + bw / 2 + 4, by + bh + gLen + 4, '#e74c3c', 11, true);
  // 上向き垂直抗力
  arrow(ctx, bx + bw / 2, by - 2, bx + bw / 2, by - 2 - gLen, '#27ae60');
  txt(ctx, `N`, bx + bw / 2 + 4, by - gLen - 6, '#27ae60', 11, true);
  txt(ctx, `静止（つりあい）`, 14, 18, '#34467e', 12, true);
}

function drawFriction(ctx, t, p) {
  const { m, mu } = p, prog = (t % 2.8) / 2.8;
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H); drawGround(ctx);
  const bw = 52, bh = 42, bx = 26 + prog * (W - bw - 52), by = GY - bh;
  ctx.save(); ctx.fillStyle = '#e67e22';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 4) : ctx.rect(bx, by, bw, bh); ctx.fill();
  ctx.strokeStyle = '#ca6f1e'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'white'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`${m} kg`, bx + bw / 2, by + bh / 2 + 5); ctx.textAlign = 'left'; ctx.restore();
  // 進行方向矢印
  arrow(ctx, bx + bw + 4, by + bh / 2, bx + bw + 44, by + bh / 2, '#34467e');
  // 摩擦力（反対向き）
  arrow(ctx, bx - 4, by + bh / 2, Math.max(bx - 44, 8), by + bh / 2, '#e74c3c');
  txt(ctx, `f（摩擦力）`, 8, by + bh / 2 - 8, '#e74c3c', 10, true);
  txt(ctx, `μ' = ${mu}`, 14, 18, '#27ae60', 12, true);
}

function drawPressure(ctx, t, p) {
  const { F } = p;
  ctx.fillStyle = '#eef2f7'; ctx.fillRect(0, 0, W, H);
  // 面
  ctx.save(); ctx.fillStyle = '#aac4e8';
  ctx.fillRect(60, GY - 20, W - 120, 20); ctx.restore();
  // 物体
  const bw = 80, bh = 50, bx = W / 2 - bw / 2, by = GY - 20 - bh;
  ctx.save(); ctx.fillStyle = '#34467e';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 4) : ctx.rect(bx, by, bw, bh); ctx.fill();
  ctx.restore();
  // 下向き力
  const fLen = Math.min(F / 5, 50);
  arrow(ctx, W / 2, by - 6, W / 2, by - 6 - fLen, '#ff6b35');
  txt(ctx, `F=${F}N`, W / 2 + 6, by - 10, '#ff6b35', 11, true);
  txt(ctx, `P = F ÷ S`, 14, 18, '#34467e', 12, true);
}

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
// アニメーションループ
// ========================================

function draw(ts) {
  if (!current) return;
  if (!t0) t0 = ts;
  const t = (ts - t0) / 1000;
  const ctx = document.getElementById('canvas').getContext('2d');
  switch(current.anim) {
    case 'uniform':      drawUniform(ctx,t,current.ap);      break;
    case 'accel':        drawAccel(ctx,t,current.ap);        break;
    case 'fall':         drawFall(ctx,t,current.ap);         break;
    case 'throw-up':     drawThrowUp(ctx,t,current.ap);      break;
    case 'newton':       drawNewton(ctx,t,current.ap);       break;
    case 'force-add':    drawForceAdd(ctx,t,current.ap);     break;
    case 'force-sub':    drawForceSub(ctx,t,current.ap);     break;
    case 'force-decomp': drawForceDecomp(ctx,t,current.ap);  break;
    case 'equil':        drawEquil(ctx,t,current.ap);        break;
    case 'friction':     drawFriction(ctx,t,current.ap);     break;
    case 'pressure':     drawPressure(ctx,t,current.ap);     break;
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

  if (mode === 'test') {
    // テストモード：答え欄1つ ＋ メモ欄
    const r = current.result;
    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
      <span class="input-label">${r.variable} =</span>
      <input type="number" class="answer-input" id="inp-result"
             placeholder="?" inputmode="decimal" step="any" autocomplete="off">
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
             placeholder="?" inputmode="decimal" step="any" autocomplete="off">
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
             placeholder="?" inputmode="decimal" step="any" autocomplete="off">
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
  document.getElementById('formula').textContent = current.formula;
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
    const ok  = Math.abs(val - current.result.value) <= 0.05 * Math.max(Math.abs(current.result.value), 1) + 0.05;
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

function showResult() {
  saveProgress();
  playFanfare();
  stopAnim();
  document.getElementById('problem-view').style.display = 'none';
  document.getElementById('result-view').style.display = 'block';
  const pct = score / TOTAL;
  let title, msg;
  if      (pct >= .9) { title='完璧！すごい！';   msg=`${score}問正解！この単元はバッチリですね！`;        rika('happy', 'すごすぎる！ わたしも見習わなきゃ！'); }
  else if (pct >= .7) { title='よくできました！'; msg=`${score}問正解！あと少しで満点です！`;            rika('confident', 'いい感じ！ 次は満点ねらっちゃおう！'); }
  else if (pct >= .5) { title='もう少し！';       msg=`${score}問正解。もう一度公式を確認して再挑戦！`; rika('idea', '公式を見直したら、きっとのびるよ！'); }
  else                { title='頑張ろう！';        msg=`${score}問正解。くり返し練習しよう！`;          rika('oops', 'わたしも最初はまちがえてばっかりだったよ。もう一回やろう！'); }
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-score-num').textContent = score;
  document.getElementById('result-msg').textContent = msg;
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

document.addEventListener('DOMContentLoaded', () => {
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
