/* わくわく物理基礎 ストーリーモード
   第16話「すべり出すのは、いつ？」（新編物理基礎 1編2章 まさつ力）

   書き方は第6話（ep06.js）と同じ。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
   数値は sim/friction.html とそろえる：本 2.0 kg、μ = 0.50、μ' = 0.25
*/
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = ' font-family="Zen Maru Gothic" font-weight="700"';
let uid = 0;

/* ---- 絵を描くための道具（第1章の各話と同じ） ---- */
function svg(inner, bg){
  return '<svg class="scene" viewBox="0 0 400 300" aria-hidden="true"><rect width="400" height="300" fill="' + (bg || '#fff') + '"/>' + inner + '</svg>';
}
function T(x, y, s, size, fill, anchor, extra){
  return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || '#1f2638') + '" text-anchor="' + (anchor || 'middle') + '"' + F + (extra || '') + '>' + s + '</text>';
}
// アニメ：dur 秒かけて draw(root, t) をくり返し呼ぶ。「もう一度見る」ボタンつき
function anim(html, dur, draw, label){
  const id = 'ep16a' + (++uid);
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
// 矢印（x1,y1 → x2,y2）。力の色：重力＝紺、人が押す力＝赤、垂直抗力＝木、まさつ力＝#b47a44
function arrow(x1, y1, x2, y2, color, w, extra){
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 2) return '';
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(12, L * 0.6);
  const bx = x2 - ux * h, by = y2 - uy * h;
  return '<g' + (extra || '') + '><line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - ux * h * 0.8).toFixed(1) + '" y2="' + (y2 - uy * h * 0.8).toFixed(1) + '" stroke="' + color + '" stroke-width="' + (w || 5) + '" stroke-linecap="round"/>' +
    '<path d="M' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + (bx - uy * h * 0.6).toFixed(1) + ' ' + (by + ux * h * 0.6).toFixed(1) + ' L' + (bx + uy * h * 0.6).toFixed(1) + ' ' + (by - ux * h * 0.6).toFixed(1) + 'z" fill="' + color + '"/></g>';
}

/* ---- この話の絵 ---- */
// 机の上の本 2.0 kg：垂直抗力 N = 2.0 × 9.8 = 19.6 N
// 静止摩擦係数 μ = 0.50 → 最大摩擦力 μN = 9.8 N。動摩擦係数 μ' = 0.25 → 動摩擦力 μ'N = 4.9 N
// 押す力・まさつ力の矢印は 1 N = 10 px（ramp の絵だけ 6 px）
const MU = 0.50, MU2 = 0.25, NN = 2.0 * 9.8;
function desk(x0, x1, y){
  return '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="12" rx="3" fill="#b47a44"/>' +
    '<rect x="' + (x0 + 14) + '" y="' + (y + 12) + '" width="10" height="' + (288 - y) + '" fill="#7e5129"/>' +
    '<rect x="' + (x1 - 24) + '" y="' + (y + 12) + '" width="10" height="' + (288 - y) + '" fill="#7e5129"/>';
}
function book(x, y, w, h){
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#22305a"/>' +
    '<rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="' + (w - 8) + '" height="' + (h - 8) + '" rx="2" fill="none" stroke="#ffe14a" stroke-width="1.5"/>' +
    T(x + w / 2, y + h / 2 + 5, '本 2.0 kg', 12, '#fff');
}

// 謎：4.0 N で押しても、本は動かない。まさつ力は？
SCENES['e16-desk'] = () => svg(
  desk(100, 310, 200) + book(178, 160, 76, 40) +
  arrow(134, 180, 176, 180, '#d93a3f', 5) + T(150, 166, 'F 4.0 N', 13, '#d93a3f') +
  T(216, 230, 'まさつ力 f ＝ ？', 13, '#b47a44') +
  T(210, 40, '静止摩擦係数 μ = 0.50', 13, '#4b5568') + T(210, 60, '押しても、まだ動かない', 12, '#6b7488'),
  '#eef2f7');

// 押す力 F と静止摩擦力 f がつりあう（4.0 N と 4.0 N）
function balance(animated){
  const html = svg(
    desk(0, 290, 200) + book(110, 160, 76, 40) +
    '<g data-a></g>' + T(145, 250, '', 14, '#7e5129', 'middle', ' data-msg') + T(10, 24, '右向きを正とする', 11, '#6b7488', 'start'),
    '#eef2f7');
  const draw = (root, t) => {
    const p = Math.min(1, t / 1.5), L = 40 * p;
    root.querySelector('[data-a]').innerHTML =
      arrow(108 - L, 180, 108, 180, '#d93a3f', 5) + (p > 0.3 ? T(80, 166, 'F ' + (4 * p).toFixed(1) + ' N', 13, '#d93a3f') : '') +
      arrow(148, 206, 148 - L, 206, '#b47a44', 5) + (p > 0.3 ? T(176, 222, 'f ' + (4 * p).toFixed(1) + ' N', 13, '#b47a44', 'start') : '');
    root.querySelector('[data-msg]').textContent = p >= 1 ? 'つりあい → 動かない' : '';
  };
  if (animated) return anim(html, 2, draw, 'もう一度押す');
  const id = 'ep16s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, 2); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
SCENES['e16-balance'] = () => balance(true);
SCENES['e16-balance-still'] = () => balance(false);

// 押す力を強くしていく。9.8 N をこえると、すべり出して 4.9 N に
// 上：机と本（F は 1 N = 6 px）。下：グラフ（横 F 0〜12 N、たて f 0〜12 N）
const GR = { x: 176, y: 276, w: 200, h: 120 };
const gX = F => GR.x + GR.w * F / 12, gY = f => GR.y - GR.h * f / 12;
SCENES['e16-ramp'] = () => anim(svg(
  desk(140, 400, 112).replace(/height="\d+" fill="#7e5129"/g, 'height="22" fill="#7e5129"') +
  '<g data-b></g>' +
  '<rect x="' + (GR.x - 26) + '" y="' + (GR.y - GR.h - 16) + '" width="' + (GR.w + 40) + '" height="' + (GR.h + 36) + '" rx="6" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>' +
  '<path d="M' + GR.x + ' ' + (GR.y - GR.h - 6) + ' V' + GR.y + ' H' + (GR.x + GR.w + 6) + '" fill="none" stroke="#1f2638" stroke-width="1.5"/>' +
  '<line x1="' + GR.x + '" x2="' + (GR.x + GR.w) + '" y1="' + gY(9.8) + '" y2="' + gY(9.8) + '" stroke="#dfe4ee" stroke-dasharray="4 3"/>' +
  T(GR.x - 4, gY(9.8) + 4, '9.8', 10, '#6b7488', 'end') + T(GR.x - 4, gY(4.9) + 4, '4.9', 10, '#6b7488', 'end') +
  T(GR.x + 4, GR.y - GR.h - 4, 'まさつ力 f〔N〕', 10, '#6b7488', 'start') + T(GR.x + GR.w, GR.y + 12, '押す力 F〔N〕', 10, '#6b7488', 'end') +
  '<path data-g d="" fill="none" stroke="#b47a44" stroke-width="3"/><circle data-pt r="5" fill="#d93a3f"/>' +
  T(392, 60, '', 12, '#7e5129', 'end', ' data-msg'), '#eef2f7'),
  4.5, (root, t) => {
    const Fp = Math.min(11, 4 + 7 * t / 3.5), slip = Fp > MU * NN;
    const ts = (MU * NN - 4) * 3.5 / 7;                                   // すべり出す時刻
    const f = slip ? MU2 * NN : Fp;
    const dx = slip ? Math.min(90, 40 * (t - ts) * (t - ts)) : 0;
    const bx = 250 + dx;
    root.querySelector('[data-b]').innerHTML = book(bx, 78, 60, 34).replace('本 2.0 kg', '本') +
      arrow(bx - 2 - 6 * Fp, 95, bx - 2, 95, '#d93a3f', 4) + T(bx - 8 - 6 * Fp, 99, 'F ' + Fp.toFixed(1) + ' N', 11, '#d93a3f', 'end') +
      arrow(bx + 30, 120, bx + 30 - 6 * f, 120, '#b47a44', 4) + T(bx + 34, 134, 'f ' + f.toFixed(1) + ' N', 11, '#b47a44', 'start');
    let d = 'M' + gX(0) + ' ' + gY(0) + ' L' + gX(Math.min(Fp, MU * NN)) + ' ' + gY(Math.min(Fp, MU * NN));
    if (slip) d += ' L' + gX(MU * NN) + ' ' + gY(MU2 * NN) + ' L' + gX(Fp) + ' ' + gY(MU2 * NN);
    root.querySelector('[data-g]').setAttribute('d', d);
    root.querySelector('[data-pt]').setAttribute('cx', gX(Fp)); root.querySelector('[data-pt]').setAttribute('cy', gY(f));
    root.querySelector('[data-msg]').textContent = slip ? 'すべり出した！ 動摩擦力 4.9 N' : Fp > 9.3 ? 'もうすぐ最大摩擦力 9.8 N…' : '押す力 ＝ 静止摩擦力';
  }, 'もう一度押す');

// すべっているとき：動摩擦力 μ'N = 0.25 × 19.6 = 4.9 N（押す力 7.0 N の例）。W と N は半分の長さ
SCENES['e16-slide'] = () => svg(
  desk(130, 400, 196) + book(246, 156, 76, 40) +
  '<path d="M214 166 h18 M206 178 h26 M214 190 h18" stroke="#6b7488" stroke-width="2" stroke-linecap="round"/>' +
  arrow(170, 176, 244, 176, '#d93a3f', 5) + T(184, 166, 'F 7.0 N', 12, '#d93a3f') +
  arrow(284, 202, 235, 202, '#b47a44', 5) + T(296, 220, "f 4.9 N", 13, '#b47a44', 'start') +
  arrow(300, 156, 300, 108, '#7e5129', 4) + T(308, 120, 'N 19.6 N', 11, '#7e5129', 'start') +
  '<rect x="150" y="26" width="236" height="58" rx="6" fill="#fff7e9" stroke="#e9c48f" stroke-width="2" stroke-dasharray="5 4"/>' +
  T(268, 50, "動摩擦力 μ'N = 0.25 × 19.6 = 4.9 N", 12, '#1f2638') +
  T(268, 72, '押す力をかえても、ほぼ一定', 12, '#7e5129') +
  T(150, 104, '右向きを正とする', 10, '#6b7488', 'start'),
  '#eef2f7');

SCENES['e16-answer'] = answerCard('4.0 N！', '押す力とつりあう', 'clamp(30px,10vw,46px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '16',
  chapter: '2章 力と運動の法則',
  topic: 'まさつ力',
  title: 'すべり出すのは、いつ？',
  simUrl: '../sim/friction.html',
  drillUrl: '../physics/drill.html?unit=2-4',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e16-desk', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: '本は動かない。さて、このとき机が本を止めている『まさつ力』は何 N かな？（静止摩擦係数 0.50）',
      choice: {
        id: 'q1',
        options: [
          { key: 'f0', label: '0 N' },
          { key: 'f4', label: '4.0 N' },
          { key: 'f98', label: '9.8 N' }
        ],
        answer: 'f4'
      } },

    { bg: 'e16-desk', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        f0:  { face: 'confident', text: '動いてないんだから、まさつ力なんて、はたらいてないでしょ？' },
        f4:  { face: 'question',  text: '押す力と同じ 4.0 N…かな？' },
        f98: { face: 'confident', text: 'まさつ力って μN でしょ？ 0.50 × 19.6 = 9.8 N！' }
      } } },

    { bg: 'e16-desk', chars: [{ who: 'newton', face: 'think', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        f0:  { face: 'think',    text: 'ふむ。では、なぜ押しても動かんのかな？ 力の矢印をかいてみよう。' },
        f4:  { face: 'question', text: 'ほう、どうしてそう思った？ 力の矢印で確かめよう。' },
        f98: { face: 'think',    text: '計算はよくできておる。だが、本は止まっておるぞ。力はどうなっているかな？' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e16-balance', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        f0:  { face: 'surprise', text: 'え、そうなの？ 押す力と反対向きに、まさつ力がはたらいてる！' },
        f4:  { face: 'happy',    text: 'やっぱり！ 4.0 N と 4.0 N で、つりあってる！' },
        f98: { face: 'surprise', text: 'え、そうなの？ 9.8 N じゃなくて、押す力と同じ 4.0 N だ！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e16-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ まさつ力は、押す力とつりあう 4.0 N。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「4.0 N」。止まっているから、まさつ力は押す力とつりあうのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e16-balance-still', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '止まっているのだから、まさつ力は押す力とつりあう 4.0 N。これが『静止摩擦力』じゃ。' },

    { bg: 'e16-ramp', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '静止摩擦力には上限がある。それが『最大摩擦力』μN = 0.50 × 19.6 = 9.8 N じゃ。' },

    { bg: 'e16-ramp', chars: [{ who: 'rika', face: 'surprise', side: 'left' }],
      speaker: 'rika', text: '9.8 N をこえたら、すべり出した！ まさつ力が小さくなってる…。' },

    { bg: 'e16-slide', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: "すべっているときは『動摩擦力』μ'N = 0.25 × 19.6 = 4.9 N。押す力によらず、ほぼ一定じゃ。" },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '押す力を少しずつ強くして、すべり出す瞬間を見よう。',
      points: [
        '静止摩擦力は、押す力とつりあう（最大は μN）',
        '最大摩擦力 μN = 0.50 × 19.6 = 9.8 N',
        "すべり出すと動摩擦力 μ'N（ほぼ一定）"
      ] }
  ]
};
})();
