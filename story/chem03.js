/* わくわく化学基礎 ストーリーモード
   化学 第3話「黒いインクは、1色？」（化学基礎 1編1章 物質の成分と構成元素：クロマトグラフィーなど）

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
  const id = 'chem03a' + (++uid);
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
// ろ紙（はば 40、上は棒からつるす）。水につけたはしは y = 214、黒い点は y = 194
const PX = 120, PW = 40, PTOP = 56, PBOT = 214, DOT = 194;
// インクの色（くっつきやすさのちがいで、上がる速さがちがう）：黄は速い、赤はふつう、紺はおそい
const INKS = [{ c: LEMON, k: 0.9, name: '黄' }, { c: RED, k: 0.6, name: '赤' }, { c: NAVY, k: 0.32, name: '紺' }];
function paper(front, sep){        // front：水がしみこんだ高さ（0〜1）、sep：色の分かれ方（0〜1）
  const fy = PBOT - (PBOT - PTOP - 14) * front;
  let s = '<rect x="80" y="' + (PTOP - 8) + '" width="120" height="6" rx="3" fill="' + WOODD + '"/>' +
    '<rect x="' + PX + '" y="' + PTOP + '" width="' + PW + '" height="' + (PBOT - PTOP + 8) + '" fill="#fff" stroke="' + MUTED + '" stroke-width="1.5"/>' +
    '<rect x="' + PX + '" y="' + fy.toFixed(1) + '" width="' + PW + '" height="' + (PBOT + 8 - fy).toFixed(1) + '" fill="' + WATER + '" opacity=".45"/>';
  if (sep < 0.05) s += '<circle cx="' + (PX + PW / 2) + '" cy="' + DOT + '" r="7" fill="' + INK + '"/>';
  else INKS.forEach(n => {
    const y = DOT - (DOT - fy) * n.k * sep;
    s += '<ellipse cx="' + (PX + PW / 2) + '" cy="' + y.toFixed(1) + '" rx="13" ry="' + (6 + 4 * sep) + '" fill="' + n.c + '" opacity=".9"' + (n.c === LEMON ? ' stroke="' + CREAML + '"' : '') + '/>';
  });
  return s;
}
const BEAK = beaker(90, 236, 100, 40, 26);
SCENES['c3-paper'] = () => svg('<rect width="400" height="300" fill="#eef2f7"/>' + paper(0, 0) + BEAK +
  T(PX + PW + 18, DOT + 4, '← 水性ペンの黒', 12, INK, 'start') + T(140, 282, 'ろ紙のはしを水につける', 13, INK));

SCENES['c3-chroma'] = () => anim(svg('<rect width="400" height="300" fill="#eef2f7"/><g data-p></g>' + BEAK +
  T(140, 282, '水がしみこんでいくと…', 13, INK, 'middle', ' data-cap')),
  4, (root, t) => {
    const front = Math.min(1, t / 3.6), sep = Math.max(0, Math.min(1, (t - 0.6) / 3));
    root.querySelector('[data-p]').innerHTML = paper(front, sep);
    root.querySelector('[data-cap]').textContent = sep >= 1 ? '黄・赤・紺の3色に分かれた！' : '水がしみこんでいくと…';
  }, 'もう一度しみこませる');

// くっつきやすさのちがい
SCENES['c3-speed'] = () => svg('<rect width="400" height="300" fill="#eef2f7"/>' + paper(1, 1) + BEAK +
  T(PX + PW + 12, 92, '黄：ろ紙にくっつきにくい', 11, INK, 'start') + T(PX + PW + 12, 106, '→ 速く上がる', 11, RED, 'start') +
  T(PX + PW + 12, 168, '紺：くっつきやすい', 11, INK, 'start') + T(PX + PW + 12, 182, '→ ゆっくり', 11, NAVY, 'start') +
  T(140, 282, 'くっつきやすさのちがいで分ける', 13, INK));

// ほかの分け方のカード
function card3(x, y, head, l1, l2){
  return '<rect x="' + x + '" y="' + y + '" width="250" height="62" rx="10" fill="#fff" stroke="' + CREAML + '" stroke-width="2"/>' +
    T(x + 12, y + 22, head, 14, RED, 'start') + T(x + 12, y + 40, l1, 12, INK, 'start') + T(x + 12, y + 55, l2, 11, MUTED, 'start');
}
SCENES['c3-cards'] = () => svg(T(147, 30, 'ほかの分け方', 15, NAVY) +
  card3(22, 42, '再結晶', '温度で、とける量がちがうことを使う', '例：熱い水にとかして冷やすと、結晶が出る') +
  card3(22, 112, '抽出', 'とけやすい液体に、とかし出す', '例：お茶をいれる（お湯にとけ出す）') +
  card3(22, 182, '昇華法', '固体 → 気体 → 固体 になる性質を使う', '例：ヨウ素') +
  T(147, 270, 'どれも、物質の性質のちがいを使う', 13, NAVY), CREAM);

SCENES['c3-answer'] = answerCard('何色かに分かれる！', '黒は、いくつかの色のまざりもの', 'clamp(18px,6vw,30px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '03',
  subject: '化学基礎',
  chapter: '1章 物質の成分と構成元素',
  topic: 'クロマトグラフィーなど',
  title: '黒いインクは、1色？',
  simUrl: '../sim/chem-chromatography.html',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'c3-paper', chars: [{ who: 'newton', face: 'question', side: 'right' }],
      speaker: 'newton', text: '水がしみこんでいくと、黒い点はどうなるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'black',  label: '黒いまま上にのびる' },
          { key: 'split',  label: '何色かに分かれる' },
          { key: 'vanish', label: '消えてなくなる' }
        ],
        answer: 'split'
      } },

    { bg: 'c3-paper', chars: [{ who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        black:  { face: 'confident', text: '黒は黒だから、黒いままのびるんじゃない？' },
        split:  { face: 'idea',      text: '黒って、絵の具をまぜて作れるよね。分かれるかも！' },
        vanish: { face: 'question',  text: '水性ペンだから、水にとけて消えちゃう…？' }
      } } },

    { bg: 'c3-paper', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        black:  { face: 'question', text: 'ふむ、そう思うかの。では、水をしみこませてみよう。' },
        split:  { face: 'proud',    text: 'ほう、よい読みじゃ。では、確かめてみよう。' },
        vanish: { face: 'think',    text: 'ふむ、よい問いじゃ。とけたインクがどこへ行くか、見てみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'c3-chroma', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        black:  { face: 'surprise', text: 'え、そうなの？ 黒って、いろんな色がまざってたんだ！' },
        split:  { face: 'happy',    text: 'やっぱり！ 黄・赤・紺に分かれた！' },
        vanish: { face: 'surprise', text: '消えなかった！ 色が分かれて、上に上がっていく！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'c3-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 黒いインクは、いくつかの色がまざったものじゃ。' },
      wrong: { face: 'oops',  text: 'おしい！ 答えは「何色かに分かれる」。黒いインクは混合物なのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'c3-speed', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: 'ろ紙にくっつきやすい色はゆっくり、くっつきにくい色は速く上がる。' },

    { bg: 'c3-speed', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: 'くっつきやすさのちがいで分ける。これが『クロマトグラフィー』じゃ。' },

    { bg: 'c3-speed', chars: [{ who: 'newton', face: 'oops', side: 'right' }],
      speaker: 'newton', text: '見た目の色だけで決めてはいかん。わしも『金色だから金じゃ！』と、よくまちがえたものじゃ。' },

    { bg: 'c3-cards', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '分け方はいろいろある。物質の性質のちがいを使うのが、どれも同じコツじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: 'ペンの色を変えて、分かれ方をくらべてみよう。',
      points: [
        '1つの色に見えても、混合物のことがある',
        'クロマトグラフィー：くっつきやすさのちがいで分ける',
        '再結晶・抽出・昇華法も、性質のちがいを使って分ける'
      ] }
  ]
};
})();
