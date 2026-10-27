/* わくわく化学基礎 ストーリーモード
   化学 第5話「ダイヤモンドと鉛筆のしんは、同じもの？」（東京書籍 化学基礎 1編1章 物質の成分と構成元素：同素体）

   書き方は物理の各話（ep03.js・ep09.js など）と同じ。脚本の原本は docs/chem-story-ch1.md。
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
  const id = 'chem05a' + (++uid);
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
// 止まった絵（アニメの最後の形を、ボタンなしで描く）
function still(html, t, draw){
  const id = 'chem05s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, t); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
const SKY = '<defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky1)"/>';
// 化学の色（4人でそろえる）：水＝空色、ガラスのふち＝うすい文字の色、炎＝赤とレモン、黒いもの＝文字の色
const C = { water: '#bfe2f6', waterLine: '#22305a', glass: '#6b7488', fire: '#d93a3f', fire2: '#ffe14a', black: '#1f2638', dia: '#e9f6fc', ink: '#1f2638', muted: '#6b7488', wood: '#b47a44', woodDark: '#7e5129', coat: '#22305a', cream: '#fff7e9', creamLine: '#e9c48f', gray: '#eef2f7', gray2: '#d6dce6' };
// 炎色反応の色（例外。シミュとも同じ）
const FLAME = { Li: '#d93a3f', Na: '#ffe14a', K: '#b05cc4', Ca: '#f07a3a', Sr: '#c8243c', Ba: '#a8d04a', Cu: '#2fb5a0' };
// バーナーと炎（x, y はバーナーの口。color は炎の外側の色）
function burner(x, y, color, h){
  h = h || 46;
  return '<rect x="' + (x - 12) + '" y="' + y + '" width="24" height="44" fill="' + C.glass + '"/><rect x="' + (x - 22) + '" y="' + (y + 44) + '" width="44" height="8" rx="3" fill="' + C.ink + '"/>' +
    '<path d="M' + (x - 13) + ' ' + y + ' Q' + (x - 15) + ' ' + (y - h * 0.5) + ' ' + x + ' ' + (y - h) + ' Q' + (x + 15) + ' ' + (y - h * 0.5) + ' ' + (x + 13) + ' ' + y + ' Z" fill="' + color + '" opacity=".9"/>' +
    '<path d="M' + (x - 6) + ' ' + y + ' Q' + (x - 7) + ' ' + (y - h * 0.3) + ' ' + x + ' ' + (y - h * 0.55) + ' Q' + (x + 7) + ' ' + (y - h * 0.3) + ' ' + (x + 6) + ' ' + y + ' Z" fill="#fff" opacity=".55"/>';
}

/* ---- この話の絵 ---- */
// ダイヤモンド（宝石の形）と黒鉛（鉛筆のしん）
function diamond(x, y, s){
  s = s || 1;
  const p = (dx, dy) => (x + dx * s) + ' ' + (y + dy * s);
  return '<path d="M' + p(-28, -12) + ' L' + p(-14, -28) + ' L' + p(14, -28) + ' L' + p(28, -12) + ' L' + p(0, 26) + ' Z" fill="' + C.dia + '" stroke="' + C.glass + '" stroke-width="2"/>' +
    '<path d="M' + p(-28, -12) + ' L' + p(28, -12) + ' M' + p(-14, -28) + ' L' + p(-6, -12) + ' L' + p(0, 26) + ' M' + p(14, -28) + ' L' + p(6, -12) + ' L' + p(0, 26) + '" fill="none" stroke="' + C.glass + '" stroke-width="1.2"/>' +
    '<path d="M' + p(-18, -20) + ' l4 -3" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
}
function pencil(x, y, s){
  s = s || 1;
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
    '<rect x="-34" y="-7" width="52" height="14" fill="' + C.wood + '" stroke="' + C.woodDark + '" stroke-width="1.5"/>' +
    '<path d="M18 -7 L34 0 L18 7 Z" fill="#e9c48f" stroke="' + C.woodDark + '" stroke-width="1.5"/>' +
    '<path d="M28 -2.5 L34 0 L28 2.5 Z" fill="' + C.black + '"/></g>';
}
SCENES['c5-two'] = () => svg(
  '<rect x="120" y="200" width="160" height="14" rx="4" fill="' + C.gray2 + '"/>' +
  diamond(165, 165, 1.1) + pencil(238, 182, 1) +
  T(165, 232, 'ダイヤモンド', 12, C.ink) + T(238, 232, '鉛筆のしん（黒鉛）', 12, C.ink) +
  '<path d="M140 120 l6 -10 M190 116 l-5 -10 M165 108 v-12" stroke="' + C.fire2 + '" stroke-width="3" stroke-linecap="round"/>', '#fff7e9');

// 燃やすと、どちらも二酸化炭素だけ
SCENES['c5-burn'] = () => anim(svg(
  '<rect y="246" width="400" height="54" fill="' + C.gray2 + '"/>' +
  burner(80, 196, C.fire, 40) + burner(200, 196, C.fire, 40) +
  '<g data-d>' + diamond(80, 140, 0.8) + '</g>' +
  '<g data-g><rect x="176" y="134" width="48" height="14" rx="2" fill="' + C.black + '"/></g>' +
  '<g data-co2></g>' +
  T(80, 282, 'ダイヤモンド', 12, C.ink) + T(200, 282, '黒鉛', 12, C.ink) +
  T(140, 26, '燃やすと…', 14, C.ink, 'middle', ' data-msg'), C.gray),
  3.2, (root, t) => {
    const k = Math.min(1, t / 3);
    root.querySelector('[data-d]').setAttribute('transform', 'translate(80 140) scale(' + (1 - 0.6 * k).toFixed(3) + ') translate(-80 -140)');
    root.querySelector('[data-g]').setAttribute('transform', 'translate(200 141) scale(' + (1 - 0.6 * k).toFixed(3) + ') translate(-200 -141)');
    let s = '';
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.9 + i / 6) % 1;
      if (t < 0.3) break;
      [80, 200].forEach(x => {
        const yy = 112 - ph * 70, xx = x + Math.sin(i * 2.1 + ph * 6) * 10;
        s += '<text x="' + xx.toFixed(1) + '" y="' + yy.toFixed(1) + '" font-size="11" fill="' + C.muted + '" text-anchor="middle"' + F + ' opacity="' + (1 - ph).toFixed(2) + '">CO₂</text>';
      });
    }
    root.querySelector('[data-co2]').innerHTML = s;
    root.querySelector('[data-msg]').textContent = t >= 3 ? 'どちらも 二酸化炭素（CO₂）だけ！' : '燃やすと…';
  }, 'もう一度燃やす');

SCENES['c5-answer'] = answerCard('同じ炭素！', 'どちらも炭素 C だけでできている', 'clamp(30px,10vw,48px)');

// 炭素原子のつながり方：ダイヤモンド（立体のあみ目）と黒鉛（うすい層が重なる）
SCENES['c5-structure'] = () => {
  const atom = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + C.black + '"/>';
  const bond = (a, b) => '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + C.muted + '" stroke-width="2.5"/>';
  // ダイヤモンド：1つの原子が4つとつながる（立体を斜めから見た形）
  const D = [[230, 70], [270, 92], [230, 114], [190, 92], [230, 158], [270, 136], [190, 136], [300, 160], [160, 160], [250, 196], [210, 196]];
  const DB = [[0, 1], [0, 3], [1, 2], [3, 2], [2, 4], [1, 5], [3, 6], [5, 4], [6, 4], [5, 7], [6, 8], [4, 9], [4, 10]];
  let d = DB.map(([a, b]) => bond(D[a], D[b])).join('') + D.map(p => atom(p[0], p[1])).join('');
  // 黒鉛：六角形のあみが、層になって重なる
  const hex = (cx, cy, r) => { const pts = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.45]); } return pts; };
  let g = '';
  [0, 1, 2].forEach(L => {                     // 3つの層
    [190, 216, 242, 268].forEach(cx => {
      const P = hex(cx + (L % 2) * 13, 214 + L * 26, 15);
      g += P.map((p, i) => bond(p, P[(i + 1) % 6])).join('') + P.map(p => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3" fill="' + C.black + '"/>').join('');
    });
  });
  return svg(
    '<rect x="140" y="40" width="250" height="250" rx="10" fill="#fff" stroke="' + C.gray2 + '" stroke-width="2"/>' +
    T(320, 64, 'ダイヤモンド', 13, C.ink) + T(320, 82, '立体のあみ目（かたい）', 11, C.muted) + d +
    '<line x1="150" y1="200" x2="380" y2="200" stroke="' + C.gray2 + '" stroke-width="1.5" stroke-dasharray="5 4"/>' +
    T(340, 222, '黒鉛', 13, C.ink) + T(340, 240, 'うすい層が重なる', 11, C.muted) + T(340, 256, '（はがれやすい）', 11, C.muted) +
    '<g transform="translate(-20 0)">' + g + '</g>', C.gray);
};

// 同素体のカード：S・C・O・P（スコップ）
SCENES['c5-scop'] = () => {
  const cards = [['S', '硫黄', '斜方硫黄・単斜硫黄', 'ゴム状硫黄'], ['C', '炭素', 'ダイヤモンド・黒鉛', 'フラーレン'], ['O', '酸素', '酸素・オゾン', ''], ['P', 'リン', '黄リン・赤リン', '']];
  let s = '';
  cards.forEach((c, i) => {
    const x = 150 + (i % 2) * 120, y = 46 + Math.floor(i / 2) * 118;
    s += '<rect x="' + x + '" y="' + y + '" width="110" height="106" rx="10" fill="' + C.cream + '" stroke="' + C.creamLine + '" stroke-width="2"/>' +
      '<text x="' + (x + 55) + '" y="' + (y + 40) + '" font-size="32" fill="' + C.fire + '" text-anchor="middle" font-family="Dela Gothic One">' + c[0] + '</text>' +
      T(x + 55, y + 60, c[1], 13, C.ink) + T(x + 55, y + 80, c[2], 10, C.muted) + (c[3] ? T(x + 55, y + 94, c[3], 10, C.muted) : '');
  });
  return svg(s + T(270, 288, 'S・C・O・P ＝ 「スコップ」', 14, C.coat), C.gray);
};

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '05',
  subject: '化学基礎',
  chapter: '1章 物質の成分と構成元素',
  topic: '同素体',
  title: 'ダイヤモンドと鉛筆のしんは、同じもの？',
  simUrl: '../sim/chem-allotrope.html',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'c5-two', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'キラキラのダイヤモンドと、まっ黒な鉛筆のしん。この2つ、できている元素はちがうかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'diff',    label: 'ちがう元素でできている' },
          { key: 'same',    label: '同じ元素でできている' },
          { key: 'special', label: 'ダイヤモンドだけ特別な元素' }
        ],
        answer: 'same'
      } },

    { bg: 'c5-two', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        diff:    { face: 'confident', text: 'かたさも色もぜんぜんちがうよ。ちがう元素でしょ？' },
        same:    { face: 'question',  text: '見た目はちがうけど…もしかして、同じものでできてる？' },
        special: { face: 'confused',  text: 'ダイヤモンドは宝石だから、特別な元素じゃないかな？' }
      } } },

    { bg: 'c5-two', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        diff:    { face: 'proud',    text: 'ふむ、よい問いじゃ。炎に聞いてみよう。2つとも燃やしてみるぞ。' },
        same:    { face: 'question', text: 'ほう、するどいの。では、炎に聞いてみよう。2つとも燃やすぞ。' },
        special: { face: 'think',    text: '特別かどうか、炎に聞いてみよう。2つとも燃やしてみるぞ。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'c5-burn', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        diff:    { face: 'surprise', text: 'え、そうなの？ どっちも二酸化炭素になった！' },
        same:    { face: 'happy',    text: 'やっぱり！ どっちも二酸化炭素だけになった！' },
        special: { face: 'surprise', text: 'え、そうなの？ ダイヤモンドも、黒鉛と同じだ…！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'c5-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ どちらも炭素だけでできておる。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「同じ元素でできている」。どちらも炭素じゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'c5-burn', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: 'どちらも燃えて、二酸化炭素だけになる。どちらも炭素だけでできておるのじゃ。' },

    { bg: 'c5-structure', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'ちがうのは、炭素の原子のつながり方じゃ。' },

    { bg: 'c5-structure', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'つながり方がちがうと、性質もちがう。これを『同素体』という。' },

    { bg: 'c5-structure', chars: [{ who: 'rika', face: 'idea', side: 'left' }],
      speaker: 'rika', text: 'じゃあ、炭からダイヤモンドは作れるの？' },

    { bg: 'c5-structure', chars: [{ who: 'newton', face: 'think', side: 'left' }],
      speaker: 'newton', text: '同じ炭素どうしじゃから、できる（とても高い圧力がいるがな）。' },

    { bg: 'c5-structure', chars: [{ who: 'newton', face: 'oops', side: 'left' }],
      speaker: 'newton', text: 'じゃが、炭から金はできん。元素がちがうからじゃ。' },

    { bg: 'c5-scop', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '同素体がある元素は、S・C・O・P じゃ。' },

    { bg: 'c5-scop', chars: [{ who: 'rika', face: 'happy', side: 'left' }],
      speaker: 'rika', text: 'え、そうなの？ 「スコップ」でおぼえよう！' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '原子のつながり方を切りかえて、形をくらべてみよう。',
      points: [
        '同じ元素の単体で、性質がちがうもの＝同素体',
        'ダイヤモンドと黒鉛は、どちらも炭素だけ（つながり方がちがう）',
        '同素体がある元素は S・C・O・P（スコップ）'
      ] }
  ]
};
})();
