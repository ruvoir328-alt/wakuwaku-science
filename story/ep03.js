/* わくわく物理基礎 ストーリーモード
   第3話「グラフがまっすぐになる運動」（新編物理基礎 1編1章 3 等速直線運動）

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
  const id = 'ep03a' + (++uid);
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
// 動く歩道（秒速1 m）。1 m = 22 px で、0〜10秒を見せる
const W0 = 30, PM = 22;
function walkway(){
  return '<rect x="0" y="70" width="400" height="24" fill="#9aa9b8"/><rect x="0" y="64" width="400" height="8" rx="4" fill="#22305a"/>' +
    '<path d="M0 82 h400" stroke="#d6dce6" stroke-width="2" stroke-dasharray="10 10"/>';
}
SCENES['e3-walkway'] = () => anim(svg(
  '<rect y="94" width="400" height="206" fill="#d6dce6"/>' + walkway() +
  T(212, 150, '動く歩道　秒速1 m →', 14, '#22305a') +
  '<g data-who><circle cx="0" cy="50" r="12" fill="#d93a3f"/>' + T(0, 55, 'リカ', 10, '#fff') + '</g>' +
  T(212, 182, '0秒', 18, '#1f2638', 'middle', ' data-time'), '#eef2f7'),
  4, (root, t) => {
    root.querySelector('[data-who]').setAttribute('transform', 'translate(' + (W0 + t * PM).toFixed(1) + ',0)');
    root.querySelector('[data-time]').textContent = t.toFixed(1) + '秒';
  }, 'もう一度動かす');

// 1秒ごとにシールを貼る（等間隔）
function stickers(animated){
  let ruler = '';
  for (let m = 0; m <= 10; m++){
    const x = W0 + m * PM;
    ruler += '<line x1="' + x + '" x2="' + x + '" y1="100" y2="' + (m % 5 ? 108 : 114) + '" stroke="#6b7488" stroke-width="1.5"/>' +
      (m % 2 ? '' : T(x, 128, m, 12, '#6b7488'));
  }
  const html = svg('<rect y="94" width="400" height="206" fill="#d6dce6"/>' + walkway() +
    '<line x1="' + W0 + '" x2="' + (W0 + 10 * PM) + '" y1="100" y2="100" stroke="#6b7488" stroke-width="1.5"/>' + ruler + T(W0 + 10 * PM + 10, 128, 'm', 12, '#6b7488', 'start') +
    '<g data-st></g><g data-who><circle cx="0" cy="50" r="12" fill="#d93a3f"/>' + T(0, 55, 'リカ', 10, '#fff') + '</g>' +
    T(140, 168, '0秒', 18, '#1f2638', 'middle', ' data-time') + T(140, 192, '●は1秒ごとの位置', 12, '#6b7488'), '#eef2f7');
  const draw = (root, t) => {
    root.querySelector('[data-who]').setAttribute('transform', 'translate(' + (W0 + t * PM).toFixed(1) + ',0)');
    let s = '';
    for (let n = 0; n <= Math.floor(t + 1e-9); n++)
      s += '<circle cx="' + (W0 + n * PM) + '" cy="82" r="6" fill="#ffe14a" stroke="#7e5129" stroke-width="1.5"/>';
    root.querySelector('[data-st]').innerHTML = s;
    root.querySelector('[data-time]').textContent = Math.floor(t + 1e-9) + '秒で ' + Math.floor(t + 1e-9) + ' m';
  };
  if (animated) return anim(html, 10, draw, 'もう一度動かす');
  const id = 'ep03s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, 10); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
SCENES['e3-stickers'] = () => stickers(true);
SCENES['e3-stickers-still'] = () => stickers(false);

// グラフ用紙（右側に置く。左にニュートンくん）
const G = { x: 168, y: 40, w: 200, h: 180 };     // 原点は (G.x, G.y + G.h)
function paper(xl, yl, xt, yt){
  let s = '<rect x="' + (G.x - 30) + '" y="' + (G.y - 26) + '" width="' + (G.w + 54) + '" height="' + (G.h + 60) + '" rx="6" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>';
  for (let k = 1; k <= 6; k++){
    const gx = G.x + G.w * k / 6, gy = G.y + G.h - G.h * k / 6;
    s += '<line x1="' + gx + '" x2="' + gx + '" y1="' + G.y + '" y2="' + (G.y + G.h) + '" stroke="#eef2f7" stroke-width="1.5"/>' +
      '<line x1="' + G.x + '" x2="' + (G.x + G.w) + '" y1="' + gy + '" y2="' + gy + '" stroke="#eef2f7" stroke-width="1.5"/>';
  }
  s += '<path d="M' + G.x + ' ' + (G.y - 6) + ' V' + (G.y + G.h) + ' H' + (G.x + G.w + 6) + '" fill="none" stroke="#1f2638" stroke-width="2"/>' +
    T(G.x - 4, G.y + G.h + 16, '0', 11, '#6b7488', 'end') +
    T(G.x + G.w, G.y + G.h + 16, xt, 11, '#6b7488') + T(G.x - 4, G.y + 4, yt, 11, '#6b7488', 'end') +
    T(G.x + G.w / 2, G.y + G.h + 30, xl, 12, '#6b7488') + '<rect x="' + (G.x + 4) + '" y="' + (G.y + 2) + '" width="84" height="18" fill="#fff"/>' + T(G.x + 8, G.y + 15, yl, 12, '#6b7488', 'start');
  return s;
}
// x-t グラフ：1 m/s（60秒で60 m）と、くらべる 2 m/s（30秒で60 m）
SCENES['e3-xt'] = () => anim(svg(paper('時間 t〔s〕', '変位 x〔m〕', '60', '60') +
  '<line data-l1 x1="' + G.x + '" y1="' + (G.y + G.h) + '" x2="' + G.x + '" y2="' + (G.y + G.h) + '" stroke="#d93a3f" stroke-width="4" stroke-linecap="round"/>' +
  '<line data-l2 x1="' + G.x + '" y1="' + (G.y + G.h) + '" x2="' + G.x + '" y2="' + (G.y + G.h) + '" stroke="#22305a" stroke-width="3" stroke-dasharray="6 5"/>' +
  T(G.x + G.w - 4, G.y + 26, '1 m/s', 13, '#d93a3f', 'end', ' data-k1 opacity="0"') +
  T(G.x + G.w / 2 + 6, G.y + 14, '2 m/s（急）', 13, '#22305a', 'start', ' data-k2 opacity="0"'), '#eef2f7'),
  3, (root, t) => {
    const s1 = Math.min(1, t / 2) * 60;              // 0〜60秒
    root.querySelector('[data-l1]').setAttribute('x2', (G.x + G.w * s1 / 60).toFixed(1));
    root.querySelector('[data-l1]').setAttribute('y2', (G.y + G.h - G.h * (1 * s1) / 60).toFixed(1));
    const s2 = Math.max(0, Math.min(1, (t - 2) / 1)) * 30;   // 2 m/s は30秒で60 m
    root.querySelector('[data-l2]').setAttribute('x2', (G.x + G.w * s2 / 60).toFixed(1));
    root.querySelector('[data-l2]').setAttribute('y2', (G.y + G.h - G.h * (2 * s2) / 60).toFixed(1));
    root.querySelector('[data-k1]').setAttribute('opacity', t >= 2 ? 1 : 0);
    root.querySelector('[data-k2]').setAttribute('opacity', t >= 3 ? 1 : 0);
  }, 'もう一度描く');

// v-t グラフ：高さ1の水平線と、その下の長方形（面積 = 1 × 60 = 60 m）
SCENES['e3-vt'] = () => svg(paper('時間 t〔s〕', '速度 v〔m/s〕', '60', '2') +
  '<style>@keyframes e3glow{0%,100%{opacity:.25}50%{opacity:.6}}.e3-area{animation:e3glow 1.6s ease-in-out infinite}@media (prefers-reduced-motion: reduce){.e3-area{animation:none;opacity:.4}}</style>' +
  '<rect class="e3-area" x="' + G.x + '" y="' + (G.y + G.h / 2) + '" width="' + G.w + '" height="' + (G.h / 2) + '" fill="#ffe14a"/>' +
  '<line x1="' + G.x + '" x2="' + (G.x + G.w) + '" y1="' + (G.y + G.h / 2) + '" y2="' + (G.y + G.h / 2) + '" stroke="#d93a3f" stroke-width="4"/>' +
  T(G.x - 4, G.y + G.h / 2 + 4, '1', 11, '#6b7488', 'end') +
  T(G.x + G.w / 2, G.y + G.h * 0.72, '面積 1 × 60 = 60 m', 14, '#7e5129'), '#eef2f7');

SCENES['e3-answer'] = answerCard('60 m！', '1 m/s × 60 s', 'clamp(30px,10vw,48px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '03',
  chapter: '1章 直線運動の世界',
  topic: '等速直線運動',
  title: 'グラフがまっすぐになる運動',
  drillUrl: '../physics/drill.html?unit=1-2',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e3-walkway', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: '空港の動く歩道じゃ。この歩道は秒速1 mで動く。60秒でどこまで運ばれるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'm60', label: '60 m' },
          { key: 'm61', label: '61 m' },
          { key: 'unknown', label: 'だんだん速くなるのでわからない' }
        ],
        answer: 'm60'
      } },

    { bg: 'e3-walkway', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        m60:     { face: 'confident', text: '1秒で1 mだから、60秒なら60 mでしょ！' },
        m61:     { face: 'question',  text: '最初の1 mも足して、61 m…かな？' },
        unknown: { face: 'confused',  text: '動いてると、だんだん速くならない？ わからないよ。' }
      } } },

    { bg: 'e3-walkway', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        m60:     { face: 'question', text: 'ほう、自信がありそうじゃな。では、1秒ごとにシールを貼って確かめてみよう。' },
        m61:     { face: 'think',    text: 'ふむ、1つずれておらんかな？ 1秒ごとにシールを貼って確かめてみよう。' },
        unknown: { face: 'proud',    text: 'ふむ、よい問いだ。1秒ごとにシールを貼って確かめてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e3-stickers', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        m60:     { face: 'happy',    text: 'シールが等間隔！ 1秒で1 mずつ進んでる！' },
        m61:     { face: 'surprise', text: 'え、そうなの？ 1秒で1 m、2秒で2 m…。ずれてない！' },
        unknown: { face: 'surprise', text: 'え、そうなの？ シールが等間隔。速くなってない！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e3-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 1秒に1 mずつ、60秒で60 m運ばれる。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「60 m」。速さが変わらないので、1 m/s × 60 s = 60 mじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e3-stickers-still', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '速さも向きも変わらない運動、これが『等速直線運動』じゃ。' },

    { bg: 'e3-stickers-still', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '変位 x は『速度 × 時間』、つまり x = vt じゃ。' },

    { bg: 'e3-xt', chars: [{ who: 'rika', face: 'surprise', side: 'left' }],
      speaker: 'rika', text: 'シールをグラフ用紙に移したら、まっすぐ！ 傾きって何？' },

    { bg: 'e3-xt', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '1秒でどれだけ進むか、つまり速度じゃ。速いほど傾きが急になる。' },

    { bg: 'e3-vt', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '速度のグラフは平ら。そしてこの長方形の面積が、進んだ距離になるのじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: 'グラフを読む問題に挑戦じゃ！',
      points: [
        '等速直線運動：速度が一定の運動。x = vt',
        'x-tグラフは原点を通る直線。傾き ＝ 速度',
        'v-tグラフは水平。面積 ＝ 変位'
      ] }
  ]
};
})();
