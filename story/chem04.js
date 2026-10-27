/* わくわく化学基礎 ストーリーモード
   化学 第4話「骨の『カルシウム』は、金属のかたまり？」（化学基礎 1編1章 物質の成分と構成元素：元素と単体）

   書き方は物理の各話（ep03.js など）と同じ。脚本の原本は docs/chem-story-ch1.md。
   subject: '化学基礎' で、舞台の名札が「わくわく化学基礎」になる。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
*/
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = ' font-family="Zen Maru Gothic" font-weight="700"';
let uid = 0;

/* ---- 絵を描くための道具（物理の各話と同じ） ---- */
function svg(inner, bg){
  return '<svg class="scene" viewBox="0 0 400 300" aria-hidden="true"><rect width="400" height="300" fill="' + (bg || '#fff') + '"/>' + inner + '</svg>';
}
function T(x, y, s, size, fill, anchor, extra){
  return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || '#1f2638') + '" text-anchor="' + (anchor || 'middle') + '"' + F + (extra || '') + '>' + s + '</text>';
}
// アニメ：dur 秒かけて draw(root, t) をくり返し呼ぶ。「もう一度見る」ボタンつき
function anim(html, dur, draw, label){
  const id = 'chem04a' + (++uid);
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

/* ---- 化学の実験の道具（化学1章の各話で同じ。色：水＝空 #bfe2f6、白い固体＝#fff、砂＝木 #b47a44、ガラスのふち＝#6b7488、炎＝赤とレモン） ---- */
const NAVY = '#22305a', RED = '#d93a3f', INK = '#1f2638', MUTED = '#6b7488', WOOD = '#b47a44', WOODD = '#7e5129';
const WATER = '#bfe2f6', GLASS = '#6b7488', LEMON = '#ffe14a', CREAM = '#fff7e9', CREAML = '#e9c48f';
// 理科室（壁と机）
const LAB = '<rect width="400" height="300" fill="#eef2f7"/><rect y="236" width="400" height="64" fill="#d6dce6"/><rect y="230" width="400" height="8" fill="' + WOOD + '"/>';
// ビーカー（左下 x, 底 y、はば w、高さ h、液の高さ lh、液の色）
function beaker(x, y, w, h, lh, liquid, extra){
  return (lh > 0 ? '<rect x="' + (x + 2) + '" y="' + (y - lh) + '" width="' + (w - 4) + '" height="' + lh + '" fill="' + (liquid || WATER) + '" opacity=".9"/>' : '') +
    (extra || '') +
    '<path d="M' + (x - 4) + ' ' + (y - h) + ' h6 M' + x + ' ' + (y - h) + ' V' + y + ' H' + (x + w) + ' V' + (y - h) + '" fill="none" stroke="' + GLASS + '" stroke-width="2.5" stroke-linejoin="round"/>';
}
// ガスバーナーの炎（中心 cx、上のはし y）
function flame(cx, y, s){
  s = s || 1;
  return '<path d="M' + cx + ' ' + y + ' q' + (10 * s) + ' ' + (14 * s) + ' 0 ' + (24 * s) + ' q' + (-10 * s) + ' ' + (-10 * s) + ' 0 ' + (-24 * s) + 'z" fill="' + RED + '"/>' +
    '<path d="M' + cx + ' ' + (y + 8 * s) + ' q' + (5 * s) + ' ' + (8 * s) + ' 0 ' + (16 * s) + ' q' + (-5 * s) + ' ' + (-6 * s) + ' 0 ' + (-16 * s) + 'z" fill="' + LEMON + '"/>';
}
function burner(cx, y){       // y：炎の上のはし
  return flame(cx, y) + '<rect x="' + (cx - 6) + '" y="' + (y + 24) + '" width="12" height="' + (230 - y - 30) + '" fill="' + MUTED + '"/><rect x="' + (cx - 16) + '" y="224" width="32" height="6" rx="2" fill="' + NAVY + '"/>';
}
// 表（見出しと、左右2列）
function sortTable(x, y, w, leftHead, rightHead, left, right){
  const half = w / 2, rows = Math.max(left.length, right.length), rh = 26;
  let s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (34 + rows * rh) + '" rx="8" fill="#fff" stroke="' + CREAML + '" stroke-width="2"/>' +
    '<rect x="' + x + '" y="' + y + '" width="' + half + '" height="30" rx="8" fill="' + NAVY + '"/><rect x="' + (x + half) + '" y="' + y + '" width="' + half + '" height="30" rx="8" fill="' + RED + '"/>' +
    T(x + half / 2, y + 20, leftHead, 14, '#fff') + T(x + half * 1.5, y + 20, rightHead, 14, '#fff') +
    '<line x1="' + (x + half) + '" x2="' + (x + half) + '" y1="' + (y + 30) + '" y2="' + (y + 34 + rows * rh) + '" stroke="' + CREAML + '" stroke-width="1.5"/>';
  left.forEach((s2, i) => { s += T(x + half / 2, y + 52 + i * rh, s2, 13, INK); });
  right.forEach((s2, i) => { s += T(x + half * 1.5, y + 52 + i * rh, s2, 13, INK); });
  return s;
}

/* ---- この話の絵 ---- */
const SILVER = '#dfe4ee';
function bone(cx, cy, s){
  s = s || 1;
  const w = 70 * s, r = 12 * s;
  return '<g fill="#fff" stroke="' + MUTED + '" stroke-width="2"><rect x="' + (cx - w / 2) + '" y="' + (cy - 7 * s) + '" width="' + w + '" height="' + (14 * s) + '"/>' +
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => '<circle cx="' + (cx + a * w / 2) + '" cy="' + (cy + b * 9 * s) + '" r="' + r + '"/>').join('') +
    '</g><rect x="' + (cx - w / 2) + '" y="' + (cy - 6 * s) + '" width="' + w + '" height="' + (12 * s) + '" fill="#fff"/>';
}
// 場面1：牛乳のパック
SCENES['c4-milk'] = () => svg(LAB +
  '<path d="M70 230 V110 L90 84 H150 L170 110 V230 Z" fill="#fff" stroke="' + NAVY + '" stroke-width="3"/><path d="M70 110 H170" stroke="' + NAVY + '" stroke-width="2"/>' +
  '<rect x="70" y="122" width="100" height="30" fill="' + NAVY + '"/>' + T(120, 142, '牛乳', 16, '#fff') +
  T(120, 176, 'カルシウム', 13, RED) + T(120, 194, 'たっぷり！', 13, RED) + T(120, 216, '骨を強くする', 11, INK) +
  bone(232, 200, 0.8) + T(232, 176, '骨', 13, INK));

// 場面3：金属のカルシウム（銀白色）を水に入れると、あわ（水素）を出してとけていく
SCENES['c4-metal'] = () => anim(svg(LAB + '<g data-b></g>' + beaker(70, 230, 120, 100, 72) +
  T(130, 270, '金属のカルシウム（銀白色）を水に入れると…', 12, INK) + T(130, 288, 'あわ（水素）を出して、とけていく', 12, RED, 'middle', ' data-k opacity="0"')),
  4, (root, t) => {
    const fall = Math.min(1, t / 0.8), y = 96 + fall * (214 - 96), s = Math.max(0.35, 1 - Math.max(0, t - 0.8) * 0.2);
    let b = '<rect x="' + (130 - 13 * s) + '" y="' + (y - 12 * s) + '" width="' + (26 * s) + '" height="' + (18 * s) + '" rx="3" fill="' + SILVER + '" stroke="' + MUTED + '" stroke-width="2"/>';
    if (t > 0.8) for (let i = 0; i < 9; i++){
      const k = ((t - 0.8) * 0.9 + i / 9) % 1, bx = 122 + (i * 23) % 18 - 4 + Math.sin(k * 6 + i) * 3, by = 210 - k * 50;
      b += '<circle cx="' + bx.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="' + (2 + i % 3) + '" fill="#fff" stroke="' + MUTED + '" stroke-width="1"/>';
    }
    root.querySelector('[data-b]').innerHTML = b;
    root.querySelector('[data-k]').setAttribute('opacity', t > 1.4 ? 1 : 0);
  }, 'もう一度入れる');

// 場面4：骨の中では、カルシウムはほかの元素と結びついている（リン酸カルシウム）
function atom(x, y, sym, fill){ return '<circle cx="' + x + '" cy="' + y + '" r="15" fill="' + fill + '" stroke="' + MUTED + '" stroke-width="1.5"/>' + T(x, y + 5, sym, 13, INK); }
SCENES['c4-bone'] = () => {
  let s = '<circle cx="140" cy="140" r="100" fill="#fff" stroke="' + GLASS + '" stroke-width="3"/>';
  const L = (a, b) => '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + MUTED + '" stroke-width="2"/>';
  const P = [[140, 140]], O = [[110, 120], [170, 120], [120, 172], [162, 172]], Ca = [[80, 96], [200, 96], [92, 196], [190, 196]];
  O.forEach(o => { s += L(P[0], o); });
  O.forEach((o, i) => { s += L(o, Ca[i]); });
  Ca.forEach(c => { s += atom(c[0], c[1], 'Ca', CREAML); });
  O.forEach(o => { s += atom(o[0], o[1], 'O', WATER); });
  s += atom(140, 140, 'P', '#fff');
  return svg('<rect width="400" height="300" fill="#eef2f7"/>' + bone(140, 268, 0.6) + s +
    T(140, 30, '骨の中を大きくして見ると', 13, INK) + T(270, 290, 'リン酸カルシウム', 12, MUTED, 'end'));
};

// 場面5：仕分け（単体と化合物）
SCENES['c4-sort'] = () => svg(sortTable(12, 36, 270, '単体', '化合物', ['酸素', '鉄', 'カルシウム'], ['水', '二酸化炭素', '塩化ナトリウム']) +
  T(147, 192, '単体：1種類の元素だけでできた物質', 12, NAVY) + T(147, 212, '化合物：2種類以上の元素でできた物質', 12, RED), CREAM);

// 同じ「酸素」でも、元素の意味と単体の意味がある
function sentence(y, s, tag, color){
  return '<rect x="14" y="' + y + '" width="262" height="46" rx="10" fill="#fff" stroke="' + CREAML + '" stroke-width="2"/>' +
    T(26, y + 28, s, 13, INK, 'start') + '<rect x="206" y="' + (y + 10) + '" width="60" height="26" rx="13" fill="' + color + '"/>' + T(236, y + 28, tag, 13, '#fff');
}
SCENES['c4-words'] = () => svg(T(145, 40, '同じ「酸素」でも…', 15, NAVY) +
  sentence(60, '「酸素を吸う」', '単体', NAVY) + sentence(120, '「水は水素と酸素から…」', '元素', RED) +
  T(145, 200, '物質そのもの → 単体', 13, NAVY) + T(145, 222, '物質をつくる成分 → 元素', 13, RED), CREAM);

// 錬金術のなやみ：金も鉛も、それぞれ1つの元素
SCENES['c4-gold'] = () => svg('<rect width="400" height="300" fill="#eef2f7"/>' +
  '<circle cx="70" cy="130" r="40" fill="' + MUTED + '"/>' + T(70, 136, '鉛', 20, '#fff') + T(70, 192, '元素 Pb', 13, INK) +
  '<circle cx="220" cy="130" r="40" fill="' + LEMON + '" stroke="' + CREAML + '" stroke-width="3"/>' + T(220, 136, '金', 20, WOODD) + T(220, 192, '元素 Au', 13, INK) +
  '<path d="M118 130 H164" stroke="' + RED + '" stroke-width="4" stroke-dasharray="6 5"/><path d="M164 120 L178 130 L164 140z" fill="' + RED + '"/>' +
  T(145, 108, '？', 28, RED) + T(145, 250, '元素がちがうものに、変えられる？', 14, NAVY));

SCENES['c4-answer'] = answerCard('入っていない！', '骨の「カルシウム」は元素の名前', 'clamp(22px,7vw,34px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '04',
  subject: '化学基礎',
  chapter: '1章 物質の成分と構成元素',
  topic: '元素と単体',
  title: '骨の『カルシウム』は、金属のかたまり？',
  simUrl: '../sim/chem-element.html',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'c4-milk', chars: [{ who: 'newton', face: 'question', side: 'right' }],
      speaker: 'newton', text: '骨には、カルシウムがたくさんある。では、骨の中に、銀色の金属のかたまりが入っているのかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'yes',  label: '入っている' },
          { key: 'no',   label: '入っていない' },
          { key: 'milk', label: '牛乳の中にだけ入っている' }
        ],
        answer: 'no'
      } },

    { bg: 'c4-milk', chars: [{ who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        yes:  { face: 'confident', text: 'カルシウムって、金属なんでしょ？ 骨の中でキラキラしてるのかな。' },
        no:   { face: 'question',  text: '骨は白いし、キラキラしてないよね。入ってないと思う。' },
        milk: { face: 'idea',      text: '牛乳の中に、金属のカルシウムがとけてるのかな？' }
      } } },

    { bg: 'c4-milk', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        yes:  { face: 'question', text: 'ふむ。では、金属のカルシウムを水に入れてみよう。' },
        no:   { face: 'proud',    text: 'ほう、よく見ておるの。では、金属のカルシウムを水に入れてみよう。' },
        milk: { face: 'think',    text: 'ふむ、よい問いじゃ。では、金属のカルシウムを水に入れてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'c4-metal', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        yes:  { face: 'surprise', text: 'え、そうなの？ あわを出して、とけていく！' },
        no:   { face: 'happy',    text: 'あわを出してとけた！ こんなのが骨の中にあるはずないね。' },
        milk: { face: 'surprise', text: '水に入れたら、あわを出してとけちゃった！' }
      } } },

    { bg: 'c4-metal', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '金属のカルシウムは、水に入れるとあわを出してとけてしまう。' },

    { bg: 'c4-metal', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '骨の中に、このままでは、いられんのじゃ。' },

    /* ---- 答え合わせ ---- */
    { bg: 'c4-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 骨の中に、金属のカルシウムのかたまりはない。' },
      wrong: { face: 'oops',  text: 'おしい！ 答えは「入っていない」。金属のカルシウムは、水に入れるととけてしまうのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'c4-bone', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '骨の中では、カルシウムは、リンや酸素と結びついておる。' },

    { bg: 'c4-bone', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '骨の『カルシウム』は、成分としての名前。これが『元素』じゃ。' },

    { bg: 'c4-sort', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '金属のカルシウムは、カルシウムだけでできた物質、『単体』という。' },

    { bg: 'c4-words', chars: [{ who: 'rika', face: 'idea', side: 'right' }],
      speaker: 'rika', text: '『酸素を吸う』は単体で、『水は水素と酸素からできている』は元素だね！' },

    { bg: 'c4-gold', chars: [{ who: 'newton', face: 'think', side: 'right' }],
      speaker: 'newton', text: '金も鉛も、それぞれ1つの元素じゃ。' },

    { bg: 'c4-gold', chars: [{ who: 'newton', face: 'oops', side: 'right' }],
      speaker: 'newton', text: '元素がちがうものを、ほかのものに変えられるのか。ここが、わしの研究のなやみどころじゃった。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '文の中の『酸素』は、元素か単体か。仕分けてみよう。',
      points: [
        '元素：物質をつくるもとの成分（骨の「カルシウム」など）',
        '単体：1種類の元素だけでできた物質（酸素・鉄など）',
        '化合物：2種類以上の元素でできた物質（水・二酸化炭素など）'
      ] }
  ]
};
})();
