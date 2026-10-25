/* わくわく物理基礎 ストーリーモード
   第10話「2人で引っぱると、何 N？」（新編物理基礎 1編2章 力の合成・分解）

   書き方は第6話（ep06.js）・1章の各話と同じ。脚本の原本は docs/story-ch2.md。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
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
  const id = 'ep10a' + (++uid);
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
const SKY = '<defs><linearGradient id="sky10" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky10)"/>';
// 力の矢印（x1,y1 → x2,y2）。色：重力＝紺、人が加える力＝赤、支える力＝木、合力＝赤の点線（dash）
function arrow(x1, y1, x2, y2, color, w, dash){
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 3) return '';
  w = w || 5;
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(14, L * 0.6), hw = h * 0.6;
  const bx = x2 - ux * h, by = y2 - uy * h;
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + bx.toFixed(1) + '" y2="' + by.toFixed(1) + '" stroke="' + color + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="7 5"' : ' stroke-linecap="round"') + '/>' +
    '<path d="M' + x2 + ' ' + y2 + ' L' + (bx - uy * hw).toFixed(1) + ' ' + (by + ux * hw).toFixed(1) + ' L' + (bx + uy * hw).toFixed(1) + ' ' + (by - ux * hw).toFixed(1) + 'z" fill="' + color + '"/>';
}
const NAVY = '#22305a', RED = '#d93a3f', WOOD = '#7e5129';

/* ---- この話の絵 ---- */
// 上から見た台車。リカが東へ 30 N、ニュートンくんが北へ 40 N（直角）。合力 √(30² + 40²) = 50 N
const K = 2.4;                                   // 矢印 1 N = 2.4 px
const O = { x: 186, y: 240 };                    // 台車（力の作用点）
function grid(){
  let g = '<rect width="400" height="300" fill="#fff"/>';
  for (let x = 0; x <= 400; x += 25) g += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="300" stroke="#eef2f7" stroke-width="1.5"/>';
  for (let y = 0; y <= 300; y += 25) g += '<line x1="0" x2="400" y1="' + y + '" y2="' + y + '" stroke="#eef2f7" stroke-width="1.5"/>';
  return g + arrow(370, 60, 370, 22, '#6b7488', 2.5) + T(370, 16, '北', 12, '#6b7488') +
    arrow(332, 60, 368, 60, '#6b7488', 2.5) + T(326, 64, '東', 12, '#6b7488', 'end');
}
function cart(){
  return '<rect x="' + (O.x - 18) + '" y="' + (O.y - 14) + '" width="36" height="28" rx="5" fill="#b47a44" stroke="#7e5129" stroke-width="2"/>' +
    '<circle cx="' + O.x + '" cy="' + O.y + '" r="4" fill="#1f2638"/>';
}
const E = { x: O.x + 30 * K, y: O.y }, N = { x: O.x, y: O.y - 40 * K }, R = { x: O.x + 30 * K, y: O.y - 40 * K };
function forces(){
  return arrow(O.x, O.y, E.x, E.y, RED) + T((O.x + E.x) / 2 + 6, E.y + 26, '30 N', 16, RED) +
    arrow(O.x, O.y, N.x, N.y, RED) + T(N.x - 10, (O.y + N.y) / 2, '40 N', 16, RED, 'end');
}
SCENES['e10-cart'] = () => svg(grid() + cart() + forces() + T(196, 28, 'リカは東へ 30 N', 15, '#1f2638') + T(196, 50, 'ニュートンくんは北へ 40 N', 15, '#1f2638'));

// 平行四辺形（ここでは長方形）を描いて、対角線＝合力
function para(t){
  const k = Math.max(0, Math.min(1, t));
  return '<path d="M' + E.x + ' ' + E.y + ' V' + (E.y - 40 * K * k).toFixed(1) + ' M' + N.x + ' ' + N.y + ' H' + (N.x + 30 * K * k).toFixed(1) + '" stroke="#6b7488" stroke-width="2" stroke-dasharray="5 4" fill="none"/>';
}
function result(k){
  return arrow(O.x, O.y, O.x + (R.x - O.x) * k, O.y + (R.y - O.y) * k, RED, 5, true);
}
SCENES['e10-para'] = () => anim(svg(grid() + cart() + forces() + '<g data-p></g><g data-r></g>' +
  T(R.x + 4, R.y - 10, '合力 50 N', 16, RED, 'end', ' data-k opacity="0"')),
  2.6, (root, t) => {
    root.querySelector('[data-p]').innerHTML = para(t / 1.0);
    const k = Math.max(0, Math.min(1, (t - 1.2) / 0.9));
    root.querySelector('[data-r]').innerHTML = k > 0 ? result(k) : '';
    root.querySelector('[data-k]').setAttribute('opacity', t >= 2.2 ? 1 : 0);
  }, 'もう一度描く');
SCENES['e10-para-still'] = () => svg(grid() + cart() + forces() + para(1) + result(1) +
  T(R.x + 4, R.y - 10, '合力 50 N', 16, RED, 'end') + T(R.x + 8, (O.y + R.y) / 2 + 4, '√(30² + 40²)', 13, '#7e5129', 'start'));

// 向きによって合力が変わる：同じ向き 70 N、反対向き −10 N、直角 50 N（矢印 1 N = 1.2 px）
function small(cx, kind){
  const k = 1.4, y = 140;
  let g = '';
  if (kind === 'same'){
    const x0 = cx - 42;
    g += arrow(x0, y, x0 + 30 * k, y, RED, 4) + arrow(x0 + 30 * k, y, x0 + 70 * k, y, RED, 4) +
      arrow(x0, y + 30, x0 + 70 * k, y + 30, RED, 4, true) +
      T(cx, 210, '同じ向き', 15, '#1f2638') + T(cx, 234, '30 + 40 = 70 N', 14, RED);
  } else if (kind === 'opp'){
    g += arrow(cx, y, cx + 30 * k, y, RED, 4) + arrow(cx, y - 14, cx - 40 * k, y - 14, RED, 4) +
      arrow(cx, y + 30, cx - 10 * k, y + 30, RED, 4, true) +
      T(cx, 210, '反対向き', 15, '#1f2638') + T(cx, 234, '30 − 40 = −10 N', 14, RED) + T(cx, 256, '（西へ 10 N）', 13, '#6b7488');
  } else {
    const x0 = cx - 18, y0 = y + 30;
    g += arrow(x0, y0, x0 + 30 * k, y0, RED, 4) + arrow(x0, y0, x0, y0 - 40 * k, RED, 4) +
      arrow(x0, y0, x0 + 30 * k, y0 - 40 * k, RED, 4, true) +
      T(cx, 210, '直角', 15, '#1f2638') + T(cx, 234, '50 N', 14, RED) + T(cx, 256, '√(30² + 40²)', 13, '#6b7488');
  }
  return g + '<circle cx="' + (kind === 'right' ? cx - 18 : kind === 'same' ? cx - 42 : cx) + '" cy="' + (kind === 'right' ? y + 30 : y) + '" r="3.5" fill="#1f2638"/>';
}
SCENES['e10-three'] = () => svg('<rect width="400" height="300" fill="#fff"/>' +
  '<line x1="133" x2="133" y1="80" y2="260" stroke="#eef2f7" stroke-width="2"/><line x1="267" x2="267" y1="80" y2="260" stroke="#eef2f7" stroke-width="2"/>' +
  small(67, 'same') + small(200, 'opp') + small(333, 'right') +
  T(200, 36, '30 N と 40 N の合力', 17, '#1f2638') + T(200, 60, '東向きを正とする（点線＝合力）', 13, '#6b7488'));

// 分力：水平から 60° に引く 40 N を、水平と鉛直に分ける（矢印 1 N = 2.6 px）
const S = { x: 184, y: 250, k: 3 };
const FH = 40 * Math.cos(Math.PI / 3), FV = 40 * Math.sin(Math.PI / 3);     // 20 N、34.6 N
SCENES['e10-split'] = () => anim(svg(grid() +
  '<rect x="' + (S.x - 18) + '" y="' + (S.y - 14) + '" width="36" height="28" rx="5" fill="#b47a44" stroke="#7e5129" stroke-width="2"/>' +
  arrow(S.x, S.y, S.x + FH * S.k, S.y - FV * S.k, RED) +
  T(S.x + FH * S.k + 8, S.y - FV * S.k + 6, 'F 40 N', 16, RED, 'start') +
  '<path d="M' + (S.x + 30) + ' ' + S.y + ' A30 30 0 0 0 ' + (S.x + 15).toFixed(1) + ' ' + (S.y - 26).toFixed(1) + '" fill="none" stroke="#6b7488" stroke-width="1.5"/>' +
  T(S.x + 36, S.y - 12, '60°', 12, '#6b7488', 'start') +
  '<g data-c></g>' + T(250, 92, '1つの力を、2つに分ける', 15, '#1f2638')),
  1.8, (root, t) => {
    const k = Math.max(0, Math.min(1, t / 1.2));
    let g = '';
    if (k > 0){
      g += arrow(S.x, S.y, S.x + FH * S.k * k, S.y, WOOD, 4, true) + arrow(S.x, S.y, S.x, S.y - FV * S.k * k, WOOD, 4, true);
      g += '<path d="M' + (S.x + FH * S.k) + ' ' + S.y + ' V' + (S.y - FV * S.k) + ' H' + S.x + '" fill="none" stroke="#d6dce6" stroke-width="1.5" stroke-dasharray="4 4"/>';
    }
    if (t >= 1.3) g += T(S.x + FH * S.k / 2 + 10, S.y + 26, '水平 40 × cos60° = 20 N', 14, WOOD) + T(S.x - 8, S.y - FV * S.k / 2 - 8, '鉛直', 13, WOOD, 'end') + T(S.x - 8, S.y - FV * S.k / 2 + 10, '34.6 N', 13, WOOD, 'end');
    root.querySelector('[data-c]').innerHTML = g;
  }, 'もう一度分ける');

SCENES['e10-answer'] = answerCard('50 N！', '√(30² + 40²) = 50 N', 'clamp(30px,10vw,48px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '10',
  chapter: '2章 力と運動の法則',
  topic: '力の合成・分解',
  title: '2人で引っぱると、何 N？',
  simUrl: '../sim/force-composition.html',
  drillUrl: '../physics/drill.html?unit=2-1',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e10-cart', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'わしらが直角の向きに引っぱると、台車は何 N で引かれることになるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'n70', label: '70 N' },
          { key: 'n50', label: '50 N' },
          { key: 'n10', label: '10 N' }
        ],
        answer: 'n50'
      } },

    { bg: 'e10-cart', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        n70: { face: 'confident', text: '30 と 40 で、70 N でしょ！' },
        n50: { face: 'idea',      text: '直角だから…ななめの長さかな？ 50 N！' },
        n10: { face: 'question',  text: '別の向きに引き合うから、40 − 30 = 10 N？' }
      } } },

    { bg: 'e10-cart', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        n70: { face: 'think',    text: '同じ向きに引けば、そのとおり 70 N じゃ。だが、向きがちがうとどうかな？' },
        n50: { face: 'question', text: 'ほう、ななめに目をつけたか。図をかいて確かめてみよう。' },
        n10: { face: 'proud',    text: 'ふむ、よい問いじゃ。反対向きなら引き算じゃが、これは直角じゃ。図をかいてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e10-para', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        n70: { face: 'surprise', text: 'え、そうなの？ ななめの1本にまとまった。70 N より短い！' },
        n50: { face: 'happy',    text: '3 と 4 の直角三角形…ななめは 5！ だから 50 N！' },
        n10: { face: 'surprise', text: 'え、そうなの？ 10 N より、ずっと長い矢印になった！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e10-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 直角に引くと、合力は 50 N になる。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「50 N」。向きがちがうと、ただの足し算にはならんのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e10-para-still', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '2つの力を辺とする平行四辺形の対角線、これが『合力』じゃ。' },

    { bg: 'e10-para-still', chars: [{ who: 'rika', face: 'idea', side: 'left' }],
      speaker: 'rika', text: '3 と 4 の直角三角形だから、ななめは 5。だから 50 N なんだね。' },

    { bg: 'e10-three',
      speaker: 'newton', text: '向きによって合力は変わる。同じ向きなら 70 N、直角なら 50 N じゃ。' },

    { bg: 'e10-three',
      speaker: 'newton', text: '反対向きなら、東を正として 30 − 40 = −10、西へ 10 N じゃ。' },

    { bg: 'e10-split', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '逆に、1つの力を2つに分けることもできる。これが『分力』じゃ。' },

    { bg: 'e10-split', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '水平の分力は 40 × cos60° = 20 N じゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '矢印を自分で動かして、合力を作ってみよう。',
      points: [
        '合力は、2つの力を辺とする平行四辺形の対角線',
        '向きがちがうと、ただの足し算にはならない',
        '1つの力を2つの向きに分けたものが分力'
      ] }
  ]
};
})();
