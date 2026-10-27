/* わくわく化学基礎 ストーリーモード
   化学 第2話「にごった水を、きれいにするには？」（化学基礎 1編1章 物質の成分と構成元素：ろ過と蒸留）

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
  const id = 'chem02a' + (++uid);
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
// 砂の粒（木の色）と、とけている食塩（見えない）
function sand(x0, x1, y0, y1, n, seed){
  let s = '';
  for (let i = 0; i < n; i++){
    const x = x0 + ((i * 53 + seed * 17) % 100) / 100 * (x1 - x0), y = y0 + ((i * 37 + seed * 29) % 100) / 100 * (y1 - y0);
    s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (2 + i % 3) + '" fill="' + WOOD + '"/>';
  }
  return s;
}
// 場面1：砂がまざってにごった、しょっぱい水
SCENES['c2-muddy'] = () => svg(LAB + beaker(90, 230, 100, 110, 80, WATER, sand(94, 186, 156, 228, 30, 1)) +
  T(140, 60, '砂がまざった、しょっぱい水', 15, INK) + T(140, 82, '（砂 ＋ 食塩水）', 13, MUTED));

// 場面2：ろうと・ろ紙でろ過。砂はろ紙に残り、下にとうめいな液がたまる
const FUN = { x: 140, top: 70, w: 60, h: 50 };        // ろうとの上のはしの中心・はば・高さ
function funnel(sandOn){
  const l = FUN.x - FUN.w / 2, r = FUN.x + FUN.w / 2, b = FUN.top + FUN.h;
  return '<rect x="40" y="60" width="6" height="170" fill="' + MUTED + '"/><rect x="40" y="' + (b - 6) + '" width="' + (FUN.x - 46) + '" height="5" fill="' + MUTED + '"/>' +
    '<path d="M' + l + ' ' + FUN.top + ' L' + FUN.x + ' ' + b + ' L' + r + ' ' + FUN.top + '" fill="#fff" stroke="' + MUTED + '" stroke-width="1.5" stroke-dasharray="3 2"/>' +
    (sandOn ? sand(l + 16, r - 16, FUN.top + 18, b - 10, 16, 3) : '') +
    '<path d="M' + (l - 4) + ' ' + (FUN.top - 4) + ' L' + FUN.x + ' ' + (b + 2) + ' L' + (r + 4) + ' ' + (FUN.top - 4) + ' M' + (FUN.x - 4) + ' ' + (b + 2) + ' V' + (b + 34) + ' M' + (FUN.x + 4) + ' ' + (b + 2) + ' V' + (b + 30) + '" fill="none" stroke="' + GLASS + '" stroke-width="2.5"/>';
}
SCENES['c2-filter'] = () => anim(svg(LAB +
  '<g data-fun></g><g data-drop></g><g data-beaker></g>' + T(140, 268, 'ろうと と ろ紙で「ろ過」', 14, INK) +
  T(140, 58, '砂はろ紙に残る', 12, WOODD, 'middle', ' data-k1 opacity="0"') + T(102, 206, 'とうめいな液', 12, NAVY, 'end', ' data-k2 opacity="0"')),
  3, (root, t) => {
    root.querySelector('[data-fun]').innerHTML = funnel(t > 0.6);
    const lv = Math.min(40, t * 14);
    root.querySelector('[data-beaker]').innerHTML = beaker(108, 230, 64, 70, lv);
    root.querySelector('[data-drop]').innerHTML = t > 0.2 && t < 2.9 ? '<circle cx="140" cy="' + (158 + (t * 120) % 30) + '" r="3" fill="' + WATER + '" stroke="' + NAVY + '" stroke-width="1"/>' : '';
    root.querySelector('[data-k1]').setAttribute('opacity', t > 1 ? 1 : 0);
    root.querySelector('[data-k2]').setAttribute('opacity', t > 2 ? 1 : 0);
  }, 'もう一度こす');

// 場面3：ろ紙を大きくして見ると。大きい砂の粒は通れない。水と食塩の小さい粒は通りぬける
SCENES['c2-zoom'] = () => {
  let s = '<circle cx="140" cy="150" r="118" fill="#fff" stroke="' + GLASS + '" stroke-width="3"/>';
  // ろ紙のせんい（すきまのある横の線）
  [120, 136].forEach(y => { for (let x = 30; x < 250; x += 34) s += '<rect x="' + x + '" y="' + y + '" width="24" height="8" rx="3" fill="' + CREAML + '"/>'; });
  // 大きい砂の粒（上で止まる）
  [[70, 104], [118, 102], [175, 106], [210, 100]].forEach(([x, y]) => { s += '<circle cx="' + x + '" cy="' + y + '" r="11" fill="' + WOOD + '"/>'; });
  // 小さい粒：水（空色）と食塩（白）が、すきまを通って下へ
  [[57, 90, 'w'], [91, 160, 's'], [125, 186, 'w'], [159, 168, 's'], [193, 196, 'w'], [227, 162, 'w'], [91, 78, 's'], [159, 82, 'w']].forEach(([x, y, k]) => {
    s += '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + (k === 'w' ? WATER : '#fff') + '" stroke="' + (k === 'w' ? NAVY : MUTED) + '" stroke-width="1.2"/>';
  });
  s += '<path d="M91 146 v24 M159 146 v14 M227 146 v8" stroke="' + MUTED + '" stroke-width="1.5" stroke-dasharray="3 3"/>';
  return svg('<rect width="400" height="300" fill="#eef2f7"/>' + s +
    T(140, 64, '砂（大きい粒）：通れない', 12, WOODD) + T(140, 236, '水・食塩（小さい粒）：通りぬける', 12, NAVY) +
    T(268, 286, '○ 水　◌ 食塩', 11, MUTED, 'end'));
};

// 場面4：蒸留の装置（枝付きフラスコ・温度計・リービッヒ冷却器・受け器）
const FL = { x: 70, y: 168, r: 32 };                 // フラスコの丸いところ
const C0 = { x: 108, y: 112 }, C1 = { x: 222, y: 168 };   // 冷却器の上のはし・下のはし
function still(lv, recv, tips){
  const ang = Math.atan2(C1.y - C0.y, C1.x - C0.x) * 180 / Math.PI;
  const L = Math.hypot(C1.x - C0.x, C1.y - C0.y);
  let s = '';
  // フラスコの中の液（食塩水）と沸騰石、白い粒（濃くなった食塩）
  s += '<clipPath id="flc"><circle cx="' + FL.x + '" cy="' + FL.y + '" r="' + (FL.r - 2) + '"/></clipPath>' +
    '<rect x="' + (FL.x - FL.r) + '" y="' + (FL.y + FL.r - lv) + '" width="' + (FL.r * 2) + '" height="' + lv + '" fill="' + WATER + '" clip-path="url(#flc)"/>' +
    '<circle cx="' + (FL.x - 8) + '" cy="' + (FL.y + 24) + '" r="3" fill="#fff" stroke="' + MUTED + '"/><circle cx="' + (FL.x + 6) + '" cy="' + (FL.y + 26) + '" r="3" fill="#fff" stroke="' + MUTED + '"/>';
  // フラスコとくび、枝
  s += '<circle cx="' + FL.x + '" cy="' + FL.y + '" r="' + FL.r + '" fill="none" stroke="' + GLASS + '" stroke-width="2.5"/>' +
    '<path d="M' + (FL.x - 7) + ' ' + (FL.y - FL.r + 2) + ' V80 M' + (FL.x + 7) + ' ' + (FL.y - FL.r + 2) + ' V' + (C0.y - 6) + ' L' + C0.x + ' ' + (C0.y - 4) + ' M' + (FL.x + 7) + ' 80 V' + (C0.y - 14) + ' L' + C0.x + ' ' + (C0.y - 12) + '" fill="none" stroke="' + GLASS + '" stroke-width="2.5"/>';
  // 温度計（球は枝のつけね）
  s += '<rect x="' + (FL.x - 2) + '" y="56" width="4" height="' + (C0.y - 12 - 56) + '" fill="#fff" stroke="' + MUTED + '"/><circle cx="' + FL.x + '" cy="' + (C0.y - 10) + '" r="4" fill="' + RED + '"/>';
  // 冷却器（外の管の中を水が流れる）
  s += '<g transform="translate(' + C0.x + ' ' + C0.y + ') rotate(' + ang.toFixed(2) + ')">' +
    '<rect x="16" y="-12" width="' + (L - 36) + '" height="16" rx="4" fill="' + WATER + '" opacity=".7" stroke="' + GLASS + '" stroke-width="2"/>' +
    '<rect x="0" y="-6" width="' + L + '" height="5" fill="#fff" stroke="' + GLASS + '" stroke-width="1.5"/></g>';
  s += '<path d="M' + (C1.x - 22) + ' ' + (C1.y + 2) + ' v14 M' + (C0.x + 20) + ' ' + (C0.y - 2) + ' v-14" stroke="' + GLASS + '" stroke-width="2.5"/>';
  // 受け器
  s += beaker(C1.x - 6, 230, 40, 46, recv);
  // 炎
  s += flame(FL.x, FL.y + FL.r + 8, 0.75) + '<rect x="' + (FL.x - 14) + '" y="224" width="28" height="6" rx="2" fill="' + NAVY + '"/>';
  if (tips){
    s += T(FL.x + 12, 54, '① 温度計の球は枝のつけね', 11, RED, 'start') +
      T(FL.x - FL.r - 4, FL.y + 50, '② 沸騰石', 11, RED, 'start') +
      T(C1.x - 26, C1.y + 30, '③ 冷却水は下から上へ', 11, RED, 'end') +
      '<path d="M' + (C1.x - 22) + ' ' + (C1.y + 16) + ' v-10 M' + (C0.x + 20) + ' ' + (C0.y - 16) + ' v-8" stroke="' + NAVY + '" stroke-width="2"/>';
  }
  return s;
}
SCENES['c2-still'] = () => anim(svg(LAB + '<g data-st></g><g data-vap></g>' +
  T(140, 268, '蒸留：熱して、出てきた水蒸気を冷やす', 13, INK), '#eef2f7'),
  4, (root, t) => {
    root.querySelector('[data-st]').innerHTML = still(40 - t * 5, Math.min(30, t * 9), false);
    let v = '';
    for (let i = 0; i < 4; i++){                       // 水蒸気の粒（くび → 枝 → 冷却器）
      const k = ((t * 0.9 + i * 0.25) % 1);
      const pts = [[FL.x, FL.y - FL.r], [FL.x, C0.y - 8], [C0.x, C0.y - 8], [C1.x, C1.y]];
      const seg = Math.min(2, Math.floor(k * 3)), u = k * 3 - seg;
      const x = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * u, y = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * u;
      v += t > 0.3 ? '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" fill="' + (seg === 2 && u > 0.5 ? WATER : '#fff') + '" stroke="' + NAVY + '" stroke-width="1"/>' : '';
    }
    root.querySelector('[data-vap]').innerHTML = v;
  }, 'もう一度熱する');
SCENES['c2-tips'] = () => svg(LAB + still(30, 24, true), '#eef2f7');

SCENES['c2-answer'] = answerCard('まだまざってる！', 'とけた食塩は、ろ紙を通りぬける', 'clamp(18px,6vw,28px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '02',
  subject: '化学基礎',
  chapter: '1章 物質の成分と構成元素',
  topic: 'ろ過と蒸留',
  title: 'にごった水を、きれいにするには？',
  simUrl: '../sim/chem-separation.html',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'c2-muddy', chars: [{ who: 'newton', face: 'question', side: 'right' }],
      speaker: 'newton', text: 'この水から、まじりけのない水を取り出したい。どうする？',
      choice: {
        id: 'q1',
        options: [
          { key: 'filter', label: 'ろ紙でこせば、きれいな水になる' },
          { key: 'still',  label: 'ろ紙でこしても、まだ何かまざっている' },
          { key: 'wait',   label: 'しばらく置いておけばよい' }
        ],
        answer: 'still'
      } },

    { bg: 'c2-muddy', chars: [{ who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        filter: { face: 'confident', text: 'ろ紙でこせば、砂が取れて、きれいな水になるよ！' },
        still:  { face: 'question',  text: '砂は取れても、しょっぱいのは残りそう…？' },
        wait:   { face: 'idea',      text: '置いておけば、砂が下にしずんで、上はきれいになるよね？' }
      } } },

    { bg: 'c2-muddy', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        filter: { face: 'question', text: 'ふむ。では、ろ紙でこしてみよう。' },
        still:  { face: 'proud',    text: 'ほう、するどいの。では、ろ紙でこして確かめよう。' },
        wait:   { face: 'think',    text: '砂はしずむが、しょっぱいのはどうかな？ まずは、ろ紙でこしてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'c2-filter', chars: [{ who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        filter: { face: 'happy',     text: '透明になった！ これで完成だね。' },
        still:  { face: 'question',  text: '透明になった！ …でも、まだしょっぱいのかな？' },
        wait:   { face: 'surprise',  text: '砂がろ紙に残って、下は透明になった！' }
      } } },

    { bg: 'c2-zoom', chars: [{ who: 'rika', face: 'oops', side: 'right' }],
      speaker: 'rika', text: 'なめてみたら…しょっぱい！ 透明なのに、まだ何かまざってる！' },

    { bg: 'c2-zoom', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: 'ろ紙の穴より小さい粒は、通りぬけてしまう。' },

    { bg: 'c2-zoom', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: 'とけている食塩は、ろ過では取れないのじゃ。' },

    /* ---- 答え合わせ ---- */
    { bg: 'c2-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ ろ紙でこしても、食塩はまざったままじゃ。' },
      wrong: { face: 'oops',  text: 'おしい！ 答えは「まだ何かまざっている」。とけた食塩は、ろ紙を通りぬけるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'c2-still', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '熱して、出てきた水蒸気だけを冷やして集める。これが『蒸留』じゃ。' },

    { bg: 'c2-still', chars: [{ who: 'rika', face: 'idea', side: 'right' }],
      speaker: 'rika', text: '食塩はフラスコに残って、水だけが受け器にたまるんだね！' },

    { bg: 'c2-still', chars: [{ who: 'newton', face: 'happy', side: 'right' }],
      speaker: 'newton', text: 'こういう道具は、むかしの錬金術師たちが工夫して作ったものじゃ。わしも使ったぞ。' },

    { bg: 'c2-tips', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '温度計は、出ていく蒸気の温度をはかる場所に置くのがコツじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '道具をえらんで、まじりけのない水を取り出してみよう。',
      points: [
        'ろ過：ろ紙で、液体と固体（砂など）を分ける',
        'とけているもの（食塩など）は、ろ紙を通りぬける',
        '蒸留：熱して出てきた蒸気を冷やして、液体を取り出す'
      ] }
  ]
};
})();
