/* わくわく物理基礎 ストーリーモード
   第2話「たくさん歩いたのに、進んでない？」（新編物理基礎 1編1章 2 変位と速度）

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
  const id = 'ep02a' + (++uid);
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
// シミュもドリルもまだないので、最後のボタンを「準備中」にする
function soonEnds(){
  const box = document.getElementById('choices');
  new MutationObserver(() => {
    const go = box.querySelector('.ends a.go');
    if (!go || EPISODE.drillUrl) return;
    const b = document.createElement('button');
    b.className = 'soon'; b.disabled = true; b.textContent = 'チャレンジモード（準備中）';
    go.replaceWith(b);
  }).observe(box, { childList: true });
}

/* ---- この話の絵 ---- */
// 数直線：教室 = 0、東向きを正。1 m = 5 px
const X0 = 200, PM = 5;
function axis(y){
  let s = '<line x1="14" x2="386" y1="' + y + '" y2="' + y + '" stroke="#1f2638" stroke-width="2.5"/><path d="M386 ' + y + ' l-10 -6 v12z" fill="#1f2638"/>';
  for (let m = -30; m <= 30; m += 10){
    const x = X0 + m * PM;
    s += '<line x1="' + x + '" x2="' + x + '" y1="' + (y - 6) + '" y2="' + (y + 6) + '" stroke="#1f2638" stroke-width="2"/>' +
      T(x, y + 22, (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(m), 12, '#6b7488');
  }
  return s + T(392, y + 22, 'm', 12, '#6b7488', 'end') + T(380, y - 12, '東（正の向き）', 12, '#d93a3f', 'end');
}
function arrow(x1, x2, y, color, w){
  const d = x2 > x1 ? 1 : -1;
  if (Math.abs(x2 - x1) < 12) return '';
  return '<line x1="' + x1 + '" x2="' + (x2 - d * 10) + '" y1="' + y + '" y2="' + y + '" stroke="' + color + '" stroke-width="' + (w || 5) + '"/>' +
    '<path d="M' + x2 + ' ' + y + ' l' + (-d * 14) + ' -9 v18z" fill="' + color + '"/>';
}
// 歩いた位置 x（m）と、歩いた道のり（m）。東へ30 m を2秒、0.4秒止まって、西へ30 m を2秒
function walk(t){
  if (t <= 2) return { x: 15 * t, d: 15 * t };
  if (t <= 2.4) return { x: 30, d: 30 };
  const u = Math.min(2, t - 2.4);
  return { x: 30 - 15 * u, d: 30 + 15 * u };
}
const WALK_T = 4.4;

// 廊下を往復
SCENES['e2-hall'] = () => anim(svg(
  '<rect x="0" y="46" width="400" height="56" fill="#e9c48f"/><path d="M0 46 h400 M0 102 h400" stroke="#7e5129" stroke-width="3"/>' +
  '<path d="M' + (X0 - 22) + ' 102 h44" stroke="#fff" stroke-width="6"/>' + T(X0, 122, '教室の前', 13, '#7e5129') +
  T(8, 64, '← 西', 13, '#7e5129', 'start') + T(392, 64, '東 →', 13, '#7e5129', 'end') +
  '<g data-who><circle cx="0" cy="78" r="12" fill="#d93a3f"/>' + T(0, 83, 'リカ', 10, '#fff') + '</g>' +
  '<rect x="138" y="140" width="124" height="54" rx="10" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>' +
  T(200, 160, '歩いた道のり', 12, '#6b7488') + T(200, 184, '0 m', 18, '#1f2638', 'middle', ' data-d'),
  '#eef2f7'), WALK_T, (root, t) => {
    const w = walk(t);
    root.querySelector('[data-who]').setAttribute('transform', 'translate(' + (X0 + w.x * PM).toFixed(1) + ',0)');
    root.querySelector('[data-d]').textContent = Math.round(w.d) + ' m';
  }, 'もう一度歩く');

// 数直線の上で、変位の矢印と道のり
function lineScene(animated){
  const html = svg(axis(78) +
    '<g data-a1></g><g data-a2></g>' +
    '<g data-who><circle cx="0" cy="78" r="10" fill="#d93a3f"/></g>' +
    '<rect x="40" y="152" width="200" height="100" rx="12" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>' +
    T(56, 180, '道のり（移動距離）', 13, '#6b7488', 'start') + T(226, 180, '0 m', 15, '#1f2638', 'end', ' data-d') +
    T(56, 210, '変位', 13, '#6b7488', 'start') + T(226, 210, '0 m', 15, '#d93a3f', 'end', ' data-x') +
    T(140, 238, '＋30 m と −30 m で 0 m', 12, '#6b7488', 'middle', ' data-note opacity="0"'),
    '#fff');
  const draw = (root, t) => {
    const w = walk(t);
    root.querySelector('[data-who]').setAttribute('transform', 'translate(' + (w.x * PM + X0).toFixed(1) + ',0)');
    root.querySelector('[data-a1]').innerHTML = arrow(X0, X0 + Math.min(w.d, 30) * PM, 46, '#d93a3f');
    root.querySelector('[data-a2]').innerHTML = w.d > 30 ? arrow(X0 + 30 * PM, X0 + w.x * PM, 122, '#22305a') +
      (t >= WALK_T ? T(X0 + 11 * PM, 142, '−30 m', 13, '#22305a') : '') : '';
    if (w.d >= 30) root.querySelector('[data-a1]').innerHTML += T(X0 + 15 * PM, 38, '＋30 m', 13, '#d93a3f');
    root.querySelector('[data-d]').textContent = Math.round(w.d) + ' m';
    const x = Math.round(w.x);
    root.querySelector('[data-x]').textContent = (x > 0 ? '＋' : '') + x + ' m';
    root.querySelector('[data-note]').setAttribute('opacity', t >= WALK_T ? 1 : 0);
  };
  if (animated) return anim(html, WALK_T, draw, 'もう一度歩く');
  // 動かさない絵：最後の状態を描いておく
  const id = 'ep02s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, WALK_T); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
SCENES['e2-line'] = () => lineScene(true);
SCENES['e2-line-still'] = () => lineScene(false);

// 速度の矢印：長さ＝速さ、向き＝進む向き
SCENES['e2-velocity'] = () => svg(
  '<line x1="14" x2="386" y1="18" y2="18" stroke="#cfd7ee" stroke-width="2"/>' + T(386, 34, '東（正の向き）→', 12, '#d93a3f', 'end') +
  arrow(170, 350, 52, '#d93a3f', 7) + T(260, 78, '東へ 1.5 m/s → ＋1.5 m/s', 14, '#d93a3f') +
  arrow(290, 110, 98, '#22305a', 7) + T(200, 124, '西へ 1.5 m/s → −1.5 m/s', 14, '#22305a') +
  '<rect x="134" y="166" width="132" height="58" rx="10" fill="#fff7e9" stroke="#e9c48f" stroke-width="2"/>' +
  T(200, 189, '長さ ＝ 速さ', 13, '#7e5129') + T(200, 211, '向き ＝ 進む向き', 13, '#7e5129'), '#fff');

SCENES['e2-answer'] = answerCard('0 m！', '教室から進んだのは');

soonEnds();

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '02',
  chapter: '1章 直線運動の世界',
  topic: '変位と速度',
  title: 'たくさん歩いたのに、進んでない？',
  scenes: [
    { bg: 'title' },

    { bg: 'e2-hall', chars: [{ who: 'rika', face: 'oops', side: 'right' }],
      speaker: 'rika', text: '教室から東へ30 m歩いたら、忘れ物に気づいて…。西へ30 m戻ってきたよ。' },

    /* ---- 謎と予想 ---- */
    { bg: 'e2-hall', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'リカくんは60 m歩いた。では、教室からどれだけ進んだかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'd60', label: '60 m' },
          { key: 'd30', label: '30 m' },
          { key: 'd0', label: '0 m' }
        ],
        answer: 'd0'
      } },

    { bg: 'e2-hall', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        d60: { face: 'confident', text: '60 mでしょ？ 足が痛いもん。' },
        d30: { face: 'question',  text: '東へ30 m行ったから、30 m…かな？' },
        d0:  { face: 'idea',      text: '0 m！ だって、教室に戻ってきたもん。' }
      } } },

    { bg: 'e2-hall', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        d60: { face: 'proud',    text: '足は正直じゃ。だが、リンゴに聞いてみよう。今いるのはどこじゃ？' },
        d30: { face: 'think',    text: 'ふむ、そのあと戻ったのではなかったかな？ リンゴに聞いてみよう。今いるのはどこじゃ？' },
        d0:  { face: 'question', text: 'ほう、自信がありそうじゃな。リンゴに聞いてみよう。今いるのはどこじゃ？' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e2-line', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        d60: { face: 'surprise', text: 'え、そうなの？ 60 m歩いたのに、0のところに戻ってる…！' },
        d30: { face: 'surprise', text: 'あれ？ +30まで行ったけど、また0に戻ってる！' },
        d0:  { face: 'happy',    text: 'やっぱり！ 最後は0のところに戻ってる！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e2-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 60 m歩いても、教室からは0 mしか進んでおらん。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「0 m」。60 m歩いても、もとの場所に戻れば0 mじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e2-line-still', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: 'どこからどこへ動いたかを、向きつきで表すのが『変位』じゃ。' },

    { bg: 'e2-line-still', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '東向きを正にすると、＋30 mと−30 mで、変位は0 mじゃ。' },

    { bg: 'e2-velocity', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'question', side: 'right' }],
      speaker: 'rika', text: 'じゃあ、速さにも向きがあるの？' },

    { bg: 'e2-velocity', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton', text: 'よい問いだ。向きも含めた速さが『速度』じゃ。' },

    { bg: 'e2-velocity', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'idea', side: 'right' }],
      speaker: 'newton', text: '東へ秒速1.5 mなら＋1.5 m/s、西へなら−1.5 m/sじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '矢印を動かすシミュレーションは、いま準備中じゃ。楽しみにしておれ！',
      points: [
        '変位は向きをもつ。移動距離とはちがう',
        '速度：向きをもつ速さ',
        '正の向きを決めて、＋と−で表す'
      ] }
  ]
};
})();
