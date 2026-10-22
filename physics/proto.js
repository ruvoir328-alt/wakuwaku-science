/* ================================
   わくわく物理基礎 - チャレンジモード 試作版（drill-proto.html 用）
   本物の app.js を読みこんだあとに、このファイルで上書きする。
   1. 問題の動く絵を、ストーリー・シミュと同じ色・キャラで描く
   2. 1章（1-1〜1-8）の問題文を、ストーリーの場面にそろえる
   3. メダル・トロフィーをとったときのアニメとジングル
   ※ 本物（drill.html・app.js）は変えていない
   ================================ */

const PROTO_REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- 色（ストーリー・シミュと同じもの）----
const PC = {
  coat: '#22305a', apple: '#d93a3f', ink: '#1f2638', muted: '#6b7488', line: '#dfe4ee',
  cream: '#fff7e9', creamLine: '#e9c48f', wood: '#b47a44', woodDark: '#7e5129',
  grass: '#86bb66', sky1: '#bfe2f6', sky2: '#e9f6fc', rail: '#9aa9b8', gray: '#d6dce6',
  lemon: '#ffe14a', wheel: '#59616f', win: '#dfe4ee'
};

// ---- 単元と話の対応（ストーリーの場面）----
const PROTO_EP = {
  '1-1': [1, 'どっちが速い？'], '1-2': [3, 'グラフがまっすぐになる運動'], '1-3': [5, '記録テープの暗号'],
  '1-4': [6, '重いほうが先に落ちる？'], '1-5': [7, 'てっぺんで、リンゴは止まる？'], '1-6': [7, 'てっぺんで、リンゴは止まる？'],
  '1-7': [4, '電車の中で走ると？'], '1-8': [8, '横に投げたら、遅く落ちる？']
};

// ========================================
// 1章の問題（ストーリーの場面にそろえる）
// 数値は場面に合うはんいにした（自転車は 2〜8 m/s、動く歩道は 1〜3 m/s など）
// ========================================

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

// 1章の単元の問題を入れかえる（activeGens は unitMap の配列と同じものなので、中身を入れかえる）
(function swapGens() {
  const NEW = {
    '1-1': [probRaceSpeed, probRaceDist], '1-2': [probWalkway], '1-3': [probCartV, probCartX],
    '1-4': [probAppleDrop], '1-5': [probAppleDown], '1-6': [probAppleUpV, probAppleUpTop]
  };
  for (const id in NEW) unitMap[id].gens.splice(0, unitMap[id].gens.length, ...NEW[id]);
  // 1-7・1-8 は問題はそのまま、動く絵だけ試作版にする
  const ANIM = { train: 'p-train', hthrow: 'p-table' };
  ['1-7', '1-8'].forEach(id => {
    unitMap[id].gens.forEach((g, i, arr) => { arr[i] = () => { const q = g(); q.anim = ANIM[q.anim] || q.anim; return q; }; });
  });
})();

// ========================================
// 動く絵（ストーリー・シミュと同じ色・キャラ）
// canvas は 2 倍の細かさで描く（400 × 160 の座標で書く）
// ========================================

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

const PROTO_DRAW = { 'p-race': pRace, 'p-walk': pWalk, 'p-slope': pSlope, 'p-drop': pDrop, 'p-up': pUp, 'p-train': pTrain, 'p-table': pTable };

// 本物の draw を、試作版の絵も描けるように上書きする
const protoOrigDraw = draw;
draw = function (ts) {
  if (!current) return;
  const cv = document.getElementById('canvas');
  if (cv.width !== W * 2) { cv.width = W * 2; cv.height = H * 2; }
  const ctx = cv.getContext('2d');
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  const f = PROTO_DRAW[current.anim];
  if (!f) return protoOrigDraw(ts);                          // 2章などは今までの絵
  if (!t0) t0 = ts;
  const t = PROTO_REDUCE ? 99 : (ts - t0) / 1000;            // 動きを減らす設定では、とちゅうの形を止めて見せる
  f(ctx, PROTO_REDUCE ? 2.4 : t, current.ap);
  animId = requestAnimationFrame(draw);
};

// ========================================
// メダル・トロフィー
// ========================================

// ジングル（効果音のミュートには従う）
function protoJingle(kind) {
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
  if (PROTO_REDUCE) return;
  const colors = ['#d93a3f', '#22305a', '#ffe14a', '#e9c48f', '#3f9a5c'];
  for (let i = 0; i < 36; i++) {
    const c = document.createElement('i');
    c.className = 'proto-confetti';
    c.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};` +
      `animation-delay:${Math.random() * .5}s;animation-duration:${1.6 + Math.random()}s;--dx:${(Math.random() - .5) * 80}px;--r:${Math.random() * 720}deg`;
    card.appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
}

// 結果画面を上書き：前の記録とくらべて、はじめてのメダル・トロフィーなら演出する
showResult = function () {
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
  if (score === TOTAL) { kind = 'trophy'; label = prev.perfect ? 'トロフィー（もう持っている）' : 'トロフィー ゲット！'; sub = '全問正解のしるし'; }
  else if (score > 0)  { kind = 'medal';  label = prev.bestScore ? (score > prev.bestScore ? 'ベスト記録 更新！' : 'メダル（もう持っている）') : 'メダル ゲット！'; sub = 'ベスト ' + Math.max(score, prev.bestScore) + ' / 10'; }
  const isNew = kind === 'trophy' ? !prev.perfect : kind === 'medal' ? (!prev.bestScore || score > prev.bestScore) : false;

  const card = document.querySelector('.result-card');
  card.querySelector('.proto-award') && card.querySelector('.proto-award').remove();
  if (kind) {
    const box = document.createElement('div');
    box.className = 'proto-award ' + kind + (isNew ? ' new' : '');
    box.innerHTML = `<div class="proto-badge">${medalSVG(kind)}</div><div class="proto-award-label">${label}</div><div class="proto-award-sub">${sub}</div>`;
    card.insertBefore(box, card.querySelector('.result-msg').nextSibling);
    if (isNew) { confetti(card); protoJingle(kind); } else playFanfare();
  } else playFanfare();
};

// ========================================
// ページの準備：話へのリンク、戻り先を試作版の一覧に
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const ep = unitId && PROTO_EP[unitId];
  if (ep) {
    const chip = document.createElement('a');
    chip.className = 'proto-story';
    chip.href = '../story/index.html?ep=0' + ep[0];
    chip.innerHTML = `<img src="../story/img/newton_question.webp" alt="" width="26" height="26">第${ep[0]}話「${ep[1]}」の問題<span>ストーリーを見る ›</span>`;
    const card = document.querySelector('#problem-view .card');
    card.parentNode.insertBefore(chip, card);
  }
  document.querySelectorAll('a[href="index.html"]').forEach(a => { a.href = 'index-proto.html'; });
});
