/* わくわく物理基礎 ストーリーモード
   第5話「記録テープの暗号」（新編物理基礎 1編1章 5 速度が変わる運動）

   書き方は第6話（ep06.js）と同じ。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
*/
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = ' font-family="Zen Maru Gothic" font-weight="700"';
let uid = 0;

/* ---- 絵を描くための道具（第1章の各話で共通） ---- */
function svg(inner, bg){
  return '<svg class="scene" viewBox="0 0 400 300" aria-hidden="true"><rect width="400" height="300" fill="' + (bg || '#fff') + '"/>' + inner + '</svg>';
}
function T(x, y, s, size, fill, anchor, extra){
  return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || '#1f2638') + '" text-anchor="' + (anchor || 'middle') + '"' + F + (extra || '') + '>' + s + '</text>';
}
// アニメ：dur 秒かけて draw(root, t) をくり返し呼ぶ。「もう一度見る」ボタンつき
function anim(html, dur, draw, label){
  const id = 'ep05a' + (++uid);
  setTimeout(() => {
    const root = document.getElementById(id);
    if (!root) return;
    let raf = 0;
    const btn = document.createElement('button');
    btn.className = 'replay'; btn.textContent = label || 'もう一度見る';
    root.parentNode.appendChild(btn);
    function play(){
      cancelAnimationFrame(raf);
      if (reduce){ draw(root, dur); return; }
      const t0 = performance.now() + 450;
      draw(root, 0);
      const f = now => {
        if (!root.isConnected) return;
        const t = Math.min(dur, Math.max(0, (now - t0) / 1000));
        draw(root, t);
        if (t < dur) raf = requestAnimationFrame(f);
      };
      raf = requestAnimationFrame(f);
    }
    btn.onclick = e => { e.stopPropagation(); play(); };
    play();
  }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
// 答え合わせの絵（第6話の answer と同じ形）
function answerCard(word, sub, size){
  return (sc, EP, answers) => {
    const ch = EP.scenes.find(x => x.choice && x.choice.id === sc.reveal).choice;
    const mine = ch.options.find(o => o.key === answers[sc.reveal]);
    return svg('') +
      '<div class="answer-word"' + (size ? ' style="font-size:' + size + '"' : '') + '>' + word + '</div>' +
      '<div class="answer-sub">' + sub + '</div>' +
      '<div class="your-guess">あなたの予想：' + (mine ? mine.label : '—') + '</div>';
  };
}
const SKY = '<defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky1)"/>';

/* ---- この話の絵 ---- */
// 台車の位置 s（cm）：0.1秒ごとの間隔が 2, 4, 6, 8, 10 cm になる動き
// s = 10t + 100t²（初めの速さ 0.1 m/s、加速度 2 m/s²）。s(0.1)=2, s(0.2)=6, s(0.3)=12, s(0.4)=20, s(0.5)=30
const pos = t => 10 * t + 100 * t * t;
const CM = 8;                                    // 1 cm = 8 px
function tape(x0, y, n, showQ, hi){
  // n 個目の区間まで点を打つ
  let s = '<rect x="' + (x0 - 8) + '" y="' + (y - 14) + '" width="' + (30 * CM + 16) + '" height="28" fill="#fff7e9" stroke="#e9c48f" stroke-width="2"/>';
  for (let k = 0; k <= n; k++){
    const x = x0 + pos(k / 10) * CM;
    s += '<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="3.5" fill="#1f2638"/>';
    if (k > 0){
      const xm = x0 + (pos((k - 1) / 10) + pos(k / 10)) / 2 * CM;
      s += T(xm.toFixed(1), y + 32, 2 * k, 13, k === hi ? '#d93a3f' : '#7e5129');
    }
  }
  if (showQ && n === 4) s += T((x0 + 25 * CM).toFixed(1), y + 32, '？', 15, '#d93a3f');
  return s + T(x0 + 30 * CM + 8, y + 32, 'cm', 11, '#6b7488', 'end');
}
// 斜面を下る台車と、テープ
const SL = { y: 64, ang: 18 };                  // 斜面の上の端の高さと、傾き（度）
function slopeCart(X){
  const c = Math.cos(SL.ang * Math.PI / 180), s = Math.sin(SL.ang * Math.PI / 180), L = 250;
  return '<path d="M' + (X - 10) + ' ' + (SL.y + 14) + ' L' + (X - 10 + L * c) + ' ' + (SL.y + 14 + L * s) + ' H' + (X - 10) + 'z" fill="#d6dce6"/>' +
    '<line x1="' + (X - 10) + '" y1="' + (SL.y + 14) + '" x2="' + (X - 10 + L * c) + '" y2="' + (SL.y + 14 + L * s) + '" stroke="#7e5129" stroke-width="4"/>' +
    '<g data-cart><g transform="rotate(' + SL.ang + ')"><rect x="-2" y="-4" width="28" height="14" rx="3" fill="#d93a3f"/><circle cx="4" cy="12" r="4" fill="#59616f"/><circle cx="20" cy="12" r="4" fill="#59616f"/></g></g>';
}
// X：斜面とテープの左端（ニュートンくんが左なら右に寄せ、リカが右なら左に寄せる）
const slopeScene = X => () => anim(svg(slopeCart(X) + '<g data-tape></g>' + T(X + 120, 250, '0.1秒ごとに打った点', 12, '#6b7488'), '#eef2f7'),
  3.2, (root, t) => {
    const tt = t / 8;                              // 8倍ゆっくり（0〜0.4秒）
    const d = pos(tt) * CM * 0.7;                  // 斜面の上では 0.7 倍に縮めて描く
    const c = Math.cos(SL.ang * Math.PI / 180), s = Math.sin(SL.ang * Math.PI / 180);
    root.querySelector('[data-cart]').setAttribute('transform', 'translate(' + (X + d * c).toFixed(1) + ',' + (SL.y + d * s - 8).toFixed(1) + ')');
    root.querySelector('[data-tape]').innerHTML = tape(X + 4, 196, Math.floor(tt * 10 + 1e-6), t >= 3.2);
  }, 'もう一度走らせる');
SCENES['e5-slope'] = slopeScene(144);
SCENES['e5-slope-r'] = slopeScene(20);

// テープの続き：5つ目の間隔は 10 cm
function tapeScene(x0, animated){
  const html = svg('<g data-tape></g>' + T(x0 + 120, 150, '0秒', 18, '#1f2638', 'middle', ' data-time') +
    T(x0 + 120, 176, '数字は0.1秒ごとの間隔（cm）', 12, '#6b7488'), '#eef2f7');
  const draw = (root, t) => {
    const tt = Math.min(0.5, t / 6);               // 12倍ゆっくり（0〜0.5秒）
    root.querySelector('[data-tape]').innerHTML = tape(x0, 70, Math.floor(tt * 10 + 1e-6), false, 5);
    root.querySelector('[data-time]').textContent = tt.toFixed(2) + '秒';
  };
  if (animated) return anim(html, 3, draw, 'もう一度打つ');
  const id = 'ep05s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, 3); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
SCENES['e5-tape'] = () => tapeScene(20, true);
SCENES['e5-tape-still'] = () => tapeScene(144, false);

// v-t グラフ（右側）。t：0〜0.4 s、v：0〜1.0 m/s
const G = { x: 176, y: 52, w: 192, h: 168 };
const gx = t => G.x + G.w * t / 0.4, gy = v => G.y + G.h - G.h * v / 1.0;
function vtPaper(){
  let s = '<rect x="' + (G.x - 34) + '" y="' + (G.y - 26) + '" width="' + (G.w + 56) + '" height="' + (G.h + 62) + '" rx="6" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>';
  for (let k = 1; k <= 4; k++) s += '<line x1="' + gx(k / 10) + '" x2="' + gx(k / 10) + '" y1="' + G.y + '" y2="' + (G.y + G.h) + '" stroke="#eef2f7" stroke-width="1.5"/>' + T(gx(k / 10), G.y + G.h + 15, (k / 10).toFixed(1), 10, '#6b7488');
  for (let k = 2; k <= 10; k += 2) s += '<line x1="' + G.x + '" x2="' + (G.x + G.w) + '" y1="' + gy(k / 10) + '" y2="' + gy(k / 10) + '" stroke="#eef2f7" stroke-width="1.5"/>' + T(G.x - 4, gy(k / 10) + 4, (k / 10).toFixed(1), 10, '#6b7488', 'end');
  return s + '<path d="M' + G.x + ' ' + (G.y - 6) + ' V' + (G.y + G.h) + ' H' + (G.x + G.w + 6) + '" fill="none" stroke="#1f2638" stroke-width="2"/>' +
    T(G.x - 4, G.y + G.h + 15, '0', 10, '#6b7488', 'end') + T(G.x + G.w / 2, G.y + G.h + 31, '時間 t〔s〕', 12, '#6b7488') +
    '<rect x="' + (G.x + 4) + '" y="' + (G.y + 2) + '" width="86" height="18" fill="#fff"/>' + T(G.x + 8, G.y + 15, '速さ v〔m/s〕', 12, '#6b7488', 'start');
}
// 各区間の平均の速さ（2÷0.1=20 cm/s=0.2 m/s …）を区間のまん中の時刻に打つ
const PTS = [[0.05, 0.2], [0.15, 0.4], [0.25, 0.6], [0.35, 0.8]];
SCENES['e5-vt'] = () => anim(svg(vtPaper() +
  '<line data-line x1="' + gx(0) + '" y1="' + gy(0.1) + '" x2="' + gx(0.4) + '" y2="' + gy(0.9) + '" stroke="#d93a3f" stroke-width="3" opacity="0"/>' +
  PTS.map((p, k) => '<circle data-p="' + k + '" cx="' + gx(p[0]) + '" cy="' + gy(p[1]) + '" r="6" fill="#22305a" opacity="0"/>' +
    T(gx(p[0]) - 10, gy(p[1]) - 10, p[1].toFixed(1), 11, '#22305a', 'end', ' data-pl="' + k + '" opacity="0"')).join('') +
  '<g data-tri opacity="0"><path d="M' + gx(0.15) + ' ' + gy(0.4) + ' H' + gx(0.25) + ' V' + gy(0.6) + '" fill="none" stroke="#7e5129" stroke-width="2" stroke-dasharray="4 3"/>' +
    T(gx(0.2), gy(0.4) + 16, '0.1 s', 11, '#7e5129') + T(gx(0.25) + 6, gy(0.5) + 4, '0.2 m/s', 11, '#7e5129', 'start') + '</g>', '#eef2f7'),
  2.6, (root, t) => {
    PTS.forEach((p, k) => {
      const on = t >= 0.4 * (k + 1) ? 1 : 0;
      root.querySelector('[data-p="' + k + '"]').setAttribute('opacity', on);
      root.querySelector('[data-pl="' + k + '"]').setAttribute('opacity', on);
    });
    root.querySelector('[data-line]').setAttribute('opacity', t >= 2.0 ? 1 : 0);
    root.querySelector('[data-tri]').setAttribute('opacity', t >= 2.6 ? 1 : 0);
  }, 'もう一度打つ');

// 等加速度直線運動の3つの式
SCENES['e5-formula'] = () => svg(
  '<rect x="150" y="30" width="236" height="196" rx="8" fill="#2f5b4e" stroke="#7e5129" stroke-width="8"/>' +
  T(268, 62, '加速度が一定のとき', 13, '#ffd6d7') +
  '<text x="268" y="106" text-anchor="middle" font-size="22" fill="#fff" font-family="Times New Roman" font-style="italic">v = v₀ + at</text>' +
  '<text x="268" y="152" text-anchor="middle" font-size="22" fill="#fff" font-family="Times New Roman" font-style="italic">x = v₀t + ½at²</text>' +
  '<text x="268" y="198" text-anchor="middle" font-size="22" fill="#fff" font-family="Times New Roman" font-style="italic">v² − v₀² = 2ax</text>' +
  '<rect y="252" width="400" height="48" fill="#d6dce6"/>', '#eef2f7');

// 台形の面積 ＝ 変位：(0.1 + 0.9) ÷ 2 × 0.4 = 0.2 m = 20 cm（2+4+6+8）
SCENES['e5-area'] = () => svg(vtPaper() +
  '<style>@keyframes e5glow{0%,100%{opacity:.25}50%{opacity:.6}}.e5-area{animation:e5glow 1.6s ease-in-out infinite}@media (prefers-reduced-motion: reduce){.e5-area{animation:none;opacity:.4}}</style>' +
  '<path class="e5-area" d="M' + gx(0) + ' ' + gy(0) + ' V' + gy(0.1) + ' L' + gx(0.4) + ' ' + gy(0.9) + ' V' + gy(0) + 'z" fill="#ffe14a"/>' +
  '<line x1="' + gx(0) + '" y1="' + gy(0.1) + '" x2="' + gx(0.4) + '" y2="' + gy(0.9) + '" stroke="#d93a3f" stroke-width="3"/>' +
  T(gx(0.25), gy(0.18), '面積 ＝ 変位', 14, '#7e5129') + T(gx(0.25), gy(0.06), '20 cm', 13, '#7e5129'), '#eef2f7');

SCENES['e5-answer'] = answerCard('10 cm！', '次の間隔は', 'clamp(30px,10vw,48px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '05',
  chapter: '1章 直線運動の世界',
  topic: '速度が変わる運動',
  title: '記録テープの暗号',
  simUrl: '../sim/inclined-plane.html',
  drillUrl: '../physics/drill.html?unit=1-3',
  scenes: [
    { bg: 'title' },

    { bg: 'e5-slope', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '斜面を下る台車が、記録テープに0.1秒ごとに点を打っていったぞ。' },

    /* ---- 謎と予想 ---- */
    { bg: 'e5-slope', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'このテープには暗号が隠れておる。次の間隔は何cmじゃと思う？',
      choice: {
        id: 'q1',
        options: [
          { key: 'c8', label: '8 cm' },
          { key: 'c10', label: '10 cm' },
          { key: 'c16', label: '16 cm' }
        ],
        answer: 'c10'
      } },

    { bg: 'e5-slope-r', chars: [{ who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        c8:  { face: 'confident', text: '8 cm！ 同じ間隔が続くんじゃない？' },
        c10: { face: 'idea',      text: '2、4、6、8…って、2 cmずつ増えてる！ だから10 cm！' },
        c16: { face: 'confident', text: '4の次が8で2倍だから、16 cm…でしょ？' }
      } } },

    { bg: 'e5-slope', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        c8:  { face: 'think',    text: 'ふむ、台車の速さは同じかな？ では、続きを打ってみよう。' },
        c10: { face: 'proud',    text: 'ほう、よく見ておるな。では、続きを打ってみよう。' },
        c16: { face: 'question', text: 'ほう、大胆な予想じゃな。では、続きを打ってみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e5-tape', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        c8:  { face: 'surprise', text: 'え、そうなの？ 次は10 cm！ 2、4、6、8、10…2 cmずつ増えてる！' },
        c10: { face: 'happy',    text: 'やった、10 cm！ 2、4、6、8、10…2 cmずつ増えてる！' },
        c16: { face: 'surprise', text: 'え、そうなの？ 16じゃなくて10 cm。2 cmずつ増えてる！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e5-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 間隔は2 cmずつ増えるので、次は10 cmじゃ。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「10 cm」。間隔は2 cmずつ増えておるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e5-tape-still', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'よく気づいた。間隔が広がるのは、速くなっている証拠じゃ。' },

    { bg: 'e5-vt', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '各区間の平均の速さは 0.2、0.4、0.6、0.8 m/s。v-tグラフに点を打つと、まっすぐ並ぶ。' },

    { bg: 'e5-vt', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '0.1秒ごとに0.2 m/sずつ速くなっている。1秒あたりの速度の変化が『加速度』じゃ。' },

    { bg: 'e5-vt', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: 'a = 0.2 ÷ 0.1 = 2 m/s²。単位は m/s²、メートル毎秒毎秒じゃ。' },

    { bg: 'e5-vt', chars: [{ who: 'rika', face: 'question', side: 'left' }],
      speaker: 'rika', text: '加速度がずっと同じだと、式にできる？' },

    { bg: 'e5-formula', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'できるとも。この3つが、この章の主役じゃ。' },

    { bg: 'e5-area', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: 'v-tグラフの下の台形を見てごらん。面積が変位になるのは、第3話と同じじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '斜面の角度を変えるとテープはどうなる？ 実験してみよう。',
      points: [
        '加速度 ＝ 速度の変化 ÷ かかった時間',
        '加速度の単位は m/s²（メートル毎秒毎秒）',
        '間隔が一定の割合で増える ＝ 加速度が一定'
      ] }
  ]
};
})();
