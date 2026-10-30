/* わくわく化学基礎 ストーリーモード
   化学 第6話「炎の色で、中身がわかる？」（東京書籍 化学基礎 1編1章 物質の成分と構成元素：炎色反応・成分元素の検出）

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
  const id = 'chem06a' + (++uid);
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
  const id = 'chem06s' + (++uid);
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
// ガスコンロ：みそ汁がふきこぼれて、炎が黄色に（ガスの炎は空色で表す）
function stove(flame){
  let f = '';
  for (let i = 0; i < 7; i++) {
    const x = 150 + i * 17;
    f += '<path d="M' + (x - 6) + ' 214 Q' + x + ' 186 ' + (x + 6) + ' 214 Z" fill="' + flame + '" stroke="' + (flame === C.water ? C.coat : C.fire) + '" stroke-width="1" opacity=".95"/>';
  }
  return '<rect x="110" y="214" width="180" height="16" rx="4" fill="' + C.glass + '"/><rect x="100" y="230" width="200" height="40" rx="6" fill="' + C.gray2 + '"/>' + f +
    '<path d="M150 150 h100 l-8 40 h-84 z" fill="' + C.wood + '" stroke="' + C.woodDark + '" stroke-width="2"/>' +
    '<path d="M146 150 h108" stroke="' + C.woodDark + '" stroke-width="4" stroke-linecap="round"/>';
}
SCENES['c6-stove'] = () => anim(svg('<g data-st>' + stove(C.water) + '</g>' + T(200, 120, 'ガスの炎', 13, C.ink, 'middle', ' data-msg'), C.gray),
  2.4, (root, t) => {
    const boil = t > 1.2;
    root.querySelector('[data-st]').innerHTML = stove(boil ? FLAME.Na : C.water) +
      (boil ? '<path d="M164 150 q-6 20 -2 40 M236 150 q6 20 2 40" stroke="' + C.wood + '" stroke-width="5" fill="none" stroke-linecap="round"/>' : '');
    root.querySelector('[data-msg]').textContent = boil ? 'ふきこぼれたら、黄色に！' : 'ガスの炎（みそ汁を温める）';
  }, 'もう一度ふきこぼす');

// 白金線に水溶液をつけて、バーナーの炎に入れる
function wireScene(color, label, sub){
  return svg(
    '<rect y="270" width="400" height="30" fill="' + C.gray2 + '"/>' +
    '<g data-fl>' + burner(200, 210, C.water, 60) + '</g>' +
    '<line data-w x1="70" y1="120" x2="160" y2="150" stroke="' + C.glass + '" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="40" y="108" width="36" height="12" rx="3" fill="' + C.wood + '"/>' +
    T(250, 76, label, 13, C.ink) + T(250, 94, sub, 11, C.muted), C.gray);
}
SCENES['c6-wire'] = () => anim(wireScene('', '白金線に、食塩水（透明）をつけて…', 'バーナーの炎に入れる'),
  2.6, (root, t) => {
    const k = Math.min(1, t / 1.2), x2 = 160 + 40 * k, y2 = 150 + 10 * k;
    root.querySelector('[data-w]').setAttribute('x2', x2); root.querySelector('[data-w]').setAttribute('y2', y2);
    root.querySelector('[data-fl]').innerHTML = burner(200, 210, t > 1.3 ? FLAME.Na : C.water, 60);
  }, 'もう一度入れる');

SCENES['c6-answer'] = answerCard('ナトリウム！', 'みそ汁の食塩にふくまれる元素の色', 'clamp(22px,7vw,28px)');

// 炎色反応の色の表
SCENES['c6-table'] = () => {
  const L = [['Li', 'リチウム', '赤'], ['Na', 'ナトリウム', '黄'], ['K', 'カリウム', '赤紫'], ['Ca', 'カルシウム', '橙赤'], ['Sr', 'ストロンチウム', '紅'], ['Ba', 'バリウム', '黄緑'], ['Cu', '銅', '青緑']];
  let s = '';
  L.forEach((e, i) => {
    const x = 156 + (i % 4) * 60, y = 70 + Math.floor(i / 4) * 116, c = FLAME[e[0]];
    s += '<path d="M' + (x - 14) + ' ' + (y + 52) + ' Q' + (x - 16) + ' ' + (y + 20) + ' ' + x + ' ' + (y - 6) + ' Q' + (x + 16) + ' ' + (y + 20) + ' ' + (x + 14) + ' ' + (y + 52) + ' Z" fill="' + c + '"/>' +
      '<path d="M' + (x - 6) + ' ' + (y + 52) + ' Q' + x + ' ' + (y + 26) + ' ' + (x + 6) + ' ' + (y + 52) + ' Z" fill="#fff" opacity=".5"/>' +
      '<text x="' + x + '" y="' + (y + 74) + '" font-size="15" fill="' + C.ink + '" text-anchor="middle" font-family="Dela Gothic One">' + e[0] + '</text>' +
      T(x, y + 90, e[2], 12, C.ink);
  });
  return svg(s + T(270, 30, '炎色反応（元素ごとに決まった色）', 13, C.ink), C.gray);
};

// 夜空の花火
SCENES['c6-fire'] = () => anim(svg('<rect width="400" height="300" fill="' + C.coat + '"/><g data-fw></g>', C.coat),
  3, (root, t) => {
    const B = [[90, 90, 'Sr', 0], [200, 70, 'Na', 0.6], [150, 160, 'Cu', 1.2], [250, 140, 'Ba', 1.8]];
    let s = '';
    B.forEach(([x, y, el, d]) => {
      const k = Math.max(0, Math.min(1, (t - d) / 0.9));
      if (!k) return;
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6, r = 8 + 38 * k;
        s += '<circle cx="' + (x + r * Math.cos(a)).toFixed(1) + '" cy="' + (y + r * Math.sin(a)).toFixed(1) + '" r="3.2" fill="' + FLAME[el] + '"/>';
      }
    });
    root.querySelector('[data-fw]').innerHTML = s;
  }, 'もう一度あげる');

// ニュートンくんの「金色の金属」を炎に入れると青緑（銅）
SCENES['c6-brass'] = () => anim(svg(
  '<rect y="270" width="400" height="30" fill="' + C.gray2 + '"/>' +
  '<g data-fl>' + burner(240, 210, C.water, 60) + '</g>' +
  '<g data-m><rect x="150" y="128" width="40" height="16" rx="3" fill="' + C.fire2 + '" stroke="' + C.woodDark + '" stroke-width="1.5"/></g>' +
  T(250, 76, 'むかし作った「金色の金属」', 13, C.ink) + T(250, 94, '…を、炎に入れると？', 12, C.muted, 'middle', ' data-msg'), C.gray),
  2.8, (root, t) => {
    const k = Math.min(1, t / 1.2);
    root.querySelector('[data-m]').setAttribute('transform', 'translate(' + (60 * k).toFixed(1) + ' ' + (12 * k).toFixed(1) + ')');
    const hot = t > 1.3;
    root.querySelector('[data-fl]').innerHTML = burner(240, 210, hot ? FLAME.Cu : C.water, 60);
    root.querySelector('[data-msg]').textContent = hot ? '青緑！ 銅（Cu）の色' : '…を、炎に入れると？';
  }, 'もう一度入れる');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '06',
  subject: '化学基礎',
  chapter: '1章 物質の成分と構成元素',
  topic: '炎色反応・成分元素の検出',
  title: '炎の色で、中身がわかる？',
  simUrl: '../sim/chem-flame.html',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'c6-stove', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'みそ汁がふきこぼれたとたん、炎が黄色になった。なぜかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'soup',    label: 'みそ汁の色がうつった' },
          { key: 'element', label: 'みそ汁の中の、ある元素の色' },
          { key: 'strong',  label: '火が強くなったから' }
        ],
        answer: 'element'
      } },

    { bg: 'c6-stove', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        soup:    { face: 'confident', text: 'みそ汁が茶色っぽいから、その色じゃない？' },
        element: { face: 'question',  text: 'みそ汁の中の、何かのせいかな…？' },
        strong:  { face: 'confused',  text: 'ふきこぼれて、火が強くなったんじゃない？' }
      } } },

    { bg: 'c6-stove', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        soup:    { face: 'think',    text: 'ふむ。では、色のない透明な食塩水を、炎に入れてみよう。' },
        element: { face: 'question', text: 'ほう、するどいの。炎に聞いてみよう。食塩水を入れるぞ。' },
        strong:  { face: 'proud',    text: 'ふむ、よい問いじゃ。強さは同じまま、食塩水を入れてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'c6-wire', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        soup:    { face: 'surprise', text: 'え、そうなの？ 透明なのに、黄色になった！' },
        element: { face: 'happy',    text: 'やっぱり！ 食塩水で黄色になった！' },
        strong:  { face: 'surprise', text: 'え、そうなの？ 火の強さは同じなのに、黄色だ！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'c6-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ みそ汁の食塩にふくまれる、ナトリウムの色じゃ。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「ある元素の色」。ナトリウムの黄色じゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'c6-wire', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '透明な食塩水でも、黄色になる。色のもとは、ナトリウムという元素じゃ。' },

    { bg: 'c6-table', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '元素ごとに、出る色が決まっておる。これが『炎色反応』じゃ。' },

    { bg: 'c6-fire', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika', text: 'え、そうなの？ 花火の色も、元素の色なんだ！' },

    { bg: 'c6-fire', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: 'ほかにも、白くにごる沈殿や、出てくる気体で、ふくまれる元素を調べられるぞ。' },

    { bg: 'c6-brass', chars: [{ who: 'newton', face: 'surprise', side: 'left' }],
      speaker: 'newton', text: '…青緑。銅じゃ。' },

    { bg: 'c6-brass', chars: [{ who: 'newton', face: 'oops', side: 'left' }],
      speaker: 'newton', text: 'わしの『金』は、銅に亜鉛をまぜた真ちゅうじゃったか…' },

    { bg: 'c6-brass', chars: [{ who: 'rika', face: 'happy', side: 'left' }],
      speaker: 'rika', text: '炎の色で、ばれちゃったね。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: 'いろいろな水溶液を、炎に入れてみよう。',
      points: [
        'ある元素をふくむ物質を炎に入れると、元素ごとに決まった色が出る（炎色反応）',
        'Li 赤、Na 黄、K 赤紫、Ca 橙赤、Sr 紅、Ba 黄緑、Cu 青緑',
        '炎色反応で、ふくまれる元素がわかる'
      ] }
  ]
};
})();
